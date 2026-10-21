# Roast Me or Toast Me

**Turn an awkward moment into a laugh—or a little encouragement.**

[**Try the live app**](https://roast-me-toast-me.netlify.app/) · [**Source code**](https://github.com/cjiscoderprime/roast-me-or-toast-me)

Roast Me or Toast Me is a responsive, AI-powered web app. Describe a situation—an interview gone wrong, an awkward conversation, or a small everyday disaster—and choose between a playful **Roast** and a supportive **Toast**. Responses are generated on demand, not selected from a predefined list.

## Features

- **Two distinct response modes:** sarcastic, situation-specific roasts or encouraging toasts
- **Fast AI inference:** one model request per generation using Groq's hosted `openai/gpt-oss-20b`
- **Animated interface:** motion-based buttons, floating background particles, and mode-specific loading indicators
- **Responsive layout:** usable on desktop and mobile
- **Distributed rate limiting:** Upstash Redis enforces a sliding window of 60 requests per IP per 15 minutes and an application-wide limit of 500 requests per day
- **Serverless deployment:** a Netlify Function provides `POST /api/generate`, keeping model and Redis credentials off the client

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, CSS, Motion for React |
| AI inference | Groq SDK, `openai/gpt-oss-20b` |
| API | Netlify Functions (production), Node.js + Express (local alternative) |
| Rate limiting | Upstash Redis, `@upstash/ratelimit` |
| Hosting | Netlify |
| Version control | Git, GitHub |

## How it works

```text
Visitor
  |
  v
React frontend (Roast / Toast + situation)
  |
  | POST /api/generate
  v
Netlify Function
  |-- Validate input and mode
  |-- Check per-IP and global limits in Upstash Redis
  |-- Request one response from Groq
  |
  v
JSON response -> animated React result card
```

The site does not require an account or a user-profile database. Text entered by a visitor is sent to the API and onward to the third-party inference provider to generate a response. Avoid entering sensitive or identifying information.

## Run locally

**Requirements:** Node.js, npm, a Groq API key, and an Upstash Redis database with REST credentials.

1. Clone and install:

   ```bash
   git clone https://github.com/cjiscoderprime/roast-me-or-toast-me.git
   cd roast-me-or-toast-me
   npm install
   ```

2. Create a `.env` file at the project root:

   ```dotenv
   GROQ_API_KEY=your_groq_api_key
   UPSTASH_REDIS_REST_URL=your_upstash_rest_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token
   ```

   **Never commit `.env`.** Environment variables belong on the server, not in browser code.

3. Run the integrated frontend and serverless function locally:

   ```bash
   npx netlify dev
   ```

4. Open the local URL printed by Netlify Dev (often `http://localhost:8888`).

The repository also includes an Express development server at `server/index.js`, but the Netlify Function in `netlify/functions/generate.mjs` is the production API.

## API

**`POST /api/generate`**

Request:

```json
{
  "context": "I practiced for weeks and blanked during my interview.",
  "mode": "roast"
}
```

Successful response shape:

```json
{
  "joke": "A generated response appears here.",
  "mode": "roast",
  "latencyMs": 1234
}
```

Supported modes: `roast` and `toast`. Input is limited to 1,500 characters. Requests may return `400` for invalid input, `429` for rate limits, or `503` when an external service is unavailable.

## Deployment

The project deploys from the `main` branch to Netlify.

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Production function route: `/api/generate`

Configure `GROQ_API_KEY`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` in **Netlify's environment variable settings** with access to the Functions runtime. Do not include quotation marks as part of the values. Deploy again after changing environment variables.

## Engineering notes

- The Redis-backed limiters share state across serverless function instances, unlike in-memory request counters.
- Client IP limits are approximate: visitors on the same network may share an IP address.
- Application-level request limits help control usage but do not guarantee model-provider availability or zero costs.
- The frontend never receives the Groq or Redis secret values.

## Future improvements

- One-click copy/share for generated responses
- Additional UX and accessibility testing
- Aggregate latency and error-rate monitoring

## Development history

The prototype originally explored a custom finite-state humor agent before pivoting to single-request LLM inference for lower latency and a simpler user experience. The original project notes are archived in [docs/development-notes.md](docs/development-notes.md).
