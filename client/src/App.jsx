import { useMemo, useState } from 'react';

const defaultLat = '-1.2921';
const defaultLon = '36.8219';
const triggerOptions = ['rain', 'extreme_wind', 'frost', 'drought'];

function buildErrorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.error) return typeof data.error === 'string' ? data.error : data.error.message || JSON.stringify(data.error);
  if (data.message) return data.message;
  return fallback;
}

function App() {
  const [lat, setLat] = useState(defaultLat);
  const [lon, setLon] = useState(defaultLon);
  const [aiSummary, setAiSummary] = useState(true);
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [usage, setUsage] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState(null);
  const [loadingWebhook, setLoadingWebhook] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [webhookForm, setWebhookForm] = useState({
    url: 'https://example.com/weather-hook',
    lat: defaultLat,
    lon: defaultLon,
    timezone: 'Africa/Nairobi',
    triggers: ['rain']
  });

  const authHeaders = useMemo(
    () => (apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined),
    [apiKey]
  );

  const modeLabel = useMemo(() => (apiKey ? 'Direct API mode' : 'Proxy mode'), [apiKey]);

  function renderWeatherSummary(data) {
    if (!data || typeof data !== 'object') return null;

    const summaryFields = [
      ['AI summary', data.ai_summary || data.aiSummary || data.summary],
      ['Weather', data.current?.weather || data.conditions || data.weather],
      ['Temperature', data.current?.temperature || data.temperature || data.temp],
      ['Wind', data.current?.wind_speed || data.wind_speed],
      ['Humidity', data.current?.humidity || data.humidity],
      ['Location', data.location || `${lat}, ${lon}`]
    ]
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .slice(0, 5);

    if (!summaryFields.length) return null;

    return (
      <div className="weather-quickgrid">
        {summaryFields.map(([label, value]) => (
          <div key={label} className="weather-chip">
            <span>{label}</span>
            <strong>{String(value)}</strong>
          </div>
        ))}
      </div>
    );
  }

  async function executeRequest(endpoint, options = {}) {
    const headers = {
      ...options.headers,
      ...(authHeaders || {})
    };

    const response = await fetch(endpoint, { ...options, headers });
    const text = await response.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    if (!response.ok) {
      throw new Error(buildErrorMessage(payload, 'Request failed.'));
    }

    return payload;
  }

  async function fetchWeather() {
    setLoadingWeather(true);
    setError('');
    setWeather(null);

    try {
      const params = new URLSearchParams({ lat, lon, ai: String(aiSummary) });
      const endpoint = apiKey ? `https://api.weather-ai.co/v1/weather?${params}` : `/api/weather?${params}`;
      const data = await executeRequest(endpoint, { method: 'GET' });
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingWeather(false);
    }
  }

  async function fetchUsage() {
    setLoadingUsage(true);
    setError('');
    setUsage(null);

    try {
      const endpoint = apiKey ? 'https://api.weather-ai.co/v1/usage' : '/api/usage';
      const data = await executeRequest(endpoint, { method: 'GET' });
      setUsage(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingUsage(false);
    }
  }

  async function createWebhook(event) {
    event.preventDefault();
    setLoadingWebhook(true);
    setError('');
    setWebhookResponse(null);

    try {
      const endpoint = apiKey ? 'https://api.weather-ai.co/v1/webhooks' : '/api/webhooks';
      const headers = { 'Content-Type': 'application/json', ...(authHeaders || {}) };
      const payload = {
        url: webhookForm.url,
        lat: webhookForm.lat,
        lon: webhookForm.lon,
        timezone: webhookForm.timezone,
        triggers: webhookForm.triggers
      };
      const data = await executeRequest(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      setWebhookResponse(data);
    } catch (err) {
      if (err.message === 'Not found.') {
        setError(
          'Webhook creation failed: your WeatherAI API key or plan may not support webhooks. Webhooks require a Pro or Scale plan in WeatherAI.'
        );
      } else {
        setError(err.message);
      }
    } finally {
      setLoadingWebhook(false);
    }
  }

  function toggleTrigger(trigger) {
    setWebhookForm((prev) => {
      const exists = prev.triggers.includes(trigger);
      const triggers = exists
        ? prev.triggers.filter((item) => item !== trigger)
        : [...prev.triggers, trigger];
      return { ...prev, triggers };
    });
  }

  return (
    <div className="page-container">
      <header className="hero-card">
        <div className="hero-copygroup">
          <p className="eyebrow">WeatherAI Dashboard</p>
          <h1>WeatherAI Dashboard</h1>
          <p className="hero-copy">
            A polished WeatherAI app with secure API proxying, direct key mode, usage analytics, and webhook subscription support.
          </p>
          <div className="hero-pill-grid">
            <span>Secure API proxy</span>
            <span>Direct browser mode</span>
            <span>Vercel deployment ready</span>
          </div>
        </div>
      </header>

      <section className="top-grid">
        <article className="card status-card">
          <div className="section-heading">
            <h2>Deployment readiness</h2>
            <span className="status-pill success">Deployment ready</span>
          </div>
          <p className="section-copy">
            This dashboard is built to ship: clean components, responsive modern layout, secure key proxying, and Vercel-ready serverless routing.
          </p>
          <div className="status-list">
            <div>
              <strong>Secure proxy</strong>
              <p>All `/api` requests are routed through the server environment, keeping your key hidden from browser clients.</p>
            </div>
            <div>
              <strong>Direct key mode</strong>
              <p>Enter a WeatherAI key in the UI to call the API directly from the browser for quick demos and static deployments.</p>
            </div>
          </div>
        </article>

        <article className="card quick-actions">
          <div className="section-heading">
            <h2>What you can do</h2>
            <span className="status-pill accent">Live API demo</span>
          </div>
          <ul>
            <li>Search weather by geographic coordinates.</li>
            <li>Request AI-generated weather summaries.</li>
            <li>Register webhook alerts for rain, wind, frost, and drought.</li>
            <li>Inspect account usage and plan details.</li>
          </ul>
        </article>
      </section>

      <section className="card api-key-card">
        <h2>API mode</h2>
        <p className="section-copy">
          Leave the key blank to use the secure proxy mode, or paste your WeatherAI API key to call the API directly from the browser.
        </p>
        <label className="label-with-note">
          <span>WeatherAI API key</span>
          <input
            type="password"
            value={apiKey}
            placeholder="Enter your WeatherAI API key"
            onChange={(e) => setApiKey(e.target.value)}
          />
        </label>
      </section>

      <main className="main-grid">
        <section className="card weather-card">
          <div className="section-heading">
            <h2>Weather lookup</h2>
            <span className="status-pill muted">Latitude / Longitude</span>
          </div>
          <div className="form-grid">
            <label>
              Latitude
              <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude" />
            </label>
            <label>
              Longitude
              <input value={lon} onChange={(e) => setLon(e.target.value)} placeholder="Longitude" />
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={aiSummary} onChange={(e) => setAiSummary(e.target.checked)} />
              Include AI summary
            </label>
          </div>
          <button onClick={fetchWeather} disabled={loadingWeather}>
            {loadingWeather ? 'Loading weather…' : 'Fetch weather'}
          </button>
          {weather && (
            <div className="response-panel weather-response">
              <div className="section-heading small">
                <h3>Weather response</h3>
                <span className="status-pill info">Live data</span>
              </div>
              {renderWeatherSummary(weather)}
              <pre>{JSON.stringify(weather, null, 2)}</pre>
            </div>
          )}
        </section>

        <section className="card webhook-card">
          <div className="section-heading">
            <div>
              <h2>Webhook subscription</h2>
              <p className="section-copy">
                Create event-driven webhook alerts for weather conditions and receive payloads at your callback URL.
              </p>
            </div>
            <span className="status-pill muted">Pro / Scale only</span>
          </div>
          <form onSubmit={createWebhook} className="webhook-form">
            <div className="form-grid">
              <label>
                Webhook URL
                <input
                  value={webhookForm.url}
                  onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                  placeholder="https://example.com/weather-hook"
                />
              </label>
              <label>
                Latitude
                <input
                  value={webhookForm.lat}
                  onChange={(e) => setWebhookForm({ ...webhookForm, lat: e.target.value })}
                  placeholder="Latitude"
                />
              </label>
              <label>
                Longitude
                <input
                  value={webhookForm.lon}
                  onChange={(e) => setWebhookForm({ ...webhookForm, lon: e.target.value })}
                  placeholder="Longitude"
                />
              </label>
              <label>
                Timezone
                <input
                  value={webhookForm.timezone}
                  onChange={(e) => setWebhookForm({ ...webhookForm, timezone: e.target.value })}
                  placeholder="Africa/Nairobi"
                />
              </label>
            </div>

            <div className="webhook-footer">
              <fieldset className="triggers-fieldset">
                <legend>Triggers</legend>
                <div className="trigger-pill-grid">
                  {triggerOptions.map((trigger) => (
                    <button
                      type="button"
                      key={trigger}
                      className={webhookForm.triggers.includes(trigger) ? 'trigger-pill selected' : 'trigger-pill'}
                      onClick={() => toggleTrigger(trigger)}
                    >
                      {trigger.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </fieldset>
              <button type="submit" disabled={loadingWebhook} className="primary-button">
                {loadingWebhook ? 'Registering webhook…' : 'Register webhook'}
              </button>
            </div>
          </form>
          {webhookResponse && (
            <div className="response-panel">
              <h3>Webhook created</h3>
              <pre>{JSON.stringify(webhookResponse, null, 2)}</pre>
            </div>
          )}
        </section>

        <section className="card usage-card">
          <div className="section-heading">
            <h2>Usage analytics</h2>
            <span className="status-pill accent">Billing-ready</span>
          </div>
          <p className="section-copy">Retrieve your account usage and quota details from WeatherAI.</p>
          <button onClick={fetchUsage} disabled={loadingUsage}>
            {loadingUsage ? 'Fetching usage…' : 'Fetch usage stats'}
          </button>
          {usage && (
            <div className="response-panel">
              <h3>Usage details</h3>
              <pre>{JSON.stringify(usage, null, 2)}</pre>
            </div>
          )}
        </section>

        {error && (
          <section className="card error-panel">
            <h3>Problem</h3>
            <p>{error}</p>
          </section>
        )}
      </main>

      <footer className="footer-card">
        <p>
          Designed for a polished WeatherAI demo with API proxy security, analytics, and webhook support. Store your key securely in Vercel and run this dashboard with confidence.
        </p>
      </footer>
    </div>
  );
}

export default App;
