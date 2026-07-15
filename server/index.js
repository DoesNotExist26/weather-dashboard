import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 4173;
const apiKey = process.env.WEATHER_AI_API_KEY;
const API_BASE = 'https://api.weather-ai.co/v1';

const missingKeyMessage = 'Server API key not configured. Set WEATHER_AI_API_KEY in your environment.';

if (!apiKey) {
  console.warn('WARNING: WEATHER_AI_API_KEY is not configured. API routes will fail until it is set.');
}

app.use(express.json({ limit: '64kb' }));

function buildApiUrl(endpoint, query = {}) {
  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

function buildHeaders(overrides = {}) {
  if (!apiKey) {
    return overrides;
  }

  return {
    Authorization: 'Bearer ' + apiKey,
    'Content-Type': 'application/json',
    ...overrides
  };
}

async function proxyRequest(url, options = {}) {
  if (!apiKey) {
    throw new Error(missingKeyMessage);
  }

  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers)
  });

  const body = await response.text();
  let data;
  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    data = body;
  }

  return { response, data };
}

app.use('/api', (req, res, next) => {
  if (!apiKey) {
    return res.status(500).json({ error: missingKeyMessage });
  }
  next();
});

app.get('/api/weather', async (req, res) => {
  const { lat, lon, ai = 'true' } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon query parameters are required.' });
  }

  const weatherUrl = buildApiUrl('/weather', { lat, lon, ai });

  try {
    const { response, data } = await proxyRequest(weatherUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }
    res.json(data);
  } catch (error) {
    console.error('Weather API error', error);
    res.status(500).json({ error: error.message || 'Unable to reach WeatherAI API.' });
  }
});

app.post('/api/webhooks', async (req, res) => {
  const { url, lat, lon, triggers, timezone } = req.body;

  if (!url || !lat || !lon || !Array.isArray(triggers) || triggers.length === 0) {
    return res.status(400).json({ error: 'url, lat, lon, and triggers are required.' });
  }

  try {
    const { response, data } = await proxyRequest(`${API_BASE}/webhooks`, {
      method: 'POST',
      body: JSON.stringify({ url, lat, lon, triggers, timezone })
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }
    res.json(data);
  } catch (error) {
    console.error('Webhook API error', error);
    res.status(500).json({ error: error.message || 'Unable to reach WeatherAI API.' });
  }
});

app.get('/api/usage', async (_req, res) => {
  try {
    const { response, data } = await proxyRequest(`${API_BASE}/usage`);
    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }
    res.json(data);
  } catch (error) {
    console.error('Usage API error', error);
    res.status(500).json({ error: error.message || 'Unable to reach WeatherAI API.' });
  }
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
