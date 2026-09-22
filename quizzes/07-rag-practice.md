# Practice Pack: 07 RAG and Vector Search

Work this pack at least one day after reading the module. Write your answer before opening each solution; recognition is not retrieval.

## 1. Retrieval questions

1. When is RAG the wrong answer?

<details><summary>Answer</summary>

When the information is stable and fits a deterministic query, when a model behavior change is needed, or when retrieval cannot provide the required evidence.

</details>

2. What makes a chunk useful?

<details><summary>Answer</summary>

It preserves enough meaning and metadata to answer a question without adding excessive irrelevant context.

</details>

3. What does recall@k measure?

<details><summary>Answer</summary>

The fraction of relevant items retrieved within the top k results.

</details>

4. Why combine lexical and vector search?

<details><summary>Answer</summary>

Lexical search catches exact terms and identifiers; vector search catches semantic similarity. Their errors differ.

</details>

5. How do you separate retrieval from generation quality?

<details><summary>Answer</summary>

Check whether the needed evidence appears in retrieved results before judging whether the model used it correctly.

</details>

## 2. Prediction exercises

1. If chunks are too large, what may happen to retrieval and generation?

<details><summary>Answer</summary>

Retrieval becomes less precise and the prompt contains more irrelevant material, increasing cost and distraction.

</details>

2. If recall@k improves but answer quality does not, what should you inspect?

<details><summary>Answer</summary>

Reranking, prompt construction, evidence sufficiency, model grounding, and whether the evaluation labels the right failure.

</details>

3. If a permission filter is applied after retrieval, what risk exists?

<details><summary>Answer</summary>

Unauthorized content may have already influenced ranking or logging; permissions should constrain retrieval before content is exposed.

</details>

## 3. Debugging scenarios

1. The answer says 'not found' even though the right chunk exists at rank 20. What failure is that?

<details><summary>Answer</summary>

A retrieval recall or cutoff failure; inspect chunking, query formulation, index recall, filtering, and k.

</details>

2. The right chunks are retrieved but the answer cites the wrong one. What should you instrument?

<details><summary>Answer</summary>

The exact prompt context, source identifiers, citation mapping, and model output against the retrieved evidence.

</details>

3. A document update leaves old answers in the system. What operational capability is missing?

<details><summary>Answer</summary>

Freshness and deletion handling across the source, index, cache, and evaluation data.

</details>

## 4. Short explanation prompts

1. Explain why chunking is an information-design problem.

<details><summary>Answer</summary>

Chunk boundaries determine what can be retrieved together and whether the context contains a complete answer, not just how many tokens fit.

</details>

2. Explain the retrieval-to-answer failure taxonomy.

<details><summary>Answer</summary>

A system can fail during parsing, chunking, indexing, querying, ranking, prompt construction, generation, or citation; each needs different evidence.

</details>

3. Explain why evaluation comes before tuning.

<details><summary>Answer</summary>

Without a fixed evaluation set and failure labels, tuning only changes anecdotes and cannot show whether the system improved.

</details>

## 5. Implementation task

Build a small retrieval harness over ten support documents. Compare fixed-size, sentence-aware, and hybrid retrieval; report recall@k and three labeled failure cases before changing the generator.

Do not open the rubric until you have a working attempt.

## 6. Rubric

- [ ] The evaluation questions and relevant chunks are explicit.
- [ ] Chunking and retrieval changes are isolated.
- [ ] Metrics are computed from hand-checked labels.
- [ ] At least one failure is traced to retrieval and one to generation/prompting.
- [ ] The final choice states a tradeoff.

## 7. Scoring

- **4 — Ready:** answers are produced without notes, the implementation works, and the explanation names tradeoffs.
- **3 — Practiced:** one weak area remains; schedule a review in 7 days and redo that section.
- **2 — Learning:** revisit the module's first-pass path and retry the prediction/debugging sections tomorrow.
- **1 — Not yet:** ask for help or use the worked example, then restart with a smaller task.

