import axios from 'axios';

/**
 * ARQUITETURA:
 * Este arquivo cria e exporta uma instância única do Axios pré-configurada
 * e a URL base da API para ser usada em toda a aplicação.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

// ======================= INÍCIO DA CORREÇÃO =======================
/**
 * Exporta a URL base do backend (ex: http://localhost:8082) de forma nomeada.
 * Isso permite que outros componentes, como a Home, a importem para construir
 * URLs de recursos estáticos (imagens, etc.) de forma correta e centralizada.
 */
export const BACKEND_URL = API_BASE_URL;
// ======================== FIM DA CORREÇÃO =========================

export default api;