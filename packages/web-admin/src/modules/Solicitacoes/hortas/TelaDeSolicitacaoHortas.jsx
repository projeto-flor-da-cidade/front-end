// CÓDIGO CORRIGIDO

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api'; 
import { FiCalendar, FiUser, FiSearch, FiEye, FiAlertCircle, FiLoader, FiInbox, FiArrowUp, FiArrowDown } from 'react-icons/fi';

export default function TelaDeSolicitacaoHortas() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  // CORREÇÃO: Chave de ordenação inicial corrigida
  const [sortKey, setSortKey] = useState('dataCriacao'); 
  const [sortDirection, setSortDirection] = useState('descending'); 
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/hortas/solicitacoes/pendentes');
      setRequests(response.data || []);
    } catch (err) {
      console.error("Erro ao buscar solicitações pendentes:", err);
      setError("Não foi possível carregar as solicitações. Tente novamente mais tarde.");
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const filteredAndSortedRequests = requests
    // CORREÇÃO: Filtrar por 'nomeHorta' e 'nomeUsuario'
    .filter(r => 
        (r.nomeHorta && r.nomeHorta.toLowerCase().includes(search.trim().toLowerCase())) ||
        (r.nomeUsuario && r.nomeUsuario.toLowerCase().includes(search.trim().toLowerCase()))
    ) 
    .sort((a, b) => {
      if (!sortKey) return 0;
      let comparison = 0;
      // CORREÇÃO: Ordenar por 'dataCriacao'
      if (sortKey === 'dataCriacao') {
        comparison = new Date(a.dataCriacao) - new Date(b.dataCriacao);
      } else {
        const valA = a[sortKey] ? String(a[sortKey]) : '';
        const valB = b[sortKey] ? String(b[sortKey]) : '';
        comparison = valA.localeCompare(valB);
      }
      return sortDirection === 'ascending' ? comparison : -comparison;
    });

  // CORREÇÃO: Opções de ordenação atualizadas para corresponderem ao DTO
  const sortOptions = [
    { label: 'Data da Solicitação', key: 'dataCriacao' },
    { label: 'Nome da Horta', key: 'nomeHorta' }, 
    { label: 'Nome do Solicitante', key: 'nomeUsuario' },
  ];

  const handleSortKeyChange = (key) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'ascending' ? 'descending' : 'ascending');
    } else {
      setSortKey(key);
      setSortDirection(key === 'dataCriacao' ? 'descending' : 'ascending');
    }
  };

  if (isLoading) { /* ... JSX de Loading ... */ }
  if (error) { /* ... JSX de Error ... */ }

  return (
    <main className="relative flex-1 bg-[#A9AD99] pt-8 sm:pt-12 p-2.5 sm:p-4 md:p-6 min-h-screen font-openSans">
      <div className="mx-auto w-full max-w-7xl bg-[#E6E3DC] rounded-xl p-4 sm:p-6 shadow-xl">
        <div className="mb-6 pb-4 border-b border-gray-300/80">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">
            Solicitações Pendentes
          </h1>
          <p className="text-sm text-gray-600 text-center sm:text-left mt-1">
            Analise e aprove as novas solicitações de hortas.
          </p>
        </div>

        {/* Controles: Busca e Ordenação */}
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-end mb-6">
          <div className="flex-grow">
            <label htmlFor="search-solicitacoes" className="block text-xs font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              <input
                id="search-solicitacoes"
                type="text"
                // CORREÇÃO: Placeholder atualizado
                placeholder="Buscar por nome da horta ou solicitante..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6D9435] focus:border-[#6D9435] shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-end space-x-2">
            <div>
                <label htmlFor="sort-key-select" className="block text-xs font-medium text-gray-700 mb-1">Ordenar por</label>
                <select 
                    id="sort-key-select"
                    value={sortKey} 
                    onChange={(e) => handleSortKeyChange(e.target.value)}
                    className="w-full h-10 px-3 py-0 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6D9435] shadow-sm"
                >
                    {sortOptions.map(opt => (
                        <option key={`select-${opt.key}`} value={opt.key}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
            <button 
                onClick={() => handleSortKeyChange(sortKey)}
                className="flex-shrink-0 h-10 px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-lg flex items-center justify-center gap-1 hover:bg-gray-50 text-sm shadow-sm"
                title={sortDirection === 'ascending' ? "Mudar para Descendente" : "Mudar para Ascendente"}
            >
                {sortDirection === 'ascending' ? <FiArrowUp className="w-4 h-4" /> : <FiArrowDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Lista de Solicitações */}
        {filteredAndSortedRequests.length > 0 ? (
          <div className="space-y-4">
            {/* CORREÇÃO: Usando 'req.idHorta' e os nomes corretos dos campos */}
            {filteredAndSortedRequests.map(req => (
              <article
                key={req.idHorta}
                className="bg-white rounded-lg p-3.5 sm:p-4 shadow-md hover:shadow-lg transition-shadow duration-150 border border-gray-200/80"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0"> 
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 break-words leading-tight" title={req.nomeHorta}>
                        {req.nomeHorta}
                    </h2>
                    <div className="flex flex-col xs:flex-row xs:flex-wrap items-start xs:items-center text-xs text-gray-600 gap-x-3 gap-y-1">
                        <span className="flex items-center">
                          <FiCalendar className="w-3.5 h-3.5 mr-1 text-gray-500 flex-shrink-0" />
                          Data: <strong className="ml-0.5 font-medium text-gray-700">{new Date(req.dataCriacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</strong>
                        </span>
                        <span className="flex items-center">
                          <FiUser className="w-3.5 h-3.5 mr-1 text-gray-500 flex-shrink-0" />
                          Solicitante: <strong className="ml-0.5 font-medium text-gray-700">{req.nomeUsuario}</strong>
                        </span>
                    </div>
                    </div>
                    <button
                        onClick={() => navigate(`/app/tela-de-descricao-de-solicitacao-hortas/${req.idHorta}`, {
                            state: { source: 'solicitacoes' },
                        })}
                        className="w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0 px-4 py-2 bg-[#008000] text-white rounded-md hover:bg-[#015A24] focus:outline-none focus:ring-2 ring-offset-1 focus:ring-[#6D9435] transition-colors font-semibold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5"
                        aria-label={`Visualizar detalhes de ${req.nomeHorta}`}
                    >
                      <FiEye className="w-4 h-4" />
                      Visualizar
                    </button>
                </div>
              </article>
            ))}
          </div>
        ) : (  
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <FiInbox className="w-16 h-16 text-gray-400 mx-auto mb-5" />
                <h3 className="text-xl font-semibold text-gray-700">Nenhuma Solicitação Pendente</h3>
                <p className="text-gray-500 mt-2 text-sm">
                {search ? "Nenhuma solicitação corresponde à sua busca." : "Não há novas solicitações de hortas no momento."}
                </p>
            </div>
        )}
      </div>
    </main>
  );
}