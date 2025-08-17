import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api'; 
import Header from '../../Home/components/Header'; 
import { 
  FiSearch, FiChevronDown, FiEdit3, FiLoader, FiAlertCircle, 
  FiCheckCircle, FiXCircle, FiEye, FiFilter, FiInbox, FiClock,
  FiChevronLeft, FiChevronRight, FiArrowUp, FiArrowDown,
  FiMapPin
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ALL_STATUS_OPTIONS = [
  { value: 'ATIVA', label: 'Ativa', icon: <FiCheckCircle className="mr-2" />, colorClass: 'text-green-800 bg-green-100', ringClass: 'focus:ring-green-500', hoverClass: 'hover:bg-green-200' },
  { value: 'INATIVA', label: 'Inativa', icon: <FiXCircle className="mr-2" />, colorClass: 'text-red-800 bg-red-100', ringClass: 'focus:ring-red-500', hoverClass: 'hover:bg-red-200' },
  { value: 'PENDENTE', label: 'Pendente', icon: <FiClock className="mr-2" />, colorClass: 'text-yellow-800 bg-yellow-100', ringClass: 'focus:ring-yellow-500', hoverClass: 'hover:bg-yellow-200' },
  { value: 'VISITA_AGENDADA', label: 'Visita Agendada', icon: <FiClock className="mr-2" />, colorClass: 'text-blue-800 bg-blue-100', ringClass: 'focus:ring-blue-500', hoverClass: 'hover:bg-blue-200' },
];

const CHANGEABLE_STATUS_OPTIONS_FOR_MANAGEMENT = ALL_STATUS_OPTIONS.filter(opt => opt.value !== 'PENDENTE');

const getStatusDisplayProps = (statusValue) => {
  const option = ALL_STATUS_OPTIONS.find(opt => opt.value === statusValue);
  if (option) {
    return {
      label: option.label,
      icon: React.cloneElement(option.icon, { className: 'mr-1 h-3.5 w-3.5 xs:mr-1.5 xs:h-4 xs:w-4 flex-shrink-0' }), 
      className: `px-2 py-0.5 text-[10px] xs:text-xs leading-5 font-semibold rounded-full ${option.colorClass} inline-flex items-center`
    };
  }
  return {
    label: statusValue || 'Desconhecido',
    icon: null,
    className: 'px-2 py-0.5 text-[10px] xs:text-xs leading-5 font-semibold rounded-full bg-[#E6E3DC] text-gray-900 inline-flex items-center'
  };
};

export default function TelaGerenciamentoHortas() {
  const navigate = useNavigate();
  const [allFetchedHortas, setAllFetchedHortas] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'nomeHorta', direction: 'ascending' });
  const [activeItemDropdownId, setActiveItemDropdownId] = useState(null); 
  const itemDropdownRef = useRef(null); 
  const [statusFilter, setStatusFilter] = useState('TODOS'); 

  const fetchAllManageableHortas = useCallback(async () => {
    const manageableStatusesForFetch = ['ATIVA', 'INATIVA', 'VISITA_AGENDADA'];
    setIsLoading(true);
    setError(null);
    let combinedHortas = [];
    let fetchError = null;
    try {
      const promises = manageableStatusesForFetch.map(status => 
        api.get(`/hortas/status/${status.toUpperCase()}`)
          .then(response => response.data || [])
          .catch(err => {
            console.error(`Erro ao buscar hortas ${status}:`, err);
            if (!fetchError) fetchError = `Falha ao carregar dados para o status ${status}.`;
            return []; 
          })
      );
      const results = await Promise.all(promises);
      results.forEach(hortasList => combinedHortas = combinedHortas.concat(hortasList));
      const uniqueHortas = Array.from(new Set(combinedHortas.map(a => a.id)))
                            .map(id => combinedHortas.find(a => a.id === id));
      setAllFetchedHortas(uniqueHortas);
      if (fetchError) setError(fetchError); 
    } catch (generalError) { 
      console.error(`Erro geral ao buscar todas as hortas gerenciáveis:`, generalError);
      setError("Ocorreu um erro inesperado ao carregar os dados das hortas.");
      setAllFetchedHortas([]);
    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => { fetchAllManageableHortas(); }, [fetchAllManageableHortas]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(event.target)) {
        setActiveItemDropdownId(null);
      }
    };
    if (activeItemDropdownId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeItemDropdownId]);

  const handleStatusChange = async (hortaId, newStatusValue) => { 
    const hortaToUpdate = allFetchedHortas.find(h => h.id === hortaId);
    if (!hortaToUpdate) return;
    const originalStatus = hortaToUpdate.status;
    setActiveItemDropdownId(null); 
    setAllFetchedHortas(prevHortas =>
      prevHortas.map(h => (h.id === hortaId ? { ...h, status: newStatusValue } : h))
    );
    try {
      await api.patch(`/hortas/${hortaId}/status?status=${newStatusValue}`); 
      const newStatusLabel = ALL_STATUS_OPTIONS.find(s => s.value === newStatusValue)?.label || newStatusValue;
      toast.success(<span>Status da horta <strong>{hortaToUpdate.nomeHorta}</strong> atualizado para <strong>{newStatusLabel}</strong>!</span>);
    } catch (err) {
      console.error("Erro ao alterar status da horta:", err);
      toast.error(<span>Falha ao atualizar status da horta <strong>{hortaToUpdate.nomeHorta}</strong>.</span>);
      setAllFetchedHortas(prevHortas =>
        prevHortas.map(h => (h.id === hortaId ? { ...h, status: originalStatus } : h))
      );
    }
  };
  
  const [expandedId, setExpandedId] = useState(null);
  const toggleExpand = useCallback((id) => { 
    setExpandedId(currentId => (currentId === id ? null : id));
  }, []);

  const filteredHortas = allFetchedHortas.filter(horta => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        (horta.nomeHorta || '').toLowerCase().includes(searchLower) || 
        (horta.endereco || '').toLowerCase().includes(searchLower) ||
        (horta.proprietario || '').toLowerCase().includes(searchLower) ||
        (horta.status || '').toLowerCase().includes(searchLower);

      if (statusFilter === 'TODOS') return matchesSearch;
      if (statusFilter === 'ATIVOS') return matchesSearch && horta.status === 'ATIVA';
      if (statusFilter === 'INATIVOS') return matchesSearch && horta.status === 'INATIVA';
      if (statusFilter === 'VISITA_AGENDADA') return matchesSearch && horta.status === 'VISITA_AGENDADA';
      return false;
    }
  );

  const sortedHortas = [...filteredHortas].sort((a, b) => { 
    if (sortConfig.key === null || a[sortConfig.key] === undefined || b[sortConfig.key] === undefined) return 0;
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];
    if (sortConfig.key === 'status') {
      valA = ALL_STATUS_OPTIONS.findIndex(opt => opt.value === valA);
      valB = ALL_STATUS_OPTIONS.findIndex(opt => opt.value === valB);
    } else if (['dataInicio', 'dataFim', 'dataInscInicio', 'dataInscFim'].includes(sortConfig.key) ) {
        valA = new Date(valA);
        valB = new Date(valB);
    } else {
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
    }
    if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => { 
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      setSortConfig({ key: 'nomeHorta', direction: 'ascending' }); 
      return;
    }
    setSortConfig({ key, direction });
  };

  const sortOptions = [ 
    { label: 'Nome da Horta', key: 'nomeHorta' },
    { label: 'Proprietário', key: 'proprietario' },
    { label: 'Endereço', key: 'endereco' },
    { label: 'Status', key: 'status' },
    { label: 'Tipo', key: 'tipo' }, 
    { label: 'Data Início', key: 'dataInicio'}
  ];

  // JSX para Loading e Error
  if (isLoading) { 
    return (
      <div className="flex flex-col min-h-screen bg-[#A9AD99]">
        <Header title="Gerenciamento de Hortas" />
        <div className="flex-grow flex flex-col items-center justify-center text-center p-10">
          <FiLoader className="w-12 h-12 text-white animate-spin mb-4" />
          <p className="font-poppins text-lg text-white">Carregando hortas...</p>
          <p className="font-poppins text-sm text-[#E6E3DC]">Por favor, aguarde.</p>
        </div>
      </div>
    );
  }
  if (error && allFetchedHortas.length === 0 && !isLoading) { 
    return (
      <div className="flex flex-col min-h-screen bg-[#A9AD99]">
        <Header title="Gerenciamento de Hortas" />
        <div className="flex-grow flex flex-col items-center justify-center text-center p-6 m-4 sm:m-6 bg-[#E6E3DC] rounded-xl shadow-xl">
          <FiAlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="font-poppins text-lg font-semibold text-red-700">Erro ao Carregar</p>
          <p className="font-poppins text-sm text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchAllManageableHortas}
            className="mt-6 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#A9AD99] font-poppins">
      <Header title="Gerenciamento de Hortas" />
      <ToastContainer position="bottom-right" autoClose={3500} theme="colored" />
      
      <main className="container mx-auto p-3 sm:p-4 md:p-6 pt-4 sm:pt-6">
        <header className="mb-6 p-4 sm:p-5 bg-[#E6E3DC] rounded-xl shadow-lg">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gerenciamento de Hortas</h1>
            <p className="text-xs sm:text-sm text-gray-800 mt-1">Visualize e gerencie o status das hortas (Ativas, Inativas, Visitas Agendadas).</p>
        </header>

        <section className="mb-6 p-4 bg-[#E6E3DC] rounded-xl shadow-lg">
          <div className="space-y-4"> 
            <div className="relative">
              <label htmlFor="search-hortas" className="sr-only">Buscar hortas</label>
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
              <input
                id="search-hortas" type="text" placeholder="Buscar por nome, endereço, proprietário ou status..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-green-600 bg-[#E6E3DC] text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="w-full">
                <label htmlFor="status-filter" className="block text-xs font-medium text-gray-900 mb-0.5">Filtrar Status:</label>
                <select
                  id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-[#E6E3DC] text-sm focus:ring-1 focus:ring-green-600 text-gray-900"
                >
                  <option value="TODOS">Todos</option>
                  <option value="ATIVOS">Somente Ativos</option>
                  <option value="INATIVOS">Somente Inativos</option>
                  <option value="VISITA_AGENDADA">Visita Agendada</option>
                </select>
              </div>

              <div className="w-full">
                <label htmlFor="sort-by" className="block text-xs font-medium text-gray-900 mb-0.5">Ordenar por:</label>
                <select
                  id="sort-by" value={sortConfig.key} onChange={(e) => requestSort(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-[#E6E3DC] text-sm focus:ring-1 focus:ring-green-600 text-gray-900"
                >
                  {sortOptions.map(option => (
                      <option key={option.key} value={option.key}>{option.label}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => requestSort(sortConfig.key)}
                className="w-full sm:w-auto h-10 px-3 bg-[#E6E3DC] text-gray-800 border border-gray-300 rounded-lg flex items-center justify-center gap-1 hover:bg-[#e0dbcf] text-sm"
                title={sortConfig.direction === 'ascending' ? "Mudar para Descendente" : "Mudar para Ascendente"}
              >
                {sortConfig.direction === 'ascending' ? <FiArrowUp className="w-4 h-4" /> : <FiArrowDown className="w-4 h-4" />}
                <span className="sm:hidden">
                  {sortConfig.direction === 'ascending' ? 'Cresc.' : 'Decresc.'}
                </span>
                <span className="hidden sm:inline">
                  {sortConfig.direction === 'ascending' ? 'Crescente' : 'Decrescente'}
                </span>
              </button>
            </div>
          </div>
        </section>

        {!isLoading && sortedHortas.length > 0 ? (
          <section className="space-y-3">
            {sortedHortas.map((horta) => { 
              const currentStatusDisplay = getStatusDisplayProps(horta.status);
              return (
                <div key={horta.id} className="bg-[#E6E3DC] rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-300">
                  <div 
                    className="flex flex-col xs:flex-row items-start xs:items-center justify-between px-3 py-3 sm:px-4 cursor-pointer hover:bg-[#E0DBCF] rounded-t-lg"
                    onClick={() => toggleExpand(horta.id)}
                  >
                    <div className="flex-1 min-w-0 mb-2 xs:mb-0 xs:mr-2">
                      <h2 className="text-sm sm:text-base font-semibold text-green-800 truncate" title={horta.nomeHorta}>{horta.nomeHorta}</h2>
                      <p className="text-[11px] xs:text-xs text-gray-700 truncate" title={horta.endereco}>
                        <FiMapPin className="inline w-3 h-3 mr-1 text-gray-700" />{horta.endereco}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0 self-start xs:self-center">
                      <div className={currentStatusDisplay.className} title={`Status: ${currentStatusDisplay.label}`}>
                        {currentStatusDisplay.icon}
                        <span className="hidden xs:inline">{currentStatusDisplay.label}</span>
                      </div>
                      <FiChevronDown className={`w-4 h-4 text-gray-700 transform transition-transform ${expandedId === horta.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {expandedId === horta.id && (
                    <div className="border-t px-3 pt-2 pb-3 sm:px-4 bg-[#E6E3DC] rounded-b-lg space-y-2 text-xs text-gray-800">
                       <p><strong className="font-medium">Proprietário:</strong> {horta.proprietario}</p>
                       <p><strong className="font-medium">Tipo da Horta:</strong> {horta.tipo || 'N/A'}</p>
                      
                      <div className="pt-2 border-t border-gray-300 flex flex-row items-center justify-end gap-2 mt-2">
                        <div ref={el => itemDropdownRef.current = el} className="relative">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveItemDropdownId(activeItemDropdownId === horta.id ? null : horta.id); }}
                            className="inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-2.5 py-1 bg-[#E6E3DC] text-[10px] xs:text-xs font-medium text-gray-900 hover:bg-[#e0dbcf]"
                          >
                            Mudar Status <FiChevronDown className="ml-1 h-3.5 w-3.5" />
                          </button>
                          {activeItemDropdownId === horta.id && (
                            <div className="origin-top-right absolute right-0 mt-1 w-44 rounded-md shadow-lg bg-[#E6E3DC] ring-1 ring-black ring-opacity-5 z-10">
                              <div className="py-0.5">
                                {CHANGEABLE_STATUS_OPTIONS_FOR_MANAGEMENT.filter(opt => opt.value !== horta.status).map(option => (
                                  <button
                                    key={option.value}
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(horta.id, option.value); }}
                                    className={`group flex items-center w-full px-2.5 py-1.5 text-[10px] xs:text-xs text-left text-gray-800 ${option.hoverClass}`}
                                  >
                                    {React.cloneElement(option.icon, { className: 'mr-1.5 h-3.5 w-3.5' })}
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Botão Editar*/}
                        <Link 
                          to={`/app/hortas-editar/${horta.id}`} 
                          onClick={(e) => e.stopPropagation()} 
                          className="flex items-center justify-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs font-medium"
                        > 
                          <FiEdit3 className="w-3 h-3" /> 
                          <span className="hidden xs:inline">Editar</span> 
                        </Link>
                        
                        {/* Botão Visualizar*/}
                           <button 
                          onClick={(e) => { e.stopPropagation(); console.log("Visualizar horta:", horta.id); }} 
                          // no futuro, basta trocar por: navigate(`/app/hortas/visualizar/${horta.id}`)
                          className="flex items-center justify-center gap-1 px-2 py-1 bg-green-800 text-white rounded-md hover:bg-green-900 text-xs font-medium"
                        > 
                          <FiEye className="w-3 h-3" /> 
                          <span className="hidden xs:inline">Ver</span> 
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        ) : (!isLoading && 
            <div className="text-center py-16 bg-[#E6E3DC] rounded-xl shadow-lg">
                <FiInbox className="w-16 h-16 text-gray-700 mx-auto mb-5" />
                <h3 className="text-xl font-semibold text-gray-800">Nenhuma Horta Encontrada</h3>
                <p className="text-gray-800 mt-2 text-sm">
                {searchQuery ? "Nenhuma horta corresponde à sua busca." : "Não há hortas para exibir com os filtros atuais."}
                </p>
            </div>
        )}

        {!isLoading && sortedHortas.length > 0 && ( 
            <footer className="mt-8 sm:mt-10 flex justify-center items-center space-x-1 sm:space-x-2 p-4 bg-[#E6E3DC] rounded-xl shadow-lg">
                <button className="p-2 rounded-full hover:bg-[#e0dbcf] text-gray-700 disabled:opacity-50 cursor-not-allowed" disabled>
                    <FiChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold text-green-800 px-3.5 py-1.5 bg-green-100 rounded-md">1</span>
                <button className="p-2 rounded-full hover:bg-[#e0dbcf] text-gray-700 disabled:opacity-50 cursor-not-allowed" disabled>
                     <FiChevronRight className="w-5 h-5" />
                </button>
            </footer>
        )}
      </main>
    </div>
  );
}