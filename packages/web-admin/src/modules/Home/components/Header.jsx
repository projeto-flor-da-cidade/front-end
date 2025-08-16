import React, { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import userIcon from "../../../assets/person-circle-outline.svg";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { useAuth } from "../../../contexts/AuthContext"; // 1. Importado o hook `useAuth`

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

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth(); // 2. Usando o contexto para obter a função logout e os dados do usuário

  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const dropdownsRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileMenuAndBurgerRef = useRef(null);

  useClickOutside(dropdownsRef, () => setOpenDropdown(null));
  useClickOutside(userMenuRef, () => setUserMenuOpen(false));
  useClickOutside(mobileMenuAndBurgerRef, (event) => {
    if (mobileMenuAndBurgerRef.current && !mobileMenuAndBurgerRef.current.contains(event.target)) {
        setMobileOpen(false);
    }
  });
  
  // Pega o primeiro nome do usuário diretamente do objeto 'user' do AuthContext
  const userName = user?.nome ? user.nome.split(" ")[0] : "Usuário";

  // 3. Função de logout agora chama a função centralizada do AuthContext
  const handleLogout = async () => {
    setUserMenuOpen(false); 
    setMobileOpen(false); 
    await logout(); // Esta função limpa o estado, o localStorage e chama a API
    navigate("/");  // Após o logout, redireciona para a página de login
  };

  const NavLink = ({ to, name, onClick }) => (
    <Link
      to={to}
      onClick={() => {
        if (onClick) onClick();
        setOpenDropdown(null);
        setMobileOpen(false);
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

  return (
    <header ref={mobileMenuAndBurgerRef} className="fixed inset-x-0 top-0 bg-[#d9d9d9] shadow-md z-50">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <Link to="/app/home" className="flex flex-col items-start focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#699530] rounded-sm">
          <span className="text-[#699530] font-anton font-bold text-lg sm:text-xl md:text-2xl leading-none">
            Flor da Cidade
          </span>
          <span className="text-[#699530] font-anton font-bold text-lg sm:text-xl md:text-2xl leading-none">
            ADMIN
          </span>
        </Link>

        <div className="flex items-center">
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
                          {enabled ? <NavLink to={to} name={name} /> : <DisabledLink name={name} />}
                      </li>
                      ))}
                  </ul>
                  </div>
              ))}
            </nav>

            <div className="h-6 w-px bg-gray-400 mx-4 hidden md:block" />

            <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(o => !o)} aria-haspopup="true" aria-expanded={userMenuOpen} className="flex items-center gap-2 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#699530]">
                  <img src={userIcon} alt="Menu do usuário" className="w-9 h-9" />
                  <span className="hidden lg:block text-sm font-medium text-gray-700">{userName}</span>
                </button>
                <ul className={`absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-50 transition-all duration-200 ease-out origin-top-right
                ${userMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
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

        <button
          className="md:hidden text-gray-700 focus:outline-none ml-4"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      <div className={`md:hidden bg-white border-t border-gray-200 shadow-lg transition-max-height duration-300 ease-in-out overflow-y-auto ${mobileOpen ? 'max-h-[calc(100vh-4rem)]' : 'max-h-0'}`}>
        <ul className="divide-y divide-y-gray-100 px-2 py-2">
          {headerMenu.map(({ label, items }) => (
            <li key={label} className="py-2">
              <p className="font-open-sans font-semibold text-gray-500 text-xs uppercase px-3 mb-1">{label}</p>
              <div className="space-y-1">
                {items.map(({ name, to, enabled }) =>
                  enabled ? <NavLink key={name} to={to} name={name} /> : <DisabledLink key={name} name={name} />
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