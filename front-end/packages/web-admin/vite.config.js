import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // OBRIGATÓRIO PARA PRODUÇÃO:
  // Informa ao Vite que em produção esta aplicação será servida
  // a partir do subdiretório /admin/
  base: '/admin/',

  // Opcional para desenvolvimento:
  // Garante que o servidor de dev sempre tente usar a porta 5175.
  // Se remover este bloco, o Vite escolherá uma porta livre automaticamente.
  server: {
    port: 5175,
  },
});