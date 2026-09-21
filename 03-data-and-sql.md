# 03 Data, SQL, and Statistics

**Last reviewed:** 2026-09-18 · **Volatility:** low. SQL and statistics barely move.

Every query in this module was executed against a real SQLite database, and every output shown is the actual result. Every statistical claim was verified by simulation. The schema is defined once in section 2 and reused throughout, so you can run everything yourself.

---

## Why this matters

Two reasons, and the second one surprises people.

**The obvious one:** data lives in databases, and getting it out correctly is a daily task. SQL is asked in most AI engineer loops, usually as a live exercise, and it is where candidates from a self-taught modeling background lose points.

**The one that matters more:** *evaluation is a data problem.* Module 07's evaluation set, the retrieval metrics, the refusal rate, the question of whether your change actually helped, are all aggregation and joining over structured data. People who skipped this module build evaluation sets that measure nothing and produce plausible, wrong numbers. A `LEFT JOIN` bug that silently drops documents with no chunks is not a SQL trivia question; it is how you come to believe your ingestion pipeline is complete when it is not.

The statistics half is not about becoming a statistician. It is about knowing when a number is meaningful, which is what stops you from shipping a change because 40 examples looked better.

---

## Prerequisites

| You need | From |
|---|---|
| Python basics, dicts, files | `01a` all sections |
| CSV and JSON handling | `01a` section 9 |
| The command line for inspecting files | `02` section 10 |

No prior SQL assumed.

---

## Skip-ahead map

| Section | Level | Skip if you can... |
|---|---|---|
| 1. The relational model | [FOUNDATION] | ...explain what a foreign key actually guarantees |
| 2. The schema | [FOUNDATION] | n/a, read it; everything below uses it |
| 3. SELECT through GROUP BY | [FOUNDATION] | ...explain why WHERE cannot reference an aggregate |
| 4. Joins | [CORE] | ...say what an INNER JOIN silently hides |
| 5. Aggregation traps | [CORE] | ...name three ways a GROUP BY quietly lies |
| 6. Window functions | [CORE] | ...rank rows within a group without a self-join |
| 7. Indexes and query plans | [CORE] | ...read EXPLAIN QUERY PLAN and say why an index was ignored |
| 8. pandas versus SQL | [DEPTH] | ...say which wins for which job |
| 9. Statistics you actually need | [CORE] | ...say what a p-value is not |
| 10. Experimentation | [CORE] | ...estimate a sample size and say why it is so large |
| 11. Vector data alongside relational | [DEPTH] | ...say why chunk metadata belongs in a database |

---

## Mental model

**A relational database is a set of tables plus a set of promises about them, and SQL is a language for describing the result you want rather than how to get it.**

The promises are the point. A foreign key promises that every `chunks.doc_id` refers to a real document. A `UNIQUE` constraint promises you will not get two chunks at the same position. A `CHECK` promises a source kind is one of four values. These are enforced by the database on every write, forever, including writes made by code you have not written yet. That is a much stronger guarantee than validation in your application, which is only as good as the last person who remembered it.

The declarative part is the other half. You describe the shape of the answer; the query planner decides how to compute it. This is why an index can make a query a thousand times faster with no change to the query, and why a small rewrite can make the planner give up entirely.

**Where the analogy breaks down.** "Describe what you want" suggests the database will find a good plan. It usually does, and it can be defeated: by a function applied to an indexed column, by statistics that are out of date, by a query so convoluted the planner cannot see through it. Declarative does not mean you can stop thinking about execution, which is why section 7 exists.

---

## Core concepts

### 1. The relational model [FOUNDATION]

**A table is a set of rows with a fixed set of typed columns.** The vocabulary:

| Term | Meaning |
|---|---|
| **Primary key** | The column whose value identifies a row uniquely. Never null, never reused. |
| **Foreign key** | A column referencing another table's primary key. The database enforces that the target exists. |
| **Unique constraint** | No two rows may share these values. |
| **Check constraint** | A row-level rule that must hold. |
| **Index** | A separate structure making lookups on some column fast. Not part of the logical model. |

**Normalization**, briefly, because the principle matters more than the forms: store each fact once. If a document's title appears in a hundred chunk rows, a rename means a hundred updates and any one you miss is a contradiction. Put the title in `documents` and reference it.

**When to denormalize deliberately.** Joining is not free, and for read-heavy analytics duplicating a column to avoid a join at query time can be the right call. The rule is that denormalization is a decision with a stated reason, not a default. If you cannot say which query it speeds up and by how much, you have not denormalized, you have made a mistake.

**What the constraints buy you in practice.** In an ingestion pipeline, `UNIQUE (doc_id, position)` means a re-run cannot silently create duplicate chunks. Without it you discover the duplicates weeks later, in module 07, as near-identical results crowding your top-k.

### 2. The schema [FOUNDATION]

Everything below runs against this. It models a RAG system's operational data, so the queries are ones you would actually write.

```sql
CREATE TABLE sources (
    source_id   INTEGER PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    kind        TEXT NOT NULL CHECK (kind IN ('pdf','html','markdown','docx'))
);

CREATE TABLE documents (
    doc_id      INTEGER PRIMARY KEY,
    source_id   INTEGER NOT NULL REFERENCES sources(source_id),
    title       TEXT NOT NULL,
    ingested_at TEXT NOT NULL,
    page_count  INTEGER                      -- nullable: HTML has no pages
);

CREATE TABLE chunks (
    chunk_id    INTEGER PRIMARY KEY,
    doc_id      INTEGER NOT NULL REFERENCES documents(doc_id),
    position    INTEGER NOT NULL,
    token_count INTEGER NOT NULL,
    UNIQUE (doc_id, position)
);

CREATE TABLE queries (
    query_id    INTEGER PRIMARY KEY,
    user_id     INTEGER NOT NULL,
    text        TEXT NOT NULL,
    asked_at    TEXT NOT NULL,
    refused     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE retrievals (
    retrieval_id INTEGER PRIMARY KEY,
    query_id     INTEGER NOT NULL REFERENCES queries(query_id),
    chunk_id     INTEGER NOT NULL REFERENCES chunks(chunk_id),
    rank         INTEGER NOT NULL,
    score        REAL NOT NULL
);

CREATE TABLE feedback (
    query_id     INTEGER PRIMARY KEY REFERENCES queries(query_id),
    helpful      INTEGER NOT NULL
);
```

**Two deliberate features of the seed data**, because they are what makes the examples instructive:

- **Document 5, "Vendor Agreement", has no chunks.** Its parsing failed. This is the situation module 07 section 2 warns about, and section 4 shows how SQL hides it.
- **Queries 2 and 4 were refused, so they have no retrievals.** Refusal is not failure; it is the correct behavior on an unanswerable question, and it has to survive your joins.

Running it yourself:

```python
import sqlite3

con = sqlite3.connect(":memory:")
con.executescript(open("schema.sql").read())
con.executescript(open("seed.sql").read())
```

### 3. SELECT through GROUP BY [FOUNDATION]

**The clauses, in the order the database evaluates them**, which is not the order you write them:

```
FROM      → which tables
JOIN      → combine them
WHERE     → filter individual rows
GROUP BY  → collapse rows into groups
HAVING    → filter groups
SELECT    → choose and compute output columns
ORDER BY  → sort
LIMIT     → truncate
```

**This ordering explains the two questions beginners always ask.**

*Why can `WHERE` not use an aggregate?* Because `WHERE` runs before `GROUP BY`, so no aggregate exists yet. Filtering on an aggregate is `HAVING`.

*Why can `ORDER BY` use a `SELECT` alias when `WHERE` cannot?* Because `ORDER BY` runs after `SELECT`, so the alias exists by then.

```sql
SELECT q.query_id, q.text,
       ROUND(AVG(r.score), 3) AS mean_score,
       ROUND(MAX(r.score), 3) AS top_score,
       COUNT(*) AS n_retrieved
FROM queries q
JOIN retrievals r ON r.query_id = q.query_id
GROUP BY q.query_id
HAVING AVG(r.score) < 0.8
```

Actual output:

```
query_id  text                          mean_score  top_score  n_retrieved
--------  ----------------------------  ----------  ---------  -----------
1         parental leave notice period  0.767       0.91       3
3         how do I set up my laptop     0.795       0.88       2
7         onboarding checklist          0.69        0.86       3
```

Read that as an operational question: which queries had weak retrieval overall? Query 1 has a strong top hit at 0.91 but a weak third at 0.55, dragging the mean down. That is the divergence between MRR and mean score from module 07, visible in SQL.

### 4. Joins [CORE]

**The types, and what each is for:**

| Join | Keeps |
|---|---|
| `INNER JOIN` | Only rows matching on both sides |
| `LEFT JOIN` | All left rows; nulls where the right has no match |
| `RIGHT JOIN` | The mirror image. Rare; people write `LEFT` and swap the tables. |
| `FULL OUTER JOIN` | Everything from both sides |
| `CROSS JOIN` | Every combination. Deliberate, or a catastrophic mistake. |

**The lesson that matters: `INNER JOIN` deletes evidence silently.**

```sql
SELECT d.title, COUNT(c.chunk_id) AS chunks
FROM documents d
JOIN chunks c ON c.doc_id = d.doc_id
GROUP BY d.doc_id, d.title
ORDER BY chunks DESC
```

```
title               chunks
------------------  ------
Onboarding Wiki     4
Employee Handbook   3
Leave Policy        2
Architecture Notes  2
```

Four rows. There are **five** documents. "Vendor Agreement" is absent, because it has no chunks, because its parsing failed. The query is correct SQL and it has hidden your bug. A dashboard built on it shows a healthy pipeline.

```sql
SELECT d.title, COUNT(c.chunk_id) AS chunks
FROM documents d
LEFT JOIN chunks c ON c.doc_id = d.doc_id
GROUP BY d.doc_id, d.title
ORDER BY chunks
```

```
title               chunks
------------------  ------
Vendor Agreement    0
Leave Policy        2
Architecture Notes  2
Employee Handbook   3
Onboarding Wiki     4
```

Now the failure is visible. **When you are looking for problems, `LEFT JOIN` from the table that should be complete.**

**The anti-join**, for finding absences directly:

```sql
SELECT d.title
FROM documents d
LEFT JOIN chunks c ON c.doc_id = d.doc_id
WHERE c.chunk_id IS NULL
```

```
title
----------------
Vendor Agreement
```

This is your ingestion health check. Run it after every ingestion run.

**The `COUNT(*)` trap, which is the single most common LEFT JOIN bug:**

```sql
SELECT d.title, COUNT(*) AS wrong_count
FROM documents d
LEFT JOIN chunks c ON c.doc_id = d.doc_id
GROUP BY d.doc_id, d.title
```

```
title               wrong_count
------------------  -----------
Vendor Agreement    1
Leave Policy        2
Architecture Notes  2
Employee Handbook   3
Onboarding Wiki     4
```

Vendor Agreement shows **1**, not 0. `COUNT(*)` counts rows, and the LEFT JOIN produced one row with nulls in the chunk columns. `COUNT(c.chunk_id)` counts non-null values and correctly returns 0.

Off by one, on exactly the row you were trying to find. **With a LEFT JOIN, always `COUNT` a column from the right-hand table.**

**The other silent LEFT JOIN destroyer:** a `WHERE` clause on the right table.

```sql
SELECT q.text, f.helpful
FROM queries q
LEFT JOIN feedback f ON f.query_id = q.query_id
WHERE f.helpful = 0
```

```
text                          helpful
----------------------------  -------
parental leave notice period  0
```

Looks fine, and the LEFT JOIN has become an INNER JOIN. Rows with no feedback have `f.helpful` null, and `NULL = 0` is not true, so they are filtered out. If you meant "unhelpful or unrated", you need `WHERE f.helpful = 0 OR f.helpful IS NULL`, or move the condition into the `ON` clause.

**Row-count intuition, which is what interviewers probe.** Before running a join, predict the row count:

- Joining on a unique key on the right: at most one row per left row. Count stays the same or shrinks.
- Joining on a non-unique column: **fan-out**. One left row becomes as many rows as it matches.

Documents (5) joined to chunks (11) yields 11 rows, because each chunk matches exactly one document. Now imagine summing `documents.page_count` over that join: every document's page count is counted once per chunk, so the Employee Handbook's 120 pages is counted three times. **Aggregating a left-table column after a fan-out join is the most common way to produce a confidently wrong number**, and it never raises an error.

### 5. Aggregation traps [CORE]

**NULLs are skipped by aggregates, and `COUNT(*)` is not.**

```sql
SELECT AVG(page_count) AS avg_pages,
       COUNT(page_count) AS n_with_pages,
       COUNT(*) AS n_rows
FROM documents
```

```
avg_pages           n_with_pages  n_rows
------------------  ------------  ------
57.333333333333336  3             5
```

The average is over 3 documents, not 5, because HTML and markdown documents have no page count. That may be right, and it may be that you wanted to treat them as zero. The database will not ask. Always report the denominator alongside the average; an average without an `n` is not a finding.

**Integer division silently truncates:**

```sql
SELECT COUNT(*) AS total, SUM(refused)/COUNT(*) AS integer_division_trap FROM queries
```

```
total  integer_division_trap
-----  ---------------------
7      0
```

Two of seven queries were refused and the answer is 0. Both operands are integers, so the division is integer division. The fix is to force floating point:

```sql
SELECT COUNT(*) AS total_queries,
       SUM(refused) AS refused,
       ROUND(100.0 * SUM(refused) / COUNT(*), 1) AS refusal_pct
FROM queries
```

```
total_queries  refused  refusal_pct
-------------  -------  -----------
7              2        28.6
```

The `100.0` rather than `100` is the entire fix. This bites in every database, and a refusal rate reported as 0% when it is 28.6% is exactly the kind of wrong number that survives review.

**`COUNT(DISTINCT ...)` after multiple joins.** Chain two joins and the left table's rows are duplicated:

```sql
SELECT s.name AS source,
       COUNT(DISTINCT d.doc_id) AS docs,
       COUNT(c.chunk_id) AS chunks,
       ROUND(AVG(c.token_count), 1) AS avg_tokens
FROM sources s
LEFT JOIN documents d ON d.source_id = s.source_id
LEFT JOIN chunks c ON c.doc_id = d.doc_id
GROUP BY s.source_id, s.name
ORDER BY chunks DESC
```

```
source     docs  chunks  avg_tokens
---------  ----  ------  ----------
handbook   2     5       459.4
wiki       1     4       225.0
notes      1     2       610.0
contracts  1     0       None
```

Without `DISTINCT`, `handbook` would report 5 documents rather than 2, because the join to chunks duplicated each document row. And `contracts` shows `None` for the average because there are no token counts to average, which is correct and worth noticing rather than papering over with `COALESCE`.

**The three ways a GROUP BY quietly lies**, worth memorizing as a checklist:

1. An INNER JOIN dropped the groups you were looking for.
2. A fan-out join is double-counting a left-table column.
3. NULLs are silently excluded from the aggregate but not from `COUNT(*)`.

### 6. Window functions [CORE]

Aggregates collapse rows. Window functions compute across a set of rows **while keeping every row**.

```sql
SELECT q.query_id, q.text, r.chunk_id, r.rank, r.score,
       RANK() OVER (PARTITION BY q.query_id ORDER BY r.score DESC) AS score_rank
FROM queries q
JOIN retrievals r ON r.query_id = q.query_id
ORDER BY q.query_id, r.rank
```

```
query_id  text                          chunk_id  rank  score  score_rank
--------  ----------------------------  --------  ----  -----  ----------
1         parental leave notice period  4         1     0.91   1
1         parental leave notice period  5         2     0.84   2
1         parental leave notice period  1         3     0.55   3
3         how do I set up my laptop     6         1     0.88   1
3         how do I set up my laptop     7         2     0.71   2
5         what is the KV cache          10        1     0.93   1
5         what is the KV cache          11        2     0.77   2
6         parental leave notice period  4         1     0.90   1
6         parental leave notice period  5         2     0.83   2
7         onboarding checklist          6         1     0.86   1
7         onboarding checklist          8         2     0.69   2
7         onboarding checklist          9         3     0.52   3
```

`PARTITION BY` is "group by, but do not collapse". Here it verifies that the stored `rank` agrees with the score ordering, which is a real consistency check on a retrieval log.

**The functions worth knowing:**

| Function | Gives |
|---|---|
| `ROW_NUMBER()` | 1, 2, 3 with no ties |
| `RANK()` | Ties share a rank, then skip: 1, 1, 3 |
| `DENSE_RANK()` | Ties share, no skip: 1, 1, 2 |
| `LAG(col)` / `LEAD(col)` | The previous or next row's value |
| `SUM(col) OVER (...)` | Running total |
| `AVG(col) OVER (ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)` | Moving average |

**`LAG` for sessionization**, which is how you analyze conversational query logs:

```sql
SELECT user_id, query_id, asked_at,
       LAG(asked_at) OVER (PARTITION BY user_id ORDER BY asked_at) AS prev_asked
FROM queries
ORDER BY user_id, asked_at
```

```
user_id  query_id  asked_at          prev_asked
-------  --------  ----------------  ----------------
101      1         2026-04-01 09:00  None
101      2         2026-04-01 09:05  2026-04-01 09:00
102      3         2026-04-02 10:00  None
102      4         2026-04-02 10:30  2026-04-02 10:00
103      5         2026-04-03 11:00  None
103      6         2026-04-03 11:10  2026-04-03 11:00
104      7         2026-04-04 08:00  None
```

The gap between `asked_at` and `prev_asked` is how you detect follow-up questions, which is exactly the signal module 07 section 7 needs for conversational query rewriting. Five minutes is a follow-up; thirty is a new session.

**Why this matters beyond convenience.** The pre-window-function way to do this is a correlated subquery or a self-join, both of which are slower and much harder to read. Knowing window functions is a genuine dividing line between people who write SQL and people who learned `SELECT *`.

### 7. Indexes and query plans [CORE]

**`EXPLAIN QUERY PLAN` tells you what the database will actually do.** Read it before optimizing anything.

Without an index:

```
EXPLAIN QUERY PLAN SELECT * FROM retrievals WHERE query_id = 1
  SCAN retrievals
```

`SCAN` means every row is examined. After creating an index:

```sql
CREATE INDEX idx_retrievals_query ON retrievals(query_id);
```

```
EXPLAIN QUERY PLAN SELECT * FROM retrievals WHERE query_id = 1
  SEARCH retrievals USING INDEX idx_retrievals_query (query_id=?)
```

`SEARCH ... USING INDEX` means it jumped straight to the matching rows.

**The measured difference.** 300,000 rows, 300 point lookups by `user_id`:

| | Time |
|---|---|
| No index | 5.577 s |
| With index | 0.0018 s |

**A 3,172x speedup** from one `CREATE INDEX`. `[UNVERIFIED: your numbers will differ; the order of magnitude will not]`

**Why an index gets ignored**, which is the interesting half:

```
EXPLAIN QUERY PLAN SELECT * FROM retrievals WHERE query_id + 0 = 1
  SCAN retrievals
```

The index is on `query_id`, not on `query_id + 0`. **Any function applied to an indexed column defeats the index.** The common real-world versions:

- `WHERE DATE(asked_at) = '2026-04-01'` instead of `WHERE asked_at >= '2026-04-01' AND asked_at < '2026-04-02'`
- `WHERE LOWER(name) = 'handbook'` instead of storing a normalized column
- `WHERE CAST(user_id AS TEXT) = '101'`, usually from a type mismatch in the application

**Reading a join plan:**

```
EXPLAIN QUERY PLAN
SELECT q.text, r.score FROM queries q JOIN retrievals r ON r.query_id = q.query_id
  SCAN r
  SEARCH q USING INTEGER PRIMARY KEY (rowid=?)
```

It scans `retrievals` and looks each match up in `queries` by primary key. That is a sensible plan: scan the larger table once, index-seek into the smaller. When a join is slow, this is where you find out that both sides are being scanned.

**What to index:**

| Index | Do not index |
|---|---|
| Foreign keys, always | Low-cardinality columns alone (a boolean) |
| Columns in `WHERE` on large tables | Small tables; a scan is already fast |
| Columns in `ORDER BY` on large results | Every column, speculatively |
| Composite `(a, b)` for queries filtering both | Write-heavy tables, without measuring |

Indexes cost write speed and disk. Every insert updates every index. On an ingestion pipeline writing millions of chunks, indexes you do not query are pure overhead.

**Composite index ordering matters.** An index on `(query_id, rank)` serves `WHERE query_id = ?` and `WHERE query_id = ? AND rank = ?`, but **not** `WHERE rank = ?` alone. Leftmost prefix. Getting the column order wrong is a common reason an index appears to do nothing.

**The N+1 problem**, which is an application bug that looks like a database problem:

```python
# N+1: one query, then one more per row
queries = db.execute("SELECT * FROM queries").fetchall()
for q in queries:
    retrievals = db.execute(
        "SELECT * FROM retrievals WHERE query_id = ?", (q["query_id"],)
    ).fetchall()
```

A thousand queries means 1,001 round trips. Each is fast; the total is not. Fetch once and group in Python, or use a join. This is the most common performance bug in ORM-backed applications, and you find it by counting queries per request, not by reading code.

### 8. pandas versus SQL [DEPTH]

Both manipulate tables. They win at different things.

| Job | Winner | Why |
|---|---|---|
| Filter, join, aggregate over large data | SQL | Runs where the data is; no transfer; indexed |
| Anything that does not fit in memory | SQL | pandas loads everything |
| Complex multi-step transformation | pandas | Intermediate variables; easier to inspect |
| Row-wise logic that is awkward in SQL | pandas | Arbitrary Python |
| Reproducible, version-controlled pipeline | Either | Both work; SQL in files, pandas in modules |
| Time series resampling, interpolation | pandas | Purpose-built |
| Feeding a dashboard or an application | SQL | The database is the shared interface |

**The rule that avoids most trouble: push filtering and aggregation into SQL, then bring the result into pandas.**

```python
# Bad: transfer everything, then throw most of it away
df = pd.read_sql("SELECT * FROM retrievals", con)
result = df[df.score > 0.8].groupby("query_id").score.mean()

# Good: the database does the work, you transfer the answer
result = pd.read_sql("""
    SELECT query_id, AVG(score) AS mean_score
    FROM retrievals
    WHERE score > 0.8
    GROUP BY query_id
""", con)
```

The first version moves every row over the wire and into memory. On a table of ten million retrieval events this is the difference between a query and an outage.

**pandas gotchas that mirror `01a`'s aliasing:**

- `SettingWithCopyWarning` means you may be modifying a view rather than the original, or vice versa. It is the aliasing problem from `01a` section 2 in a different library.
- `df.merge` defaults to an inner join, so it silently drops non-matching rows exactly like SQL's `JOIN`. Pass `how="left"` and check `len(df)` before and after; a merge that changed the row count unexpectedly is a fan-out.
- `NaN != NaN`, so equality-based filtering misses nulls. Use `.isna()`.
- Chained indexing (`df[df.a > 1]["b"] = 5`) frequently does nothing at all. Use `.loc`.

### 9. Statistics you actually need [CORE]

Not a statistics course. The specific things that stop you drawing a wrong conclusion.

**Variance is why small samples lie.** The standard error of a mean is roughly `σ/√n`. The `√n` is the whole story: to halve your uncertainty you need four times the data. This is why a 40-question evaluation set cannot distinguish a recall of 0.71 from 0.74, and why claiming it can is the most common error in AI engineering write-ups.

**Confidence intervals, and what "95%" means.** Verified by simulation, 10,000 samples of size 30 from a known distribution:

```
95% CIs containing the true mean: 0.9465
```

The interval covers the true value about 95% of the time *across repeated experiments*. It does **not** mean there is a 95% probability the true value is in your particular interval; that interval either contains it or does not. The distinction matters because the wrong reading makes people far too confident about a single result.

**Report an interval, not a point.** "Recall@5 was 0.71" invites a comparison that the data cannot support. "Recall@5 was 0.71, and with 40 questions the interval is wide enough that anything from about 0.57 to 0.83 is consistent with it" is honest and changes what you do next, which is collect more questions.

**What a p-value is.** The probability of seeing data at least this extreme *if the null hypothesis were true*. Verified: under a true null, p-values are uniform.

```
fraction p<0.05: 0.0510   (expected 0.05)
fraction p<0.01: 0.0107   (expected 0.01)
```

**What a p-value is not**, and each of these is a mistake you will see made:

- Not the probability the null hypothesis is true.
- Not the probability your result is a fluke.
- Not a measure of effect size. A tiny, useless difference is significant with enough data.
- Not a threshold at which something becomes real. p = 0.049 and p = 0.051 are the same evidence.

**Multiple comparisons.** Test twenty useless variants at p < 0.05 and you will find something. Simulated, 20 independent tests with no real effect:

```
at least one 'significant': 0.649   theory 1-0.95^20 = 0.642
```

**65% of the time you find a "significant" result when nothing is happening.**

A subtlety worth knowing, because it is how teams actually run experiments. With one shared control arm compared against 20 variants, the same simulation gives:

```
shared control arm, 20 variants: at least one significant = 0.443
```

Lower than the independent case, because the tests are correlated through the shared control: if the control sample happens to sit near the true mean, all twenty comparisons are less likely to be extreme. Still 44%, still bad, and the practical lesson is unchanged. **Decide what you are testing before you look**, and correct for the number of comparisons if you must run many.

**Correlation and causation**, stated usefully rather than as a slogan. Two variables can correlate because A causes B, B causes A, a third thing causes both, or by chance. Only a randomized intervention distinguishes them. In RAG work this surfaces constantly: queries with low retrieval scores also get more thumbs-down, and that could be bad retrieval causing dissatisfaction, or hard questions causing both.

### 10. Experimentation [CORE]

**The A/B test in one paragraph.** Randomly assign users to control or treatment, measure one pre-declared metric, and compare. Randomization is what buys you causality; everything else is bookkeeping.

**Sample size, computed.** For a two-proportion test at α = 0.05 and 80% power:

| Baseline rate | Effect to detect | Users per arm |
|---|---|---|
| 10% | +2.0% | 3,841 |
| 10% | +1.0% | 14,751 |
| 10% | +0.5% | 57,763 |
| 30% | +2.0% | 8,393 |
| 2% | +0.2% | 80,681 |

**Halving the effect size roughly quadruples the sample**, measured as 3.8x in the table. Same `√n` relationship as before.

This table is the answer to "can we A/B test this?" for most small products: with a thousand users a week, detecting a one-point improvement takes about thirty weeks. **Knowing you cannot run the test is a useful result**, and it pushes you toward offline evaluation, which is why module 07 section 9 exists.

**Ways an experiment is invalid**, worth knowing because they look like results:

| Problem | What happens |
|---|---|
| **Peeking** | Checking daily and stopping when significant inflates the false positive rate enormously |
| **Sample ratio mismatch** | Arms not the size you expected means randomization is broken; stop and fix it |
| **Novelty effect** | Users engage with anything new; the effect decays |
| **Contamination** | Users see both variants, through shared accounts or caching |
| **Metric shift** | Choosing the metric after seeing results is p-hacking with extra steps |
| **Segment slicing** | Twenty segments, one significant, is section 9's multiple comparisons |

**For AI systems specifically**, three complications:

*Offline gains do not transfer.* Recall@5 improving does not mean users are happier. Both measurements are needed, and offline evaluation is the fast loop that decides what is worth testing online.

*The metric is often not obvious.* Thumbs-up rate is biased toward users who bother to click. Task completion is better and harder to instrument. Decide before you run.

*Latency is a confound.* A change that improves quality and adds 400ms may reduce engagement anyway. Measure both, and be explicit that you are trading them.

### 11. Vector data alongside relational [DEPTH]

The bridge to module 07.

**Vectors live in an index; everything else about a chunk belongs in a database.** Chunk id, document id, heading path, token count, permissions, timestamps, content hash. This is not incidental: it is what makes filtering, deletion, freshness monitoring and debugging possible.

The join key is the chunk id. Your vector index returns ids and scores; your database turns those into text, provenance and permissions.

```sql
-- retrieval health by source: which sources actually answer questions?
SELECT s.name AS source,
       COUNT(DISTINCT r.query_id) AS queries_served,
       ROUND(AVG(r.score), 3) AS mean_score,
       SUM(CASE WHEN r.rank = 1 THEN 1 ELSE 0 END) AS times_top_ranked
FROM retrievals r
JOIN chunks c ON c.chunk_id = r.chunk_id
JOIN documents d ON d.doc_id = c.doc_id
JOIN sources s ON s.source_id = d.source_id
GROUP BY s.source_id, s.name
ORDER BY times_top_ranked DESC
```

That query answers a real question: are any of your sources dead weight? A source ingested, indexed, and never retrieved is cost with no benefit, and you cannot see it from the vector index alone.

**Postgres with pgvector** is worth knowing as an option: vectors as a column type, so filtering and vector search happen in one query with real transactions and real foreign keys. Generally slower at very large scale than a dedicated vector database, and much simpler operationally below that scale. `[VERIFY: the performance crossover moves as both improve @ current benchmarks, and test on your own data]`

**The operational point from module 07 section 11:** a deletion request must remove the document, its chunks, its vectors and any cached embeddings. Your database knows which chunks belong to a document; your vector index does not know about documents at all. Without the relational side, "delete everything from this document" is not a query you can write.

---

## Worked example: an ingestion health check

Every query in one place, as the thing you would actually build after module 07's pipeline.

**Question 1: did anything fail to produce chunks?**

```sql
SELECT d.doc_id, d.title, s.name AS source
FROM documents d
JOIN sources s ON s.source_id = d.source_id
LEFT JOIN chunks c ON c.doc_id = d.doc_id
WHERE c.chunk_id IS NULL
```

Anti-join. Returns Vendor Agreement. **Alert on this being non-empty.**

**Question 2: are chunk sizes sane?**

```sql
SELECT s.name AS source,
       COUNT(c.chunk_id) AS chunks,
       MIN(c.token_count) AS min_tokens,
       ROUND(AVG(c.token_count), 1) AS avg_tokens,
       MAX(c.token_count) AS max_tokens
FROM sources s
LEFT JOIN documents d ON d.source_id = s.source_id
LEFT JOIN chunks c ON c.doc_id = d.doc_id
GROUP BY s.source_id, s.name
```

`LEFT JOIN` so a source with nothing still appears. A `max_tokens` far above your target means a chunk that will dominate the context budget, which is module 06's context-exhaustion failure.

**Question 3: what is the refusal rate, and is it moving?**

```sql
SELECT DATE(asked_at) AS day,
       COUNT(*) AS queries,
       SUM(refused) AS refused,
       ROUND(100.0 * SUM(refused) / COUNT(*), 1) AS refusal_pct
FROM queries
GROUP BY DATE(asked_at)
ORDER BY day
```

The `100.0` is load-bearing. A refusal rate climbing over days usually means ingestion has stalled and the corpus no longer covers what people ask.

**Question 4: which queries retrieved nothing?**

```sql
SELECT q.query_id, q.text, q.refused
FROM queries q
LEFT JOIN retrievals r ON r.query_id = q.query_id
WHERE r.retrieval_id IS NULL
```

Returns queries 2 and 4, both refused, which is correct. If this returned a query with `refused = 0`, you would have found a real bug: a query that retrieved nothing and answered anyway.

**Question 5: is stored rank consistent with score?**

```sql
SELECT query_id, chunk_id, rank, score, score_rank
FROM (
    SELECT query_id, chunk_id, rank, score,
           RANK() OVER (PARTITION BY query_id ORDER BY score DESC) AS score_rank
    FROM retrievals
)
WHERE rank <> score_rank
```

Empty is what you want. Non-empty means your reranker's output and your stored order disagree, which is the citation-misalignment bug from module 07's failure table.

**What makes this a health check rather than a dashboard.** Every query has a defined "good" answer: empty, or within a range. That is what you can alert on. A dashboard of numbers nobody has defined expectations for is a decoration.

---

## Common mistakes and debugging

### Beginner mistakes

| Symptom | Cause | Fix |
|---|---|---|
| "misuse of aggregate function" | Aggregate in `WHERE` | Use `HAVING` |
| Rows missing that should be there | `INNER JOIN` where you needed `LEFT` | Swap, and check the count |
| `COUNT` returns 1 for empty groups | `COUNT(*)` after a LEFT JOIN | `COUNT(right_table.col)` |
| Percentage is 0 | Integer division | `100.0 *`, not `100 *` |
| LEFT JOIN behaving as INNER | `WHERE` on a right-table column | Move it into `ON`, or add `OR ... IS NULL` |
| Sums far too large | Fan-out join double-counting | Aggregate before joining, or use `DISTINCT` |
| Average excludes rows | NULLs skipped by aggregates | Report the `n` alongside |
| `GROUP BY` rejected | Selecting a non-aggregated, non-grouped column | Add it to `GROUP BY` or aggregate it |
| Query slow despite an index | A function applied to the indexed column | Rewrite as a range condition |

### Production failure modes

**The dashboard that hides the outage.** Built on `INNER JOIN`s, so documents that failed to ingest simply do not appear. Everything looks healthy. *Diagnostic:* run the anti-join. *Fix:* `LEFT JOIN` from the table that should be complete, and alert on non-empty absences.

**Double-counted metrics after a schema change.** Someone adds a second retriever, so a chunk can appear twice per query. Every average over that join is now wrong. Nothing errors. *Diagnostic:* compare `COUNT(*)` before and after the join against expectations. *Fix:* aggregate to the right grain before joining.

**N+1 in the application layer.** Each request issues one query plus one per result. Fast in development with ten rows, times out in production with a thousand. *Diagnostic:* count queries per request. *Fix:* one query with a join, or fetch and group in memory.

**Timestamps without timezones.** `asked_at` stored as local time, aggregated by day, and daily counts shift when the server moves or clocks change. *Fix:* store UTC, convert at display time. Not glamorous, and it silently corrupts every time series.

**Statistics computed over a filtered subset.** Mean retrieval score looks great because refused queries have no retrievals and are excluded by the join. The metric measures only the easy queries. *Diagnostic:* always check the denominator. *Fix:* be explicit about the population, and report it.

**The evaluation set that shrank.** A join in the eval harness silently dropped questions with no labelled chunks, so metrics are computed over 34 of 40 questions and look better than reality. This is exactly why the harness in project 2 excludes unanswerable cases explicitly and records `n` in every report.

### Debugging method

1. **Count rows at every stage.** Before the join, after the join, after the filter. A count that changed unexpectedly is your bug.
2. **Run the inner query alone** before wrapping it in an aggregate.
3. **`SELECT *` on a small `LIMIT`** to see what the join actually produced, before aggregating it.
4. **Check the denominator** of every average and percentage.
5. **`EXPLAIN QUERY PLAN` before optimizing.** `SCAN` on a large table is the thing to fix.
6. **Compare against a known total.** If documents number 5, any grouping over documents should account for 5.

---

## Interview angle

**1. What does an INNER JOIN hide, and when does that matter?**

*Strong outline:* It drops rows with no match on either side, silently and without error. Give the concrete case: joining documents to chunks with an INNER JOIN makes documents whose parsing failed disappear entirely, so a pipeline health dashboard shows everything working. Fix is to LEFT JOIN from the table that should be complete, and for finding absences specifically, an anti-join with `WHERE right.id IS NULL`. Then the trap that follows: after a LEFT JOIN, `COUNT(*)` returns 1 for a non-matching row because the join produced a row of nulls, so you must `COUNT` a column from the right-hand table.

*Weak answer:* "INNER keeps matches, LEFT keeps everything on the left." Definitional, and does not show you have been bitten by it.

**2. Why is this query slow despite having an index?**

*Strong outline:* Ask to see the query and the plan first. The most common cause is a function applied to the indexed column: `WHERE DATE(asked_at) = ...` cannot use an index on `asked_at`, and neither can `LOWER(name)` or an implicit cast from a type mismatch. Rewrite as a range condition. Other causes: leftmost-prefix on a composite index, so an index on `(a, b)` does not serve `WHERE b = ?`; low selectivity, where the planner correctly decides a scan is cheaper; and stale statistics. Then say you would confirm with `EXPLAIN` rather than guessing, because `SCAN` versus `SEARCH USING INDEX` answers it immediately.

*Weak answer:* "Add more indexes." Indexes cost write throughput, and the problem here is usually that the existing one cannot be used.

**3. What is a p-value, and what is it not?**

*Strong outline:* The probability of observing data at least this extreme if the null hypothesis were true. Then the four things it is not: not the probability the null is true, not the probability your result is a fluke, not a measure of effect size, and not a threshold where something becomes real, since 0.049 and 0.051 are the same evidence. Add the multiple comparisons point with a number: twenty independent tests of nothing produce at least one "significant" result about 65% of the time, which is `1 - 0.95²⁰`. Conclusion: decide what you are testing before looking, and correct when you must run many.

*Weak answer:* "It tells you if the result is significant." Circular, and it is the misunderstanding being probed.

**4. We want to A/B test a retrieval change. Our conversion is 10% and we hope for a one-point improvement. What do you tell the product manager?**

*Strong outline:* Compute it: roughly 14,700 users per arm at 80% power and α = 0.05, so 29,500 total. Then ask how much traffic there is, because at a thousand users a week that is thirty weeks and the answer is that the test is not feasible. Note the scaling: halving the detectable effect roughly quadruples the sample, so "let's detect half a point instead" means 58,000 per arm. Then offer the alternative: offline evaluation on a labelled set is the fast loop, and you online-test only the changes that clear it. Finish with the invalidity risks you would guard against: peeking, sample ratio mismatch, and choosing the metric after seeing results.

*Weak answer:* "Run it for two weeks and see." This is how organizations ship changes based on noise.

**5. How would you find out whether your ingestion pipeline is silently dropping documents?**

*Strong outline:* An anti-join: `LEFT JOIN` chunks to documents and filter for `chunk_id IS NULL`. That gives documents that produced no chunks. Then broaden it into a health check with defined expectations rather than a dashboard: chunk-size distributions per source to catch parser failures producing one giant chunk, ingestion lag between source modification and index time to catch a stalled pipeline, and counts compared against a known total. The key idea is that each check has a defined good answer, empty or in range, so you can alert on it. A dashboard nobody has set expectations for is decoration.

*Weak answer:* "Check the logs." Works if someone logged it, and does not survive the case where the failure was silent, which is the case being asked about.

**6. When would you use pandas rather than SQL?**

*Strong outline:* Push filtering and aggregation into SQL, then bring the result into pandas. SQL runs where the data is, uses indexes, and does not require the data to fit in memory. pandas wins for complex multi-step transformations where intermediate inspection matters, row-wise logic that is awkward to express in SQL, and time series operations like resampling. The anti-pattern is `SELECT *` into a dataframe and filtering there, which transfers everything to throw most of it away. Then the gotchas that mirror Python's aliasing: `merge` defaults to inner and drops rows silently, `SettingWithCopyWarning` is the view-versus-copy problem, and `NaN != NaN` breaks equality filtering.

*Weak answer:* "pandas is easier." Sometimes true, and it is the answer that produces the outage at scale.

**7. Explain window functions and why they exist.**

*Strong outline:* They compute across a set of related rows while keeping every row, unlike `GROUP BY` which collapses. `PARTITION BY` is "group by without collapsing". Give a concrete use: `RANK() OVER (PARTITION BY query_id ORDER BY score DESC)` verifies that your stored retrieval rank agrees with the scores, which is a real consistency check on a retrieval log. Or `LAG(asked_at) OVER (PARTITION BY user_id ORDER BY asked_at)` to compute gaps between a user's queries, which is how you detect follow-up questions for conversational query rewriting. Then why they exist: the alternative is a correlated subquery or self-join, which is slower and much harder to read.

*Weak answer:* Listing the function names without a case where they are the right tool.

**8. Your average retrieval score looks great but users complain. What do you check?**

*Strong outline:* The denominator, first. If the average comes from a join to retrievals, refused queries have no retrievals and are excluded, so you are averaging over only the queries that went well. The population you measured is not the population that complained. Then: whether a fan-out join is double-counting, whether NULLs are being silently skipped, whether the metric is even the right one since a high mean score does not mean the right chunk ranked first, which is module 07's MRR-versus-recall point. General principle: always report `n` alongside any average, and state the population explicitly.

*Weak answer:* "Users are wrong." Occasionally true, never the first hypothesis.

**9. How do you decide what to index?**

*Strong outline:* Foreign keys always, because they are joined constantly. Columns in `WHERE` clauses on large tables. Columns in `ORDER BY` when the result set is large. Composite indexes for queries filtering on multiple columns, with the leftmost-prefix rule in mind: `(a, b)` serves `WHERE a` and `WHERE a AND b` but not `WHERE b`. What not to index: low-cardinality columns alone, small tables where a scan is already fast, and speculative indexing of everything, because each index costs write throughput on every insert. On a pipeline writing millions of chunks that overhead is real. Then: measure with `EXPLAIN`, and remove indexes that plans do not use.

*Weak answer:* "Index the columns you query." Directionally right, and misses the write cost and the composite ordering rule.

**10. Why do you need statistics for AI engineering at all?**

*Strong outline:* To know when a number means something. The standard error scales as `σ/√n`, so a 40-question evaluation set cannot distinguish recall of 0.71 from 0.74, and claiming it can is the most common error in AI write-ups. Report intervals rather than point estimates, so the honest statement is "0.71, and the interval is wide enough that 0.57 to 0.83 is consistent". Know the multiple comparisons problem, because sweeping twenty configurations and picking the best is exactly twenty tests. And know what randomization buys you, because without it a correlation between low retrieval scores and thumbs-down could be bad retrieval causing dissatisfaction, or hard questions causing both.

*Weak answer:* "For model evaluation." True and vague. The question wants a specific error that statistics prevents.

### Follow-up questions to expect

- After 4: *"The PM says just ship it if it looks better."* Say what that costs: without power, you cannot distinguish improvement from noise, so you will ship some changes that made things worse and believe they helped. Offer the compromise: ship behind a flag, monitor a guardrail metric for a regression large enough to detect, and use offline evaluation for the quality decision. That is a defensible position rather than a refusal.
- After 1: *"How would you catch a fan-out join in review?"* Count rows before and after. If a join to a table that should be one-to-one changed the row count, the relationship is not what you assumed. In code review, any aggregate over a left-table column after a join is worth a question.

### 60-second and 5-minute answers

1. What INNER JOIN hides and how you find it
2. Why a query is slow despite an index
3. What a p-value is not
4. Why your eval set may be too small to support your claim

---

## Practice tasks

Solutions in `quizzes/03-data-sql-practice.md`. All 25 exercises run against the section 2 schema.

### Twenty-five SQL exercises

**Foundations (1-6)**

1. Every document with its source name and kind.
2. Documents ingested after 2026-02-01, newest first.
3. Count of documents per source, including sources with none.
4. Total token count per document, largest first.
5. Documents with a null `page_count`, and explain why they are null.
6. The three chunks with the highest token count, with their document titles.

**Joins (7-12)**

7. Every query with the number of chunks retrieved, including refused queries showing 0.
8. Documents that produced no chunks. Then explain why `COUNT(*)` is wrong here.
9. Chunks never retrieved by any query.
10. Users who asked more than one question, with their question count.
11. For each query, the title of the document its top-ranked chunk came from.
12. Sources whose documents have never been top-ranked for any query.

**Aggregation (13-18)**

13. Refusal rate overall, as a percentage, correct to one decimal.
14. Mean, min and max retrieval score per query, only for queries with two or more retrievals.
15. Average token count per source, handling the source with no chunks explicitly.
16. Queries where the top score was below 0.9, with their text.
17. For each day, queries asked, refused, and refusal percentage.
18. Helpful-feedback rate, counting queries with no feedback as a separate category rather than dropping them.

**Window functions (19-22)**

19. Each retrieval with its rank by score within its query, and flag rows where it disagrees with the stored `rank`.
20. Each query with the previous query by the same user and the gap between them.
21. Running total of chunks ingested, ordered by document ingestion date.
22. For each source, the document with the most chunks, using a window function rather than a correlated subquery.

**Harder (23-25)**

23. For each query, the number of distinct documents its retrieved chunks came from. A query drawing from one document versus four is a different kind of question.
24. Find any query whose retrievals include a chunk from a document ingested *after* the query was asked. This should be impossible; write the query that would catch it if your pipeline had a bug.
25. Chunks retrieved by more than one distinct user, with the count. These are your high-value chunks.

### Three realistic tasks

1. **Ingestion health check.** Build the five queries from the worked example as a script that exits non-zero if any check fails. Define the expected result for each. This is a real production artifact.
2. **Evaluation results table.** Design a schema for project 2's `eval/results/` files, load several runs into it, and write the query producing the results comparison table. Include per-category breakdown. You will discover that comparing runs is a join problem.
3. **Index study.** Generate a table of one million retrieval events. Time three representative queries with no indexes, then add indexes one at a time, recording `EXPLAIN QUERY PLAN` and timing at each step. Then measure insert throughput with and without the indexes, so you have both sides of the tradeoff.

### One mini-project

**Retrieval analytics from a real log.**

Instrument project 2 (or a synthetic log) to write query, retrieval and feedback rows to SQLite. Then answer, in SQL:

- Which sources earn their ingestion cost, and which are never retrieved?
- Is the refusal rate trending, and does it correlate with ingestion lag?
- Which chunks are retrieved often but associated with unhelpful feedback? These are your misleading chunks.
- What is the distribution of distinct documents per query, and do multi-document queries get worse feedback?
- Do follow-up questions, detected with `LAG`, perform worse than opening questions? This measures whether you need conversational query rewriting.

Success criterion: at least one query surfaces something you did not already know about your own system. That is the bar for analytics, and it is the difference between a dashboard and a finding.

---

## Mastery checklist

- [ ] Explain what a foreign key guarantees and why application validation is weaker
- [ ] State the clause evaluation order and use it to explain `WHERE` versus `HAVING`
- [ ] Say what an INNER JOIN hides, with a concrete failure
- [ ] Write an anti-join to find absences
- [ ] Explain why `COUNT(*)` is wrong after a LEFT JOIN
- [ ] Explain why a `WHERE` on the right table turns a LEFT JOIN into an INNER JOIN
- [ ] Predict the row count of a join before running it, and recognize fan-out
- [ ] Name three ways a `GROUP BY` quietly produces a wrong number
- [ ] Explain the integer division trap and fix it
- [ ] Use `RANK() OVER (PARTITION BY ...)` and `LAG` without looking them up
- [ ] Read `EXPLAIN QUERY PLAN` and distinguish `SCAN` from `SEARCH`
- [ ] Name three ways to accidentally defeat an index
- [ ] State the leftmost-prefix rule for composite indexes
- [ ] Recognize and fix an N+1 query pattern
- [ ] Say when to push work into SQL rather than pandas, and why
- [ ] State what a p-value is and four things it is not
- [ ] Compute a rough sample size and explain why halving the effect quadruples it
- [ ] Explain why a 40-question eval set cannot support a 0.03 difference claim
- [ ] Name four ways an A/B test can be invalid

Fewer than fifteen of nineteen means go back. Module 07's evaluation work assumes sections 4, 5 and 9.

---

## Connections

**Backward:**

- `01a` section 9's CSV and JSON handling is how data gets into a database.
- `01a` section 2's aliasing is the same problem as pandas' `SettingWithCopyWarning`.
- `02` section 10's command line is how you inspect data files before loading them.
- `02` section 6's testing strategy applies directly: the ingestion health check is a test suite.

**Forward:**

- `04-machine-learning.md` depends on section 9 for metrics and section 10 for experimentation. Data leakage is often a join done wrong.
- `07-rag-and-vector-search.md` section 9's evaluation is aggregation over exactly this kind of data, and its chunk metadata is section 11's relational half.
- `10-mlops-and-deployment.md` turns the health check into monitoring with alert thresholds.
- `11-ai-system-design.md`'s capacity estimation uses the same arithmetic discipline.
- `projects/project-2-rag-app.md`'s results comparison is a SQL problem, and its exclusion of unanswerable cases from recall is section 5's denominator lesson.

---

## Volatile claims

| Claim | Why it decays | Re-check against |
|---|---|---|
| SQLite-specific `EXPLAIN QUERY PLAN` output | Other databases format plans differently | Your database's docs |
| The 3,172x index speedup | Hardware and data dependent | Run it yourself |
| pgvector performance crossover | Both sides improving quickly | Current benchmarks, on your data |
| Sample size table | Correct for the stated assumptions; different tests differ | Recompute for your metric |

SQL semantics, join behavior, aggregation traps and the statistical results are stable. Postgres, MySQL and SQLite differ in syntax details but not in any of the concepts here.

**Next review due:** 2027-09-18. This module ages slowly.
