// src/services/api.js

import axios from 'axios';

// CORREÇÃO: A URL base deve apontar para a raiz do servidor Spring Boot,
// sem incluir prefixos de rota do front-end como '/admin'.
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8082';

const api = axios.create({
  // A baseURL é construída juntando a raiz do servidor com o prefixo real da API.
  // Isso resultará em: 'http://localhost:8082/api'
  baseURL: `${apiUrl}/api`,
  timeout: 10000,
  
  // Esta linha é essencial para que o navegador envie o cookie de sessão
  // para o back-end em cada requisição.
  withCredentials: true,
});

/**
 * Interceptador de Resposta:
 * Este é um mecanismo poderoso para lidar com respostas de forma global.
 * Aqui, ele é usado para detectar quando uma sessão expirou (erro 401 ou 403)
 * e redirecionar o usuário para a tela de login automaticamente.
 */
api.interceptors.response.use(
  // Se a resposta for bem-sucedida (status 2xx), apenas a repassamos.
  (response) => response,

  // Se ocorrer um erro...
  (error) => {
    const status = error.response?.status;

    // Se o erro for de "Não Autorizado" (401) ou "Proibido" (403),
    // a sessão do usuário provavelmente é inválida ou expirou.
    if (status === 401 || status === 403) {
      // Verificamos se o usuário já não está na página de login para evitar um loop.
      if (window.location.pathname !== '/login') {
        // Força o redirecionamento para a tela de login.
        window.location.href = '/login';
      }
    }

    // Independentemente do erro, nós o rejeitamos para que possa ser
    // tratado localmente no componente que fez a chamada (ex: no bloco `catch`).
    return Promise.reject(error);
  }
);

// Exportamos a URL base do backend para ser usada em outros lugares,
// como na montagem de URLs de imagens.
export const BACKEND_URL = apiUrl;

// Exportamos a instância configurada do Axios para ser usada em toda a aplicação.
export default api;