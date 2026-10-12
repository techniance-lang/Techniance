// Copies the Pyodide runtime into public/ so Python runs fully in the browser
// without depending on a third-party CDN.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "pyodide");
const dest = join(root, "public", "pyodide");

if (!existsSync(src)) {
  console.warn("[copy-pyodide] pyodide not installed, skipping");
  process.exit(0);
}
mkdirSync(dest, { recursive: true });
for (const file of [
  "pyodide.js",
  "pyodide.mjs",
  "pyodide.asm.js",
  "pyodide.asm.wasm",
  "pyodide-lock.json",
  "python_stdlib.zip",
]) {
  const from = join(src, file);
  if (existsSync(from)) cpSync(from, join(dest, file));
}
console.log("[copy-pyodide] copied runtime to public/pyodide");
