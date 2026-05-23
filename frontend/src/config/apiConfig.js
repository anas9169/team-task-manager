/**
 * Resolves the API base URL for all axios requests.
 *
 * VITE_API_URL examples (all work):
 *   https://your-app.up.railway.app
 *   https://your-app.up.railway.app/api
 *   http://localhost:5000/api
 *
 * In dev without .env, uses /api (Vite proxy → localhost:5000).
 */
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();

  if (envUrl) {
    const base = envUrl.replace(/\/+$/, '');
    return base.endsWith('/api') ? base : `${base}/api`;
  }

  if (import.meta.env.DEV) {
    return '/api';
  }

  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();
