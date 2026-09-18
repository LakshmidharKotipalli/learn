# 12b Cross-Cutting Question Bank

**Last reviewed:** 2026-09-18 · **Volatility:** low

**This file contains only questions no single module owns.** Module questions stay in their modules; `12a` section 9 has the index. Nothing here is duplicated from elsewhere.

Three sections: 20 questions spanning modules, 15 tradeoff-judgment questions with no single right answer, and 10 production diagnostic scenarios.

System design prompts live in `11-ai-system-design.md`. Behavioral questions live in `12c`.

---

## Part 1: Questions spanning modules (20)

These fail candidates who learned each topic in isolation.

**X1. Walk me from a user typing a question to a cited answer appearing, naming every component and where it can fail.**

*Covers `07` + `06` + `10`.* Auth and rate limit, conversational query rewrite, hybrid retrieval, fusion, rerank, permission filter, threshold, prompt assembly within a token budget, prefill which is compute-bound and sets TTFT, decode which is bandwidth-bound and sets tokens per second, citation validation, logging. Failure points at each: retrieval miss, ranking too low, assembly truncation, context exhaustion, unsupported generation, invalid citation. The strong version names *where the time goes*, since decode dominates for a long answer while prefill dominates TTFT for a long prompt, so the two symptoms have different fixes.

*Weak:* listing boxes without failure modes or latency attribution.

**X2. Your RAG evaluation shows recall improved and users say quality got worse. Explain.**

*Covers `07` + `04` + `03`.* Four candidates. The eval set does not reflect real queries, often because questions were generated from chunks, which is group leakage; compare the real-user slice separately. Recall improved while MRR fell, so relevant chunks are retrieved but rank too low to be passed at your actual k. Retrieval improved and generation regressed, which separate metrics would have caught. Or the eval set is too small to support the claimed difference, which is the `03` section 9 point. Check per-case results, not the mean.

**X3. How is data leakage in classical ML the same problem as a contaminated RAG evaluation set?**

*Covers `04` + `07`.* Both are information from the evaluation reaching the thing being evaluated. Selecting features on all data before cross-validating produced 0.845 AUC on pure noise. Generating eval questions from the chunks they should retrieve is the same mechanism: the question shares the chunk's vocabulary, so retrieval looks better than it is. Both are group leakage. Both are caught the same way: a result better than expected is a bug report, and the honest slice is the one built independently.

**X4. Why does a quantized model fail at format-following before it fails at factual recall, and why does that matter operationally?**

*Covers `06` + `09` + `10`.* Quantization damage concentrates in long-context coherence, instruction following and multi-step reasoning before short factual accuracy. Benchmarks measure short factual accuracy, so they hide it. Operationally this means a model that passes your spot checks fails on a complex JSON schema across a long prompt, which is exactly the production case, so quantization must be evaluated at your real context length and task complexity rather than on a leaderboard.

**X5. Your agent works in testing and behaves erratically in production. Where do you look, in order?**

*Covers `08` + `10` + `02`.* Traces first: tool names, arguments, observations, stop reasons, token counts per step. Stop-reason distribution, because a high `step_limit` rate means looping while `answered` with bad answers is a different bug. First wrong step, not last. Tool descriptions, the usual cause of wrong selection. Context growth to truncation, which makes an agent stop following its system prompt around a predictable step count. Tool count, since testing usually registers fewer tools than production and selection degrades with count. Then build the trajectory eval set that is clearly missing.

**X6. Connect the KV cache to your monthly bill.**

*Covers `06` + `09` + `11` + `10`.* The cache scales with context length times batch size. Doubling context halves how many sequences fit in memory, which halves batch size, which cuts decode throughput, so you need more hardware for the same QPS. On a hosted API the same physics is priced in: long-context requests cost more than linearly in practice. And prompt tokens dominate RAG cost anyway, so top-k is a lever with a multiplier. Going from 5 chunks to 20 roughly quadruples most of the bill.

**X7. Why is an unbounded queue in front of an LLM service worse than in front of a normal web service?**

*Covers `10` + `06`.* The generic problem is the same: latency grows without bound, memory fills, everything times out, and a partial outage becomes total. It is worse here for two reasons. Each request occupies a stream for seconds rather than milliseconds, so the queue drains far more slowly than intuition suggests. And queued requests consume KV cache once admitted, so a deep queue converts into memory pressure that reduces throughput further. Bounded queue, reject with 429.

**X8. Your embedding model provider updates the model. What breaks, and how would you have known?**

*Covers `07` + `10` + `04`.* Vectors from different models are not comparable, so every stored vector is now incomparable with every new query vector. Retrieval quality collapses gradually with no error and no deploy. You would have known by pinning an explicit version rather than an alias, including the model name in the index identifier, asserting the match at startup so it becomes a loud failure, and logging the version per request. This is `04`'s drift, with an upstream change as the cause.

**X9. Explain how prompt injection changes severity as you add capabilities.**

*Covers `06` + `08` + `10`.* Text-only output: an embarrassment. Add retrieval over a corpus anyone can write to: indirect injection becomes possible and the user is innocent. Add tools that read private data: exfiltration becomes the risk. Add tools that act externally: the lethal trifecta is complete and an attacker can both read and send. Severity is injection-success times capability, so the design lever is capability, not prompt wording.

**X10. What does `02`'s idempotency have to do with agents?**

*Covers `02` + `08`.* An agent retries far more readily than a human, and a timeout means you do not know whether the call succeeded. Retrying a non-idempotent tool duplicates its effect: two emails, two refunds. So idempotency belongs in the tool definition as a declared property, non-idempotent tools use an idempotency key per logical operation, and the retry logic reads that property rather than retrying uniformly.

**X11. Why is `03`'s LEFT JOIN lesson relevant to a RAG pipeline?**

*Covers `03` + `07`.* An INNER JOIN between documents and chunks silently drops documents that produced no chunks, so a pipeline dashboard shows everything healthy while parsing has been failing. The anti-join finds them. The same denominator error appears in evaluation: a join that drops questions with no labelled chunks computes metrics over a subset and reports them as the whole.

**X12. How do you decide between prompting, RAG, fine-tuning and tools?**

*Covers `06` + `07` + `05`.* Tools for anything live or computed, since RAG over a nightly snapshot reports stale data as fact. RAG for facts in a corpus you control, especially changing ones. Fine-tuning for behavior: format, style, taxonomy. Prompting when the model already knows and you need framing. The two anti-patterns worth naming: fine-tuning on documentation, which bakes a snapshot into weights with no provenance or update path or deletion capability, and using RAG to supply format examples, which is few-shot prompting done expensively and non-deterministically.

**X13. Your system's p50 latency is fine and p99 is terrible. What is happening?**

*Covers `10` + `06` + `07`.* Candidates: a cache with a high hit rate, so p50 is cache hits and p99 is misses, which shows as a bimodal distribution. Variable prompt length, since prefill scales with it and a long-context request costs much more. Retry paths, where a first attempt times out and the retry succeeds, so p99 is roughly double p50 plus the timeout. Queue depth at peak. Diagnostic: plot the distribution shape rather than the percentiles, and segment by cache hit and prompt length.

**X14. How does `04`'s threshold selection apply to a RAG system?**

*Covers `04` + `07`.* The refusal threshold is a decision threshold, set from the cost of a wrong answer against the cost of an unnecessary refusal, not from a default. And retrieval operates at a fixed capacity, since you pass k chunks, which is exactly `04`'s precision@k framing: the metric that binds is quality at your operating point, not area under a curve across all thresholds.

**X15. Why does a smaller model at higher precision often beat a larger model at aggressive quantization?**

*Covers `09` + `06` + `05`.* Both reduce memory and both cost quality through different mechanisms: a smaller model has less capacity, a heavily quantized one has the same capacity expressed imprecisely. Sub-3-bit damage concentrates in instruction following, format adherence and long-context coherence, which is precisely what a production system depends on, while short factual accuracy survives longest and is what benchmarks measure. So the benchmark comparison misleads in the direction that matters. Measure on your own task at your real context length.

**X16. Trace the cost of one badly-chunked document through an entire system.**

*Covers `07` + `06` + `10`.* Bad chunking produces an orphaned chunk lacking its own topic vocabulary, so it is unfindable and retrieval misses it. The user gets a refusal for an answerable question, so refusal rate rises, which looks like a model problem. Someone raises top-k to compensate, which quadruples prompt tokens and most of the bill while diluting context with irrelevant chunks, which reduces answer quality. One ingestion decision, three stages downstream, and the metric that moved was in the wrong place.

**X17. How would you test an AI system, given that its output is non-deterministic?**

*Covers `02` + `06` + `07` + `10`.* Split it. Deterministic and unit-testable: chunking boundaries, parsing, schema validation, retrieval against a fixed index, prompt template rendering, retry logic, cost accounting. Not assertable: generation quality, which is *evaluated* against a dataset with metrics and thresholds rather than asserted. In CI, gate on the deterministic parts exactly and on the evaluated parts with a tolerance, never equality, because temperature 0 is not bit-deterministic and a flaky gate gets disabled.

**X18. Why does `05`'s softmax stability trick appear in `06`?**

*Covers `05` + `06`.* Both are log-sum-exp. `BCEWithLogitsLoss` combines sigmoid and log to avoid computing them separately and losing precision on confident predictions. Attention's softmax subtracts the row max before exponentiating, because `exp(800)` overflows to infinity and softmax is shift-invariant so the subtraction is free. Same numerical problem, same fix, two places.

**X19. Your cost tripled overnight with no deploy. Walk me through it.**

*Covers `10` + `07` + `06`.* Check what changed that is not a deploy, in order: a config edit such as top-k or context size, since those multiply prompt tokens; a provider model version change behind an alias, which can change both pricing tier and verbosity; a cache that stopped working, since the hit rate collapsing directly multiplies cost; an ingestion run that grew the corpus so retrieved chunks got longer; or abuse, one client sending enormous prompts. Diagnostic: tokens per request over time, segmented by tenant and endpoint, which is why you attribute cost per request.

**X20. How is `03`'s sample size problem the reason your eval set is too small?**

*Covers `03` + `07` + `04`.* Standard error scales as the inverse square root of n, so halving your uncertainty needs four times the questions. With 40 questions you cannot distinguish recall of 0.71 from 0.74, and claiming you can is the most common error in AI write-ups. The honest report is an interval, and the practical consequence is that small improvements need either many more questions or a different claim, such as "no regression" rather than "improvement".

---

## Part 2: Tradeoff judgment (15)

No single right answer. What is assessed is whether you name conditions and costs.

**T1. Would you build this as a workflow or an agent?**
*Strong answers* give the test: can you draw the flowchart in advance? And name the agent's costs: unpredictability, harder debugging, cost that grows superlinearly with steps because context accumulates, and stopping problems. Then propose measuring both against the same trajectory eval set.

**T2. Local inference or a hosted API?**
*Conditions:* privacy constraints decide it alone; cost depends entirely on utilization, so an idle GPU is worse than an API; version pinning matters if you rely on evaluation stability; and you accept a capability ceiling since frontier models are not available as weights. Hybrid is common and worth naming.

**T3. Do you need a vector database, or will a linear scan do?**
*Conditions:* under roughly 100,000 vectors a scan is genuinely fine and much simpler. Above that, ANN with a measured recall. Also: do you need filtering, deletion, or multi-tenancy, because those are the operational features you are actually buying.

**T4. Bigger chunks or smaller chunks?**
*Conditions:* precision against completeness, with vector dilution as the mechanism. Then the structural answer that avoids the choice: parent-child retrieval gives small-chunk precision with large-chunk context. Say you would sweep it against your own eval set rather than adopt a default.

**T5. Fine-tune an embedding model, or improve retrieval around it?**
*Conditions:* improve retrieval first, because hybrid search and reranking are cheaper and usually larger wins. Fine-tune when your domain vocabulary is genuinely absent from the base model's training, and when you have enough labelled pairs. Measure the base model's recall first; often it is not the bottleneck.

**T6. Framework or build it yourself?**
*Conditions:* use one when you need checkpointing, human-in-the-loop and observability that you would otherwise build. Do not use one for a single tool call in a loop, which is thirty lines. Note the real cost: a framework dependency is hard to remove later.

**T7. How much should you spend on evaluation versus features?**
*Position:* evaluation first, and defend it with the cost of the alternative, which is that every subsequent decision is a guess and you will ship regressions unknowingly. Then be honest that eval sets have maintenance cost and can become stale, so they need review like code.

**T8. Streaming or a complete response?**
*Conditions:* streaming for anything a user reads, because perceived latency is dominated by time to first token. Not for structured output that must be validated before use, and note the real constraint: once you have started streaming a 200 you cannot change the status code, so validation must happen first.

**T9. One large model or routing between sizes?**
*Conditions:* the tier gap is roughly 12x on cost, so routing pays when a meaningful share of queries is simple. The costs: a routing classifier is another component that can be wrong, and two models mean two sets of behavior to evaluate and monitor. Measure the routed share's quality separately.

**T10. Rebuild the index or migrate incrementally?**
*Conditions:* an embedding model change forces a full re-embed, so build alongside and switch atomically. Incremental works for content updates. Name the operational cost: at 20 million chunks a rebuild is a project, not an operation, which is an argument for pinning the embedding model hard.

**T11. Strict schema validation or permissive parsing of model output?**
*Conditions:* strict at trust boundaries, always, because a malformed structure caught at the boundary gives a precise error while a permissive parse gives a `KeyError` three functions away. Permissive with logging when you are still learning the failure distribution. Constrained decoding makes invalid output impossible rather than unlikely, and even then you validate semantics, because schema-valid and correct are different.

**T12. Optimize for p50 or p99?**
*Conditions:* p99 is the users who complain and it is where the system's real capacity shows. p50 is what most users experience. If they diverge sharply, that is a finding: usually a cache boundary or variable prompt length, and the fix addresses the cause rather than the percentile.

**T13. Human review of every consequential action, or sampled?**
*Conditions:* every action for irreversible and high-blast-radius operations. Sampled for high-volume low-stakes ones. The failure to name is confirmation fatigue: an approval rate near 100% means the control is theatre, and a confirmation that does not show what will happen cannot be evaluated.

**T14. Keep the eval set fixed, or grow it?**
*Conditions:* fixed for comparability across runs, which is the whole point of a baseline. Grow it when you find failure modes it does not cover, and version it so runs remain comparable within a version. The tension is real: a set that never grows stops reflecting your users.

**T15. Ship a worse system sooner, or a better one later?**
*Position:* it depends on whether the failure mode is recoverable. A system that is worse but observable, reversible and honest about uncertainty is usually the right call, because you learn from real usage. A system that is worse in ways that damage trust, such as confident wrong answers with no refusal path, is not, because the cost is not recoverable by shipping a fix later.

---

## Part 3: Production diagnostic scenarios (10)

*"Here is what you are seeing. What do you do?"* These test method.

**D1.** *Users report the assistant "got dumber" last Tuesday. No deploys that week.*

Check what changes without a deploy: provider model version behind an alias, an index rebuild, an ingestion run, a config edit through a non-code path such as a prompt in a database. Then the measurement: run the offline eval set and compare against the last committed baseline. If the eval set does not show it, the eval set does not cover what broke, which is itself the finding.

**D2.** *Refusal rate jumped from 8% to 34% overnight.*

Refusal rate rising means retrieval stopped finding things. Check ingestion lag first, because a stalled pipeline is the most common cause and it does not error. Then the retrieval score distribution, which will have shifted down. Then whether the embedding model or index changed. A threshold change is also possible and is a config edit.

**D3.** *Cost per request doubled. Token counts are flat.*

Token counts flat rules out prompt growth, so price changed. Candidates: a provider model version change behind an alias moved you to a different tier, a routing classifier degraded so more traffic goes to the expensive model, or a cache stopped being consulted so you pay for requests that used to be free. Check the model version logged per request and the cache hit rate.

**D4.** *p95 latency doubled. Error rate is unchanged.*

No errors means it is not failures, it is slowness. Separate TTFT from total: if TTFT rose, prompts got longer, so check whether top-k or history length changed. If generation rose, check the model version and whether batching changed. Then saturation: queue depth and concurrent streams, because at peak more concurrency means each stream is slower.

**D5.** *One tenant's users are seeing another tenant's documents.*

Stop and treat it as a security incident, not a bug. Determine scope from the audit log: which documents, which users, when it started. Then the cause, and the near-certain candidate is tenant id taken from the request rather than the authenticated session, or a filter applied in application code with a path that skips it. Fix at the data layer, add the cross-tenant access test, and disclose per your obligations.

**D6.** *An agent called a tool it should never call.*

Immediate: alert, and check whether the action had an effect. Then determine whether it is a bug or an attack. A bug means the tool was registered for a context where it should not be, or the policy gate has a gap. An attack means injection, so check what content the agent processed, which will usually be a retrieved document or tool output. Either way the structural fix is the same: the tool should not have been reachable, so scope the registry per context.

**D7.** *Ingestion has been running for 11 hours and is at 40%.*

Do not wait. Check whether it is progressing linearly or slowing, because slowing suggests an accidentally quadratic path such as a membership check against a growing list. Check whether it is checkpointing, because if it fails at 90% with no checkpoint you lose everything. Check the failure count, because a silent skip rate means you will get an incomplete index that reports success.

**D8.** *The eval gate in CI has been failing intermittently for two weeks and someone disabled it.*

The gate was probably asserting on a stochastic metric with no tolerance, or on an LLM-judge score that drifts. Fix the gate rather than restoring it as-is: tolerance rather than equality, deterministic metrics only, and a failure message naming the specific cases. Then check what merged during the two weeks it was off, because that is the actual risk.

**D9.** *Memory on the inference server grows through the day and it OOMs overnight.*

Growth correlated with request count suggests a leak; growth with distinct-object count suggests a cache holding references. Candidates: KV cache not being released for completed sequences, an unbounded response cache, `lru_cache` on a method pinning instances, or a queue growing. Check whether concurrency increased, because KV cache is per sequence and `--parallel` multiplies it.

**D10.** *Everything is green and the product manager says the feature is not working.*

Your metrics do not measure what broke, and that gap is the finding. Ask what "not working" means specifically and get three examples. Trace those three requests end to end. Usually it is quality rather than availability, which standard monitoring does not see, so the answer is to add the quality metrics and to run the offline eval on those examples. If the eval set passes them, the eval set does not represent real usage.

---

## Connections

- `12a-interview-framework.md` owns the answer method and the question index.
- Module `## Interview angle` sections own concept questions; nothing here duplicates them.
- `11-ai-system-design.md` owns design prompts.
- `12c-interview-behavioral-and-projects.md` owns experience questions.

---

## Volatile claims

Almost none. These are reasoning questions grounded in the modules. The one exception:

| Claim | Why it decays | Re-check against |
|---|---|---|
| The ~12x model tier cost gap | Pricing changes | Current provider pricing |

**Next review due:** 2027-03-18.
