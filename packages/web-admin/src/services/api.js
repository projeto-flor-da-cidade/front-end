// Caminho: src/services/api.js

import axios from 'axios';

// Define a URL base da sua API.
// Preferencialmente, use uma variável de ambiente (VITE_API_URL para Vite, REACT_APP_API_URL para Create React App).
// Se a variável não estiver definida, usa 'http://localhost:8082' como fallback.
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8082';

const api = axios.create({
  // A baseURL para as requisições da API.
  // Ela será 'http://localhost:8082/api' (ou o que estiver em VITE_API_URL).
  baseURL: `${apiUrl}/api`,
  
  // Define um tempo limite para as requisições (10 segundos).
  // Se a requisição demorar mais que isso, ela será abortada.
  timeout: 10000,
  
  // ======================= INÍCIO DA CORREÇÃO =======================
  // Esta linha é CRUCIAL para o logout e para a manutenção da sessão.
  // Ela instrui o Axios a incluir credenciais (como cookies de sessão)
  // em requisições cross-origin (para domínios/portas diferentes).
  // Sem isso, o cookie JSESSIONID não é enviado, e o servidor não sabe
  // qual sessão invalidar no logout.
  withCredentials: true,
  // ======================== FIM DA CORREÇÃO =========================
});

/**
 * Interceptador de Resposta:
 * Configura um interceptor para lidar com as respostas da API de forma global.
 * Ele é especialmente útil para tratar erros de autenticação/autorização.
 */
api.interceptors.response.use(
  // Se a resposta for bem-sucedida (status 2xx), apenas a repassamos para o componente.
  (response) => response,

  // Se ocorrer um erro (status diferente de 2xx)...
  (error) => {
    // Acessa o status HTTP da resposta de erro, se disponível.
    const status = error.response?.status;

    // Detecta erros de "Não Autorizado" (401) ou "Proibido" (403).
    // Estes geralmente indicam que a sessão do usuário expirou ou é inválida.
    if (status === 401 || status === 403) {
      // Impede o redirecionamento se o usuário já estiver na página de login
      // para evitar um loop infinito de redirecionamentos.
      if (window.location.pathname !== '/login') {
        // Redireciona o usuário para a página de login.
        // Usar `window.location.href` garante uma navegação completa,
        // limpando o histórico e o estado do React Router.
        window.location.href = '/'; // Redireciona para a rota raiz que leva ao login
      }
    }

    // Retorna uma Promise rejeitada com o erro original.
    // Isso permite que o componente que fez a requisição trate o erro
    // em seu próprio bloco `catch`.
    return Promise.reject(error);
  }
);

// Exportamos a URL base do backend (sem o '/api') para ser usada em outros lugares,
// como na construção de URLs de imagens estáticas que não passam pelo prefixo '/api'.
export const BACKEND_URL = apiUrl;

// Exportamos a instância configurada do Axios para ser usada em toda a aplicação.
export default api;