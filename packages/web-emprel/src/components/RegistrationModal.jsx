// Caminho: src/components/RegistrationModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Esta linha agora funcionará
import api from '../services/api';
import FakeCaptcha from './FakeCaptcha';

const ESCOLARIDADE_OPTIONS = [
    { value: 'SEM_ESCOLARIDADE', label: 'Sem Escolaridade' },
    { value: 'ENSINO_FUNDAMENTAL_INCOMPLETO', label: 'Fundamental Incompleto' },
    { value: 'ENSINO_FUNDAMENTAL_COMPLETO', label: 'Fundamental Completo' },
    { value: 'ENSINO_MEDIO_INCOMPLETO', label: 'Médio Incompleto' },
    { value: 'ENSINO_MEDIO_COMPLETO', label: 'Médio Completo' },
    { value: 'ENSINO_SUPERIOR_INCOMPLETO', label: 'Superior Incompleto' },
    { value: 'ENSINO_SUPERIOR_COMPLETO', label: 'Superior Completo' },
    { value: 'POS_GRADUACAO', label: 'Pós-graduação' },
];

export default function RegistrationModal({ course, onClose }) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    email: '',
    endereco: '',
    telefone: '',
    escolaridade: 'SEM_ESCOLARIDADE',
  });

  const [isCaptchaSolved, setIsCaptchaSolved] = useState(false);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!course) {
        setError("Erro: Curso não encontrado.");
        return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const usuarioPayload = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
      };
      
      const usuarioResponse = await api.post('/usuarios', usuarioPayload);
      const novoUsuario = usuarioResponse.data;

      const inscricaoPayload = {
        idUsuario: novoUsuario.idUsuario,
        idCurso: course.idCurso,
      };
      await api.post('/cursos/inscricoes', inscricaoPayload); 

      setSuccess(`Inscrição para o curso "${course.nome}" realizada com sucesso! Você receberá um e-mail de confirmação em breve.`);
      setTimeout(() => {
        onClose();
      }, 6000);

    } catch (err) {
      console.error("Erro na inscrição:", err);
      const detailedError = err.response?.data?.message || err.response?.data || "Ocorreu um erro desconhecido. Por favor, tente novamente.";
      const errorMessage = `Falha na inscrição: ${detailedError}`;
      setError(errorMessage);
      setCaptchaResetKey(prevKey => prevKey + 1);
    } finally {
      setLoading(false);
    }
  };
  
  if (!course) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[1002] flex justify-center items-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-3xl max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="inline-block bg-[#F4D35E] text-[#1D3557] font-bold text-sm px-3 py-1 rounded-full mb-2">
              Formulário de Inscrição
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1D3557]">{course.nome}</h2>
          </div>
          <button onClick={onClose} className="text-2xl font-bold text-gray-400 hover:text-gray-700 transition-colors">×</button>
        </div>
        
        {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 my-4 rounded-r-lg" role="alert">
                <p className="font-bold">Sucesso!</p>
                <p>{success}</p>
            </div>
        )}
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 my-4 rounded-r-lg" role="alert">
                <p className="font-bold">Erro</p>
                <p className='text-sm'>{error}</p>
            </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <p className="text-sm text-gray-600">Preencha os campos abaixo para se inscrever. Os campos marcados com * são obrigatórios.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                    <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#F4D35E] focus:border-[#F4D35E]" />
                </div>
                <div>
                    <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                    <input type="text" id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} required placeholder="000.000.000-00" className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#F4D35E] focus:border-[#F4D35E]" />
                </div>
                <div>
                    <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
                    <input type="date" id="dataNascimento" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#F4D35E] focus:border-[#F4D35E]" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="seuemail@exemplo.com" className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#F4D35E] focus:border-[#F4D35E]" />
                </div>
                <div>
                    <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                    <input type="tel" id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} required placeholder="(81) 99999-9999" className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#F4D35E] focus:border-[#F4D35E]" />
                </div>
                <div>
                    <label htmlFor="escolaridade" className="block text-sm font-medium text-gray-700 mb-1">Escolaridade *</label>
                    <select id="escolaridade" name="escolaridade" value={formData.escolaridade} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#F4D35E] focus:border-[#F4D35E]">
                        {ESCOLARIDADE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">Endereço (Opcional)</label>
                    <input type="text" id="endereco" name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Rua, Número, Bairro, Cidade - PE" className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#F4D35E] focus:border-[#F4D35E]" />
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <FakeCaptcha 
                    onChange={setIsCaptchaSolved} 
                    resetKey={captchaResetKey} 
                />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t mt-6">
              <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading || !isCaptchaSolved} 
                className="px-6 py-2 bg-[#F4D35E] text-[#1D3557] rounded-lg font-bold hover:bg-[#ffe066] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Confirmar Inscrição'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Adiciona validação de props, uma boa prática em arquivos JavaScript/React.
RegistrationModal.propTypes = {
  course: PropTypes.shape({
    idCurso: PropTypes.number.isRequired,
    nome: PropTypes.string.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};