export type StatusHorta = 'ATIVA' | 'INATIVA' | 'PENDENTE' | 'VISITA_AGENDADA';

// Define a estrutura principal do nosso objeto Horta, com base nos dados que vimos nas telas.
export interface Horta {
  idHorta: number;
  nomeHorta: string;
  statusHorta: StatusHorta;
  imageUrl?: string; // A interrogação '?' torna a propriedade opcional.
  
  // Informações do Solicitante
  nomeUsuario: string;
  cpfUsuario: string;
  emailUsuario: string;
  telefoneUsuario: string;
  dataNascimentoUsuario: string; // Idealmente, seria do tipo Date, mas a API envia string.
  escolaridadeUsuario: string;
  enderecoUsuario: string;
  ativoUsuario: boolean;
  funcaoUniEnsino?: string;

  // Detalhes da Horta
  nomeTipoDeHorta: string;
  tamanhoAreaProducao: number;
  endereco: string;
  parceria: string;
  dataCriacao: string;

  // Grupo e Atividades
  qntPessoas: number;
  atividadeDescricao?: string;
}