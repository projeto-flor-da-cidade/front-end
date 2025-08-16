import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
const USER_STORAGE_KEY = 'flor_da_cidade_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (!storedUser) {
        setIsLoading(false);
        return;
      }
      const parsedUser = JSON.parse(storedUser);
      try {
        await api.get(`/tecnicos/${parsedUser.idTecnico}`);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    verifySession();
  }, []);

  const login = async (matricula, senha) => {
    // Esta linha está correta e funcionando, como provado pela imagem da network.
    const response = await api.post('/login', { matricula, senha });
    const loggedInUser = response.data;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error("Erro na chamada de logout da API, mas o logout local prosseguirá.", error);
    } finally {
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = { user, isAuthenticated, isLoading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;