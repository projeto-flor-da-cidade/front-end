// Caminho: src/modules/tecnico/TelaCadastroTecnico.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiSave, FiUserPlus, FiLoader, FiChevronLeft, FiEye, FiEyeOff } from 'react-icons/fi';

// --- Componentes de Formulário Reutilizáveis ---
const FormField = ({ label, htmlFor, error, children }) => (
  <div>
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-900">{label}</label>
    <div className="mt-1">{children}</div>
    {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-[#E6E3DC] text-gray-900 ${props.className || ''}`}
  />
);

const PasswordInput = ({ id, name, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required
        minLength={8}
        className="pr-10"
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700"
        onClick={() => setShow(!show)}
        aria-label={show ? "Esconder senha" : "Mostrar senha"}
      >
        {show ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
      </button>
    </div>
  );
};

const Select = (props) => (
  <select
    {...props}
    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-[#E6E3DC] text-gray-900 ${props.className || ''}`}
  >
    {props.children}
  </select>
);

// --- Componente Principal ---
const initialFormData = {
  nome: '', matricula: '', email: '', senha: '', confirmarSenha: '',
  status: 'ATIVO',
  isAdm: false, idRegiao: '',
};
const initialErrors = {
  nome: '', matricula: '', email: '', senha: '', confirmarSenha: '', idRegiao: '',
};

export default function TelaCadastroTecnico() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);
  const [regioes, setRegioes] = useState([]);
  const [loadingRegioes, setLoadingRegioes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(true); // Assumindo que o usuário é admin

  useEffect(() => {
    const fetchRegioes = async () => {
      setLoadingRegioes(true);
      try {
        const response = await api.get('/regioes');
        setRegioes(response.data || []);
      } catch (error) {
        toast.error("Não foi possível carregar as regiões.");
      } finally {
        setLoadingRegioes(false);
      }
    };
    fetchRegioes();
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validateForm = () => {
    const newErrors = { ...initialErrors };
    let isValid = true;
    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não coincidem.";
      isValid = false;
    }
    // Adicione outras validações aqui se necessário
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warn("Por favor, corrija os erros no formulário.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        nome: formData.nome.trim(),
        matricula: formData.matricula.trim(),
        email: formData.email.trim(),
        senha: formData.senha,
        idRegiao: parseInt(formData.idRegiao, 10),
        // ======================= INÍCIO DA CORREÇÃO =======================
        // O nome da propriedade deve ser "adm" para corresponder ao DTO do back-end.
        adm: formData.isAdm,
        // ======================== FIM DA CORREÇÃO =========================
      };
      await api.post('/tecnicos', payload);
      toast.success("Técnico cadastrado com sucesso!");
      setTimeout(() => {
        navigate(-1); // Volta para a página anterior após o sucesso
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erro ao cadastrar técnico.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingRegioes) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#A9AD99]">
        <FiLoader className="animate-spin text-4xl text-green-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#A9AD99] pb-10">
      <ToastContainer position="top-center" autoClose={4000} theme="colored" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto bg-[#E6E3DC] p-6 sm:p-8 rounded-xl shadow-lg">
            <header className="mb-4">
              <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-900 hover:underline">
                <FiChevronLeft /> Voltar
              </button>
              <h1 className="mt-3 text-2xl font-bold text-gray-900 flex items-center gap-2"><FiUserPlus /> Cadastrar Técnico</h1>
              <p className="mt-1 text-sm text-gray-800">Preencha os dados para cadastrar um novo técnico.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <fieldset className="space-y-4">
                <legend className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Dados de Identificação</legend>
                <FormField label="Nome Completo *" htmlFor="nome" error={errors.nome}>
                  <Input type="text" name="nome" id="nome" value={formData.nome} onChange={handleChange} required />
                </FormField>

                <FormField label="Matrícula *" htmlFor="matricula" error={errors.matricula}>
                  <Input type="text" name="matricula" id="matricula" value={formData.matricula} onChange={handleChange} required />
                </FormField>

                <FormField label="E-mail *" htmlFor="email" error={errors.email}>
                  <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />
                </FormField>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Credenciais de Acesso</legend>
                <FormField label="Senha *" htmlFor="senha" error={errors.senha}>
                  <PasswordInput id="senha" name="senha" value={formData.senha} onChange={handleChange} />
                </FormField>
                <FormField label="Confirmar Senha *" htmlFor="confirmarSenha" error={errors.confirmarSenha}>
                  <PasswordInput id="confirmarSenha" name="confirmarSenha" value={formData.confirmarSenha} onChange={handleChange} />
                </FormField>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Configurações e Permissões</legend>
                <FormField label="Região *" htmlFor="idRegiao" error={errors.idRegiao}>
                  <Select name="idRegiao" id="idRegiao" value={formData.idRegiao} onChange={handleChange} required disabled={loadingRegioes}>
                    <option value="">{loadingRegioes ? 'Carregando...' : 'Selecione a Região'}</option>
                    {regioes.map(regiao => <option key={regiao.idRegiao} value={regiao.idRegiao}>{regiao.nome}</option>)}
                  </Select>
                </FormField>

                <div className="flex items-center pt-2">
                  <input id="isAdm" name="isAdm" type="checkbox" checked={formData.isAdm} onChange={handleChange} className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  <label htmlFor="isAdm" className="ml-3 block text-sm font-medium text-gray-900">Conceder privilégios de Administrador</label>
                </div>
              </fieldset>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || loadingRegioes}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-green-700 hover:bg-green-800 disabled:opacity-60"
                >
                  {isSubmitting ? <FiLoader className="animate-spin h-5 w-5 mr-2" /> : <FiSave className="h-5 w-5 mr-2" />}
                  {isSubmitting ? 'Cadastrando...' : 'Cadastrar Técnico'}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}