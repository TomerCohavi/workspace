---
name: static-site
description: Generate an on-brand one-page static site under out/site/ using the DesignAlign contract, then validate and fix until it passes.
---

# DesignAlign static site

Generate a small static marketing page aligned to the project design contract.

## Hard rules

1. Call MCP **`get_design_contract`** first. If it errors, stop and tell the user to run `/designalign:setup`.
2. Use **only** the hex colors from `tokens.colors`. No other `#hex`, `rgb()`, or `hsl()`.
3. Write:
   - `out/site/index.html`
   - `out/site/styles.css`
4. HTML **must** include a `<header>` and a primary CTA with class `btn-primary` or attribute `data-cta`.
5. After writing, call MCP **`validate_artifact`** with:
   - `path`: `out/site/index.html`
   - `kind`: `static-site`
   (styles.css in the same folder is checked automatically.)
6. If `ok` is false, fix every violation and re-validate. Maximum **3** validate attempts. If still failing, report remaining violations and stop.

## Content

- Ask for a short brief if missing (product name, one-liner, CTA label).
- Structure: header, hero, short features row, CTA, footer.
- Map tokens to CSS variables and use those hex values in `styles.css`.
- System fonts are fine.

## Done

When validate returns `ok: true`, tell the user to open `out/site/index.html` in a browser.
