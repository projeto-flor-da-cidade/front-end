import { useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // Certifique-se que o caminho para seu serviço de API está correto

/**
 * Hook customizado para buscar e gerenciar a lista de solicitações de hortas pendentes.
 * Ele abstrai a lógica de fetching de dados, tratamento de loading e erros.
 *
 * @returns {object} Um objeto contendo:
 * - `requests` {Array}: A lista de solicitações pendentes.
 * - `isLoading` {boolean}: Verdadeiro enquanto a busca está em andamento.
 * - `error` {string|null}: Uma mensagem de erro, caso ocorra uma falha.
 * - `refetch` {Function}: Uma função para re-executar a busca de dados manualmente.
 */
export function usePendingHortas() {
  // --- Estados Internos do Hook ---
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Função de Fetching de Dados ---
  // Usamos useCallback para memoizar a função, evitando que ela seja recriada
  // a cada renderização do componente que usar o hook.
  const fetchPendingRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Reseta o estado de erro antes de uma nova tentativa

    try {
      const response = await api.get('/hortas/solicitacoes/pendentes');
      // Garante que sempre teremos um array, mesmo que a API retorne null/undefined
      setRequests(response.data || []);
    } catch (err) {
      console.error("Erro ao buscar solicitações pendentes:", err);
      setError("Não foi possível carregar as solicitações. Tente novamente mais tarde.");
      setRequests([]); // Limpa os dados em caso de erro
    } finally {
      // Garante que o estado de loading seja desativado ao final,
      // independentemente de sucesso ou falha.
      setIsLoading(false);
    }
  }, []); // O array de dependências vazio significa que a função nunca muda.

  // --- Efeito para Executar a Busca ---
  // Este useEffect executa a função de busca assim que o hook é utilizado
  // pela primeira vez em um componente.
  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]); // A dependência é a função memoizada.

  // --- Retorno do Hook (Sua "API Pública") ---
  // Expomos os estados e a função de refetch para que o componente
  // possa consumi-los.
  return {
    requests,
    isLoading,
    error,
    refetch: fetchPendingRequests,
  };
}