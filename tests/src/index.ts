import { Orchestrator } from "@holochain/tryorama";
import scrabblebag from "./scrabblebag";

let orchestrator = new Orchestrator();
scrabblebag(orchestrator);
orchestrator.run();
/*
orchestrator = new Orchestrator()
require('./profile')(orchestrator)
orchestrator.run()
*/
