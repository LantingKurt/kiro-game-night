import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves this repo from /kiro-game-night/
  base: '/kiro-game-night/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
