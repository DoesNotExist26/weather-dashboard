# WeatherAI Dashboard

A lightweight WeatherAI integration demo that lets you:

- Query live weather for a location using the WeatherAI `/v1/weather` endpoint.
- Toggle AI-generated weather summaries.
- Register webhook alerts with WeatherAI using `/v1/webhooks`.
- Fetch account usage analytics via `/v1/usage`.

This project is built with React + Vite for the frontend and Express for a minimal backend proxy that keeps the WeatherAI API key secure.

## Features

- Search weather by latitude/longitude
- Optional AI summary support
- Webhook subscription form for weather triggers
- Usage analytics viewer
- Modern responsive dashboard UI with polished deployment-ready styling
- Deployment-ready server wrapper for secure API key handling

## Getting started

### Requirements

- Node.js 20+ or compatible
- npm 10+ or compatible

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/DoesNotExist26/weatherai-dashboard.git
   cd weatherai-dashboard
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the example environment file and add your WeatherAI API key:

   ```bash
   cp .env.example .env
   ```

   Then open `.env` and set:

   ```env
   WEATHER_AI_API_KEY=your-real-weather-ai-key
   ```

   The API key should come from your WeatherAI developer dashboard at https://weather-ai.co/docs or the WeatherAI console after signing in.

4. Start the development environment:

   ```bash
   npm run dev
   ```

5. Open the app in your browser:

   - Frontend: `http://localhost:4174`
   - Backend: `http://localhost:4173`

### Build for deployment

```bash
npm run build
npm start
```

The deployment server will serve the built frontend and proxy API requests from a single process.

## Project structure

- `client/` — React application source
- `server/` — Express backend proxy
- `vite.config.js` — Vite configuration for build and dev proxy
- `README.md` — Project documentation

## Deployment

This app is ready for deployment on platforms that support Node.js apps, such as Render, Railway, or Vercel.

### Example Render configuration

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment variable: `WEATHER_AI_API_KEY`

### Live preview

A live preview of the built frontend is available at:

- `https://htmlpreview.github.io/?https://raw.githubusercontent.com/DoesNotExist26/weatherai-dashboard/gh-pages/index.html`

The repository is also configured for GitHub Pages at:

- `https://doesnotexist26.github.io/weatherai-dashboard/`

### Deploy to Vercel

This project is configured for Vercel. To deploy:

1. Install the Vercel CLI if needed:
   ```bash
   npm install -g vercel
   ```
2. Log in with your GitHub account:
   ```bash
   vercel login
   ```
3. Deploy the project:
   ```bash
   vercel --prod
   ```
4. In the Vercel dashboard, add an environment variable in both Preview and Production:
   - `WEATHER_AI_API_KEY`

If you do not set this environment variable, the `/api/*` serverless proxy routes will return an error. You can still enter a key directly in the app UI for quick testing, but the recommended deployment method is to store `WEATHER_AI_API_KEY` securely in Vercel.

### Webhook support

WeatherAI webhooks are only available on paid plans (Pro or Scale). If your account is on the Free tier, webhook requests will fail with a `Not found.` response even if the rest of the API works.

The app sends the API key as `Authorization: Bearer <api_key>` when calling WeatherAI directly, and the Vercel serverless proxy forwards the same Authorization header format.

The Vercel deployment will use `/api/*` serverless routes to securely proxy requests to WeatherAI.

## Notes

The backend keeps the WeatherAI API key hidden from the browser. All `/api/*` calls are proxied through the Express server, which forwards requests to `https://api.weather-ai.co/v1`.

For static hosting or quick demos, the frontend also supports direct browser calls when you enter a valid `WeatherAI` API key in the app. This makes the static version usable without a backend proxy.

If you would like, I can also add a hosted deployment link once the repository is published and environment variables are configured.
