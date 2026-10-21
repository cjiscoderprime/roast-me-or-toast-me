import {analyzeContext} from "./tools/analyzeContext.js";


const context = 
"I prepared for my software engineering interview " + "for three weeks, and I couldn't solve a simple problem.";

try {
    const result = await analyzeContext(context);
    console.log("\n--- GEMINI ANALYSIS ---");
    console.log(JSON.stringify(result, null, 2));
} catch (error) {
    console.error("Analysis failed:", error.message);
    process.exitCode = 1;
}
