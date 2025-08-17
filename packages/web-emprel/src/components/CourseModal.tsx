// src/components/CourseModal.tsx

import React from 'react';
import { FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import { CursoResponse } from '../types/api.types';

interface CourseModalProps {
  course: CursoResponse;
  onClose: () => void;
  onInscricaoClick: () => void;
}

const CourseModal: React.FC<CourseModalProps> = ({ course, onClose, onInscricaoClick }) => {
  if (!course) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não informada';
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return 'Data inválida';
    }
  };

  const handleInscricao = () => {
    onInscricaoClick();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[1001] flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="course-modal-content w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors">
          <FaTimes size={24} />
        </button>

        <span className="inline-block bg-[#F4D35E] text-[#1D3557] font-bold text-sm px-3 py-1 rounded-full mb-4">
          {course.tipoAtividade}
        </span>
        <h2 className="text-3xl font-extrabold text-[#1D3557] mb-4">{course.nome}</h2>

        <div className="space-y-4 text-gray-700">
          <div className="flex items-center gap-3 text-lg">
            <FaMapMarkerAlt className="text-[#F4D35E] flex-shrink-0" />
            <span>{course.local}</span>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="mb-4"><strong>Descrição:</strong> {course.descricao}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <p><strong>Instituição:</strong> {course.instituicao}</p>
              <p><strong>Público-alvo:</strong> {course.publicoAlvo}</p>
              <p><strong>Inscrições:</strong> {formatDate(course.dataInscInicio)} a {formatDate(course.dataInscFim)}</p>
              <p><strong>Período do curso:</strong> {formatDate(course.dataInicio)} a {formatDate(course.dataFim)}</p>
              <p><strong>Turno:</strong> {course.turno}</p>
              <p><strong>Vagas:</strong> Até {course.maxPessoas} pessoas</p>
              <p className="md:col-span-2"><strong>Carga Horária:</strong> {course.cargaHoraria} horas</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end items-center gap-4">
          <button
            onClick={handleInscricao}
            className="rounded-lg bg-[#F4D35E] text-[#1D3557] px-6 py-2 font-bold transition hover:bg-opacity-90 hover:scale-105"
          >
            Inscrever-se
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-[#1D3557] text-white px-6 py-2 font-bold transition hover:bg-opacity-90"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;