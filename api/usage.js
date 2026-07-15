import { buildApiUrl, proxyRequest, sendJson } from './_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  if (!process.env.WEATHER_AI_API_KEY) {
    return sendJson(res, 500, { error: 'Server API key not configured.' });
  }

  try {
    const { response, data } = await proxyRequest(buildApiUrl('/usage'));
    if (!response.ok) {
      return sendJson(res, response.status, { error: data });
    }
    return sendJson(res, 200, data);
  } catch (error) {
    console.error('Usage API error', error);
    return sendJson(res, 500, { error: 'Unable to reach WeatherAI API.' });
  }
}
