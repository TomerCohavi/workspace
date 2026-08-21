---
name: setup
description: Create a DesignAlign design contract (tokens + design language) from a preset or custom colors. Run this before generating presentations or static sites.
---

# DesignAlign setup

Create the project's design contract so later skills can generate on-brand artifacts.

## Steps

1. Ask the user to choose **aurora**, **slate**, or **custom** colors.
2. If custom, collect brand `name` and five hex colors: `primary`, `secondary`, `background`, `text`, `accent`.
3. If a preset, read the matching file from the plugin presets (ask the user for values if you cannot read plugin files — copy from below).

### Preset: aurora

```json
{
  "name": "Aurora",
  "colors": {
    "primary": "#5E6AD2",
    "secondary": "#1A1A2E",
    "background": "#FFFFFF",
    "text": "#0D0D0D",
    "accent": "#00C2A8"
  }
}
```

### Preset: slate

```json
{
  "name": "Slate",
  "colors": {
    "primary": "#0F766E",
    "secondary": "#134E4A",
    "background": "#F8FAFC",
    "text": "#0F172A",
    "accent": "#F59E0B"
  }
}
```

4. Write `designalign/tokens.json` with exactly this shape (`name` + `colors` with those five keys). Hex must be `#RGB` or `#RRGGBB`.
5. Write `designalign/design-language.md` using this template (fill in the brand name and colors):

```markdown
# {name} design language

## Voice
Clear, confident, minimal. Short headlines. No hype adjectives.

## Color
- Primary: actions and links
- Secondary: dark surfaces / headers
- Background: page canvas
- Text: body copy
- Accent: highlights only — sparingly

## Layout
- Generous whitespace
- One focal CTA per section
- Prefer system UI fonts unless the brief specifies otherwise

## Do
- Use only the five token colors (hex literals)
- Prefer CSS variables mapped 1:1 to tokens

## Don't
- Invent new hex/rgb/hsl colors
- Add gradients that introduce off-token stops
- Use decorative stock-photo heavy layouts
```

6. Call the DesignAlign MCP tool **`get_design_contract`** to confirm the contract loads.
7. Tell the user they can run `/designalign:presentation` or `/designalign:static-site` next.

If `get_design_contract` fails, fix the files and retry. Do not invent colors outside the tokens file.
