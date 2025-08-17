import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { BACKEND_URL } from '../../../services/api'; 
import { FiUpload, FiCheckCircle, FiXCircle, FiCalendar, FiLoader, FiAlertCircle, FiImage, FiSave, FiRotateCcw } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PLACEHOLDER_FILENAME_FROM_BACKEND = "folhin.png";
const IMAGE_UPLOAD_PATH_SEGMENT = "banners"; 

const initialFormState = {
  tipoAtividade: '',
  nome: '',
  descricao: '',
  local: '',
  instituicao: '',
  publicoAlvo: '',
  dataInicio: '',
  dataFim: '',
  dataInscInicio: '',
  dataInscFim: '',
  turno: '',
  maxPessoas: '',
  cargaHoraria: '',
  ativo: true, 
};

export default function TelaDeCadastroDeCurso() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormState);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [optionsLoading, setOptionsLoading] = useState(true);
  const [formOptions, setFormOptions] = useState({
    tiposAtividade: [],
    publicosAlvo: [],
    turnos: []
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setOptionsLoading(true);
        const response = await api.get('/cursos/opcoes');
        const { tiposAtividade, publicosAlvo, turnos } = response.data;
        
        setFormOptions({ tiposAtividade, publicosAlvo, turnos });

        setFormData({
            ...initialFormState, 
            tipoAtividade: tiposAtividade?.[0] || '', 
            publicoAlvo: publicosAlvo?.[0] || '',
            turno: turnos?.[0] || '',
        });

      } catch (error) {
        console.error("Erro ao buscar opções do formulário:", error);
        toast.error('Não foi possível carregar as opções do formulário.');
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchOptions();
  }, []); 

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
    }));
  }, []);

  const handleBannerChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        toast.error("O arquivo do banner não pode exceder 2MB.");
        e.target.value = null; 
        return;
      }
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    } else {
      setBannerFile(null);
      setBannerPreview(null); 
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
        ...initialFormState,
        tipoAtividade: formOptions.tiposAtividade?.[0] || '',
        publicoAlvo: formOptions.publicosAlvo?.[0] || '',
        turno: formOptions.turnos?.[0] || '',
    });
    setBannerFile(null); 
    setBannerPreview(null);
    const fileInput = document.getElementById('banner-upload');
    if (fileInput) fileInput.value = null;
  }, [formOptions.tiposAtividade, formOptions.publicosAlvo, formOptions.turnos]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cursoDataPayload = { 
        ...formData, 
        maxPessoas: Number(formData.maxPessoas) || 0, 
        cargaHoraria: Number(formData.cargaHoraria) || 0,
        ativo: formData.ativo,
    };
    
    const submissionHttpPayload = new FormData();
    submissionHttpPayload.append('curso', new Blob([JSON.stringify(cursoDataPayload)], { type: 'application/json' }));
    
    if (bannerFile) {
      submissionHttpPayload.append('banner', bannerFile);
    }

    try {
      await api.post('/cursos', submissionHttpPayload);
      toast.success('Atividade cadastrada com sucesso!');
      resetForm(); 
      setTimeout(() => navigate('/app/tela-de-cursos-ativos'), 1500); 
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || 'Ocorreu um erro ao cadastrar a atividade.';
      toast.error(errorMessage);
      console.error("Erro no cadastro:", error.response || error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-[#A9AD99] font-poppins">
      <ToastContainer position="top-right" autoClose={3500} theme="colored" hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      
      <div className="flex-grow flex flex-col">
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} id="curso-form" className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <header className="pb-6 border-b border-[#8a8d7a]">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2d2e26]">Cadastro de Nova Atividade</h1>
              <p className="text-sm sm:text-md text-[#4a4b42] mt-1">Preencha os campos abaixo para criar uma nova atividade formativa.</p>
            </header>
            
            <main className="space-y-5 sm:space-y-6">
              <section className="p-5 sm:p-6 bg-[#E6E3DC] rounded-lg shadow">
                <h2 className="text-lg sm:text-xl font-semibold mb-5 text-[#2d2e26]">Informações Principais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-5">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#4a4b42] mb-1">Tipo de Atividade *</label>
                        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 p-1.5 bg-[#d1cec6] rounded-md">
                        {optionsLoading ? <p className="text-xs text-[#6b6c61] p-2">Carregando opções...</p> : 
                          formOptions.tiposAtividade.length > 0 ? formOptions.tiposAtividade.map((type) => ( 
                            <label key={type} className={`flex-1 text-center py-2 px-3 rounded-md cursor-pointer transition-colors text-xs sm:text-sm ${formData.tipoAtividade === type ? 'bg-green-600 text-white shadow-md' : 'hover:bg-[#c4c1b9] text-[#4a4b42]'}`}>
                            <input type="radio" name="tipoAtividade" value={type} checked={formData.tipoAtividade === type} onChange={handleChange} className="sr-only"/> 
                            {type}
                            </label>
                        )) : <p className="text-xs text-[#6b6c61] p-2">Nenhum tipo disponível.</p>}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="nome" className="block text-sm font-medium text-[#4a4b42]">Nome da Atividade *</label>
                        <input id="nome" name="nome" type="text" value={formData.nome} onChange={handleChange} required className="mt-1 block w-full h-10 px-3 border border-[#b8b5ad] rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm bg-[#f2f0e9] text-[#2d2e26]"/>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="descricao" className="block text-sm font-medium text-[#4a4b42]">Descrição *</label>
                        <textarea id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} required rows="4" className="mt-1 block w-full px-3 py-2 border border-[#b8b5ad] rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm resize-y bg-[#f2f0e9] text-[#2d2e26]"/>
                    </div>
                    <div>
                        <label htmlFor="local" className="block text-sm font-medium text-[#4a4b42]">Local *</label>
                        <input id="local" name="local" type="text" value={formData.local} onChange={handleChange} required className="mt-1 block w-full h-10 px-3 border border-[#b8b5ad] rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm bg-[#f2f0e9] text-[#2d2e26]"/>
                    </div>
                    <div>
                        <label htmlFor="instituicao" className="block text-sm font-medium text-[#4a4b42]">Instituição Responsável *</label>
                        <input id="instituicao" name="instituicao" type="text" value={formData.instituicao} onChange={handleChange} required className="mt-1 block w-full h-10 px-3 border border-[#b8b5ad] rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm bg-[#f2f0e9] text-[#2d2e26]"/>
                    </div>
                </div>
              </section>

              <section className="p-5 sm:p-6 bg-[#E6E3DC] rounded-lg shadow">
                <h2 className="text-lg sm:text-xl font-semibold mb-5 text-[#2d2e26]">Detalhes da Atividade</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-5 items-start">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#4a4b42]">Banner de Apresentação</label>
                    <div className="w-full h-40 sm:h-48 bg-[#d1cec6] border-2 border-dashed border-[#b8b5ad] rounded-md flex items-center justify-center overflow-hidden relative group">
                      {bannerPreview ? (
                        <img src={bannerPreview} alt="Preview do banner" className="object-contain w-full h-full" />
                      ) : (
                        <div className="flex flex-col items-center text-[#6b6c61] p-4 text-center">
                          <FiImage className="w-10 h-10 mb-1" />
                          <span className="text-xs">Selecione uma imagem</span>
                        </div>
                      )}
                    </div>
                    <label className="w-full cursor-pointer flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium shadow-sm">
                      <FiUpload className="w-4 h-4 mr-2" /><span>Selecionar Imagem</span>
                      <input id="banner-upload" type="file" name="bannerFile" accept="image/png, image/jpeg, image/webp" onChange={handleBannerChange} className="hidden" /> 
                    </label>
                    <p className="text-xs text-[#6b6c61]">Envie PNG, JPG ou WEBP (max. 2MB).</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-5">
                    <div>
                      <label htmlFor="publicoAlvo" className="block text-sm font-medium text-[#4a4b42]">Público Alvo *</label>
                      <select id="publicoAlvo" name="publicoAlvo" value={formData.publicoAlvo} onChange={handleChange} required disabled={optionsLoading} className="mt-1 block w-full h-10 pl-3 pr-10 py-0 border border-[#b8b5ad] rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-[#d1cec6] bg-[#f2f0e9] text-[#2d2e26]">
                        <option value="">{optionsLoading ? "Carregando..." : "Selecione"}</option>
                        {formOptions.publicosAlvo.map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)} 
                      </select>
                    </div>
                    <div>
                      <label htmlFor="turno" className="block text-sm font-medium text-[#4a4b42]">Turno *</label>
                      <select id="turno" name="turno" value={formData.turno} onChange={handleChange} required disabled={optionsLoading} className="mt-1 block w-full h-10 pl-3 pr-10 py-0 border border-[#b8b5ad] rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-[#d1cec6] bg-[#f2f0e9] text-[#2d2e26]">
                        <option value="">{optionsLoading ? "Carregando..." : "Selecione"}</option>
                        {formOptions.turnos.map(t => <option key={t} value={t}>{t}</option>)} 
                      </select>
                    </div>
                    <div>
                      <label htmlFor="maxPessoas" className="block text-sm font-medium text-[#4a4b42]">Nº de Vagas *</label>
                      <input id="maxPessoas" name="maxPessoas" type="number" min="0" value={formData.maxPessoas} onChange={handleChange} required className="mt-1 block w-full h-10 px-3 border border-[#b8b5ad] rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm bg-[#f2f0e9] text-[#2d2e26]" />
                    </div>
                    <div>
                      <label htmlFor="cargaHoraria" className="block text-sm font-medium text-[#4a4b42]">Carga Horária (h) *</label>
                      <input id="cargaHoraria" name="cargaHoraria" type="number" min="0" value={formData.cargaHoraria} onChange={handleChange} required className="mt-1 block w-full h-10 px-3 border border-[#b8b5ad] rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm bg-[#f2f0e9] text-[#2d2e26]" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-5 sm:p-6 bg-[#E6E3DC] rounded-lg shadow">
                <h2 className="text-lg sm:text-xl font-semibold mb-5 text-[#2d2e26]">Datas e Ativação</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 sm:gap-y-5">
                  {[ 
                    {id: 'dataInicio', label: 'Início da Atividade *', value: formData.dataInicio, name: 'dataInicio'}, 
                    {id: 'dataFim', label: 'Fim da Atividade *', value: formData.dataFim, name: 'dataFim'}, 
                    {id: 'dataInscInicio', label: 'Início Inscrições *', value: formData.dataInscInicio, name: 'dataInscInicio'}, 
                    {id: 'dataInscFim', label: 'Fim Inscrições *', value: formData.dataInscFim, name: 'dataInscFim'} 
                  ].map(field => (
                    <div key={field.id}>
                      <label htmlFor={field.id} className="block text-sm font-medium text-[#4a4b42]">{field.label}</label>
                      <div className="relative mt-1">
                        <FiCalendar className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-[#6b6c61] pointer-events-none"/>
                        <input id={field.id} name={field.name} type="date" value={field.value} onChange={handleChange} required className="w-full h-10 pl-9 pr-3 border border-[#b8b5ad] rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm bg-[#f2f0e9] text-[#2d2e26]"/>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center">
                    <input id="ativo" name="ativo" type="checkbox" checked={formData.ativo} onChange={handleChange} className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-offset-1 focus:ring-green-500" />
                    <label htmlFor="ativo" className="ml-2 block text-sm font-medium text-[#4a4b42]">Ativar atividade e abrir inscrições ao salvar</label>
                </div>
              </section>
            </main>
          </form>
        </div>
        <footer className="flex-shrink-0 bg-[#E6E3DC] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] p-4 sticky bottom-0 z-10 border-t border-[#b8b5ad]">
          <div className="max-w-4xl mx-auto flex flex-col-reverse sm:flex-row justify-end items-center gap-3">
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
              <button 
                type="button" 
                onClick={resetForm} 
                disabled={isSubmitting} 
                className="w-full sm:w-auto px-5 py-2 bg-[#d1cec6] text-[#4a4b42] font-medium rounded-md transition-colors hover:bg-[#c4c1b9] disabled:opacity-60 text-sm flex items-center justify-center gap-2"
              > 
                <FiRotateCcw className="w-4 h-4"/> Limpar
              </button>
              <button 
                type="submit" 
                form="curso-form" 
                disabled={isSubmitting || optionsLoading} 
                className="w-full sm:w-auto min-w-[150px] px-5 py-2 flex items-center justify-center bg-green-600 text-white font-semibold rounded-md transition-colors hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? <FiLoader className="animate-spin text-lg" /> : <><FiSave className="w-4 h-4 mr-2"/> Cadastrar</>} 
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}