# DesignAlign — Project Brief

*Last updated: 2026-08-22*

## The Opportunity

Artifact systems (Claude Code, similar tools) have made it possible for anyone to generate rich HTML documents — presentations, one-pagers, briefing docs, reports — without touching PowerPoint, Keynote, or Google Slides. You bring your research, your ideas, your content, and you get a polished, presentable output.

But there's a problem: the output looks generic. It doesn't look like *your client's brand*. Walk into a meeting at Ben & Jerry's with a deck that uses the wrong fonts and random blues, and you look like an amateur. The content might be brilliant, but the visual language says "I don't know you."

## What We're Building

DesignAlign is a design system harness for AI-generated documents. It works in two stages:

**Stage 1 — Extraction:** Scrape an existing brand's visual identity (website, brand guidelines, existing materials) and compile it into a compact, structured token file. This happens once per brand. The output is a ~1KB JSON file that captures everything from color palette to spacing rhythm.

**Stage 2 — Generation:** When you generate a presentation, document, or any presentable artifact, the harness enforces that token file. Every color, font, spacing value, and layout pattern matches the brand. You walk into the room and they think you're one of them.

## Output Formats

This is not about websites. The outputs are:

- **Presentations** — slide decks for meetings, pitches, keynotes
- **Vertical documents** — one-pagers, reports, briefs, memos
- **Rich media pages** — anything presentable, commentable, shareable within a team

These are artifacts people read, present, print, and discuss. Not apps. Not interactive experiences.

## The Design System Challenge

To make generated output look like a real brand, we need to capture what makes that brand visually distinct. We've identified a 6-layer MECE hierarchy:

1. **Palette** — raw values: colors, fonts, sizes, weights, radii, shadows
2. **Roles** — semantic meaning: "this blue = action", "this font = headings"
3. **Elements** — component treatments: button shape, card style, divider style
4. **Hierarchy** — visual weight: size ratios between headings, emphasis patterns
5. **Structure** — page templates: region proportions, alignment, content zones
6. **Rhythm** — pacing: spacing cadence, content density, whitespace ratio

Layers 1-2 follow the W3C Design Tokens standard. Layers 3-6 are our extension — the relational and spatial qualities that no standard covers.

## Business Model

**Passive (free):** The schema is open. Users scrape and fill in tokens themselves using Claude Code on their own machine. They generate without validation. DIY.

**Active (paid):** Our MCP harness supervises both stages. During extraction, it validates completeness across all 6 layers. During generation, it enforces the token file and auto-fixes violations. Supervised quality.

## Research Questions

We need to validate that our 6-layer hierarchy holds water:

1. Are these layers truly MECE — no overlaps, no gaps — for presentation and document output?
2. Do established brand guideline structures (Apple, Google, McKinsey) organize visual identity in a way that contradicts or extends our model?
3. Is our claim that layers 4-6 (Hierarchy, Structure, Rhythm) are novel and untokenized by anyone — actually true?
4. Are there presentation-specific design methodologies (Duarte, Reynolds, McKinsey slide frameworks) that capture dimensions we're missing?
5. Can layers 4-6 be made mechanically enforceable, or are they inherently AI-judgment-only?
6. Does the passive/active business split make sense — is the supervised harness valuable enough to charge for?

## Why Now

- Claude Code and artifact systems are mainstream — anyone can generate rich documents
- The W3C Design Tokens spec just went stable — there's an agreed-upon foundation
- No one has extended design tokens beyond the component level into spatial/compositional territory
- The gap between "technically correct colors" and "looks like the brand" is where we live
