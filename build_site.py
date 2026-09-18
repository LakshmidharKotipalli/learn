#!/usr/bin/env python3
"""Build the static HTML site from the markdown sources.

Produces one page per document plus an index, a shared stylesheet, a
client-side search index, and Mermaid diagrams rendered in the browser.

Run from the repository root:  python3 build_site.py
"""
from __future__ import annotations

import html
import json
import re
from dataclasses import dataclass, field
from pathlib import Path

import markdown
from pygments.formatters import HtmlFormatter

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "docs"
ASSETS = OUT / "assets"

SITE_TITLE = "AI Engineer Learning OS"
SITE_TAGLINE = "A structured, project-based curriculum for AI engineering"


# --------------------------------------------------------------------------
# Navigation structure
# --------------------------------------------------------------------------

@dataclass(frozen=True)
class Page:
    src: Path          # relative to ROOT
    out: str           # output filename in docs/
    title: str
    group: str
    blurb: str = ""


NAV: list[Page] = [
    Page(Path("README.md"), "index.html", "Overview", "Start here",
         "What this is, how to study, and the conventions used throughout."),
    Page(Path("00-north-star-roadmap.md"), "00-roadmap.html", "00 · Roadmap", "Start here",
         "The 24-week plan, two orderings, compression rules. The only schedule."),

    Page(Path("01a-python-core.md"), "01a-python-core.html", "01a · Python Core", "Foundations",
         "Execution model, objects, collections, control flow, functions, exceptions, files."),
    Page(Path("01b-python-patterns-and-oop.md"), "01b-python-patterns.html", "01b · Python Patterns & OOP", "Foundations",
         "OOP, generators, decorators, typing, pytest, and the applied patterns for LLM code."),
    Page(Path("01c-python-interview-dsa.md"), "01c-python-dsa.html", "01c · Interview DSA", "Foundations",
         "The algorithm patterns that appear in live coding rounds."),
    Page(Path("02-software-engineering-foundations.md"), "02-software-engineering.html", "02 · Software Engineering", "Foundations",
         "Git, CI, testing strategy, code review, debugging, HTTP, concurrency."),
    Page(Path("03-data-and-sql.md"), "03-data-and-sql.html", "03 · Data, SQL & Statistics", "Foundations",
         "SQL against a real schema, joins, aggregation traps, indexes, statistics."),

    Page(Path("04-machine-learning.md"), "04-machine-learning.html", "04 · Classical ML", "Machine learning",
         "Leakage, metrics, thresholds, calibration, pipelines, drift."),
    Page(Path("05-deep-learning.md"), "05-deep-learning.html", "05 · Deep Learning", "Machine learning",
         "Backprop by hand, optimizers, vanishing gradients, PyTorch, diagnosing training."),

    Page(Path("06-transformers-and-llms.md"), "06-transformers.html", "06 · Transformers & LLMs", "AI engineering",
         "Attention worked by hand, KV cache, sampling, quantization, hallucination."),
    Page(Path("07-rag-and-vector-search.md"), "07-rag.html", "07 · RAG & Vector Search", "AI engineering",
         "Chunking, hybrid retrieval, reranking, evaluation, failure taxonomy."),
    Page(Path("08-agents-tools-and-mcp.md"), "08-agents.html", "08 · Agents, Tools & MCP", "AI engineering",
         "Workflow versus agent, tool schemas, stopping, MCP, trajectory evaluation."),
    Page(Path("09-local-llm-inference.md"), "09-local-inference.html", "09 · Local Inference", "AI engineering",
         "Memory budgets, GGUF quantization, runtimes, serving, benchmarking."),

    Page(Path("10-mlops-and-deployment.md"), "10-mlops.html", "10 · MLOps & Deployment", "Production",
         "Versioning, containers, observability, LLM monitoring, rollback, cost."),
    Page(Path("11-ai-system-design.md"), "11-system-design.html", "11 · AI System Design", "Production",
         "The answer framework, capacity arithmetic, four complete walkthroughs."),

    Page(Path("12a-interview-framework.md"), "12a-interview-framework.html", "12a · Interview Framework", "Interview prep",
         "Skills matrix, answer structure, mock schedules, the 48-hour checklist."),
    Page(Path("12b-interview-question-bank.md"), "12b-question-bank.html", "12b · Question Bank", "Interview prep",
         "45 cross-cutting questions spanning modules."),
    Page(Path("12c-interview-behavioral-and-projects.md"), "12c-behavioral.html", "12c · Behavioral & Projects", "Interview prep",
         "STAR, the story bank, project deep dives, the transition narrative."),
    Page(Path("13-project-portfolio.md"), "13-portfolio.html", "13 · Portfolio Strategy", "Interview prep",
         "What makes a project credible, and a rubric to score yours."),
    Page(Path("14-concept-map.md"), "14-concept-map.html", "14 · Concept Map", "Interview prep",
         "How the modules connect. The pre-interview skim file."),

    Page(Path("projects/project-1-python-data-tool.md"), "project-1.html", "Project 1 · Learning Log Analyzer", "Projects",
         "Clean engineering, no AI. Complete tested MVP source included."),
    Page(Path("projects/project-2-rag-app.md"), "project-2.html", "Project 2 · Grounded Answers", "Projects",
         "A RAG system, evaluation harness first."),
    Page(Path("projects/project-3-agent-evaluation.md"), "project-3.html", "Project 3 · Agent Evaluation", "Projects",
         "A trajectory evaluation harness, with adversarial cases."),

    Page(Path("capstone/00-prd.md"), "capstone-00-prd.html", "Capstone 1 · Requirements", "Capstone",
         "CareerAtlas: users, scope, user stories, success criteria."),
    Page(Path("capstone/01-architecture.md"), "capstone-01-architecture.html", "Capstone 2 · Architecture", "Capstone",
         "Technology decisions with the alternative rejected, schema, API, memory budget."),
    Page(Path("capstone/02-build-plan.md"), "capstone-02-build-plan.html", "Capstone 3 · Build Plan", "Capstone",
         "Six weeks, each ending in a demo."),
    Page(Path("capstone/03-evaluation.md"), "capstone-03-evaluation.html", "Capstone 4 · Evaluation & Safety", "Capstone",
         "Four things to evaluate, and the safety analysis."),
    Page(Path("capstone/04-interview-narrative.md"), "capstone-04-narrative.html", "Capstone 5 · Interview Narrative", "Capstone",
         "How to talk about it, the README, honest resume bullets."),

    Page(Path("tracker/progress-log.md"), "tracker-progress-log.html", "Progress Log", "Trackers",
         "Mastery status, spaced repetition, mock scores, STAR bank."),
    Page(Path("tracker/weekly-plan.md"), "tracker-weekly-plan.html", "Weekly Plan", "Trackers",
         "The weekly working template, derived from the roadmap."),
    Page(Path("quizzes/01a-python-core-practice.md"), "quiz-01a-python-core.html", "01a Practice Pack", "Trackers",
         "Flashcards, MCQs, debugging scenarios, Anki export."),

    Page(Path("meta/prompt-library-review.md"), "meta-review.html", "Prompt Library Review", "Meta",
         "The critique of the original prompt library this curriculum was built from."),
    Page(Path("meta/ai-engineer-learning-os-prompts-v2.md"), "meta-prompts-v2.html", "Prompt Library v2", "Meta",
         "The corrected prompt library used to generate these modules."),
]

GROUP_ORDER = ["Start here", "Foundations", "Machine learning", "AI engineering",
               "Production", "Interview prep", "Projects", "Capstone", "Trackers", "Meta"]

# Map source path -> output html, for rewriting internal links.
SRC_TO_OUT = {p.src.name: p.out for p in NAV}
SRC_TO_OUT.update({str(p.src): p.out for p in NAV})
# Repo-relative forms used inside the documents
SRC_TO_OUT.update({
    "tracker/progress-log.md": "tracker-progress-log.html",
    "tracker/weekly-plan.md": "tracker-weekly-plan.html",
    "projects/project-1-python-data-tool.md": "project-1.html",
    "projects/project-2-rag-app.md": "project-2.html",
    "projects/project-3-agent-evaluation.md": "project-3.html",
    "quizzes/01a-python-core-practice.md": "quiz-01a-python-core.html",
    "capstone/00-prd.md": "capstone-00-prd.html",
    "capstone/01-architecture.md": "capstone-01-architecture.html",
    "capstone/02-build-plan.md": "capstone-02-build-plan.html",
    "capstone/03-evaluation.md": "capstone-03-evaluation.html",
    "capstone/04-interview-narrative.md": "capstone-04-narrative.html",
})


# --------------------------------------------------------------------------
# Markdown conversion
# --------------------------------------------------------------------------

MERMAID_RE = re.compile(r"```mermaid\n(.*?)```", re.S)


def extract_mermaid(text: str) -> tuple[str, list[str]]:
    """Pull mermaid blocks out before markdown conversion, leaving placeholders."""
    blocks: list[str] = []

    def repl(m: re.Match) -> str:
        blocks.append(m.group(1))
        return f"\n\nMERMAIDPLACEHOLDER{len(blocks) - 1}ENDPLACEHOLDER\n\n"

    return MERMAID_RE.sub(repl, text), blocks


def restore_mermaid(html_text: str, blocks: list[str]) -> str:
    for i, src in enumerate(blocks):
        placeholder = f"MERMAIDPLACEHOLDER{i}ENDPLACEHOLDER"
        div = (
            '<div class="mermaid-wrap">'
            f'<pre class="mermaid">{html.escape(src)}</pre>'
            '</div>'
        )
        html_text = html_text.replace(f"<p>{placeholder}</p>", div)
        html_text = html_text.replace(placeholder, div)
    return html_text


def rewrite_links(html_text: str) -> str:
    """Point internal .md links at their generated .html pages."""
    def repl(m: re.Match) -> str:
        href = m.group(1)
        anchor = ""
        if "#" in href:
            href, anchor = href.split("#", 1)
            anchor = "#" + anchor
        target = SRC_TO_OUT.get(href) or SRC_TO_OUT.get(href.lstrip("./"))
        if target:
            return f'href="{target}{anchor}"'
        return m.group(0)

    return re.sub(r'href="([^"]+\.md(?:#[^"]*)?)"', repl, html_text)


def slugify(text: str) -> str:
    s = re.sub(r"<[^>]+>", "", text)
    s = s.replace("&amp;", "and").replace("&#39;", "").replace("&quot;", "")
    s = re.sub(r"[^\w\s-]", "", s).strip().lower()
    return re.sub(r"[-\s]+", "-", s) or "section"


def convert(md_text: str) -> tuple[str, list[tuple[int, str, str]]]:
    """Return (html, toc) where toc is a list of (level, anchor, text)."""
    body, mermaid_blocks = extract_mermaid(md_text)

    md = markdown.Markdown(
        extensions=["tables", "fenced_code", "codehilite", "attr_list",
                    "sane_lists", "md_in_html"],
        extension_configs={"codehilite": {"guess_lang": False, "css_class": "highlight"}},
    )
    out = md.convert(body)
    out = restore_mermaid(out, mermaid_blocks)
    out = rewrite_links(out)

    # Add anchors to headings and build the table of contents.
    toc: list[tuple[int, str, str]] = []
    seen: dict[str, int] = {}

    def heading(m: re.Match) -> str:
        level, attrs, text = int(m.group(1)), m.group(2), m.group(3)
        base = slugify(text)
        seen[base] = seen.get(base, 0) + 1
        anchor = base if seen[base] == 1 else f"{base}-{seen[base]}"
        if level <= 3:
            plain = re.sub(r"<[^>]+>", "", text)
            toc.append((level, anchor, plain))
        return (f'<h{level} id="{anchor}"{attrs}>{text}'
                f'<a class="anchor" href="#{anchor}" aria-label="Link to this section">#</a>'
                f'</h{level}>')

    out = re.sub(r"<h([1-6])([^>]*)>(.*?)</h\1>", heading, out, flags=re.S)
    return out, toc


# --------------------------------------------------------------------------
# Page rendering
# --------------------------------------------------------------------------

def render_nav(current: str) -> str:
    parts = ['<nav class="sidebar-nav">']
    for group in GROUP_ORDER:
        pages = [p for p in NAV if p.group == group]
        if not pages:
            continue
        parts.append(f'<div class="nav-group"><h3>{html.escape(group)}</h3><ul>')
        for p in pages:
            cls = ' class="active"' if p.out == current else ""
            parts.append(f'<li><a href="{p.out}"{cls}>{html.escape(p.title)}</a></li>')
        parts.append("</ul></div>")
    parts.append("</nav>")
    return "\n".join(parts)


def render_toc(toc: list[tuple[int, str, str]]) -> str:
    if len(toc) < 3:
        return ""
    items = []
    for level, anchor, text in toc:
        if level == 1:
            continue
        items.append(
            f'<li class="toc-l{level}"><a href="#{anchor}">{html.escape(text)}</a></li>'
        )
    if not items:
        return ""
    return ('<aside class="toc"><div class="toc-inner">'
            '<h4>On this page</h4><ul>' + "\n".join(items) + "</ul></div></aside>")


def prev_next(page: Page) -> str:
    idx = NAV.index(page)
    prev = NAV[idx - 1] if idx > 0 else None
    nxt = NAV[idx + 1] if idx < len(NAV) - 1 else None
    parts = ['<nav class="pager">']
    if prev:
        parts.append(f'<a class="pager-prev" href="{prev.out}">'
                     f'<span>Previous</span>{html.escape(prev.title)}</a>')
    else:
        parts.append("<span></span>")
    if nxt:
        parts.append(f'<a class="pager-next" href="{nxt.out}">'
                     f'<span>Next</span>{html.escape(nxt.title)}</a>')
    else:
        parts.append("<span></span>")
    parts.append("</nav>")
    return "\n".join(parts)


TEMPLATE = """<!DOCTYPE html>
<html lang="en" data-theme="auto">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · {site}</title>
<meta name="description" content="{blurb}">
<link rel="stylesheet" href="assets/style.css">
<link rel="stylesheet" href="assets/syntax.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#128218;</text></svg>">
</head>
<body>
<a class="skip" href="#content">Skip to content</a>

<header class="topbar">
  <button class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
  </button>
  <a class="brand" href="index.html">{site}</a>
  <div class="search-wrap">
    <input type="search" id="search" placeholder="Search the curriculum…" autocomplete="off"
           aria-label="Search" spellcheck="false">
    <div id="results" class="results" hidden></div>
  </div>
  <button class="theme-toggle" aria-label="Toggle colour theme" title="Toggle colour theme">
    <svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></g></svg>
    <svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="currentColor"/></svg>
  </button>
</header>

<div class="layout">
  <aside class="sidebar" id="sidebar">
    {nav}
  </aside>

  <main id="content">
    <article class="doc">
      {content}
      {pager}
    </article>
  </main>

  {toc}
</div>

<script src="assets/mermaid.min.js"></script>
<script src="assets/app.js"></script>
</body>
</html>
"""


def build_page(page: Page) -> dict:
    md_text = (ROOT / page.src).read_text(encoding="utf-8")
    content, toc = convert(md_text)

    out_html = TEMPLATE.format(
        title=html.escape(page.title),
        site=html.escape(SITE_TITLE),
        blurb=html.escape(page.blurb or SITE_TAGLINE),
        nav=render_nav(page.out),
        content=content,
        pager=prev_next(page),
        toc=render_toc(toc),
    )
    (OUT / page.out).write_text(out_html, encoding="utf-8")

    # Search record: strip html, collapse whitespace. Mermaid source is
    # diagram syntax, not prose, so it is excluded rather than indexed as noise.
    plain = re.sub(r'<pre class="mermaid">.*?</pre>', " ", content, flags=re.S)
    plain = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", plain, flags=re.S)
    plain = re.sub(r"<[^>]+>", " ", plain)
    plain = html.unescape(plain)
    plain = re.sub(r"\s+", " ", plain).strip()

    return {
        "t": page.title,
        "u": page.out,
        "g": page.group,
        "b": page.blurb,
        "h": [{"a": a, "t": t} for lvl, a, t in toc if lvl <= 3],
        "c": plain[:60000],
    }


def build_index_landing() -> None:
    """The README becomes index.html; add a card grid above it."""
    path = OUT / "index.html"
    doc = path.read_text(encoding="utf-8")

    cards = ['<section class="cards">']
    for group in GROUP_ORDER:
        pages = [p for p in NAV if p.group == group and p.out != "index.html"]
        if not pages:
            continue
        cards.append(f'<h2 class="cards-heading">{html.escape(group)}</h2><div class="card-grid">')
        for p in pages:
            cards.append(
                f'<a class="card" href="{p.out}">'
                f'<h3>{html.escape(p.title)}</h3>'
                f'<p>{html.escape(p.blurb)}</p></a>'
            )
        cards.append("</div>")
    cards.append("</section>")

    hero = f"""<div class="hero">
  <h1>{html.escape(SITE_TITLE)}</h1>
  <p class="tagline">{html.escape(SITE_TAGLINE)}</p>
  <p class="hero-meta">13 modules · 4 projects · ~174,000 words · every code example executed</p>
  <div class="hero-actions">
    <a class="btn btn-primary" href="00-roadmap.html">Start with the roadmap</a>
    <a class="btn" href="01a-python-core.html">Jump to Python Core</a>
  </div>
</div>
{"".join(cards)}
<hr class="divider">
"""
    doc = doc.replace('<article class="doc">', f'<article class="doc">{hero}', 1)
    path.write_text(doc, encoding="utf-8")


def scope_css(block: str, prefix: str) -> str:
    """Prefix every .highlight rule so a theme can override it."""
    out = []
    for line in block.splitlines():
        stripped = line.strip()
        if stripped.startswith(".highlight") and "{" in stripped:
            sels, rest = line.split("{", 1)
            sels = ",".join(f"{prefix} {s.strip()}" for s in sels.split(","))
            out.append(sels + "{" + rest)
        else:
            out.append(line)
    return "\n".join(out)


def write_syntax_css() -> None:
    """Generated separately from style.css so rebuilds are idempotent."""
    light = HtmlFormatter(style="default").get_style_defs(".highlight")
    dark = HtmlFormatter(style="monokai").get_style_defs(".highlight")
    auto = scope_css(dark, ':root[data-theme="auto"]')
    forced = scope_css(dark, ':root[data-theme="dark"]')
    css = (
        "/* Syntax highlighting. Generated by build_site.py; do not edit.\n"
        "   Light: pygments 'default'. Dark: pygments 'monokai'. */\n\n"
        + light
        + "\n\n@media (prefers-color-scheme: dark) {\n"
        + auto
        + "\n}\n\n"
        + forced
        + "\n"
    )
    (ASSETS / "syntax.css").write_text(css, encoding="utf-8")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)

    records = []
    for page in NAV:
        src = ROOT / page.src
        if not src.exists():
            raise SystemExit(f"missing source: {src}")
        records.append(build_page(page))
        print(f"  built {page.out:38s} <- {page.src}")

    build_index_landing()

    (ASSETS / "search-index.json").write_text(
        json.dumps(records, separators=(",", ":")), encoding="utf-8"
    )

    write_syntax_css()

    print(f"\n{len(NAV)} pages built into {OUT}")
    print(f"search index: {len(json.dumps(records)) / 1024:.0f} KB")


if __name__ == "__main__":
    main()
