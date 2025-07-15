import React from 'react';
import { FaChevronDown } from 'react-icons/fa';

export default function FaqSection() {
  // AJUSTE: Adicionadas as classes `relative` e `z-10` à div principal.
  return (
    <div id="faq" className="relative z-10 bg-white py-12 md:py-16 rounded-3xl shadow-lg px-4 md:px-8">
      <h2 className="text-4xl font-extrabold text-[#1D3557] text-center mb-12">Perguntas Frequentes</h2>
      <div className="space-y-4 max-w-4xl mx-auto">
        <details className="group bg-white p-6 rounded-lg shadow-lg">
          <summary className="font-semibold text-lg text-[#1D3557] cursor-pointer list-none flex justify-between items-center">
            Qual é a nossa missão?
            <FaChevronDown className="transform transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <div className="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-all duration-500 ease-in-out">
            <div className="overflow-hidden">
              <p className="pt-4 text-gray-600 text-justify">Promover a agricultura urbana e desenvolvimento sustentável para a cidade, a partir da articulação, capacitação, fomento e execução de ações agroecológicas, que promovam uma mudança de paradigmas e a melhoria da qualidade de vida das pessoas com o envolvimento da população e o aproveitamento de áreas propícias ao cultivo.</p>
            </div>
          </div>
        </details>
        
        <details className="group bg-white p-6 rounded-lg shadow-lg">
          <summary className="font-semibold text-lg text-[#1D3557] cursor-pointer list-none flex justify-between items-center">
            O que é nosso Plano de Agroecologia Urbana?
            <FaChevronDown className="transform transition-transform duration-300 group-open:rotate-180" />
          </summary>
           <div className="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-all duration-500 ease-in-out">
            <div className="overflow-hidden">
              <p className="pt-4 text-gray-600 text-justify">É um conjunto de estratégias e ações voltadas para o fortalecimento da agricultura urbana no Recife, buscando a soberania alimentar, a geração de renda e a sustentabilidade ambiental em áreas urbanas.</p>
            </div>
          </div>
        </details>
        
        <details className="group bg-white p-6 rounded-lg shadow-lg">
          <summary className="font-semibold text-lg text-[#1D3557] cursor-pointer list-none flex justify-between items-center">
            Como solicitar apoio para minha horta?
            <FaChevronDown className="transform transition-transform duration-300 group-open:rotate-180" />
          </summary>
           <div className="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-all duration-500 ease-in-out">
            <div className="overflow-hidden">
              <p className="pt-4 text-gray-600 text-justify">Se você representa uma instituição pública ou organização comunitária, possui um grupo de no mínimo 3 pessoas e um espaço com água e sol, pode clicar no botão "Solicitar Acompanhamento" na seção "Nossos Acolhimentos" para iniciar o processo.</p>
            </div>
          </div>
        </details>
        
        <details className="group bg-white p-6 rounded-lg shadow-lg">
          <summary className="font-semibold text-lg text-[#1D3557] cursor-pointer list-none flex justify-between items-center">
            Quais cursos estão disponíveis?
            <FaChevronDown className="transform transition-transform duration-300 group-open:rotate-180" />
          </summary>
           <div className="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-all duration-500 ease-in-out">
            <div className="overflow-hidden">
              <p className="pt-4 text-gray-600 text-justify">Oferecemos cursos em parceria com a SEAU e outras instituições. A lista completa e atualizada está disponível na seção "Cursos" em nossa página. Fique de olho para novas turmas e oportunidades!</p>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}