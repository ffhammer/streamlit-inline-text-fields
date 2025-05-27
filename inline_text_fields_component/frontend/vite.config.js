import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // Important for relative paths in the build
  server: {
    port: 3001,
  },
  build: {
    outDir: 'dist', // Output to 'dist' folder
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
}); // <--- REMOVE THE EXTRA PARENTHESIS AND THE package.json content