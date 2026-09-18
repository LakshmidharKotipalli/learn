# 13 Project Portfolio Strategy

**Last reviewed:** 2026-09-18 · **Volatility:** medium

Strategy, not a project specification. How to decide what to build, how to tell whether it is credible, and how to use it.

---

## Why this file exists

You are about to spend months building four projects. The difference between a portfolio that gets you interviews and one that gets ignored is not effort; it is a small number of properties that are cheap to add and almost never present.

**The uncomfortable premise:** a reviewer spends 30 to 90 seconds on your GitHub before deciding whether to read anything. In that time they see your repository list, one README, and possibly your commit history. Everything else is downstream of that impression.

---

## 1. What a reviewer is actually checking

Not "is this impressive". They are checking three things, in this order:

**Did this person build it, or follow it?** The single most important signal, and the one candidates most underestimate. A tutorial follow-along is worse than no project, because it demonstrates you cannot tell the difference between building and copying.

**Can they tell whether it works?** Any evidence of measurement puts you in a small minority.

**Would I want to review their pull requests?** Commit messages, repository structure, README quality, test presence. This takes fifteen seconds to assess and is assessed every time.

### The tells that mark a project as a tutorial

Reviewers pattern-match on these without articulating them:

| Tell | Why it reads as copied |
|---|---|
| The exact stack from a popular tutorial, with no stated reason | Choices without reasons were not choices |
| A README that explains what RAG is | Written for a reader who does not exist; real READMEs explain *this* system |
| No evaluation of any kind | Nobody who built something measures nothing |
| Commit history: three commits, or one hundred in one day | Either imported wholesale or committed at the end |
| No failure documented anywhere | Nothing ever works first time |
| The demo dataset is the tutorial's dataset | The most obvious tell of all |
| Perfect, uniform code style throughout, no evolution | Real code shows where it was refactored |
| A `.env` with a real key in the history | Also a security problem |

### The tells that mark it as real

| Tell | Why it is hard to fake |
|---|---|
| A stated constraint that forced a decision | You cannot invent a constraint you did not feel |
| A measured baseline and a results table | Requires having built the measurement |
| A documented failure with a diagnosis | Requires having had it |
| A change that made things worse, left in the table | Nobody fabricates a regression |
| Commit history showing the order of construction | Hard to forge convincingly |
| A "known limitations" section in the README | Requires knowing them |
| Data that is obviously yours | Your own notes, your own logs |

**The cheapest high-value item on that list is "a change that made things worse, left in the table".** It costs nothing, it cannot be faked, and it signals honesty more strongly than any success.

---

## 2. How many, and at what depth

**Three well-built projects beat eight shallow ones**, and the reason is specific: a reviewer reads one, maybe two. Eight projects means the one they pick is probably mediocre.

| Role level | Recommendation |
|---|---|
| Junior | 2-3 projects, one with real depth |
| Mid | 3-4, with one that demonstrates operating rather than building |
| Generative AI Engineer | 3-4, at least two AI-specific with measurement |

**Pin the best one.** Most people's GitHub shows their most recent repository first, which is often a half-finished experiment. Pin deliberately, and put the strongest README on the pinned one.

**Archive or delete the rest.** A profile with twenty repositories, eighteen of which are abandoned tutorials, dilutes the three that matter. This is not dishonest; it is editing.

### The ladder in this repository

The four projects are designed to ladder, and each adds something the previous one could not show:

| Project | Adds |
|---|---|
| **1: Learning Log Analyzer** | Clean engineering. Pure core, tested, typed, defensive parsing. No AI at all, which is the point: it proves you can write software. |
| **2: Grounded Answers** | Retrieval engineering and measurement discipline. The evaluation-first inversion. |
| **3: Agent Trajectory Evaluation** | Adversarial thinking and evaluating something with no obvious ground truth. |
| **Capstone: CareerAtlas** | Integration, real use, and honest treatment of components you cannot fully verify. |

**Project 1 is the one people want to skip.** Do not. A reviewer assessing "would I want to review their pull requests" gets the answer from project 1 faster than from anything else, and an AI portfolio with no evidence of ordinary software competence is a recognizable gap.

---

## 3. The anatomy of a project worth discussing

Four elements. A project missing any one of them is hard to talk about for more than two minutes.

**A real constraint.** Not "I wanted to learn X" but something that forced a decision: everything runs locally, answers must cite or refuse, sub-second retrieval on a laptop, documents carry permissions. Without one, every technical choice is arbitrary and there is nothing to defend.

**A decision with a genuine tradeoff.** Two defensible options, you picked one, you can say why and what it cost. "I used numpy rather than a vector database because 5,000 chunks is 20 MB and an exhaustive scan is milliseconds; I'd revisit above 100,000 chunks or if I needed concurrent writers."

**Something that failed.** Documented: symptom, diagnosis, fix, measured effect. This is what makes a conversation possible, and it is what distinguishes you from a candidate who only has a description.

**A measurement.** Before and after, with the method stated. Any number you produced yourself beats any architecture you can describe.

**The test:** can you talk about it for five minutes without describing what it does? If everything you can say is descriptive, you have a demo. If you can discuss decisions, failures and measurements, you have a project.

---

## 4. Scoping so it finishes

**The most common portfolio failure is not a bad project. It is an unfinished one.**

| Rule | Why |
|---|---|
| Define the MVP as the smallest thing that is useful | Useful, not complete |
| Write the out-of-scope list first | It is a judgment signal and it prevents drift |
| Every week ends in something runnable | Prevents the "90% done for two months" state |
| Cut features, never the demo | Half a feature that runs is evidence |
| Ship at the MVP, then decide | You will know more about what matters |

**The out-of-scope list is worth writing even for yourself.** "No multi-user, no mobile, no content generation, because the scope was chosen so it would finish and get used" is a sentence that reads as judgment rather than limitation.

**Signs you have over-scoped**: no runnable demo after three weeks, more time on infrastructure than on the thing itself, a features list that has grown since you started, or you have stopped using it.

---

## 5. Repository hygiene

Fifteen seconds of assessment, and it is assessed every time.

### The README

The most-read file and the least-invested-in. Structure that works:

```
One sentence: what it is and who it is for
The output, actually pasted or a screenshot
Design decisions, with the alternative rejected
Results, with real numbers
Known limitations
Install, in commands that work
Not built, on purpose
```

**"Known limitations" is the section reviewers use to calibrate everything else.** A README without one reads as either naive or dishonest. A specific one, "grading consistency is 0.78 on a 20-answer sample, which is enough to detect badly wrong and not enough for a confident figure", makes every other claim more credible.

**Paste the actual output.** Not a description of what it produces. The real terminal output, or a screenshot. This is the fastest way to show it works.

### Commits

| Do | Do not |
|---|---|
| Small, focused, imperative messages | "update", "fix", "wip" |
| Explain *why* in the body when it is not obvious | Restate the diff |
| Commit as you go | One hundred commits on one day |
| Branch and merge for features | Everything on main, always |

**The commit history is a narrative of how you built it**, and a reviewer who reads it learns things no README conveys: whether you tested as you went, whether you refactored, whether you fixed bugs or just added features.

### The rest

- Tests present and passing. CI badge green.
- `.gitignore` covering `.env`, `.venv/`, data, models.
- **No secrets in history.** Grep before pushing; rotate anything committed.
- No committed model weights or large data files.
- A license, which takes one click.
- Repository description and topics set, since they appear in search.

---

## 6. The scoring rubric

Score each project 1 to 5 on each dimension. Be harsh; the point is to find what to fix.

| Dimension | 1 | 3 | 5 |
|---|---|---|---|
| **Originality** | A tutorial's dataset and stack | Own problem, conventional approach | Own problem, a choice you can defend |
| **Constraint** | None stated | A vague goal | A specific constraint that forced decisions |
| **Measurement** | None | It "works" | Baseline, results table, method stated |
| **Failure documentation** | None | Mentioned in passing | Symptom, diagnosis, fix, measured effect |
| **Code quality** | Runs | Organized, some tests | Typed, tested, linted, CI green |
| **README** | What the technology is | What the project does | Decisions, results, limitations |
| **Commit history** | Under 5, or all one day | Reasonable | Narrates construction; small focused commits |
| **Usability by a stranger** | Needs you present | Some instructions | Clone, two commands, works |
| **Interview material** | Can describe it | Can defend one decision | Five minutes without describing what it does |
| **Actually used** | Never run since built | Demoed a few times | In real use, with resulting bug fixes |

**Scoring:**

| Total (of 50) | Verdict |
|---|---|
| Under 25 | Not portfolio-ready. Fix measurement and README first, cheapest returns. |
| 25-34 | Presentable. Pick the two lowest dimensions and fix them. |
| 35-44 | Strong. This project can carry an interview. |
| 45+ | Rare. Pin it. |

**The two dimensions with the best return on effort are Measurement and Failure documentation.** Both are cheap if you kept notes while building, both are nearly absent from other candidates' portfolios, and both directly enable the interview conversation.

**The dimension people over-invest in is Code quality** past a 3. Typed, tested and linted is enough; nobody is reading for elegance.

---

## 7. Honest presentation

### Using this repository as evidence

The modules, trackers and practice packs here are **study artifacts, not projects**. Present them honestly:

**Fine:** "I worked through a structured curriculum and kept the notes and evaluation sets in a repository." That is true and shows method.

**Not fine:** presenting generated learning material as something you wrote, or listing "AI Engineer Learning OS" on a CV as a project.

**The genuinely useful framing:** the repository is where your projects, evaluation sets and results live. The projects are the evidence; the curriculum is the scaffolding.

### Talking about AI-assisted work

Per `12c` section 5. Own the design decisions, the evaluation and the debugging, and say so specifically rather than claiming judgment in the abstract. The tell that you directed the work rather than accepted it is being able to name a decision the assistant would not have made.

### What never to do

- Claim a number you did not measure
- Describe a team's work as yours
- List a project you cannot discuss for five minutes
- Leave placeholder text in a CV or README
- Claim production use for something never deployed

**The asymmetry is brutal:** an unverifiable claim gains you a little and a discovered exaggeration ends the process. Under-claim.

---

## 8. Resume bullets from projects

The pattern that works:

```
[Project] | [technologies]
· [What you built, with scale]
· [A decision, with the reason]
· [A measured result, with method]
· [Something hard or honest]
```

**The fourth bullet is where most people stop and where the signal is.** "Measured grading consistency at 0.78 and recorded the limitation rather than shipping unverified feedback" says more than any improvement figure, because it demonstrates judgment rather than output.

**Rules:**

- Every number from a file you can open
- No brackets in a submitted document, ever
- Remove a bullet you cannot substantiate
- "We did not measure this" belongs in conversation, not on a CV; omit the bullet instead

---

## 9. Using the portfolio

**Link it everywhere**: CV, LinkedIn, email signature, the first line of an application.

**Reference it in answers.** "In the RAG project I built, reranking moved recall@5 from X to Y and added N milliseconds" is better than any general statement about reranking. It is specific, measured and yours.

**Bring it to the interview.** Have the repository open. If they ask about a decision, showing them the results table is stronger than describing it.

**The numbers to memorize**, per `12a` section 7: your recall improvement and its latency cost, your eval set size and composition, your measured tokens per second, the model and quantization you ran and why, cost per request, injection attempts and how many succeeded, test count on project 1.

**Six specific numbers beat any amount of architectural vocabulary**, because they cannot be faked and almost nobody has them.

---

## 10. Scoring your own projects now

Do this before your first application.

1. Score all four projects on the section 6 rubric. Be harsh.
2. Identify the two lowest dimensions across all of them.
3. Fix those two. They will almost certainly be Measurement and Failure documentation.
4. Rewrite the README of your highest-scoring project properly.
5. Pin it.
6. Have someone else clone the pinned one and follow the README. Fix every stumble.

**Step 6 is the one people skip and the one that catches the most.** You cannot see your own README's assumptions.

---

## Connections

- `projects/project-1-python-data-tool.md`, `project-2-rag-app.md`, `project-3-agent-evaluation.md` and `capstone/` are what you are scoring.
- `12c-interview-behavioral-and-projects.md` section 4 covers the deep-dive round these projects feed.
- `12a-interview-framework.md` section 7 has the numbers-to-memorize table.
- `02-software-engineering-foundations.md` section 8 covers the repository hygiene assessed here.
- `tracker/progress-log.md` links evidence to concepts.

---

## Volatile claims

| Claim | Why it decays | Re-check against |
|---|---|---|
| "30 to 90 seconds of review" | A pattern, not a measurement | Ask anyone who screens candidates |
| Project count by role level | Varies by company and market | Current postings and your own results |
| The tutorial tells | Reviewers adapt as norms shift | Your own interview feedback |
| AI-assistance framing | Norms still forming | Your own notes after five loops |

The rubric dimensions and the four anatomy elements are stable.

**Next review due:** after five applications, using whatever feedback you get.
