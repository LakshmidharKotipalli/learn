# 12c Behavioral and Project Interviews

**Last reviewed:** 2026-09-18 · **Volatility:** low

The round candidates prepare least and lose most often on. Technical rounds test what you know; this one tests whether people want to work with you, and whether the things on your CV actually happened.

---

## Why this is harder than it looks

**Three reasons this round goes badly.**

**People improvise.** They prepared for technical questions and assumed they could talk about their own work extemporaneously. Then they ramble for four minutes, describe a team's work in "we", and never say what they personally did.

**Stories collapse under follow-ups.** An invented or heavily embellished story is fine for one question and falls apart on "what would you do differently" or "what did the other person say". Interviewers ask exactly those.

**Candidates only report wins.** A project narrative with no failure reads as either lucky or dishonest, and experienced interviewers discount it heavily.

**The fix is preparation, not personality.** Six to eight real stories, written out, practised aloud, covering the common question shapes.

---

## 1. STAR, properly

| Part | Content | Time |
|---|---|---|
| **Situation** | Context and stakes, two sentences | 15s |
| **Task** | What *you specifically* were responsible for | 10s |
| **Action** | What you did, the decision, the alternative rejected | 60-90s |
| **Result** | Outcome, with a number if you have one | 20s |

**The errors, in order of how often they happen:**

**Too much Situation.** Ninety seconds of background before anything happens. Two sentences is enough; they will ask if they need more.

**"We" throughout Action.** The interviewer cannot tell what you did. Use "I" for your actions and "we" only for genuine team decisions. This is not arrogance; it is the information they asked for.

**No Result.** The story ends with what you did and never says what happened. If you did not measure it, say "we did not measure it, which I would do differently" and that is a credible answer.

**Inventing a number.** Do not. "We did not measure it" is credible; a fabricated 40% improvement collapses on "how did you measure that?"

**Add two things STAR omits**, both of which are asked constantly:

**"If they push":** the follow-up you expect, with your answer ready.
**"What I would do differently":** required. Having no answer reads as having learned nothing.

---

## 2. The story bank

Six to eight stories cover almost every question. Each one answers several shapes.

| Story | Answers |
|---|---|
| A technical decision with a real tradeoff | Design decisions, disagreement with a choice, "tell me about a hard decision" |
| Something that failed in production | "Tell me about a failure", "a time something broke", ownership |
| A bug that took too long | Debugging, persistence, "a time you were stuck" |
| Disagreeing with someone technical | Conflict, influence without authority, receiving feedback |
| Scope you had to cut | Deadlines, prioritization, saying no |
| Learning something fast under pressure | Unfamiliar technology, adaptability |
| A project you are proud of | "Favorite project", motivation, depth probe |
| Work done with heavy AI assistance | Increasingly common; see section 5 |

**Where yours come from.** Projects 1, 2 and 3 are real work with real failures, and they are legitimate material. So is your existing professional work. So is this curriculum itself, honestly framed as self-directed study.

**What is not legitimate:** describing a tutorial as a project, describing a team's work as yours, or inventing a failure that sounds good.

### Template

```
### Story: <short name>

**Answers:** <which question shapes>

**Situation:** <two sentences, context and stakes>

**Task:** <what I specifically owned>

**Action:** <what I did, the decision made, the alternative rejected and why>

**Result:** <outcome, with a number, or honestly "we did not measure this">

**If they push:** <the expected follow-up and my answer>

**What I would do differently:** <required>
```

### A worked example, from project 2

```
### Story: Evaluation before the retriever

**Answers:** technical decision with a tradeoff; a project I'm proud of;
disagreeing with a default approach

**Situation:** I was building a retrieval system over a messy document set and
noticed I had no way to tell whether any change I made was an improvement.

**Task:** I decided to build the evaluation harness before writing any
retrieval code, which meant three days of work before the system did anything
at all.

**Action:** I wrote 40 questions from real usage patterns before seeing the
chunks, so I wouldn't unconsciously write questions my chunker happened to
handle. I included 8 unanswerable ones specifically to measure refusal, which
is the category people skip. Then I hand-labelled the relevant chunks, which
took most of a day and taught me more about the corpus than anything else did.
I built the naive version first, fixed chunking and dense-only retrieval, and
measured it as a baseline before improving anything.

The alternative I rejected was generating questions with a model, which is
much faster. I rejected it because a question generated from a chunk shares
that chunk's vocabulary, so retrieval scores better than it really is. I kept
a small model-generated slice separately and the gap between the two slices
was itself informative.

**Result:** Every subsequent change was a measured delta rather than a feeling.
Structure-aware chunking moved recall@5 from [X] to [Y]; reranking moved it
from [Y] to [Z] and added [N]ms. I also found one change that made things
worse, which I'd have shipped without the harness.

**If they push, "wasn't that over-engineering for a personal project?":**
It was three days out of about six weeks. Without it I'd have spent longer
than that tuning things that didn't help, which is what I'd been doing before.

**What I would do differently:** Label the relevant chunks earlier. I wrote the
questions first and labelled later, and labelling forced me to read my own
chunks, which surfaced a chunking problem I'd have caught a week sooner.
```

`[VERIFY: replace [X], [Y], [Z] and [N] with your own numbers before using this. A story with bracketed placeholders spoken aloud is worse than no story.]`

---

## 3. Twenty behavioral questions

For each: what they are actually assessing.

| # | Question | Assessing |
|---|---|---|
| 1 | Tell me about a technical decision you made and the tradeoff | Whether you think in tradeoffs or preferences |
| 2 | Tell me about a time something broke in production | Ownership, and whether you fix causes or symptoms |
| 3 | Walk me through a hard debugging session | Method versus flailing |
| 4 | Tell me about a time you disagreed with someone technical | Whether you can hold a position and update |
| 5 | Tell me about a deadline you missed | Honesty, and whether you communicated early |
| 6 | Tell me about scope you had to cut | Prioritization under constraint |
| 7 | How do you handle an unfamiliar technology? | Learning method, not enthusiasm |
| 8 | Tell me about your favorite project | Depth. Expect three "why"s. |
| 9 | Tell me about receiving critical feedback | Defensiveness |
| 10 | Tell me about a time you were wrong | Whether you can say it plainly |
| 11 | How do you decide what to work on first? | Prioritization framework |
| 12 | Tell me about working with someone difficult | Whether you blame or adapt. Never disparage. |
| 13 | How do you know when something is good enough to ship? | Judgment, and whether you have a bar |
| 14 | Tell me about something you built that nobody used | Honesty; product sense |
| 15 | How do you use AI tools in your work? | See section 5 |
| 16 | Tell me about a time you had to say no | Boundaries, and how you framed it |
| 17 | What's the most interesting thing you've learned recently? | Curiosity, and whether it is genuine |
| 18 | How do you approach code review, giving and receiving? | Collaboration, and whether you have a priority order |
| 19 | Tell me about a time you improved a process | Initiative beyond assigned work |
| 20 | Why are you making this transition? | Coherence. See section 6. |

**Question 14 is the one worth preparing deliberately.** Most candidates have no answer, and everyone has built something nobody used. A real answer, with what you learned about validating demand before building, is disproportionately impressive.

---

## 4. Project deep dives

Different from behavioral. They will pick something from your CV and probe it for 20 to 40 minutes.

**The structure they follow**, roughly:

1. "Walk me through it": you get two minutes, uninterrupted
2. "Why did you build it that way?": the decision probe
3. "What would you do differently?": the reflection probe
4. "What broke?": the honesty probe
5. Increasingly specific technical questions until you reach your limit

**Prepare each project along those five axes.** Not a description; a set of decisions with reasons.

**The two-minute opening, structured:**

```
What it does           (15s)
Who it is for and why   (15s)
The architecture        (30s)
The interesting decision (30s)
The result, with a number (20s)
The thing that broke     (20s)
```

Ending on the thing that broke is deliberate. It invites the question you most want, and it signals you are not selling.

**Depth probes go until you run out.** Expect it, and running out is fine. "My understanding stops there" is a good answer; fabricating a layer deeper is obvious and ends the round.

**The questions you must be able to answer about anything on your CV:**

- Why this technology and not the obvious alternative?
- What is the slowest part, and how do you know?
- What happens when [dependency] is down?
- How would you know if it stopped working?
- What would you change if traffic were 100x?
- What is the worst bug you shipped in it?

**If a project is old and you do not remember, remove it from your CV.** A project you cannot discuss is worse than one fewer project, because it makes everything else on the page less credible.

---

## 5. Talking about AI-assisted work

Increasingly asked, and most candidates handle it badly in one of two directions.

**Overclaiming:** presenting AI-generated work as entirely your own. Collapses instantly under a depth probe, because you cannot explain decisions you did not make.

**Apologizing:** "I mean, Claude wrote most of it." Undersells work you actually directed, and signals you think tool use is cheating.

**The honest framing that lands:**

> "I used an AI assistant heavily for the implementation. What I owned was the design decisions, the evaluation, and the debugging. For instance, I decided to build the eval harness first and to exclude unanswerable cases from recall metrics, because recall against an empty relevant set is meaningless and including them would have dragged the number down and masked regressions. The assistant wrote a lot of the code; it didn't decide that, and it wouldn't have caught the two tests where my own expectations were wrong rather than the code."

**Why that works.** It is true, it distinguishes direction from typing, it demonstrates the judgment through a specific example rather than claiming it, and it treats the tool as a tool.

**The follow-up to prepare for: "how do you verify AI-generated code?"**

> "The same way I'd verify anyone's: I read it, I run it, and I test the edge cases. Specifically for generated code I check imports resolve and versions are real, since fabricated APIs are the characteristic failure. I test the error paths, which generated code under-handles. And I'm suspicious of anything that works first time on a problem I expected to be hard, which is the same instinct as a model scoring 0.95 AUC offline."

**The related question: "has AI assistance ever caused a problem?"** Have a real example. Everyone who uses these tools has one, and not having an answer suggests you have not used them seriously or are not paying attention.

---

## 6. The career transition narrative

You will be asked why you are moving toward AI engineering. A weak answer here colours the whole interview, because it makes your motivation seem shallow.

**The shape that works:**

```
What I did before, briefly and without apology
What specifically pulled me toward this
What I have done about it, concretely
What I am looking for now
```

**Two sentences on each. The third part carries the weight**, because anyone can say they are interested and few can point at what they built.

**What weakens it:**

**Apologizing for your background.** "I'm only coming from data analysis." Your background is a fact, some of it transfers, and the parts that do not are what you have been closing.

**Interest without evidence.** "I've always been fascinated by AI" with nothing built.

**Framing it as escape.** "I was bored" tells them what you are running from, not what you are running toward.

**Over-explaining.** A long defensive account signals you think it needs defending.

**What strengthens it:**

**Name what transfers.** A data background means you understand evaluation, distributions and why a small sample cannot support a claim, which is exactly where AI engineers most often go wrong.

**Point at artifacts.** "I built a retrieval system with a 40-question evaluation set and measured recall before and after each change" is evidence. It is also the answer to "what have you done about it".

**Name what you are still building.** "I'm strongest on retrieval and local inference, and I'm deliberately building depth in deployment and observability" is specific, honest and shows you can assess yourself.

---

## 7. Practice method

**Write them out.** Six to eight stories, in the template, in `tracker/progress-log.md` section 7. Writing surfaces the gaps: you will discover a story has no Result, or that you cannot say what you would do differently.

**Then say them aloud, timed, recorded.** A written story that takes four minutes spoken is too long. Target 90 seconds to two minutes.

**Then watch the recording** against this checklist:

- [ ] Situation under 20 seconds
- [ ] "I" in the Action, "we" only for genuine team decisions
- [ ] A specific decision named, with the alternative rejected
- [ ] A Result, with a number or an honest "we did not measure"
- [ ] A "what I would do differently" that is not a humblebrag
- [ ] Under two minutes
- [ ] No filler at the start: no "so, basically, um"

**Cross-map your stories to questions.** Take the twenty in section 3 and write which story answers each. Gaps are stories you still need. Most people find they have three variants of "a hard technical problem" and nothing for conflict, saying no, or something nobody used.

**Practise the transition narrative most.** It is asked in every loop, often first, and it sets the frame.

---

## Connections

- `tracker/progress-log.md` section 7 is where the story bank lives.
- `12a-interview-framework.md` owns the technical answer method and the mock schedules.
- `13-project-portfolio.md` covers what makes a project worth having a story about.
- Projects 1, 2 and 3, and their failure-analysis documents, are your primary source material.
- `12b` part 3's diagnostic scenarios overlap with the debugging story; use a real one if you have it.

---

## Volatile claims

| Claim | Why it decays | Re-check against |
|---|---|---|
| "AI-assistance questions are increasingly common" | Recent trend; norms still forming | Your own interview notes |
| Question frequency generally | Varies by company | Your own notes after five loops |

STAR, the deep-dive structure and the transition narrative are stable.

**Next review due:** after five interviews, using your own notes.
