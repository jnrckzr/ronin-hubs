import { readFileSync, writeFileSync } from "fs";

const file = "node_modules/@lovable.dev/vite-tanstack-config/dist/index.js";
const content = readFileSync(file, "utf8");

// Log the current alias line for debugging
const match = content.match(/"@":\s*.{0,60}/);
console.log("Current alias:", match ? match[0] : "NOT FOUND");

const patched = content
  .replace('"@": `${process.cwd()}/src`', '"@": `${process.cwd()}/src/`')
  .replace('"@": `${process.cwd()}/src` }', '"@": `${process.cwd()}/src/` }');

const wasPatched = patched !== content;
writeFileSync(file, patched);
console.log(wasPatched ? "Patched successfully" : "WARNING: Pattern not found, no change made");