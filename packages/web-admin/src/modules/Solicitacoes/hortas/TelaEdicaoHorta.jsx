import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// 1. IMPORTAMOS o hook da biblioteca
import { useForm } from 'react-hook-form'; 

import api, { BACKEND_URL } from '../../../services/api'; 
import { FiUpload, FiSave, FiRotateCcw, FiLoader, FiAlertCircle, FiChevronLeft } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import placeholderHorta from '../../../assets/images/folhin.png';
import { useHortaForm } from '../../../hooks/useHortaForm'; // Nosso hook de fetching continua sendo usado!

// --- Constantes ---
const PLACEHOLDER_IMAGE_HORTA = placeholderHorta;

// --- COMPONENTES AUXILIARES DE UI (permanece o mesmo) ---
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

  const { hortaData: originalHorta, options, isLoading, error } = useHortaForm(hortaIdFromParams);

  // 2. SUBSTITUÍMOS useState por useForm
  // Ele nos dá funções para registrar campos, lidar com a submissão, observar valores e gerenciar o estado do formulário.
  const { 
    register, 
    handleSubmit, 
    reset, 
    watch,
    formState: { errors, isSubmitting } 
  } = useForm();
  
  // O state 'formData' e a função 'handleChange' foram REMOVIDOS.

  // Estados que não são do formulário permanecem.
  const [imagemFile, setImagemFile] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(PLACEHOLDER_IMAGE_HORTA);

  // 'watch' nos permite observar um campo do formulário para usar seu valor na UI.
  const nomeHorta = watch('nomeHorta');

  // 3. ATUALIZAMOS O useEffect para usar a função 'reset' do useForm
  // 'reset' popula o formulário com os valores iniciais.
  useEffect(() => {
    if (originalHorta) {
      const defaultValues = {
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
      };
      reset(defaultValues); // Popula o formulário com os dados da horta

      if (originalHorta.imageUrl) {
        setImagemPreview(`${BACKEND_URL}${originalHorta.imageUrl.replace('/api', '')}`);
      } else {
        setImagemPreview(PLACEHOLDER_IMAGE_HORTA);
      }
    }
  }, [originalHorta, reset]);

  const handleImageChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagemFile(file);
      setImagemPreview(URL.createObjectURL(file));
    }
  }, []);

  // 4. ATUALIZAMOS A FUNÇÃO DE SUBMISSÃO
  // Ela agora recebe os dados do formulário como um argumento. `handleSubmit` cuida do `e.preventDefault()`.
  const onSubmit = useCallback(async (formData) => {
    const hortaUpdateDTO = {
        ...formData, // Usamos os dados diretamente do formulário
        tamanhoAreaProducao: parseFloat(formData.tamanhoAreaProducao) || 0,
        qntPessoas: parseInt(formData.qntPessoas, 10) || 0,
        idUnidadeEnsino: parseInt(formData.idUnidadeEnsino, 10),
        idAreaClassificacao: parseInt(formData.idAreaClassificacao, 10),
        idAtividadesProdutivas: parseInt(formData.idAtividadesProdutivas, 10),
        idTipoDeHorta: parseInt(formData.idTipoDeHorta, 10),
    };

    const submissionPayload = new FormData();
    submissionPayload.append('horta', new Blob([JSON.stringify(hortaUpdateDTO)], { type: 'application/json' }));
    if (imagemFile) submissionPayload.append('imagem', imagemFile);

    try {
      await api.put(`/hortas/${hortaIdFromParams}`, submissionPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Horta atualizada com sucesso!');
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      toast.error('Falha ao atualizar a horta. Verifique os campos.');
    }
  }, [hortaIdFromParams, imagemFile, navigate]);

  // 5. ATUALIZAMOS A FUNÇÃO DE RESET para usar a função 'reset' do hook
  const handleResetForm = useCallback(() => {
    if (originalHorta) {
        // A lógica de resetar os campos agora é feita pela biblioteca
        reset({ /*... default values ...*/ }); // Você pode repopular com os valores originais aqui
        toast.info("Formulário restaurado para os valores originais.");
    }
  }, [originalHorta, reset]);
  
  // ... (JSX de Loading e Error permanecem os mesmos)
  if (isLoading) return <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-[#A9AD99]"><FiLoader className="animate-spin text-5xl text-gray-700" /><p className="mt-4 text-lg text-gray-900">Carregando dados...</p></div>;
  if (error) return <div className="flex flex-col min-h-screen items-center justify-center p-4 text-center bg-[#A9AD99]"><FiAlertCircle className="text-5xl text-red-600 mb-3" /><p className="text-lg font-semibold text-red-600">Erro ao Carregar</p><span className="text-red-600">{error}</span><button onClick={() => navigate(-1)} className="mt-6 px-5 py-2 bg-[#E6E3DC] text-gray-900 rounded-md hover:bg-[#e0dbcf] transition">Voltar</button></div>;
  if (!originalHorta && !isLoading) return <div className="flex flex-col min-h-screen items-center justify-center p-4 text-center bg-[#A9AD99]"><FiAlertCircle className="text-5xl text-orange-600 mb-3" /><p className="text-lg font-semibold text-orange-600">Horta não encontrada</p><span className="text-orange-600">A horta com o ID fornecido não pôde ser carregada.</span><button onClick={() => navigate(-1)} className="mt-6 px-5 py-2 bg-[#E6E3DC] text-gray-900 rounded-md hover:bg-[#e0dbcf] transition">Voltar</button></div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#A9AD99] font-poppins">
      <ToastContainer position="top-right" autoClose={3500} theme="colored" />
      <div className="flex-grow flex flex-col">
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* 6. CONECTAMOS a função de submissão ao formulário */}
          <form onSubmit={handleSubmit(onSubmit)} id="edit-horta-form" className="max-w-4xl mx-auto space-y-6">
            <header className="pb-6 border-b border-gray-300 flex justify-between items-center">
              <div>
                <button type="button" onClick={() => navigate(-1)} className="mb-2 text-sm text-blue-600 hover:text-blue-800"><FiChevronLeft />Voltar</button>
                {/* Usamos o valor "observado" para o título */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Editando Horta: <span className="text-green-800">{nomeHorta}</span></h1>
                <p className="text-sm text-gray-800 mt-1">Modifique as informações da horta abaixo.</p>
              </div>
              <button type="button" onClick={handleResetForm} disabled={isSubmitting}><FiRotateCcw /></button>
            </header>

            <Section title="Informações Gerais">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label htmlFor="nomeHorta" className="block text-sm font-medium text-gray-900">Nome da Horta *</label>
                  {/* 7. REGISTRAMOS o input no formulário */}
                  <input id="nomeHorta" {...register("nomeHorta", { required: "Nome da horta é obrigatório" })} required className="mt-1 w-full rounded-md border-gray-300" />
                  {errors.nomeHorta && <p className="text-red-500 text-xs mt-1">{errors.nomeHorta.message}</p>}
                </div>
                <div>
                  <label htmlFor="statusHorta" className="block text-sm font-medium text-gray-900">Status da Horta *</label>
                  <select id="statusHorta" {...register("statusHorta", { required: true })} required className="mt-1 block w-full rounded-md border-gray-300">
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
                        <input id="tamanhoAreaProducao" type="number" step="0.1" min="0" {...register("tamanhoAreaProducao", { required: true })} required className="mt-1 w-full rounded-md border-gray-300" />
                    </div>
                    <div>
                        <label htmlFor="qntPessoas" className="block text-sm font-medium text-gray-900">Nº de Pessoas Envolvidas *</label>
                        <input id="qntPessoas" type="number" min="1" {...register("qntPessoas", { required: true })} required className="mt-1 w-full rounded-md border-gray-300" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="caracteristicaGrupo" className="block text-sm font-medium text-gray-900">Características do Grupo</label>
                        <textarea id="caracteristicaGrupo" rows="3" {...register("caracteristicaGrupo")} className="mt-1 block w-full rounded-md border-gray-300" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="atividadeDescricao" className="block text-sm font-medium text-gray-900">Descrição das Atividades *</label>
                        <textarea id="atividadeDescricao" rows="3" {...register("atividadeDescricao", { required: true })} required className="mt-1 block w-full rounded-md border-gray-300" />
                    </div>
                </div>
            </Section>

            <Section title="Associações e Imagem">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start">
                <div className="space-y-4">
                  {/* Registramos todos os outros selects */}
                  <div>
                    <label htmlFor="idTipoDeHorta" className="block text-sm font-medium text-gray-900">Tipo de Horta *</label>
                    <select id="idTipoDeHorta" {...register("idTipoDeHorta", { required: true })} required disabled={isLoading} className="mt-1 block w-full rounded-md border-gray-300">
                      <option value="">{isLoading ? 'Carregando...' : 'Selecione o Tipo'}</option>
                      {options.tiposDeHorta.map(opt => <option key={opt.idTipoDeHorta} value={opt.idTipoDeHorta}>{opt.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="idUsuario" className="block text-sm font-medium text-gray-900">Usuário Responsável *</label>
                    <select id="idUsuario" {...register("idUsuario", { required: true })} required disabled={isLoading} className="mt-1 block w-full rounded-md border-gray-300">
                      <option value="">{isLoading ? 'Carregando...' : 'Selecione o Usuário'}</option>
                      {options.usuarios.map(opt => <option key={opt.idUsuario} value={opt.idUsuario}>{opt.nome}</option>)}
                    </select>
                  </div>
                  {/* ... e assim por diante para os outros selects ... */}
                </div>
                {/* A parte da imagem não precisa do 'register', pois a tratamos com um state separado */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">Imagem da Horta</label>
                  <div className="w-full h-48 sm:h-56 bg-[#E6E3DC] border-2 border-dashed border-gray-300">
                    <img src={imagemPreview} alt="Preview" className="object-contain w-full h-full" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE_HORTA; }}/>
                  </div>
                  <label htmlFor="imagem-upload-horta" className="w-full cursor-pointer flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-md"><FiUpload /><span>Alterar Imagem</span></label>
                  <input id="imagem-upload-horta" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>
              </div>
            </Section>
          </form>
        </div>
        <footer className="flex-shrink-0 bg-[#E6E3DC] shadow-lg p-4 sticky bottom-0">
          <div className="max-w-4xl mx-auto flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} disabled={isSubmitting}>Cancelar</button>
            {/* O estado 'disabled' agora usa 'isSubmitting' do hook */}
            <button type="submit" form="edit-horta-form" disabled={isSubmitting || isLoading} className="px-5 py-2 flex items-center justify-center bg-green-600 text-white rounded-md">
              {isSubmitting ? <FiLoader className="animate-spin" /> : <><FiSave /> Salvar Alterações</>}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}