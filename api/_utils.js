import dotenv from 'dotenv';
import { parse } from 'url';

dotenv.config();

export const API_BASE = 'https://api.weather-ai.co/v1';
export const apiKey = process.env.WEATHER_AI_API_KEY;
export const missingKeyMessage = 'Server API key not configured. Set WEATHER_AI_API_KEY in your environment.';

export function parseQuery(req) {
  const url = parse(req.url || '', true);
  return url.query || {};
}

export async function readJsonBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return {};
  }

  const raw = [];
  for await (const chunk of req) {
    raw.push(chunk);
  }

  const body = Buffer.concat(raw).toString('utf8');
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

export function sendJson(res, status, payload) {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = status;
  res.end(JSON.stringify(payload));
}

export function buildApiUrl(endpoint, query = {}) {
  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

export async function proxyRequest(url, options = {}) {
  if (!apiKey) {
    throw new Error(missingKeyMessage);
  }

  const headers = {
    Authorization: 'Bearer ' + apiKey,
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(url, { headers, ...options });
  const body = await response.text();
  let data;
  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    data = body;
  }

  return { response, data };
}
