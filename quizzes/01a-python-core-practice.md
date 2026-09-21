# Practice Pack: 01a Python Core

**Last reviewed:** 2026-09-18 · **Volatility:** low

Active recall for `01a-python-core.md`. Do not read this alongside the module. Work the module first, wait at least a day, then come here.

**How to use it.** Answer before revealing. An answer you recognize is not an answer you can produce, and recognition is what fails you in an interview. Write your answers down for the short-answer and debugging sections; "I knew that" is unreliable self-report.

Every answer in this pack was executed on Python 3.11 before being written down.

---

## Contents

1. [Flashcards (40)](#1-flashcards)
2. [Multiple choice (20)](#2-multiple-choice)
3. [Short answer (15)](#3-short-answer)
4. [Debugging scenarios (10)](#4-debugging-scenarios)
5. [Interview questions (5)](#5-interview-questions)
6. [Implementation exercises (3)](#6-implementation-exercises)
7. [Solutions to the module's practice tasks](#7-solutions-to-the-modules-practice-tasks)
8. [Scoring guide](#8-scoring-guide)
9. [Anki export](#9-anki-export)

---

## 1. Flashcards

### Objects and identity

**Q1.** `a = [1,2]; b = a; b.append(3)`. What is `a`, and why?

<details><summary>Answer</summary>

`[1, 2, 3]`. Assignment binds a name to an object; it does not copy. There is one list with two names, so mutating through either is visible through both.
</details>

**Q2.** When is `is` the correct operator?

<details><summary>Answer</summary>

Only for `None`, `True`, `False`. Everywhere else `==`. `is` compares identity, and identity for non-singletons depends on interning and constant folding, both implementation details.
</details>

**Q3.** Why does `int("256") is 256` return `True` but `int("257") is 257` return `False`?

<details><summary>Answer</summary>

CPython pre-creates integer objects from -5 to 256 and reuses them. 257 is constructed fresh each time, so the two objects differ. Both comparisons with `==` are `True`.
</details>

**Q4.** Why does the same comparison written as `x = 257; y = 257; x is y` return `True` in a script?

<details><summary>Answer</summary>

The compiler folds identical constants within one code block into a single object. Typed as separate REPL lines, each compiles separately and you get `False`. The instability across contexts is the reason never to use `is` here.
</details>

**Q5.** Name every falsy built-in value.

<details><summary>Answer</summary>

`False`, `None`, `0`, `0.0`, `""`, `[]`, `{}`, `set()`, `()`. Everything else is truthy, including `"0"`, `"False"`, `[0]` and `[[]]`.
</details>

**Q6.** Why is `if not threshold:` a bug when `threshold` is a number?

<details><summary>Answer</summary>

`not 0` is `True`, so a caller deliberately passing `0` gets the default-substitution branch. Use `if threshold is None:` when you mean "was not provided".
</details>

**Q7.** `t = (1, [2, 3]); t[1].append(4)`. Does this raise?

<details><summary>Answer</summary>

No. `t` becomes `(1, [2, 3, 4])`. The tuple still references the same two objects; one of them mutated. The tuple is immutable in its bindings, not in its contents.
</details>

**Q8.** Why can `(1, [2])` not be a dictionary key?

<details><summary>Answer</summary>

Hashing a tuple hashes its elements, and a list is unhashable. Raises `TypeError: unhashable type: 'list'`.
</details>

**Q9.** What does `d.copy()` copy?

<details><summary>Answer</summary>

One level. You get a new dict referencing the same value objects. Mutating a nested list through the copy changes the original.
</details>

**Q10.** Cheapest way to shallow-copy a list?

<details><summary>Answer</summary>

`items[:]`, or `list(items)`. Both new lists with the same element references.
</details>

### Types and strings

**Q11.** What does "strongly typed but dynamically typed" mean for Python?

<details><summary>Answer</summary>

Dynamic: a name can hold any type and the type is checked at use. Strong: no silent conversion between unrelated types, so `"3" + 4` raises `TypeError` rather than producing `"34"`.
</details>

**Q12.** `float("nan") == float("nan")`?

<details><summary>Answer</summary>

`False`. NaN is not equal to anything including itself. Detect with `math.isnan(x)` or `x != x`.
</details>

**Q13.** Why does `int("42.0")` raise?

<details><summary>Answer</summary>

`int()` on a string parses an integer literal, and `"42.0"` is not one. `int(float("42.0"))` works, and truncates rather than rounding.
</details>

**Q14.** `len("café")` versus `len("café".encode("utf-8"))`?

<details><summary>Answer</summary>

4 and 5. `str` counts characters; `bytes` counts bytes, and `é` is two bytes in UTF-8.
</details>

**Q15.** Why is `out += chunk` in a loop quadratic?

<details><summary>Answer</summary>

Strings are immutable, so each `+=` allocates a new string and copies everything so far. `"".join(chunks)` is linear.
</details>

**Q16.** What does `f"{tokens=}"` produce?

<details><summary>Answer</summary>

`tokens=1432`: the expression text and its value. The fastest debugging tool in the language.
</details>

**Q17.** When do you need `.encode()`?

<details><summary>Answer</summary>

When something requires bytes rather than text: writing to a binary file, sending over a socket, hashing. `hashlib.sha256` takes bytes, not `str`.
</details>

### Collections

**Q18.** Why is `x in my_set` O(1) but `x in my_list` O(n)?

<details><summary>Answer</summary>

A set hashes the value to a bucket and checks only that bucket. A list has no structure to exploit and must scan. Average case; adversarial collisions degrade it.
</details>

**Q19.** When is a set the wrong choice despite being faster?

<details><summary>Answer</summary>

When you need order, duplicates or indexing; when elements are unhashable; or when the collection is tiny and built once, so constructing the set costs more than the scans it saves.
</details>

**Q20.** `.get(key)` versus `[key]`. How do you choose?

<details><summary>Answer</summary>

`[key]` when a missing key means the program is wrong and should stop. `.get(key, default)` when absence is expected. `.get()` everywhere hides bugs; `[]` everywhere crashes on ordinary input.
</details>

**Q21.** What does `"x" in my_dict` check?

<details><summary>Answer</summary>

Keys only. For values, `in my_dict.values()`, which is O(n).
</details>

**Q22.** What is `defaultdict(list)` for?

<details><summary>Answer</summary>

Grouping without checking whether the key exists. `by_source[key].append(item)` creates the list on first access.
</details>

**Q23.** `items[::-1]` and `items[::2]`?

<details><summary>Answer</summary>

Reversed, and every second element. Both return new lists.
</details>

**Q24.** When is a comprehension the wrong tool?

<details><summary>Answer</summary>

When it needs more than one loop and one condition, when the expression is long, or when the body has side effects. At that point a plain loop is clearer, which is the only criterion that matters.
</details>

**Q25.** A pipeline is slow with 50,000 ids in `already_indexed`. First thing to check?

<details><summary>Answer</summary>

Whether `already_indexed` is a list being tested with `in` inside a loop. Converting to a set once makes each lookup constant.
</details>

### Control flow

**Q26.** Rewrite `for i in range(len(xs)): print(xs[i])` idiomatically.

<details><summary>Answer</summary>

`for x in xs: print(x)`. If you need the index, `for i, x in enumerate(xs)`.
</details>

**Q27.** What does `enumerate(lines, start=1)` give you and why bother?

<details><summary>Answer</summary>

Index and value with counting from 1, so reported line numbers match a text editor. The difference between a warning you can act on and one you have to count lines for.
</details>

**Q28.** What does `zip(a, b, strict=True)` add?

<details><summary>Answer</summary>

Raises `ValueError` on length mismatch instead of silently stopping at the shorter. Use it whenever lengths should match, which in evaluation code is always.
</details>

**Q29.** When does a `for ... else` block run?

<details><summary>Answer</summary>

Only if the loop completed without `break`. Replaces the `found = False` flag pattern.
</details>

**Q30.** Idiomatic "first match or None"?

<details><summary>Answer</summary>

`next((x for x in items if pred(x)), None)`. Without the second argument it raises `StopIteration`.
</details>

**Q31.** What goes wrong removing items from a list while iterating it?

<details><summary>Answer</summary>

Removal shifts later elements down while the loop position advances, so elements are skipped. No exception for a list. Dicts and sets raise `RuntimeError: dictionary changed size during iteration`. Build a new list instead.
</details>

### Functions

**Q32.** `def f(x, acc=[]): acc.append(x); return acc`. Output of `f(1)` then `f(2)`?

<details><summary>Answer</summary>

`[1]` then `[1, 2]`. The default is evaluated once when `def` executes, so all calls share one list. Fix with `acc=None` and create inside.
</details>

**Q33.** What does `*` do in `def f(a, b, *, verbose=False)`?

<details><summary>Answer</summary>

Makes everything after it keyword-only. `f(1, 2, True)` becomes an error; you must write `verbose=True`. Worth doing for every boolean parameter, since `f(1, 2, True)` is unreadable at the call site.
</details>

**Q34.** Why does `count += 1` inside a function raise `UnboundLocalError` when `count` is a global?

<details><summary>Answer</summary>

Assignment anywhere in a function makes the name local throughout it, including on the right-hand side where it does not yet exist. `global` fixes it; needing `global` usually means the function should take an argument and return a value.
</details>

**Q35.** What is a closure?

<details><summary>Answer</summary>

An inner function that captures names from its enclosing scope and keeps them after the outer function returns. The mechanism behind decorators.
</details>

**Q36.** Difference between rebinding and mutating a parameter?

<details><summary>Answer</summary>

`def f(xs): xs = []` rebinds a local name; the caller sees nothing. `def f(xs): xs.clear()` mutates the shared object; the caller sees it. Functions receive labels on the caller's objects.
</details>

**Q37.** When is a lambda appropriate?

<details><summary>Answer</summary>

Only as an argument to something else, such as `sort(key=...)`. Assigning one to a name is worse than `def` in every way, including the traceback.
</details>

### Exceptions and I/O

**Q38.** Three things wrong with a bare `except:`.

<details><summary>Answer</summary>

Catches `KeyboardInterrupt` and `SystemExit` so Ctrl-C stops working; catches your own typos, turning a `NameError` into a silent wrong answer; discards the information needed to diagnose it. Use a specific type, or `except Exception` with `logging.exception()`.
</details>

**Q39.** What does `raise ValueError(...) from e` preserve?

<details><summary>Answer</summary>

The original exception as the cause, so the traceback shows both. Without `from e` the original context is lost.
</details>

**Q40.** Why pass `encoding="utf-8"` explicitly to `open`?

<details><summary>Answer</summary>

The default depends on the operating system, so code that works on your machine can raise `UnicodeDecodeError` on a colleague's. Explicit encoding is the only portable choice.
</details>

---

## 2. Multiple choice

Every option is explained, including the wrong ones. The wrong ones are where the learning is.

**M1.** What does this print?

```python
config = {"a": [1]}
copy_ = config.copy()
copy_["a"].append(2)
print(config)
```

- A. `{'a': [1]}`
- B. `{'a': [1, 2]}`
- C. `TypeError`
- D. `{'a': [1], 'a': [2]}`

<details><summary>Answer: B</summary>

**B correct.** `.copy()` is shallow: the new dict references the same list object. Appending through either name changes the one list.
**A wrong.** This is what you get from `copy.deepcopy`, which recurses into nested objects.
**C wrong.** Nothing here is a type error; both operations are valid.
**D wrong.** A dict cannot hold duplicate keys; a repeated key overwrites.
</details>

**M2.** Which is the correct way to test that an optional numeric parameter was supplied?

- A. `if not threshold:`
- B. `if threshold is None:`
- C. `if threshold == None:`
- D. `if len(threshold) == 0:`

<details><summary>Answer: B</summary>

**B correct.** `is None` asks exactly "was it absent", and distinguishes that from a deliberate `0`.
**A wrong.** `not 0` is `True`, so a caller passing `0` gets the default. This is the bug.
**C wrong.** Works, but `==` invokes `__eq__`, which a class can override to lie. `is` on a singleton is the idiom, and linters flag `== None`.
**D wrong.** Numbers have no length; raises `TypeError`.
</details>

**M3.** Why might this loop be slow?

```python
for doc in documents:
    if doc.id not in seen_ids:
        seen_ids.append(doc.id)
```

- A. `append` is O(n)
- B. `not in` on a list is O(n), making the loop O(n²)
- C. Attribute access is slow
- D. The loop should use `enumerate`

<details><summary>Answer: B</summary>

**B correct.** Each `in` scans the whole list. With n documents and a growing list, total work is quadratic. Make `seen_ids` a set.
**A wrong.** `append` is O(1) amortized.
**C wrong.** Real but negligible; it does not change the complexity class.
**D wrong.** `enumerate` gives you an index, which does nothing for speed.
</details>

**M4.** What is the output?

```python
def add(item, target=[]):
    target.append(item)
    return target

print(add(1))
print(add(2))
```

- A. `[1]` then `[2]`
- B. `[1]` then `[1, 2]`
- C. `[1]` then `[2, 1]`
- D. `TypeError`

<details><summary>Answer: B</summary>

**B correct.** The default list is created once at definition time and shared by every call that omits the argument.
**A wrong.** This is what you get after the `target=None` fix.
**C wrong.** `append` adds to the end; order is preserved.
**D wrong.** Perfectly legal Python, which is exactly why it is dangerous.
</details>

**M5.** `chunks = [c for c in all_chunks if c.score > 0.5]` where `all_chunks` is a generator. What happens on a second run of the same line?

- A. Same result
- B. Empty list
- C. `StopIteration`
- D. `TypeError`

<details><summary>Answer: B</summary>

**B correct.** A generator is exhausted after one pass. The second comprehension iterates zero times and produces `[]`, silently.
**A wrong.** Only true for a list or other re-iterable.
**C wrong.** A `for` loop and a comprehension handle `StopIteration` internally; it is not surfaced.
**D wrong.** Generators are iterable; nothing is a type error here.
</details>

**M6.** Which is safe to retry after a timeout?

- A. `POST /charges`
- B. `GET /documents/42`
- C. `POST /documents`
- D. All of them

<details><summary>Answer: B</summary>

**B correct.** GET is idempotent and safe: no side effects, repeating changes nothing.
**A wrong.** Retrying may charge twice, since the timeout leaves you unsure whether the first was processed.
**C wrong.** May create a duplicate record. Needs an idempotency key.
**D wrong.** Idempotency is exactly what distinguishes them.
</details>

**M7.** What does `logging.exception("failed")` add over `logging.error("failed")`?

- A. Logs at a higher level
- B. Includes the current traceback
- C. Re-raises the exception
- D. Writes to stderr

<details><summary>Answer: B</summary>

**B correct.** It logs at ERROR level and attaches the active exception's traceback. Only valid inside an except block.
**A wrong.** Same level, ERROR.
**C wrong.** It does not re-raise; you must do that yourself.
**D wrong.** Destination is a handler configuration, unrelated.
</details>

**M8.** Result?

```python
print(bool("False"), bool(""), bool([0]), bool([]))
```

- A. `False False True False`
- B. `True False True False`
- C. `True True True False`
- D. `False False False False`

<details><summary>Answer: B</summary>

**B correct.** `"False"` is a non-empty string, so truthy. `""` empty, falsy. `[0]` has one element, so truthy regardless of what the element is. `[]` empty, falsy.
**A wrong.** Assumes Python parses the string's content, which it does not.
**C wrong.** `""` is falsy.
**D wrong.** Only empty containers and zero values are falsy.
</details>

**M9.** Which fails?

```python
d = {}
d[(1, 2)] = "a"        # I
d[[1, 2]] = "b"        # II
d[frozenset([1])] = "c"  # III
```

- A. II only
- B. II and III
- C. I and II
- D. None

<details><summary>Answer: A</summary>

**A correct.** Lists are mutable and unhashable. Tuples and frozensets are hashable.
**B wrong.** `frozenset` exists precisely to be a hashable set.
**C wrong.** Tuples of hashable elements are the canonical composite key.
**D wrong.** II raises `TypeError: unhashable type: 'list'`.
</details>

**M10.** A loader catches exceptions per row and returns what it got. What is the risk?

- A. Slower
- B. Silent truncation: fewer records than expected, every downstream number quietly wrong
- C. Memory leak
- D. No risk; resilience is good

<details><summary>Answer: B</summary>

**B correct.** An evaluation set of 400 instead of 500 produces plausible, wrong metrics with no error anywhere.
**A wrong.** Exception handling costs almost nothing on the non-failing path.
**C wrong.** Unrelated.
**D wrong.** Resilience is good *with visibility*. Count and report what you skipped.
</details>

**M11.** Best fix for `UnicodeDecodeError` on one document out of ten thousand?

- A. `errors="ignore"` everywhere
- B. Decide deliberately: `errors="replace"` and log it, or let it fail, depending on whether a mangled character or a missing document is worse
- C. Catch and skip silently
- D. Convert everything to ASCII first

<details><summary>Answer: B</summary>

**B correct.** It is a product decision, not a technical one, and either answer can be right. What is never right is making it invisibly.
**A wrong.** Blanket silent data loss across the whole pipeline.
**C wrong.** Silent, so you never learn that a source produces undecodable documents.
**D wrong.** Destroys all non-English content.
</details>

**M12.** What does `items[:]` do?

- A. Nothing
- B. Returns a new list with the same element references
- C. Returns the same list object
- D. Deep copies

<details><summary>Answer: B</summary>

**B correct.** A full slice, so a new list, one level deep.
**A wrong.** It produces a new object, which is the point.
**C wrong.** `items[:] is items` is `False`.
**D wrong.** Nested mutable elements are still shared.
</details>

**M13.** Why `"".join(parts)` over `+=` in a loop?

- A. More readable
- B. Strings are immutable, so `+=` allocates and copies each time, making it quadratic
- C. `join` is parallel
- D. `+=` fails on large strings

<details><summary>Answer: B</summary>

**B correct.** `join` sizes the result once and copies once.
**A wrong.** True and not the reason.
**C wrong.** It is not.
**D wrong.** It works, just slowly.
</details>

**M14.** Given `scores = {"p": 0.8}`, which raises?

- A. `scores.get("r")`
- B. `scores["r"]`
- C. `"r" in scores`
- D. `scores.get("r", 0)`

<details><summary>Answer: B</summary>

**B correct.** `KeyError: 'r'`.
**A wrong.** Returns `None`.
**C wrong.** Returns `False`.
**D wrong.** Returns `0`.
</details>

**M15.** What does `zip(a, b)` do when lengths differ?

- A. Raises
- B. Stops at the shorter, silently
- C. Pads with `None`
- D. Repeats the shorter

<details><summary>Answer: B</summary>

**B correct.** Silent truncation, which is why `strict=True` exists.
**A wrong.** Only with `strict=True`.
**C wrong.** That is `itertools.zip_longest`.
**D wrong.** Nothing in the standard library does this.
</details>

**M16.** Why does this skip elements?

```python
for c in chunks:
    if c.is_empty:
        chunks.remove(c)
```

- A. `remove` is O(n)
- B. Removal shifts later elements down while the loop index advances
- C. `is_empty` is wrong
- D. It raises `RuntimeError`

<details><summary>Answer: B</summary>

**B correct.** The iterator tracks a position; removal moves elements past it.
**A wrong.** True, and a performance issue, not a correctness one.
**C wrong.** Unrelated to the mechanism.
**D wrong.** Dicts and sets raise; lists fail silently, which is worse.
</details>

**M17.** Why does `csv.DictReader` beat `line.split(",")`?

- A. Faster
- B. Handles quoted fields containing commas, embedded newlines and escapes
- C. Type conversion
- D. Streams

<details><summary>Answer: B</summary>

**B correct.** A single quoted comma silently corrupts the naive version by shifting every subsequent column.
**A wrong.** `split` is faster and wrong.
**C wrong.** Everything comes back as strings either way.
**D wrong.** Both iterate line by line.
</details>

**M18.** `json.dumps({"seen": {1, 2}})` does what?

- A. `{"seen": [1, 2]}`
- B. `TypeError: Object of type set is not JSON serializable`
- C. `{"seen": {1, 2}}`
- D. `{"seen": null}`

<details><summary>Answer: B</summary>

**B correct.** JSON has no set type and `json` will not guess.
**A wrong.** You must convert explicitly with `list(...)`.
**C wrong.** Not valid JSON.
**D wrong.** `json` never silently discards data.
</details>

**M19.** Which is the strongest argument for `os.environ["API_KEY"]` over `os.environ.get("API_KEY")`?

- A. Shorter
- B. Fails at startup with a clear `KeyError` rather than at request time with a confusing 401
- C. Faster
- D. More secure

<details><summary>Answer: B</summary>

**B correct.** Fail fast, at the earliest point, with the clearest message.
**A wrong.** Marginal and irrelevant.
**C wrong.** Both are dict lookups.
**D wrong.** Identical security; the key is in the environment either way.
</details>

**M20.** A bug only affects documents after the first in a batch, and disappears when you process them in a different order. What should you suspect?

- A. A race condition
- B. A shared mutable object: a `.copy()` that was shallow, or a mutable default argument
- C. Encoding
- D. Integer overflow

<details><summary>Answer: B</summary>

**B correct.** Order dependence plus "everything after the first" is the signature of accumulated state in a shared object.
**A wrong.** Possible in concurrent code, but order dependence in a sequential loop points at state.
**C wrong.** Encoding bugs track the content of specific documents, not their position.
**D wrong.** Python integers are arbitrary precision.
</details>

---

## 3. Short answer

Write your answer before revealing. Two or three sentences each.

**S1.** Explain Python's assignment model to someone coming from C.

<details><summary>Answer</summary>

A variable is a name tag attached to an object, not a box containing a value. Assignment moves the tag; it never copies the object. So two names can refer to one object, and if that object is mutable, a change through one name is visible through the other. For immutable objects the distinction is unobservable, which is why it goes unnoticed until a list is involved.
</details>

**S2.** Why does a tuple containing a list break the usual guarantee?

<details><summary>Answer</summary>

Immutability applies to the tuple's bindings, not to what they point at. The tuple always references the same objects, and one of those objects can change. This also makes the tuple unhashable, so it cannot be a dict key, because hashing must recurse into a member that has no hash.
</details>

**S3.** When would you deliberately choose a shallow copy?

<details><summary>Answer</summary>

When the nested objects are immutable, so sharing is safe; or when they are large and you want to share them intentionally to save memory; or when you are about to replace rather than mutate the nested values. The failure is choosing shallow by default without noticing that nested mutables are shared.
</details>

**S4.** How do you decide between `.get()` and `[]`?

<details><summary>Answer</summary>

By what a missing key means. If it means the program is in a state it should not be in, use `[]` and let the `KeyError` surface at the point of the problem. If absence is a normal case with a sensible default, use `.get(key, default)`. Defaulting to `.get()` everywhere converts bugs into silently wrong values.
</details>

**S5.** Why does the falsy-value list matter in production code?

<details><summary>Answer</summary>

Because `if not x` conflates absent, empty and zero. A threshold of `0`, an empty result list that is a valid answer, and a legitimately empty string all take the "missing" branch. The fix is testing for the specific condition you mean, usually `is None`.
</details>

**S6.** A colleague says "use a set, it's faster." When are they wrong?

<details><summary>Answer</summary>

When order matters, duplicates matter, indexing is needed, or elements are unhashable. Also when the collection is small and built once for a handful of lookups, where constructing the set costs more than it saves. "Faster" is about membership testing specifically, not about collections in general.
</details>

**S7.** What is the practical consequence of string immutability?

<details><summary>Answer</summary>

Every method returns a new string rather than modifying in place, so a result you do not assign is discarded. And accumulating with `+=` in a loop is quadratic because each step allocates and copies; `"".join()` is the linear alternative. For a few dozen items neither matters; for an ingestion pipeline both do.
</details>

**S8.** Why does `zip(..., strict=True)` matter in evaluation code specifically?

<details><summary>Answer</summary>

Because evaluation pairs predictions with labels, and a length mismatch means something upstream dropped records. Without `strict`, `zip` truncates silently and you compute a metric over a subset while reporting it as the whole, which is worse than crashing because the number looks plausible.
</details>

**S9.** Why prefer building a new collection over mutating during iteration?

<details><summary>Answer</summary>

Mutating during iteration skips elements for a list, with no error, and raises `RuntimeError` for a dict or set. A comprehension that builds a filtered copy is clearer, correct, and usually no slower. It is the same principle as preferring immutable defaults: avoid changing something someone else is holding.
</details>

**S10.** Explain the mutable default trap in terms of when things are evaluated.

<details><summary>Answer</summary>

Default argument values are evaluated once, when the `def` statement executes, not on each call. So a `[]` default creates one list at definition time, shared by every call that omits the argument. In a long-running service this accumulates indefinitely and leaks state between requests.
</details>

**S11.** When is `global` the right answer?

<details><summary>Answer</summary>

Almost never. If a function needs to change state, taking it as a parameter and returning the new value makes the data flow visible and the function testable. `global` is defensible for a module-level singleton initialized once, and even then a class or a closure is usually cleaner.
</details>

**S12.** How do you decide what to catch?

<details><summary>Answer</summary>

Catch where there is a genuine recovery: a missing optional file has a default, a 429 has a retry, one bad row in ten thousand can be logged and skipped. Let it crash where there is no correct action: a missing API key, a malformed schema, an empty result where data is required. The test is whether your program can still produce a correct answer afterwards.
</details>

**S13.** Why does `from e` matter when re-raising?

<details><summary>Answer</summary>

It chains the original exception as the cause, so the traceback shows both the low-level failure and your higher-level interpretation of it. Without it, you replace a `JSONDecodeError` naming a byte position with a vaguer message and lose the detail you would need at 2am.
</details>

**S14.** What is wrong with a loader that returns `[]` when every row is malformed?

<details><summary>Answer</summary>

It reports success for a total failure. Downstream code processes zero records, produces an empty report, and nothing indicates anything went wrong. Zero valid rows out of a non-empty file is an error condition and should raise, while individual bad rows among good ones should be logged and skipped.
</details>

**S15.** How would you approach a pipeline that works on 1,000 documents and times out on 1,000,000?

<details><summary>Answer</summary>

First establish how runtime scales by running at 1k, 10k and 100k: linear-but-slow is a different problem from superlinear. Superlinear points at a nested scan, usually `in` against a list inside a loop, string accumulation, or `insert(0, ...)`. Profile with `cProfile` to confirm rather than guessing, fix the data structure, then re-measure and assert the output is unchanged.
</details>

---

## 4. Debugging scenarios

Symptom first. Diagnose before revealing.

**D1.** Every config produced by this function ends up with all the sources.

```python
DEFAULTS = {"size": 512, "sources": []}

def make(source):
    cfg = DEFAULTS.copy()
    cfg["sources"].append(source)
    return cfg
```

<details><summary>Diagnosis and fix</summary>

`.copy()` is shallow, so every config shares one list, and `DEFAULTS` itself is corrupted permanently.

Best fix is to make the shared default immutable so the mistake cannot happen:

```python
DEFAULTS = {"size": 512, "sources": ()}

def make(source):
    cfg = DEFAULTS.copy()
    cfg["sources"] = [*cfg["sources"], source]
    return cfg
```

Now an accidental `.append` raises `AttributeError` at the moment of the mistake. `copy.deepcopy` also works but is slower and treats the symptom.
</details>

**D2.** An evaluation reports 87% accuracy. The eval set has 500 items; the report says 500. The number is wrong.

```python
correct = sum(p == l for p, l in zip(predictions, labels))
accuracy = correct / len(labels)
```

<details><summary>Diagnosis and fix</summary>

`predictions` is shorter than `labels`, because some documents failed to embed and were skipped upstream. `zip` truncates silently, so `correct` counts only the pairs that existed while the denominator is the full label count. The accuracy is deflated, and the "500" in the report comes from `len(labels)`, which was never the problem.

```python
correct = sum(p == l for p, l in zip(predictions, labels, strict=True))
```

Now it raises instead of computing a wrong number. Then fix the real problem, which is the silent drop upstream.
</details>

**D3.** A long-running API server's memory grows all day and results occasionally contain another user's data.

```python
def process(request, history=[]):
    history.append(request.text)
    return summarize(history[-5:])
```

<details><summary>Diagnosis and fix</summary>

The mutable default is shared across every call for the process lifetime. It grows without bound, and because it is shared, one user's summary includes other users' text. Both a memory leak and a data-isolation bug from one character.

```python
def process(request, history=None):
    history = list(history) if history else []
    history.append(request.text)
    return summarize(history[-5:])
```

Per-request state belongs in the request, never in a default.
</details>

**D4.** An ingestion job crashes after eleven hours with `UnicodeDecodeError: 'utf-8' codec can't decode byte 0xa0 in position 3021`.

<details><summary>Diagnosis and fix</summary>

One document is not valid UTF-8, probably Windows-1252 from a Windows-authored file. `0xa0` is a non-breaking space there.

Two problems. The encoding, and the fact that eleven hours of work was lost to one bad file.

```python
try:
    text = path.read_text(encoding="utf-8")
except UnicodeDecodeError:
    logger.warning("%s is not utf-8, retrying with replacement", path)
    text = path.read_text(encoding="utf-8", errors="replace")
```

And structurally: checkpoint progress so a failure at document 400,000 does not restart from zero, and validate encoding during a cheap first pass rather than mid-run.
</details>

**D5.** A deduplication function returns the right answer and takes 40 minutes.

```python
def dedupe(docs, already_indexed):
    return [d for d in docs if d["id"] not in already_indexed]
```

<details><summary>Diagnosis and fix</summary>

`already_indexed` is a list. Each `not in` scans it. With 50,000 indexed and 50,000 incoming, that is up to 2.5 billion comparisons.

```python
def dedupe(docs, already_indexed):
    indexed = set(already_indexed)
    return [d for d in docs if d["id"] not in indexed]
```

Measured on one machine, this was roughly 2,700x faster. Always `assert` the outputs match before and after; a performance fix that changes behavior is not a fix.
</details>

**D6.** A function that strips whitespace appears to do nothing.

```python
def clean(records):
    for r in records:
        r["title"].strip()
    return records
```

<details><summary>Diagnosis and fix</summary>

`.strip()` returns a new string; strings are immutable and nothing was assigned.

```python
def clean(records):
    for r in records:
        r["title"] = r["title"].strip()
    return records
```

Better still, do not mutate the caller's data:

```python
def clean(records):
    return [{**r, "title": r["title"].strip()} for r in records]
```
</details>

**D7.** A chunk filter leaves some empty chunks behind.

```python
for c in chunks:
    if not c.text.strip():
        chunks.remove(c)
```

<details><summary>Diagnosis and fix</summary>

Removing during iteration shifts subsequent elements down past the loop's position, so roughly every second consecutive empty chunk is skipped. No exception.

```python
chunks = [c for c in chunks if c.text.strip()]
```
</details>

**D8.** A metric comes out as `nan` and every downstream comparison is `False`.

```python
mean_score = sum(scores) / len(scores)
if mean_score > threshold:
    ...
```

<details><summary>Diagnosis and fix</summary>

One `nan` in `scores`, probably from a failed parse or a division by zero upstream, poisons the sum. Every comparison with `nan` is `False`, including `>`, `<` and `==`, so the branch silently never runs.

```python
import math

valid = [s for s in scores if not math.isnan(s)]
if len(valid) != len(scores):
    logger.warning("dropped %d nan scores of %d", len(scores) - len(valid), len(scores))
if not valid:
    raise ValueError("no valid scores")
mean_score = sum(valid) / len(valid)
```

Validate on ingestion rather than after aggregation, and never let a silent `nan` reach a comparison.
</details>

**D9.** A CSV loads with the wrong number of columns for some rows and nobody noticed for a month.

```python
for line in open("docs.csv"):
    id_, title, source = line.strip().split(",")
```

<details><summary>Diagnosis and fix</summary>

Titles containing commas. `"1,Hello, World,web"` splits into four parts and raises `ValueError: too many values to unpack`, or worse, silently misaligns when a quoted field happens to split into exactly three.

```python
import csv

with open("docs.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        ...
```

`csv` handles quoting, embedded newlines and escapes. Never parse CSV by hand.
</details>

**D10.** A pipeline reports "processed 10,000 documents, 0 errors" but the index contains 9,400.

```python
for doc in documents:
    try:
        index.add(embed(doc))
    except Exception:
        pass
    processed += 1
```

<details><summary>Diagnosis and fix</summary>

`processed` increments regardless of success, and the bare `except: pass` discards every failure. 600 documents failed invisibly. The bare except also swallows `KeyboardInterrupt`, so Ctrl-C does not work.

```python
processed = failed = 0
for doc in documents:
    try:
        index.add(embed(doc))
    except Exception:
        logger.exception("failed to index %s", doc.id)
        failed += 1
        continue
    processed += 1

logger.info("indexed %d, failed %d of %d", processed, failed, processed + failed)
if failed > len(documents) * 0.05:
    raise RuntimeError(f"{failed} failures exceeds 5% threshold")
```

Count both outcomes, log each failure, and fail the job when the failure rate crosses a threshold. A pipeline that reports zero errors while losing 6% of the data is worse than one that crashes.
</details>

---

## 5. Interview questions

Answer aloud, timed. Record yourself.

**I1.** Explain Python's object model and why it causes bugs. *(60s, then 5min)*

<details><summary>What a strong answer covers</summary>

**60s:** Names are labels on objects; assignment moves labels and never copies. Two names can refer to one object, so mutating through one is visible through the other. This is invisible for immutable types and is the cause of most confusing Python bugs for mutable ones.

**5min adds:** the mutable/immutable table and what follows from it; shallow versus deep copy and why `.copy()` surprises people; mutable default arguments as the same bug at definition time; pass-by-assignment, so rebinding a parameter is invisible outside while mutating it is not; and the practical discipline: prefer immutable defaults and building new objects over mutating shared ones, which turns silent corruption into a loud `AttributeError`.

**What weak answers do:** recite which types are mutable without naming a single consequence.
</details>

**I2.** You inherit a pipeline that works on a sample and times out on the full dataset. Walk me through it. *(5min)*

<details><summary>What a strong answer covers</summary>

Measure the scaling shape first: 1k, 10k, 100k. Linear-but-slow and superlinear are different problems with different fixes, and guessing which you have is the most common mistake.

Superlinear: look for `in` against a list inside a loop, string `+=` accumulation, `list.insert(0, ...)`, or a nested loop over the same data. Confirm with `cProfile` rather than assuming.

Linear but slow: is it CPU, I/O or memory bound? I/O bound against an API means batching and concurrency. CPU bound means processes or pushing work into a vectorized library. Memory means streaming with generators instead of materializing lists.

Then: fix, re-measure, and assert the output is byte-identical to before. A performance fix that changes results is a regression. Finally, add a test at a size that would have caught it.

**What weak answers do:** jump to multiprocessing. Parallelizing a quadratic algorithm buys a constant factor against an exponent.
</details>

**I3.** How do you decide what to catch and what to let crash? *(60s, then 5min)*

<details><summary>What a strong answer covers</summary>

**60s:** Catch where there is a real recovery; let it crash where there is not. The test is whether the program can still produce a correct answer afterwards. A silently wrong number is the worst available outcome, worse than downtime, because nobody knows to investigate it.

**5min adds:** concrete examples on both sides; why a bare `except` is wrong on three counts; `logging.exception` plus re-raise as the only acceptable broad catch; `raise ... from e` to preserve cause; the distinction between one bad row and a bad file; and the observability point, that resilience without counting and reporting what you skipped is indistinguishable from data loss.
</details>

**I4.** What is the difference between `is` and `==`, and when have you seen it matter? *(60s)*

<details><summary>What a strong answer covers</summary>

Identity versus value. Use `is` only for `None`, `True`, `False`.

The depth marker is explaining why `is` on other values is unreliable rather than merely discouraged: `int("256") is 256` is `True` because CPython caches -5 to 256, `int("257") is 257` is `False`, and writing the same thing with literals in one code block gives `True` because the compiler folds constants. Three implementation details, any of which can change.

Where it matters: `if value == None` versus `is None` when a class overrides `__eq__`, and code that tested `x is 0` and worked until the values got larger.
</details>

**I5.** Design the input-handling for a pipeline reading a million user-supplied documents. What can go wrong? *(5min)*

<details><summary>What a strong answer covers</summary>

**Failure taxonomy first:** encoding that is not UTF-8; malformed rows; missing required fields; wrong types where a number is expected; duplicate ids; empty files; files too large for memory; and `nan` or infinity in numeric fields.

**The governing decision:** distinguish a bad record from a bad file. A bad record gets logged with its identifier and skipped. A file with no valid records, or missing a required column, is an error, because returning an empty result from a broken file reports success for a total failure.

**Visibility is not optional:** count kept and skipped, log each skip with enough detail to fix it, and fail the job when the skip rate crosses a threshold. "Processed 10,000, 0 errors" while indexing 9,400 is the failure mode to design against.

**Operational concerns:** stream rather than materialize, checkpoint so an eleven-hour job does not restart from zero, validate cheaply in a first pass, and make the whole thing resumable.

**Then name your tradeoff explicitly:** resilience versus strictness. You chose resilience *with* visibility, and you can say what would make you choose differently, for example a financial dataset where a skipped row is unacceptable.
</details>

---

## 6. Implementation exercises

No solutions. These are for building, and the tests are the specification.

**E1. Chunker with an explicit edge-case contract.**

Implement `chunk_text(text, size, overlap) -> list[str]`.

Before writing any code, write down what should happen for: empty text, text shorter than `size`, text exactly `size`, `overlap == 0`, `overlap == size - 1`, `overlap >= size`, `size <= 0`, and text ending mid-chunk. Then write the tests, then the implementation.

The exercise is the contract, not the loop. This function becomes real in module 07 and every decision here shows up there as a retrieval quality issue.

**E2. Resilient multi-format loader.**

`load(path) -> tuple[list[dict], LoadStats]` handling `.csv`, `.jsonl` and `.json`, with one validation contract across all three. `LoadStats` carries kept, skipped, and per-reason skip counts.

Requirements: identical behavior across formats for the same logical data; every skip logged with a line number and reason; a file yielding zero valid records raises; a round-trip test proving all three formats produce equal output for equivalent input.

**E3. Config merger that cannot corrupt its inputs.**

`merge(base, override) -> dict` deep-merging nested dicts, with non-dict values replaced by the override. Neither input may be modified.

Write the test that would have caught D1 first. Then handle: a key present in one and not the other, a dict in one and a scalar in the other, empty dicts, and deeply nested structures. Prove non-mutation by deep-copying both inputs before the call and asserting equality afterwards.

---

## 7. Solutions to the module's practice tasks

### Tiny exercises

**1. Dict keyed by id, two versions.**

```python
def index_by_id_last_wins(items: list[dict]) -> dict:
    return {item["id"]: item for item in items}


def index_by_id_strict(items: list[dict]) -> dict:
    out: dict = {}
    for item in items:
        if item["id"] in out:
            raise ValueError(f"duplicate id: {item['id']!r}")
        out[item["id"]] = item
    return out
```

**Which for an ingestion pipeline?** Strict. A duplicate id means either the source has a data problem or your id derivation is wrong, and both are worth knowing. Last-wins is right when you are deliberately applying updates in order, where the later record is the current one. The wrong move is using last-wins by accident because it is the shorter comprehension.

**2. Comma-separated floats.**

```python
# One comprehension
values = [float(p) for p in raw.split(",") if p.strip()]

# Loop with logging
values = []
for i, part in enumerate(raw.split(","), start=1):
    part = part.strip()
    if not part:
        continue
    try:
        values.append(float(part))
    except ValueError:
        logger.warning("field %d: %r is not a number, skipped", i, part)
```

The comprehension is clearer and crashes on bad data. The loop is longer and tells you which field was wrong. Use the comprehension for data you control, the loop for data you do not.

**3. `is_nan` without `math`.**

```python
def is_nan(x) -> bool:
    return x != x
```

NaN is the only value not equal to itself. Use `math.isnan` anyway: it states intent, it raises `TypeError` on a non-float rather than silently returning `False`, and the next reader will not have to work out what `x != x` means.

**4. Predicted output.**

```python
a = [1, 2, 3]
b = a[:]      # new list
c = a         # same object
b.append(4)
c.append(5)
print(a, b, c)   # [1, 2, 3, 5] [1, 2, 3, 4] [1, 2, 3, 5]
```

`b` is independent. `c` and `a` are one object, so `c.append(5)` shows up in both.

**5. Top ten words.**

```python
import re
from collections import Counter
from pathlib import Path


def top_words(path: Path, n: int = 10) -> list[tuple[str, int]]:
    text = path.read_text(encoding="utf-8").lower()
    words = re.findall(r"[a-z']+", text)
    return Counter(words).most_common(n)
```

`re.findall` handles punctuation better than `split()` plus manual stripping. The `'` in the character class keeps contractions intact, which is a judgment call worth making deliberately.

### Realistic coding tasks

**1. Chunker.** See E1. The reference contract: empty text yields `[]`; text shorter than `size` yields one chunk; `overlap >= size` raises `ValueError` because the step would be zero or negative, producing an infinite loop; `size <= 0` raises.

**2. Resilient loader.** See project 1's `loading.py`, which is the fully worked version with tests.

**3. Config merger.** See E3.

### Mini-project

See `projects/project-1-python-data-tool.md`, which is this mini-project specified and built.

---

## 8. Scoring guide

Score each section as a percentage of items you answered correctly *before* revealing.

| Section | Weight |
|---|---|
| Flashcards | 20% |
| Multiple choice | 20% |
| Short answer | 25% |
| Debugging | 25% |
| Interview | 10% |

| Overall | Verdict | Do this |
|---|---|---|
| Under 50% | **Review Fundamentals** | Reread `01a` sections 2, 3 and 6. Redo this pack in three days. Do not start `01b`. |
| 50-69% | **Practice More** | Work the implementation exercises. Failed flashcards go to a 1-day interval. Retake in a week. |
| 70-84% | **Can Explain** | Proceed to `01b`. Put failed items in the review queue. |
| 85-94% | **Can Build** | Proceed. Complete the mini-project if you have not. |
| 95%+ | **Interview Ready** for this module | Record the interview answers and score them against the rubric in `tracker/progress-log.md` section 6. |

**Weight debugging and short answer above flashcards.** Flashcards test recall, which is necessary and not sufficient. The debugging scenarios are closest to the job and to the interview, so a 90% on flashcards with a 40% on debugging is a worse result than the reverse.

### Handling missed questions

Every missed item enters `tracker/progress-log.md` at the **1-day** interval, regardless of how nearly right you were. The rule from that file applies here: a failed review resets to the start, not back one step.

Map items to concepts so a miss updates the right row:

| Missed items | Concept row |
|---|---|
| Q1-Q10, M1, M12, M20, S1-S3, D1 | Names, objects, aliasing |
| Q5, Q6, Q11-Q13, M2, M8, S5 | Truthiness and type conversion |
| Q14-Q17, M13, S7, D4, D6 | Strings and encoding |
| Q18-Q25, M3, M9, M14, S6, D5 | Collection complexity |
| Q26-Q31, M5, M15, M16, S8, S9, D2, D7 | Control flow and iteration |
| Q32-Q37, M4, S10, S11, D3 | Functions and defaults |
| Q38-Q39, M7, M10, M19, S12-S14, D10 | Exception strategy |
| Q40, M11, M17, M18, D9 | Files and structured data |
| M6 | HTTP idempotency (`02` section 11) |
| D8, S15 | Numeric failure modes and performance |

---

## 9. Anki export

Save as `anki_01a.csv`, no header, and import with comma as the field separator. Columns are Front, Back, Tags.

```csv
"Python: a = [1,2]; b = a; b.append(3). What is a, and why?","[1, 2, 3]. Assignment binds a name to an object, it does not copy. One list, two names.","phase01 python must"
"Python: when is `is` correct?","Only for None, True, False. Everywhere else ==. Identity for other values depends on interning and constant folding.","phase01 python must"
"Python: list every falsy built-in value","False, None, 0, 0.0, empty str, empty list, empty dict, empty set, empty tuple. Everything else is truthy, including '0' and [0].","phase01 python must"
"Python: why is `if not threshold:` a bug for a numeric parameter?","not 0 is True, so a deliberate 0 takes the default branch. Use `is None` for absence.","phase01 python must"
"Python: why is `x in my_set` O(1) but `x in my_list` O(n)?","A set hashes to a bucket and checks only that bucket. A list has no structure and must scan. Average case.","phase01 python must"
"Python: def f(x, acc=[]) - what breaks?","The default is evaluated once at def time, so all calls share one list. In a server this leaks memory and bleeds state between requests.","phase01 python must"
"Python: three things wrong with a bare except:","Catches KeyboardInterrupt so Ctrl-C breaks; catches your own typos, making NameError a silent wrong answer; discards diagnostic information.","phase01 python must"
"Python: what does .copy() on a dict copy?","One level. The new dict references the same nested objects, so mutating a nested list is visible through both.","phase01 python must"
"Python: what does zip(a, b, strict=True) add?","Raises ValueError on length mismatch instead of silently truncating to the shorter. Use it whenever lengths should match.","phase01 python should"
"Python: why does removing from a list while iterating skip elements?","Removal shifts later elements down while the loop position advances. No exception for a list; dicts and sets raise RuntimeError.","phase01 python should"
"Python: float('nan') == float('nan')?","False. NaN equals nothing, including itself. Every comparison with it is False, so branches silently never run. Detect with math.isnan.","phase01 python should"
"Python: why is `out += chunk` in a loop quadratic?","Strings are immutable, so each += allocates a new string and copies everything so far. Use ''.join(parts).","phase01 python should"
"Python: what does `raise ValueError(...) from e` preserve?","The original exception as the cause, so the traceback shows both levels. Without it the underlying detail is lost.","phase01 python should"
"Python: why pass encoding='utf-8' explicitly to open()?","The default is OS-dependent, so code that works locally raises UnicodeDecodeError elsewhere.","phase01 python should"
"Python: loader returns [] when every row is malformed. Why is that wrong?","It reports success for a total failure. Zero valid rows from a non-empty file is an error; individual bad rows among good ones are logged and skipped.","phase01 python must"
"Python: bug only affects items after the first and changes with processing order. Suspect what?","A shared mutable object: a shallow .copy() or a mutable default argument accumulating state.","phase01 python must"
"Python: idiomatic 'first match or None'?","next((x for x in items if pred(x)), None). Without the default it raises StopIteration.","phase01 python should"
"Python: why can (1, [2]) not be a dict key?","Hashing a tuple hashes its elements, and a list is unhashable. TypeError: unhashable type: 'list'.","phase01 python should"
"Python: .get(key) vs [key], how do you choose?","[] when a missing key means the program is wrong and should stop. .get(key, default) when absence is expected. .get everywhere hides bugs.","phase01 python must"
"Python: pipeline works on 1k docs, times out on 1M. First step?","Measure the scaling shape at 1k/10k/100k. Superlinear points at a nested scan; linear-but-slow is a different problem. Profile before guessing.","phase01 python must"
```

Twenty cards rather than forty: these are the ones with consequences. Add more from the flashcard section as you hit items you keep missing, and use the rule from `tracker/progress-log.md` that a card you fail resets to the 1-day interval.

---

## Connections

- `01a-python-core.md` is the source material. Every item here maps to a section of it.
- `tracker/progress-log.md` consumes your scores and owns the review intervals.
- `quizzes/01b-python-patterns-practice.md` covers the next module.
- `12b-interview-question-bank.md` covers cross-module questions; the interview items here stay within `01a`.

**Next review due:** 3 days after your first attempt, then per the interval ladder.
