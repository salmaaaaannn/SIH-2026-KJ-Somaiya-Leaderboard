// API requests use the Vite proxy, so the frontend remains portable across hosts.
export const API_BASE = '';

export const apiUrl = (endpoint: string): string => {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${path}`;
};
