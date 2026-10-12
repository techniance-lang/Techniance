/* HTML/CSS runner. Loaded as a page script (not a worker — it needs a DOM).
 * Renders the learner's HTML in a sandboxed, script-less iframe and answers "probes":
 *
 *   text | <selector>              → trimmed, whitespace-collapsed textContent ("(none)" if missing)
 *   count | <selector>             → number of matches
 *   exists | <selector>            → yes / no
 *   attr | <selector> | <name>     → attribute value ("(none)" if missing)
 *   style | <selector> | <prop>    → computed style value (as the browser reports it, e.g. rgb(255, 0, 0), 16px, 700)
 *   tag | <selector>               → lowercase tag name of the first match
 *
 * A test's `input` holds one probe per line; stdout is one answer per line.
 */
(function () {
  function answer(doc, win, line) {
    const parts = line.split("|").map((s) => s.trim());
    const [kind, selector, arg] = parts;
    let el = null;
    try {
      el = selector ? doc.querySelector(selector) : null;
    } catch {
      throw new Error(`Invalid selector in probe: ${selector}`);
    }
    switch (kind) {
      case "text":
        return el ? el.textContent.replace(/\s+/g, " ").trim() : "(none)";
      case "count":
        return String(doc.querySelectorAll(selector).length);
      case "exists":
        return el ? "yes" : "no";
      case "attr":
        return el && el.hasAttribute(arg) ? el.getAttribute(arg) : "(none)";
      case "style":
        return el ? win.getComputedStyle(el).getPropertyValue(arg).trim() : "(none)";
      case "tag":
        return el ? el.tagName.toLowerCase() : "(none)";
      default:
        throw new Error(`Unknown probe: ${kind}`);
    }
  }

  function run(code, input) {
    const started = performance.now();
    return new Promise((resolve) => {
      const frame = document.createElement("iframe");
      // allow-same-origin lets us read the DOM; without allow-scripts nothing in it can execute.
      frame.setAttribute("sandbox", "allow-same-origin");
      frame.setAttribute("aria-hidden", "true");
      frame.tabIndex = -1;
      frame.style.cssText = "position:fixed;left:-10000px;top:0;width:1024px;height:768px;border:0;visibility:hidden";
      const done = (stdout, error) => {
        frame.remove();
        resolve({ stdout, error, ms: Math.round(performance.now() - started) });
      };
      frame.onload = () => {
        try {
          const doc = frame.contentDocument;
          const win = frame.contentWindow;
          const probes = String(input || "")
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);
          const out = probes.map((p) => answer(doc, win, p));
          done(out.length ? out.join("\n") + "\n" : "", null);
        } catch (e) {
          done("", e && e.message ? e.message : String(e));
        }
      };
      frame.srcdoc = String(code || "");
      document.body.appendChild(frame);
    });
  }

  window.TechnianceWebRunner = { run };
})();
