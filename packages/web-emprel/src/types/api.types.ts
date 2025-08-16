// src/types/api.types.ts

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

// Interface para o que a API retorna em uma listagem ou busca por ID
// Baseado no provável CursoResponseDTO
export interface CursoResponse {
  idCurso: number;
  tipoAtividade: TipoAtividade;
  nome: string;
  descricao: string;
  local: string;
  fotoBanner?: string;
  instituicao: string;
  publicoAlvo: PublicoAlvo;
  dataInicio: string;       // "YYYY-MM-DD"
  dataFim: string;          // "YYYY-MM-DD"
  dataInscInicio: string;   // "YYYY-MM-DD"
  dataInscFim: string;      // "YYYY-MM-DD"
  ativo: boolean;
  turno: Turno;
  maxPessoas: number;
  cargaHoraria: number;
  dataCriacao: string;      // "YYYY-MM-DDTHH:mm:ss"
  dataAtualizacao: string;  // "YYYY-MM-DDTHH:mm:ss"
}

// Interface para os dados que enviamos para CRIAR um curso
// Baseado no CursoRequestDTO
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
  // O campo 'ativo' e 'fotoBanner' são gerenciados pelo backend ou via FormData
}

// Interface para os dados que enviamos para ATUALIZAR um curso
// Baseado no CursoUpdateDTO, geralmente os campos são opcionais
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

// Adicione outras interfaces de DTOs aqui conforme necessário (Horta, Usuario, etc.)