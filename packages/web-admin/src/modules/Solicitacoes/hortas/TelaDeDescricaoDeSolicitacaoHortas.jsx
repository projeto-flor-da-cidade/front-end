// Caminho: src/pages/app/hortas/TelaDeDescricaoDeSolicitacaoHortas.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api, { BACKEND_URL } from '../../../services/api';

// --- Assets e Estilos ---
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import placeholderHorta from '../../../assets/images/folhin.png';

// --- Ícones ---
import {
  FiLoader, FiAlertCircle, FiCalendar, FiCheckCircle, FiXCircle, FiMaximize2,
  FiUser, FiMapPin, FiUsers, FiClipboard, FiEdit, FiChevronLeft, FiClock,
  FiImage, FiMessageSquare
} from 'react-icons/fi';

// --- Constantes e Utilitários ---
const LOCAL_FALLBACK_IMAGE = placeholderHorta;

const HORTA_STATUS = { ATIVA: 'ATIVA', INATIVA: 'INATIVA', PENDENTE: 'PENDENTE', VISITA_AGENDADA: 'VISITA_AGENDADA' };
const HORTA_STATUS_CONFIG = {
  [HORTA_STATUS.ATIVA]: { label: 'Ativa', Icon: FiCheckCircle, color: 'text-green-700 bg-green-100' },
  [HORTA_STATUS.INATIVA]: { label: 'Inativa/Recusada', Icon: FiXCircle, color: 'text-red-700 bg-red-100' },
  [HORTA_STATUS.PENDENTE]: { label: 'Pendente', Icon: FiClock, color: 'text-yellow-700 bg-yellow-100' },
  [HORTA_STATUS.VISITA_AGENDADA]: { label: 'Visita Agendada', Icon: FiCalendar, color: 'text-blue-700 bg-blue-100' },
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (dateString.length === 10) return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
  } catch (_e) { return dateString; }
};

const getImageUrl = (imageUrlFromDto) => {
  if (imageUrlFromDto) return `${BACKEND_URL}${imageUrlFromDto.replace('/api', '')}`;
  return LOCAL_FALLBACK_IMAGE;
};

// --- Componentes Reutilizáveis de UI ---
const Section = ({ title, icon: Icon, children }) => (
  <section className="bg-white p-5 rounded-xl shadow-lg">
    <h2 className="text-lg font-semibold text-[#254117] mb-4 flex items-center">
      <Icon className="mr-2.5 text-[#6D9435] w-5 h-5" /> {title}
    </h2>
    {children}
  </section>
);

const InfoGrid = ({ children, cols = 2 }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-${cols} gap-x-5 gap-y-3 text-sm`}>
    {children}
  </div>
);

const InfoItem = ({ label, value, href, children }) => (
  <div>
    <strong className="text-gray-500 font-medium">{label}:</strong>{' '}
    {children || (href ? (
      <a href={href} className="text-blue-600 hover:underline break-all" target="_blank" rel="noopener noreferrer">{value || 'N/A'}</a>
    ) : (
      <span className="text-gray-800 break-words">{value || 'N/A'}</span>
    ))}
  </div>
);

const ActionButton = ({ icon: Icon, text, onClick, isSubmitting, color = 'gray', href }) => {
  const colorMap = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    red: 'bg-red-600 hover:bg-red-700',
    whatsapp: 'bg-[#1f9a3a] hover:bg-[#16832b]',
    gray: 'bg-gray-600 hover:bg-gray-700'
  };
  const classes = `w-full flex items-center justify-center gap-2 px-4 py-2 text-white rounded-md transition-colors text-sm font-medium disabled:opacity-70 ${colorMap[color] || colorMap.gray}`;
  const content = (<>{isSubmitting ? <FiLoader className="animate-spin w-5 h-5" /> : <Icon className="w-5 h-5" />}{text}</>);
  return href ? <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>{content}</a> : <button onClick={onClick} disabled={isSubmitting} className={classes}>{content}</button>;
};

// --- Componente Principal ---
export default function TelaDeDescricaoDeSolicitacaoHortas() {
  const { id: hortaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [horta, setHorta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  
  // CORREÇÃO: O nome do campo no DTO é 'imagemUrl' (i minúsculo).
  // Acessar o campo correto resolve o problema da imagem não carregar.
  const imageUrl = useMemo(() => getImageUrl(horta?.imagemUrl), [horta?.imagemUrl]);
  const statusInfo = useMemo(() => HORTA_STATUS_CONFIG[horta?.statusHorta] || { label: horta?.statusHorta, color: 'text-gray-800 bg-gray-200' }, [horta?.statusHorta]);
  
  const fetchHortaDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/hortas/${hortaId}`);
      setHorta(response.data);
    } catch (err) {
      setError("Não foi possível carregar os detalhes da horta.");
      toast.error("Falha ao carregar detalhes. Verifique o ID e sua conexão.");
    } finally {
      setIsLoading(false);
    }
  }, [hortaId]);

  useEffect(() => {
    fetchHortaDetails();
  }, [fetchHortaDetails]);

  const handleStatusUpdate = useCallback(async (newStatus) => {
    setIsSubmitting(true);
    try {
      const response = await api.patch(`/hortas/${horta.idHorta}/status?status=${newStatus}`);
      const updatedHorta = response.data;
      const newStatusLabel = HORTA_STATUS_CONFIG[updatedHorta.statusHorta]?.label || updatedHorta.statusHorta;
      toast.success(`Status da horta atualizado para "${newStatusLabel}"!`);
      setHorta(updatedHorta);
      setTimeout(() => {
        const source = location.state?.source;
        navigate(source === 'solicitacoes' ? '/app/tela-de-solicitacao-hortas' : '/app/tela-hortas-ativas');
      }, 1500);
    } catch (err) {
      toast.error("Falha ao atualizar o status. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }, [horta, navigate, location.state]);
  
  // CORREÇÃO: Os dados do usuário agora vêm de um objeto aninhado `horta.usuario`.
  const handleWhatsAppClick = useCallback(() => {
    if (!horta?.usuario?.telefone) return toast.warn("Telefone do solicitante não disponível.");
    const numeroLimpo = horta.usuario.telefone.replace(/\D/g, '');
    const numeroWhatsApp = numeroLimpo.length <= 11 ? `55${numeroLimpo}` : numeroLimpo;
    const mensagem = encodeURIComponent(`Olá, ${horta.usuario.nome}! Entro em contato sobre a horta "${horta.nomeHorta}" para agendarmos uma visita.`);
    window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, '_blank');
  }, [horta]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#A9AD99]">
      <FiLoader className="animate-spin text-4xl text-[#E6E3DC]" />
      <p className="mt-3 text-gray-800">Carregando...</p>
    </div>
  );

  if (error || !horta) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-[#A9AD99]">
      <FiAlertCircle className="text-4xl text-red-500 mb-3" />
      <p className="font-semibold text-gray-800">{error || "Horta não encontrada."}</p>
      <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded">Voltar</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#A9AD99] font-poppins pt-10 sm:pt-16 pb-10">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />
      <div className="container mx-auto px-3 sm:px-4">
        <div className="mx-auto w-full max-w-[1800px] bg-[#E6E3DC] rounded-xl p-6 sm:px-8 shadow-xl">
          <header className="mb-8 pb-4 text-center md:text-left border-b border-gray-200">
            <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline mb-2 inline-flex items-center">
              <FiChevronLeft /> Voltar
            </button>
            <p className="text-xs text-gray-600 uppercase">Solicitação #{horta.idHorta}</p>
            <h1 className="text-3xl font-bold text-[#254117] mt-1 break-words">{horta.nomeHorta}</h1>
            <div className={`mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>Status: {statusInfo.label}</div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <main className="lg:col-span-2 space-y-6">
              {/*
                * CORREÇÃO: Os dados do solicitante agora são acessados através do objeto aninhado 'horta.usuario'.
                * O uso de optional chaining (?.), como em 'horta.usuario?.nome', garante que o
                * código não quebre caso o objeto de usuário não seja retornado pela API.
              */}
              <Section title="Informações do Solicitante" icon={FiUser}>
                <InfoGrid cols={2}>
                  <InfoItem label="Nome" value={horta.usuario?.nome} />
                  <InfoItem label="CPF" value={horta.usuario?.cpf} />
                  <InfoItem label="Email" value={horta.usuario?.email} href={horta.usuario?.email ? `mailto:${horta.usuario.email}`: undefined} />
                  <InfoItem label="Telefone" value={horta.usuario?.telefone} />
                  <InfoItem label="Nascimento" value={formatDate(horta.usuario?.dataNascimento)} />
                  <InfoItem label="Escolaridade" value={horta.usuario?.escolaridade?.replace(/_/g, ' ')} />
                  <InfoItem label="Endereço" value={horta.usuario?.endereco} />
                  <InfoItem label="Função na Horta" value={horta.funcaoUniEnsino} />
                </InfoGrid>
              </Section>
              
              <Section title="Detalhes da Horta" icon={FiMapPin}>
                <InfoGrid>
                  <InfoItem label="Tipo" value={horta.nomeTipoDeHorta} />
                  <InfoItem label="Tamanho (m²)" value={horta.tamanhoAreaProducao} />
                  <InfoItem label="Endereço da Horta" value={horta.endereco} />
                  <InfoItem label="Parceria" value={horta.parceria} />
                  <InfoItem label="Solicitada em" value={formatDate(horta.dataCriacao)} />
                </InfoGrid>
              </Section>

              <Section title="Grupo e Atividades" icon={FiUsers}>
                <InfoGrid cols={1}>
                  <InfoItem label="Nº de Pessoas" value={horta.qntPessoas} />
                  <div className="mt-2">
                    <strong className="text-gray-600 block mb-1 text-sm">Atividades Planejadas:</strong>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md border whitespace-pre-wrap">{horta.atividadeDescricao || 'N/A'}</p>
                  </div>
                </InfoGrid>
              </Section>
            </main>

            <aside className="lg:sticky lg:top-20 self-start space-y-6">
              <Section title="Imagem" icon={FiImage}>
                <div className="relative group cursor-pointer" onClick={() => setImageModalOpen(true)}>
                  <img src={imageUrl} alt={`Horta ${horta.nomeHorta}`} className="w-full aspect-video object-cover rounded-lg bg-gray-200" onError={(e) => { e.target.src = LOCAL_FALLBACK_IMAGE; }} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                    <FiMaximize2 className="text-white w-8 h-8 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </div>
              </Section>
              
              {horta.statusHorta === HORTA_STATUS.PENDENTE && (
                <Section title="Ações da Solicitação" icon={FiClipboard}>
                  <div className="space-y-2">
                    <ActionButton icon={FiMessageSquare} text="Agendar via WhatsApp" onClick={handleWhatsAppClick} isSubmitting={isSubmitting} color="whatsapp" />
                    <ActionButton icon={FiCheckCircle} text="Aprovar Solicitação" onClick={() => handleStatusUpdate(HORTA_STATUS.ATIVA)} isSubmitting={isSubmitting} color="green" />
                    <ActionButton icon={FiXCircle} text="Recusar Solicitação" onClick={() => handleStatusUpdate(HORTA_STATUS.INATIVA)} isSubmitting={isSubmitting} color="red" />
                  </div>
                </Section>
              )}

              <Section title="Gerenciamento" icon={FiEdit}>
                <ActionButton icon={FiEdit} text="Editar Dados" onClick={() => navigate(`/app/hortas-editar/${hortaId}`)} color="green" />
              </Section>
            </aside>
          </div>
        </div>
      </div>

      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setImageModalOpen(false)}>
          <img src={imageUrl} alt="Horta Ampliada" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}