import axios from 'axios';

/**
 * ARQUITETURA:
 * Este arquivo cria e exporta uma instância única do Axios pré-configurada.
 * Centralizar a configuração da API em um único lugar é uma prática fundamental
 * para a manutenibilidade e escalabilidade do front-end.
 */

// 1. Lê a variável de ambiente do arquivo .env.
//    O TypeScript saberá o tipo desta variável graças ao arquivo `vite-env.d.ts`.
//    Se a variável não for encontrada, ele usa 'http://localhost:8080' como um fallback seguro para o ambiente de desenvolvimento.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

// 2. Cria a instância do Axios.
const api = axios.create({
  /**
   * Define a URL base para todas as requisições feitas por esta instância.
   * Agora, ao fazer uma chamada como `api.get('/hortas')`, o Axios fará a requisição
   * para `http://localhost:8080/api/hortas`.
   */
  baseURL: `${API_BASE_URL}/api`,

  /**
   * Define um timeout global de 10 segundos. Se uma requisição demorar mais do que isso,
   * ela será cancelada e retornará um erro, evitando que o usuário fique esperando indefinidamente.
   */
  timeout: 10000,
});

/**
 * ARQUITETURA:
 * Note que não exportamos mais a URL base (`getApiBaseUrl`).
 * O front-end não deve ter a responsabilidade de construir URLs de recursos (como imagens).
 * A API REST deve fornecer URLs completas e prontas para uso (ex: no campo 'imagemUrl'),
 * desacoplando o cliente da estrutura de arquivos do servidor. Isso torna o sistema mais robusto.
 */

export default api;