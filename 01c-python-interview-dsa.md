# 01c Python Interview Data Structures and Algorithms

**Last reviewed:** 2026-09-18 · **Volatility:** low

Part 3 of 3. `01a` covered the language, `01b` covered organizing code. This covers the patterns that appear in live coding rounds.

**Run this as a parallel track, not a block.** Two or three problems a week from week 5 onward. Cramming DSA does not work; the recognition you need is built by spaced exposure.

---

## Why this matters, and how much

**Honest framing first.** For AI engineering roles, the DSA bar is usually lower than for a general software role. You are unlikely to be asked to implement a red-black tree. You are very likely to be asked something with a hash map, a two-pointer scan, or a sliding window, and to be assessed on how you talk while writing it.

**What is actually tested** in an AI engineer screen: can you write working Python under observation, do you recognize when a data structure choice makes something quadratic, do you handle edge cases unprompted, and do you communicate while working. That last one is half the signal (`12a` section 5).

**The genuinely transferable part** is complexity intuition. Module `07`'s deduplication bug, a list membership test inside a loop, is this material in production. The pattern recognition here is what lets you see it.

---

## Prerequisites

| You need | From |
|---|---|
| Collections and their complexity | `01a` section 6 |
| Control flow idioms, `enumerate`, `zip` | `01a` section 5 |
| Functions, closures, recursion basics | `01a` section 7 |
| Generators | `01b` section 3 |
| pytest | `01b` section 7 |

---

## Skip-ahead map

| Section | Level | Skip if you can... |
|---|---|---|
| 1. Complexity, practically | [FOUNDATION] | ...spot the quadratic in a nested scan without thinking |
| 2. Hashing | [CORE] | ...convert a nested loop to a single pass with a dict |
| 3. Two pointers | [CORE] | ...say what makes a problem two-pointer-shaped |
| 4. Sliding window | [CORE] | ...write the variable-size window template from memory |
| 5. Stack and queue | [CORE] | ...recognize a monotonic stack problem |
| 6. Binary search | [CORE] | ...write it without an off-by-one |
| 7. Recursion and trees | [CORE] | ...write both DFS and BFS from memory |
| 8. Graphs | [CORE] | ...say when BFS beats DFS |
| 9. Heaps | [DEPTH] | ...say why top-k uses a min-heap |
| 10. Dynamic programming | [DEPTH] | ...identify overlapping subproblems |
| 11. Python-specific pitfalls | [CORE] | ...name three that only bite in Python |

---

## Mental model

**Almost every interview problem is "avoid recomputing something" or "avoid scanning something twice".**

Hashing trades memory for lookup time. Two pointers exploits order so you do not need nested loops. Sliding windows reuse the previous window's work. Memoization stores what you already computed. Heaps maintain a partial order so you do not sort everything.

**Where the analogy breaks down.** It makes the patterns sound interchangeable, and the skill being tested is *recognition*: noticing which structure the problem has from its statement. That is why section headings below lead with the signal rather than the technique.

---

## Core concepts

### 1. Complexity, practically [FOUNDATION]

The table from `01a` section 6, with the operations that matter in problems:

| Operation | list | dict / set | deque | heap |
|---|---|---|---|---|
| Index or key lookup | O(1) | O(1) avg | O(1) ends | n/a |
| Membership `in` | **O(n)** | **O(1) avg** | O(n) | O(n) |
| Append | O(1) amortized | O(1) | O(1) | O(log n) |
| Insert or pop at front | **O(n)** | n/a | **O(1)** | n/a |
| Pop minimum | O(n) | n/a | n/a | **O(log n)** |
| Sort | O(n log n) | n/a | n/a | n/a |

**The three that decide most problems:** `in` against a list is linear, `list.insert(0, x)` is linear, and `heapq` gives you the minimum in log time.

**Spotting quadratics**, which is what an interviewer is checking:

```python
for a in items:                    # n
    if a in seen_list:             # × n  → quadratic
        ...

for i in range(len(s)):            # n
    for j in range(i, len(s)):     # × n
        substring = s[i:j]         # × n  → cubic, and people miss this one
```

The slice is the one people miss. Building a substring inside a nested loop adds a factor.

**Amortized means averaged over many operations.** `list.append` occasionally reallocates and copies, but averaged over n appends it is O(1) each. Say "amortized" when you mean it; interviewers notice.

### 2. Hashing [CORE]

**The signal:** "have I seen this before", "count occurrences", "find a pair that sums to", "group by".

**The core move:** replace a nested loop with one pass and a dict.

```python
def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    """Indices of two numbers summing to target. One pass."""
    seen: dict[int, int] = {}                # value -> index
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return seen[complement], i
        seen[n] = i
    return None
```

The insight: instead of asking "is there another number that pairs with this one", which requires a scan, ask "have I already seen the number that would pair with this one", which is a lookup.

**The variants you will meet:**

```python
from collections import Counter, defaultdict

Counter(items).most_common(3)                 # frequency
groups = defaultdict(list)
for item in items:
    groups[key(item)].append(item)            # grouping

# Anagram grouping: the canonical form is the key
groups = defaultdict(list)
for word in words:
    groups["".join(sorted(word))].append(word)
```

**The trap:** dict keys must be hashable, so a list cannot be a key. Convert to a tuple. `01a` section 6.

### 3. Two pointers [CORE]

**The signal:** the input is sorted, or the answer involves a pair or a range, or you are comparing from both ends.

```python
def has_pair_with_sum(sorted_nums: list[int], target: int) -> bool:
    """Requires sorted input. O(n) instead of O(n²)."""
    lo, hi = 0, len(sorted_nums) - 1
    while lo < hi:
        total = sorted_nums[lo] + sorted_nums[hi]
        if total == target:
            return True
        if total < target:
            lo += 1              # need bigger, move the small end up
        else:
            hi -= 1              # need smaller, move the big end down
    return False
```

**Why it works and what it requires:** sortedness means moving a pointer changes the sum in a known direction, so you never need to backtrack. Without sortedness this pattern does not apply, and that is the first thing to check.

**The same-direction variant**, for in-place filtering:

```python
def remove_duplicates(nums: list[int]) -> int:
    """Sorted input. Returns the length of the deduplicated prefix."""
    if not nums:
        return 0
    write = 1
    for read in range(1, len(nums)):
        if nums[read] != nums[write - 1]:
            nums[write] = nums[read]
            write += 1
    return write
```

A read pointer and a write pointer. This is the pattern behind most in-place array manipulation.

### 4. Sliding window [CORE]

**The signal:** "longest", "shortest", "maximum sum" over a **contiguous** subarray or substring.

**Fixed size**, when the window length is given:

```python
def max_sum_of_k(nums: list[int], k: int) -> int:
    if k > len(nums):
        raise ValueError(f"k={k} exceeds length {len(nums)}")
    window = sum(nums[:k])
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]      # add one, drop one
        best = max(best, window)
    return best
```

The reuse is the point: each step does constant work instead of re-summing k elements.

**Variable size**, the template worth memorizing:

```python
def longest_substring_without_repeats(s: str) -> int:
    last_seen: dict[str, int] = {}
    start = 0
    best = 0
    for end, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= start:
            start = last_seen[ch] + 1        # shrink past the duplicate
        last_seen[ch] = end
        best = max(best, end - start + 1)
    return best
```

**The structure of every variable window:** expand the right edge in a loop, shrink the left edge while a condition is violated, record the answer. The `last_seen[ch] >= start` check is the subtle part; without it a character seen before the current window start would incorrectly shrink it.

### 5. Stack and queue [CORE]

**Stack signal:** matching pairs, nesting, "most recent", undo, parsing.

```python
def is_balanced(s: str) -> bool:
    pairs = {")": "(", "]": "[", "}": "{"}
    stack: list[str] = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack            # unclosed brackets remain
```

`return not stack` is the part people forget: `"((("` never fails a check and is still unbalanced.

**Monotonic stack**, for "next greater element" style problems:

```python
def next_greater(nums: list[int]) -> list[int]:
    """For each element, the next larger one to its right, or -1."""
    result = [-1] * len(nums)
    stack: list[int] = []                    # indices, values decreasing
    for i, n in enumerate(nums):
        while stack and nums[stack[-1]] < n:
            result[stack.pop()] = n
        stack.append(i)
    return result
```

Each index is pushed and popped at most once, so it is O(n) despite the nested `while`. Recognizing that is worth saying out loud.

**Queue: use `deque`, never a list.**

```python
from collections import deque

q = deque([1, 2, 3])
q.append(4)          # O(1)
q.popleft()          # O(1)   -- list.pop(0) is O(n)
```

`list.pop(0)` in a BFS loop makes it quadratic and is a common silent mistake.

### 6. Binary search [CORE]

**The signal:** sorted input, or a monotonic predicate, or "find the boundary".

**The template that avoids off-by-one errors:**

```python
def lower_bound(sorted_nums: list[int], target: int) -> int:
    """Index of the first element >= target. len(nums) if none."""
    lo, hi = 0, len(sorted_nums)             # hi is exclusive
    while lo < hi:
        mid = (lo + hi) // 2
        if sorted_nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo
```

**Use this one form for everything.** Half-open interval, `while lo < hi`, `hi = mid` not `mid - 1`. It terminates correctly and returns an insertion point, which answers "find it", "find the first one at least X" and "find the boundary" with one template.

**In real code, use the standard library:**

```python
import bisect

bisect.bisect_left(nums, x)      # == lower_bound above
bisect.insort(nums, x)           # insert maintaining order
```

**The generalization that surprises people:** binary search works on any monotonic predicate, not just sorted arrays. "Find the smallest capacity that lets you finish in D days" is a binary search over answers, with a feasibility check as the predicate. Recognizing that is a strong signal.

**Note `(lo + hi) // 2` does not overflow in Python**, since integers are arbitrary precision. In C or Java you write `lo + (hi - lo) // 2`. Mention it if asked; do not add it unprompted, since it is noise in Python.

### 7. Recursion and trees [CORE]

```python
from dataclasses import dataclass


@dataclass
class Node:
    val: int
    left: "Node | None" = None
    right: "Node | None" = None


def depth(node: Node | None) -> int:
    if node is None:              # base case first, always
        return 0
    return 1 + max(depth(node.left), depth(node.right))
```

**Every recursion: base case first, then the recursive case, then trust it.** The commonest bug is a missing or wrong base case.

**The three DFS orders**, and what each is for:

```python
def inorder(node, out):           # left, self, right  -> sorted, for a BST
    if node:
        inorder(node.left, out); out.append(node.val); inorder(node.right, out)

def preorder(node, out):          # self, left, right  -> copying, serializing
    if node:
        out.append(node.val); preorder(node.left, out); preorder(node.right, out)

def postorder(node, out):         # left, right, self  -> deleting, computing from children
    if node:
        postorder(node.left, out); postorder(node.right, out); out.append(node.val)
```

**BFS, level by level:**

```python
from collections import deque


def level_order(root: Node | None) -> list[list[int]]:
    if not root:
        return []
    levels, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):          # snapshot this level's size first
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        levels.append(level)
    return levels
```

`for _ in range(len(q))` taken before the loop is the trick that separates levels. Reading `len(q)` inside the loop would include the children you just added.

**Python's recursion limit is 1000 by default.** A deep tree or a long linked list will hit it. Say so, and convert to an iterative version with an explicit stack if depth could be large. This is a Python-specific point worth raising unprompted.

### 8. Graphs [CORE]

```python
from collections import defaultdict, deque


def build_graph(edges: list[tuple[int, int]]) -> dict[int, list[int]]:
    g = defaultdict(list)
    for a, b in edges:
        g[a].append(b)
        g[b].append(a)            # undirected
    return g


def bfs_shortest_path(graph, start, goal) -> int:
    """Fewest edges. BFS, because it explores by distance."""
    if start == goal:
        return 0
    seen = {start}
    q = deque([(start, 0)])
    while q:
        node, dist = q.popleft()
        for nxt in graph[node]:
            if nxt == goal:
                return dist + 1
            if nxt not in seen:
                seen.add(nxt)
                q.append((nxt, dist + 1))
    return -1


def dfs_iterative(graph, start) -> set:
    """Reachability. Iterative, so no recursion limit."""
    seen, stack = set(), [start]
    while stack:
        node = stack.pop()
        if node in seen:
            continue
        seen.add(node)
        stack.extend(graph[node])
    return seen
```

**BFS versus DFS**, which is the question:

| Use BFS | Use DFS |
|---|---|
| Shortest path in an unweighted graph | Reachability, connected components |
| Level-by-level processing | Cycle detection, topological sort |
| The target is likely near the start | Exploring all paths |

**BFS finds the shortest path because it explores in order of distance.** DFS can find *a* path and it will not generally be shortest. That single sentence is the answer.

**Mark nodes seen when you enqueue, not when you dequeue.** Otherwise a node reachable by several edges is enqueued multiple times, which is a correctness problem for counting and a performance problem always.

### 9. Heaps [DEPTH]

**The signal:** "top k", "k largest", "median of a stream", "merge sorted lists".

```python
import heapq


def top_k_largest(nums: list[int], k: int) -> list[int]:
    """A MIN-heap of size k. The smallest of the k largest sits on top."""
    heap: list[int] = []
    for n in nums:
        if len(heap) < k:
            heapq.heappush(heap, n)
        elif n > heap[0]:                   # bigger than the weakest kept
            heapq.heapreplace(heap, n)
    return sorted(heap, reverse=True)
```

**Why a min-heap for the k *largest***, which is the question that catches people: you need to know which of your current k is weakest, so you can evict it. A min-heap puts that on top in O(1).

O(n log k) rather than O(n log n) for sorting everything, which matters when k is small and n is large. `heapq.nlargest(k, nums)` does this for you.

**`heapq` is a min-heap only.** For a max-heap, negate the values and negate back on the way out.

**Where this appears in real work:** module `07`'s top-k retrieval is exactly this problem, and it is why `numpy.argsort` versus a partial selection matters at scale.

### 10. Dynamic programming [DEPTH]

**The signal:** overlapping subproblems plus optimal substructure. In practice: "how many ways", "minimum cost to", and a naive recursion that recomputes the same thing.

**Memoization is the easy entry**, and usually enough for an interview:

```python
import functools


@functools.cache
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

`@functools.cache` turns exponential into linear with one line. Note the `01b` section 4 caveat: arguments must be hashable, and an unbounded cache on a long-running process is a leak.

**Bottom-up**, when you want to control space:

```python
def climb_stairs(n: int) -> int:
    """Ways to climb n steps taking 1 or 2 at a time. O(1) space."""
    a, b = 1, 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b
```

**The honest scope note.** Hard DP is uncommon in AI engineer screens. Know memoization, recognize when a recursion is recomputing, and be able to write the 1-D table form. Beyond that, time spent here is time not spent on module 07.

### 11. Python-specific pitfalls [CORE]

The ones that only bite in Python, and that interviewers watch for.

| Pitfall | Consequence |
|---|---|
| `list.pop(0)` in a BFS loop | O(n) per pop makes it quadratic. Use `deque`. |
| Mutable default argument in a recursive helper | State accumulates across calls (`01a` §7) |
| Slicing inside a loop | `s[i:j]` copies, adding a factor |
| Modifying a list while iterating it | Skips elements silently (`01a` §5) |
| Shallow copy of a nested structure | The classic aliasing bug (`01a` §2) |
| Recursion limit of 1000 | Deep structures raise `RecursionError` |
| `sorted()` is stable | Useful for multi-key sorting; do not rely on it accidentally |
| `int` never overflows | Different from C or Java; say so if asked |
| `//` floors toward negative infinity | `-7 // 2 == -4`, not `-3` |
| `range()` is lazy | `range(10)[5]` works; `list(range(...))` materializes |

**Multi-key sorting**, which uses stability deliberately:

```python
items.sort(key=lambda x: x.name)              # secondary key first
items.sort(key=lambda x: x.score, reverse=True)   # primary key second
```

Or in one pass with a tuple key:

```python
items.sort(key=lambda x: (-x.score, x.name))
```

The tuple form is clearer and does not depend on stability.

---

## Worked example: recognizing the pattern

The skill being tested is recognition, so practise on the statement rather than the solution.

| Statement contains | Reach for |
|---|---|
| "have I seen", "count", "pair that sums", "group by" | Hash map |
| "sorted array" plus "pair" or "triplet" | Two pointers |
| "longest" or "shortest" plus "contiguous" or "substring" | Sliding window |
| "matching", "nested", "next greater" | Stack |
| "sorted" plus "find" or "boundary", or a monotonic predicate | Binary search |
| "shortest path", "fewest steps", "level by level" | BFS |
| "all paths", "connected", "cycle" | DFS |
| "top k", "k largest", "median of stream" | Heap |
| "how many ways", "minimum cost", and a recursion that repeats | Memoization |

**The practice that builds this:** read a problem statement, say which pattern out loud and why, then check. Do that twenty times and the recognition becomes automatic, which is worth more than having solved twenty problems.

---

## How to behave in a live coding round

From `12a` section 5, applied here.

1. **Restate the problem.** Fifteen seconds, catches misreadings.
2. **Ask about constraints.** Input size, sorted or not, duplicates allowed, what to return on empty. These change the answer and asking is assessed.
3. **State the approach before coding.** "I'll use a dict keyed by value so lookups are constant time, one pass, O(n) time and O(n) space." Then they can redirect you.
4. **Narrate while writing.** Silence is the commonest complaint.
5. **Handle edge cases unprompted.** Empty, one element, all duplicates, target absent.
6. **Test it out loud** on a small example, tracing through.
7. **State the complexity**, both time and space, without being asked.
8. **Say what you would add.** "In production I'd add type hints and a test for the empty case."

**Taking a hint.** "What if the list is very large" means the answer is complexity. Respond to it: "good point, the `in` check against a list is linear so this is quadratic, let me use a set." Ignoring a hint is worse than the original mistake.

---

## Common mistakes

| Symptom | Cause |
|---|---|
| Times out on a large input | `in` against a list, or `pop(0)`, or slicing in a loop |
| `RecursionError` | Deep structure; convert to iterative |
| Off-by-one in binary search | Use one template consistently |
| BFS returns a path that is not shortest | Marking seen on dequeue instead of enqueue |
| Wrong answer on duplicates | Constraint not clarified at the start |
| Works on the example, fails on empty input | No edge case handling |
| `TypeError: unhashable type` | A list used as a dict key |

---

## Interview angle

**1. Why is your solution O(n) rather than O(n²)?**

*Strong:* name the operation and its cost. "The nested version checks membership against a list, which scans, so n items times an n-element scan is quadratic. Using a set makes each check constant on average, so one pass over n items is linear. The cost is O(n) extra memory, which is the trade."

**2. How would you find the shortest path, and why that algorithm?**

*Strong:* BFS for an unweighted graph, because it explores in order of distance, so the first time you reach the target you have arrived by the fewest edges. DFS can find a path and will not generally find the shortest. Mark nodes seen on enqueue rather than dequeue, or nodes reachable by several edges are processed repeatedly.

**3. Why a min-heap for the k largest elements?**

*Strong:* you need to know which of your current k is the weakest so you can evict it when something better arrives, and a min-heap puts that on top in constant time. O(n log k) rather than O(n log n), which matters when k is small and n is large. Note `heapq` is min-only, so a max-heap means negating values.

**4. What is different about writing this in Python specifically?**

*Strong:* integers never overflow, so no `lo + (hi - lo) // 2`. Recursion is limited to about 1000 frames by default, so deep structures need an iterative version. `list.pop(0)` is linear, so BFS needs a `deque`. Slicing copies, so a slice inside a nested loop adds a factor. And `sorted` is stable, which is useful for multi-key sorts and a trap if you rely on it accidentally.

**5. Where does this material actually show up in your work?**

*Strong:* complexity intuition, constantly. Give the real example: deduplicating documents against an index of already-embedded ids, where a list membership test inside a loop was 2.5 billion comparisons and a set made it linear, measured at roughly 2,700x on one dataset. Top-k retrieval is a heap problem. The rest of the patterns show up rarely, and recognizing an accidentally quadratic pipeline shows up constantly.

---

## Practice tasks

**The method matters more than the problem count.**

1. **Pattern recognition drills.** Read 20 problem statements, say the pattern aloud and why, check. Do not solve them. Twenty minutes, and it builds the thing being tested.
2. **Two or three problems a week from week 5**, not a block. Rotate patterns rather than grinding one.
3. **Write each solution twice**: once however it comes out, once cleanly with type hints, edge cases and a docstring. The second version is what an interviewer sees.
4. **Narrate out loud, recorded**, for at least one problem a week. This is the half of the assessment people never practise.
5. **Re-solve from memory** a problem you solved a month ago. If you cannot, you pattern-matched rather than understood.

**The mock round:** five problems, 25 minutes each, narrated and recorded. Score yourself on: restated the problem, asked about constraints, stated the approach first, narrated throughout, handled edges unprompted, stated complexity, tested out loud.

---

## Mastery checklist

- [ ] Spot an accidentally quadratic loop without thinking about it
- [ ] Convert a nested membership scan into one pass with a dict
- [ ] Say what makes a problem two-pointer-shaped
- [ ] Write the variable-size sliding window template from memory
- [ ] Recognize a monotonic stack problem and explain why it is O(n)
- [ ] Write binary search with one consistent template, no off-by-one
- [ ] Generalize binary search to a monotonic predicate over answers
- [ ] Write DFS and BFS from memory, iterative and recursive
- [ ] Say why BFS finds shortest paths and DFS does not
- [ ] Explain why top-k largest uses a min-heap
- [ ] Use `@functools.cache` and say what it costs
- [ ] Name five Python-specific pitfalls
- [ ] Narrate a full solution aloud, ending with complexity, unprompted

Fewer than ten of thirteen means keep drilling, at two or three problems a week rather than in a block.

---

## Connections

**Backward:**

- `01a` section 6's complexity table is section 1 here, applied.
- `01a` section 5's control flow idioms are what makes these solutions readable.
- `01a` section 7's mutable default trap appears in recursive helpers.
- `01b` section 3's generators are how you write an iterative traversal lazily.
- `01b` section 4's `lru_cache` is section 10's memoization.

**Forward:**

- `07-rag-and-vector-search.md` section 5: top-k retrieval is a heap problem, and its worked example 2 is section 2's hashing lesson at production scale.
- `12a-interview-framework.md` section 5 covers the live coding round's behavior half.
- `projects/project-1-python-data-tool.md` is where the clean-code habits from the second-pass rewrite show up.

---

## Volatile claims

| Claim | Why it decays | Re-check against |
|---|---|---|
| "The DSA bar is lower for AI engineering roles" | Varies by company, and by market conditions | Your own interview experience |
| Recursion limit of 1000 | A CPython default, changeable with `sys.setrecursionlimit` | Your interpreter |

The algorithms and complexity analysis are stable and will not change.

**Next review due:** 2027-09-18, or after your first live coding round.
