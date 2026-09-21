/* AI Engineer Learning OS — site behaviour
   Theme toggle, mobile nav, Mermaid rendering, TOC scroll-spy, client-side search. */

(function () {
  "use strict";

  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  /* ---------- theme ---------- */

  const savedTheme = store.get("theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    root.setAttribute("data-theme", savedTheme);
  }

  function currentlyDark() {
    const t = root.getAttribute("data-theme");
    if (t === "dark") return true;
    if (t === "light") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  const themeBtn = document.querySelector(".theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      const next = currentlyDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store.set("theme", next);
      renderMermaid(true);
    });
  }

  /* ---------- mobile nav ---------- */

  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.querySelector(".menu-toggle");
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", function () {
      const open = sidebar.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", function (e) {
      if (window.innerWidth > 900) return;
      if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
        sidebar.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- mermaid ---------- */

  let mermaidReady = false;

  function renderMermaid(rerender) {
    if (typeof mermaid === "undefined") return;
    const nodes = document.querySelectorAll("pre.mermaid");
    if (!nodes.length) return;

    if (rerender) {
      nodes.forEach(function (n) {
        if (n.dataset.src) {
          n.removeAttribute("data-processed");
          n.innerHTML = n.dataset.src;
        }
      });
    } else {
      nodes.forEach(function (n) { n.dataset.src = n.innerHTML; });
    }

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: currentlyDark() ? "dark" : "default",
        securityLevel: "strict",
        flowchart: { curve: "basis", useMaxWidth: true },
        sequence: { useMaxWidth: true }
      });
      mermaid.run({ querySelector: "pre.mermaid" });
      mermaidReady = true;
    } catch (e) {
      // A diagram that fails to parse leaves its source visible, which is
      // more useful than an empty box.
      console.warn("mermaid render failed", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { renderMermaid(false); });
  } else {
    renderMermaid(false);
  }

  /* ---------- table of contents scroll-spy ---------- */

  const tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
  if (tocLinks.length && "IntersectionObserver" in window) {
    const byId = {};
    tocLinks.forEach(function (a) {
      const id = decodeURIComponent(a.getAttribute("href").slice(1));
      const el = document.getElementById(id);
      if (el) byId[id] = a;
    });

    let active = null;
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const link = byId[entry.target.id];
        if (!link || link === active) return;
        if (active) active.classList.remove("active");
        link.classList.add("active");
        active = link;
      });
    }, { rootMargin: "-76px 0px -70% 0px", threshold: 0 });

    Object.keys(byId).forEach(function (id) {
      observer.observe(document.getElementById(id));
    });
  }

  /* ---------- search ---------- */

  const input = document.getElementById("search");
  const results = document.getElementById("results");
  if (!input || !results) return;

  let index = null;
  let loading = false;
  let selected = -1;

  function loadIndex() {
    if (index || loading) return Promise.resolve(index);
    loading = true;
    return fetch("assets/search-index.json")
      .then(function (r) { return r.json(); })
      .then(function (data) { index = data; loading = false; return index; })
      .catch(function () {
        loading = false;
        results.innerHTML = '<div class="results-empty">Search index unavailable. ' +
          'If you opened this file directly, some browsers block local fetches; ' +
          'serve the folder with <code>python3 -m http.server</code> instead.</div>';
        results.hidden = false;
        return null;
      });
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function snippet(text, terms) {
    const lower = text.toLowerCase();
    let at = -1;
    for (let i = 0; i < terms.length; i++) {
      at = lower.indexOf(terms[i]);
      if (at !== -1) break;
    }
    if (at === -1) at = 0;
    const start = Math.max(0, at - 70);
    let out = text.slice(start, start + 210);
    if (start > 0) out = "…" + out;
    if (start + 210 < text.length) out += "…";
    out = escapeHtml(out);
    terms.forEach(function (t) {
      if (!t) return;
      const re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  }

  function search(query) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length || !index) return [];

    const hits = [];
    index.forEach(function (doc) {
      const title = doc.t.toLowerCase();
      const blurb = (doc.b || "").toLowerCase();
      const content = doc.c.toLowerCase();

      let score = 0;
      let matchedAll = true;

      terms.forEach(function (t) {
        let termScore = 0;
        if (title.indexOf(t) !== -1) termScore += 60;
        if (blurb.indexOf(t) !== -1) termScore += 18;

        for (let i = 0; i < doc.h.length; i++) {
          if (doc.h[i].t.toLowerCase().indexOf(t) !== -1) { termScore += 26; break; }
        }

        let count = 0, from = 0, k;
        while ((k = content.indexOf(t, from)) !== -1 && count < 40) { count++; from = k + t.length; }
        termScore += Math.min(count, 20) * 2;

        if (termScore === 0) matchedAll = false;
        score += termScore;
      });

      if (!matchedAll || score === 0) return;

      // Prefer a heading anchor when one matches, so results land in context.
      let anchor = "";
      let crumb = doc.g;
      for (let i = 0; i < doc.h.length; i++) {
        const ht = doc.h[i].t.toLowerCase();
        if (terms.some(function (t) { return ht.indexOf(t) !== -1; })) {
          anchor = "#" + doc.h[i].a;
          crumb = doc.g + " › " + doc.h[i].t;
          break;
        }
      }

      hits.push({ doc: doc, score: score, anchor: anchor, crumb: crumb, terms: terms });
    });

    hits.sort(function (a, b) { return b.score - a.score; });
    return hits.slice(0, 12);
  }

  function render(hits, query) {
    if (!query) { results.hidden = true; return; }
    selected = -1;

    if (!hits.length) {
      results.innerHTML = '<div class="results-empty">No matches for “' +
        escapeHtml(query) + '”.</div>';
      results.hidden = false;
      return;
    }

    const html = hits.map(function (h) {
      return '<a class="result" href="' + h.doc.u + h.anchor + '">' +
        '<div class="result-title">' + escapeHtml(h.doc.t) + "</div>" +
        '<div class="result-crumb">' + escapeHtml(h.crumb) + "</div>" +
        '<div class="result-snip">' + snippet(h.doc.c, h.terms) + "</div>" +
        "</a>";
    }).join("");

    results.innerHTML = html +
      '<div class="results-hint">↑↓ to navigate · Enter to open · Esc to close</div>';
    results.hidden = false;
  }

  let timer = null;
  input.addEventListener("input", function () {
    const q = input.value.trim();
    clearTimeout(timer);
    if (!q) { results.hidden = true; return; }
    timer = setTimeout(function () {
      loadIndex().then(function (idx) {
        if (idx) render(search(q), q);
      });
    }, 110);
  });

  input.addEventListener("focus", function () { loadIndex(); });

  input.addEventListener("keydown", function (e) {
    const items = results.querySelectorAll(".result");
    if (e.key === "Escape") { results.hidden = true; input.blur(); return; }
    if (!items.length || results.hidden) return;

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (selected >= 0) items[selected].classList.remove("sel");
      selected = e.key === "ArrowDown"
        ? (selected + 1) % items.length
        : (selected - 1 + items.length) % items.length;
      items[selected].classList.add("sel");
      items[selected].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && selected >= 0) {
      e.preventDefault();
      window.location.href = items[selected].getAttribute("href");
    }
  });

  document.addEventListener("click", function (e) {
    if (!results.contains(e.target) && e.target !== input) results.hidden = true;
  });

  // "/" focuses search, the way most documentation sites behave.
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== input &&
        !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      e.preventDefault();
      input.focus();
    }
  });
})();
