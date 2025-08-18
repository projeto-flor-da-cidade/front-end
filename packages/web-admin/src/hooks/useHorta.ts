import { useState, useEffect, useCallback } from 'react';
import api from '../services/api'; 
import { toast } from 'react-toastify';

// Importamos nossa definição de tipo!
import { Horta } from '../types';

export function useHorta(hortaId: string | undefined) { // Tipamos o parâmetro de entrada
  // Tipamos o estado. Ele pode ser um objeto Horta ou null (seu estado inicial).
  const [horta, setHorta] = useState<Horta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHortaDetails = useCallback(async () => {
    if (!hortaId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      // Dizemos ao 'api.get' que esperamos uma resposta no formato da interface Horta.
      const response = await api.get<Horta>(`/hortas/${hortaId}`);
      setHorta(response.data);
    } catch (err) {
      setError("Não foi possível carregar os detalhes da horta.");
      toast.error("Falha ao carregar detalhes. Verifique o ID e sua conexão.");
    } finally {
      setIsLoading(false);
    }
  }, [hortaId]);

  useEffect(() => {
    fetchHortaDetails();
  }, [fetchHortaDetails]);

  // O retorno do hook agora tem tipos inferidos automaticamente!
  return { horta, isLoading, error, setHorta };
}