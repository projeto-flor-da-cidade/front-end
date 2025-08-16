// src/services/curso.service.ts

import axios from 'axios';
import { CursoRequest, CursoResponse, CursoUpdate } from '../types/api.types';

// Supondo que a configuração do axios venha de um arquivo central
// Se você me passar o seu 'api.js', eu ajusto esta parte.
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // URL base da sua API
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Funções do Serviço de Cursos ---

/**
 * Busca todos os cursos ativos.
 */
export const getAllCursos = async (): Promise<CursoResponse[]> => {
  const { data } = await api.get('/cursos');
  return data;
};

/**
 * Busca um curso específico pelo ID.
 */
export const getCursoById = async (id: number): Promise<CursoResponse> => {
  const { data } = await api.get(`/cursos/${id}`);
  return data;
};

/**
 * Cria um novo curso.
 * Lida com o upload de arquivo de banner.
 */
export const createCurso = async (cursoData: CursoRequest, bannerFile?: File): Promise<CursoResponse> => {
  const formData = new FormData();

  // O DTO precisa ser enviado como uma string JSON sob a chave 'cursoDTO'
  // conforme o backend com @RequestPart provavelmente espera.
  formData.append('cursoDTO', new Blob([JSON.stringify(cursoData)], { type: 'application/json' }));

  if (bannerFile) {
    formData.append('bannerFile', bannerFile);
  }

  const { data } = await api.post('/cursos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Sobrescreve o header para esta requisição
    },
  });

  return data;
};

/**
 * Atualiza um curso existente.
 * Lida com a possibilidade de um novo upload de banner.
 */
export const updateCurso = async (id: number, cursoData: CursoUpdate, bannerFile?: File): Promise<CursoResponse> => {
    const formData = new FormData();

    formData.append('cursoUpdateDTO', new Blob([JSON.stringify(cursoData)], { type: 'application/json' }));

    if (bannerFile) {
        formData.append('bannerFile', bannerFile);
    }

    const { data } = await api.put(`/cursos/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return data;
}

/**
 * Deleta um curso pelo ID.
 */
export const deleteCurso = async (id: number): Promise<void> => {
  await api.delete(`/cursos/${id}`);
}