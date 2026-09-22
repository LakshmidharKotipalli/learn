# Practice Pack: 11 AI System Design

Work this pack at least one day after reading the module. Write your answer before opening each solution; recognition is not retrieval.

## 1. Retrieval questions

1. What should happen before drawing components?

<details><summary>Answer</summary>

Clarify users, goals, constraints, traffic, quality, latency, privacy, and failure requirements.

</details>

2. What drives capacity estimates?

<details><summary>Answer</summary>

Request rate, payload/context size, output size, concurrency, storage growth, and retention.

</details>

3. What makes a component choice reversible?

<details><summary>Answer</summary>

A stable interface, portable data, measured assumptions, and a migration or fallback path.

</details>

4. What belongs in evaluation and operations?

<details><summary>Answer</summary>

Offline quality, online behavior, safety, latency, cost, drift, alerts, and rollback criteria.

</details>

5. Where should permission boundaries live?

<details><summary>Answer</summary>

In application-enforced identity and authorization checks close to data and side effects, not only in prompts.

</details>

## 2. Prediction exercises

1. If average context doubles at the same request rate, which costs may rise?

<details><summary>Answer</summary>

Embedding/retrieval payload, model prefill work, key–value cache memory, latency, and potentially token cost.

</details>

2. A system has excellent average latency but poor p99 latency during bursts. What does that imply?

<details><summary>Answer</summary>

Capacity, queueing, batching, or dependency limits are hurting tail behavior; average latency hides the user impact.

</details>

3. A component has the best benchmark but no fallback or migration path. What tradeoff remains?

<details><summary>Answer</summary>

Higher lock-in and operational risk; the benchmark win may not justify the irreversibility.

</details>

## 3. Debugging scenarios

1. A design diagram has every service but no success metric. What is missing?

<details><summary>Answer</summary>

Requirements and measurable acceptance criteria; architecture cannot be evaluated without them.

</details>

2. The system is accurate offline but stale in production. What should be added?

<details><summary>Answer</summary>

Freshness tracking, update propagation, online monitoring, and a definition of acceptable staleness.

</details>

3. A support agent can read private documents but the design only checks user permissions after generation. What is wrong?

<details><summary>Answer</summary>

Unauthorized content has already influenced the model; access control must happen before retrieval and exposure.

</details>

## 4. Short explanation prompts

1. Explain why requirements are the first design artifact.

<details><summary>Answer</summary>

They determine what quality, latency, cost, safety, and availability mean and prevent optimizing the wrong system.

</details>

2. Explain capacity arithmetic as a communication tool.

<details><summary>Answer</summary>

Simple estimates make assumptions visible, reveal bottlenecks, and give the interviewer or team a way to challenge the design.

</details>

3. Explain a tradeoff rather than naming a favorite technology.

<details><summary>Answer</summary>

State the requirement, compare options against it, name the cost or risk, and say what evidence would change the choice.

</details>

## 5. Implementation task

Design the document-based support assistant end to end. Write requirements, capacity assumptions, data flow, component choices, evaluation plan, security boundaries, cost model, and the first three operational alerts.

Do not open the rubric until you have a working attempt.

## 6. Rubric

- [ ] Requirements precede architecture.
- [ ] Traffic, context, latency, and retention assumptions are numeric.
- [ ] Every major component has a reason and fallback/tradeoff.
- [ ] Evaluation covers retrieval, answers, safety, latency, and cost.
- [ ] Permissions and rollback are enforced in the design, not left to prompting.

## 7. Scoring

- **4 — Ready:** answers are produced without notes, the implementation works, and the explanation names tradeoffs.
- **3 — Practiced:** one weak area remains; schedule a review in 7 days and redo that section.
- **2 — Learning:** revisit the module's first-pass path and retry the prediction/debugging sections tomorrow.
- **1 — Not yet:** ask for help or use the worked example, then restart with a smaller task.

