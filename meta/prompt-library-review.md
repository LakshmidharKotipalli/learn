# Review: "Claude Prompts: Build Your AI Engineer Learning OS"

**Reviewed:** 2026-09-18
**Scope:** the prompt library only, not the learning content it would produce.
**Verdict:** the module skeleton is strong and unusually well designed. The orchestration around it is where this will break. Five issues will visibly degrade output quality on the first run; fix those before generating anything.

---

## What is already good

Worth naming, because the rewrite preserves all of it:

| Element | Why it works |
|---|---|
| Fixed module skeleton (Why this matters → Connections) | Forces consistency across 12 files and makes them comparable. Most self-study prompt sets skip this. |
| `## Connections` section | Rare and valuable. Prevents the "12 disconnected tutorials" failure mode. |
| `## Mastery checklist` with observable criteria | Gives you an exit test per module instead of a vibe. |
| "60-second answer vs 3-to-5-minute answer" | The single most useful instruction in the document for interview readiness. |
| "Explain tradeoffs rather than claiming one tool is always best" | Directly counteracts the model's tendency to recommend whatever was most written about. |
| "Do not fabricate experience or performance metrics; use honest placeholders" | Correct instinct, wrongly scoped (see P0-5). |
| "Standalone Markdown file I can study without prior chat context" | Makes the artifacts survive the chat session. |

---

## P0: fix before your first generation run

### P0-1. No output budget and no continuation contract

**The problem.** `01-python-foundations.md` asks for roughly 15 topic clusters, each with intuition, a diagram, runnable examples, common bugs, interview questions and exercises, plus a 30-day plan, an answer key, and a mock interview section. Honestly specified, that is a 150-to-250 page book. What you will actually get is every heading present and each one two paragraphs deep. Breadth requirements crowd out depth, silently. The output will *look* complete and be too thin to learn from.

The "How to use" section tells *you* to ask for continuation from the last heading, but no prompt tells *Claude* to stop cleanly rather than compress.

**The fix.** Three changes, all in the Master Prompt:
1. State a depth contract: "Depth beats coverage. If the full scope will not fit, cover fewer subtopics completely rather than all subtopics shallowly."
2. State a continuation protocol: "When you approach your output limit, stop at a clean `##` or `###` boundary, then print `<!-- CONTINUE FROM: <exact heading> -->` and a one-line list of what remains. Do not compress to fit."
3. Split the oversized files. `01-python-foundations.md` should be `01a-python-core.md`, `01b-python-patterns-and-oop.md`, `01c-python-interview-dsa.md`. `12-interview-prep.md` should be three files by track.

### P0-2. Three files and two projects in your folder structure are never generated

Your tree lists them; no prompt creates them.

| File | Status |
|---|---|
| `02-software-engineering-foundations.md` | No prompt exists |
| `03-data-and-sql.md` | No prompt exists |
| `13-project-portfolio.md` | No prompt exists |
| `projects/project-2-rag-app.md` | No prompt exists |
| `projects/project-3-agent-evaluation.md` | No prompt exists |
| `quizzes/python-practice.md` | Generated only by the generic §9 template |

Section 5's orchestration list jumps straight from `01` to `04`. So the roadmap (which correctly puts software engineering and data/SQL before ML) and the generation sequence disagree from the start.

**The fix.** Prompts for all five are in the rewritten library.

### P0-3. Interview questions are specified twice, at roughly 2x volume

Every module's `## Interview angle` demands 10 questions with answer outlines, weak-answer analysis, and follow-ups. Twelve modules is 120 questions. Then `12-interview-prep.md` separately demands at least 115 more across the same topics.

You will get heavy duplication, and the second pass will be shallower because the model has less to add. You will also not know which file to revise from.

**The fix.** Split ownership cleanly:
- **Modules own** concept-level Q&A for their own topic: 10 questions, answer outlines, weak answers, follow-ups. This stays as written.
- **`12-interview-prep.md` owns** only what no single module can: the answer framework, cross-cutting questions that span modules, system design prompts, behavioral/STAR, the mock schedule, and the 48-hour revision checklist. It explicitly *indexes* module questions rather than restating them.

### P0-4. Three planning artifacts that will contradict each other

You are asking for a 24-week plan (§2, inside the roadmap), a 12-week execution plan (§11), and a weekly plan with 5/10/15-hour variants (§7). Generated in separate turns, they will assign different topics to the same relative week and you will have no source of truth.

**The fix.** One canonical plan. Make `00-north-star-roadmap.md` produce the 24-week dependency-ordered plan as the only schedule. `tracker/weekly-plan.md` becomes a *template plus the current week's instance*, derived from it. The 12-week variant becomes a documented compression rule ("drop all `nice to know`, halve review weeks") rather than a second schedule.

### P0-5. Accuracy guardrails live only in the optional last prompt

"Do not invent citations, achievements, metrics, or project results" appears in the QC prompt, which is optional and sits at the end of the document. Meanwhile the modules ask for things with a high fabrication surface:

- a 200-term glossary
- benchmark numbers and cost comparisons for hosted APIs
- version-sensitive tool behavior (Ollama, vLLM, llama.cpp, LangGraph, MCP)
- quantization quality claims
- "tokens per second" and VRAM figures

Tooling in this area moves faster than any model's training cutoff. Without a standing instruction, you will get confident, plausible, stale numbers baked into a reference document you intend to study from for six months.

**The fix.** Move honesty rules into the Master Prompt's `## Output rules` as standing policy, and add a specific one for volatility:

> Mark every version-sensitive claim with `[VERIFY: <what to check> @ <source>]`. Never state a benchmark number, price, throughput figure, or VRAM requirement as fact. Give the method for measuring it instead, or mark it `[UNVERIFIED]`. Prefer "as of my training data, and this changes often" over a clean assertion.

---

## P1: structural problems

### P1-6. The quiz generator breaks the standalone rule

§9 opens with "Using the learning module I just created." Every other prompt is deliberately context-free. This one silently depends on chat history, so it fails if you run it a week later in a fresh chat, which is exactly how you will want to use it.

**Fix:** take the module as pasted input or by filename, and state the fallback: "If the module is not in context, ask me to paste it before generating."

### P1-7. Solutions sit in the same file, unhidden

"Put solutions after a clearly labeled Solutions section" does not prevent you seeing them. You will scroll past answers while looking for question 7. Active recall dies quietly.

**Fix:** require GitHub-native `<details><summary>` collapsibles per question, and put practice packs in separate `quizzes/` files from the teaching modules.

### P1-8. Mermaid is demanded everywhere and specified nowhere

Every module requires a "Visual concept map." Twelve mandatory diagrams means most will be generic noun-boxes connected by unlabeled arrows, which teaches nothing. Separately, GitHub's Mermaid renderer chokes on unquoted parentheses, `<br>` in some node types, and certain unicode in labels, so some diagrams will silently fail to render in the repo where you plan to read them.

**Fix:** two instructions:
- "Include a diagram only when it shows a mechanism, sequence, or decision that prose handles badly. Label every edge with the relationship. If a diagram would only restate the heading list, write a table instead."
- "Mermaid must render on GitHub: quote any label containing `()`, `,` or `:`; use `flowchart TD`; no HTML except `<br/>`; keep to under 20 nodes."

### P1-9. Code is never required to be runnable

`projects/project-1-python-data-tool.md` asks for "complete starter code for the MVP" and the capstone asks for a full FastAPI service. Nothing requires imports to resolve, versions to pin, or the code to have been reasoned through end to end. The QC prompt checks for this after the fact, optionally.

**Fix:** standing rule in the Master Prompt:
> All code must be complete and runnable as written: real imports, pinned versions in the requirements block, no `...` or `# TODO: implement`. If you cannot produce working code for a component, say so and give the interface plus a test instead of a plausible-looking stub.

### P1-10. The "priority order tonight" contradicts the dependency premise

You ask for a strictly dependency-based roadmap, then the priority list puts `06-transformers-and-llms` and `07-rag-and-vector-search` ahead of `04-machine-learning` and `05-deep-learning`.

Pragmatically that is defensible: transformers and RAG are where the interviews are, and you can reason about attention without having implemented gradient boosting. But leaving the contradiction unmarked means the roadmap will be written as if you will follow it and you will not.

**Fix:** make it explicit and label it. Call it the "LLM-first fast path," state what it defers (`04`, `05`), and state the specific interview questions you will not be able to answer until you circle back (bias-variance, calibration, why a gradient vanishes, when a boosted tree beats a neural net). The roadmap then generates both orderings.

### P1-11. The capstone is fourteen deliverables in one file

`capstone-careeratlas.md` asks for a PRD, user stories, architecture, schema, folder structure, 6-week plan, API spec, eval plan, safety analysis, interview explanation, README, resume bullets, and a system design walkthrough. In one response you will get each one at outline depth, which makes none of them usable.

**Fix:** split into `capstone/00-prd.md`, `capstone/01-architecture.md`, `capstone/02-build-plan.md`, `capstone/03-evaluation.md`, `capstone/04-interview-narrative.md`, generated one at a time.

### P1-12. Spaced repetition has intervals but no mechanism

You specify 1/3/7/14/30/60 days across three separate files. Nothing says what happens when you fail a review (reset to 1 day? step back one interval?), where the single source of truth for "next review date" lives, or how a Markdown table gets you to actually review on the right day. Three files each holding partial schedule state will drift within two weeks.

**Fix:** one table in `tracker/progress-log.md` is authoritative. Specify the failure rule ("a failed review resets that concept to the 1-day interval; two consecutive passes at 30 days promote to 60 and then to retired"). Require a CSV export block so you can push cards into Anki, which will actually schedule them, and let the Markdown file be the audit trail rather than the scheduler.

---

## P2: refinements

**P2-13. "Create `X.md`" implies file creation.** In a chat, Claude produces text, not files in your repo. Phrase as "Produce the complete contents of `X.md` as a single fenced Markdown block I can save verbatim." Small change, removes ambiguity about whether front matter and headings are part of the file or part of the reply.

**P2-14. No permission to ask clarifying questions.** Every prompt is a one-way spec. Add to the Master Prompt: "If a spec is genuinely ambiguous in a way that changes the output substantially, ask before generating. Otherwise choose the most reasonable reading, state it in one line at the top, and proceed."

**P2-15. Persona sprawl.** "Mentor, curriculum architect, technical interviewer, learning-material designer" with no default. Add: "Default to curriculum architect. Switch to interviewer only inside `## Interview angle` and mock sections."

**P2-16. The local inference module deliberately withholds information you have.** §5.6 says "create a hardware-aware decision framework without assuming a specific computer." You are running llama.cpp on Apple silicon with a specific memory ceiling. A generic framework will spend half its length on CUDA VRAM math that does not apply to unified memory, and will not tell you the one thing you want, which is what actually fits and how fast it runs. Give it your hardware and ask for the general framework as a secondary section.

**P2-17. No session hygiene guidance.** Quality degrades across a very long chat as context fills. Add to "How to use": one module per fresh chat, Master Prompt re-pasted at the top, plus a two-line summary of which modules already exist so cross-references stay accurate.

**P2-18. No decay policy.** Half of `08-agents-tools-and-mcp.md` and `09-local-llm-inference.md` will be stale within a year. Add a `## Last reviewed` line and a `## Volatile claims` section at the bottom of every module listing what needs re-checking and when.

**P2-19. "Do not test or assess me at the beginning" has a real cost.** It is your call and there are good reasons for it: a diagnostic on day one is demoralizing and you want to rebuild foundations deliberately. Worth knowing the price, though. Without any calibration signal the curriculum will pitch `01` at a true beginner and you will spend hours on `for` loops.

A version that keeps your constraint: no test, but require every module to mark sections `[FOUNDATION]`, `[CORE]` or `[DEPTH]`, and open with a "skip-ahead map" telling you which sections to skim if you can already do a named task. You self-select, nothing quizzes you, and no time is wasted. That is in the rewrite as an opt-in line you can delete.

---

## Two things worth reconsidering, not defects

**The scope is roughly a year of full-time curriculum development.** Generating all 20-plus files takes many hours of prompting and produces perhaps 1,500 pages you will never read end to end. The failure mode is spending your study time building the study system. Consider generating `00`, `01a`, and `07` only, working through them for three weeks, and generating more only when you hit the wall. The rewrite reorders the priority list accordingly.

**A generated glossary of 200 terms is a weak learning artifact.** You will not read it and it will not stick. Terms learned in context inside a module, then exported to flashcards as you meet them, work far better. Consider cutting `14-glossary-and-concept-map.md` down to the concept map alone and letting the glossary accumulate from your own practice packs.

---

## Summary of changes in the rewritten library

| # | Change |
|---|---|
| 1 | Master Prompt gains: depth contract, continuation protocol, standing honesty and `[VERIFY]` rules, runnable-code rule, Mermaid rendering constraints, default persona, clarifying-question permission |
| 2 | New prompts for `02`, `03`, `13`, `project-2-rag-app`, `project-3-agent-evaluation` |
| 3 | `01-python-foundations` split into three files; `12-interview-prep` split into three; capstone split into five |
| 4 | Interview content de-duplicated: modules own concept Q&A, `12` owns framework and cross-cutting only |
| 5 | Single canonical 24-week plan in `00`; weekly and 12-week become derivations |
| 6 | Quiz generator made context-free |
| 7 | Practice packs use `<details>` collapsibles and live in separate files |
| 8 | Spaced repetition gets a failure rule, one source of truth, and an Anki CSV export |
| 9 | LLM-first fast path made explicit with its deferred-knowledge cost stated |
| 10 | Every module gains `## Last reviewed` and `## Volatile claims` |
| 11 | Priority order reordered toward "generate less, study sooner" |
