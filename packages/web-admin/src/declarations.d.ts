// src/declarations.d.ts

// Isso diz ao TypeScript: "Sempre que você vir uma importação terminando com .png,
// trate-a como um módulo que tem um 'export default' de uma string (o caminho para a imagem)."
declare module '*.png' {
  const value: string;
  export default value;
}

// Você pode adicionar outras extensões aqui também, se precisar.
declare module '*.svg';
declare module '*.jpeg';
declare module '*.jpg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module '*.webp';
declare module '*.ico';
declare module '*.cur'; 