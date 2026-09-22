# 09 Local LLM Inference

**Last reviewed:** 2026-09-18 · **Volatility:** high. This is the fastest-moving module in the repository.

Two parts. Part 1 is specific to your machines, so the numbers mean something. Part 2 is the hardware-agnostic framework, which is what you take into an interview where you do not know the hardware.

Every memory figure here was computed from the formula. Every performance figure is marked `[UNVERIFIED]` with the command to measure it yourself, because a throughput number you did not measure is worth nothing in an interview and less in production.

---

## Why this matters

Running models locally is where the abstraction stops protecting you. An API hides quantization, batching, memory pressure and scheduling. Run it yourself and every one of those becomes your problem, which is exactly why it teaches more per hour than any other module here.

It is also a differentiator. Most candidates have called an API. Far fewer can say "I measured 14 tokens per second at 8k context on unified memory, here is the memory math, and here is why raising the context window halved it". That sentence is worth more than any architecture diagram, because it cannot be faked.

The commercial reasons are real too: privacy for regulated data, cost at volume, offline operation, and control over model versions so your evaluation results do not silently expire.

---

## Prerequisites

| You need | From |
|---|---|
| Key–value (KV) cache formula, prefill vs decode, quantization | `06` sections 7, 8 |
| Batching and continuous batching concepts | `06` section 7 |
| Docker, APIs, reverse proxies | `02` sections 4, 11 |
| Concurrency, and why C extensions release the GIL | `02` section 12 |
| Retries, timeouts, client design | `01b` section 9 |

Section 7 of module `06` is the hard prerequisite. The whole of Part 1 is that formula applied to your machines.

---

## How to use this module

This page has three modes. **Learn** is the first pass through the concepts. **Build** is the practice task and project work. **Interview** is the optional articulation layer; do it after you can solve the examples.

### Learning guide

| Item | Guidance |
|---|---|
| Estimated first pass | 4 hours |
| Setup | A terminal; llama.cpp is optional for the local experiments |
| First pass | Read memory budget, quantization, runtimes, latency/throughput, serving, and benchmarking. Treat `[DEPTH · DEEP DIVE]` sections as optional until the core path is comfortable. |
| Priority | `[FOUNDATION]` and `[CORE]` are the first pass; `[DEPTH · DEEP DIVE]` is the second pass. `[MUST]`/`[SHOULD]`/`[NICE]` apply to interview priority. |

By the end of the first pass you should be able to:

- Estimate whether a model and context fit a machine before downloading it.
- Separate model size, key–value cache, runtime overhead, and bandwidth costs.
- Benchmark latency and throughput using a reproducible workload.

### Five-minute diagnostic

Answer these without searching. If two or more answers are uncertain, read the first-pass path in order instead of skipping ahead.

1. What determines whether a quantized model fits in memory?
2. Why does a longer context increase the key–value cache footprint?
3. What is the difference between time to first token (TTFT) and generation speed?
4. Why can a faster runtime still produce a worse user experience?
5. What must a benchmark hold constant to be comparable?

### Run the examples

Start by checking the local prerequisite:

```bash
python3 --version
```

Expected output is a version string or command version. Run each example before reading its explanation; write down your prediction first.

## Skip-ahead map

| Section | Level | Skip if you can... |
|---|---|---|
| Part 1, all | [CORE] | ...state what fits on your machine and why, without looking |
| 6. Why local at all | [FOUNDATION] | ...name three reasons that are not cost |
| 7. Formats and quantization | [CORE] | ...explain why Q2_K is larger than IQ3_XXS |
| 8. The memory budget | [CORE] | ...compute total footprint from model and context |
| 9. Runtimes | [CORE] | ...say when vLLM beats llama.cpp and when it does not |
| 10. Throughput and latency | [CORE] | ...explain why batching helps decode but not TTFT |
| 11. Serving and networking | [CORE] | ...expose an OpenAI-compatible API safely on a LAN |
| 12. Benchmarking | [CORE] | ...design a benchmark whose numbers you would defend |
| 13. Troubleshooting | [CORE] | ...diagnose slow generation without guessing |

---

## Mental model

**On unified memory, inference is a memory problem wearing a compute costume.**

Decode reads every weight for every token. A 6.5 GB model generating 20 tokens per second reads 130 GB/s. That is the number that determines your speed, and it is a property of your memory subsystem, not your GPU cores.

This has two consequences that surprise people. First, **quantization speeds things up**, because fewer bytes to read per token. It is not just a memory-saving measure. Second, **a smaller model at higher precision often beats a larger model at brutal quantization**, because you are trading a known quality loss against a bandwidth gain you can compute.

**Where the analogy breaks down.** Prefill is genuinely compute-bound: processing a long prompt saturates the GPU. So a long-prompt, short-answer workload such as RAG behaves completely differently from a short-prompt, long-answer workload such as chat. Treating "inference speed" as one number is the most common analytical mistake in this area.

---

# Part 1: Your setup

## 1. What you are running

From your own description, so correct anything that has changed:

| Item | Value |
|---|---|
| Machines | Two MacBooks, Apple silicon, unified memory |
| Machine A | 16 GB RAM. Q3_K_M of a 27B was too tight. |
| Machine B | Runs `Qwen3.6-27B-UD-IQ2_XXS.gguf`. RAM not recorded. |
| Runtime | llama.cpp, `llama-server` |
| Serving | OpenAI-compatible API, `--host 0.0.0.0` on the LAN |
| Remote access | Tailscale |
| Tuning | `sudo sysctl iogpu.wired_limit_mb` |
| Quantization | Unsloth Dynamic GGUFs, imatrix calibration |

`[VERIFY: fill in Machine B's RAM and the exact llama.cpp build you are on, and re-read the tables below with that number]`

`[VERIFY: Qwen3.6-27B's exact layer count, KV head count and head dimension are after my training cutoff. Read them from the loader output: llama-server prints n_layer, n_head_kv and n_embd_head_k at startup. The tables below are computed for plausible configurations and the arithmetic is what matters, not my guess at the architecture.]`

## 2. Why Q3_K_M did not fit on the 16 GB machine

Your experience, confirmed by arithmetic.

A 27B model at Q3_K_M is approximately 3.91 bits per weight:

```
27e9 × 3.91 / 8 / 1024³ = 12.29 GB   (weights alone)
```

macOS reserves a portion of unified memory for the system and caps what the GPU may wire. The default limit is roughly 75% of physical RAM:

```
16 GB × 0.75 = 12.0 GB
```

So the weights alone are 12.29 GB against a 12.0 GB ceiling, before a single byte of KV cache, before the compute buffers, before the OS. It could not have worked. You were not doing anything wrong.

**The general lesson**, which is the interview-worthy part: your budget is not your RAM. It is

```
usable ≈ (RAM × wired_limit_fraction) − weights − kv_cache − compute_buffers
```

and every term matters. People size models against total RAM, then spend an afternoon confused.

## 3. What actually fits, by quantization

27B weights across the GGUF taxonomy. Computed, not recalled:

| Type | bits/weight | Weights (GB) | Fits under a 12 GB limit? |
|---|---|---|---|
| F16 | 16.00 | 50.29 | No |
| Q8_0 | 8.50 | 26.72 | No |
| Q6_K | 6.56 | 20.62 | No |
| Q5_K_M | 5.67 | 17.82 | No |
| Q4_K_M | 4.85 | 15.24 | No |
| IQ4_XS | 4.25 | 13.36 | No |
| **Q3_K_M** | 3.91 | **12.29** | **No, by 0.29 GB** |
| Q2_K | 3.35 | 10.53 | Weights yes, then KV cache kills it |
| IQ3_XXS | 3.06 | 9.62 | Weights yes, tight |
| IQ2_M | 2.70 | 8.49 | Yes, workable |
| IQ2_XS | 2.31 | 7.26 | Yes |
| **IQ2_XXS** | 2.06 | **6.48** | **Yes, comfortably** |
| IQ1_M | 1.75 | 5.50 | Yes, and quality is usually unacceptable |

`[VERIFY: bits-per-weight figures are approximate and vary by model, since embedding and output layers are often kept at higher precision @ check the actual file size of your .gguf, which is the only number that matters]`

**Notice that Q2_K (3.35 bpw) is larger than IQ3_XXS (3.06 bpw)** despite the name suggesting otherwise. K-quants carry per-superblock scale and minimum values, which is real overhead; the IQ types use importance-matrix-guided codebooks that pack tighter at the same nominal bit budget. This is the sort of detail that signals you have actually chosen between these rather than read a list, and it explains why the naming is not a reliable size ordering.

## 4. Your total footprint at context

Weights are the easy part. Here is IQ2_XXS 27B with KV cache, assuming a GQA configuration of 64 layers, 8 KV heads, head dimension 128:

| Context | Weights | KV (fp16) | Total | + ~1 GB buffers |
|---|---|---|---|---|
| 4,096 | 6.48 | 1.00 | 7.48 | 8.48 |
| 8,192 | 6.48 | 2.00 | 8.48 | 9.48 |
| 16,384 | 6.48 | 4.00 | 10.48 | 11.48 |
| 32,768 | 6.48 | 8.00 | 14.48 | 15.48 |

At 0.25 GB per 1,024 tokens of context, the cache reaches the size of the weights at roughly 26k tokens.

**If the model turns out to use multi-head rather than grouped-query attention**, the picture changes completely: 2.0 GB per 1,000 tokens, so 16 GB of cache at 8k context. Check `n_head_kv` in the startup log before planning a context length. This single number is the difference between a comfortable 32k context and not fitting at all.

**Quantizing the KV cache** halves it:

| Context | KV fp16 | KV Q8 |
|---|---|---|
| 8,192 | 2.00 GB | 1.00 GB |
| 32,768 | 8.00 GB | 4.00 GB |

```bash
llama-server -m model.gguf --cache-type-k q8_0 --cache-type-v q8_0
```

`[VERIFY: flag names change between llama.cpp releases @ llama-server --help]` KV quantization generally costs more quality per bit than weight quantization, so treat it as the lever you pull when context is the binding constraint, not as a default.

## 5. Concrete recommendations for your machines

**Machine A, 16 GB.** A 27B is the wrong shape for this machine. IQ2_XXS fits, and 2 bits on a 27B is a heavy quality cost for the privilege of saying you ran a 27B. A 7B to 14B at Q4_K_M or Q5_K_M will very likely be better at everything you actually do, and faster. The interesting experiment is to run both against a task-specific eval set and find out; that comparison is a good portfolio artifact in itself.

If you want more headroom on this machine:

```bash
sudo sysctl iogpu.wired_limit_mb=13600     # 13.3 GB, ~83% of 16 GB
```

Raising it past roughly 85% invites swapping, which is much worse than a smaller model. Note this resets on reboot; persist it in a launch daemon if you rely on it.

**Machine B.** Once you fill in its RAM, read off section 4 which context length fits alongside IQ2_XXS, and check whether a higher quantization also fits. If Machine B has 32 GB or more, `Q4_K_M` at 15.24 GB plus 2 GB of cache at 8k context fits comfortably, and **Q4_K_M will be meaningfully better than IQ2_XXS at the same model**. That is probably the single highest-value change available to you.

**Serving across both machines.** You already do the right thing: `llama-server --host 0.0.0.0` with an OpenAI-compatible API, reached over Tailscale. Two additions worth making, covered in section 11: put an authenticating reverse proxy in front rather than exposing `llama-server` directly, and set `--parallel` deliberately rather than leaving it at the default, since it directly trades KV cache memory for concurrency.

**Measuring before believing.** You have no throughput numbers in this document because I have not run on your hardware and will not invent them. Section 12 has the commands. Run them, put the numbers in your repository, and you will have something most candidates do not.

---

# Part 2: The general framework

## 6. Why run models locally [FOUNDATION]

| Reason | When it decides |
|---|---|
| **Privacy** | Data that cannot leave your network: health, legal, financial, anything under a data residency rule. Often the only reason that matters, and it is not negotiable when it applies. |
| **Cost at volume** | Fixed hardware cost beats per-token cost above a break-even that depends entirely on utilization. An idle GPU is worse than an API. |
| **Latency** | No network round trip, and no dependence on someone else's queue depth. Matters most for short completions where network time is a large fraction. |
| **Control of versions** | An API model can change underneath you, silently invalidating your evaluations. A local checkpoint does not. |
| **Offline and edge** | No connectivity, or intermittent connectivity. |
| **Learning** | Every abstraction the API hides becomes visible. |

**Why not, stated honestly**, because an interview answer that only lists advantages is weak:

- Frontier-quality models are not available as weights, so you are choosing a capability ceiling.
- You own the operations: updates, monitoring, capacity, failures at 3am.
- Utilization is the whole cost argument, and hardware sitting idle is pure loss.
- Scaling means buying machines, not changing a number.

**The honest framing:** local is a good default for privacy-constrained work, for high steady volume, and for anything where you must pin behavior. Hybrid is common and sensible: local for the bulk, hosted for the hard cases.


> **Concept checkpoint — 6. Why run models locally**
>
> 1. **Define:** explain the idea in one sentence without repeating the heading.
> 2. **Predict:** before rerunning the smallest example above, state the result.
> 3. **Vary:** change one input, parameter, or assumption and explain what should change.
> 4. **Challenge:** name one common misconception or failure mode.
> 5. **Apply:** complete the smallest practice task before moving on.

## 7. Formats and quantization [CORE]

**Formats:**

| Format | What | Notes |
|---|---|---|
| **safetensors** | Tensors plus metadata, no code execution | The standard for full-precision weights. Prefer over pickle. |
| **PyTorch `.bin`** | Pickled | Can execute arbitrary code on load. Avoid untrusted files. |
| **GGUF** | Single file: weights, tokenizer, chat template, metadata | llama.cpp's format. Self-contained, which is its main virtue. |

**GGUF being self-contained matters operationally.** The chat template ships inside the file, so the model formats conversations correctly with no external config. It also means a wrong template baked into a bad conversion is a silent quality disaster, which is section 13's most under-diagnosed failure.

**Reading the quantization taxonomy:**

- `Q4_K_M`: 4-bit, K-quant, Medium. K-quants store weights in superblocks with per-block scales and minimums.
- `IQ2_XXS`: 2-bit, I-quant, extra-extra-small. I-quants use codebooks chosen with an importance matrix.
- `Q4_0`: legacy, simple round-to-nearest. Superseded.
- `UD-` prefix (Unsloth Dynamic): per-layer bit allocation rather than uniform, keeping sensitive layers at higher precision.

**The importance matrix (imatrix)** is the concept worth being able to explain. You run a calibration corpus through the full-precision model and record which weights have the most influence on activations. Quantization then allocates bits by that measured importance rather than uniformly. This is why I-quants beat K-quants at the same nominal bit width, and why **the calibration corpus matters**: an imatrix built on English prose will quantize a code model worse than one built on code. If quality is disappointing at low bit widths, the calibration data is a real suspect and an under-explored one.

**Dynamic quantization** extends this to layer granularity: attention layers and the embedding and output layers are more sensitive than the feed-forward bulk, so give them more bits. A `UD-IQ2_XXS` is not uniformly 2.06 bits; that is the average.

**Where quality degrades first**, repeated from `06` section 8 because it is the operationally important part: long-context coherence, then instruction and format following, then code, then rare knowledge, then multi-step reasoning. Short factual accuracy holds up longest, which is exactly why benchmark scores mislead you about quantization.

**The practical rule:** Q4_K_M or better for anything you care about. Below Q3, expect format-following and long-context problems even when short answers look fine. Below Q2, expect a demo rather than a tool. And always prefer a smaller model at higher precision to a larger model at desperate precision, unless you have measured otherwise on your task.


> **Concept checkpoint — 7. Formats and quantization**
>
> 1. **Define:** explain the idea in one sentence without repeating the heading.
> 2. **Predict:** before rerunning the smallest example above, state the result.
> 3. **Vary:** change one input, parameter, or assumption and explain what should change.
> 4. **Challenge:** name one common misconception or failure mode.
> 5. **Apply:** complete the smallest practice task before moving on.

## 8. The memory budget [CORE]

Four terms, and people usually account for one:

```
total = weights + kv_cache + compute_buffers + framework_overhead
```

**Weights:** `params × bits_per_weight / 8`. Check the file size.

**KV cache:** `2 × layers × n_kv_heads × d_head × seq_len × batch × bytes_per_element`. From `06` section 7. The `batch` term is the one that catches people when they enable concurrency.

**Compute buffers:** activations, logits over the vocabulary, scratch space. Grows with batch and prompt length. Typically hundreds of megabytes to a couple of gigabytes.

**Framework overhead:** the runtime itself, plus any memory it reserves up front.

**The rules of thumb worth internalizing:**

- **Leave 15 to 25% headroom.** Running at 98% of available memory works until a longer prompt arrives, then fails.
- **On unified memory, the GPU wired limit is your real ceiling**, not physical RAM.
- **On discrete GPUs, VRAM is a hard wall.** Spilling to system RAM over PCIe is an order-of-magnitude slowdown, and a setup that "works" while partially offloaded is often slower than a smaller model that fits.
- **Concurrency multiplies the cache, not the weights.** Weights are shared across concurrent sequences; KV cache is per sequence. This is why `--parallel 4` can exhaust memory that `--parallel 1` had to spare.


> **Concept checkpoint — 8. The memory budget**
>
> 1. **Define:** explain the idea in one sentence without repeating the heading.
> 2. **Predict:** before rerunning the smallest example above, state the result.
> 3. **Vary:** change one input, parameter, or assumption and explain what should change.
> 4. **Challenge:** name one common misconception or failure mode.
> 5. **Apply:** complete the smallest practice task before moving on.

## 9. Runtimes [CORE]

| Runtime | Shape | Wins when | Loses when |
|---|---|---|---|
| **llama.cpp** | C++, GGUF, CPU and GPU, broad hardware support | Apple silicon, CPU inference, single user, aggressive quantization, embedded in an app | High-concurrency serving |
| **Ollama** | Wraps llama.cpp with model management | You want it working in one command; local development | You need control over serving parameters |
| **LM Studio** | GUI over llama.cpp | Exploration, non-technical users, quick comparison | Automation and production |
| **vLLM** | Python, CUDA-focused, PagedAttention, continuous batching | Many concurrent users on NVIDIA hardware | Apple silicon; single-user; tight memory |
| **TensorRT-LLM** | NVIDIA compiled kernels | Maximum NVIDIA throughput, willing to pay operational complexity | Anything else |
| **SGLang / TGI** | Serving frameworks with prefix caching and structured output | Production serving with a specific feature need | Simplicity |

`[VERIFY: this landscape changes every few months @ current project docs]`

**The distinction that actually decides it:** llama.cpp optimizes single-stream latency on diverse hardware with aggressive quantization. vLLM optimizes aggregate throughput for many concurrent sequences on NVIDIA GPUs. **They are not competitors; they are different products.**

Saying "vLLM is faster than llama.cpp" is wrong in both directions without qualification. For one user on a MacBook, vLLM is not an option. For fifty concurrent users on an A100, llama.cpp will be several times slower in aggregate. The right answer names the workload.

**PagedAttention**, vLLM's central idea, is worth being able to explain: allocate KV cache in fixed-size blocks like operating-system virtual memory pages, rather than one contiguous reservation per sequence sized to the maximum. This eliminates the internal fragmentation that comes from reserving 32k of cache for a sequence that finishes at 400 tokens, which in practice is most of the waste. The result is many more concurrent sequences in the same memory, and it is the main reason vLLM's throughput advantage is as large as it is.


> **Concept checkpoint — 9. Runtimes**
>
> 1. **Define:** explain the idea in one sentence without repeating the heading.
> 2. **Predict:** before rerunning the smallest example above, state the result.
> 3. **Vary:** change one input, parameter, or assumption and explain what should change.
> 4. **Challenge:** name one common misconception or failure mode.
> 5. **Apply:** complete the smallest practice task before moving on.

## 10. Throughput and latency [CORE]

**The metrics, and what each one is for:**

| Metric | Measures | Who feels it |
|---|---|---|
| **TTFT** | Time to first token | The user, as "is it responding" |
| **TPS (per stream)** | Tokens per second in one response | The user, as reading speed |
| **Aggregate throughput** | Total tokens per second across all requests | Your cost per token |
| **Inter-token latency** | Gap between tokens | Perceived smoothness |
| **p95 / p99 latency** | Tail | The users who complain |

**The asymmetry that explains everything**, from `06` section 7:

- **Prefill** is compute-bound and parallel over the prompt. TTFT scales with prompt length.
- **Decode** is memory-bandwidth-bound and strictly sequential. TPS is roughly bandwidth divided by model size in bytes.

**A useful estimate:** if your memory bandwidth is B GB/s and the model is W GB, the ceiling is about `B / W` tokens per second for a single stream. Real numbers fall below this because of attention overhead and imperfect utilization, but it tells you what is achievable and whether your setup is badly misconfigured.

`[UNVERIFIED: run the benchmark in section 12 and compare against this estimate. A large gap means something is wrong: partial offload, thermal throttling, or a build without the right acceleration.]`

**Batching helps aggregate throughput dramatically and does not help TTFT.** One weight read serves every sequence in the batch, so decode throughput scales nearly linearly with batch size until memory runs out. But an individual user's first token does not arrive sooner, and may arrive later if they waited for a batch to form.

**Continuous batching** fills a finished sequence's slot immediately rather than waiting for the whole batch. Under mixed request lengths this is a large improvement, and it is why it is standard in serving frameworks.

**Speculative decoding** is worth knowing by name: a small draft model proposes several tokens, the large model verifies them in one forward pass, and accepted tokens are free. It exploits the fact that verification is parallel while generation is not. Gains depend entirely on acceptance rate, which depends on how well the draft model matches. `[VERIFY: implementation support varies by runtime @ current docs]`


> **Concept checkpoint — 10. Throughput and latency**
>
> 1. **Define:** explain the idea in one sentence without repeating the heading.
> 2. **Predict:** before rerunning the smallest example above, state the result.
> 3. **Vary:** change one input, parameter, or assumption and explain what should change.
> 4. **Challenge:** name one common misconception or failure mode.
> 5. **Apply:** complete the smallest practice task before moving on.

## 11. Serving and networking [CORE]

**The OpenAI-compatible API is the de facto standard**, which is genuinely useful: your application code does not change when you swap between a local model and a hosted one, and every client library works.

```bash
llama-server \
  -m models/model.gguf \
  --host 0.0.0.0 \
  --port 8080 \
  --ctx-size 8192 \
  --parallel 4 \
  --n-gpu-layers 999
```

`[VERIFY: flag names and defaults change between releases @ llama-server --help]`

**`--parallel` is the flag to set deliberately.** It caps concurrent sequences, and each one needs its own KV cache. With `--ctx-size 8192` and `--parallel 4` you are budgeting four times the cache of a single stream. Leaving it high "just in case" is how a server that worked yesterday fails to allocate today.

**Never expose the inference server directly.** `llama-server` has no authentication worth the name, and `--host 0.0.0.0` on an untrusted network exposes an unauthenticated endpoint that will happily consume all your hardware for anyone who finds it.

The pattern:

```
client → Tailscale (or VPN) → reverse proxy (auth, TLS, rate limit) → inference server on 127.0.0.1
```

Tailscale is a good choice here and worth understanding correctly: it gives you an authenticated private network, so the machine is not reachable from the public internet at all. That is a strong perimeter. It is not a substitute for authentication *within* that network, which matters as soon as more than one person or one device is on it.

The reverse proxy adds what the inference server lacks: API keys or OAuth, TLS, per-client rate limiting, request size limits, and access logs. Nginx or Caddy, twenty lines of config.

**Also worth having:** a request timeout, since a pathological prompt can occupy the server indefinitely; a maximum prompt length, enforced before the model sees it; and a health endpoint your clients can check.

**Docker**, when you want reproducibility:

```dockerfile
FROM ghcr.io/ggml-org/llama.cpp:server
COPY models/model.gguf /models/model.gguf
EXPOSE 8080
ENTRYPOINT ["/llama-server", "-m", "/models/model.gguf", \
            "--host", "0.0.0.0", "--ctx-size", "8192"]
```

`[VERIFY: image name and tag @ the llama.cpp repository]` Note that GPU passthrough is straightforward for NVIDIA with the container toolkit and **not available for Apple silicon**, since Docker on macOS runs a Linux VM with no Metal access. Containerizing on a Mac gives you CPU-only inference, which is usually not what you want. This surprises people and is a good thing to know before you spend an afternoon on it.


> **Concept checkpoint — 11. Serving and networking**
>
> 1. **Define:** explain the idea in one sentence without repeating the heading.
> 2. **Predict:** before rerunning the smallest example above, state the result.
> 3. **Vary:** change one input, parameter, or assumption and explain what should change.
> 4. **Challenge:** name one common misconception or failure mode.
> 5. **Apply:** complete the smallest practice task before moving on.

## 12. Benchmarking [CORE]

**The rule: never quote a throughput number you did not measure on the hardware you are describing.** This is both an engineering discipline and the thing that makes your interview answers credible.

**What to measure:**

| Measure | Why |
|---|---|
| TTFT at several prompt lengths | Prefill scaling |
| TPS at several context lengths | Decode, and cache pressure |
| Aggregate throughput at several concurrency levels | Serving capacity |
| Memory at peak, not at idle | Whether you actually fit |
| Quality on your own eval set | The number everyone forgets |

**Method that produces defensible numbers:**

1. **Warm up.** The first request loads weights and compiles kernels. Discard it.
2. **Fix everything** you are not varying: prompt, sampling parameters, seed, context size.
3. **Repeat and report a distribution.** Median and p95, not a single run.
4. **Vary one thing at a time.**
5. **Record the environment**: model file and its hash, runtime version, flags, OS, hardware, thermal state.
6. **Watch for thermal throttling**, especially on laptops. A sustained benchmark on a MacBook will be slower than a short one, and reporting the short one is misleading.

```bash
# llama.cpp's own benchmark: prompt processing (pp) and text generation (tg)
llama-bench -m models/model.gguf -p 512 -n 128 -r 5

# Vary context to see cache pressure
llama-bench -m models/model.gguf -p 512 -n 128 -c 4096
llama-bench -m models/model.gguf -p 512 -n 128 -c 16384
```

A minimal harness against the OpenAI-compatible endpoint, which measures what your application will actually see:

```python
import statistics
import time

import httpx


def measure(client: httpx.Client, prompt: str, max_tokens: int = 128) -> dict:
    """One request. Returns TTFT and decode rate, measured from the stream."""
    start = time.perf_counter()
    first_token_at = None
    tokens = 0

    with client.stream(
        "POST",
        "/v1/chat/completions",
        json={
            "model": "local",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
            "temperature": 0,
            "stream": True,
        },
        timeout=300.0,
    ) as response:
        response.raise_for_status()
        for line in response.iter_lines():
            if not line.startswith("data: ") or line == "data: [DONE]":
                continue
            if first_token_at is None:
                first_token_at = time.perf_counter()
            tokens += 1

    end = time.perf_counter()
    if first_token_at is None:
        raise RuntimeError("no tokens received")

    decode_seconds = end - first_token_at
    return {
        "ttft": first_token_at - start,
        "total": end - start,
        "tokens": tokens,
        "tps": tokens / decode_seconds if decode_seconds > 0 else float("nan"),
    }


def run(base_url: str, prompt: str, runs: int = 5) -> None:
    with httpx.Client(base_url=base_url) as client:
        measure(client, prompt, max_tokens=8)          # warm-up, discarded
        results = [measure(client, prompt) for _ in range(runs)]

    for key in ("ttft", "tps"):
        values = sorted(r[key] for r in results)
        print(
            f"{key:5s} median {statistics.median(values):7.3f}  "
            f"min {values[0]:7.3f}  max {values[-1]:7.3f}"
        )
```

`[UNVERIFIED: this harness is structurally correct and was not run against a live server in this environment, since no local model is available here. Run it against your own llama-server and record the numbers in your repository.]`

**Cost comparison against a hosted API**, done honestly:

```
local cost per token = (hardware amortized + power) / tokens actually generated
```

The denominator is where the argument is usually lost. Hardware amortized over three years at 5% utilization is expensive per token; at 60% utilization it is cheap. **Utilization is the whole argument**, and a comparison that ignores it is marketing. Include your own time as an operational cost, because it is real.


> **Concept checkpoint — 12. Benchmarking**
>
> 1. **Define:** explain the idea in one sentence without repeating the heading.
> 2. **Predict:** before rerunning the smallest example above, state the result.
> 3. **Vary:** change one input, parameter, or assumption and explain what should change.
> 4. **Challenge:** name one common misconception or failure mode.
> 5. **Apply:** complete the smallest practice task before moving on.

## 13. Troubleshooting [CORE]

| Symptom | Likely cause | Diagnostic | Fix |
|---|---|---|---|
| Out of memory at load | Weights exceed the GPU limit | Compare file size against the wired limit | Smaller quant, raise `iogpu.wired_limit_mb`, fewer offloaded layers |
| Loads fine, OOM under use | KV cache with concurrency | Compute cache size × `--parallel` | Lower `--ctx-size` or `--parallel`; quantize the cache |
| Very slow, GPU idle | Running on CPU, or partial offload | Check the layer offload count in the startup log | `--n-gpu-layers 999`; check the build has acceleration |
| Fast at first, slows over a session | Cache growing with conversation length | Watch memory during the session | Cap context; truncate history |
| Fast short answers, slow start on long prompts | Prefill is compute-bound | Measure TTFT separately from TPS | Shorter prompts; prompt caching |
| Output is gibberish | Wrong chat template, or a corrupt file | Print the template; verify the file hash | Re-download; use the correct template |
| Model ignores the system prompt | Template mismatch in the GGUF | Compare the rendered prompt against the model card | Override the template explicitly |
| Quality far below expectations | Over-quantized, or a bad imatrix | Compare against a higher quant on your eval set | Higher quant; a differently calibrated file |
| Repeats itself endlessly | Sampling settings, or a template that never emits a stop token | Check repeat penalty and stop tokens | Fix stop tokens first; sampling second |
| Degrades after ~N thousand tokens | Context extension beyond native training length | Note where it starts | Stay within the native window |
| Sustained runs slower than short ones | Thermal throttling | `powermetrics` or equivalent during the run | Report sustained numbers; improve cooling |
| Works locally, fails from another device | Bound to localhost, or firewall | `curl` from the other device | `--host 0.0.0.0`; check Tailscale ACLs |

**The two most under-diagnosed problems**, worth naming explicitly:

**Wrong chat template.** The model produces text that is fluent and subtly wrong: it ignores the system prompt, answers a different question, or continues rather than responding. It looks like a model quality problem and it is a formatting problem. Print the fully rendered prompt, including special tokens, and compare it against the model card. This is the first thing to check whenever a model "seems dumber than it should be".

**Partial GPU offload.** With some layers on CPU and some on GPU, every token crosses the boundary. Throughput can be worse than pure CPU. The startup log tells you how many layers were offloaded; if it is not all of them and you expected it to be, that is your answer.

---


> **Concept checkpoint — 13. Troubleshooting**
>
> 1. **Define:** explain the idea in one sentence without repeating the heading.
> 2. **Predict:** before rerunning the smallest example above, state the result.
> 3. **Vary:** change one input, parameter, or assumption and explain what should change.
> 4. **Challenge:** name one common misconception or failure mode.
> 5. **Apply:** complete the smallest practice task before moving on.

## Worked example: choosing a configuration

The reasoning to be able to reproduce under interview conditions.

**Scenario.** Private document Q&A over internal policies. Data cannot leave the network. Five concurrent users, prompts around 3,000 tokens because RAG chunks are long, answers around 300 tokens. Available: one machine, 32 GB unified memory.

**Step 1: what is the workload shaped like?** Long prompt, short answer. So prefill dominates TTFT and matters more than raw decode speed. A user waits for retrieval plus prefill before seeing anything.

**Step 2: memory budget.**

```
32 GB × 0.75 default wired limit = 24 GB usable
```

Five concurrent users at 4,096 context, GQA at 64 layers / 8 KV heads / 128 head dim:

```
0.25 GB per 1024 tokens × 4 × 5 users  = 5.00 GB of KV cache
compute buffers                        ≈ 1.5 GB
headroom at 20%                        ≈ 4.8 GB
                                         -------
available for weights                  ≈ 12.7 GB
```

**Step 3: pick the model against that budget.** A 27B at Q3_K_M is 12.29 GB, which fits with almost nothing spare and is below the quality threshold where format following holds up. A 14B at Q5_K_M is 9.24 GB and leaves real headroom. **The 14B at higher precision is the better engineering choice**, and the reasoning is what matters: you are trading parameter count against quantization damage, and below Q4 the damage lands on exactly the capabilities a RAG system needs, namely instruction following and long-context coherence.

**Step 4: settle the parameters.**

```bash
llama-server -m qwen-14b-q5_k_m.gguf \
  --ctx-size 4096 --parallel 5 --n-gpu-layers 999 --host 127.0.0.1
```

Behind an authenticating reverse proxy, on a Tailscale network.

**Step 5: verify the assumptions.** Measure peak memory under five concurrent requests, not at idle. Measure TTFT at 3,000-token prompts, since that is the number users feel. Run your eval set against both candidate models, because the whole argument in step 3 is a prediction until you check it.

**Step 6: know your fallback.** If quality is insufficient at 14B, the options in order are a better model at the same size, then a higher quant of the same model with a lower context or less concurrency, then the hybrid: local for routine queries, hosted for flagged hard ones, with the privacy boundary explicit and documented.

**Why this is the interview answer.** It names the workload shape, does the arithmetic, makes a tradeoff and justifies it, states what would falsify the reasoning, and has a fallback. A candidate who says "I'd use a 27B, it's better" has answered a different and easier question.

---

> **Interview mode (optional on the first pass):** return here after the Learn and Build work. Practice the 60-second answer only after you can explain the mechanism and complete the example.

## Interview angle

**1. How do you decide what model fits on a given machine?**

*Strong outline:* Four terms, not one: weights, KV cache, compute buffers, framework overhead, plus 15 to 25% headroom. Weights are params × bits / 8. Cache is 2 × layers × kv_heads × d_head × seq_len × batch × bytes, and the batch term is what catches people when they enable concurrency, since weights are shared across sequences and cache is not. Then the platform ceiling: on unified memory the GPU wired limit is roughly 75% of RAM by default, not the full RAM; on discrete GPUs VRAM is a hard wall and spilling over PCIe is an order-of-magnitude penalty. Give a worked number if there is a whiteboard.

*Weak answer:* "Check if the model file is smaller than the RAM." Ignores three of the four terms and the platform ceiling.

**2. Why does quantization make inference faster, not just smaller?**

*Strong outline:* Decode is memory-bandwidth-bound: every weight is read for every generated token, and the arithmetic per token is trivial. Halving the bytes roughly halves the read time, so it is a genuine two-for-one rather than a pure memory saving. Then the nuance: prefill is compute-bound, so quantization helps it much less, which is why a long-prompt short-answer workload benefits less than a chat workload. And the cost: degradation lands first on long-context coherence and format following, not on short factual accuracy, which is why benchmark scores hide it.

*Weak answer:* "Smaller models are faster." True by accident, and it misses the mechanism, which is the question.

**3. When would you use vLLM rather than llama.cpp?**

*Strong outline:* They solve different problems. vLLM for many concurrent sequences on NVIDIA hardware, where PagedAttention and continuous batching give large aggregate throughput gains. llama.cpp for single-stream latency, diverse hardware including Apple silicon, aggressive quantization, and embedding in an application. For one user on a MacBook, vLLM is not an option. For fifty concurrent users on an A100, llama.cpp is several times slower in aggregate. Explain PagedAttention: KV cache in fixed-size blocks like OS pages, eliminating the fragmentation of reserving max-length contiguous cache per sequence, which is where most of the waste is.

*Weak answer:* "vLLM is faster." Wrong in both directions without naming the workload.

**4. Your local model is much slower than expected. How do you diagnose it?**

*Strong outline:* Separate TTFT from tokens per second first, because they have different causes. Then check the startup log for how many layers were offloaded, since partial offload means every token crosses the CPU-GPU boundary and can be slower than pure CPU. Check the build has the right acceleration compiled in. Estimate the ceiling as memory bandwidth divided by model size in bytes and compare; a large gap means misconfiguration rather than physics. Check whether context has grown, since cache pressure degrades things over a long session. Check thermal throttling on a laptop, where a sustained run is slower than a short one. And measure rather than guess at each step.

*Weak answer:* "Use a smaller model." Might work, and skips the diagnosis, which is what is being tested.

**5. Explain the tradeoff between model size and quantization level.**

*Strong outline:* Both reduce memory and both cost quality, through different mechanisms. A smaller model has less capacity; a quantized model has the same capacity expressed imprecisely. The practical finding is that a smaller model at Q4 or better usually beats a larger model at Q2, because sub-3-bit damage concentrates in instruction following, format adherence and long-context coherence, which are exactly what production systems depend on, while short factual accuracy survives longest and is what benchmarks measure. So: prefer higher precision on a smaller model unless you have measured otherwise on your own task. Mention imatrix and dynamic quantization as the reason low-bit quants are better than they used to be, since bits are allocated by measured importance rather than uniformly.

*Weak answer:* "Bigger is better, quantize as needed." Backwards below Q3, and unmeasured.

**6. How would you serve a local model to a team securely?**

*Strong outline:* Never expose the inference server directly; it has no meaningful authentication and `--host 0.0.0.0` on an untrusted network gives anyone who finds it your whole machine. The layering is a private network such as Tailscale or a VPN for the perimeter, then an authenticating reverse proxy adding API keys, TLS, per-client rate limits and request size caps, then the inference server bound to localhost. Add request timeouts, since a pathological prompt can occupy the server indefinitely, and a maximum prompt length enforced before the model sees it. Note that a private network is a perimeter, not authentication within it, which matters as soon as there is more than one user.

*Weak answer:* "Put it on the VPN." Perimeter only, no authentication, no rate limiting, no protection from a colleague's compromised laptop.

**7. Is running locally cheaper than an API?**

*Strong outline:* It depends entirely on utilization, and a comparison that does not state utilization is marketing. Local cost per token is amortized hardware plus power divided by tokens actually generated, so at 5% utilization it is expensive and at 60% it is cheap. Include your own operational time, which is real and usually omitted. Then be clear that cost is often not the deciding factor: privacy constraints, version pinning so evaluations do not silently expire, and offline operation each decide on their own. And note the ceiling you accept, since frontier-quality models are not generally available as weights.

*Weak answer:* "Local is cheaper at scale." Directionally right and unquantified, and it misses that cost is frequently the wrong axis.

**8. What is the KV cache costing you, and what can you do about it?**

*Strong outline:* Give the formula and a number. Then the four levers: grouped-query attention, which is a model property rather than a setting and typically cuts it 4x; quantizing the cache to 8 bits, which halves it at a quality cost that is higher per bit than weight quantization; reducing context length, which is the bluntest and most effective; and reducing concurrency, since cache is per sequence while weights are shared. Then the operational consequence: doubling your context window halves how many sequences fit, which halves batch size, which cuts decode throughput, so context length is a capacity decision rather than a configuration flag.

*Weak answer:* Reciting the formula without the levers or the throughput consequence.

**9. A teammate says the local model "seems dumber" than the hosted one. What do you check first?**

*Strong outline:* Before concluding anything about the model, check the chat template. GGUF ships the template inside the file, and a wrong or mismatched one produces fluent, subtly wrong output: the system prompt ignored, a different question answered, continuation instead of response. Print the fully rendered prompt including special tokens and compare against the model card. Second, check the quantization level and whether the failures are concentrated in format following and long context, which is the signature of over-quantization rather than a weak model. Third, check sampling parameters, since a default repeat penalty or temperature can differ substantially from the hosted API's. Only then compare models on an eval set. Point out that "seems dumber" is not a measurement, and the first real move is to get one.

*Weak answer:* "Local models are worse than frontier models." Often true and it skips three cheap, common, fixable causes.

**10. Design a local inference setup for a specific requirement.**

*Strong outline:* Work the example above out loud. Characterize the workload shape first, since long-prompt-short-answer and short-prompt-long-answer have different bottlenecks. Do the memory arithmetic with all four terms and the platform ceiling. Choose model size against quantization level with the reasoning stated. Set serving parameters deliberately, especially concurrency, because it multiplies the cache. Then say how you would verify: peak memory under concurrent load rather than idle, TTFT at realistic prompt lengths, and quality on a task-specific eval set. Finish with the fallback if quality is insufficient, including the hybrid option with an explicit privacy boundary.

*Weak answer:* Naming a model and a runtime without the arithmetic. The arithmetic is the answer.

### Follow-up questions to expect

- After 1: *"You doubled the context window and throughput collapsed. Why?"* KV cache scales linearly with context, so doubling it halves how many sequences fit in the same memory, which halves batch size, and decode throughput depends heavily on batching. You traded throughput for context. Fixes: GQA if the model offers it, KV quantization, paged attention, or accepting the smaller batch.
- After 5: *"How would you actually decide between a 14B at Q5 and a 27B at Q2?"* Not from benchmarks. Build a task-specific eval set, run both, stratify results by prompt length and format complexity, since that is where low-bit damage concentrates. Measure TTFT and TPS for each. Then decide with both numbers in front of you, and be willing to be surprised.

### 60-second and 5-minute answers

1. How you decide what fits on a machine
2. Why quantization speeds up decode but not prefill
3. When local beats hosted, and when it does not
4. Diagnosing slow local inference

---

## Practice tasks

> **Build mode:** attempt the smallest exercise without looking at the solution, then complete the module project as the exit condition.

Solutions and delayed practice are in the [09 practice pack](quizzes/09-local-inference-practice.md).

### Five tiny exercises

1. For a model you actually run, read `n_layer`, `n_head_kv` and `n_embd_head_k` from the loader output and compute its KV cache per 1,000 tokens. Compare against the file size.
2. Compute the largest context that fits on your machine at your current quantization, then test it. If your calculation was wrong, find out which term you underestimated.
3. Raise `iogpu.wired_limit_mb` and measure whether anything improves. Record both numbers. Then set it too high deliberately and observe what swapping does to throughput.
4. Print the fully rendered prompt, special tokens included, that your runtime sends to the model. Compare it against the model card's documented template, character by character.
5. Estimate your machine's tokens-per-second ceiling as memory bandwidth divided by model bytes. Measure the real figure. Explain the gap.

### Three realistic coding tasks

1. **Benchmark harness.** Extend section 12's harness to sweep prompt length (128, 512, 2048, 8192) and concurrency (1, 2, 4, 8). Output a table of TTFT and TPS medians with p95. Record the environment alongside the results. This table is a portfolio artifact.
2. **Quantization quality study.** Take one model at three quantization levels and one eval set of at least 30 task-specific cases. Measure quality, TTFT, TPS and peak memory for each. Stratify quality by prompt length. Write up which level you would ship and why. **This is the single most interview-valuable thing in this module**, because almost nobody has done it.
3. **Production serving setup.** llama-server on localhost, behind Caddy or nginx with API key auth, TLS, per-client rate limiting, request size limits and access logging, reachable over Tailscale. Then attack your own setup: hit it without a key, with an oversized prompt, with fifty concurrent requests. Document what broke.

### One mini-project

**Local model decision record.**

Produce an ADR-style document for your own setup, answering:

- What are you optimizing for: latency, throughput, quality, privacy, cost?
- What are the memory constraints, computed with all four terms?
- What did you measure, on what hardware, with what method?
- Which configurations did you compare, and how did they score on your eval set?
- What did you choose and why, including what you gave up?
- What would change your mind?

Success criterion: someone else could reproduce your measurements from the document. That is the bar for a decision record, and it is also the bar for a claim you plan to make in an interview.

---

## Mastery checklist

- [ ] Compute total memory footprint from model, context and concurrency, including the platform ceiling
- [ ] Explain why a 12.29 GB model fails on a 16 GB Mac
- [ ] Explain why Q2_K is larger than IQ3_XXS
- [ ] Explain what an importance matrix does and why the calibration corpus matters
- [ ] Say where quantization degrades first, and why benchmarks hide it
- [ ] Explain why decode is bandwidth-bound and prefill is compute-bound
- [ ] Estimate a tokens-per-second ceiling from memory bandwidth and model size
- [ ] Say when vLLM beats llama.cpp and when it does not, by workload
- [ ] Explain PagedAttention and the fragmentation it eliminates
- [ ] Explain why batching helps aggregate throughput but not TTFT
- [ ] Describe a secure LAN serving setup and say what a VPN does not give you
- [ ] Design a benchmark whose numbers you would defend, including warm-up and thermal state
- [ ] Diagnose slow inference without guessing, in a stated order
- [ ] Name the two most under-diagnosed local inference failures
- [ ] State the honest cost comparison, including the utilization term
- [ ] Complete the quantization quality study with your own numbers

Fewer than thirteen of sixteen means go back. This module is heavily interview-tested for the roles you want.

---

## Connections

**Backward:**

- `06` section 7's KV cache formula is the whole of Part 1. This module is that formula applied to hardware you own.
- `06` section 8's quantization degradation ordering is why section 7 recommends smaller-at-higher-precision.
- `02` section 11's HTTP material is the serving layer; section 12's concurrency model is why a thread pool can serve a local model.
- `01b` section 9.1's client design is what talks to `llama-server`, and the timeouts matter more here because a local server has no provider-side limit.

**Forward:**

- `07-rag-and-vector-search.md` in a local deployment means embedding model, reranker and generator all competing for the same memory. Budget all three, not just the generator.
- `10-mlops-and-deployment.md` takes the serving setup into production: monitoring, health checks, rollback and capacity planning.
- `11-ai-system-design.md` uses the local-first private copilot as one of its four walkthroughs, and section 5's reasoning is the core of that answer.
- `projects/project-2-rag-app.md` can use your local model, which makes the memory budget a real constraint rather than an exercise.

---

## Volatile claims

Nearly everything here except the arithmetic.

| Claim | Why it decays | Re-check against |
|---|---|---|
| Bits-per-weight figures per quant type | Approximate; vary by model and by how embedding and output layers are handled | The actual `.gguf` file size |
| llama.cpp flag names and defaults | Change between releases | `llama-server --help` |
| Runtime comparison table | The fastest-moving part of this stack | Current project docs |
| Qwen3.6-27B architecture specifics | After my training cutoff | Your loader's startup output |
| macOS 75% wired-limit default | OS behavior, may change | `sysctl iogpu.wired_limit_mb` |
| Docker image names and tags | Routine churn | The llama.cpp repository |
| Speculative decoding support | Varies by runtime and moves quickly | Current docs |
| Every throughput figure | Hardware-specific by definition | Your own benchmark |

The memory formula, the prefill/decode asymmetry, the bandwidth reasoning, and the security layering are stable. Everything naming a tool or a version is not.

**Next review due:** 2026-12-18, or when you next upgrade llama.cpp. This module has the shortest review interval in the repository for a reason.
