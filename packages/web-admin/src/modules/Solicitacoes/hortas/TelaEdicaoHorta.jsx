// Caminho do Arquivo: seu-projeto-frontend/src/pages/TelaEdicaoHorta.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { BACKEND_URL } from '../../../services/api'; 
import { FiUpload, FiSave, FiRotateCcw, FiImage, FiLoader, FiAlertCircle, FiChevronLeft } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import placeholderHorta from '../../../assets/images/folhin.png';

const PLACEHOLDER_IMAGE_HORTA = placeholderHorta;
const IMAGE_UPLOAD_PATH_SEGMENT_HORTA = "imagem";

const initialFormDataState = {
  nomeHorta: '', funcaoUniEnsino: '', ocupacaoPrincipal: '', endereco: '', enderecoAlternativo: '',
  tamanhoAreaProducao: '', caracteristicaGrupo: '', qntPessoas: '', atividadeDescricao: '',
  parceria: '', statusHorta: 'PENDENTE', idUsuario: '', idUnidadeEnsino: '',
  idAreaClassificacao: '', idAtividadesProdutivas: '', idTipoDeHorta: '',
};

// --- COMPONENTES AUXILIARES DE UI (ajustados para a paleta) ---
const Section = ({ title, children }) => (
  <section className="p-5 bg-[#E6E3DC] rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-4 text-gray-900">{title}</h2>
    {children}
  </section>
);

// --- COMPONENTE PRINCIPAL ---
export default function TelaEdicaoHorta() {
  const { id: hortaIdFromParams } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormDataState);
  const [originalHorta, setOriginalHorta] = useState(null);
  const [imagemFile, setImagemFile] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(PLACEHOLDER_IMAGE_HORTA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [tiposDeHortaOptions, setTiposDeHortaOptions] = useState([]);
  const [usuariosOptions, setUsuariosOptions] = useState([]);
  const [unidadesEnsinoOptions, setUnidadesEnsinoOptions] = useState([]);
  const [areasClassificacaoOptions, setAreasClassificacaoOptions] = useState([]);
  const [atividadesProdutivasOptions, setAtividadesProdutivasOptions] = useState([]);

  const fetchDropdownOptions = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const [
        tiposRes, usuariosRes, unidadesRes, areasRes, atividadesRes,
      ] = await Promise.all([
        api.get('/tipos-horta'),
        api.get('/usuarios'),
        api.get('/unidades-ensino'),
        api.get('/areas-classificacao'),
        api.get('/atividades-produtivas'),
      ]);
      setTiposDeHortaOptions(tiposRes.data || []);
      setUsuariosOptions(usuariosRes.data || []);
      setUnidadesEnsinoOptions(unidadesRes.data || []);
      setAreasClassificacaoOptions(areasRes.data || []);
      setAtividadesProdutivasOptions(atividadesRes.data || []);
    } catch (err) {
      toast.error("Falha ao carregar opções dos formulários.");
      setError("Não foi possível carregar as opções de seleção.");
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDropdownOptions();
  }, [fetchDropdownOptions]);
  
  useEffect(() => {
    const fetchHortaData = async () => {
      if (!hortaIdFromParams || optionsLoading) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/hortas/${hortaIdFromParams}`);
        const data = response.data;
        setOriginalHorta(data);
        setFormData({
          nomeHorta: data.nomeHorta || '',
          funcaoUniEnsino: data.funcaoUniEnsino || '',
          ocupacaoPrincipal: data.ocupacaoPrincipal || '',
          endereco: data.endereco || '',
          enderecoAlternativo: data.enderecoAlternativo || '',
          tamanhoAreaProducao: data.tamanhoAreaProducao?.toString() || '',
          caracteristicaGrupo: data.caracteristicaGrupo || '',
          qntPessoas: data.qntPessoas?.toString() || '',
          atividadeDescricao: data.atividadeDescricao || '',
          parceria: data.parceria || '',
          statusHorta: data.statusHorta || 'PENDENTE',
          idUsuario: data.idUsuario?.toString() || '',
          idUnidadeEnsino: data.idUnidadeEnsino?.toString() || '',
          idAreaClassificacao: data.idAreaClassificacao?.toString() || '',
          idAtividadesProdutivas: data.idAtividadesProdutivas?.toString() || '',
          idTipoDeHorta: data.idTipoDeHorta?.toString() || '',
        });
        if (data.imageUrl) {
          setImagemPreview(`${BACKEND_URL}${data.imageUrl.replace('/api', '')}`);
        } else {
          setImagemPreview(PLACEHOLDER_IMAGE_HORTA);
        }
      } catch (err) {
        setError('Não foi possível carregar os dados da horta para edição.');
        toast.error("Falha ao carregar dados da horta.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHortaData();
  }, [hortaIdFromParams, navigate, optionsLoading]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleImageChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error("A imagem é muito grande. Máximo de 5MB.");
        e.target.value = null;
        return;
      }
      setImagemFile(file);
      setImagemPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const hortaUpdateDTO = {
        nomeHorta: formData.nomeHorta,
        funcaoUniEnsino: formData.funcaoUniEnsino,
        ocupacaoPrincipal: formData.ocupacaoPrincipal,
        endereco: formData.endereco,
        enderecoAlternativo: formData.enderecoAlternativo,
        tamanhoAreaProducao: parseFloat(formData.tamanhoAreaProducao) || 0,
        caracteristicaGrupo: formData.caracteristicaGrupo,
        qntPessoas: parseInt(formData.qntPessoas, 10) || 0,
        atividadeDescricao: formData.atividadeDescricao,
        parceria: formData.parceria,
        statusHorta: formData.statusHorta,
        idUnidadeEnsino: parseInt(formData.idUnidadeEnsino, 10),
        idAreaClassificacao: parseInt(formData.idAreaClassificacao, 10),
        idAtividadesProdutivas: parseInt(formData.idAtividadesProdutivas, 10),
        idTipoDeHorta: parseInt(formData.idTipoDeHorta, 10),
    };

    const submissionPayload = new FormData();
    submissionPayload.append('horta', new Blob([JSON.stringify(hortaUpdateDTO)], { type: 'application/json' }));

    if (imagemFile) {
      submissionPayload.append('imagem', imagemFile);
    }

    try {
      await api.put(`/hortas/${hortaIdFromParams}`, submissionPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Horta atualizada com sucesso!');
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      toast.error('Falha ao atualizar a horta. Verifique os campos.');
    } finally {
      setIsSubmitting(false);
    }
  }, [hortaIdFromParams, formData, imagemFile, navigate]);

  const handleResetForm = useCallback(() => {
    if (originalHorta) {
        setFormData({
            nomeHorta: originalHorta.nomeHorta || '',
            funcaoUniEnsino: originalHorta.funcaoUniEnsino || '',
            ocupacaoPrincipal: originalHorta.ocupacaoPrincipal || '',
            endereco: originalHorta.endereco || '',
            enderecoAlternativo: originalHorta.enderecoAlternativo || '',
            tamanhoAreaProducao: originalHorta.tamanhoAreaProducao?.toString() || '',
            caracteristicaGrupo: originalHorta.caracteristicaGrupo || '',
            qntPessoas: originalHorta.qntPessoas?.toString() || '',
            atividadeDescricao: originalHorta.atividadeDescricao || '',
            parceria: originalHorta.parceria || '',
            statusHorta: originalHorta.statusHorta || 'PENDENTE',
            idUsuario: originalHorta.idUsuario?.toString() || '',
            idUnidadeEnsino: originalHorta.idUnidadeEnsino?.toString() || '',
            idAreaClassificacao: originalHorta.idAreaClassificacao?.toString() || '',
            idAtividadesProdutivas: originalHorta.idAtividadesProdutivas?.toString() || '',
            idTipoDeHorta: originalHorta.idTipoDeHorta?.toString() || '',
        });
        if (originalHorta.imageUrl) {
            setImagemPreview(`${BACKEND_URL}${originalHorta.imageUrl.replace('/api', '')}`);
        } else {
            setImagemPreview(PLACEHOLDER_IMAGE_HORTA);
        }
        setImagemFile(null);
        toast.info("Formulário restaurado para os valores originais.");
    }
  }, [originalHorta]);
  
  if (isLoading || (optionsLoading && hortaIdFromParams)) return <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-[#A9AD99]"><FiLoader className="animate-spin text-5xl text-gray-700" /><p className="mt-4 text-lg text-gray-900">Carregando dados...</p></div>;
  if (error) return <div className="flex flex-col min-h-screen items-center justify-center p-4 text-center bg-[#A9AD99]"><FiAlertCircle className="text-5xl text-red-600 mb-3" /><p className="text-lg font-semibold text-red-600">Erro ao Carregar</p><span className="text-red-600">{error}</span><button onClick={() => navigate(-1)} className="mt-6 px-5 py-2 bg-[#E6E3DC] text-gray-900 rounded-md hover:bg-[#e0dbcf] transition">Voltar</button></div>;
  if (hortaIdFromParams && !originalHorta && !isLoading) return <div className="flex flex-col min-h-screen items-center justify-center p-4 text-center bg-[#A9AD99]"><FiAlertCircle className="text-5xl text-orange-600 mb-3" /><p className="text-lg font-semibold text-orange-600">Horta não encontrada</p><span className="text-orange-600">A horta com o ID fornecido não pôde ser carregada.</span><button onClick={() => navigate(-1)} className="mt-6 px-5 py-2 bg-[#E6E3DC] text-gray-900 rounded-md hover:bg-[#e0dbcf] transition">Voltar</button></div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#A9AD99] font-poppins">
      <ToastContainer position="top-right" autoClose={3500} theme="colored" />
      <div className="flex-grow flex flex-col">
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} id="edit-horta-form" className="max-w-4xl mx-auto space-y-6">
            <header className="pb-6 border-b border-gray-300 flex justify-between items-center">
              <div>
                <button type="button" onClick={() => navigate(-1)} className="mb-2 text-sm text-blue-600 hover:text-blue-800 inline-flex items-center" aria-label="Voltar"><FiChevronLeft className="mr-1 h-5 w-5" />Voltar</button>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Editando Horta: <span className="text-green-800">{originalHorta?.nomeHorta}</span></h1>
                <p className="text-sm text-gray-800 mt-1">Modifique as informações da horta abaixo.</p>
              </div>
              <button type="button" onClick={handleResetForm} disabled={isSubmitting || !originalHorta} className="p-2 text-gray-800 hover:text-blue-600 disabled:opacity-50" title="Restaurar dados originais"><FiRotateCcw className="w-5 h-5" /></button>
            </header>

            <Section title="Informações Gerais">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label htmlFor="nomeHorta" className="block text-sm font-medium text-gray-900">Nome da Horta *</label>
                  <input id="nomeHorta" name="nomeHorta" type="text" value={formData.nomeHorta} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-[#E6E3DC] text-gray-900" />
                </div>
                <div>
                  <label htmlFor="statusHorta" className="block text-sm font-medium text-gray-900">Status da Horta *</label>
                  <select id="statusHorta" name="statusHorta" value={formData.statusHorta} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-[#E6E3DC] text-gray-900">
                    <option value="PENDENTE">Pendente</option>
                    <option value="ATIVA">Ativa</option>
                    <option value="INATIVA">Inativa</option>
                    <option value="VISITA_AGENDADA">Visita Agendada</option>
                  </select>
                </div>
              </div>
            </Section>
            
            <Section title="Detalhes da Área e Grupo">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <label htmlFor="tamanhoAreaProducao" className="block text-sm font-medium text-gray-900">Tamanho da Área (m²) *</label>
                        <input id="tamanhoAreaProducao" name="tamanhoAreaProducao" type="number" step="0.1" min="0" value={formData.tamanhoAreaProducao} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm bg-[#E6E3DC] text-gray-900" />
                    </div>
                    <div>
                        <label htmlFor="qntPessoas" className="block text-sm font-medium text-gray-900">Nº de Pessoas Envolvidas *</label>
                        <input id="qntPessoas" name="qntPessoas" type="number" min="1" value={formData.qntPessoas} onChange={handleChange} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm bg-[#E6E3DC] text-gray-900" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="caracteristicaGrupo" className="block text-sm font-medium text-gray-900">Características do Grupo</label>
                        <textarea id="caracteristicaGrupo" name="caracteristicaGrupo" value={formData.caracteristicaGrupo} onChange={handleChange} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-[#E6E3DC] text-gray-900" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="atividadeDescricao" className="block text-sm font-medium text-gray-900">Descrição das Atividades *</label>
                        <textarea id="atividadeDescricao" name="atividadeDescricao" value={formData.atividadeDescricao} onChange={handleChange} required rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-[#E6E3DC] text-gray-900" />
                    </div>
                </div>
            </Section>

            <Section title="Associações e Imagem">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="idTipoDeHorta" className="block text-sm font-medium text-gray-900">Tipo de Horta *</label>
                    <select name="idTipoDeHorta" id="idTipoDeHorta" value={formData.idTipoDeHorta} onChange={handleChange} required disabled={optionsLoading} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-[#E6E3DC] text-gray-900">
                      <option value="">{optionsLoading ? 'Carregando...' : 'Selecione o Tipo'}</option>
                      {tiposDeHortaOptions.map(opt => <option key={opt.idTipoDeHorta} value={opt.idTipoDeHorta}>{opt.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="idUsuario" className="block text-sm font-medium text-gray-900">Usuário Responsável *</label>
                    <select name="idUsuario" id="idUsuario" value={formData.idUsuario} onChange={handleChange} required disabled={optionsLoading} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-[#E6E3DC] text-gray-900">
                      <option value="">{optionsLoading ? 'Carregando...' : 'Selecione o Usuário'}</option>
                      {usuariosOptions.map(opt => <option key={opt.idUsuario} value={opt.idUsuario}>{opt.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="idUnidadeEnsino" className="block text-sm font-medium text-gray-900">Unidade de Ensino *</label>
                    <select name="idUnidadeEnsino" id="idUnidadeEnsino" value={formData.idUnidadeEnsino} onChange={handleChange} required disabled={optionsLoading} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-[#E6E3DC] text-gray-900">
                      <option value="">{optionsLoading ? 'Carregando...' : 'Selecione a Unidade'}</option>
                      {unidadesEnsinoOptions.map(opt => <option key={opt.idUnidadeEnsino} value={opt.idUnidadeEnsino}>{opt.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="idAreaClassificacao" className="block text-sm font-medium text-gray-900">Classificação da Área *</label>
                    <select name="idAreaClassificacao" id="idAreaClassificacao" value={formData.idAreaClassificacao} onChange={handleChange} required disabled={optionsLoading} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-[#E6E3DC] text-gray-900">
                        <option value="">{optionsLoading ? 'Carregando...' : 'Selecione a Área'}</option>
                        {areasClassificacaoOptions.map(opt => <option key={opt.idAreaClassificacao} value={opt.idAreaClassificacao}>{opt.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="idAtividadesProdutivas" className="block text-sm font-medium text-gray-900">Atividade Produtiva Principal *</label>
                    <select name="idAtividadesProdutivas" id="idAtividadesProdutivas" value={formData.idAtividadesProdutivas} onChange={handleChange} required disabled={optionsLoading} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-[#E6E3DC] text-gray-900">
                        <option value="">{optionsLoading ? 'Carregando...' : 'Selecione a Atividade'}</option>
                        {atividadesProdutivasOptions.map(opt => <option key={opt.idAtividadesProdutivas} value={opt.idAtividadesProdutivas}>{opt.nome}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">Imagem da Horta</label>
                  <div className="w-full h-48 sm:h-56 bg-[#E6E3DC] border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
                    <img src={imagemPreview} alt="Preview da Horta" className="object-contain w-full h-full" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE_HORTA; }}/>
                  </div>
                  <label htmlFor="imagem-upload-horta" className="w-full cursor-pointer flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"><FiUpload className="w-4 h-4 mr-2" /><span>Alterar Imagem</span></label>
                  <input id="imagem-upload-horta" type="file" name="imagemFile" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>
              </div>
            </Section>
          </form>
        </div>
        <footer className="flex-shrink-0 bg-[#E6E3DC] shadow-lg p-4 sticky bottom-0">
          <div className="max-w-4xl mx-auto flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} disabled={isSubmitting} className="px-5 py-2 bg-[#E6E3DC] text-gray-800 rounded-md hover:bg-[#e0dbcf]">Cancelar</button>
            <button type="submit" form="edit-horta-form" disabled={isSubmitting || isLoading || optionsLoading} className="px-5 py-2 flex items-center justify-center bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300">
              {isSubmitting ? <FiLoader className="animate-spin" /> : <><FiSave className="mr-2"/> Salvar Alterações</>}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
