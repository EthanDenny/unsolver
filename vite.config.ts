import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  optimizeDeps: {
    exclude: ["unsolver-rs"],
  },
  plugins: [react()],
  base: "/unsolver/",
});
