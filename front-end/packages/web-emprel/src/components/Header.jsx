import React from 'react';
import AccessibilityMenu from './AccessibilityMenu';
import logoSeau from '../assets/images/logo_seau.png';
import logoInfo from '../assets/images/logo_info.png';

// Lê a URL do admin a partir do arquivo .env.
const ADMIN_URL = import.meta.env.VITE_ADMIN_URL;

const Header = ({ isMenuOpen, onMenuToggle, accessibilityHandlers, onNavClick }) => {
  return (
    <header className="bg-[#1D3557] text-white shadow-md sticky top-0 z-[999]">
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between p-4 md:px-8">
        
        <div className="flex-shrink-0">
          <a href="/" aria-label="Página Inicial">
            <img src={logoSeau} alt="Logo Flor da Cidade" className="h-16" />
          </a>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <h1 className="text-2xl md:text-3xl font-bold">Flor da Cidade</h1>
        </div>

        <div className="flex items-center gap-4">
          <a 
            href="#contato" 
            onClick={(e) => onNavClick(e, '#contato')}
            className="flex items-center gap-2 rounded-lg bg-[#F4D35E] px-4 py-2 font-bold text-[#1D3557] transition hover:bg-[#e5c94f]"
          >
            <img src={logoInfo} alt="Informações" className="h-5" />
            <span className="hidden sm:inline">Sobre</span>
          </a>

          {/* NOVO BOTÃO: Link para a aplicação de administração */}
          <a
            href={ADMIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700 md:flex"
          >
            Acesso Restrito
          </a>

          <button 
            onClick={onMenuToggle} 
            className="rounded-lg bg-[#F4D35E] px-4 py-2 font-bold text-[#1D3557] transition hover:bg-[#e5c94f]"
          >
            <span className="md:hidden">Menu</span>
            <span className="hidden md:inline">Acessibilidade</span>
          </button>
        </div>

        {isMenuOpen && <AccessibilityMenu onClose={onMenuToggle} {...accessibilityHandlers} />}
      </div>
    </header>
  );
};

export default Header;