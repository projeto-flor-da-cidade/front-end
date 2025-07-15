import React from 'react';
import AccessibilityMenu from './AccessibilityMenu';
import logoSeau from '../assets/images/logo_seau.png';
import logoInfo from '../assets/images/logo_info.png';

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL;

const Header = ({ isMenuOpen, onMenuToggle, accessibilityHandlers, onNavClick }) => {
  return (
    <header className="bg-[#1D3557] text-white shadow-md sticky top-0 z-[999]">
      {/* 
        MUDANÇA PRINCIPAL AQUI:
        - Removido 'max-w-7xl' e 'mx-auto'
        - Isso permite que o container do header ocupe 100% da largura da tela,
          eliminando as margens brancas ao dar zoom out.
        - Mantemos o padding (px-4 e md:px-8) para o conteúdo não colar nas bordas.
      */}
      <div className="relative mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        
        {/* Logo */}
        <div className="flex-shrink-0">
          <a href="/" aria-label="Página Inicial">
            <img src={logoSeau} alt="Logo Flor da Cidade" className="h-16" />
          </a>
        </div>

        {/* Título Central */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <h1 className="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl">
            Flor da Cidade
          </h1>
        </div>

        {/* Container de Botões */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Botão Sobre */}
          <a 
            href="#contato" 
            onClick={(e) => onNavClick(e, '#contato')}
            className="flex items-center gap-2 rounded-lg bg-[#F4D35E] px-3 py-2 font-bold text-[#1D3557] transition hover:bg-[#e5c94f]"
          >
            <img src={logoInfo} alt="Informações" className="h-5" />
            <span className="hidden sm:inline">Sobre</span>
          </a>

          {/* Botão Acessibilidade */}
          <button 
            onClick={onMenuToggle} 
            className="rounded-lg bg-[#F4D35E] px-4 py-2 font-bold text-[#1D3557] transition hover:bg-[#e5c94f]"
          >
            <span className="md:hidden">Menu</span>
            <span className="hidden md:inline">Acessibilidade</span>
          </button>
          
          {/* Botão Acesso Restrito */}
          <a
            href={ADMIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-lg border-2 border-[#F4D35E] px-4 py-1.5 font-bold text-[#F4D35E] transition hover:bg-[#F4D35E] hover:text-[#1D3557] md:flex"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2a5 5 0 00-5 5v2H4a2 2 0 00-2 2v5a2 2 0 002 2h12a2 2 0 002-2v-5a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm0 2.5a2.5 2.5 0 012.5 2.5V7h-5V7a2.5 2.5 0 012.5-2.5z"></path>
            </svg>
            Acesso Restrito
          </a>
        </div>

        {isMenuOpen && <AccessibilityMenu onClose={onMenuToggle} {...accessibilityHandlers} />}
      </div>
    </header>
  );
};

export default Header;