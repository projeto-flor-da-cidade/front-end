import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App";
import "./styles/index.css";

// A variável 'base' é lida diretamente do arquivo de configuração do Vite.
// Isso evita ter que escrever "/admin" em dois lugares diferentes.
// A sintaxe import.meta.env.BASE_URL é fornecida pelo Vite.
const base = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* 
      AQUI ESTÁ A ATUALIZAÇÃO:
      A propriedade 'basename' sincroniza o React Router com a configuração 'base' do Vite.
      Agora, o roteador entende que a aplicação vive dentro do subdiretório /admin.
    */}
    <BrowserRouter basename={base}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);