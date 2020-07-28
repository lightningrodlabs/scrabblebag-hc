// the tiles in scrabble
// NAME : [count, score]
const scrabbleLettersDict = {
  "BLANK" : [2,  0],
  "A"     : [9,  1],
  "B"     : [2,  3],
  "C"     : [2,  3],
  "D"     : [4,  2],
  "E"     : [12, 1],
  "F"     : [2,  4],
  "G"     : [3,  2],
  "H"     : [2,  4],
  "I"     : [9,  1],
  "J"     : [1,  8],
  "K"     : [1,  5],
  "L"     : [4,  1],
  "M"     : [2,  3],
  "N"     : [6,  1],
  "O"     : [8,  1],
  "P"     : [2,  3],
  "Q"     : [1,  10],
  "R"     : [6,  1],
  "S"     : [4,  1],
  "T"     : [6,  1],
  "U"     : [4,  1],
  "V"     : [2,  4],
  "W"     : [2,  4],
  "X"     : [1,  8],
  "Y"     : [2,  4],
  "Z"     : [1,  10] }

const scrabbleLetters = arrayFromLettersDict(scrabbleLettersDict)

function arrayFromLettersDict(lettersDict) {
  var result = []
  for (const [key, value] of Object.entries(lettersDict)) {
    // from: https://stackoverflow.com/questions/34913675/
    var name = key
    var count = value[0]
    // var score = value[1]
    // console.log("looking at name: ", name, " and count: ", count)
    for (const i in [...Array(count).keys()]) {
      // equivalent of range() in python. From: https://stackoverflow.com/questions/3895478/
      result.push(name)
      // console.log("pushed: ", name)
    }
  }
  return result
}

module.exports = {
    scrabbleLetters: scrabbleLetters
};
