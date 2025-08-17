// src/pages/App/TelaDeInscritos/TelaDeInscritos.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';

import Header from '../../Home/components/Header';
import {
  FiUser, FiMail, FiCalendar, FiLoader, FiAlertCircle,
  FiArrowLeft, FiInbox, FiPhone, FiClipboard, FiFileText, FiSearch
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

export default function TelaDeInscritos() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courseName, setCourseName] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    if (!courseId) {
      setError("ID do curso não fornecido.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [courseResponse, enrollmentsResponse] = await Promise.all([
          api.get(`/cursos/${courseId}`),
          api.get(`/cursos/${courseId}/inscricoes`)
      ]);
      setCourseName(courseResponse.data.nome || 'Curso');
      setEnrollments(enrollmentsResponse.data || []);
    } catch (err) {
      let errorMessage = "Não foi possível carregar os dados dos inscritos.";
      if (err.response?.status === 404) {
        errorMessage = "Curso ou informações de inscrição não encontrados.";
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredAndSortedEnrollments = useMemo(() => {
    return enrollments
      .filter(enrollment => {
        if (!search) return true;
        return enrollment.usuario?.nome.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => a.usuario?.nome.localeCompare(b.usuario?.nome));
  }, [enrollments, search]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F0F2EB] font-poppins">
        <Header title="Inscritos no Curso" />
        <div className="flex flex-1 items-center justify-center text-center p-10">
          <FiLoader className="w-12 h-12 text-green-600 animate-spin mr-4" />
          <div>
            <p className="text-xl font-semibold text-gray-700">Carregando Inscritos...</p>
            <p className="text-sm text-gray-500">Por favor, aguarde.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F0F2EB] font-poppins">
        <Header title="Erro" />
        <div className="flex flex-1 items-center justify-center text-center p-6 m-6 bg-white rounded-xl shadow-lg">
          <div className="flex flex-col items-center">
            <FiAlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-xl font-semibold text-red-700">Erro ao Carregar Dados</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <div className="flex gap-4 mt-6">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold">
                <FiArrowLeft /> Voltar
              </button>
              <button onClick={fetchData} className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold">
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-poppins">
      <Header title={`Inscritos: ${courseName}`} />
      <ToastContainer position="bottom-right" autoClose={3500} theme="colored" />

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 pt-6 sm:pt-8">
        <header className="mb-6 sm:mb-8 p-5 sm:p-6 bg-white rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{courseName}</h1>
              <p className="text-sm text-gray-600 mt-1">Lista de participantes inscritos.</p>
            </div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium self-start sm:self-center">
                <FiArrowLeft className="w-4 h-4" /> Voltar para Cursos
            </button>
          </div>
          
          {enrollments.length > 0 && (
            <div className="relative mt-6">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome do inscrito..."
                className="w-full h-12 pl-12 pr-4 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>
          )}
        </header>

        {filteredAndSortedEnrollments.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {filteredAndSortedEnrollments.map(({ idInscricao, dataInscricao, usuario }) => (
                <li key={idInscricao} className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1 border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-4 border-gray-200">
                      <h2 className="text-lg font-semibold text-green-700 flex items-center mb-3">
                        <FiUser className="w-5 h-5 mr-3 text-gray-500" />
                        {usuario?.nome || 'Usuário Desconhecido'}
                      </h2>
                      <div className="space-y-2 text-xs text-gray-600">
                          <p className="flex items-center"><FiMail className="w-3.5 h-3.5 mr-2 text-gray-400" />{usuario?.email || 'N/A'}</p>
                          <p className="flex items-center"><FiPhone className="w-3.5 h-3.5 mr-2 text-gray-400" />{usuario?.telefone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <p className="flex items-center"><FiClipboard className="w-4 h-4 mr-2 text-gray-400" /><strong>CPF:</strong><span className="ml-2 text-gray-700">{usuario?.cpf || 'N/A'}</span></p>
                        <p className="flex items-center"><FiCalendar className="w-4 h-4 mr-2 text-gray-400" /><strong>Nascimento:</strong><span className="ml-2 text-gray-700">{formatDate(usuario?.dataNascimento)}</span></p>
                        <p className="flex items-center sm:col-span-2"><FiFileText className="w-4 h-4 mr-2 text-gray-400" /><strong>Escolaridade:</strong><span className="ml-2 text-gray-700">{usuario?.escolaridade?.replace(/_/g, ' ') || 'N/A'}</span></p>
                        <p className="flex items-center text-xs text-gray-500 sm:col-span-2 mt-2 pt-2 border-t border-dashed w-full"><FiCalendar className="w-3.5 h-3.5 mr-2" />Inscrito em: {formatDate(dataInscricao)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm font-semibold text-gray-700 text-right">
              Mostrando {filteredAndSortedEnrollments.length} de {enrollments.length} inscritos
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <FiInbox className="w-16 h-16 text-gray-400 mx-auto mb-5" />
            <h3 className="text-xl font-semibold text-gray-700">
              {enrollments.length === 0 ? 'Nenhum Inscrito' : 'Nenhum Resultado Encontrado'}
            </h3>
            <p className="text-gray-500 mt-2 text-sm">
              {enrollments.length === 0 ? 'Ainda não há ninguém inscrito neste curso.' : `Nenhum inscrito corresponde à sua busca por "${search}".`}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}