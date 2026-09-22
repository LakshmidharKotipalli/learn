# Practice Pack: 09 Local LLM Inference

Work this pack at least one day after reading the module. Write your answer before opening each solution; recognition is not retrieval.

## 1. Retrieval questions

1. What contributes to a local model's memory footprint?

<details><summary>Answer</summary>

Weights, runtime overhead, activations, the key–value cache, context, and concurrency buffers.

</details>

2. What does quantization trade?

<details><summary>Answer</summary>

Lower memory and often higher throughput for some quality, accuracy, or compatibility cost.

</details>

3. What is time to first token (TTFT)?

<details><summary>Answer</summary>

The time from request start until the first generated token is available.

</details>

4. What is tokens-per-second useful for?

<details><summary>Answer</summary>

Steady-state generation throughput, not the initial wait or total user-perceived latency by itself.

</details>

5. Why benchmark a fixed workload?

<details><summary>Answer</summary>

Changing prompt length, output length, concurrency, or sampling makes comparisons uninterpretable.

</details>

## 2. Prediction exercises

1. A model fits before adding a long context. What component may push it over the limit?

<details><summary>Answer</summary>

The key–value cache and associated runtime/context buffers.

</details>

2. A quantized model uses less memory but answers policy questions worse. What should you compare next?

<details><summary>Answer</summary>

Quality on the target evaluation set, not only memory or speed; the best quantization depends on the task.

</details>

3. Two runtimes report different tokens-per-second values. What must be normalized?

<details><summary>Answer</summary>

Model, quantization, prompt/output lengths, hardware, batch/concurrency, and measurement method.

</details>

## 3. Debugging scenarios

1. The process is killed during long prompts despite enough weight memory. What should you inspect?

<details><summary>Answer</summary>

Key–value cache growth, context settings, runtime overhead, and system memory pressure.

</details>

2. TTFT is acceptable but generation is too slow. Which phase or resource is likely limiting?

<details><summary>Answer</summary>

Decode throughput, memory bandwidth, batching, or token generation efficiency rather than prompt prefill.

</details>

3. A benchmark improves after changing prompt length. Is that a valid runtime win?

<details><summary>Answer</summary>

Not by itself; the workload changed, so the comparison is not controlled.

</details>

## 4. Short explanation prompts

1. Explain why memory arithmetic comes before runtime choice.

<details><summary>Answer</summary>

A runtime cannot make a configuration fit if weights, cache, and overhead exceed available memory; feasibility constrains the choice first.

</details>

2. Explain TTFT versus steady-state speed.

<details><summary>Answer</summary>

TTFT affects responsiveness to the first result; steady-state speed affects how quickly the rest of the answer arrives. Users experience both.

</details>

3. Explain why local inference is not automatically cheaper.

<details><summary>Answer</summary>

Hardware, electricity, engineering time, utilization, maintenance, and quality losses all belong in the comparison.

</details>

## 5. Implementation task

Choose a local configuration for the support assistant on a stated machine. Calculate the weight and context budget, benchmark two quantizations with fixed prompts, and report TTFT, generation speed, memory, and answer quality.

Do not open the rubric until you have a working attempt.

## 6. Rubric

- [ ] Hardware and workload assumptions are stated.
- [ ] The memory calculation includes cache and overhead.
- [ ] The benchmark is reproducible and controls prompt/output length.
- [ ] Quality is measured on the target task.
- [ ] The recommendation names what would change the decision.

## 7. Scoring

- **4 — Ready:** answers are produced without notes, the implementation works, and the explanation names tradeoffs.
- **3 — Practiced:** one weak area remains; schedule a review in 7 days and redo that section.
- **2 — Learning:** revisit the module's first-pass path and retry the prediction/debugging sections tomorrow.
- **1 — Not yet:** ask for help or use the worked example, then restart with a smaller task.

