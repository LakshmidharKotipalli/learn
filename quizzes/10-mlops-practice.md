# Practice Pack: 10 MLOps and Deployment

Work this pack at least one day after reading the module. Write your answer before opening each solution; recognition is not retrieval.

## 1. Retrieval questions

1. What must be versioned for reproducibility?

<details><summary>Answer</summary>

Code, dependencies, prompts, models, data/evaluation sets, configuration, and relevant environment details.

</details>

2. What is the difference between a log, metric, and trace?

<details><summary>Answer</summary>

A log is an event record, a metric is a numeric time series, and a trace follows one request across components.

</details>

3. What is an evaluation gate?

<details><summary>Answer</summary>

A release check that blocks deployment when required quality, safety, or regression criteria fail.

</details>

4. When is rollback safer than a hot fix?

<details><summary>Answer</summary>

When the failure is understood enough to revert to a known-good artifact faster than safely changing the live system.

</details>

5. What cost drivers matter for an LLM service?

<details><summary>Answer</summary>

Tokens, model/runtime compute, retrieval/storage, network, concurrency, retries, and human review or operational overhead.

</details>

## 2. Prediction exercises

1. A prompt changes but the model image does not. Can the service behavior change?

<details><summary>Answer</summary>

Yes. Prompts are part of the effective artifact and must be versioned and evaluated.

</details>

2. Error rate is flat but latency and token usage rise. What can a dashboard miss?

<details><summary>Answer</summary>

Quality and cost regressions that do not appear as request failures.

</details>

3. A deployment passes a generic test suite but fails the support evaluation set. Should it ship?

<details><summary>Answer</summary>

No, if the support evaluation is a required release gate; generic tests are not sufficient evidence.

</details>

## 3. Debugging scenarios

1. A new release improves answer quality but doubles cost. What should happen?

<details><summary>Answer</summary>

Compare quality/cost tradeoffs against the stated budget, inspect token and retry changes, and decide with evidence rather than treating quality alone as success.

</details>

2. Only one region shows stale retrieval results after deploy. What should you inspect?

<details><summary>Answer</summary>

Data/index version, cache invalidation, rollout skew, and regional configuration.

</details>

3. A rollback restores code but not the previous evaluation set. What reproducibility gap remains?

<details><summary>Answer</summary>

The release did not pin all dependent artifacts; rollback must restore the complete behavior bundle.

</details>

## 4. Short explanation prompts

1. Explain why observability must include AI-specific signals.

<details><summary>Answer</summary>

HTTP success does not mean a grounded or useful answer; retrieval quality, citations, refusals, drift, token use, and human feedback expose different failures.

</details>

2. Explain a safe deployment sequence.

<details><summary>Answer</summary>

Validate artifacts, run tests and evaluations, canary or shadow traffic, monitor predefined signals, then expand or roll back.

</details>

3. Explain why rollback is a product feature.

<details><summary>Answer</summary>

Fast recovery limits user harm and buys time to investigate without making every incident a risky live experiment.

</details>

## 5. Implementation task

Create a deployment checklist for the support assistant covering artifact versions, pre-deploy evaluation, canary signals, alerts, rollback, secrets, and cost budgets. Add one simulated regression and document the response.

Do not open the rubric until you have a working attempt.

## 6. Rubric

- [ ] The checklist names all behavior-changing artifacts.
- [ ] Quality and safety gates are explicit.
- [ ] Canary signals include latency, cost, and answer quality.
- [ ] Rollback points to a known-good complete artifact set.
- [ ] The simulated incident has an owner and decision threshold.

## 7. Scoring

- **4 — Ready:** answers are produced without notes, the implementation works, and the explanation names tradeoffs.
- **3 — Practiced:** one weak area remains; schedule a review in 7 days and redo that section.
- **2 — Learning:** revisit the module's first-pass path and retry the prediction/debugging sections tomorrow.
- **1 — Not yet:** ask for help or use the worked example, then restart with a smaller task.

