# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.


My thought process:

Wanted to basically build a website that roasts you and then has an option to toast you, an option for recovery.

Project moved forward into the direction of becoming an AI wrapper. 

Decided to build an agent that can create it's own roasts, review them, and create better more personalized roasts on it's own.

Back to being an AI wrapper but creative and a good learning experience.

Concepts to use:

Rejection rates,
Successful revisions,
Similarity scores,
Response Latency

Scope:

Two Candidate Jokes
Single Evaluation Pass
At most one revision

One generating agent, one critic agent, and a similarity checking tool. An iterative improvement loop.

Work Thought Process:

Agent needs to make decisions based on the results of previous operations.

Agent's next action depends on its evaluation of previous output.

Creating a finite state machine that can occupy one of a defined number of states. It moves from one state to another according to rules.
Agent will have states: Idle, Analyzing, Planning, Generating, Evaluating and Completed
Evaluating can go back to Generating if revision is needed when the joke is weak.

Pivoting to general context instead of roasting just on academic background.

Created a working agent execution controller that can dispatch operations, maintain working memory, evaluate results and retry based on a decision threshold. Or a functioning finite state agent orchestrator.

Reduced scope to include Groq LLM, Express backend to control API endpoint, React/Vite Frontend, Node.js, Small Redis Rate Limiting

Adding limits at two levels, inside the agent and at public API endpoint.

Our react application needs to communicate with our AI agent through HTTP or Express API.

Rate Limiting Design:

React -> API Request
|
Redis Rate Limiter Per-IP + global quota
|
Groq API
|
Return joke to react

