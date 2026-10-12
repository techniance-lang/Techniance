/* Runs learner Python with Pyodide (self-hosted under /pyodide). */
importScripts("/pyodide/pyodide.js");

const ready = loadPyodide({ indexURL: "/pyodide/" }).then((py) => {
  self.postMessage({ type: "ready" });
  return py;
});
ready.catch((e) => self.postMessage({ type: "load-error", error: String(e) }));

const decoder = new TextDecoder();

function cleanTraceback(message) {
  const lines = String(message).split("\n");
  const start = lines.findIndex((l) => l.includes('File "<exec>"'));
  if (start === -1) return lines.filter((l) => l.trim()).slice(-1).join("\n");
  return ["Traceback (most recent call last):", ...lines.slice(start)]
    .join("\n")
    .replace(/File "<exec>"/g, 'File "main.py"')
    .trim();
}

self.onmessage = async (event) => {
  const { id, code, input } = event.data;
  const py = await ready;
  let stdout = "";
  let stdinUsed = false;
  py.setStdout({
    write: (buf) => {
      stdout += decoder.decode(buf);
      if (stdout.length > 1_000_000) throw new Error("Output limit exceeded (1 MB)");
      return buf.length;
    },
  });
  py.setStderr({ write: (buf) => buf.length });
  py.setStdin({
    stdin: () => {
      if (stdinUsed) return undefined;
      stdinUsed = true;
      return String(input ?? "");
    },
    isatty: false,
  });

  const started = performance.now();
  let error = null;
  const globals = py.globals.get("dict")();
  try {
    globals.set("__name__", "__main__");
    await py.runPythonAsync(code, { globals, filename: "<exec>" });
  } catch (e) {
    error = cleanTraceback(e && e.message ? e.message : e);
  } finally {
    globals.destroy();
  }
  self.postMessage({ id, stdout, error, ms: Math.round(performance.now() - started) });
};
