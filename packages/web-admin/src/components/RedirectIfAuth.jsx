// src/components/RedirectIfAuth.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Podemos reutilizar o mesmo spinner ou ter um mais simples
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-white">
    <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
);

/**
 * Redireciona o usuário para o dashboard se ele já estiver autenticado.
 * Usado para proteger rotas públicas que não fazem sentido para usuários logados, como a página de login.
 */
const RedirectIfAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    // Se o usuário já está logado, redireciona para a página principal da aplicação.
    return <Navigate to="/app/home" replace />;
  }

  // Se não estiver logado, permite o acesso à rota pública (ex: /login).
  return <Outlet />;
};

export default RedirectIfAuth;