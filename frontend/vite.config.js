import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

export default defineConfig({
  server: {
    proxy: {
      "/backend": {
        target: "http://localhost:3000",
        secure: false,
      },
    },
  },

  plugins: [tailwindcss(), react()],

  resolve: {
    alias: {
      crypto: "crypto-browserify",
    },
  },

  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [NodeGlobalsPolyfillPlugin({ buffer: true })],
    },
  },
});
