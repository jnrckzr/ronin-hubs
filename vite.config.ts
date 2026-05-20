import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { join } from "path";

const src = join(process.cwd(), "src");

export default defineConfig({
  cloudflare: false,
  vite: {
    resolve: {
      alias: [{ find: /^@\//, replacement: src + "/" }],
    },
  },
  tanstackStart: {
    importProtection: false,
    server: {
      preset: "vercel",
      entry: "src/server",
    },
  },
});