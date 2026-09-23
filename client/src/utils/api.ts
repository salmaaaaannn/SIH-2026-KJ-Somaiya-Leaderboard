// Use VITE_API_BASE_URL from .env in production, otherwise fallback to Vite proxy in local dev
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const apiUrl = (endpoint: string): string => {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${path}`;
};
