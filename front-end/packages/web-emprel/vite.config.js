import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Esta configuração padrão está correta para o projeto principal.
export default defineConfig({
  plugins: [react()],
})