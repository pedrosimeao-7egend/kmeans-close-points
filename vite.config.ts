import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig({
  plugins: [
    // Para garantir compatibilidade com browsers mais antigos (se necessário)
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
  ],
  optimizeDeps: {
    exclude: ["src/lib/heatmap.js"], // Exclui a biblioteca UMD da otimização
  },
  build: {
    rollupOptions: {
      output: {
        format: "umd", // Garante que o formato UMD seja mantido
        globals: {
          "heatmap.js": "h337", // Nome global do módulo UMD
        },
      },
    },
  },
});
