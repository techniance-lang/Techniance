// Copies the Pyodide (Python) and sql.js (SQLite) runtimes into public/ so code
// runs fully in the browser without depending on a third-party CDN.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "pyodide");
const dest = join(root, "public", "pyodide");

mkdirSync(dest, { recursive: true });
for (const file of existsSync(src) ? [
  "pyodide.js",
  "pyodide.mjs",
  "pyodide.asm.js",
  "pyodide.asm.wasm",
  "pyodide-lock.json",
  "python_stdlib.zip",
] : []) {
  const from = join(src, file);
  if (existsSync(from)) cpSync(from, join(dest, file));
}
console.log("[copy-pyodide] copied runtime to public/pyodide");

const sqlSrc = join(root, "node_modules", "sql.js", "dist");
const sqlDest = join(root, "public", "sqljs");
if (existsSync(sqlSrc)) {
  mkdirSync(sqlDest, { recursive: true });
  for (const file of ["sql-wasm.js", "sql-wasm.wasm"]) cpSync(join(sqlSrc, file), join(sqlDest, file));
  console.log("[copy-pyodide] copied sql.js to public/sqljs");
}
