import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { join } from "path";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: {
        entry: "src/server",
      },
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": join(process.cwd(), "src"),
    },
  },
});