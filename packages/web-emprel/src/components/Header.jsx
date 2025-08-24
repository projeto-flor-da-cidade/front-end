import React, { useState, useEffect } from 'react';
import AccessibilityMenu from './AccessibilityMenu';
import logoSeau from '../assets/images/logo_seau.png';

// Esta linha lê a variável de ambiente com o prefixo VITE_
const ADMIN_URL = import.meta.env.VITE_ADMIN_URL;

const Header = ({ isMenuOpen, onMenuToggle, accessibilityHandlers, navLinks = [], onNavClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY !== 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const handleNavLinkClick = (event, targetId) => {
    if (onNavClick) {
      onNavClick(event, targetId);
    }
    if (isMobileNavOpen) {
      toggleMobileNav();
    }
  };

  return (
    <>
      <header
        className={`bg-[#1D3557] text-white shadow-md sticky top-0 z-40 transition-all duration-300 ease-in-out ${
          isScrolled ? 'py-1' : 'py-5'
        }`}
      >
        <div className="relative mx-auto flex items-center justify-between px-4 md:px-8 h-full">
          <div className="flex-shrink-0 z-10">
            <a href="/" aria-label="Página Inicial">
              <img
                src={logoSeau}
                alt="Logo Flor da Cidade"
                className={`transition-all duration-300 ease-in-out ${
                  isScrolled ? 'h-12' : 'h-24'
                }`}
              />
            </a>
          </div>

          <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center divide-x divide-white/30 rounded-lg">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.targetId}
                onClick={(e) => handleNavLinkClick(e, link.targetId)}
                className={`font-bold text-white transition-colors duration-200 ease-in-out whitespace-nowrap hover:bg-[#F4D35E] hover:text-[#1D3557]
                  ${isScrolled ? 'px-4 py-1 text-sm' : 'px-6 py-3 text-base'}
                `}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4 z-10">
            <button onClick={toggleMobileNav} aria-label="Abrir menu de navegação" className="md:hidden p-2 rounded-md text-white hover:bg-white/10">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <button onClick={onMenuToggle} className="hidden md:inline-block rounded-lg bg-[#F4D35E] px-4 py-2 font-bold text-[#1D3557] transition hover:bg-[#e5c94f]">
              Acessibilidade
            </button>
            <a
              href={ADMIN_URL || '#'} 
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-lg border-2 border-[#F4D35E] px-4 py-1.5 font-bold text-[#F4D35E] transition hover:bg-[#F4D35E] hover:text-[#1D3557] md:flex"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a5 5 0 00-5 5v2H4a2 2 0 00-2 2v5a2 2 0 002 2h12a2 2 0 002-2v-5a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm0 2.5a2.5 2.5 0 012.5 2.5V7h-5V7a2.5 2.5 0 012.5-2.5z"></path></svg>
              Acesso Restrito
            </a>
          </div>

          {isMenuOpen && <AccessibilityMenu onClose={onMenuToggle} {...accessibilityHandlers} />}
        </div>
      </header>

      {/* Menu Mobile */}
      <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${ isMobileNavOpen ? 'translate-x-0' : 'translate-x-full' }`}>
        <div className="absolute inset-0 bg-black/50" onClick={toggleMobileNav}></div>
        <div className="relative z-10 flex h-full w-64 flex-col bg-[#1D3557] ml-auto p-6 shadow-xl">
          <div className="flex items-center justify-between mb-8">
             <span className="font-bold text-white text-xl">Navegação</span>
            <button onClick={toggleMobileNav} aria-label="Fechar menu" className="p-2 rounded-md text-white hover:bg-white/10">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => (<a key={link.label} href={link.targetId} onClick={(e) => handleNavLinkClick(e, link.targetId)} className="text-lg font-semibold text-white hover:text-[#F4D35E]">{link.label}</a>))}
            <hr className="border-white/20 my-4" />
            <a href="#" onClick={() => { onMenuToggle(); toggleMobileNav(); }} className="text-lg font-semibold text-white hover:text-[#F4D35E]">Acessibilidade</a>
            <a href={ADMIN_URL || '#'} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-white hover:text-[#F4D35E]">Acesso Restrito</a>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;