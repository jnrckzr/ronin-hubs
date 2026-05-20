import { readFileSync, writeFileSync } from "fs";

const file = "node_modules/@lovable.dev/vite-tanstack-config/dist/index.js";
const content = readFileSync(file, "utf8");
const patched = content.replace(
  '"@": `${process.cwd()}/src`',
  '"@": `${process.cwd()}/src/`'
);
writeFileSync(file, patched);
console.log("Patched @lovable.dev/vite-tanstack-config");