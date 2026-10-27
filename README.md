<div align="center">

# 🧠 OmniBrief
### Autonomous Multimodal Research Agent & Executive Briefing Generator

[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_API-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**OmniBrief** is an autonomous intelligence agent that conducts deep, multi-step research across live web sources and user-uploaded reference documents, streaming its real-time reasoning trace directly to a glassmorphic dashboard before synthesizing publication-ready executive briefings with verified citations.

[Features](#-key-features) • [Architecture](#-architecture) • [Quickstart](#-quickstart) • [LinkedIn Demo Tips](#-how-to-present-on-linkedin)

</div>

---

## ⚡ Key Features

- 🔄 **Real-Time Agent Thought Stream (SSE):** Watch the agent formulate hypotheses, spawn targeted web searches, scrape web articles, and cross-reference citations in real time.
- 📄 **Multimodal Document RAG:** Drop research PDFs, whitepapers, or quarterly reports alongside your prompt to ground the research in your proprietary context.
- 🌐 **Autonomous Web Gathering:** Leverages concurrent search tools and automated HTML scraper pipelines to pull live sources and data metrics.
- 📑 **Publication-Ready Export:** Generates formatted markdown briefings featuring executive summaries, SWOT analysis, structured data tables, and print-ready PDF styling.
- 🛡️ **Offline & Online Resilience:** Seamlessly uses Gemini 2.5 Flash / Pro when configured, with built-in structured fallback synthesis for zero-friction local evaluations.

---

## 🏗️ Architecture

```mermaid
flowchart LR
    A[User Request + PDF] --> B[FastAPI SSE Server]
    B --> C[Agent Orchestrator]
    
    subgraph Execution Loop
        C --> D[1. Query Planning]
        C --> E[2. Web Search Tool]
        C --> F[3. Deep Scraping]
        C --> G[4. Multimodal PDF Parser]
    end
    
    Execution Loop --> H[Gemini 2.5 Flash / Pro]
    H --> I[Verified Briefing Engine]
    I -->|Real-time Stream| J[Glassmorphic UI / Dashboard]
```

---

## 🚀 Quickstart

### Option 1: Docker (Recommended)

```bash
git clone https://github.com/Navaneeth1324/omnibrief.git
cd omnibrief

# Copy env and add your GEMINI_API_KEY
cp .env.example .env

# Run container
docker-compose up --build
```
Open **`http://localhost:8000`** in your browser.

---

### Option 2: Local Setup

1. **Clone & Virtual Environment:**
   ```bash
   git clone https://github.com/Navaneeth1324/omnibrief.git
   cd omnibrief
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Add your key to .env:
   # GEMINI_API_KEY=your_key_here
   ```

3. **Run Application:**
   ```bash
   uvicorn omnibrief.api.server:app --reload --port 8000
   ```
   Navigate to **`http://localhost:8000`**.

4. **Run Tests:**
   ```bash
   pytest -v tests/
   ```

---

## 📱 How to Present on LinkedIn

A high-performing LinkedIn post for this project follows this proven formula:

1. **The Hook:** *"I got tired of spending 3 hours skimming 20 tabs to research emerging tech trends—so I built OmniBrief, an autonomous multimodal research agent."*
2. **The 45s Screen Recording:**
   - Record entering a prompt like: *"Future of solid-state batteries in EV aviation 2026"* with a sample PDF.
   - Show the live **Execution Trace** streaming: `[PLANNING] -> [SEARCHING] -> [READING] -> [SYNTHESIZING]`.
   - Scroll down to reveal the executive briefing with tables and citations.
3. **The Architecture Snapshot:** Include the Mermaid diagram image above.
4. **Call to Action:** Link to the GitHub repo in the first comment!

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
