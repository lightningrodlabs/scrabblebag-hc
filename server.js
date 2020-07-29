// server.js

const bagfile = require('./bag')
const scrabbleLetters = bagfile.scrabbleLetters
const wordsfile = require('./words9')
const nineLetterWords = wordsfile.nineLetterWords

const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8080 })

const HAND_SIZE = 7

// hash of gameId : connection-list pairs
var connections = {}

// hash of gameId : game pairs
var gameStates = {}

wss.on('connection', ws => {
  console.log('Incoming connection!')
  // console.log(`Incoming connection: ${JSON.stringify(ws)}`)

  ws.on('message', message => {
    var msg = JSON.parse(message)
    console.log(`Recived message => ${message}`) // log text of the message
    var game
    var updatedGame
    switch(msg.type) {
      case 'join':
        // Incoming join. Enroll the user to recieve updates about the game.

        // because of the newGameRequest/Response system, this will only be sent by the system for a game that already exists.
        // Unless someone just typed in a valid 9 letter word in the URL. So we have to check that the game exists and if it doesn't, do nothing.

        gameId = msg.id

        if (!(gameId in gameStates)) {
          break;
        }

        // add this connection to the list of people to update for the game it connected to
        // if the game has no connection list, make it
        if (!connections[gameId]) {
          connections[gameId] = []
        }
        // push this connection onto this game's connection list
        connections[gameId].push(ws)
        console.log(`Someone joined game ${gameId}!`)
        console.log('Connections: ', connections)

        sendUpdateToAll(getGame(gameId)) // send out an update to everyone in this game
        break;
      case 'play':
        letter = msg.letter // get the letter that was played
        player = msg.player
        console.log(`Player ${player} is trying to play letter ${letter}!`)

        // send out an update with the updated game as defined by the transform function
        game = getGame() // grab the game
        updatedGame = transformGame(msg, game) // apply the move to it
        sendUpdateToAll(updatedGame) // send out update with transformed game
        saveGame(updatedGame) // save transformed game
        break;
      case 'draw':
        player = msg.player
        console.log(`Player ${player} is trying to draw!`)
        game = getGame()
        updatedGame = transformGame(msg, game) // apply the draw to the game
        sendUpdateToAll(updatedGame)
        saveGame(updatedGame)
        break;
      case 'newGameRequest':
        // Incoming new game request!
        console.log('Someone requested a new game!')
        // create a new game
        game = newGame()
        const id = game.id
        // store game in games dictionary to link it with its ID
        gameStates[id] = game
        // send the game ID to the client's webpage to be reloaded to so they can join it
        sendNewGameResponse(ws, id)
        break;
      case 'reset':
        console.log('Someone reset the game, will not probably work')
        saveGame(newGame())
        sendUpdateToAll(getGame())
        break;
    }
  })
  // remove connection from connections hash when connection is closed
  ws.on('close', () => {
    console.log('Someone left, removing them from any games they were connected to')

    // walk through every connection list for every game
    Object.keys(connections).forEach((gameId, i) => {
      // remove this connection from each one
      console.log('Removing ws from connections to game: ', gameId)
      listRemove(connections[gameId], ws)
      // if it wasn't in there, nothing will change
    })
    console.log('Connections: ', connections)
  })
})

function makeGame(id, player_table, bag) {
  return { type: 'game', id: id, players: player_table, bag: bag }
}

function newGame() {
  const gameId = get_random(nineLetterWords)
  console.log('Making a game with random ID: ', gameId)
  return makeGame(gameId, {'Player 1':[], 'Player 2':[]}, newBag())
}

function newBag() {
  // make a new copy of the imported scrabbleLetters constant each time we create a new bag, using spread operator
  return [...scrabbleLetters]
}


// takes a game, looks up its ID, and writes it over the old version
// of the same game in the gameStates dictionary.
// If there wasn't an old version, saves it.
function saveGame(game) {
  var gameId = game.id
  gameStates[gameId] = game
}

// takes a game ID and returns the corresponding game
function getGame(gameId) {
  return gameStates[gameId]
}

// from: https://stackoverflow.com/questions/5915096
function get_random(list) {
  return list[Math.floor((Math.random()*list.length))];
}

// helper function to remove item from list
// does nothing if item is not in list
function listRemove(list, item) {
  const index = list.indexOf(item)
  if (index != -1) {
    list.splice(index, 1)
  }
}

// takes a message (must be play or draw) and a game and returns the result of the play or draw, after making sure it's legal
function transformGame(msg, game) {
  console.log('transforming game with message:', msg)
  var id = game.id
  var player_table = game.players
  var bag = game.bag

  if (msg.type === 'play') {
    var player = msg.player
    var letter = msg.letter
    var hand = player_table[player]

    // check that the letter being played is in the player's hand
    // and remove it from the hand
    if (hand.includes(letter)) {
      listRemove(hand, letter)
    } else {
      console.log('Letter played wasn\'t in the hand! Not changing anything:', game)
      // ERROR, letter wasn't in hand!
    }
    return game
    // replace it in the hand with a new letter from the bag
  } else if (msg.type === 'draw') {
    var player = msg.player
    var hand = player_table[player]
    // check that the player's hand isn't too big
    if (hand.length === HAND_SIZE) {
      console.log('Hand was too big, so you can\'t draw!')
      // ERROR, hand limit reached
    } else if (bag.length === 0) {
      console.log('No tiles left in bag, so you can\'t draw!')
      // ERROR, bag empty
    } else {
      const choice = get_random(bag)
      listRemove(bag, choice)
      hand.push(choice)
    }
    // because I've mutated the hand data I don't have to recreate the game object, I just return it!
    return game
  } else {
    // ERROR, msg wasn't play or draw!
    // don't change anything
    console.log('message ', msg, ' wasn\'t play or draw, can\'t transform a game with it!')
    return game // don't change anything
  }
}

function sendUpdate(ws, game) {
  var updateObject = { type: 'update', game: game }
  ws.send(JSON.stringify(updateObject))
}

function sendNewGameResponse(ws, id) {
  ws.send(JSON.stringify( { type: 'newGameResponse', id: id } ))
}

// takes a game and uses the connections list to send an update to each ws in the connection list for that game
function sendUpdateToAll(game) {
  console.log('game states: ', gameStates)
  var connectionsList = connections[game.id]
  connectionsList.forEach((connection, i) => {
    sendUpdate(connection, game)
  })
}
