/* AI Engineer Learning OS — site behaviour
   Theme toggle, mobile nav, Mermaid rendering, TOC scroll-spy, client-side search,
   reading progress, study state, and copyable code blocks. */

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

  /* ---------- learning loop ---------- */

  const progressKey = "learning-os-progress-v1";
  const currentPage = (window.location.pathname.split("/").pop() || "index.html").split("#")[0];
  const doc = document.querySelector("article.doc");
  const pageLinks = Array.prototype.slice.call(document.querySelectorAll(".sidebar-nav a"));

  function readProgress() {
    try { return JSON.parse(store.get(progressKey) || "{}"); } catch (e) { return {}; }
  }

  let progress = readProgress();
  const trackedPages = pageLinks
    .map(function (link) { return link.getAttribute("href").split("#")[0]; })
    .filter(function (href, i, all) { return href !== "index.html" && all.indexOf(href) === i; });

  function saveProgress() {
    store.set(progressKey, JSON.stringify(progress));
  }

  function pageState(href) {
    return progress[href] || { visited: false, complete: false, scroll: 0, lastOpened: 0 };
  }

  function titleFor(href) {
    const link = pageLinks.find(function (item) {
      return item.getAttribute("href").split("#")[0] === href;
    });
    return link ? link.textContent.trim() : "the next lesson";
  }

  function nextUnfinished() {
    const ordered = trackedPages.filter(function (href) { return !pageState(href).complete; });
    return ordered[0] || trackedPages[0] || "00-roadmap.html";
  }

  function completionCount() {
    return trackedPages.filter(function (href) { return pageState(href).complete; }).length;
  }

  function updateProgressUI() {
    const total = trackedPages.length;
    const completed = completionCount();
    const percent = total ? Math.round((completed / total) * 100) : 0;
    const overall = document.getElementById("overall-progress");
    const overallBar = document.getElementById("overall-progress-bar");
    if (overall) overall.textContent = completed + " of " + total + " lessons complete";
    if (overallBar) overallBar.style.width = percent + "%";

    const current = pageState(currentPage);
    const studyButton = document.getElementById("study-toggle");
    const studyStatus = document.getElementById("study-status");
    if (studyButton) {
      studyButton.textContent = current.complete ? "Completed ✓" : "Mark as complete";
      studyButton.setAttribute("aria-pressed", String(current.complete));
      studyButton.classList.toggle("is-complete", current.complete);
    }
    if (studyStatus) studyStatus.textContent = current.complete ? "Saved to your learning history" : "Progress saves in this browser";

    pageLinks.forEach(function (link) {
      const href = link.getAttribute("href").split("#")[0];
      const state = pageState(href);
      link.classList.toggle("is-complete", state.complete);
      let marker = link.querySelector(".nav-marker");
      if (!marker) {
        marker = document.createElement("span");
        marker.className = "nav-marker";
        marker.setAttribute("aria-hidden", "true");
        link.appendChild(marker);
      }
      marker.textContent = state.complete ? "✓" : "";
    });

    document.querySelectorAll(".card[data-page]").forEach(function (card) {
      const state = pageState(card.dataset.page);
      card.classList.toggle("is-complete", state.complete);
      let badge = card.querySelector(".card-status");
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "card-status";
        card.appendChild(badge);
      }
      badge.textContent = state.complete ? "Completed" : state.visited ? "In progress" : "Not started";
    });
  }

  function initStudyBar() {
    if (!doc || currentPage === "index.html" || !trackedPages.includes(currentPage)) return;
    const activeLink = pageLinks.find(function (link) {
      return link.getAttribute("href").split("#")[0] === currentPage;
    });
    const label = activeLink ? activeLink.textContent.trim() : "Current lesson";
    const markup = '<section class="study-bar" aria-label="Lesson progress">' +
      '<div class="study-copy"><strong>' + label + '</strong>' +
      '<span id="study-status">Progress saves in this browser</span></div>' +
      '<button class="study-toggle" id="study-toggle" type="button" aria-pressed="false">Mark as complete</button>' +
      '</section>';
    doc.insertAdjacentHTML("afterbegin", markup);
    const state = pageState(currentPage);
    state.visited = true;
    state.lastOpened = Date.now();
    progress[currentPage] = state;
    saveProgress();
    document.getElementById("study-toggle").addEventListener("click", function () {
      const next = pageState(currentPage);
      next.complete = !next.complete;
      next.visited = true;
      next.completedAt = next.complete ? Date.now() : null;
      progress[currentPage] = next;
      saveProgress();
      updateProgressUI();
    });
  }

  function initLandingDashboard() {
    if (!doc || currentPage !== "index.html") return;
    const hero = doc.querySelector(".hero");
    if (!hero) return;
    const next = nextUnfinished();
    const nextTitle = escapeHtml(titleFor(next));
    hero.insertAdjacentHTML("afterend",
      '<section class="learning-dashboard" aria-label="Your learning progress">' +
      '<div class="dashboard-heading"><div><span class="eyebrow">Your learning path</span>' +
      '<h2>Keep the momentum</h2><p id="overall-progress">0 lessons complete</p></div>' +
      '<a class="btn btn-primary" id="continue-learning" href="' + next + '">Continue with ' + nextTitle + ' →</a></div>' +
      '<div class="overall-track" aria-hidden="true"><span id="overall-progress-bar"></span></div>' +
      '</section>');
    document.querySelectorAll(".card").forEach(function (card) {
      const href = card.getAttribute("href");
      if (href && trackedPages.includes(href.split("#")[0])) card.dataset.page = href.split("#")[0];
    });
  }

  function initReadingProgress() {
    if (!doc) return;
    const bar = document.createElement("div");
    bar.className = "reading-progress";
    bar.innerHTML = '<span></span>';
    document.body.appendChild(bar);
    const fill = bar.firstElementChild;
    let lastSaved = -1;
    function update() {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const percent = Math.min(100, Math.round((window.scrollY / max) * 100));
      fill.style.width = percent + "%";
      if (currentPage !== "index.html" && percent >= 25 && percent !== lastSaved) {
        const state = pageState(currentPage);
        state.visited = true;
        state.scroll = percent;
        progress[currentPage] = state;
        lastSaved = percent;
        saveProgress();
      }
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function initCopyButtons() {
    document.querySelectorAll(".doc pre:not(.mermaid)").forEach(function (pre) {
      if (pre.querySelector(".copy-code")) return;
      const codeText = pre.innerText || pre.textContent;
      const button = document.createElement("button");
      button.className = "copy-code";
      button.type = "button";
      button.textContent = "Copy";
      button.setAttribute("aria-label", "Copy code block");
      pre.appendChild(button);
      button.addEventListener("click", function () {
        const done = function () {
          button.textContent = "Copied!";
          button.classList.add("copied");
          window.setTimeout(function () {
            button.textContent = "Copy";
            button.classList.remove("copied");
          }, 1400);
        };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(codeText).then(done);
        } else {
          const area = document.createElement("textarea");
          area.value = codeText;
          area.style.position = "fixed";
          area.style.opacity = "0";
          document.body.appendChild(area);
          area.select();
          try { document.execCommand("copy"); done(); } catch (e) { button.textContent = "Select manually"; }
          area.remove();
        }
      });
    });
  }

  initStudyBar();
  initLandingDashboard();
  initReadingProgress();
  initCopyButtons();
  updateProgressUI();

  window.addEventListener("storage", function (event) {
    if (event.key === progressKey) {
      progress = readProgress();
      updateProgressUI();
    }
  });

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
