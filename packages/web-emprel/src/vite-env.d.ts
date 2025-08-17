// src/vite-env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ADMIN_URL: string;
  // Adicione outras variáveis de ambiente que você usar aqui
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}