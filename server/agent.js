import {analyzeContext} from  "./tools/analyzeContext.js";
import {generateJoke} from "./tools/generateJoke.js";

//Object.freeze() prevents us from accidentally changing these values.
export const STATES = Object.freeze({
    IDLE: "IDLE",
    ANALYZING: "ANALYZING",
    PLANNING: "PLANNING",
    GENERATING: "GENERATING",
    EVALUATING: "EVALUATING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
});

const transitions = {
    IDLE: ["ANALYZING"],
    ANALYZING: ["PLANNING", "FAILED"],
    PLANNING: ["GENERATING", "FAILED"],
    GENERATING: ["EVALUATING", "FAILED"],
    EVALUATING: ["GENERATING", "COMPLETED", "FAILED"],
    COMPLETED: [],
    FAILED: [],
};

export class RoastAgent {
    constructor(context, mode = "roast") {
        if (typeof context !== "string" || !context.trim()) {
            throw new Error("Please describe your situation.");
        }

        if (!["roast", "toast"].includes(mode)) {
            throw new Error("Mode must be roast or toast.");
        }

        this.state = {
            status: STATES.IDLE,
            context: context.trim(),
            mode,
            analysis: null,
            strategy: null,
            candidates: [],
            scores: [],
            attempts: 0,
            maxAttempts: 2,
            finalJoke: null,
            error: null, 
        };
    }

    //enforces rules. Every state change must pass through it.
    transition(nextState) {
        const currentState = this.state.status;

        const allowed = transitions[currentState];

        if (!allowed.includes(nextState)) {
            throw new Error(
                `Invalid transition: ${currentState} -> ${nextState}`
            );
        }

        console.log(`${currentState} -> ${nextState}`);
        this.state.status = nextState;
    }

    //prevents external code from modifying agent's internal state.
    getState() {
        return structuredClone(this.state);
    }
    
    //async allows us to wait for each operation before moving to the next state.
    async run() {
        if (this.state.status !== STATES.IDLE) {
            throw new Error("This agent has already started.");
        }

        try {
            this.transition(STATES.ANALYZING);

            while (
                this.state.status !== STATES.COMPLETED &&
                this.state.status !== STATES.FAILED
            ) {
                //acts as the dispatcher. Decides which operation to execute based on current state.
                switch (this.state.status) {
                    case STATES.ANALYZING:
                        this.state.analysis = await this.analyzeContext();
                        if (
                            this.state.mode === "roast" &&
                            this.state.analysis.roastAllowed === false
                        ) {
                            this.state.finalJoke =
                            "This sounds like something worth taking seriously. " +
                            "I'm going to skip the roast this time.";

                            this.transition(STATES.PLANNING);
                            this.transition(STATES.GENERATING);
                            this.transition(STATES.EVALUATING);
                            this.state.scores.push(10);
                            this.transition(STATES.COMPLETED);
                            break;
                        }
                        this.transition(STATES.PLANNING);
                        break;
                    
                    case STATES.PLANNING:
                        this.state.strategy = await this.planHumor();
                        this.transition(STATES.GENERATING);
                        break;
                    
                    case STATES.GENERATING: {
                        const joke = await this.generateJoke();

                        this.state.candidates.push(joke);
                        this.state.attempts++;

                        this.transition(STATES.EVALUATING);
                        break;
                    }

                    case STATES.EVALUATING: {
                        const latestJoke = this.state.candidates.at(-1);
                        const score = await this.evaluateJoke(latestJoke);

                        this.state.scores.push(score);

                        //evaluator controls retry.
                        //joke scores atleast 7, gets accepted.
                        //scores below 7, the agent tries again, provided that it has attempts remaining.
                        if (score >= 7 ||
                            this.state.attempts >= this.state.maxAttempts) {
                                // For the mock, return the highest-scoring attempt.

                                const bestIndex = this.state.scores.indexOf(
                                    Math.max(...this.state.scores)
                                );

                                this.state.finalJoke = this.state.candidates[bestIndex];

                                this.transition(STATES.COMPLETED);
                            } else {
                                this.transition(STATES.GENERATING);
                            }
                            break;
                    }

                    default: 
                    throw new Error(
                        `Unhandled state: ${this.state.status}`
                    );
                }
            }
        } catch(error) {
            this.state.error = error.message;

            if (transitions[this.state.status]?.includes(STATES.FAILED)
            ) {
                this.transition(STATES.FAILED);
            } else {
                this.state.status = STATES.FAILED;
            }
        }

        return this.getState();
    }

    //mock agent operations
    async analyzeContext() {
       return {
        topic: "general",
        emotion: "frustrated",
        humorTarget: "the situation",
        comedicAngles: ["irony", "exaggeration"],
        riskLevel: "low",
        roastAllowed: true
        };
    }

    async planHumor() {
        console.log("Selecting humor strategy...");

        return "irony";
    }

    async generateJoke() {
      console.log("Gemini is helping me generate something good.");

      const joke = await generateJoke({
        context: this.state.context,
        mode: this.state.mode,
        analysis: this.state.analysis,
        strategy: this.state.strategy,
        previousJokes: this.state.candidates,
      });

      console.log("Generated: ", joke);

      return joke;
    }

    async evaluateJoke(joke) {
        console.log("Evaluating joke:", joke);
        // Temporary: accept a complete, nonempty response.
        // We will implement the real critic later.
        if (typeof joke !== "string" || !joke.trim()) {
            return 0;
        }
        return 8;
    }
}