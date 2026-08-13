import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.join(projectRoot, "firebase-site"),
  plugins: [react()],
  resolve: {
    alias: { "@": path.join(projectRoot, "src") },
  },
  build: {
    outDir: path.join(projectRoot, "firebase-dist"),
    emptyOutDir: true,
  },
});
