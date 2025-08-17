// src/components/Footer.jsx
import React from 'react';
import logoSeau from '../assets/images/logo_seau.png';
import logoWpp from '../assets/images/logo-whatsapp.svg';
import logoInstagram from '../assets/images/logo-instagram.svg';

const Footer = () => {
  return (
    <footer className="bg-[#1D3557] text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between p-6 md:flex-row md:px-8 space-y-4 md:space-y-0">
        <img src={logoSeau} alt="Logo Flor da Cidade" className="h-12" />
        <p className="text-sm text-gray-300">© {new Date().getFullYear()} Flor da Cidade. Todos os direitos reservados.</p>
        <div className="flex gap-4">
          <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-110">
            <img src={logoWpp} alt="WhatsApp" className="h-8" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-110">
            <img src={logoInstagram} alt="Instagram" className="h-8" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;