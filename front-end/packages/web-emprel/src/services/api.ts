// src/services/api.ts
import axios from 'axios';

// A URL base vem do arquivo .env, com um fallback para desenvolvimento local.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

// Exportamos a URL base para ser usada em outros lugares, como na montagem de URLs de imagens.
export const getApiBaseUrl = () => API_BASE_URL;

export default api;