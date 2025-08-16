import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Esta linha define que o servidor e o build devem operar
  // a partir do subdiretório /admin/.
  base: '/admin/',

  // Configuração opcional de porta para o servidor de desenvolvimento.
  server: {
    port: 5175,
  },
});