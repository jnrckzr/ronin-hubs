import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const file = "node_modules/@lovable.dev/vite-tanstack-config/dist/index.js";
const content = readFileSync(file, "utf8");

const srcPath = resolve(process.cwd(), "src");
console.log("src path:", srcPath);

// Replace the entire alias object entry with an array-style alias
const patched = content.replace(
  `"@": \`\${process.cwd()}/src\``,
  `"@": ${JSON.stringify(srcPath + "/")}`
);

const wasPatched = patched !== content;
writeFileSync(file, patched);

const verify = readFileSync(file, "utf8");
const match = verify.match(/"@":\s*.{0,80}/);
console.log("After patch:", match ? match[0] : "NOT FOUND");
console.log(wasPatched ? "Patched successfully" : "WARNING: No change made");