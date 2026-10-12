/* Runs learner SQL against an in-memory SQLite database (sql.js, self-hosted under /sqljs).
 * input = setup SQL (schema + rows) run first; code = the learner's SQL.
 * stdout = the result set of the last statement that returns rows (see sql-format.js). */
importScripts("/sqljs/sql-wasm.js", "/workers/sql-format.js");

const ready = initSqlJs({ locateFile: (f) => `/sqljs/${f}` }).then((SQL) => {
  self.postMessage({ type: "ready" });
  return SQL;
});
ready.catch((e) => self.postMessage({ type: "load-error", error: String(e) }));

self.onmessage = async (event) => {
  const { id, code, input } = event.data;
  const SQL = await ready;
  const started = performance.now();
  const db = new SQL.Database();
  let stdout = "";
  let error = null;
  try {
    if (input && input.trim()) db.exec(input);
  } catch (e) {
    error = `Setup error: ${e.message}`;
  }
  if (!error) {
    try {
      stdout = self.formatSqlResults(db.exec(code));
    } catch (e) {
      error = `SQL error: ${e.message}`;
    }
  }
  db.close();
  self.postMessage({ id, stdout, error, ms: Math.round(performance.now() - started) });
};
