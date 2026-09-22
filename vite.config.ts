import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// NOTE: HMR must remain disabled on this platform. Do not enable it.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
    hmr: false,
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 4173,
  },
});
