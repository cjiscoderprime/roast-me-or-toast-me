import {RoastAgent} from "./agent.js";

const context = 
"I studied Leetcode for three weeks " 
+ "and completely bombed my SWE interview.";

const agent = new RoastAgent(context, "roast");

const result = await agent.run();

console.log("\n---AGENT RESULT---");

console.log("Status: ", result.status);
console.log("Analysis: ",result.analysis);
console.log("Strategy: ", result.strategy);
console.log("Attempts: ", result.attempts);
console.log("Scores: ", result.scores);
console.log("Final Joke: ", result.finalJoke);