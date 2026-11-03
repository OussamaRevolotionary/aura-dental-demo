import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  /* relative base: the same build works at a domain root or under /repo-name/ on GitHub Pages */
  base: "./",
  plugins: [react()],
  server: { port: 5173 },
});
