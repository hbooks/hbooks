import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Disable source maps in production – prevents readable code in DevTools
    sourcemap: false,
    // Minify output (default is true, but we're being explicit)
    minify: true,
    // Optional: use terser for even better minification and to remove console logs
    // minify: 'terser',
    // terserOptions: {
    //   compress: {
    //     drop_console: true, // removes console.log statements in production
    //   },
    // },
  },
}));
