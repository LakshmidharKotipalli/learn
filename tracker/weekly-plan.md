# Weekly Plan

**Last reviewed:** 2026-09-18 · **Volatility:** low

The working template for one week. **This file defines no schedule.** `00-north-star-roadmap.md` section 5 owns the 24-week plan; this turns one of its rows into a week you can actually execute.

Review intervals belong to `tracker/progress-log.md`.

---

## 1. How the three files divide

A deliberate split, because the original version of this curriculum had three overlapping plans that contradicted each other.

| File | Owns |
|---|---|
| `00-north-star-roadmap.md` §5 | **The schedule.** Which week covers what, and what artifact it produces. |
| `tracker/weekly-plan.md` (this file) | **The template.** How to run one week, and the time-budget scope rules. |
| `tracker/progress-log.md` | **Review scheduling and mastery.** What is due, and what you actually know. |

If any two disagree, the roadmap wins and the other is wrong.

---

## 2. Time-budget rules

The roadmap's 24-week plan assumes 10 hours per week. At other budgets, **change the scope, not the calendar.**

| Budget | Rule |
|---|---|
| **5 h/week** | Drop `[NICE]` and `[SHOULD]` items. Do the artifact, skip the practice packs, keep the review weeks. Expect 36 calendar weeks for 24 weeks of plan. |
| **10 h/week** | The plan as written. |
| **15 h/week** | Add `01c` as a scheduled block rather than a parallel drip, and start the capstone at week 19 alongside block 5. |

**The rule that matters more than the budget:** if you are consistently below your stated hours for three weeks, re-cut the plan using the roadmap's compression rules rather than carrying a schedule you are failing. A plan you are behind on generates avoidance; a shorter plan you are meeting generates momentum.

---

## 3. The weekly shape

At 10 hours, roughly:

| Activity | Hours | Purpose |
|---|---|---|
| **Learning** | 4 | New material, worked rather than read |
| **Building** | 3 | The week's artifact |
| **Review** | 1.5 | Whatever `progress-log.md` says is due |
| **Articulation** | 1 | 60-second answers, aloud, recorded |
| **Retrospective** | 0.5 | The block in section 5 |

**Four rules that make the shape work:**

**Build before you finish reading.** Start the artifact partway through the learning, not after. You will discover what you did not understand, which is the point.

**Review is not optional, and it is not the same as learning.** The 1.5 hours goes to concepts already at Practiced or above. Spending it on new material is how the schedule quietly becomes exposure rather than retention.

**Articulation starts from module 06, not week 24.** One hour a week, recorded. Explanation is a separate skill and it needs its own reps.

**Every week produces a visible artifact.** Code, a test, a written explanation, a diagram, a project update, a recorded answer. A week with no artifact did not happen, however much you read.

---

## 4. The weekly template

Copy this per week into `tracker/weeks/week-NN.md`.

```markdown
# Week NN: <focus from the roadmap>

**Dates:** <start> to <end>
**Budget:** <5 | 10 | 15> hours
**Roadmap row:** <block N, week NN>
**Artifact this week produces:** <the specific thing>

## Plan

- [ ] Learning: <module and sections>
- [ ] Building: <what, specifically>
- [ ] Review: <concepts due, from progress-log.md>
- [ ] Articulation: <which 60-second answers>

## Daily log

| Day | Hours | What | Artifact |
|---|---|---|---|
| Mon | | | |
| Tue | | | |
| Wed | | | |
| Thu | | | |
| Fri | | | |
| Sat | | | |
| Sun | | | |

## Retrospective

**Artifact produced:** <link, or "none" and why>
**Hours actually spent:** <honest number>
**Status changes:** <concept: old -> new, with evidence>
**Reviews due / completed:** <n / n>
**Failed reviews:** <which, and your read on why>
**What I did not understand:** <specific>
**Blocked on:** <specific, or "nothing">
**Next week's one priority:** <one thing>
```

**The two fields that matter most** are *hours actually spent* and *reviews completed versus due*. Everything else is easy to write optimistically; those two are countable. After four weeks they tell you whether the plan you chose matches the life you have.

**"What I did not understand" is the second most useful field.** Written specifically, it becomes next week's first hour. Written as "the chapter on attention", it becomes nothing.

---

## 5. Review weeks

Every fourth week, per the roadmap. **A review week is not a buffer for falling behind**, and using it that way converts three weeks of work into three weeks of exposure.

```markdown
# Week NN: Review

## Plan

- [ ] Score the practice packs for the last three weeks' modules
- [ ] Every concept below "Can Explain" in progress-log.md gets one focused hour
- [ ] Record the 60-second answers for this block's [MUST] concepts
- [ ] Re-read the mastery checklists for the last three modules; check honestly
- [ ] Clear the review queue in progress-log.md
- [ ] Update the concept mastery table with evidence

## Outcome

**Practice pack scores:** <module: %>
**Concepts advanced:** <with evidence>
**Concepts regressed:** <and why, this is normal and worth recording>
**Still weak:** <specific, carried into next block>
```

**Recording regressions is the point.** A tracker where status only ever increases is one nobody is being honest in, and the honest one is the one that is useful in month five.

---

## 6. The parallel track

`01c` runs as a drip, not a block, from week 5 onward.

- Two or three problems per week, rotating patterns rather than grinding one
- One narrated and recorded per week
- Re-solve one problem from a month ago, from memory

**Why a drip.** Pattern recognition is built by spaced exposure. Cramming DSA produces the ability to recall a solution you saw, which is not what is being tested.

Log it in the weekly template's daily table as ordinary hours. At the 15-hour budget it becomes a scheduled block instead.

---

## 7. Recovery

From the roadmap section 9, in the form you apply during a week.

| Situation | Do |
|---|---|
| Behind by two days | Cut scope inside the week. Half an artifact beats none. |
| Missed a whole week | The next review week absorbs it, once. Drop that week's practice pack. |
| Missed two weeks in a block | Shift the calendar by a week rather than compressing. |
| Three weeks behind overall | Re-cut with the compression rules. Do not accelerate. |
| A module is not landing after two attempts | Go back one phase. It is a prerequisite gap, not a comprehension problem. |
| Tempted to skip a review week | Do not. This is rule 1 for a reason. |

**Log every recovery in the retrospective.** Three recoveries clustered in one phase tells you something about that phase, or about the hours you claimed you had.

---

## 8. Worked example

What week 18 looks like filled in. From the roadmap: block 5, RAG evaluation.

```markdown
# Week 18: Hybrid search, reranking, evaluation

**Dates:** 2027-01-11 to 2027-01-17
**Budget:** 10 hours
**Roadmap row:** block 5, week 18
**Artifact this week produces:** eval set of 30+ pairs, plus a measured naive
baseline committed to eval/results/001-baseline.json

## Plan

- [ ] Learning: 07 sections 7, 9 (hybrid, reranking, evaluation), 4h
- [ ] Building: the eval set and baseline measurement, 3h
- [ ] Review: due from progress-log.md: chunking tradeoffs, cosine vs dot
      product, KV cache formula, 1.5h
- [ ] Articulation: "how do you evaluate a RAG system", 60s and 5min, 1h
- [ ] Retrospective, 0.5h
- [ ] Parallel: 3 DSA problems (sliding window), 1 narrated

## Retrospective

**Artifact produced:** eval/questions.jsonl (34 pairs, 9 unanswerable),
eval/results/001-baseline.json: recall@5 0.62, MRR 0.48
**Hours actually spent:** 8.5 (planned 10)
**Status changes:** "Retrieval metrics" Learning -> Practiced (built and ran
the harness); "Building an evaluation set" Not Started -> Can Build
**Reviews due / completed:** 5 / 5
**Failed reviews:** KV cache formula. I could state it and not derive the
memory number. Reset to 1 day.
**What I did not understand:** why nDCG's ideal denominator uses
min(len(relevant), k) rather than k. Worked it out Thursday; noted in the
module.
**Blocked on:** nothing
**Next week's one priority:** get project 2's retriever beating the 0.62
baseline, one change at a time
```

**What makes this a good retrospective:** the hours are honest and below plan, the status changes cite evidence, the failed review is specific and was reset rather than quietly passed, and the thing not understood is named precisely enough to act on.

---

## 9. Monthly check

Every four weeks, five minutes:

- [ ] Average hours per week over the last four. Does it match your stated budget?
- [ ] Reviews completed versus due. Below 80% means the schedule is fiction.
- [ ] Artifacts produced. One per week, or which weeks did not happen?
- [ ] Concepts at Can Explain or above. Growing?
- [ ] Are you still using the tracker, honestly?

**If hours are consistently below plan, re-cut now.** Not next month. The compression rules exist for this.

**If reviews are being skipped, either do them or delete section 4 of the progress log.** Carrying a review schedule you ignore is worse than not having one, because it makes the whole tracker untrustworthy.

---

## Connections

- `00-north-star-roadmap.md` §5 supplies the week's focus and artifact; §7 supplies the compression rules; §9 supplies the recovery rules this file applies.
- `tracker/progress-log.md` §4 supplies what is due for review; §8's retrospective block is the one templated here.
- `01c-python-interview-dsa.md` is the parallel track in section 6.
- Each module's practice pack is what a review week scores.

---

## Volatile claims

| Claim | Why it decays | Re-check against |
|---|---|---|
| The 4/3/1.5/1/0.5 hour split | A starting point, not a measurement | Your own four-week average |
| "36 weeks at 5 h/week" | Depends on your starting point | Your own block 1 |

The template and the ownership split between the three files are stable.

**Next review due:** after block 2, week 8, when you will know whether the shape fits your week.
