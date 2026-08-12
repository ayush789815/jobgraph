import axios from 'axios';

/**
 * Single axios instance for the whole app.
 * baseURL: dev uses the Vite proxy (/api); production uses VITE_API_URL.
 * The response interceptor unwraps `res.data` and normalizes failures into a
 * plain Error with a human-friendly message, so pages just catch and display.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 12000,
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status || 0;
    const serverMessage = err.response?.data?.message;
    const error = new Error(serverMessage || friendlyMessage(status, err.code));
    error.status = status;
    error.code = err.response?.data?.code || (status === 0 ? 'NETWORK' : 'API_ERROR');
    throw error;
  },
);

function friendlyMessage(status, code) {
  if (code === 'ECONNABORTED') {
    return 'The request took too long. CognoDB may be starting up — try again in a moment.';
  }
  if (status === 0) {
    return "Can't reach the JobGraph API. Is the backend running? (npm run dev in the project root)";
  }
  if (status === 503) {
    return 'CognoDB is currently unavailable. Please try again in a moment.';
  }
  if (status === 404) {
    return 'We could not find what you were looking for.';
  }
  if (status >= 500) {
    return 'Something went wrong on our side. Please try again in a moment.';
  }
  return 'Something unexpected happened. Please try again.';
}

export default api;
