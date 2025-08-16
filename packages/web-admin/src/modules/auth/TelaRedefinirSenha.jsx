import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../services/api';
import { FiKey, FiLoader, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';

export default function TelaRedefinirSenha() {
  const { token } = useParams(); // Pega o token da URL
  const navigate = useNavigate();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Token de redefinição inválido ou ausente.");
      navigate('/recuperar-senha');
    }
  }, [token, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (novaSenha.length < 8) {
      toast.error("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post('/tecnicos/redefinir-senha', { token, novaSenha });
      toast.success("Senha redefinida com sucesso!");
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/'); // Redireciona para o login após 3 segundos
      }, 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.mensagem || error.response?.data || "Token inválido ou expirado. Por favor, solicite uma nova redefinição.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSuccess) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 font-poppins">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
                <FiCheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Senha Redefinida!</h2>
                <p className="text-gray-600">Você será redirecionado para a tela de login em alguns instantes.</p>
                <Link to="/" className="font-medium text-sm text-green-700 hover:text-green-600">Ir para o Login agora</Link>
            </div>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 font-poppins">
      <ToastContainer position="top-right" autoClose={5000} theme="colored" />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <FiKey className="mx-auto h-12 w-12 text-green-600" />
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Crie uma Nova Senha
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sua nova senha deve ser forte e diferente das anteriores.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Nova Senha */}
          <div>
            <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
            <div className="relative">
              <input
                id="novaSenha"
                name="novaSenha"
                type={mostrarSenha ? "text" : "password"}
                required minLength={8}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                {mostrarSenha ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          
          {/* Campo Confirmar Senha */}
          <div>
            <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
            <input
              id="confirmarSenha"
              name="confirmarSenha"
              type="password"
              required
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <FiLoader className="animate-spin h-5 w-5" /> : 'Redefinir Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}