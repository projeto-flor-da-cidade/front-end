// Enums baseados no backend
export enum TipoAtividade {
  Curso = 'Curso',
  Oficina = 'Oficina',
}

export enum PublicoAlvo {
  Geral = 'Geral',
  Interno = 'Interno',
  Comunidade = 'Comunidade',
  Estudantes = 'Estudantes',
  Idosos = 'Idosos',
}

export enum Turno {
  Manha = 'Manhã',
  Tarde = 'Tarde',
  Noite = 'Noite',
}

// Interface para o que a API RETORNA (DTO de Resposta)
export interface CursoResponse {
  idCurso: number;
  tipoAtividade: TipoAtividade;
  nome: string;
  descricao: string;
  local: string;
  fotoBanner?: string;
  bannerUrl: string; // URL completa e pronta para uso
  instituicao: string;
  publicoAlvo: PublicoAlvo;
  dataInicio: string;
  dataFim: string;
  dataInscInicio: string;
  dataInscFim: string;
  ativo: boolean;
  turno: Turno;
  maxPessoas: number;
  cargaHoraria: number;
  dataCriacao: string;
  dataAtualizacao: string;
}

// ✅ ADICIONADO: Interface para os dados que ENVIAMOS para CRIAR um curso
export interface CursoRequest {
  tipoAtividade: TipoAtividade;
  nome: string;
  descricao: string;
  local: string;
  instituicao: string;
  publicoAlvo: PublicoAlvo;
  dataInicio: string;
  dataFim: string;
  dataInscInicio: string;
  dataInscFim: string;
  turno: Turno;
  maxPessoas: number;
  cargaHoraria: number;
}

// ✅ ADICIONADO: Interface para os dados que ENVIAMOS para ATUALIZAR um curso
export interface CursoUpdate {
  tipoAtividade?: TipoAtividade;
  nome?: string;
  descricao?: string;
  local?: string;
  instituicao?: string;
  publicoAlvo?: PublicoAlvo;
  dataInicio?: string;
  dataFim?: string;
  dataInscInicio?: string;
  dataInscFim?: string;
  ativo?: boolean;
  turno?: Turno;
  maxPessoas?: number;
  cargaHoraria?: number;
}

// --- Outros Tipos ---

export interface HortaResponse {
  idHorta: number;
  nomeHorta: string;
  endereco: string;
  latitude?: number;  // Coordenadas podem ser opcionais se nem todas as hortas tiverem
  longitude?: number;
  imagemUrl: string;
  nomeTipoDeHorta: string;
  nomeUsuario: string;
}