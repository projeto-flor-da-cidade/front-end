import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../services/api';
import { FiMail, FiLoader, FiCheckCircle, FiChevronLeft } from 'react-icons/fi';

export default function TelaSolicitarRecuperacao() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      await api.post('/tecnicos/esqueci-senha', { email });
      setSuccessMessage('Se um e-mail correspondente for encontrado, um link de recuperação será enviado. Por favor, verifique sua caixa de entrada e spam.');
      setEmail(''); // Limpa o campo após o sucesso
    } catch (error) {
      // Por segurança, mesmo em caso de erro (ex: e-mail não encontrado), mostramos uma mensagem genérica.
      // Isso previne que alguém use este formulário para descobrir quais e-mails estão cadastrados.
      setSuccessMessage('Se um e-mail correspondente for encontrado, um link de recuperação será enviado. Por favor, verifique sua caixa de entrada e spam.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 font-poppins">
      <ToastContainer position="top-right" autoClose={5000} theme="colored" />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <FiMail className="mx-auto h-12 w-12 text-green-600" />
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Recuperar Senha
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Digite seu e-mail de cadastro e enviaremos um link para você criar uma nova senha.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">Endereço de e-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="seu.email@exemplo.com"
              disabled={isLoading || !!successMessage}
            />
          </div>

          {successMessage && (
            <div className="flex items-start p-4 bg-green-50 text-green-800 rounded-lg">
              <FiCheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <p className="text-sm">{successMessage}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !!successMessage}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <FiLoader className="animate-spin h-5 w-5" /> : 'Enviar Link de Recuperação'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link
            to="/"
            className="font-medium text-sm text-green-700 hover:text-green-600 inline-flex items-center"
          >
            <FiChevronLeft className="mr-1 h-4 w-4" />
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}