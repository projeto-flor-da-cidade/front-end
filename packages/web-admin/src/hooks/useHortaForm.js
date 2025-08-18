// src/hooks/useHortaForm.js
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // Ajuste o caminho se necessário
import { toast } from 'react-toastify';

/**
 * Hook customizado para carregar todos os dados necessários para o formulário de edição de horta.
 * Ele busca os detalhes da horta a ser editada e as opções para todos os campos de seleção.
 *
 * @param {string} hortaId - O ID da horta a ser editada.
 * @returns {object} Um objeto contendo:
 * - `hortaData` {object|null}: Os dados originais da horta.
 * - `options` {object}: Um objeto com as listas de opções para os dropdowns.
 * - `isLoading` {boolean}: Verdadeiro enquanto os dados iniciais estão sendo carregados.
 * - `error` {string|null}: Mensagem de erro, se houver falha no carregamento.
 * - `refetch` {Function}: Função para recarregar todos os dados.
 */
export function useHortaForm(hortaId) {
  const [hortaData, setHortaData] = useState(null);
  const [options, setOptions] = useState({
    tiposDeHorta: [],
    usuarios: [],
    unidadesEnsino: [],
    areasClassificacao: [],
    atividadesProdutivas: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!hortaId) {
      setError("ID da horta não fornecido.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Define todas as promises que precisam ser resolvidas
      const promises = [
        api.get(`/hortas/${hortaId}`),
        api.get('/tipos-horta'),
        api.get('/usuarios'),
        api.get('/unidades-ensino'),
        api.get('/areas-classificacao'),
        api.get('/atividades-produtivas'),
      ];

      // Executa todas as buscas em paralelo para otimizar o tempo de carregamento
      const [
        hortaRes,
        tiposRes,
        usuariosRes,
        unidadesRes,
        areasRes,
        atividadesRes,
      ] = await Promise.all(promises);

      // Atualiza os estados com os dados recebidos
      setHortaData(hortaRes.data);
      setOptions({
        tiposDeHorta: tiposRes.data || [],
        usuarios: usuariosRes.data || [],
        unidadesEnsino: unidadesRes.data || [],
        areasClassificacao: areasRes.data || [],
        atividadesProdutivas: atividadesRes.data || [],
      });

    } catch (err) {
      console.error("Erro ao carregar dados para o formulário da horta:", err);
      setError('Não foi possível carregar os dados necessários para a edição.');
      toast.error("Falha ao carregar dados. Tente recarregar a página.");
    } finally {
      setIsLoading(false);
    }
  }, [hortaId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { hortaData, options, isLoading, error, refetch: fetchData };
}