import React, { useState, useMemo } from 'react'; // useEffect e useCallback foram removidos daqui
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiTag, FiSearch, FiEye, FiAlertCircle, FiLoader, FiInbox, FiArrowUp, FiArrowDown } from 'react-icons/fi';

// 1. A LÓGICA DE BUSCA É IMPORTADA DO NOSSO HOOK CUSTOMIZADO
import { usePendingHortas } from '../../../hooks/usePendingHortas';

export default function TelaDeSolicitacaoHortas() {
  const navigate = useNavigate();

  // --- RESPONSABILIDADE #1: Gerenciar o estado da UI (filtros e ordenação) ---
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('date');
  const [sortDirection, setSortDirection] = useState('descending');

  // --- LÓGICA DE DADOS: Delegada ao hook ---
  // Uma única linha substitui toda a lógica de useState, useEffect e useCallback para o fetch.
  const { requests, isLoading, error, refetch: fetchPendingRequests } = usePendingHortas();

  // --- RESPONSABILIDADE #2: Lógica de apresentação (filtrar e ordenar os dados recebidos) ---
  const filteredAndSortedRequests = useMemo(() =>
    requests
      .filter(r => r.title && r.title.toLowerCase().includes(search.trim().toLowerCase()))
      .sort((a, b) => {
        if (!sortKey) return 0;
        let comparison = 0;
        if (sortKey === 'date') {
          comparison = new Date(a.date) - new Date(b.date);
        } else {
          const valA = a[sortKey] !== undefined && a[sortKey] !== null ? String(a[sortKey]) : '';
          const valB = b[sortKey] !== undefined && b[sortKey] !== null ? String(b[sortKey]) : '';
          comparison = valA.localeCompare(valB);
        }
        return sortDirection === 'ascending' ? comparison : -comparison;
      }),
    [requests, search, sortKey, sortDirection]
  );

  const sortOptions = [
    { label: 'Data', key: 'date' },
    { label: 'Título', key: 'title' }, 
    { label: 'Tipo', key: 'type' },
  ];

  // --- RESPONSABILIDADE #3: Manipuladores de eventos da UI ---
  const handleSortKeyChange = (key) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'ascending' ? 'descending' : 'ascending');
    } else {
      setSortKey(key);
      setSortDirection(key === 'date' ? 'descending' : 'ascending');
    }
  };

  // --- RESPONSABILIDADE #4: Renderizar o JSX com base nos estados ---
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#A9AD99]">
        <div className="flex-grow flex flex-col items-center justify-center text-center p-10">
          <FiLoader className="w-12 h-12 text-white animate-spin mb-4" />
          <p className="font-openSans text-lg text-white">Carregando solicitações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#A9AD99]">
        <div className="flex-grow flex flex-col items-center justify-center text-center p-6 m-4 bg-[#E6E3DC] rounded-xl shadow-xl">
          <FiAlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="font-openSans text-lg font-semibold text-red-700">Erro ao Carregar</p>
          <p className="font-openSans text-sm text-red-600 mt-1">{error}</p>
          {/* O botão "Tentar Novamente" agora usa a função 'refetch' retornada pelo hook */}
          <button onClick={fetchPendingRequests} className="mt-6 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

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

        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-end mb-6">
          <div className="flex-grow">
            <label htmlFor="search-solicitacoes" className="block text-xs font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              <input
                id="search-solicitacoes" type="text" placeholder="Buscar por título..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6D9435] focus:border-[#6D9435] shadow-sm"
              />
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <div className="flex-grow">
              <label htmlFor="sort-key-select" className="block text-xs font-medium text-gray-700 mb-1">Ordenar por</label>
              <select 
                id="sort-key-select" value={sortKey} onChange={(e) => handleSortKeyChange(e.target.value)}
                className="w-full h-10 px-3 py-0 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#6D9435] shadow-sm"
              >
                {sortOptions.map(opt => (<option key={`select-${opt.key}`} value={opt.key}>{opt.label}</option>))}
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

        {filteredAndSortedRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedRequests.map(req => (
              <article key={req.id} className="bg-white rounded-lg p-3.5 sm:p-4 shadow-md hover:shadow-lg transition-shadow duration-150 border border-gray-200/80">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0"> 
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 break-words leading-tight" title={req.title}>
                      {req.title}
                    </h2>
                    <div className="flex flex-col xs:flex-row xs:flex-wrap items-start xs:items-center text-xs text-gray-600 gap-x-3 gap-y-1">
                      <span className="flex items-center">
                        <FiCalendar className="w-3.5 h-3.5 mr-1 text-gray-500 flex-shrink-0" />
                        Data: <strong className="ml-0.5 font-medium text-gray-700">{new Date(req.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</strong>
                      </span>
                      <span className="flex items-center">
                        <FiTag className="w-3.5 h-3.5 mr-1 text-gray-500 flex-shrink-0" />
                        Tipo: <strong className="ml-0.5 font-medium text-gray-700">{req.type}</strong>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/app/tela-de-descricao-de-solicitacao-hortas/${req.id}`, { state: { source: 'solicitacoes' } })}
                    className="w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0 px-4 py-2 bg-[#008000] text-white rounded-md hover:bg-[#015A24] focus:outline-none focus:ring-2 ring-offset-1 focus:ring-[#6D9435] transition-colors font-semibold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5"
                    aria-label={`Visualizar detalhes de ${req.title}`}
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