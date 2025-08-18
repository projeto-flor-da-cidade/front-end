// src/hooks/useManageableHortas.js
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook customizado para buscar todas as hortas gerenciáveis (Ativas, Inativas, Visita Agendada).
 * Encapsula a lógica de múltiplas chamadas paralelas com Promise.all.
 *
 * @returns {object} Um objeto contendo:
 * - `hortas` {Array}: A lista combinada e única de hortas gerenciáveis.
 * - `isLoading` {boolean}: Verdadeiro enquanto a busca está em andamento.
 * - `error` {string|null}: Uma mensagem de erro, caso ocorra uma falha.
 * - `refetch` {Function}: Uma função para re-executar a busca de dados.
 * - `setHortas` {Function}: Uma função para atualizar o estado das hortas manualmente (ex: após uma edição).
 */
export function useManageableHortas() {
  const [hortas, setHortas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHortas = useCallback(async () => {
    const manageableStatuses = ['ATIVA', 'INATIVA', 'VISITA_AGENDADA'];
    setIsLoading(true);
    setError(null);
    
    try {
      // Cria um array de promises, uma para cada status
      const promises = manageableStatuses.map(status =>
        api.get(`/hortas/status/${status.toUpperCase()}`)
          .then(response => response.data || [])
          .catch(err => {
            console.error(`Erro ao buscar hortas com status ${status}:`, err);
            // Retorna um array vazio para não quebrar o Promise.all
            return [];
          })
      );

      // Executa todas as promises em paralelo
      const results = await Promise.all(promises);

      // Concatena todos os arrays de resultados em um único array
      const combinedHortas = [].concat(...results);
      
      // Remove duplicatas caso a API retorne a mesma horta em diferentes chamadas
      const uniqueHortas = Array.from(new Map(combinedHortas.map(item => [item.id, item])).values());

      setHortas(uniqueHortas);

    } catch (generalError) {
      console.error(`Erro geral ao buscar hortas gerenciáveis:`, generalError);
      setError("Ocorreu um erro inesperado ao carregar os dados das hortas.");
      setHortas([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHortas();
  }, [fetchHortas]);

  return { hortas, isLoading, error, refetch: fetchHortas, setHortas };
}