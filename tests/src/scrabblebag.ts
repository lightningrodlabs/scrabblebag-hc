import { Orchestrator, Config, InstallAgentsHapps } from "@holochain/tryorama";
import path from "path";
import * as _ from "lodash";

import {
  RETRY_DELAY,
  RETRY_COUNT,
  localConductorConfig,
  networkedConductorConfig,
  installAgents,
  awaitIntegration,
  delay,
} from "./common";
import { Base64 } from "js-base64";

function serializeHash(hash: Uint8Array): string {
  return `u${Base64.fromUint8Array(hash, true)}`;
}

export default async (orchestrator) => {
  orchestrator.registerScenario("scrabblebag basic tests", async (s, t) => {
    // Declare two players using the previously specified config, nicknaming them "alice" and "bob"
    // note that the first argument to players is just an array conductor configs that that will
    // be used to spin up the conductor processes which are returned in a matching array.
    const [a_and_b_conductor] = await s.players([localConductorConfig]);

    // install your happs into the conductors and destructuring the returned happ data using the same
    // array structure as you created in your installation array.
    let [alice_happ, bobbo_happ] =
      await installAgents(a_and_b_conductor, ["alice", "bobbo"]);
    const [alice] = alice_happ.cells;
    const [bobbo] = bobbo_happ.cells;
    const boboAgentKey = serializeHash(bobbo.cellId[1]);
    const aliceAgentKey = serializeHash(alice.cellId[1]);

    const players = await alice.call(
      "scrabblebag",
      "get_players",
      null
    );
    t.ok(players);
    t.equal(players.length, 1)
    console.log("players:", players);

    const players2 = await bobbo.call(
      "scrabblebag",
      "get_players",
      null
    );
    t.ok(players);
    t.equal(players2.length, 2)
    console.log("players2:", players2);


  });

};
