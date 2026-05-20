// vite.config.ts
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { resolve } from "path";
var vite_config_default = defineConfig({
  cloudflare: false,
  vite: {
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src")
      }
    }
  },
  tanstackStart: {
    server: {
      preset: "vercel",
      entry: "src/server"
    }
  }
});
export {
  vite_config_default as default
};
