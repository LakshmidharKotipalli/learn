# 12a Interview Framework

**Last reviewed:** 2026-09-18 · **Volatility:** medium. Role expectations shift; the framework does not.

This file owns the **method**. Concept questions live in the modules; this is how you answer them. `12b` owns cross-cutting questions, `12c` owns behavioral and project stories.

---

## Why this file exists

Explaining is a separate skill from understanding, and it is the one being tested.

You can know why a LEFT JOIN hides failed ingestion, be able to compute a KV cache budget, and still lose the interview by rambling for four minutes, never stating a tradeoff, and answering a question you were not asked. That gap is not knowledge. It is structure, and structure is practisable.

**Start this file at week 16, not week 24.** The 60-second answers in each module are the reps; this is the form.

---

## 1. Skills matrix

What the bar actually is, by role. Use this to decide where to spend remaining time.

| Area | Junior AI Engineer | Mid AI Engineer | Generative AI Engineer |
|---|---|---|---|
| Python fluency under observation | Required | Required | Required |
| Git, testing, CI | Required | Required | Required |
| SQL: joins, aggregation, windows | Expected | Required | Expected |
| Data leakage and honest evaluation | Expected | Required | Required |
| Classical ML metrics and thresholds | Expected | Required | Expected |
| Classical ML algorithms in depth | Nice | Expected | Nice |
| Deep learning fundamentals, backprop | Expected | Required | Expected |
| Training and fine-tuning | Nice | Expected | Expected |
| Transformer internals, attention, KV cache | Expected | Required | Required |
| RAG architecture | Expected | Required | Required |
| Retrieval evaluation with numbers | Expected | Required | Required |
| Tool calling and agents | Nice | Expected | Required |
| MCP specifically | Nice | Nice | Expected |
| Local inference, quantization, memory math | Nice | Expected | Required |
| Docker, FastAPI, deployment | Expected | Required | Required |
| Observability, SLOs, cost attribution | Nice | Required | Expected |
| System design | Nice | Required | Required |
| Prompt injection and AI security | Nice | Expected | Required |

`[VERIFY: this is a general shape, not a survey. Read 10 current postings for your target roles and re-score it against them.]`

**How to read it.** The differences between columns are what the title means. A Generative AI Engineer is expected to be strong on agents, local inference and security, and is forgiven weakness on classical ML algorithms. A Mid AI Engineer is expected to be solid everywhere, which is a broader and shallower bar.

**Where candidates most often fall short, in order:**

1. **Engineering hygiene.** Git, testing, CI. Penalized hardest because it is assumed rather than asked about, and its absence shows in a code exercise.
2. **Evaluation.** "How do you know it works" with no answer.
3. **Production reasoning.** What happens when it breaks, how you roll back, what it costs.
4. **Explanation under time pressure.** Knowing it and not being able to say it.

---

## 2. The answer framework

**The shape of a good technical answer:**

```
1. Direct answer, one sentence.         (5 seconds)
2. The mechanism or reason.             (20 seconds)
3. A concrete example or number.        (20 seconds)
4. The tradeoff or limitation.          (15 seconds)
5. Stop. Let them ask.
```

That is the 60-second form. It is not a script to recite; it is a checklist to notice you have skipped.

**Why each part earns its place:**

**Direct answer first** because interviewers are often taking notes and the first sentence is what gets written. Burying the answer at the end of a narrative means the note says "rambled".

**The mechanism**, because anyone can memorize a conclusion. "Sets are faster" is memorized; "a set hashes to a bucket and checks only that bucket, a list has no structure to exploit" is understood.

**A concrete number or example**, because it is the single strongest credibility signal available. "Quantization saves memory" versus "a 27B at Q3_K_M is 12.29 GB, which is why it did not fit on my 16 GB machine with a 12 GB GPU limit". The second cannot be faked.

**The tradeoff**, because every real decision costs something, and an answer with only benefits sounds like it came from a blog post rather than from having shipped it.

**Then stop.** Silence after a complete answer is fine. Filling it is how candidates talk themselves into wrong statements.

### The 5-minute expansion

When they say "tell me more", add in this order:

1. **The failure mode.** Where this breaks in production.
2. **The alternative you rejected**, and the condition under which you would have picked it instead.
3. **What you would measure** to know whether you were right.
4. **What you would do differently** with more time or information.

**Do not expand by adding more mechanism.** Depth in an interview means "I have operated this", not "I know more terminology".

### Worked example of both lengths

*Question: "Why is your RAG system returning wrong answers?"*

**60 seconds:**

> "First I'd check whether the correct chunks were retrieved at all, because that splits the problem in two. If they were retrieved and are in the assembled prompt, it's a generation problem, so prompt structure or ordering. If they weren't retrieved, it's a ranking problem if they ranked below k, or a findability problem if they didn't rank at all, which usually means chunking. To do this I need the retrieved chunk ids with scores and the assembled prompt logged. Without that instrumentation I'd be guessing."

**5 minutes adds:**

> "The most common case I've seen is the chunk existing but being unfindable, because fixed-size chunking put the heading in the previous chunk, so the chunk about parental leave doesn't contain the phrase 'parental leave'. I found one at rank 147 that way. The fix ladder is structure-aware chunking first because it fixes the cause, then putting the heading path into the embedded text, then parent-child retrieval.
>
> The alternative I'd reject early is jumping to prompt tuning, which is where people start, because it treats a retrieval problem with a generation fix and feels productive while changing nothing.
>
> To know I was right I'd add the failing question to the eval set, record recall@5 before and after, and check the aggregate didn't regress, because a change that fixes one question and breaks five isn't an improvement.
>
> What I'd do differently: build the instrumentation before I need it. Doing it during an incident costs a week."

Notice the 5-minute version adds an anecdote, a rejected alternative, a measurement and a regret. It adds no new terminology.

---

## 3. How to handle not knowing

**This is tested more than people realize**, and it is one of the few places where a candidate can gain ground by being wrong.

**The structure that works:**

1. Say you do not know, plainly. No hedging.
2. Say what you do know that is adjacent.
3. Say how you would find out.
4. Reason out loud toward an answer if you can.

> "I haven't used TensorRT-LLM, so I can't speak to its specifics. I know it's NVIDIA's compiled-kernel serving stack and that it trades operational complexity for throughput, which puts it in the same decision space as vLLM. I'd want to see whether the throughput gain justified the build complexity for our workload, and I'd measure both on our actual prompt lengths rather than trusting published numbers. Is it something your team uses?"

**What that does.** It is honest, demonstrates reasoning rather than recall, shows you know how to evaluate rather than adopt, and ends with genuine curiosity.

**What loses ground:**

- Bluffing. Interviewers ask follow-ups, and being caught fabricating ends the loop.
- "I'd have to look it up" and stopping. True and it demonstrates nothing.
- Over-apologizing. One sentence, then move on.
- Pivoting to something unrelated you do know. Transparent, and it reads as evasive.

**Being wrong is recoverable, and how you recover is the signal.** If you state something and realize mid-answer it is wrong, say so: "Actually, I want to correct that." That is a strength. Defending a position you have realized is wrong is not.

---

## 4. Question types and what each tests

| Type | Sounds like | Actually testing |
|---|---|---|
| **Definitional** | "What is X?" | Whether you understand the mechanism or memorized a phrase |
| **Comparative** | "X or Y?" | Whether you can name conditions rather than pick a favorite |
| **Diagnostic** | "This is broken, what now?" | Method. Do you have a procedure or do you guess? |
| **Design** | "How would you build X?" | Requirements, arithmetic, tradeoffs |
| **Experience** | "Tell me about a time..." | `12c`. STAR, with a real specific |
| **Depth probe** | "Why?" three times | Where your understanding stops |
| **Disagreement** | "I think you're wrong" | Whether you fold or reason |

**The comparative trap.** "Would you use X or Y?" answered with "X" is a weak answer regardless of which you pick. The strong form names the condition: *"Y when there are many concurrent users on NVIDIA hardware, because PagedAttention eliminates the KV cache fragmentation that dominates the waste there. X for single-stream latency on diverse hardware. For one user on a MacBook, Y isn't an option at all."*

**The depth probe.** They ask "why" repeatedly until you reach the edge. **Reaching the edge is fine and expected.** Saying "I don't know past this point, my understanding stops at X" is a good outcome. Fabricating a layer deeper is not, and it is obvious.

**The disagreement probe.** Sometimes they are testing whether you hold a position under pressure. Sometimes you are actually wrong. The response to both is the same: ask what they are seeing, reason about it, and update if the reasoning holds. *"That's interesting, I was assuming the filter was highly selective. If it matches most of the corpus, you're right that post-filtering with over-fetching would be fine."* Folding without reasoning is as bad as digging in.

---

## 5. The technical screen

The first round. Usually live coding, often with someone watching.

**What they are checking**, roughly in order: can you write working Python without a reference, do you communicate while working, do you handle edge cases without being prompted, do you test, and can you take a hint.

**How to run it:**

1. **Restate the problem.** Confirm you understood before writing anything. This catches misreadings early and costs 15 seconds.
2. **State your approach before coding.** "I'll use a dict keyed by id, which makes lookup constant time." Then they can redirect you before you write 30 lines.
3. **Narrate.** Silence for five minutes is the most common complaint interviewers have.
4. **Handle edge cases unprompted.** Empty input, one element, duplicates, None. Say "let me handle the empty case" and do it. This is a large share of the signal.
5. **Test it.** Run it on an example, out loud. If there is no runtime, trace through it.
6. **Say what you would add with more time.** "In real code I'd add type hints and a test for the malformed-row path."

**The specific thing that loses points.** Writing a correct solution silently, then saying "done". It gives the interviewer nothing to assess beyond the code, and the code is the smaller half.

**Taking a hint well.** If they say "what if the list is very large", they have told you the answer is a complexity problem. Say "that's a good point, the `in` check against a list is linear so this is quadratic; I'd convert to a set". Ignoring a hint is worse than the original mistake.

---

## 6. Mock interview schedules

Mocks are the only thing that reliably improves interview performance, and the only thing everyone skips.

**Record every one.** Watching yourself is unpleasant and it is where the improvement comes from. You will find you say "um" constantly, answer a different question than was asked, and take 90 seconds to reach the point.

### 4-week schedule, interview imminent

| Week | Focus | Sessions |
|---|---|---|
| 1 | Python live coding, plus the 60-second answers for your weakest module | 3 coding, 1 concept |
| 2 | LLM, RAG, evaluation concepts | 3 concept, 1 coding |
| 3 | System design, all four walkthroughs from `11` | 4 design |
| 4 | Mixed, plus behavioral from `12c`, plus the 48-hour checklist | 2 mixed, 2 behavioral |

### 8-week schedule, standard

Weeks 1-2 Python and engineering hygiene. Weeks 3-4 ML and deep learning concepts. Weeks 5-6 LLM, RAG, agents. Week 7 system design. Week 8 mixed and behavioral. Two to three sessions per week, recorded.

### 12-week schedule, building depth alongside

One session per week, rotating through topics, plus one project deep-dive practice per fortnight. Slower, and it interleaves with continued study, which is better for retention.

**Running a mock alone.** You can do most of this without a partner:

- Pick a question, start a timer, answer aloud, record. Then watch it against the section 2 checklist: did you answer directly, give a mechanism, give a number, state a tradeoff, stop.
- For system design, talk through a walkthrough to a whiteboard with a 45-minute timer. Score yourself on whether you reached evaluation.
- For coding, use a timer and narrate to an empty room. It feels absurd and it builds the habit.

**Score every session** in `tracker/progress-log.md` section 6, and fill the "what went wrong" column even on a good session. The patterns across sessions are the value: always running long, always forgetting to state assumptions, always reaching for a framework name instead of the concept.

---

## 7. The 48-hour checklist

Do not learn anything new. Consolidate and rest.

### Two days before

- [ ] Re-read the mastery checklists for `07`, `06`, `11` only
- [ ] Read your own `eval/results/` files and memorize your three best numbers
- [ ] Re-read `docs/failure-analysis.md` from projects 2 and 3
- [ ] Say your 60-second project narratives aloud, timed
- [ ] Review the company: what they build, what their AI problems probably are
- [ ] Write your three questions for them

### The day before

- [ ] One 45-minute system design, aloud, timed
- [ ] Skim the interview angle sections of `06`, `07`, `08`, do not read them all
- [ ] Check your setup: camera, microphone, editor, screen share
- [ ] Have your repository open in a tab
- [ ] Stop by early evening. Cramming the night before measurably hurts.

### The morning of

- [ ] Re-read only your own numbers: recall improvements, cost figures, benchmark results
- [ ] One practice answer aloud to warm up your voice
- [ ] Nothing new

### The numbers to have ready

The single highest-leverage preparation. Fill these from your own repository:

| Have ready | Yours |
|---|---|
| Recall@5 before and after your biggest retrieval change | |
| The latency cost of that change | |
| Your eval set size and composition | |
| Tokens per second measured on your own hardware | |
| Model size and quantization you ran, and why | |
| Cost per request or per month for something you built | |
| Injection attempts made and how many succeeded | |
| Test count and coverage on project 1 | |

**Six specific numbers beat any amount of architectural vocabulary.** They cannot be faked and almost no candidate has them.

---

## 8. Questions to ask them

Ask three. They are assessed, and they are genuinely how you evaluate the job.

**Good, because the answers tell you something:**

- "How do you currently evaluate whether an AI feature is working?" A team with no answer is a team you would be building that for, which may be good or bad, and you want to know.
- "What broke most recently, and what did you change?"
- "How do prompt changes get reviewed and deployed?"
- "What's the split between building new features and operating what exists?"
- "What would you want someone in this role to have shipped in six months?"

**Avoid:** anything answerable from the careers page, compensation in an early round, and "do you have work-life balance", which never gets an honest answer.

**The best question is a specific follow-up to something they said earlier.** It demonstrates you were listening, which is worth more than any prepared question.

---

## 9. Question index

This file and `12b` do not restate module questions. Each module owns its own.

| Topic | Module | Questions |
|---|---|---|
| Python object model, collections, exceptions | `01a` | 10 |
| OOP, decorators, typing, applied patterns | `01b` | 10 |
| DSA patterns | `01c` | per-pattern |
| Git, CI, review, debugging, HTTP, concurrency | `02` | 10 |
| SQL, joins, statistics, experimentation | `03` | 10 |
| Leakage, metrics, thresholds, calibration | `04` | 10 |
| Backprop, gradients, training, fine-tuning | `05` | 10 |
| Attention, KV cache, sampling, quantization, injection | `06` | 10 |
| RAG, chunking, hybrid, evaluation, permissions | `07` | 10 |
| Agents, tools, MCP, trajectories, security | `08` | 10 |
| Local inference, memory math, serving | `09` | 10 |
| Deployment, monitoring, rollback, cost | `10` | 10 |
| System design, four walkthroughs | `11` | 10 |
| **Cross-cutting, spanning modules** | **`12b`** | **45** |
| **Behavioral and project stories** | **`12c`** | **20** |

Roughly 165 questions with answer outlines. Do not attempt to review them all before an interview; use the mastery checklists to find gaps and read only those sections.

---

## Connections

- Every module's `## Interview angle` section is the content this file structures.
- `12b-interview-question-bank.md` covers what no single module owns.
- `12c-interview-behavioral-and-projects.md` covers experience questions.
- `11-ai-system-design.md` section 1 has the design-specific framework, which is a specialization of section 2 here.
- `tracker/progress-log.md` section 6 is where mock scores go.
- `13-project-portfolio.md` is what the "have these numbers ready" table draws from.

---

## Volatile claims

| Claim | Why it decays | Re-check against |
|---|---|---|
| The skills matrix | Titles and bars shift, and vary by company | 10 current postings |
| "Candidates most often fall short on X" | A pattern, not a survey | Your own post-interview notes |
| Interview format assumptions | Formats change | The recruiter, who will tell you if you ask |

The answer framework, how to handle not knowing, and the mock discipline are stable.

**Next review due:** after your first five interviews, using your own notes.
