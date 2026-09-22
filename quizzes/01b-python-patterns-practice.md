# Practice Pack: 01b Python Patterns and OOP

Work this pack at least one day after reading the module. Write your answer before opening each solution; recognition is not retrieval.

## 1. Retrieval questions

1. When is composition preferable to inheritance?

<details><summary>Answer</summary>

When the object uses collaborators rather than being a specialized subtype. Composition keeps the relationship replaceable and usually limits coupling.

</details>

2. What does a generator preserve between calls?

<details><summary>Answer</summary>

Its execution state, including local variables and the next instruction, until the next `next()` or iteration step.

</details>

3. What must a decorator return?

<details><summary>Answer</summary>

A callable replacement for the decorated object, unless it is deliberately being used only for registration.

</details>

4. What is the purpose of a type hint?

<details><summary>Answer</summary>

It communicates the intended contract to readers and static tools; normal Python does not enforce it at runtime.

</details>

5. What makes a test independent?

<details><summary>Answer</summary>

It controls its own inputs and state, makes one clear assertion about behavior, and does not depend on test order or external mutable state.

</details>

## 2. Prediction exercises

1. A generator contains `yield 1`, then `yield 2`. How many times does its body execute when you call the function but do not iterate?

<details><summary>Answer</summary>

The function body does not run yet; calling it creates a generator object. The body runs as iteration requests values.

</details>

2. A decorator wrapper calls the wrapped function but forgets `return result`. What does the caller receive?

<details><summary>Answer</summary>

`None`, even though the wrapped function computed a value.

</details>

3. A class stores a retriever instance and a formatter instance. Which relationship is that?

<details><summary>Answer</summary>

Composition: the class has collaborators rather than inheriting from them.

</details>

## 3. Debugging scenarios

1. A retry decorator repeats a payment request after a timeout and charges twice. What design property is missing?

<details><summary>Answer</summary>

Idempotency or an idempotency key. Retrying a side effect without making duplicate execution safe is dangerous.

</details>

2. A context manager opens a file but an exception leaves the file open. Where should cleanup live?

<details><summary>Answer</summary>

In the context manager's exit/finally path so cleanup runs for both success and failure.

</details>

3. A test passes alone but fails after another test mutates a module-level list. What is the likely cause?

<details><summary>Answer</summary>

Shared mutable test state. Create fresh fixtures or reset the state for each test.

</details>

## 4. Short explanation prompts

1. Explain why validation belongs at an external API boundary.

<details><summary>Answer</summary>

Untrusted data should become a typed, explicit internal value once; downstream code can then rely on the contract instead of repeating defensive checks.

</details>

2. Explain why retries need backoff.

<details><summary>Answer</summary>

Immediate retries amplify load and synchronize callers during an outage. Backoff spreads attempts and gives a transient dependency time to recover.

</details>

3. Explain the difference between a protocol and an implementation.

<details><summary>Answer</summary>

A protocol states the behavior a caller may rely on; an implementation supplies the concrete behavior. Depending on the protocol makes replacement and testing easier.

</details>

## 5. Implementation task

Refactor a small function that fetches documents, validates the response, and formats the result into a typed service with one injected retriever, one Pydantic boundary model, a retry policy, and tests for success, malformed data, and a transient failure.

Do not open the rubric until you have a working attempt.

## 6. Rubric

- [ ] The service has one clear public contract.
- [ ] The retriever can be replaced by a fake in tests.
- [ ] Malformed input fails with a useful error.
- [ ] Retries are bounded and do not retry validation errors.
- [ ] Tests cover behavior rather than implementation details.

## 7. Scoring

- **4 — Ready:** answers are produced without notes, the implementation works, and the explanation names tradeoffs.
- **3 — Practiced:** one weak area remains; schedule a review in 7 days and redo that section.
- **2 — Learning:** revisit the module's first-pass path and retry the prediction/debugging sections tomorrow.
- **1 — Not yet:** ask for help or use the worked example, then restart with a smaller task.

