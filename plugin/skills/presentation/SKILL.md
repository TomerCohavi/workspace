---
name: presentation
description: Generate an on-brand HTML slide presentation under out/presentation/ using the DesignAlign contract, then validate and fix until it passes.
---

# DesignAlign presentation

Generate a single-file HTML presentation aligned to the project design contract.

## Hard rules

1. Call MCP **`get_design_contract`** first. If it errors, stop and tell the user to run `/designalign:setup`.
2. Use **only** the hex colors from `tokens.colors`. No other `#hex`, `rgb()`, or `hsl()`.
3. Write **`out/presentation/index.html`** only (inline CSS + minimal JS is OK).
4. Include **at least 2** (prefer 3) full-viewport sections with `data-slide`.
5. After writing, call MCP **`validate_artifact`** with:
   - `path`: `out/presentation/index.html`
   - `kind`: `presentation`
6. If `ok` is false, fix every violation and call **`validate_artifact` again**. Maximum **3** validate attempts total. If still failing, report remaining violations and stop.

## Content

- Ask for a short brief if the user did not provide one (topic, audience, slide count).
- Default: 3 slides — title, value prop, CTA/closing.
- Map tokens to CSS variables on `:root`:
  - `--color-primary`, `--color-secondary`, `--color-background`, `--color-text`, `--color-accent`
- Still emit the actual hex values in CSS (validator checks hex literals).
- Simple keyboard/click to advance slides is nice-to-have.

## Done

When validate returns `ok: true`, tell the user to open `out/presentation/index.html` in a browser.
