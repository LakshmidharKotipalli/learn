# Practice Pack: 03 Data, SQL, and Statistics

Work this pack at least one day after reading the module. Write your answer before opening each solution; recognition is not retrieval.

## 1. Retrieval questions

1. What rows does a LEFT JOIN preserve?

<details><summary>Answer</summary>

Every row from the left table, with NULLs where no right-side match exists.

</details>

2. Why can a one-to-many join inflate an aggregate?

<details><summary>Answer</summary>

One left row becomes multiple joined rows, so summing a left-side value repeats it.

</details>

3. What is the difference between WHERE and HAVING?

<details><summary>Answer</summary>

WHERE filters rows before grouping; HAVING filters groups after aggregation.

</details>

4. What does an index trade for faster reads?

<details><summary>Answer</summary>

Storage and write/update work, plus maintenance and possible planner complexity.

</details>

5. What makes a metric decision-relevant?

<details><summary>Answer</summary>

It measures the outcome or proxy that the product decision actually cares about, with a known failure mode.

</details>

## 2. Prediction exercises

1. A document has three chunks and joins to one evaluation row before summing document size. What danger exists?

<details><summary>Answer</summary>

The document size may be counted three times unless the aggregation happens before the one-to-many join or uses a distinct-safe design.

</details>

2. A query filters `WHERE score > 0.8` before `GROUP BY source`. Can a group with no qualifying rows appear?

<details><summary>Answer</summary>

No. WHERE removes those rows before grouping; use a preserved table and LEFT JOIN when zero-result groups matter.

</details>

3. A window function ranks rows within each customer without collapsing them. What does that preserve?

<details><summary>Answer</summary>

Every original row, while adding a derived rank or aggregate value.

</details>

## 3. Debugging scenarios

1. A dashboard suddenly reports more answers than questions. What should you inspect?

<details><summary>Answer</summary>

Join cardinality and duplicate keys before changing the metric.

</details>

2. A query is correct but slow after adding an index. What evidence should you gather?

<details><summary>Answer</summary>

The query plan, selectivity, table size, and whether the predicate or sort can use the index.

</details>

3. An experiment shows a large uplift after the treatment flag was assigned. What data issue could make that meaningless?

<details><summary>Answer</summary>

Selection bias, leakage, inconsistent exposure, or a metric computed from post-treatment data.

</details>

## 4. Short explanation prompts

1. Explain why evaluation is a data problem.

<details><summary>Answer</summary>

Questions, evidence, predictions, labels, and outcomes must be joined and aggregated without changing the population; bad data logic creates plausible but false metrics.

</details>

2. Explain precision and recall in operational language.

<details><summary>Answer</summary>

Precision asks how often positive results are useful; recall asks how much of the useful population was found.

</details>

3. Explain why a schema is part of an AI system design.

<details><summary>Answer</summary>

The schema determines what can be recorded, joined, audited, evaluated, and changed safely later.

</details>

## 5. Implementation task

Build an ingestion-health query over documents, chunks, and evaluation rows. Report document count, documents with zero chunks, average chunks per document, and answer recall by source without inflating counts.

Do not open the rubric until you have a working attempt.

## 6. Rubric

- [ ] The schema and join keys are explicit.
- [ ] Zero-chunk documents remain visible.
- [ ] Aggregates are protected from one-to-many duplication.
- [ ] The query includes a hand-checked fixture.
- [ ] The result explains what operational action each metric supports.

## 7. Scoring

- **4 — Ready:** answers are produced without notes, the implementation works, and the explanation names tradeoffs.
- **3 — Practiced:** one weak area remains; schedule a review in 7 days and redo that section.
- **2 — Learning:** revisit the module's first-pass path and retry the prediction/debugging sections tomorrow.
- **1 — Not yet:** ask for help or use the worked example, then restart with a smaller task.

