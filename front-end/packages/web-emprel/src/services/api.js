// Caminho do Arquivo: src/services/api.js

import axios from 'axios';

// Defina a constante
export const BACKEND_URL = 'http://localhost:8082'; // Ou a porta/URL correta do seu backend

// Crie a instância do axios
const api = axios.create({
  baseURL: `${BACKEND_URL}/api`, // Agora usa a constante exportada
  timeout: 10000, // Aumentei um pouco o timeout para chamadas de geocodificação, se necessário
});

// Exporte a instância do axios como padrão
export default api;

// A exportação nomeada de BACKEND_URL já foi feita na linha onde ela é declarada (com 'export const')
// Alternativamente, poderia ser:
// export { BACKEND_URL }; // se BACKEND_URL fosse declarada sem 'export' inicialmente.