# Technical Audit — DesignAlign Token Hierarchy

*Source: NotebookLM deep research, 2026-08-22*
*61 citations from industry standards, enterprise frameworks, and academic sources*

## Key Findings

### Our 6 layers are validated but need expansion to 8

**Layers 1-2 (Palette, Roles):** Fully aligned with W3C DTCG standard. No issues.

**Layers 3-6 (Elements, Hierarchy, Structure, Rhythm):** Novel and defensible. No major framework has tokenized these. BUT:

### Structural Overlaps Found

1. **Hierarchy (L4) ↔ Rhythm (L6):** Typographic scale sizes mathematically dictate line-heights. Separating them risks breaking vertical baseline grids. Typography is a composite — font size, weight, AND line-height are one decision, not two.

2. **Elements (L3) ↔ Structure (L5):** Component internal padding overlaps with page-level grid gutters. When rendering a multi-column slide, card padding vs column gutter becomes blurred.

### Three Missing Dimensions

1. **Editorial Mechanics (proposed Layer 7):** Word-count limits, heading style (sentence-case vs title-case), action-title rules (McKinsey-style insight sentences), hedging tolerance. The WRITING is as branded as the visuals.

2. **Asset Semantics (proposed Layer 8):** Logo placement rules, clear space, photo treatment (grayscale, brand overlay), icon style (stroke weight, family). Without this, AI mispositions logos and uses clashing stock art.

3. **Data Visualization:** Chart axis styling, gridline density, highlight colors, direct labels vs legends. Not captured in any layer.

### Enterprise Framework Comparison

| Framework | What they add that we don't |
|-----------|---------------------------|
| **Apple HIG** | Dynamic type scaling (size↔tracking↔leading linked), depth materials, safe areas |
| **Material Design** | Density modes (compact/comfortable/spacious as a system-wide modifier), 8dp grid |
| **McKinsey** | Single-accent logic, 2/3-1/3 layout ratio, action-led title sentences |
| **Duarte** | 3-second rule (slide comprehension limit), eye-flow vectors, 30-word slide caps |

### Competitive Landscape

- **Google DESIGN.md:** Plain-text design contract in repos. YAML frontmatter + markdown rationale. Tokenizes spacing scales and layout.
- **SlideSpeak Onbrand:** MCP server that serves pre-built slide templates as tokens. Real-time brand compliance checks.
- **Human Standards:** Relational spacing grammar (attached/associated/grouped/separated/sectional) — relationships not pixels.

### The Math Problem (Hierarchy ↔ Rhythm)

Typography scale: T_n = T_base × φ^n
Spacing scale: R_m = m × δ (base unit)
Line-height alignment: H_n = ceil((T_n × λ) / δ) × δ

If you change a type scale size without recalculating line-height, the vertical rhythm breaks. Hierarchy and Rhythm MUST be coordinated programmatically.

## Recommendation: 8-Layer Architecture

1. **Palette** — raw values (W3C)
2. **Roles** — semantic mapping (W3C)
3. **Elements** — component treatments
4. **Hierarchy** — type scale, emphasis, visual weight
5. **Structure** — page grid, regions, proportions
6. **Rhythm** — spacing grammar, density, cadence
7. **Editorial Mechanics** — word counts, heading style, tone constraints
8. **Asset Semantics** — logo rules, photo treatment, icon style

Layers 7 and 8 are what make a "correct" document look "professional." Without them, the output is technically on-brand but generically assembled.
