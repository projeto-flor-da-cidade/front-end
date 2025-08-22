// Caminho: src/modules/Home/components/Header.jsx

import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom"; // useNavigate foi removido
import { FaBars, FaTimes } from "react-icons/fa";
import userIcon from "../../../assets/person-circle-outline.svg";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { useAuth } from "../../../contexts/AuthContext";

const headerMenu = [
    {
        label: "Serviços",
        items: [
          { name: "Solicitações de Hortas", to: "/app/tela-de-solicitacao-hortas", enabled: true },
          { name: "Cadastro de Cursos",    to: "/app/tela-de-cadastro-de-curso",    enabled: true },
        ],
      },
      {
        label: "Consultas",
        items: [
          { name: "Hortas Ativas", to: "/app/tela-hortas-ativas", enabled: true },
          { name: "Cursos Ativos", to: "/app/tela-de-cursos-ativos", enabled: true },
          { name: "Registros de Solicitações", to: "#", enabled: false },
          { name: "Registros de Cursos",       to: "#", enabled: false },
        ],
      },
      {
        label: "Ferramentas",
        items: [
          { name: "Usuários",      to: "/app/tela-de-cadastro-tecnico",  enabled: true },
          { name: "Configurações", to: "#",                  enabled: false },
          { name: "Relatórios",    to: "/app/tela-de-relatorios", enabled: true },
        ],
    },
];

const NavLink = ({ to, name, location, setOpenDropdown, setMobileOpen }) => (
  <Link
    to={to}
    onClick={() => {
      if (setOpenDropdown) setOpenDropdown(null);
      if (setMobileOpen) setMobileOpen(false);
    }}
    className={`block w-full text-left px-4 py-2 font-open-sans text-[16px] transition-colors duration-150 rounded ${
      location.pathname === to ? "bg-[#b0b49a] font-semibold text-gray-800" : "text-gray-700 hover:bg-[#e0e3d0]"
    }`}
  >
    {name}
  </Link>
);

const DisabledLink = ({ name }) => (
  <span className="block px-4 py-2 font-open-sans text-[16px] text-gray-400 opacity-60 cursor-not-allowed">
    {name}
  </span>
);

export default function Header() {
  const location = useLocation();
  const { logout, user } = useAuth();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const dropdownsRef = useRef(null);
  const userMenuRefMobile = useRef(null);
  const userMenuRefDesktop = useRef(null);
  const mobileMenuAndBurgerRef = useRef(null);

  useClickOutside(dropdownsRef, () => setOpenDropdown(null));
  useClickOutside(userMenuRefMobile, () => setUserMenuOpen(false));
  useClickOutside(userMenuRefDesktop, () => setUserMenuOpen(false));
  useClickOutside(mobileMenuAndBurgerRef, (event) => {
    if (mobileMenuAndBurgerRef.current && !mobileMenuAndBurgerRef.current.contains(event.target)) {
        setMobileOpen(false);
    }
  });
  
  const userName = user?.nome?.split(" ")[0] || "Usuário";

  // ======================= INÍCIO DA CORREÇÃO =======================
  // A função de logout agora é síncrona e apenas dispara a ação no AuthContext.
  // Ela não é mais responsável pela navegação. A navegação ocorrerá
  // de forma reativa no PrivateRoute quando o estado 'isAuthenticated' mudar.
  const handleLogout = () => {
    logout();
    // Apenas fecha os menus para feedback visual imediato.
    setUserMenuOpen(false); 
    setMobileOpen(false); 
  };
  // ======================== FIM DA CORREÇÃO =========================

  return (
    <header ref={mobileMenuAndBurgerRef} className="fixed inset-x-0 top-0 bg-[#d9d9d9] shadow-md z-50">
      <div className="relative max-w-7xl mx-auto h-16 flex items-center px-4 sm:px-6 lg:px-8">

        {/* ----- MOBILE LEFT: user icon ----- */}
        <div className="flex items-center md:hidden">
          <div ref={userMenuRefMobile} className="relative">
            <button onClick={() => setUserMenuOpen(o => !o)} aria-haspopup="true" aria-expanded={userMenuOpen} className="flex items-center gap-2 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#699530]">
              <img src={userIcon} alt="Menu do usuário" className="w-9 h-9" />
            </button>
            <ul className={`absolute left-0 top-full mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-50 transition-all duration-200 ease-out origin-top-left ${userMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 font-open-sans text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  Sair
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* ----- CENTER: title ----- */}
        <Link to="/app/home" className="absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#699530] rounded-sm">
          <span className="text-[#699530] font-anton font-bold text-lg sm:text-xl md:text-2xl leading-none block">
            Flor da Cidade
          </span>
          <span className="text-[#699530] font-anton font-bold text-lg sm:text-xl md:text-2xl leading-none block">
            ADMIN
          </span>
        </Link>

        {/* ----- RIGHT: desktop nav + user + burger ----- */}
        <div className="ml-auto flex items-center">
            <nav className="hidden md:flex items-center space-x-4" ref={dropdownsRef}>
              {headerMenu.map(({ label, items }, idx) => (
                  <div key={label} className="relative">
                  <button
                      onClick={() => setOpenDropdown(openDropdown === idx ? null : idx)}
                      aria-haspopup="true"
                      aria-expanded={openDropdown === idx}
                      className={`font-open-sans font-bold text-[18px] px-3 py-1.5 rounded-md transition-colors duration-150 ${
                      items.some(i => i.enabled && location.pathname.startsWith(i.to.substring(0, i.to.lastIndexOf('/')) || i.to )) ? "bg-[#c0c4b0] text-gray-800" : "text-gray-700 hover:bg-[#e0e3d0]"
                      } focus:outline-none focus:ring-2 focus:ring-[#699530] focus:ring-offset-1`}
                  >
                      {label}
                  </button>
                  <ul className={`absolute top-full left-0 mt-2 w-60 bg-white shadow-lg rounded-md py-1 z-50 transition-all duration-200 ease-out origin-top
                      ${openDropdown === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                      {items.map(({ name, to, enabled }) => (
                      <li key={name}>
                          {enabled ? <NavLink to={to} name={name} location={location} setOpenDropdown={setOpenDropdown} /> : <DisabledLink name={name} />}
                      </li>
                      ))}
                  </ul>
                  </div>
              ))}
            </nav>

            <div className="h-6 w-px bg-gray-400 mx-4 hidden md:block" />

            {/* desktop user (visible only on md+) */}
            <div ref={userMenuRefDesktop} className="relative hidden md:block">
                <button 
                  onClick={() => setUserMenuOpen(o => !o)} 
                  aria-haspopup="true" 
                  aria-expanded={userMenuOpen} 
                  className="flex items-center gap-2 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#699530]"
                >
                  <img src={userIcon} alt="Menu do usuário" className="w-9 h-9" />
                  <span className="hidden lg:block text-sm font-medium text-gray-700">{userName}</span>
                </button>
                <ul className={`absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-50 transition-all duration-200 ease-out origin-top-right ${userMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                  <li>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 font-open-sans text-sm text-red-600 hover:bg-red-50 rounded-md"
                      >
                        Sair
                      </button>
                  </li>
                </ul>
            </div>

            {/* burger (mobile) */}
            <button
              className="md:hidden text-gray-700 focus:outline-none ml-4"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Abrir menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
        </div>
      </div>

      {/* mobile dropdown */}
      <div className={`md:hidden bg-white border-t border-gray-200 shadow-lg transition-max-height duration-300 ease-in-out overflow-y-auto ${mobileOpen ? 'max-h-[calc(100vh-4rem)]' : 'max-h-0'}`}>
        <ul className="divide-y divide-y-gray-100 px-2 py-2">
          {headerMenu.map(({ label, items }) => (
            <li key={label} className="py-2">
              <p className="font-open-sans font-semibold text-gray-500 text-xs uppercase px-3 mb-1">{label}</p>
              <div className="space-y-1">
                {items.map(({ name, to, enabled }) =>
                  enabled ? <NavLink key={name} to={to} name={name} location={location} setMobileOpen={setMobileOpen} /> : <DisabledLink key={name} name={name} />
                )}
              </div>
            </li>
          ))}
          <li className="pt-3 mt-2 border-t border-gray-200">
            <button onClick={handleLogout} className="w-full text-left font-open-sans font-semibold text-red-600 p-3 rounded hover:bg-red-50">
              Sair
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
}