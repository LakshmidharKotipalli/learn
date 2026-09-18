# Progress Log

**Last reviewed:** 2026-09-18 · **Volatility:** low

This file is the single source of truth for mastery status and review scheduling. `00-north-star-roadmap.md` says when you first learn something. This file says when you revisit it, and whether you actually know it.

Keep it in version control. The history is the point: six months from now the git log of this file is a record of what you did, which is worth more than the file itself.

---

## 1. How to use this file

**Update it twice a week, not daily.** Once mid-week after a study session, once at the end of the week during the retrospective. Daily updating turns into ceremony and then into abandonment.

**Status is claimed by evidence, not by feeling.** Each status has an entry requirement below. If you cannot point at the evidence, the status does not change. This is the entire value of the file: in month five you will want to know what you actually know, and a file full of optimistic self-assessment answers nothing.

**The review schedule is not optional and not aspirational.** If you are not going to do the reviews, delete section 4 rather than carrying a fiction.

---

## 2. Status ladder

Six statuses. Each one has an entry requirement that someone else could verify.

| Status | Entry requirement | Typical time in status |
|---|---|---|
| **Not Started** | Default. | n/a |
| **Learning** | You have read the material once. | Days |
| **Practiced** | You have completed at least one exercise without looking at the solution. | 1 to 2 weeks |
| **Can Explain** | You have given a 60-second explanation out loud, unscripted, and it was coherent. Record it; if you would not send the recording to anyone, you are not here yet. | 2 to 4 weeks |
| **Can Build** | You have used it in something that runs, in a repository, not in a notebook cell you have since closed. Link required. | Weeks to months |
| **Interview Ready** | Can Explain plus Can Build, plus you have answered a question on it in a mock interview and scored 3 or better on the rubric in section 6. | The goal state |

**The honest failure mode this ladder is designed to prevent:** reading a module, feeling like you understand it, marking it complete, and discovering in an interview that you cannot produce a sentence about it. "Can Explain" exists as a separate rung specifically because explanation is a distinct skill from comprehension, and it is the one being tested.

**Regression is normal and should be recorded.** If a review goes badly, drop the status. A concept that fell from Can Explain to Practiced is useful information. A file where status only ever increases is a file nobody is being honest in.

---

## 3. Concept mastery tracker

Pre-populated with the concepts the roadmap says matter. Add rows as you go; do not remove rows you have not reached.

Legend for priority: **M** = must know, **S** = should know, **N** = nice to know. Taken from `00-north-star-roadmap.md` section 8.

### Phase 1: Python

| Concept | Pri | Status | Evidence link | Quiz | Last review | Next review | Notes |
|---|---|---|---|---|---|---|---|
| Names, objects, aliasing | M | Not Started | | | | | |
| Mutability and its consequences | M | Not Started | | | | | |
| Shallow vs deep copy | M | Not Started | | | | | |
| Truthiness and the `0` vs `None` trap | M | Not Started | | | | | |
| Collection complexity, list vs set vs dict | M | Not Started | | | | | |
| Mutable default arguments | M | Not Started | | | | | |
| Scope, closures | S | Not Started | | | | | |
| Exception strategy, catch vs crash | M | Not Started | | | | | |
| Files, encoding, pathlib | S | Not Started | | | | | |
| JSON and JSONL handling | S | Not Started | | | | | |
| CSV and defensive loading | S | Not Started | | | | | |
| Generators and iterators | S | Not Started | | | | | |
| Decorators | S | Not Started | | | | | |
| Context managers | S | Not Started | | | | | |
| Dataclasses and OOP design | S | Not Started | | | | | |
| Type hints | S | Not Started | | | | | |
| pytest, fixtures, parametrization | M | Not Started | | | | | |
| Logging vs printing | S | Not Started | | | | | |
| Async basics | N | Not Started | | | | | |
| Pydantic models | S | Not Started | | | | | |
| Retries and backoff | S | Not Started | | | | | |

### Phase 2: Software engineering

| Concept | Pri | Status | Evidence link | Quiz | Last review | Next review | Notes |
|---|---|---|---|---|---|---|---|
| Git model, branching, rebase vs merge | M | Not Started | | | | | |
| Pull requests and code review | M | Not Started | | | | | |
| Dependency management and lockfiles | M | Not Started | | | | | |
| Testing strategy, what each level catches | M | Not Started | | | | | |
| CI/CD basics | M | Not Started | | | | | |
| Debugging as a method | M | Not Started | | | | | |
| HTTP, REST, status codes, idempotency | S | Not Started | | | | | |
| Concurrency vs parallelism | S | Not Started | | | | | |

### Phase 3: Data, SQL, statistics

| Concept | Pri | Status | Evidence link | Quiz | Last review | Next review | Notes |
|---|---|---|---|---|---|---|---|
| Relational modeling and keys | S | Not Started | | | | | |
| Joins, with row-count intuition | M | Not Started | | | | | |
| Aggregation and grouping traps | S | Not Started | | | | | |
| Window functions | S | Not Started | | | | | |
| Indexes and query plans | S | Not Started | | | | | |
| pandas vs SQL, when each wins | S | Not Started | | | | | |
| Distributions and sampling | S | Not Started | | | | | |
| What a p-value does not mean | S | Not Started | | | | | |
| A/B testing and sample size | N | Not Started | | | | | |

### Phase 4: Classical ML

| Concept | Pri | Status | Evidence link | Quiz | Last review | Next review | Notes |
|---|---|---|---|---|---|---|---|
| Problem framing | M | Not Started | | | | | |
| Train/val/test and cross-validation | M | Not Started | | | | | |
| Data leakage, the three main routes in | M | Not Started | | | | | |
| Bias-variance tradeoff | M | Not Started | | | | | |
| Regularization L1, L2 | S | Not Started | | | | | |
| Precision, recall, F1, and which to use | M | Not Started | | | | | |
| ROC-AUC vs PR-AUC | S | Not Started | | | | | |
| Calibration | S | Not Started | | | | | |
| Threshold selection as a business decision | M | Not Started | | | | | |
| Trees, forests, gradient boosting | S | Not Started | | | | | |
| k-means and PCA | N | Not Started | | | | | |
| sklearn pipelines and reproducibility | S | Not Started | | | | | |
| Drift and monitoring | S | Not Started | | | | | |

### Phase 5: Deep learning

| Concept | Pri | Status | Evidence link | Quiz | Last review | Next review | Notes |
|---|---|---|---|---|---|---|---|
| Forward pass and loss | M | Not Started | | | | | |
| Backpropagation | M | Not Started | | | | | |
| Gradient descent and optimizers | S | Not Started | | | | | |
| Learning rate, batch size tradeoffs | S | Not Started | | | | | |
| Activation functions | S | Not Started | | | | | |
| Vanishing and exploding gradients | M | Not Started | | | | | |
| Overfitting, dropout, early stopping | M | Not Started | | | | | |
| PyTorch tensors and autograd | S | Not Started | | | | | |
| Training loop written from scratch | S | Not Started | | | | | |
| Reading learning curves | M | Not Started | | | | | |
| Transfer learning and fine-tuning | S | Not Started | | | | | |
| Mixed precision and memory | N | Not Started | | | | | |

### Phase 6: Transformers and LLMs

| Concept | Pri | Status | Evidence link | Quiz | Last review | Next review | Notes |
|---|---|---|---|---|---|---|---|
| Tokenization and its failure modes | S | Not Started | | | | | |
| Embeddings | M | Not Started | | | | | |
| Self-attention, worked by hand | M | Not Started | | | | | |
| Multi-head attention | S | Not Started | | | | | |
| Causal masking | S | Not Started | | | | | |
| Encoder vs decoder vs encoder-decoder | S | Not Started | | | | | |
| Context window and KV cache | M | Not Started | | | | | |
| Temperature, top-p, top-k | M | Not Started | | | | | |
| Structured outputs and constrained generation | S | Not Started | | | | | |
| Pretraining vs SFT vs preference optimization | S | Not Started | | | | | |
| Quantization and the quality tradeoff | M | Not Started | | | | | |
| Why prompting does not fix hallucination | M | Not Started | | | | | |
| Prompt injection | M | Not Started | | | | | |
| LLM evaluation approaches | M | Not Started | | | | | |

### Phase 7: RAG and retrieval

| Concept | Pri | Status | Evidence link | Quiz | Last review | Next review | Notes |
|---|---|---|---|---|---|---|---|
| RAG vs fine-tuning vs prompting vs tools | M | Not Started | | | | | |
| Document parsing and messy formats | S | Not Started | | | | | |
| Chunking strategies and tradeoffs | M | Not Started | | | | | |
| Similarity metrics | S | Not Started | | | | | |
| Vector indexes and ANN recall loss | S | Not Started | | | | | |
| Metadata filtering with ANN | S | Not Started | | | | | |
| Hybrid search | S | Not Started | | | | | |
| Rerankers | S | Not Started | | | | | |
| Query rewriting | S | Not Started | | | | | |
| Citation grounding | M | Not Started | | | | | |
| Retrieval metrics, recall@k, MRR, nDCG | M | Not Started | | | | | |
| Answer quality evaluation | M | Not Started | | | | | |
| Building an evaluation set | M | Not Started | | | | | |
| RAG failure taxonomy and diagnosis | M | Not Started | | | | | |
| Permissions and multi-tenancy | N | Not Started | | | | | |
| Freshness and deletion | N | Not Started | | | | | |

### Phase 8: Agents, tools, MCP

| Concept | Pri | Status | Evidence link | Quiz | Last review | Next review | Notes |
|---|---|---|---|---|---|---|---|
| Workflow vs agent, when each is right | M | Not Started | | | | | |
| Tool schemas and validation | M | Not Started | | | | | |
| Agent loop and stopping conditions | S | Not Started | | | | | |
| State, memory, checkpoints | S | Not Started | | | | | |
| Human in the loop | S | Not Started | | | | | |
| Multi-agent, and when not to | N | Not Started | | | | | |
| MCP hosts, clients, servers | S | Not Started | | | | | |
| Building an MCP server | S | Not Started | | | | | |
| Retries, timeouts, idempotency | M | Not Started | | | | | |
| Circuit breakers and fallbacks | S | Not Started | | | | | |
| Trajectory evaluation | S | Not Started | | | | | |
| Injection via tool output | M | Not Started | | | | | |
| Tool permission boundaries | M | Not Started | | | | | |

### Phase 9: Local inference

| Concept | Pri | Status | Evidence link | Quiz | Last review | Next review | Notes |
|---|---|---|---|---|---|---|---|
| Model formats, GGUF, safetensors | S | Not Started | | | | | |
| Quantization levels and quality cost | M | Not Started | | | | | |
| KV cache memory formula | M | Not Started | | | | | |
| VRAM vs unified memory vs bandwidth | M | Not Started | | | | | |
| Runtime tradeoffs, llama.cpp, vLLM, Ollama | S | Not Started | | | | | |
| Continuous batching | S | Not Started | | | | | |
| TTFT vs tokens per second | M | Not Started | | | | | |
| Benchmarking methodology | M | Not Started | | | | | |
| OpenAI-compatible serving | S | Not Started | | | | | |
| Local vs hosted cost analysis | S | Not Started | | | | | |
| OOM and quality-degradation troubleshooting | S | Not Started | | | | | |

### Phase 10: MLOps and deployment

| Concept | Pri | Status | Evidence link | Quiz | Last review | Next review | Notes |
|---|---|---|---|---|---|---|---|
| Docker and containers | M | Not Started | | | | | |
| FastAPI service design | M | Not Started | | | | | |
| API versioning and auth | S | Not Started | | | | | |
| Rate limiting and queues | S | Not Started | | | | | |
| Caching strategy | S | Not Started | | | | | |
| Logs vs metrics vs traces | M | Not Started | | | | | |
| What to alert on | M | Not Started | | | | | |
| SLOs and SLIs | S | Not Started | | | | | |
| LLM-specific monitoring | M | Not Started | | | | | |
| Cost attribution per request | S | Not Started | | | | | |
| Rollback and canary | M | Not Started | | | | | |
| Secrets management | M | Not Started | | | | | |
| Experiment and model tracking | S | Not Started | | | | | |

### Phase 11: System design

| Concept | Pri | Status | Evidence link | Quiz | Last review | Next review | Notes |
|---|---|---|---|---|---|---|---|
| Requirements clarification method | M | Not Started | | | | | |
| Capacity estimation arithmetic | M | Not Started | | | | | |
| Component vocabulary | M | Not Started | | | | | |
| Enterprise RAG design | M | Not Started | | | | | |
| Local-first private copilot design | S | Not Started | | | | | |
| Multi-tool support agent design | S | Not Started | | | | | |
| Backpressure and fault tolerance | S | Not Started | | | | | |
| Cost estimation and optimization | S | Not Started | | | | | |
| The repeatable answer framework | M | Not Started | | | | | |

---

## 4. Spaced repetition

### Intervals

`1 day → 3 days → 7 days → 14 days → 30 days → 60 days → retired to quarterly`

A concept enters the schedule when it reaches **Practiced**. Not before. Reviewing something you have only read is rereading, which does not produce retention.

### The rules

**Passing a review** moves the concept to the next interval. Set `Next review` to today plus that interval.

**Failing a review resets the concept to the 1-day interval.** Not back one step, all the way to the start. This is the rule people quietly ignore and it is the one that makes the system work. If you could not retrieve it, the spacing was too long for that concept and the schedule needs to relearn where you actually are.

**Two consecutive passes at the 60-day interval retires the concept to quarterly.** Retired concepts still get reviewed, four times a year, because retired is not the same as permanent.

**A failed review also drops the status** by one rung. Failed a Can Explain concept? It goes back to Practiced. The tracker should reflect reality.

### What counts as a pass

Not "I read it and it looked familiar". A pass means you produced the thing from memory first, and then checked.

| Status of the concept | A pass means |
|---|---|
| Practiced | You solved a related exercise without the solution open |
| Can Explain | You said the 60-second version aloud before looking, and it was right |
| Can Build | You answered a "how would you implement" question without your code open |
| Interview Ready | You answered a curveball on it, not the question you rehearsed |

### Review queue

Sort by `Next review` ascending. These are the only rows you touch on a review day.

| Concept | Due | Interval | Last result | Consecutive passes at 60d |
|---|---|---|---|---|
| | | | | |

Keep this to the next 14 days. A queue showing four months of future reviews is noise.

---

## 5. Anki export

A Markdown table cannot notify you. It is an audit trail, not a scheduler. Use Anki, or any SM-2 implementation, for the actual scheduling, and keep this file as the record of status and evidence.

### Column specification

Export a CSV with no header row, comma-separated, quoted fields, UTF-8:

```
"Front","Back","Tags"
```

| Column | Content |
|---|---|
| **Front** | The question. One concept. Never "explain RAG"; that is a chapter, not a card. |
| **Back** | The answer, under 60 words. If it needs more, it is two cards. |
| **Tags** | Space-separated: `phase07 rag must` |

### Example rows

```csv
"Why is `x in my_list` O(n) but `x in my_set` O(1)?","A list has no structure to exploit, so membership is a linear scan. A set hashes the value to a bucket and checks only that bucket. Average case; adversarial collisions degrade it.","phase01 python must"
"What resets a spaced-repetition interval?","A failed review, all the way to 1 day, not back one step.","meta"
"In RAG, the answer is wrong but the retrieved chunks are correct. Where is the bug?","Generation, not retrieval: prompt construction, context ordering, or the model ignoring provided context. Check the prompt actually contains the chunks before blaming the model.","phase07 rag must"
"What does the KV cache store, and why does it dominate memory at long context?","Previously computed attention keys and values per layer per token, so they are not recomputed each step. It grows linearly with sequence length and batch size.","phase06 llm must"
```

### Generating cards

Practice packs in `quizzes/` end with a ready-made CSV block. Append it to `anki_export.csv` as you finish each module. Do not write cards for concepts below **Practiced**.

**Card quality rule:** a card that can be answered by pattern-matching the question's wording teaches you the wording. Every card should require you to produce something, not recognize something. Prefer "here is a symptom, where is the bug" over "what is X".

---

## 6. Mock interview log

| Date | Type | Topics | Score 1-5 | What went wrong | Action taken |
|---|---|---|---|---|---|
| | | | | | |

Types: `python-live`, `ml-concepts`, `llm-rag`, `system-design`, `project-deep-dive`, `behavioral`.

### Scoring rubric

| Score | Meaning |
|---|---|
| 1 | Could not answer |
| 2 | Answered with significant prompting, or was wrong in a way that mattered |
| 3 | Correct but rambling, or missed the tradeoff |
| 4 | Correct, structured, named the tradeoff |
| 5 | Correct, structured, and I raised something the interviewer had not asked about |

A concept needs a 3 or better to reach **Interview Ready**. A 4 is the realistic target. A 5 is what happens occasionally on things you have built.

**The `What went wrong` column is the valuable one.** Fill it even on a 4. Patterns show up across entries that do not show up in any single one: always running long, always forgetting to state assumptions, always reaching for the framework name instead of the concept.

---

## 7. STAR story bank

Behavioral and project questions are answered from a small set of prepared stories, reused across many questions. Six to eight good ones covers most loops.

**Populate this from your own work only.** An invented story collapses under a follow-up question, and follow-up questions are exactly what this format invites.

### Template

```
### Story: <short name>

**Use for:** <which question types this answers>

**Situation:** <context, 2 sentences, enough to make the stakes clear>

**Task:** <what you specifically were responsible for>

**Action:** <what you did, in first person singular, with the decision and the
alternative you rejected>

**Result:** <outcome, with a number if you have one, honestly stated if you
do not. "We did not measure it" is an acceptable and credible answer.>

**If they push:** <the follow-up you expect, and your answer>

**What I would do differently:** <required; this question is asked constantly
and having no answer reads as having learned nothing>
```

### Stories to prepare

Aim for one per row. The left column is the question shape, not the question.

| Story slot | Question shapes it covers | Status |
|---|---|---|
| A technical decision with a real tradeoff | "Tell me about a design decision you made" | Not written |
| Something that failed in production | "Tell me about a time something broke" | Not written |
| A bug that took too long to find | "Walk me through a hard debugging session" | Not written |
| Disagreeing with someone technical | "Tell me about a conflict" | Not written |
| Scope you had to cut | "Tell me about a deadline you missed" | Not written |
| Something you learned quickly under pressure | "How do you handle unfamiliar tech" | Not written |
| A project you are proud of | "Tell me about your favorite project" | Not written |
| Work you did with heavy AI assistance | "How do you use AI tools in your work" | Not written |

That last slot is increasingly asked and most candidates handle it badly, either overclaiming or apologizing. `12c-interview-behavioral-and-projects.md` covers how to answer it. Prepare it deliberately.

---

## 8. Weekly retrospective

Append one block per week. Keep it short enough that you will actually write it.

```
## Week <n>, <date>

**Artifact produced:** <link, or "none" and why>
**Hours actually spent:** <number, honest>
**Status changes:** <concept: old -> new>
**Reviews due / completed:** <n / n>
**Failed reviews:** <which concepts, and your read on why>
**Blocked on:** <specific, or "nothing">
**Next week's one priority:** <one thing, not a list>
```

**The two fields that matter most** are hours actually spent and reviews completed versus due. Everything else is easy to write optimistically. Those two are countable, and after four weeks they tell you whether the plan you chose matches the life you have. If hours are consistently below plan, re-cut the schedule using the compression rules in `00-north-star-roadmap.md` section 7. Do not keep a plan you are failing and call it motivation.

---

## Connections

- `00-north-star-roadmap.md` owns the schedule of first exposure. This file owns everything after that.
- `tracker/weekly-plan.md` is the working template for a single week. Its retrospective section feeds section 8 here.
- `quizzes/*-practice.md` produce the quiz scores in section 3 and the Anki rows in section 5.
- `12c-interview-behavioral-and-projects.md` expands section 7 into full templates and worked examples.
- `13-project-portfolio.md` scores the artifacts linked in the Evidence column.

---

## Volatile claims

Almost nothing here decays. The one exception:

| Claim | Why it decays | Re-check against |
|---|---|---|
| The 1/3/7/14/30/60 interval set | A reasonable general-purpose schedule, not a personalized one | Your own failure rate after two months. If you are failing more than about 20 percent of reviews, the intervals are too long for you; stretch them only once failures are rare. |

**Next review due:** after block 2, week 8. By then you will know whether you are actually using this file, which is the only question that matters about it.
