// ✅ ARQUITETURA CORRETA: Importamos a instância ÚNICA e centralizada do Axios.
// Isso garante que estamos usando a baseURL correta definida no arquivo .env.
import api from './api';
import { CursoRequest, CursoResponse, CursoUpdate } from '../types/api.types';

// --- Funções do Serviço de Cursos ---

/**
 * Busca todos os cursos disponíveis na API.
 * @returns Uma promessa que resolve para um array de CursoResponse.
 */
export const getAllCursos = async (): Promise<CursoResponse[]> => {
  try {
    const { data } = await api.get<CursoResponse[]>('/cursos');
    return data;
  } catch (error) {
    console.error("Falha ao buscar cursos:", error);
    throw error; // Lança o erro para o componente que chamou poder tratar
  }
};

/**
 * Busca um curso específico pelo seu ID.
 * @param id O ID do curso a ser buscado.
 * @returns Uma promessa que resolve para um único objeto CursoResponse.
 */
export const getCursoById = async (id: number): Promise<CursoResponse> => {
  try {
    const { data } = await api.get<CursoResponse>(`/cursos/${id}`);
    return data;
  } catch (error) {
    console.error(`Falha ao buscar curso com ID ${id}:`, error);
    throw error;
  }
};

/**
 * Cria um novo curso, lidando com o upload de um banner opcional.
 * @param cursoData Os dados do curso a serem criados (do formulário).
 * @param bannerFile O arquivo de imagem do banner (opcional).
 * @returns Uma promessa que resolve para o CursoResponse do curso recém-criado.
 */
export const createCurso = async (cursoData: CursoRequest, bannerFile?: File): Promise<CursoResponse> => {
  const formData = new FormData();

  // ✅ CORRIGIDO: O nome da parte ('curso') agora corresponde ao @RequestPart("curso") do Controller.
  formData.append('curso', new Blob([JSON.stringify(cursoData)], { type: 'application/json' }));

  if (bannerFile) {
    // ✅ CORRIGIDO: O nome da parte ('banner') agora corresponde ao @RequestPart("banner") do Controller.
    formData.append('banner', bannerFile);
  }

  try {
    // ✅ CORRIGIDO: O header 'Content-Type' foi REMOVIDO.
    // O navegador irá defini-lo automaticamente com o 'boundary' correto para multipart/form-data.
    const { data } = await api.post<CursoResponse>('/cursos', formData);
    return data;
  } catch (error) {
    console.error("Falha ao criar curso:", error);
    throw error;
  }
};

/**
 * Atualiza um curso existente, lidando com a troca opcional do banner.
 * @param id O ID do curso a ser atualizado.
 * @param cursoData Os dados do curso a serem atualizados.
 * @param bannerFile O novo arquivo de imagem do banner (opcional).
 * @returns Uma promessa que resolve para o CursoResponse do curso atualizado.
 */
export const updateCurso = async (id: number, cursoData: CursoUpdate, bannerFile?: File): Promise<CursoResponse> => {
    const formData = new FormData();

    // ✅ CORRIGIDO: O nome da parte ('curso') corresponde ao @RequestPart("curso").
    formData.append('curso', new Blob([JSON.stringify(cursoData)], { type: 'application/json' }));

    if (bannerFile) {
        // ✅ CORRIGIDO: O nome da parte ('banner') corresponde ao @RequestPart("banner").
        formData.append('banner', bannerFile);
    }

    try {
        // ✅ CORRIGIDO: O header 'Content-Type' foi REMOVIDO.
        const { data } = await api.put<CursoResponse>(`/cursos/${id}`, formData);
        return data;
    } catch (error) {
        console.error(`Falha ao atualizar curso com ID ${id}:`, error);
        throw error;
    }
}

/**
 * Deleta um curso pelo seu ID.
 * @param id O ID do curso a ser deletado.
 */
export const deleteCurso = async (id: number): Promise<void> => {
  try {
    await api.delete(`/cursos/${id}`);
  } catch (error) {
    console.error(`Falha ao deletar curso com ID ${id}:`, error);
    throw error;
  }
}