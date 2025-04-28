import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

export default defineConfig({
  define: {
    "process.env.VITE_API_URL": JSON.stringify(
      process.env.VITE_API_URL ||
        "https://property-rental-and-selling.onrender.com"
    ),
  },
  server: {
    proxy: {
      "/api": {
        target:
          process.env.VITE_API_URL ||
          "https://property-rental-and-selling.onrender.com",
        secure: false,
        changeOrigin: true,
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
