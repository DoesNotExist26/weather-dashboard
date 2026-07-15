import { proxyRequest, readJsonBody, sendJson } from './_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  if (!process.env.WEATHER_AI_API_KEY) {
    return sendJson(res, 500, { error: 'Server API key not configured.' });
  }

  const payload = await readJsonBody(req);
  const { url, lat, lon, triggers, timezone } = payload;

  if (!url || !lat || !lon || !Array.isArray(triggers) || triggers.length === 0) {
    return sendJson(res, 400, { error: 'url, lat, lon, and triggers are required.' });
  }

  try {
    const { response, data } = await proxyRequest('https://api.weather-ai.co/v1/webhooks', {
      method: 'POST',
      body: JSON.stringify({ url, lat, lon, triggers, timezone })
    });
    if (!response.ok) {
      return sendJson(res, response.status, { error: data });
    }
    return sendJson(res, 200, data);
  } catch (error) {
    console.error('Webhook API error', error);
    return sendJson(res, 500, { error: 'Unable to reach WeatherAI API.' });
  }
}
