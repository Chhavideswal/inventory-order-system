import axios from 'axios';

const api = axios.create({
  // Use the environment variable if available, otherwise fallback to localhost for development
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
});

export default api;
