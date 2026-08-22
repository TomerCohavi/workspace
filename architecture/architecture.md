# DesignAlign Architecture

## Overview (2026-08-22)

DesignAlign captures a brand's visual identity from web materials and converts it into a concrete token file that maps directly to artifact CSS. The token file IS the stylesheet spec — every value in it becomes a CSS variable or rule in the generated output.

First output format: **vertical single-page documents** (artifacts, briefs, one-pagers). One screen of content, no scrolling, no slides.

## 8-Layer MECE Hierarchy (2026-08-22, updated)

Eight layers. Each answers one question. Together they fully describe a brand's visual identity AND the rules for using it well.

### Foundation (W3C-aligned)
1. **Palette** — what values exist? (colors, fonts, weights, sizes, spacing, radii, shadows)
2. **Roles** — what does each value mean? (action, danger, surface, heading, body)

### Relational
3. **Elements** — how does each piece look? (headings, callout boxes, tables, quotes, lists)
4. **Hierarchy** — what's important? (type scale ratios, emphasis method, visual weight)

### Spatial
5. **Structure** — what's the layout? (page template, regions, alignment)
6. **Rhythm** — what's the pacing? (density, section gaps, whitespace ratio)

### Governance (new — 2026-08-22)
7. **Editorial Mechanics** — what are the constraints?
8. **Asset Semantics** — how are brand assets used?

## Layer 7: Editorial Mechanics (2026-08-22)

The design constraint layer. The palette says what's allowed. Editorial mechanics says what good taste selects from it. Without this, the AI uses all 8 font sizes and all 9 colors and the result is cacophonous.

### Design Constraints
- **maxFontSizes:** How many distinct font sizes may appear in one document (typically 3-4)
- **maxSpacingValues:** How many distinct spacing values (typically 2-3)
- **maxColors:** How many colors from the palette appear in one document (typically 4-5)
- **accentRule:** How the accent color is used ("one element per section", "headings only", "CTAs only")
- **surfaceAlternation:** Whether sections alternate light/dark backgrounds ("alternate", "uniform", "hero-only")

### Copy Constraints
- **headingStyle:** Sentence-case, title-case, or uppercase
- **headingType:** Topic labels ("Growth Metrics") vs insight sentences ("AI drove record applications")
- **maxWordsPerSlide:** Word budget per section or slide (e.g., 30 for presentations, 75 for documents)
- **tone:** Formal, conversational, playful, technical
- **activeVoice:** Required or preferred

### Typography Harmony
- **sizeSelections:** Which 3-4 sizes from the palette to use (e.g., [16, 20, 40] from a palette of [12,14,16,18,20,25,30,48])
- **spacingSelections:** Which 2-3 spacing values to use (e.g., [16, 48] from a palette of [4,8,12,16,24,32,48,64])
- **weightSelections:** Which weights to use (e.g., [300, 600] from a palette of [200,300,400,500,600])

The key insight: the palette layer defines the allowed set. The editorial mechanics layer selects a harmonious subset for each document. This is what creates visual consistency — not having the right values, but using fewer of them.

## Layer 8: Asset Semantics (2026-08-22)

How brand assets are placed and treated. Without this, AI fabricates logos or mispositions them.

### Logo
- **placement:** Where the logo goes (top-left, centered, hero-only)
- **clearSpace:** Minimum padding around the logo (as a multiplier of logo height)
- **variants:** Which logo variant for light vs dark backgrounds
- **rule:** If the real logo can't be obtained, leave a labeled placeholder — NEVER fabricate

### Photography
- **treatment:** Full color, grayscale, brand-tinted overlay
- **style:** Editorial, candid, abstract, none
- **corners:** Sharp, rounded, or matching container radius

### Iconography
- **style:** Outline, filled, duotone
- **strokeWidth:** Line weight for outline icons
- **family:** Preferred icon set (Lucide, Phosphor, etc.)

## Concrete Artifact Tokens (2026-08-22)

The token file maps directly to CSS decisions for vertical documents:

### Text hierarchy (exact values)
- h1: size, weight, color, spacing-below
- h2: size, weight, color, spacing-below
- h3: size, weight, color, spacing-below
- body: size, weight, color, line-height
- caption/label: size, weight, letter-spacing
- eyebrow: size, uppercase, tracking

### Spacing (exact values)
- page padding
- section gap (between major sections)
- element gap (between items within a section)
- paragraph spacing

### Containers (exact treatments)
- callout: background, left-border, padding, radius
- table: header row style, cell padding, border style
- blockquote: indent, border, font style
- sectionBreak: the visual treatment that separates major sections (divider line, background shift, ruled line + whitespace, or whitespace alone)

### Section Breathing (2026-08-22)

How a document breathes between sections is two decisions working together:
- **Layer 6 (Rhythm) — sectionGap:** the amount of space between sections (a number in px)
- **Layer 3 (Elements) — sectionBreak:** the visual treatment of that gap (what the reader sees)

The gap is HOW MUCH space. The break is WHAT FILLS that space. A thin ruled line centered in a 64px gap feels different from a background color change with no gap. Both use the same sectionGap value but different sectionBreak treatments.

Section break treatment (template decision):
- `"surround-gap"` — sections are separate cards. A sliver of the surround background shows between them. No lines, no borders. The surround peeks through as the separator. Each section has its own background and padding. This is the default for vertical documents.

### Page level
- max-width
- background color
- default text alignment

## Unit System (2026-08-22)

All spatial values in the token file use `rem`, not `px`. Font sizes, spacing, radii, padding — everything relative to the root font size. This ensures documents scale across screen sizes without breakpoints or media queries.

- Font sizes: `rem` (e.g., 1rem = body, 1.25rem = h3, 1.75rem = h2, 3rem = h1)
- Spacing: `rem` (e.g., 1rem = elementGap, 4rem = sectionGap)
- Radii: `rem` (e.g., 0.5rem, 0.75rem, 1rem)
- Padding: `rem`
- Line-height: unitless ratio (e.g., 1.6)
- Font-weight: integer (e.g., 300, 600)
- Colors: hex strings

The palette stores the allowed rem values. The template and generated CSS use rem throughout. No px values anywhere in the token file or generated output.

Why not px: a document defined in px looks wrong on a phone, on a high-DPI screen, or when a user changes their browser font size. Rem scales proportionally everywhere.

## Hierarchy ↔ Rhythm Coordination (2026-08-22)

The research audit identified that hierarchy (type sizes) and rhythm (spacing) are mathematically linked. When a heading size changes, line-height and spacing must recalculate:

```
Line-height = ceil((fontSize × leadingRatio) / baseUnit) × baseUnit
```

This coordination must be programmatic — the validation harness should check that line-heights align to the spacing grid.

## Tokenization Strategy (2026-08-22)

One skill, one pass. `/designalign:tokenize` opens the brand's web materials and captures all 8 layers simultaneously — while the source is still visible.

The user specifies the source (URL, screenshot, brand name) and the target format (vertical document for now). The skill walks through all layers using a standard card per token: **What** (definition), **How** (how to observe it), **Format** (JSON shape), **Example** (concrete value).

Extraction methods:
- Layers 1-3: code-extractable (CSS parsing, computed styles)
- Layers 4-6: AI-interpreted (spatial relationships, visual judgment)
- Layer 7: AI-interpreted from patterns + brand guidelines
- Layer 8: Manual/scraped from brand asset pages

## Validation Architecture (2026-08-22)

Same pattern as existing color validation, extended to all layers:
- One checker function per dimension (colors, typography, spacing, etc.)
- Each checker scans output files for values not in the allowed token set
- Editorial mechanics checker: counts distinct values used, flags if exceeding maxFontSizes/maxColors/etc.
- Asset semantics checker: flags fabricated logos, missing clear space, wrong variant
- `validate_artifact` MCP tool returns array of violations with `rule` field
- Claude Code auto-fixes and re-validates up to 3 times

## Business Model (2026-08-22)

Two modes at each stage:
- **Passive (free):** User tokenizes with Claude Code on their machine. Generates without validation. DIY.
- **Active (paid):** MCP harness supervises tokenization (completeness checks) and generation (enforcement + auto-fix).

See `business-model.md` for details.

## Current Stack (2026-08-22)

- TypeScript + Node.js
- MCP SDK (stdio transport, local only)
- Zod for schema validation
- No database, no hosted API, no cloud dependency
