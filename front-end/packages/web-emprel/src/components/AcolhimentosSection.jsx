import React from 'react';
import MapComponent from './MapComponent.jsx';

// ALTERAÇÃO: O componente agora aceita a prop 'onSolicitarClick'
export default function AcolhimentosSection({ onSolicitarClick }) {
  return (
    <div id="acolhimentos" className="relative z-10 bg-white py-12 md:py-16 rounded-3xl shadow-lg px-4 md:px-8">
      <h2 className="text-4xl font-extrabold text-justify text-[#1D3557] mb-5">Nossos Acolhimentos</h2>
      <MapComponent isEmbedded={true} />
      <div className="max-w-4xl mx-auto text-center mt-12">
        <h2 className="text-3xl font-bold text-[#1D3557] mb-6">Solicite Apoio Para Sua Horta</h2>
        <p className="font-semibold mb-4 text-lg">Requisitos para solicitar a implantação ou apoio:</p>
        <ol className="list-decimal list-outside inline-block text-left ml-5 space-y-2 mb-8 text-gray-700">
          <li>Ser uma instituição pública ou organização comunitária.</li>
          <li>Ter no mínimo 3 participantes engajados no projeto.</li>
          <li>Dispor de um espaço com acesso à água e sol.</li>
        </ol>
        <div>
          {/* ALTERAÇÃO: O link agora é um botão que dispara o evento onClick */}
          <button 
            onClick={onSolicitarClick} 
            className="inline-block rounded-full bg-[#F4D35E] px-8 py-3 font-bold text-[#1D3557] text-lg transition-transform duration-300 hover:scale-105 hover:bg-[#FFE46B]"
          >
            Solicitar Acompanhamento!
          </button>
        </div>
      </div>
    </div>
  );
}