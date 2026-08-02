/**
 * Vite config for the SSR / prerender build.
 *
 * Intentionally separate from vite.config.ts so that:
 *   - PORT is not required (no dev server is started)
 *   - Only the server-side entry is compiled
 *
 * Output: dist/server/entry-server.js
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/",
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        (await import("tailwindcss")).default,
        (await import("autoprefixer")).default,
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      "@shared/schema": path.resolve(import.meta.dirname, "src/lib/sharedSchema.ts"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    ssr: true,
    rollupOptions: {
      input: path.resolve(import.meta.dirname, "src/entry-server.tsx"),
      output: {
        format: "esm",
      },
    },
    outDir: path.resolve(import.meta.dirname, "dist/server"),
    emptyOutDir: true,
    // Don't minify the server bundle — we need readable errors
    minify: false,
  },
  ssr: {
    // Bundle everything into a single file — avoids node_modules resolution
    // issues in the prerender script
    noExternal: true,
  },
});
