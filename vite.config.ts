import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { join } from "path";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    importProtection: false,
    server: {
      preset: "vercel",
      entry: "src/server",
    },
    routers: {
      client: {
        vite: {
          resolve: {
            alias: {
              "@": join(process.cwd(), "src"),
            },
          },
        },
      },
    },
  },
});