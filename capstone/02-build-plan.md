# CareerAtlas: Build Plan

**Capstone 3 of 5** · Last reviewed: 2026-09-18

Six weeks, each ending in a demo you could actually show someone. The ordering is chosen so the system is usable in week 3, because a capstone you do not use is one you cannot talk about convincingly.

---

## The rules

**Every week ends with something runnable.** Not "the ingestion module is complete" but "I indexed my notes and asked it three questions".

**The evaluation set is built in week 1**, before the retriever. Same inversion as project 2, same reason.

**Cut features, never the demo.** If week 4 is going badly, ship a smaller version of week 4's demo. A half-built feature that runs is evidence; a fully-designed feature that does not is not.

**Use it from week 3 onward.** Real usage finds bugs that testing does not, and it generates the screenshots and anecdotes that make the interview narrative concrete.

---

## Week 1: evaluation and skeleton

**Goal:** the harness exists and the project runs, before any retrieval code.

| Day | Work |
|---|---|
| 1 | Repository skeleton per `02` example 1: src layout, pyproject with the hatch wheel block, pre-commit, CI |
| 1 | SQLite schema from `01-architecture.md`, with migration applied by a script |
| 2-3 | **Write 50 evaluation questions over your own notes, before seeing the chunks** |
| 4 | Ingestion: hash, parse markdown and text only, fixed chunking, store in SQLite |
| 4 | Label `relevant_chunks` in the eval set by reading your own chunks |
| 5 | Embed with a hosted model, store the matrix, dense-only retrieval, top 5 |
| 5 | **Measure the baseline. Commit `eval/results/001-baseline.json`.** |

**Demo:** "Here are 50 questions over my notes. Here is the naive retriever's recall@5, MRR and nDCG. This number is what everything else gets compared against."

**Composition requirement**, matching project 2's:

| Category | Minimum |
|---|---|
| Single-note factual | 15 |
| Spanning two notes | 8 |
| **Unanswerable** | **12** |
| Exact identifier (`IQ2_XXS`, `ef_search`) | 6 |
| Conflicting notes | 4 |
| Conceptual, no single chunk | 5 |

**Twelve unanswerable is a quarter of the set**, and it is the category that makes refusal measurable. Do not reduce it.

**Week 1 is done when** `eval/results/001-baseline.json` exists and no retrieval improvement has been attempted.

---

## Week 2: retrieval and grounded answering

**Goal:** it answers questions from your notes with citations, or refuses.

| Day | Work |
|---|---|
| 1 | PDF and DOCX parsing, with the `warnings` column populated on lossy extraction |
| 1 | Extraction validation: character count against file size, non-alphanumeric ratio, heading count |
| 2 | BM25 index, RRF fusion. **Measure. Commit run 002.** |
| 3 | Structure-aware chunking, heading path into `embed_text`. **Measure. Commit run 003.** |
| 4 | Prompt assembly with token budget and explicit priority; generation with citations |
| 4 | Citation validator: every `[Sn]` resolves to a chunk in the retrieved set |
| 5 | Refusal: fixed wording, score threshold, `refusal_reason` populated |
| 5 | **Measure refusal correctness on the 12 unanswerable questions. Commit run 004.** |

**Demo:** ask it five questions from your own notes. Three answer with citations you can click through to the source. Two refuse, correctly, and the refusal names what it searched.

**The thing that will surprise you:** refusal correctness on the baseline will be poor. Systems answer unanswerable questions confidently by default. That number improving is one of your best before-and-after stories.

**Cut first if behind:** DOCX parsing. Markdown and PDF cover most of a study corpus.

---

## Week 3: mastery, scheduling, and first real use

**Goal:** you start using it.

| Day | Work |
|---|---|
| 1 | Concepts table, seeded from the mastery checklists in this repository's modules |
| 1-2 | Review scheduler as pure functions: intervals, the reset rule, the retirement rule |
| 2 | **Unit tests for the scheduler**, including the reset-on-fail rule and the boundary days |
| 3 | Mastery status with `evidence_kind` and `evidence_ref` required for advancement |
| 3-4 | Streamlit: ask, view sources, see what is due, mark a review pass or fail |
| 5 | Ingest your real notes. Use it. Write down what breaks. |

**Demo:** ask a question, get a cited answer, mark a concept reviewed, see the next review date change correctly.

**The scheduler tests matter disproportionately.** It is pure arithmetic over dates, which means it is fully testable and there is no excuse for it being wrong. It is also the component whose bugs are invisible: a wrong interval just quietly schedules the wrong day. Test the boundaries: due exactly today, one day early, one day late, failed at the 60-day interval, two consecutive passes at 60.

**From this week on, you are a user.** Keep a running `docs/observed-issues.md`. This becomes the raw material for `docs/failure-analysis.md`.

**Cut first if behind:** the Streamlit interface. A CLI is a legitimate interface and faster to build.

---

## Week 4: reranking, interview practice, and the grader

**Goal:** the differentiating features, with the grader's honesty mechanism.

| Day | Work |
|---|---|
| 1 | Cross-encoder reranking, toggleable. **Measure. Commit run 005.** |
| 2 | Rubric definition: explicit criteria, 1-5, versioned |
| 2-3 | Question generation, scoped to concepts at Practiced or above |
| 3 | Grading against the rubric at temperature 0, storing `rationale` and `model_version` |
| 4 | **Grading consistency measurement:** grade 20 stored answers twice, report agreement |
| 4 | Disagreement recording, and a view of grades you disagreed with |
| 5 | Grades feed mastery and rescheduling |

**Demo:** practise a question, get a rubric-scored answer with named gaps, disagree with one grade, and show the consistency number.

**The consistency measurement is the point of this week.** Per the PRD's U10, a grader nobody checks is a random number generator with good manners. Measure it, report it, and be willing to conclude the feature is not trustworthy.

**The honest outcome to be prepared for:** if consistency is poor, say so in the write-up and either fix it, with a tighter rubric and fewer criteria, or cut the feature. Shipping unreliable feedback in a learning tool is the harmful failure the PRD names.

**Cut first if behind:** question generation. Grade answers to questions from the module interview sections instead, which are already written.

---

## Week 5: gap analysis and operations

**Goal:** the second differentiator, plus production shape.

| Day | Work |
|---|---|
| 1-2 | Gap analysis: extract concepts from a job description, probe corpus coverage for each |
| 2 | **Every gap claim backed by a retrieval score**, never an unexplained assertion |
| 3 | Structured logging with trace ids; the `interactions` and `retrievals` tables populated |
| 3 | Cost per interaction recorded; a daily cost view |
| 4 | Ingestion health check per `03`'s worked example, with defined expectations |
| 4 | `/health` and `/ready`, with the embed-model assertion at startup |
| 5 | Docker, and the eval gate in CI with a tolerance |

**Demo:** paste a real job description, get a ranked gap list where each gap shows the best retrieval score found. Then show the cost of everything you did this week.

**The gap analysis has no ground truth**, which makes it the hardest thing here to evaluate. The honest approach: judge 20 surfaced gaps yourself as real or spurious, report precision, and say the sample is small. That is a better answer than a confident number.

**Cut first if behind:** Docker. A documented local run is acceptable for a single-user tool.

---

## Week 6: hardening, evaluation, write-up

**Goal:** it is finished, measured and explainable.

| Day | Work |
|---|---|
| 1 | Full evaluation run; complete the results table |
| 1 | Run one change that made something worse, and leave it in the table |
| 2 | `docs/failure-analysis.md` from `observed-issues.md`: 5-plus entries with measured fixes |
| 3 | README: what it is, how to run it, design decisions, what is out of scope |
| 3 | Screenshots from your own real usage |
| 4 | Interview narrative: 60-second and 5-minute, practised aloud and timed |
| 4 | Resume bullets with real numbers from `eval/results/` |
| 5 | A stranger test: fresh clone, follow the README, note every point of confusion, fix them |

**Demo:** the whole thing, to someone who has not seen it.

**The stranger test is not optional.** Clone into a clean directory, follow your own README literally, and do not use knowledge you have that is not written down. Every stumble is a README bug.

---

## Results table

Committed in the README, updated per run.

| Run | Change | recall@5 | MRR | nDCG@5 | Refusal acc. | Citation valid. | p50 latency | Cost/query |
|---|---|---|---|---|---|---|---|---|
| 001 | Baseline: fixed chunks, dense, top 5 | | | | | | | |
| 002 | + BM25 and RRF | | | | | | | |
| 003 | + structure-aware chunking, heading context | | | | | | | |
| 004 | + refusal threshold | | | | | | | |
| 005 | + cross-encoder rerank | | | | | | | |
| 006 | + parent-child retrieval | | | | | | | |

`[VERIFY: every cell blank until measured. A fabricated table is worse than none.]`

---

## Weekly demo checklist

Before calling a week done:

- [ ] Something runs end to end that did not run last week
- [ ] The results file for this week's changes is committed
- [ ] `observed-issues.md` updated from real use
- [ ] Tests pass, ruff and mypy clean
- [ ] You could show this week's demo to someone in three minutes

---

## Recovery rules

You will fall behind. From `00-north-star-roadmap.md` section 9, adapted.

**Rule 1: never skip the measurement.** A week's feature shipped without measuring it is a week with no evidence, and evidence is the deliverable.

**Rule 2: cut scope inside a week, never the demo.** Half a feature that runs beats a whole one that does not.

**Rule 3: one week behind is normal; three weeks behind means re-cut.** Drop weeks 4 and 5's differentiators, ship the MVP well, and say in the write-up that you scoped down deliberately. That reads better than an unfinished sprawl.

**Rule 4: if you have stopped using it, stop building and find out why.** Usually it is friction in the daily path: too many clicks to review, or the review queue is overwhelming. Fix that before adding anything.

---

## Success criteria for the whole build

- [ ] `eval/questions.jsonl` has 50-plus questions, 12-plus unanswerable, committed in week 1
- [ ] `eval/results/001-baseline.json` predates every other run
- [ ] Six runs with real numbers, at least one a regression, left in the table
- [ ] Citation validity is 100%, enforced by the validator
- [ ] Refusal correctness meets the PRD target, measured
- [ ] Scheduler unit tests cover the reset rule and the interval boundaries
- [ ] Grading consistency measured and reported, whatever the number
- [ ] `docs/failure-analysis.md` has 5-plus entries with measured fixes
- [ ] A stranger can run it from the README
- [ ] **You have used it for at least three weeks of real study**

The last one is the one that makes the rest credible.

**Next:** `capstone/03-evaluation.md`.

---

## Volatile claims

| Claim | Why it decays | Re-check against |
|---|---|---|
| Six weeks | Depends entirely on your hours per week | Your own week 1 |
| The improvement ordering in weeks 2 and 4 | A prior, not a result | Your results table |

The build-order principle, evaluation first and usable by week 3, is the durable part.

**Next review due:** end of week 3, when you will know whether the scoping was right.
