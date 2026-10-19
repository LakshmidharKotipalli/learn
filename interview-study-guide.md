# Interview Study Guide

One page that tells you what to open, in what order, for every interview topic. Each row links the four things you need: the module that **teaches** it, the hub page that goes **deeper**, the practice pack that **tests** it, and where the **interview questions** live.

---

## How to use this site

1. **Pick a plan** below that matches the time you have.
2. **Work topic by topic** using the matrix. Read the module, then do its practice pack at least a day later.
3. **Mark each page complete** with the button at the top of the page. Progress is saved in your browser and shown on the home page and in the sidebar.
4. **Search** (top bar) covers every module, practice pack and deep-dive page.
5. **Say answers aloud.** Every module ends with interview questions; explaining is the skill being tested.

---

## Pick a plan

| Time left | What to do |
|---|---|
| **48 hours** | [12a section 7, the 48-hour checklist](12a-interview-framework.md#7-the-48-hour-checklist), then [14 section 5, the 48-hour skim](14-concept-map.md#5-the-48-hour-skim). Nothing else. |
| **2 weeks** | The **Must** rows of the matrix below: module interview sections, then the practice pack, then [12b](12b-interview-question-bank.md). Run one mock from [12a section 6](12a-interview-framework.md#6-mock-interview-schedules) per week. |
| **6 to 8 weeks** | Every row of the matrix in order, one or two topics a week, plus Project 2 or 3. Use the [roadmap compression rules](00-north-star-roadmap.md#7-compression-rules). |
| **24 weeks** | The full [roadmap](00-north-star-roadmap.md). This page becomes your revision index. |

---

## Topic matrix

**Priority:** Must = asked in almost every AI engineering loop. Should = asked often. Nice = differentiator.

### Coding and engineering

| Topic | Priority | Learn | Deep dive | Practice |
|---|---|---|---|---|
| Python core | Must | [01a Python Core](01a-python-core.md) | | [01a pack](quizzes/01a-python-core-practice.md) |
| Python patterns, OOP, typing, testing | Must | [01b Patterns and OOP](01b-python-patterns-and-oop.md) | | [01b pack](quizzes/01b-python-patterns-practice.md) |
| Data structures and algorithms | Must | [01c Interview DSA](01c-python-interview-dsa.md) | | [01c pack](quizzes/01c-python-dsa-practice.md) |
| Git, CI, testing, HTTP, concurrency | Should | [02 Software Engineering](02-software-engineering-foundations.md) | | [02 pack](quizzes/02-software-engineering-practice.md) |
| SQL and statistics | Should | [03 Data and SQL](03-data-and-sql.md) | | [03 pack](quizzes/03-data-sql-practice.md) |

### Machine learning

| Topic | Priority | Learn | Deep dive | Practice |
|---|---|---|---|---|
| Classical ML, metrics, leakage, drift | Should | [04 Classical ML](04-machine-learning.md) | | [04 pack](quizzes/04-machine-learning-practice.md) |
| Deep learning and training diagnosis | Should | [05 Deep Learning](05-deep-learning.md) | | [05 pack](quizzes/05-deep-learning-practice.md) |

### AI engineering

| Topic | Priority | Learn | Deep dive | Practice |
|---|---|---|---|---|
| Transformers and LLMs | Must | [06 Transformers and LLMs](06-transformers-and-llms.md) | [Large Language Models](docs/hub/large-language-models.html), [LLM Benchmarks](docs/hub/llm-benchmark-guide.html) | [06 pack](quizzes/06-transformers-practice.md) |
| Multimodal models | Nice | [06 Transformers and LLMs](06-transformers-and-llms.md) | [Vision-Language Models](docs/hub/vision-language-models.html) | |
| RAG and vector search | Must | [07 RAG](07-rag-and-vector-search.md) | [RAG deep dive](docs/hub/retrieval-augmented-generation.html), [LangChain](docs/hub/langchain.html) | [07 pack](quizzes/07-rag-practice.md) |
| Agents, tools and MCP | Must | [08 Agents](08-agents-tools-and-mcp.md) | [AI Agents and MCP](docs/hub/ai-agents-mcp-ecosystem.html), [LangGraph](docs/hub/langgraph.html) | [08 pack](quizzes/08-agents-practice.md) |
| AI coding assistants | Nice | | [Claude Code Mastery](docs/hub/claude-code-mastery.html), [Claude Code Ecosystem](docs/hub/claude-code-ecosystem.html) | |
| Local inference and serving | Should | [09 Local Inference](09-local-llm-inference.md) | | [09 pack](quizzes/09-local-inference-practice.md) |

### Production and system design

| Topic | Priority | Learn | Deep dive | Practice |
|---|---|---|---|---|
| MLOps, deployment, monitoring | Must | [10 MLOps](10-mlops-and-deployment.md) | [Docker](docs/hub/docker-ecosystem.html), [Kubernetes](docs/hub/kubernetes.html) | [10 pack](quizzes/10-mlops-practice.md) |
| AI system design | Must | [11 System Design](11-ai-system-design.md) | | [11 pack](quizzes/11-system-design-practice.md) |

### The interview itself

| Topic | Priority | Where |
|---|---|---|
| Answer structure and handling not knowing | Must | [12a Interview Framework](12a-interview-framework.md) |
| Cross-module questions | Must | [12b Part 1](12b-interview-question-bank.md#part-1-questions-spanning-modules-20) |
| Tradeoff judgment | Must | [12b Part 2](12b-interview-question-bank.md#part-2-tradeoff-judgment-15) |
| Production debugging scenarios | Must | [12b Part 3](12b-interview-question-bank.md#part-3-production-diagnostic-scenarios-10) |
| Behavioral and STAR stories | Must | [12c Behavioral and Projects](12c-interview-behavioral-and-projects.md) |
| Talking about your projects | Must | [13 Portfolio](13-project-portfolio.md), [Capstone narrative](capstone/04-interview-narrative.md) |
| Final revision | Must | [14 Concept Map](14-concept-map.md) |

---

## The revision loop

For each topic, in this order:

1. **Learn:** read the module, running every example. Predict output before you run it.
2. **Deep dive:** only if the topic is a Must for your target role, or the module left a gap.
3. **Practice:** the practice pack, at least one day after reading.
4. **Explain:** answer the module's interview questions aloud in 60 seconds, recorded.
5. **Track:** mark the page complete and log the review date in the [progress log](tracker/progress-log.md).
