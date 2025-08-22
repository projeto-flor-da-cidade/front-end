// Caminho: src/components/PrivateRoute.jsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-white">
    <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
);

export default function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Enquanto o AuthContext está verificando a sessão, mostramos um spinner.
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Se o usuário NÃO estiver autenticado, ele é redirecionado para a
  // rota raiz "/", que é a sua página de login.
  // Esta é a lógica que será acionada reativamente após o logout.
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Se o usuário estiver autenticado, renderiza a rota filha (o ProtectedLayout).
  return <Outlet />;
};