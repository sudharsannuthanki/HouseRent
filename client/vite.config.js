import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy /api calls to the Express server during development so the
// browser and API share an origin — no CORS setup or env URLs needed.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
      "/uploads": "http://localhost:8000",
    },
  },
});
