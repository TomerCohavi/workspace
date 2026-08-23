# DesignAlign Business Model

## Core Insight (2026-08-22)

The schema is the product. The value split is **passive vs active** — unsupervised is free, supervised (harnessed) is paid. This applies at both stages: extraction and generation.

## Two Stages, Two Modes (2026-08-22)

### Stage 1: Extraction (scraping a design system into tokens)

| Mode | What happens | Cost |
|------|-------------|------|
| **Passive** | User runs Claude Code on their machine, fills in the token file themselves. No guardrails. | Free |
| **Active** | Our MCP harness guides the extraction — validates completeness across all 6 layers, catches gaps, ensures the token file is well-formed and thorough. | Paid |

### Stage 2: Generation (producing presentations/documents)

| Mode | What happens | Cost |
|------|-------------|------|
| **Passive** | User generates with Claude Code using the token file as context. No validation. Hope for the best. | Free |
| **Active** | Our MCP validator checks every output against the token file — colors, typography, spacing, structure, hierarchy, rhythm. Auto-fixes violations. | Paid |

## Why This Works (2026-08-22)

- The free path is genuinely useful — people get the schema and can DIY
- The paid path is genuinely better — supervised extraction catches what the user misses, supervised generation enforces what Claude forgets
- Both stages independently have passive/active modes — a user might pay for extraction harness but generate freely, or extract manually but pay for generation validation

## Open Questions (2026-08-22)

- Pricing model: per-extraction, per-generation, or subscription?
- Can pre-scraped design systems be a marketplace play? (extract once, sell the token file)
- How sophisticated does the active extraction harness need to be for layers 4-6 (hierarchy, structure, rhythm)?
- Legal: extracting public CSS values from websites — is this defensible?
