# Practice Pack: 01c Python Interview DSA

Work this pack at least one day after reading the module. Write your answer before opening each solution; recognition is not retrieval.

## 1. Retrieval questions

1. What does an O(n) time bound say?

<details><summary>Answer</summary>

The work grows linearly with input size, ignoring constant factors and lower-order terms.

</details>

2. Why does a set help membership tests?

<details><summary>Answer</summary>

Hashing gives average constant-time lookup, turning repeated membership checks into a linear scan when used carefully.

</details>

3. What invariant does a sliding window maintain?

<details><summary>Answer</summary>

A property of the current contiguous range, such as containing no duplicate characters or meeting a sum constraint.

</details>

4. When is a queue the natural structure?

<details><summary>Answer</summary>

When the oldest item should be processed first, such as breadth-first search or work scheduling.

</details>

5. What must be true for binary search?

<details><summary>Answer</summary>

The search space must have an ordered, monotonic property that lets each comparison discard one side.

</details>

## 2. Prediction exercises

1. A two-pointer scan moves the left pointer only when a constraint is violated. What does that imply about total pointer moves?

<details><summary>Answer</summary>

Each pointer moves forward at most n times, so the scan is O(n), not O(n²).

</details>

2. A BFS starts at a node and marks nodes visited when enqueuing them. Why mark then rather than when dequeuing?

<details><summary>Answer</summary>

It prevents the same node from being enqueued repeatedly through different parents.

</details>

3. A min-heap stores five values and you call `heappop`. Which value leaves?

<details><summary>Answer</summary>

The smallest value, because the heap invariant keeps the minimum at the root.

</details>

## 3. Debugging scenarios

1. A sliding-window solution counts a character twice after moving the left edge. What likely failed?

<details><summary>Answer</summary>

The code moved the left edge without removing the outgoing character from the frequency state.

</details>

2. A binary search loops forever when two values remain. What should be checked?

<details><summary>Answer</summary>

The midpoint and boundary updates must strictly shrink the interval; use a consistent inclusive or half-open convention.

</details>

3. A recursive tree traversal crashes on an empty tree. What is missing?

<details><summary>Answer</summary>

The base case for a null node.

</details>

## 4. Short explanation prompts

1. Explain why recognizing a pattern matters more than memorizing a solution.

<details><summary>Answer</summary>

The pattern identifies the invariant and data structure; the same reasoning transfers to new inputs and prevents brittle recall.

</details>

2. Explain the difference between BFS and DFS.

<details><summary>Answer</summary>

BFS explores by distance layers using a queue; DFS follows one branch deeply using recursion or a stack. Their memory and shortest-path properties differ.

</details>

3. Explain how you would state complexity in an interview.

<details><summary>Answer</summary>

Name the dominant input size, the time bound, the extra space, and the assumption that makes the bound true.

</details>

## 5. Implementation task

Implement the longest substring without repeating characters. First write the brute-force version, then an O(n) sliding-window version. Include empty input, one character, repeated characters, and Unicode text in the tests.

Do not open the rubric until you have a working attempt.

## 6. Rubric

- [ ] The invariant is written before the code.
- [ ] The optimized version is O(n) time.
- [ ] The window state is updated when either pointer moves.
- [ ] Tests cover the stated edge cases.
- [ ] The final explanation includes time and space complexity.

## 7. Scoring

- **4 — Ready:** answers are produced without notes, the implementation works, and the explanation names tradeoffs.
- **3 — Practiced:** one weak area remains; schedule a review in 7 days and redo that section.
- **2 — Learning:** revisit the module's first-pass path and retry the prediction/debugging sections tomorrow.
- **1 — Not yet:** ask for help or use the worked example, then restart with a smaller task.

