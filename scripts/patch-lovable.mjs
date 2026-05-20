import { readFileSync, writeFileSync } from "fs";

const file = "node_modules/@lovable.dev/vite-tanstack-config/dist/index.js";
const content = readFileSync(file, "utf8");

const match = content.match(/"@":\s*.{0,80}/);
console.log("Current alias:", match ? match[0] : "NOT FOUND");

// Use resolve() instead of string concatenation
const patched = content.replace(
  '"@": `${process.cwd()}/src`',
  '"@": (await import("path")).default.resolve(process.cwd(), "src")'
);

const wasPatched = patched !== content;
writeFileSync(file, patched);

// Verify
const verify = readFileSync(file, "utf8");
const verifyMatch = verify.match(/"@":\s*.{0,80}/);
console.log("After patch:", verifyMatch ? verifyMatch[0] : "NOT FOUND");
console.log(wasPatched ? "Patched successfully" : "WARNING: No change made");