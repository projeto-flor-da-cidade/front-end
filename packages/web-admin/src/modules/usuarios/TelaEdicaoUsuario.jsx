// Caminho: seu-projeto-frontend/src/pages/TelaEdicaoUsuario.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FiSave, FiLoader, FiAlertCircle, FiChevronLeft } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Section = ({ title, children }) => (
  <section className="p-5 bg-[#E6E3DC] rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-4 text-gray-900">{title}</h2>
    {children}
  </section>
);

export default function TelaEdicaoUsuario() {
  const { id: userId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    endereco: '',
    telefone: '',
    dataNascimento: '',
    escolaridade: '',
  });
  const [originalNome, setOriginalNome] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/usuarios/${userId}`);
        const user = response.data;
        setOriginalNome(user.nome);
        setFormData({
          nome: user.nome || '',
          cpf: user.cpf || '',
          email: user.email || '',
          endereco: user.endereco || '',
          telefone: user.telefone || '',
          dataNascimento: user.dataNascimento ? user.dataNascimento.split('T')[0] : '',
          escolaridade: user.escolaridade || '',
        });
      } catch (err) {
        setError('Não foi possível carregar os dados do usuário.');
        toast.error('Falha ao carregar dados do usuário.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/usuarios/${userId}`, formData);
      toast.success('Usuário atualizado com sucesso!');
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Falha ao atualizar o usuário. Verifique os campos.');
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, formData, navigate]);

  if (isLoading) return <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-[#A9AD99]"><FiLoader className="animate-spin text-5xl text-gray-700" /><p className="mt-4 text-lg text-gray-900">Carregando dados do usuário...</p></div>;
  if (error) return <div className="flex flex-col min-h-screen items-center justify-center p-4 text-center bg-[#A9AD99]"><FiAlertCircle className="text-5xl text-red-600 mb-3" /><p className="text-lg font-semibold text-red-600">{error}</p><button onClick={() => navigate(-1)} className="mt-6 px-5 py-2 bg-[#E6E3DC] text-gray-900 rounded-md hover:bg-[#e0dbcf] transition">Voltar</button></div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#A9AD99] font-poppins">
      <ToastContainer position="top-right" autoClose={3500} theme="colored" />
      <div className="flex-grow flex flex-col">
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} id="edit-user-form" className="max-w-4xl mx-auto space-y-6">
            <header className="pb-6 border-b border-gray-300">
              <button type="button" onClick={() => navigate(-1)} className="mb-2 text-sm text-blue-600 hover:text-blue-800 inline-flex items-center" aria-label="Voltar"><FiChevronLeft className="mr-1 h-5 w-5" />Voltar</button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Editando Usuário: <span className="text-green-800">{originalNome}</span></h1>
              <p className="text-sm text-gray-800 mt-1">Modifique as informações do usuário abaixo.</p>
            </header>

            <Section title="Informações Pessoais">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-900">Nome Completo *</label>
                  <input id="nome" name="nome" type="text" value={formData.nome} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm bg-white text-gray-900" />
                </div>
                <div>
                  <label htmlFor="cpf" className="block text-sm font-medium text-gray-900">CPF *</label>
                  <input id="cpf" name="cpf" type="text" value={formData.cpf} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm bg-white text-gray-900" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900">Email *</label>
                  <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm bg-white text-gray-900" />
                </div>
                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-gray-900">Telefone *</label>
                  <input id="telefone" name="telefone" type="tel" value={formData.telefone} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm bg-white text-gray-900" />
                </div>
                <div>
                  <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-900">Data de Nascimento *</label>
                  <input id="dataNascimento" name="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm bg-white text-gray-900" />
                </div>
                <div>
                    <label htmlFor="escolaridade" className="block text-sm font-medium text-gray-900">Escolaridade *</label>
                    <select id="escolaridade" name="escolaridade" value={formData.escolaridade} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-white text-gray-900">
                        <option value="">Selecione...</option>
                        <option value="SEM_ESCOLARIDADE">Sem Escolaridade</option>
                        <option value="ENSINO_FUNDAMENTAL_INCOMPLETO">Ensino Fundamental Incompleto</option>
                        <option value="ENSINO_FUNDAMENTAL_COMPLETO">Ensino Fundamental Completo</option>
                        <option value="ENSINO_MEDIO_INCOMPLETO">Ensino Médio Incompleto</option>
                        <option value="ENSINO_MEDIO_COMPLETO">Ensino Médio Completo</option>
                        <option value="ENSINO_SUPERIOR_INCOMPLETO">Ensino Superior Incompleto</option>
                        <option value="ENSINO_SUPERIOR_COMPLETO">Ensino Superior Completo</option>
                        <option value="POS_GRADUACAO">Pós-Graduação</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="endereco" className="block text-sm font-medium text-gray-900">Endereço</label>
                  <input id="endereco" name="endereco" type="text" value={formData.endereco} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm bg-white text-gray-900" />
                </div>
              </div>
            </Section>
          </form>
        </div>
        <footer className="flex-shrink-0 bg-[#E6E3DC] shadow-lg p-4 sticky bottom-0">
          <div className="max-w-4xl mx-auto flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} disabled={isSubmitting} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">Cancelar</button>
            <button type="submit" form="edit-user-form" disabled={isSubmitting || isLoading} className="px-5 py-2 flex items-center justify-center bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300">
              {isSubmitting ? <FiLoader className="animate-spin" /> : <><FiSave className="mr-2"/> Salvar Alterações no Usuário</>}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}