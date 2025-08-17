import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Um componente de carregamento visual para ser exibido enquanto a sessão é verificada.
 * Melhora a experiência do usuário (UX) ao evitar redirecionamentos abruptos.
 */
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-white">
    <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
);

/**
 * Componente de Rota Privada.
 *
 * Responsabilidades:
 * 1. Consumir o estado de autenticação do AuthContext.
 * 2. Exibir um indicador de carregamento enquanto a sessão está sendo validada (`isLoading`).
 * 3. Renderizar o conteúdo protegido (`<Outlet />`) se o usuário estiver autenticado.
 * 4. Redirecionar para a página de login se o usuário não estiver autenticado.
 */
const PrivateRoute = () => {
  // A "verdade" sobre o status da autenticação vem do nosso hook, não do localStorage.
  const { isAuthenticated, isLoading } = useAuth();

  // 1. O passo mais importante: aguardar a verificação da sessão terminar.
  // Enquanto isLoading for true, o AuthContext ainda está trabalhando.
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 2. Após o carregamento, se o usuário NÃO estiver autenticado, redirecionamos.
  // Sua versão redirecionava para "/", a convenção é usar "/login".
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Se passou pelas verificações acima, o usuário está autenticado e a sessão é válida.
  // Renderizamos o componente filho da rota.
  return <Outlet />;
};

export default PrivateRoute;