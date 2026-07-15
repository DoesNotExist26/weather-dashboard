import { buildApiUrl, parseQuery, proxyRequest, sendJson } from './_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const query = parseQuery(req);
  const lat = query.lat;
  const lon = query.lon;
  const ai = query.ai ?? 'true';

  if (!lat || !lon) {
    return sendJson(res, 400, { error: 'lat and lon query parameters are required.' });
  }

  if (!process.env.WEATHER_AI_API_KEY) {
    return sendJson(res, 500, { error: 'Server API key not configured.' });
  }

  const weatherUrl = buildApiUrl('/weather', { lat, lon, ai });

  try {
    const { response, data } = await proxyRequest(weatherUrl);
    if (!response.ok) {
      return sendJson(res, response.status, { error: data });
    }
    return sendJson(res, 200, data);
  } catch (error) {
    console.error('Weather API error', error);
    return sendJson(res, 500, { error: 'Unable to reach WeatherAI API.' });
  }
}
