// Caminho: seu-projeto-frontend/src/App.js

import React from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";

// --- COMPONENTES DE LAYOUT E AUTENTICAÇÃO ---
import Header from "./modules/Home/components/Header";
import PrivateRoute from "./components/PrivateRoute";
import RedirectIfAuth from "./components/RedirectIfAuth";

// --- PÁGINAS GERAIS E DE AUTENTICAÇÃO ---
import Home from "./modules/Home/Home";
import TelaDeLoginAdmin from "./modules/auth/TelaDeLoginAdmin";
import TelaSolicitarRecuperacao from "./modules/auth/TelaSolicitarRecuperacao";
import TelaRedefinirSenha from "./modules/auth/TelaRedefinirSenha";

// --- PÁGINAS DA APLICAÇÃO ---
import TelaDeSolicitacaoHortas from "./modules/Solicitacoes/hortas/TelaDeSolicitacaoHortas";
import TelaDeDescricaoDeSolicitacaoHortas from "./modules/Solicitacoes/hortas/TelaDeDescricaoDeSolicitacaoHortas";
import TelaEdicaoHorta from "./modules/Solicitacoes/hortas/TelaEdicaoHorta";
import TelaEdicaoUsuario from "./modules/usuarios/TelaEdicaoUsuario"; // Ajustado para a pasta 'usuarios'
import TelaHortasAtivas from "./modules/Solicitacoes/hortas/TelaHortasAtivas";
import TelaDeCadastroDeCurso from "./modules/Solicitacoes/cursos/TelaDeCadastroDeCurso";
import TelaDeCursosAtivos from "./modules/Solicitacoes/cursos/TelaDeCursosAtivos";
import TelaDeEdicaoDeCursos from "./modules/Solicitacoes/cursos/TelaDeEdicaoDeCursos";
import TelaDeInscritos from "./modules/Solicitacoes/cursos/TelaDeInscritos";
import TelaDeRelatorios from "./modules/relatorios/TelaDeRelatorios";
import CriarModeloRelatorio from "./modules/relatorios/SubTelasRelatorio/CriarModeloRelatorio";
import CriarRelatorioAcolhimento from "./modules/relatorios/SubTelasRelatorio/CriarRelatorioAcolhimento";
import CriarRelatorioAcompanhamento from "./modules/relatorios/SubTelasRelatorio/CriarRelatorioAcompanhamento";
import EditarRelatorio from "./modules/relatorios/SubTelasRelatorio/EditarRelatorio";
import TelaCadastroTecnico from "./modules/tecnico/TelaCadastroTecnico";

/**
 * ProtectedLayout é um componente que define a estrutura visual
 * para todas as páginas que exigem autenticação.
 * Ele renderiza o Header e, em seguida, a página da rota atual através do <Outlet />.
 * Como este layout é renderizado dentro de <PrivateRoute />, o Header
 * automaticamente ganha acesso ao AuthContext.
 */
function ProtectedLayout() {
  return (
    <>
      <Header />
      <main className="pt-16"> {/* padding-top para não ficar embaixo do Header fixo */}
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ========================================================== */}
      {/* ROTAS PÚBLICAS (Acessíveis apenas para usuários não logados) */}
      {/* ========================================================== */}
      <Route element={<RedirectIfAuth />}>
        <Route path="/" element={<TelaDeLoginAdmin />} />
        <Route path="/recuperar-senha" element={<TelaSolicitarRecuperacao />} />
        <Route path="/redefinir-senha/:token" element={<TelaRedefinirSenha />} />
      </Route>

      {/* ========================================================== */}
      {/* ROTAS PROTEGIDAS (Acessíveis apenas para usuários logados)   */}
      {/* ========================================================== */}
      <Route element={<PrivateRoute />}>
        <Route path="/app" element={<ProtectedLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="tela-de-solicitacao-hortas" element={<TelaDeSolicitacaoHortas />} />
          <Route path="tela-de-descricao-de-solicitacao-hortas/:id" element={<TelaDeDescricaoDeSolicitacaoHortas />} />
          <Route path="tela-hortas-ativas" element={<TelaHortasAtivas />} />
          <Route path="hortas-editar/:id" element={<TelaEdicaoHorta />} />
          <Route path="usuarios-editar/:id" element={<TelaEdicaoUsuario />} />
          <Route path="tela-de-cadastro-de-curso" element={<TelaDeCadastroDeCurso />} />
          <Route path="tela-de-cursos-ativos" element={<TelaDeCursosAtivos />} />
          <Route path="tela-de-edicao-de-cursos/:id" element={<TelaDeEdicaoDeCursos />} />
          <Route path="tela-de-inscritos/:courseId" element={<TelaDeInscritos />} />
          <Route path="tela-de-relatorios" element={<TelaDeRelatorios />} />
          <Route path="criar-modelo-relatorio" element={<CriarModeloRelatorio />} />
          <Route path="criar-relatorio-acolhimento" element={<CriarRelatorioAcolhimento />} />
          <Route path="criar-relatorio-acompanhamento" element={<CriarRelatorioAcompanhamento />} />
          <Route path="editar-relatorio/:id" element={<EditarRelatorio />} />
          <Route path="tela-de-cadastro-tecnico" element={<TelaCadastroTecnico />} />
          {/* Redireciona qualquer rota protegida inválida para a home do app */}
          <Route path="*" element={<Navigate to="home" replace />} />
        </Route>
      </Route>

      {/* Redireciona qualquer outra rota inválida para a raiz (login) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}