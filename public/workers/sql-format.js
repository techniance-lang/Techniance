/* Formats SQL query results identically in the browser worker and in scripts/verify-content.ts.
 * Output: a header line of column names, then one line per row; values joined by " | ";
 * NULL prints as NULL; floats print with up to 4 decimals (trailing zeros trimmed). */
(function (root) {
  function cell(v) {
    if (v === null || v === undefined) return "NULL";
    if (typeof v === "number" && !Number.isInteger(v)) return String(Math.round(v * 10000) / 10000);
    if (v instanceof Uint8Array) return "<blob>";
    return String(v);
  }
  function formatResults(results) {
    // `results` is sql.js exec() output: [{ columns, values }] — print the LAST statement that returned rows.
    if (!results || !results.length) return "";
    const last = results[results.length - 1];
    const lines = [last.columns.join(" | ")];
    for (const row of last.values) lines.push(row.map(cell).join(" | "));
    return lines.join("\n") + "\n";
  }
  root.formatSqlResults = formatResults;
  if (typeof module !== "undefined" && module.exports) module.exports = { formatResults };
})(typeof self !== "undefined" ? self : globalThis);
