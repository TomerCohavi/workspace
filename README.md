# DesignAlign

A design system harness for AI-generated documents. Scrape a brand's visual identity once, enforce it on every generation.

Point DesignAlign at any website — it extracts colors, fonts, spacing, hierarchy, and layout into a compact token file. Then when you generate presentations or documents, every visual decision matches the brand. No more generic output.

## How it works

1. **Tokenize** — `/designalign:tokenize` scrapes a brand into a structured token file across 8 layers
2. **Generate** — create presentations or vertical documents using the token file
3. **Validate** — MCP server checks every color, font, size, weight, and radius against the allowed set
4. **Fix** — Claude Code auto-fixes violations until the output is clean

## The 8-layer token hierarchy

| Layer | Question it answers | Source |
|-------|-------------------|--------|
| 1. Palette | What values exist? | W3C |
| 2. Roles | What does each value mean? | W3C |
| 3. Elements | How does each piece look? | Extension |
| 4. Hierarchy | What's important? | Extension |
| 5. Structure | What's the layout? | Extension |
| 6. Rhythm | What's the pacing? | Extension |
| 7. Editorial Mechanics | What are the constraints? | Extension |
| 8. Asset Semantics | How are brand assets used? | Extension |

Layers 1-2 align with the W3C Design Tokens standard. Layers 3-8 are DesignAlign extensions — the relational, spatial, and governance qualities that no standard covers.

## Output formats

- **Vertical documents** — briefs, one-pagers, reports, memos
- **Slide decks** — presentations, pitches, keynotes

Templates define the format (canvas, navigation, section breaks). Tokens define the brand (colors, fonts, spacing). They combine at generation time.

## Skills

| Skill | What it does |
|-------|-------------|
| `/designalign:setup` | Pick a preset palette (aurora, slate) or custom colors |
| `/designalign:tokenize` | Extract a full 8-layer token file from a URL or brand |
| `/designalign:presentation` | Generate an on-brand slide deck |
| `/designalign:static-site` | Generate an on-brand one-page site |

## MCP tools

| Tool | What it does |
|------|-------------|
| `get_design_contract` | Read the token file + design language |
| `validate_artifact` | Check an HTML file against the token file |

## Unit system

All spatial values use `rem`, not `px`. Font sizes, spacing, radii, padding — everything relative to root font size. Documents scale across screen sizes without breakpoints.

## Repo layout

```
architecture/              # Architecture docs, business model, research
plugin/
  schema/                  # JSON Schema for the token file
  skills/                  # setup, tokenize, presentation, static-site
  templates/               # vertical.json, slides.json
  presets/                 # aurora, slate color presets
  mcp-server/              # TypeScript MCP server (validate + tools)
  .claude-plugin/          # Plugin metadata
  .mcp.json                # MCP wiring
```

## Requirements

- [Claude Code](https://code.claude.com/) CLI
- Node.js 20+

## Quick start

```bash
cd your-project
claude --plugin-dir ~/designalign/plugin
```

Inside Claude Code:

```
/designalign:tokenize https://example.com
```

Then generate:

```
/designalign:presentation
```

## Local development

```bash
cd plugin/mcp-server
npm install
npm test
npm run build
```

## Branding

DesignAlign is an independent plugin for Claude Code. It is not Claude Code or an Anthropic product.
