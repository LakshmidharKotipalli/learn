# Practice Pack: 02 Software Engineering Foundations

Work this pack at least one day after reading the module. Write your answer before opening each solution; recognition is not retrieval.

## 1. Retrieval questions

1. What does a Git commit represent?

<details><summary>Answer</summary>

A snapshot of a tree with parent commit references and metadata; branches are movable names pointing to commits.

</details>

2. What is the purpose of a unit test?

<details><summary>Answer</summary>

To isolate and verify a small behavior quickly and deterministically.

</details>

3. What is CI supposed to catch?

<details><summary>Answer</summary>

A reproducible integration or quality failure before it reaches the shared or deployable branch.

</details>

4. What is the difference between a 4xx and 5xx response?

<details><summary>Answer</summary>

4xx indicates a client/request problem; 5xx indicates the server failed to fulfill a valid request or encountered an internal error.

</details>

5. Why use concurrency for I/O-bound work?

<details><summary>Answer</summary>

While one operation waits on I/O, another can make progress, improving utilization and throughput.

</details>

## 2. Prediction exercises

1. You commit on a branch, then create another branch from that commit. What do both branch names initially identify?

<details><summary>Answer</summary>

The same commit; later commits move only the branch name that receives them.

</details>

2. A test makes two HTTP calls sequentially, each taking one second. What is the lower-bound waiting time before considering concurrency overhead?

<details><summary>Answer</summary>

About two seconds sequentially; independent concurrent calls can approach one second plus overhead.

</details>

3. A CI job passes locally but fails because an environment variable is absent. Is the code necessarily wrong?

<details><summary>Answer</summary>

Not necessarily. The environment contract is incomplete or inconsistent; reproduce it and make the dependency explicit.

</details>

## 3. Debugging scenarios

1. A merge conflict is resolved, but the test suite now fails. What should happen next?

<details><summary>Answer</summary>

Treat the merge as a new combined change: inspect the conflict resolution, run focused tests, then the full suite.

</details>

2. An API client retries every 500 response forever. What is missing?

<details><summary>Answer</summary>

A bounded retry policy with backoff, a timeout, and a terminal failure path.

</details>

3. A flaky test fails only when the suite runs in parallel. What should you inspect first?

<details><summary>Answer</summary>

Shared mutable state, ordering assumptions, time, randomness, and external resources.

</details>

## 4. Short explanation prompts

1. Explain why debugging should start from evidence.

<details><summary>Answer</summary>

A failing test, trace, or minimal reproduction narrows the search space; random edits change multiple variables and destroy information.

</details>

2. Explain the difference between a timeout and a retry.

<details><summary>Answer</summary>

A timeout bounds one attempt. A retry starts another attempt under a policy; retries without timeouts can hang and retries without bounds can amplify failure.

</details>

3. Explain why code review is a reliability mechanism.

<details><summary>Answer</summary>

A second reader checks assumptions, edge cases, tests, and maintainability before the change becomes shared behavior.

</details>

## 5. Implementation task

Create a tiny repository workflow for the support assistant: add a tested function, a focused unit test, a lint/type-check command, and a CI job that runs them. Document how to reproduce one deliberate failure and recover from it.

Do not open the rubric until you have a working attempt.

## 6. Rubric

- [ ] The workflow runs from a clean checkout.
- [ ] The test fails for the intended bad case.
- [ ] CI uses the same commands documented locally.
- [ ] Failure output points to an actionable cause.
- [ ] The Git history separates the behavior change from the workflow change.

## 7. Scoring

- **4 — Ready:** answers are produced without notes, the implementation works, and the explanation names tradeoffs.
- **3 — Practiced:** one weak area remains; schedule a review in 7 days and redo that section.
- **2 — Learning:** revisit the module's first-pass path and retry the prediction/debugging sections tomorrow.
- **1 — Not yet:** ask for help or use the worked example, then restart with a smaller task.

