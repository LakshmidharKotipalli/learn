# CareerAtlas: Interview Narrative

**Capstone 5 of 5** · Last reviewed: 2026-09-18

How to talk about it, the README, the system design walkthrough, and honest resume bullets.

Everything here has bracketed placeholders. **Fill them from `eval/results/` before speaking any of it aloud.** A narrative delivered with brackets in it is worse than no narrative.

---

## 1. The 60-second version

Structure per `12a` section 2: direct answer, mechanism, number, tradeoff, stop.

> "CareerAtlas is a learning copilot over my own study notes. It answers questions with citations back to the specific note, or refuses when the notes don't cover it, and it tracks concept mastery with spaced-repetition scheduling.
>
> The design decision I'd point at is that the scheduler and the mastery model are a relational database and pure functions, not the LLM. Scheduling is deterministic arithmetic over dates and outcomes, so putting it in a model would make it non-deterministic, unauditable and expensive. The model does the one thing only it can do, which is generating explanations and grading free text.
>
> I built the evaluation set before the retriever: 50 questions over my own notes with 12 unanswerable, so refusal is measurable. Recall@5 went from [X] to [Y] across [N] measured changes, and citation validity is enforced at 100% by a validator rather than being a metric I hope stays high.
>
> The thing I'm least confident about is the grading. I measured consistency at [Z] on 20 answers, which is a small sample."

**Why it ends there.** Ending on the weakest part is deliberate: it invites the question you most want, it signals you are not selling, and it is the honest thing. `12a` section 2's "then stop" applies.

---

## 2. The 5-minute version

Adds, in `12a`'s order: failure mode, rejected alternative, what you measured, what you would do differently.

### The constraint that shaped it

> "The corpus is my own notes, a few thousand chunks. That one fact removed a whole category of infrastructure. At 5,000 chunks and 1,024 dimensions the vector matrix is 20 megabytes, so an exhaustive cosine scan is a few milliseconds. I used a numpy array rather than a vector database.
>
> I'd change that above about 100,000 chunks, or if I needed filtering I couldn't do in SQLite, or concurrent writers. I wanted a stated reversal condition, because a decision without one is just a preference."

### The decision worth defending

> "The learner model is relational. Mastery status, review schedule, grades, all in SQLite with the scheduler as pure functions I unit-tested, including the rule that a failed review resets to the one-day interval rather than stepping back one.
>
> The alternative was asking the model what I should review next, which is how a lot of these tools work. I rejected it because scheduling is arithmetic. In a database it's correct, free, explainable to the user and covered by tests. In a model it's none of those. The principle I'd state is: use the model only for what only it can do."

### What broke

> "Three things worth mentioning.
>
> Refusal was terrible at baseline. The system answered unanswerable questions confidently, which in a learning tool is the harmful failure, because it tells you that you know something you don't. Adding an explicit refusal instruction with fixed wording plus a score threshold took it from [A] to [B]. Fixed wording matters because it makes refusal programmatically detectable, which is what makes it measurable.
>
> Chunking destroyed my headings. A note section about quantization didn't contain the word 'quantization' because the heading was in the previous chunk. I found one at rank [N] when it should have been top 3. Structure-aware chunking plus putting the heading path into the embedded text fixed the class.
>
> And the grading. I measured consistency by grading the same 20 answers twice at temperature 0 and got [Z] within-one agreement. [If low: that told me the feature wasn't trustworthy, so I tightened the rubric to fewer explicit criteria and remeasured.] I also recorded every grade I disagreed with, because a grader nobody checks is a random number generator with good manners."

### What you would do differently

> "Label the relevant chunks earlier. I wrote the eval questions first and labelled later, and labelling forced me to read my own chunks, which surfaced the heading problem. A week earlier and I'd have avoided the work in between.
>
> And I'd measure cost per interaction from day one rather than week five. By the time I instrumented it I couldn't tell which change had caused the increase."

---

## 3. System design walkthrough

If asked to design this from scratch, in an interview. Structure per `11` section 1.

**Clarify (5 min).** Single user or team? How much material, and in what formats? Is privacy a hard constraint, because that decides local versus hosted? What does success mean, and be explicit that engagement time is the wrong metric for a learning tool.

**Estimate (5 min), out loud:**

```
500 notes × ~800 tokens        = 400,000 tokens
chunked at 400                 = 1,000 chunks
1,024-dim float32              = 4 MB of vectors

20 interactions/day × 30 days  = 600/month
prompt: 5 × 400 + 500 + 200    = 2,700 tokens
output                         = 300 tokens
per month: 600 × 3,000         = 1.8M tokens
```

**Then the conclusion the arithmetic forces:** 4 MB of vectors means no vector database, and 1.8M tokens a month means cost is not the binding constraint at this scale, so the design should optimize for correctness and explainability rather than efficiency. **Saying what the numbers rule out is as useful as saying what they require.**

**Design (10 min).** The diagram from `01-architecture.md`. Emphasize the split: relational learner model, retrieval for grounding, model for generation and grading only.

**Deep dive (10-15 min), wherever they push.** Likely candidates: how refusal works and how you measure it; how mastery advancement is evidence-gated; how you evaluate a grader with no ground truth.

**Bottlenecks (5 min).** In order: corpus sparsity, so the system refuses a lot and the refusal log becomes a study list, which is a feature; PDF extraction quality, which caps everything downstream; grading reliability; and startup time if the corpus grows, since the whole matrix loads.

**Evaluation and operations (5 min).** The four-way split from `03-evaluation.md`, and specifically that two components have no ground truth and are measured against your own judgment with the sample size stated.

**The differentiating move on this question:** most candidates design a RAG system. The interesting part here is the learner model, and leading with "most of this system is not the LLM" is what makes the answer memorable.

---

## 4. README template

For the repository root. Replace every bracket.

````markdown
# CareerAtlas

An evidence-grounded learning copilot over my own study notes. Answers
questions with citations, refuses when the notes don't cover it, tracks
concept mastery from evidence, and schedules spaced-repetition review.

Built while working through an AI engineering curriculum. I use it daily.

## What it does

```
$ careeratlas ask "what resets a spaced repetition interval?"

A failed review resets the concept to the 1-day interval, not back one
step [S1]. Two consecutive passes at the 60-day interval retire it to
quarterly review [S1].

Sources:
  [S1] tracker/progress-log.md > Spaced repetition > The rules  (0.89)
```

[paste your actual output, and a screenshot of the review view]

## Design decisions

**The learner model is relational, not inferred.** Mastery, review
scheduling and grades live in SQLite with the scheduler as pure functions.
Scheduling is arithmetic over dates; putting it in a model would make it
non-deterministic, unauditable and expensive. The model generates
explanations and grades free text. It does not decide what is due.

**No vector database.** [N] chunks at 1,024 dimensions is [N] MB, so an
exhaustive numpy scan is a few milliseconds. I'd revisit above ~100k
chunks or if I needed concurrent writers.

**Cites or refuses.** An uncited claim is a bug. A validator checks every
citation marker against the actually-retrieved set, and it's enforced at
100% rather than tracked as a metric.

**No tools, deliberately.** The system reads and generates; it cannot
send, fetch or act. My corpus includes documents I didn't write, so
adding a tool would complete the private-data plus untrusted-content plus
external-communication trifecta and require a much larger control set.

## Results

| Run | Change | recall@5 | MRR | Refusal acc. | p50 | Cost/query |
|---|---|---|---|---|---|---|
| 001 | Baseline | | | | | |
| ... | | | | | | |

Full reports in `eval/results/`. The evaluation set was built before the
retriever; `001-baseline.json` predates every other run.

## Known limitations

- Grading consistency is [Z] on a 20-answer sample. [Interpretation.]
- Gap analysis has no ground truth; precision is [X] on 20 gaps I judged
  myself, which is a small and biased sample.
- PDF extraction quality caps retrieval quality and I haven't measured
  how much.
- Notes go to a hosted model by default. A local option exists; see
  `docs/local-setup.md`.

## Install

```bash
git clone https://github.com/[you]/careeratlas && cd careeratlas
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env    # add your API key
careeratlas ingest ~/notes
careeratlas serve
```

## Development

```bash
pytest                 # [N] tests
ruff check . && ruff format --check .
mypy src/
careeratlas eval       # runs the evaluation set against the baseline
```

## Not built, on purpose

No content generation, no fine-tuning, no mobile app, no collaboration,
no calendar integration. It works with notes I wrote; it doesn't write
them, because a system that generates its own knowledge base and answers
from it is measuring nothing.

## License

MIT
````

**The "Known limitations" section is the one to write carefully.** It is the section reviewers read first to calibrate everything else, and a README without one reads as either naive or dishonest.

---

## 5. Resume bullets

Fill every bracket from your own results files. Remove any bullet you cannot fill.

```
CareerAtlas | Python, FastAPI, SQLite, [embedding model], [generator]
· Built an evidence-grounded learning system over a personal corpus of [N]
  documents, with citation validation enforcing that every claim resolves to
  a retrieved source.
· Established an evaluation-first workflow: a [N]-question labelled set with
  [N] unanswerable cases preceded any retrieval code, giving a measured
  baseline for [N] subsequent changes.
· Improved recall@5 from [X] to [Y] through structure-aware chunking, hybrid
  dense and BM25 retrieval with reciprocal rank fusion, and cross-encoder
  reranking, measuring each change independently.
· Raised refusal correctness on unanswerable questions from [A] to [B] using
  fixed-wording refusal and a score threshold, making refusal programmatically
  measurable.
· Measured LLM grading consistency at [Z] across repeated runs and [recorded
  the limitation / tightened the rubric and remeasured], rather than shipping
  unverified automated feedback.
· Designed the scheduler and mastery model as deterministic relational logic
  with [N] unit tests, reserving model calls for generation and grading.
```

**The fifth bullet is the strongest one on the page**, and it is the one most people would never write. It says you measured something inconvenient and acted on the result. Interviewers notice that far more than an improvement figure.

`[VERIFY: replace every bracket. A bullet reading "improved recall from [X] to [Y]" on a submitted CV is a disqualifying error.]`

---

## 6. Anticipated questions

**"Why not just use [existing tool]?"**

> "For the retrieval half, an existing tool would be fine. The part that doesn't exist off the shelf is the learner model: evidence-gated mastery tracking tied to spaced repetition, where advancement requires a graded answer or a linked artifact rather than self-report. That's the piece I actually wanted, and it's the piece that's a database rather than a model."

**"Isn't this over-engineered for one user?"**

> "Some of it, yes, deliberately. The evaluation harness is more than a personal tool strictly needs. I built it because without it every change is a guess, and I'd already spent time tuning things that turned out not to help. The parts I deliberately under-engineered: no vector database, SQLite not Postgres, Streamlit not React, no multi-user."

**"How do you know the grading is any good?"**

> "I measured it three ways. Consistency, by grading the same 20 answers twice at temperature 0 and comparing, which gives [Z] within-one agreement. Calibration, by grading 20 answers myself first and comparing, which catches systematic bias separately from noise. And disagreement rate in normal use, recorded in the schema, which is the longest-running signal and costs nothing.
>
> Twenty is a small sample. It's enough to detect badly wrong and not enough to claim a precise figure, and I'd say that rather than report a number with false confidence."

**"What's the weakest part?"**

> "[Your honest answer.] Probably the gap analysis, because it has no ground truth and I'm judging its output myself, which is a biased sample of one person. I split the failures three ways: a real gap, a false gap where retrieval failed to find coverage I do have, and a spurious requirement where extraction hallucinated. The three have completely different fixes, so at least the classification tells me where to look."

**"Did you use AI to build this?"**

Per `12c` section 5:

> "Heavily, for implementation. What I owned was the design decisions, the evaluation and the debugging. The decision to keep scheduling out of the model, the choice to exclude unanswerable cases from recall metrics, the three-way gap classification. The assistant wrote a lot of the code; it didn't decide any of that, and it wouldn't have caught the two scheduler tests where my own expectations were wrong rather than the code."

---

## 7. Before you use any of this

- [ ] Every bracket filled from `eval/results/`
- [ ] The 60-second version said aloud, timed, under 70 seconds
- [ ] The 5-minute version said aloud, timed, under 6 minutes
- [ ] The system design walkthrough done on a whiteboard with a 45-minute timer
- [ ] Both recorded and watched against `12c` section 7's checklist
- [ ] README passes the stranger test
- [ ] You can answer three "why" probes on the deepest decision before running out
- [ ] Resume bullets contain no brackets

---

## Connections

- `12a-interview-framework.md` section 2 is the answer structure used throughout.
- `12c-interview-behavioral-and-projects.md` sections 4 and 5 are the deep-dive and AI-assistance framing.
- `11-ai-system-design.md` section 1 is the walkthrough structure.
- `13-project-portfolio.md` has the rubric to score this against.
- `capstone/03-evaluation.md` produces every number referenced here.

---

## Volatile claims

| Claim | Why it decays | Re-check against |
|---|---|---|
| Every bracketed number | They are yours, not mine | `eval/results/` |
| Anticipated questions | Interview norms shift | Your own notes after five loops |

**Next review due:** after your first interview where you discussed this project.
