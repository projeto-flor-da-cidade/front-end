import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A configuração agora é uma função para detectar o modo (dev vs. build)
export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    
    // Se o comando for 'serve' (desenvolvimento), a base é '/'.
    // Caso contrário (para 'build'), a base será '/admin/'.
    base: command === 'serve' ? '/' : '/admin/',

    server: {
      port: 5175,
    },
  };
});