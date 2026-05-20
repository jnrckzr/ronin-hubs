import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    importProtection: false,
    server: {
      preset: "vercel",
      entry: "src/server",
    },
  },
});