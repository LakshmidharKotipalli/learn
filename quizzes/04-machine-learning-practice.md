# Practice Pack: 04 Classical Machine Learning

Work this pack at least one day after reading the module. Write your answer before opening each solution; recognition is not retrieval.

## 1. Retrieval questions

1. What is leakage?

<details><summary>Answer</summary>

Information from outside the allowed prediction-time boundary influences training or evaluation.

</details>

2. Why choose a threshold separately from a model?

<details><summary>Answer</summary>

The model estimates a score; the threshold converts it into an action with a business cost tradeoff.

</details>

3. What does calibration measure?

<details><summary>Answer</summary>

Whether predicted probabilities correspond to observed frequencies.

</details>

4. When is PR-AUC more informative than ROC-AUC?

<details><summary>Answer</summary>

Often when the positive class is rare and precision among positive predictions matters.

</details>

5. What is drift?

<details><summary>Answer</summary>

A change in input, relationship, or outcome distribution that can make previous model behavior unreliable.

</details>

## 2. Prediction exercises

1. A feature is selected using the full dataset before cross-validation. Why can the score be optimistic?

<details><summary>Answer</summary>

The validation folds influenced feature selection, so information leaked across the evaluation boundary.

</details>

2. A classifier keeps the same ranking but its positive class becomes more costly. What can change without retraining?

<details><summary>Answer</summary>

The decision threshold, because the action costs changed even if the score ordering did not.

</details>

3. A model has good accuracy on a 1% positive dataset but catches no positives. What does accuracy hide?

<details><summary>Answer</summary>

The class imbalance; predicting the majority class can look accurate while having zero recall for the important class.

</details>

## 3. Debugging scenarios

1. Offline AUC is high but production precision collapses. What should you inspect?

<details><summary>Answer</summary>

Population shift, leakage, threshold selection, label delay, and whether production prevalence differs from evaluation.

</details>

2. Training and validation loss look identical and high. What is one likely cause?

<details><summary>Answer</summary>

Underfitting, insufficient capacity, poor features, or an optimization/setup problem.

</details>

3. A model score is well calibrated overall but not for a key customer segment. What is missing?

<details><summary>Answer</summary>

Segment-level calibration analysis and possibly segment-specific handling or more representative data.

</details>

## 4. Short explanation prompts

1. Explain why the metric follows the decision.

<details><summary>Answer</summary>

A metric is useful only if improving it improves the decision outcome; the same model can need different metrics for different costs.

</details>

2. Explain the bias-variance tradeoff.

<details><summary>Answer</summary>

A model that is too simple misses structure; one that is too flexible fits noise. Generalization balances those errors.

</details>

3. Explain why a pipeline prevents leakage.

<details><summary>Answer</summary>

Transformations are fitted inside each training fold and then applied to validation data, so validation information cannot shape the transform.

</details>

## 5. Implementation task

Train a small classifier with an explicit preprocessing pipeline. Compare a deliberately leaky evaluation with an honest cross-validated evaluation, choose a threshold for a stated cost ratio, and report calibration.

Do not open the rubric until you have a working attempt.

## 6. Rubric

- [ ] The prediction-time boundary is written down.
- [ ] Preprocessing is inside the evaluation pipeline.
- [ ] The threshold is tied to costs, not a default of 0.5.
- [ ] The report separates ranking, decision, and calibration metrics.
- [ ] At least one drift signal is named.

## 7. Scoring

- **4 — Ready:** answers are produced without notes, the implementation works, and the explanation names tradeoffs.
- **3 — Practiced:** one weak area remains; schedule a review in 7 days and redo that section.
- **2 — Learning:** revisit the module's first-pass path and retry the prediction/debugging sections tomorrow.
- **1 — Not yet:** ask for help or use the worked example, then restart with a smaller task.

