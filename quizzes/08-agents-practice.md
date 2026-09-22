# Practice Pack: 08 Agents, Tools, and Model Context Protocol

Work this pack at least one day after reading the module. Write your answer before opening each solution; recognition is not retrieval.

## 1. Retrieval questions

1. When should a workflow replace an agent?

<details><summary>Answer</summary>

When the steps and transitions are known and uncertainty does not justify dynamic planning.

</details>

2. What belongs in a tool schema?

<details><summary>Answer</summary>

The name, purpose, typed inputs, constraints, safe failure behavior, and authorization-relevant fields.

</details>

3. What stops an agent loop?

<details><summary>Answer</summary>

A successful final state, explicit termination condition, budget/step limit, timeout, or human escalation.

</details>

4. Why is idempotency important for tools?

<details><summary>Answer</summary>

A retry should not repeat an irreversible side effect such as sending or charging twice.

</details>

5. What is the Model Context Protocol (MCP) boundary?

<details><summary>Answer</summary>

A standard way for hosts/clients and servers to expose context or tools, still requiring explicit trust and permission controls.

</details>

## 2. Prediction exercises

1. A tool call times out after the side effect may have completed. Is an automatic retry always safe?

<details><summary>Answer</summary>

No. The client needs an idempotency key or a read-after-timeout check before retrying.

</details>

2. An agent has no maximum step count. What failure mode becomes possible?

<details><summary>Answer</summary>

An unbounded loop, cost explosion, or repeated side effects.

</details>

3. A deterministic three-step process is implemented as an agent. What is the likely cost?

<details><summary>Answer</summary>

More latency, variability, and failure surface without adding useful flexibility.

</details>

## 3. Debugging scenarios

1. The agent keeps calling a search tool after receiving the needed answer. What should you inspect?

<details><summary>Answer</summary>

The stop condition, state update, tool result contract, and whether the final-answer transition is explicit.

</details>

2. A tool accepts `account_id` from the model and returns another user's data. What boundary failed?

<details><summary>Answer</summary>

Authorization was inferred from model output rather than enforced by the application and authenticated user context.

</details>

3. An evaluator marks a trajectory successful because the final text sounds good, but the agent used an unsafe tool. What is missing?

<details><summary>Answer</summary>

Trajectory-level checks for tool choice, arguments, permissions, and side effects, not only final-answer quality.

</details>

## 4. Short explanation prompts

1. Explain the difference between an agent and a workflow.

<details><summary>Answer</summary>

A workflow fixes the control flow; an agent selects actions dynamically under constraints. Use the latter only where the uncertainty is valuable.

</details>

2. Explain why tool output is untrusted input.

<details><summary>Answer</summary>

It may contain attacker-controlled text or misleading data, so the model must not gain new authority merely by reading it.

</details>

3. Explain human-in-the-loop as a system boundary.

<details><summary>Answer</summary>

A person should approve actions whose impact or uncertainty exceeds the automated system's safe operating envelope.

</details>

## 5. Implementation task

Design a support escalation assistant with one read-only lookup tool and one human-approved write tool. Implement a bounded loop, schema validation, idempotency, and trajectory checks for unauthorized or unnecessary actions.

Do not open the rubric until you have a working attempt.

## 6. Rubric

- [ ] The deterministic path is not delegated to the model.
- [ ] Tool inputs are validated and authorization is application-enforced.
- [ ] The loop has a step and time budget.
- [ ] Write actions require explicit approval.
- [ ] Evaluation checks the trajectory as well as the final answer.

## 7. Scoring

- **4 — Ready:** answers are produced without notes, the implementation works, and the explanation names tradeoffs.
- **3 — Practiced:** one weak area remains; schedule a review in 7 days and redo that section.
- **2 — Learning:** revisit the module's first-pass path and retry the prediction/debugging sections tomorrow.
- **1 — Not yet:** ask for help or use the worked example, then restart with a smaller task.

