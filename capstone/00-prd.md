# CareerAtlas: Product Requirements

**Capstone 1 of 5** · Last reviewed: 2026-09-18

An evidence-grounded AI learning and interview copilot. It answers questions from your own study materials, finds gaps between what you know and what a role requires, and helps you practise explaining things.

---

## Why this project

**It is the only project in this repository whose user is definitely real.** You are the user, you are using it during the thing it supports, and that means you will find the bugs a demo never surfaces and you will know immediately when an answer is wrong.

**It combines every module**, which is the point of a capstone: retrieval from `07`, structured output and context budgeting from `06`, evaluation discipline from `04` and `07`, deployment and observability from `10`, and optionally local inference from `09`.

**It has a built-in honesty test.** A learning tool that overstates your mastery is worse than useless, and designing against that is a genuine product problem with a technical answer.

### What makes it credible rather than a portfolio exercise

A reviewer's default assumption is that a capstone is a tutorial with extra steps. Three things defeat that:

1. **Evidence-grounded by construction.** Every answer cites the note it came from, or refuses. An uncited claim is a bug, not a degradation.
2. **Evaluation before features**, as in project 2, with a measured baseline and a results table.
3. **It is used.** Screenshots of your own real study log, real gaps it found, real questions it got wrong.

---

## Users and scope

**Primary user: you.** A single-user local-first tool. Multi-user is a stretch goal and mostly exists to force the permission and isolation design.

**Secondary consideration: someone else in the same position.** Designing for a second user prevents the shortcuts that make a tool unshareable, such as hardcoded paths and assumptions about your own file layout.

### In scope for the MVP

| Capability | Why |
|---|---|
| Ingest notes, PDFs, job descriptions, project docs | The corpus |
| Answer questions grounded in them, with citations or refusal | The core |
| Gap analysis: what a job description requires that your notes do not cover | The differentiator |
| Concept mastery tracking, fed by review outcomes | Makes it a learning tool rather than a search box |
| Spaced-repetition scheduling | The thing that produces retention |
| Interview practice: generate questions, grade answers against a rubric | The other differentiator |

### Explicitly out of scope

State this in your README; it is a judgment signal.

- **No content generation for the corpus.** It works with your notes, it does not write them. A tool that generates its own knowledge base and then answers from it is measuring nothing.
- **No model fine-tuning.** Module `06` section 6: this is a facts problem, so it is RAG.
- **No mobile app.** Web or CLI.
- **No collaborative features.** Multi-user is about isolation, not collaboration.
- **No calendar or notification integration.** The scheduler outputs dates; something else can act on them.

### Non-goals worth naming

**It does not decide what you should learn.** It surfaces gaps and schedules reviews; you decide. A system that prescribes a curriculum from an LLM's opinion is the thing this repository's roadmap already does better, deliberately and reviewably.

**It does not grade you kindly.** A learning tool biased toward encouragement produces false confidence, which is the expensive failure. The rubric is explicit and the grading is calibrated against your own judgment.

---

## User stories

Written as behaviors with acceptance criteria, because that is what makes them testable.

### Ingestion

**U1.** *As a learner, I add a folder of notes and the system indexes them.*
- Accepts `.md`, `.txt`, `.pdf`, `.docx`
- Reports per-file: success, chunk count, or the specific parse failure
- Re-running is incremental: unchanged files by content hash are skipped
- A file that fails to parse does not stop the run and appears in a failures list

**U2.** *As a learner, I add a job description and it is treated differently from study material.*
- Tagged as a requirements document, not a knowledge document
- Not retrieved when answering study questions
- Used only for gap analysis

### Grounded answering

**U3.** *As a learner, I ask a question and get an answer citing my own notes.*
- Every factual claim carries a `[S1]` style citation
- Citations resolve to a viewable chunk with its source file and heading path
- Sources shown with retrieval scores, so I can see how confident the retrieval was

**U4.** *As a learner, I ask something my notes do not cover and the system says so.*
- Refuses with fixed wording when all retrieval scores are below threshold
- The refusal names what it searched, so I know it is a coverage gap and not a bug
- Refusals are logged, and the log is a reading list of what to study next

**U5.** *As a learner, my notes contradict each other and the system tells me.*
- Surfaces both sources rather than silently choosing
- This is common in study notes written months apart

### Gap analysis

**U6.** *As a learner, I compare a job description against my notes and see what is missing.*
- Extracts required concepts from the job description
- For each, reports whether the corpus covers it and at what depth, by chunk count and retrieval score
- Output is a ranked list of gaps, not prose
- **Every gap claim is itself evidence-backed**: "no chunk above 0.6 for this concept", not an unexplained assertion

### Mastery and review

**U7.** *As a learner, my concept mastery is tracked from evidence, not self-report.*
- Statuses from `tracker/progress-log.md`: Not Started through Interview Ready
- Advancement requires evidence: a graded answer, a completed exercise, a link
- **I can see why a concept has its current status**

**U8.** *As a learner, I see what is due for review today.*
- Intervals 1, 3, 7, 14, 30, 60 days
- A failed review resets to 1 day, not back one step
- The list is capped and prioritized, because forty due items produces avoidance

### Interview practice

**U9.** *As a learner, I practise a question and get rubric-based feedback.*
- Questions generated from concepts I have marked at least Practiced
- Grading against an explicit rubric with named criteria
- Feedback names what was missing, with a citation to my own notes
- A grade updates the mastery record and the review schedule

**U10.** *As a learner, I can see whether the grading is trustworthy.*
- I can disagree with a grade and record my disagreement
- Grading consistency is measured: the same answer graded twice should agree
- **This is the honesty mechanism.** A grader nobody checks is a random number generator with good manners.

---

## Success criteria

Measurable, because `11` section 2 says a design without them cannot be evaluated.

### Must have for the MVP to be done

| Criterion | Target | Measured by |
|---|---|---|
| Citation validity | 100% of cited ids exist in the retrieved set | Automated validator |
| Refusal correctness | ≥90% on the unanswerable eval slice | Eval set |
| Retrieval recall@5 | Beats the naive baseline by a measured margin | Eval set |
| Ingestion visibility | 100% of parse failures reported | Health check |
| Review scheduling | Correct intervals including the reset rule | Unit tests |
| p95 latency | Under 5 seconds for a grounded answer | Instrumentation |

### Should have

| Criterion | Target |
|---|---|
| Grading consistency | Same answer, two runs, agree within one rubric point ≥85% of the time |
| Gap analysis precision | ≥80% of surfaced gaps are real, judged by you |
| Cost per interaction | Under a stated budget |

### Explicitly not a success criterion

**Engagement time.** A learning tool that maximizes time spent is optimizing against the user. Time spent is a cost, not a benefit, and naming this is a product-judgment signal.

**Number of questions answered.** Same reason.

### How you will know it works

An evaluation set of at least 50 questions over your own corpus, built before the retriever, with at least 12 unanswerable, plus a separate set of 20 graded answers with your own rubric scores to calibrate the grader against.

---

## MVP versus stretch

**MVP, six weeks:** U1, U3, U4, U7, U8. Ingest, answer with citations or refuse, track mastery, schedule reviews. A Streamlit interface.

**Stretch, in value order:**

1. **U9 and U10**, interview practice with measured grading consistency. The most valuable stretch because it is the hardest to do honestly.
2. **U6**, gap analysis. Genuinely useful and technically interesting, because "is this concept covered" is a retrieval question with no ground truth.
3. **U5**, conflict detection.
4. **U2**, job description handling as a separate document type.
5. Local model option, per `09`. Turns a privacy property into a real memory-budget constraint.
6. React frontend.
7. Multi-user, which is really an isolation exercise.

**Cut ruthlessly.** A finished MVP with three stretch goals beats an unfinished system with ten half-built features, and `13-project-portfolio.md` says why.

---

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Your notes are too sparse to retrieve from | The system has nothing to ground on | Measure corpus coverage first; if it is thin, say so rather than papering over it |
| Grading is inconsistent | The feedback is noise | Measure consistency explicitly; a fixed rubric; temperature 0 |
| Mastery tracking overstates | False confidence, the expensive failure | Evidence-required advancement; failed reviews reset |
| Gap analysis hallucinates requirements | Studying the wrong things | Every gap claim backed by a retrieval score |
| Scope grows | Never finished | The MVP list above, and nothing else until it works |
| You stop using it | No real feedback, so it stays a demo | Build the MVP small enough to be usable in week 3 |

**The last one is the real risk.** A capstone you do not use is a capstone you cannot talk about convincingly.

---

## What this document commits to

- The MVP is five user stories, not eleven
- Evaluation exists before the retriever
- Every claim the system makes is backed by evidence it can show
- The system is honest about what it does not know, and that honesty is measured
- Engagement is not a success metric

**Next:** `capstone/01-architecture.md`.

---

## Volatile claims

None. This is a requirements document; the only thing that should change it is your own judgment about scope, and if it does, update it here rather than drifting.

**Next review due:** at the end of week 3 of the build, when you will know whether the MVP was correctly scoped.
