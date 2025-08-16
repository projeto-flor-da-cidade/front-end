// src/components/AccessibilityMenu.jsx
import React from 'react';
import { 
  FaSearchPlus, 
  FaSearchMinus, 
  FaAdjust, 
  FaTimes, 
  FaVolumeUp 
} from 'react-icons/fa';

const AccessibilityMenu = ({ onClose, fontHandlers, darkModeHandler, ttsHandler }) => {
  return (
    <div className="absolute top-full right-4 mt-2 w-72 bg-white rounded-xl shadow-2xl p-4 border border-gray-200 text-[#1D3557] z-[1000]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Acessibilidade</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
      </div>
      <ul className="space-y-2">
        <li><button onClick={fontHandlers.increase} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"><FaSearchPlus /> Aumentar Fonte</button></li>
        <li><button onClick={fontHandlers.decrease} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"><FaSearchMinus /> Diminuir Fonte</button></li>
        <li><button onClick={darkModeHandler.toggle} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"><FaAdjust /> {darkModeHandler.isDarkMode ? 'Desativar' : 'Ativar'} Modo Noturno</button></li>
        <li><button onClick={ttsHandler.toggle} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"><FaVolumeUp /> {ttsHandler.isTtsEnabled ? 'Desativar' : 'Ativar'} Leitura por Voz</button></li>
      </ul>
      <button onClick={onClose} className="mt-4 w-full rounded-lg bg-[#F4D35E] px-4 py-2 font-bold text-[#1D3557] transition hover:bg-[#e5c94f]">Fechar</button>
    </div>
  );
};

export default AccessibilityMenu;