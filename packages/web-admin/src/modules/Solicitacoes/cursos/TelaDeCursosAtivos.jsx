// Caminho do Arquivo: seu-projeto-frontend/src/pages/TelaDeCursosAtivos.jsx

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api'; 

import Header from '../../Home/components/Header'; 
import { 
  FiSearch, FiChevronDown, FiEdit3, FiLoader, FiAlertCircle, 
  FiCheckCircle, FiXCircle, FiEye, FiFilter, FiInbox,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';     

// --- Utilitários ---
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateString;
  }
};

// --- Constantes de Status ---
const STATUS_CONFIG = {
  true: { label: 'Ativo', icon: FiCheckCircle, colorClass: 'text-green-700 bg-green-100', hoverClass: 'hover:bg-green-200' },
  false: { label: 'Inativo', icon: FiXCircle, colorClass: 'text-red-700 bg-red-100', hoverClass: 'hover:bg-red-200' },
};

const getStatusDisplayProps = (isAtivo) => {
  const config = STATUS_CONFIG[isAtivo] || { label: 'Desconhecido', icon: FiAlertCircle, colorClass: 'text-[#4a4b42] bg-[#d1cec6]' };
  return {
    label: config.label,
    Icon: config.icon, 
    className: `px-2.5 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${config.colorClass}`
  };
};

export default function TelaDeCursosAtivos() {
  const navigate = useNavigate();
  const [allCursos, setAllCursos] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('Data'); 
  const [statusFilter, setStatusFilter] = useState('TODOS'); 
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const dropdownRefs = useRef({}); 

  const fetchAllCursos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/cursos');
      setAllCursos(response.data || []);
    } catch (err) {
      setError('Não foi possível carregar os cursos. Verifique sua conexão e tente novamente.');
      toast.error('Falha ao carregar cursos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCursos();
  }, [fetchAllCursos]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdownId && dropdownRefs.current[activeDropdownId] && !dropdownRefs.current[activeDropdownId].contains(event.target)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdownId]);

  const handleStatusChange = useCallback(async (curso, newStatusBool) => {
    setActiveDropdownId(null); 
    const originalCursos = [...allCursos];
    
    const updatedCursosOptimistic = allCursos.map(c => 
      c.idCurso === curso.idCurso ? { ...c, ativo: newStatusBool } : c
    );
    setAllCursos(updatedCursosOptimistic);

    const cursoToUpdateBackend = { 
      ...curso, 
      ativo: newStatusBool,
      dataInicio: curso.dataInicio?.split('T')[0] || null,
      dataFim: curso.dataFim?.split('T')[0] || null,
      dataInscInicio: curso.dataInscInicio?.split('T')[0] || null,
      dataInscFim: curso.dataInscFim?.split('T')[0] || null,
    };
    
    const formData = new FormData();
    formData.append('curso', new Blob([JSON.stringify(cursoToUpdateBackend)], { type: 'application/json' }));
    
    try {
      await api.put(`/cursos/${curso.idCurso}`, formData);
      toast.success(`Status de "${curso.nome}" atualizado para ${newStatusBool ? 'Ativo' : 'Inativo'}!`);
    } catch (err) {
      toast.error(`Falha ao atualizar status de "${curso.nome}".`);
      setAllCursos(originalCursos); 
    }
  }, [allCursos]);

  const filteredAndSortedCursos = useMemo(() => 
    allCursos
      .filter(c => {
        const searchLower = search.toLowerCase();
        const matchesSearch = c.nome.toLowerCase().includes(searchLower);

        if (statusFilter === 'TODOS') return matchesSearch;
        return matchesSearch && String(c.ativo) === statusFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'Nome') return a.nome.localeCompare(b.nome);
        if (sortBy === 'Status') return (b.ativo === a.ativo) ? 0 : b.ativo ? -1 : 1; 
        if (sortBy === 'Data') return new Date(b.dataInicio) - new Date(a.dataInicio);
        return 0;
      })
  , [allCursos, search, statusFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#A9AD99] font-poppins">
        <Header title="Gerenciamento de Cursos" />
        <div className="flex flex-1 items-center justify-center text-center p-10">
          <FiLoader className="w-12 h-12 text-gray-600 animate-spin mr-4" />
          <div>
            <p className="text-xl font-semibold text-[#2d2e26]">Carregando Cursos...</p>
            <p className="text-sm text-[#4a4b42]">Por favor, aguarde.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && allCursos.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#A9AD99] font-poppins">
        <Header title="Gerenciamento de Cursos" />
        <div className="flex flex-1 items-center justify-center text-center p-6 m-6 bg-[#E6E3DC] rounded-xl shadow-lg">
          <div className="flex flex-col items-center">
            <FiAlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-xl font-semibold text-red-700">Erro ao Carregar Cursos</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchAllCursos}
              className="mt-6 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#A9AD99] font-poppins">
      <Header title="Gerenciamento de Cursos" />
      <ToastContainer position="bottom-right" autoClose={3500} theme="colored" />
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 pt-6 sm:pt-8">
        <header className="mb-6 sm:mb-8 p-5 sm:p-6 bg-[#E6E3DC] rounded-xl shadow-lg">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2d2e26]">Gerenciamento de Cursos</h1>
            <p className="text-sm text-[#4a4b42] mt-1">Visualize e gerencie todos os cursos registrados no sistema.</p>
        </header>

        <section className="mb-6 sm:mb-8 p-5 bg-[#E6E3DC] rounded-xl shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-grow lg:max-w-md">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6c61]" />
              <input 
                type="text" 
                placeholder="Buscar por nome..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="w-full h-11 pl-10 pr-4 border border-[#b8b5ad] rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 bg-[#f2f0e9] text-[#2d2e26]" 
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <FiFilter className="text-[#4a4b42] w-5 h-5" />
                <label htmlFor="status-filter" className="text-sm font-medium text-[#4a4b42]">Status:</label>
                <select 
                  id="status-filter" 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)} 
                  className="h-11 border border-[#b8b5ad] rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 bg-[#f2f0e9] text-[#2d2e26]"
                >
                  <option value="TODOS">Todos</option>
                  <option value="true">Somente Ativos</option>
                  <option value="false">Somente Inativos</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {filteredAndSortedCursos.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedCursos.map(curso => {
              const { label, Icon, className } = getStatusDisplayProps(curso.ativo);
              const oppositeStatus = curso.ativo ? STATUS_CONFIG.false : STATUS_CONFIG.true;
              
              return (
                <div key={curso.idCurso} className="bg-[#E6E3DC] border border-[#b8b5ad] rounded-xl shadow-md transition-shadow hover:shadow-lg">
                  <div className="flex justify-between items-center text-left p-4 cursor-pointer" onClick={() => navigate(`/app/tela-de-inscritos/${curso.idCurso}`)}>
                    <div className="flex-grow pr-4">
                      <h2 className="text-lg font-semibold text-[#2d2e26]">{curso.nome}</h2>
                      <p className="text-xs text-[#4a4b42]">{formatDate(curso.dataInicio)} - {formatDate(curso.dataFim)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={className}><Icon className="mr-1.5" />{label}</div>
                      <Link 
                        to={`/app/tela-de-edicao-de-cursos/${curso.idCurso}`} 
                        onClick={(e) => e.stopPropagation()} 
                        className="p-2 text-[#4a4b42] hover:text-blue-600 rounded-full transition-colors"
                      >
                        <FiEdit3 />
                      </Link>
                      <div ref={el => dropdownRefs.current[curso.idCurso] = el} className="relative">
                          <button 
                            type="button" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setActiveDropdownId(activeDropdownId === curso.idCurso ? null : curso.idCurso); 
                            }} 
                            className="p-2 text-[#4a4b42] hover:text-[#2d2e26] rounded-full transition-colors"
                          >
                            <FiChevronDown />
                          </button>
                          {activeDropdownId === curso.idCurso && (
                            <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-[#E6E3DC] ring-1 ring-[#b8b5ad] z-10">
                              <div className="py-1">
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleStatusChange(curso, oppositeStatus.value); 
                                  }} 
                                  className={`group flex items-center w-full px-4 py-2 text-sm text-left text-[#2d2e26] ${oppositeStatus.hoverClass}`}
                                >
                                  <oppositeStatus.icon className="mr-3" />
                                  {oppositeStatus.label === 'Ativo' ? 'Ativar Curso' : 'Inativar Curso'}
                                </button>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#E6E3DC] rounded-xl shadow-lg"> 
            <FiInbox className="w-16 h-16 text-[#6b6c61] mx-auto mb-5" />
            <h3 className="text-xl font-semibold text-[#2d2e26]">Nenhum Curso Encontrado</h3>
            <p className="text-[#4a4b42] mt-2 text-sm">
              {search ? "Nenhum curso corresponde à sua busca." : "Não há cursos para exibir com os filtros atuais."}
            </p>
          </div>
        )}

        {filteredAndSortedCursos.length > 0 && ( 
            <footer className="mt-8 sm:mt-10 flex justify-center items-center space-x-1 sm:space-x-2 p-4 bg-[#E6E3DC] rounded-xl shadow-lg">
                <button className="p-2 rounded-full hover:bg-[#d1cec6] text-[#4a4b42] disabled:opacity-50" disabled>
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold text-green-600 px-3.5 py-1.5 bg-green-100 rounded-md">
                  Página 1
                </span>
                <button className="p-2 rounded-full hover:bg-[#d1cec6] text-[#4a4b42] disabled:opacity-50" disabled>
                  <FiChevronRight className="w-5 h-5" />
                </button>
            </footer>
        )}
      </main>
    </div>
  );
}