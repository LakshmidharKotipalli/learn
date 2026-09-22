# Practice Pack: 06 Transformers and LLMs

Work this pack at least one day after reading the module. Write your answer before opening each solution; recognition is not retrieval.

## 1. Retrieval questions

1. What does tokenization determine?

<details><summary>Answer</summary>

The sequence of integer inputs, which affects context length, cost, and what patterns the model can represent directly.

</details>

2. What do Q, K, and V do in attention?

<details><summary>Answer</summary>

Queries express what a position seeks, keys describe what positions offer, and values carry the information mixed into the output.

</details>

3. What does causal masking prevent?

<details><summary>Answer</summary>

A token from attending to future tokens during autoregressive training or generation.

</details>

4. What does the key–value cache save?

<details><summary>Answer</summary>

Previously computed keys and values so each new token need not recompute the whole prefix.

</details>

5. Why is hallucination not solved by temperature alone?

<details><summary>Answer</summary>

Sampling changes output randomness; it does not supply missing evidence or enforce truth.

</details>

## 2. Prediction exercises

1. If the context doubles and the key–value cache scales with tokens, what happens to cache memory?

<details><summary>Answer</summary>

It roughly doubles, holding the other dimensions constant.

</details>

2. If a future token is not masked during training, what shortcut can the model learn?

<details><summary>Answer</summary>

It can look at the answer token itself or later tokens, producing an unrealistically easy training signal.

</details>

3. If top-p is reduced, what general behavior should you expect?

<details><summary>Answer</summary>

Sampling is restricted to a smaller probability mass, often reducing diversity but not guaranteeing factuality.

</details>

## 3. Debugging scenarios

1. Latency rises sharply only for long prompts. What should you inspect first?

<details><summary>Answer</summary>

Prefill work, context length, key–value cache memory/pressure, batching, and truncation behavior.

</details>

2. The model produces valid JSON that violates the requested schema. What boundary is missing?

<details><summary>Answer</summary>

Schema validation and a repair/retry or constrained-decoding strategy at the structured-output boundary.

</details>

3. A prompt injection in retrieved text causes a tool call. What design assumption failed?

<details><summary>Answer</summary>

Retrieved content was treated as trusted instructions rather than untrusted data, and the tool boundary lacked authorization controls.

</details>

## 4. Short explanation prompts

1. Explain attention as information routing.

<details><summary>Answer</summary>

Each position scores which other positions matter, normalizes those scores, and blends their value vectors into a context-sensitive representation.

</details>

2. Explain prefill versus decode.

<details><summary>Answer</summary>

Prefill processes the prompt and builds the cache; decode generates one token at a time using the cached prefix.

</details>

3. Explain why evaluation must match the task.

<details><summary>Answer</summary>

A general benchmark measures a different distribution and objective; a production evaluation must represent the decisions, users, and failure costs that matter.

</details>

## 5. Implementation task

Implement the three-token attention calculation from the module with NumPy. Print the scores, masked weights, and output. Add one test proving future positions receive zero weight under a causal mask.

Do not open the rubric until you have a working attempt.

## 6. Rubric

- [ ] The scaling factor is applied before softmax.
- [ ] The mask is applied before softmax.
- [ ] Each attention row sums to one.
- [ ] The test checks the causal property directly.
- [ ] The output is compared with a hand-checked result.

## 7. Scoring

- **4 — Ready:** answers are produced without notes, the implementation works, and the explanation names tradeoffs.
- **3 — Practiced:** one weak area remains; schedule a review in 7 days and redo that section.
- **2 — Learning:** revisit the module's first-pass path and retry the prediction/debugging sections tomorrow.
- **1 — Not yet:** ask for help or use the worked example, then restart with a smaller task.

