---
name: tokenize
description: Extract a brand's visual identity into a design token file for generating on-brand vertical documents. Point at a URL, screenshot, or brand name and walk through each layer.
---

# DesignAlign Tokenize

Extract a brand's visual identity into a structured token file (`designalign/tokens.json`) for generating on-brand vertical documents — artifacts, briefs, one-pagers.

The user provides a source — a URL, a screenshot, a brand name, or existing brand materials. Work through all 8 layers in one pass while the source is still visible. Every token follows the same card: **What**, **How**, **Format**, **Example**.

## How to use this skill

1. Ask the user for a source: URL, screenshot, or brand name.
2. If a URL is provided, open it and study the visual design.
3. Work through each layer in order (1→8). Each layer builds on the one below.
4. Write the completed token file to `designalign/tokens.json`.
5. Call MCP **`get_design_contract`** to confirm it loads.
6. If any tokens were uncertain, note them so the user can refine.

Do not skip layers. Do not invent values you cannot observe. If a token is unclear from the source, ask the user.

---

## Layer 1: Palette

*All allowed raw values. Nothing outside this set may appear in generated output.*

### colors

- **What:** Every distinct color used intentionally in the brand's visual identity — the deliberate, repeated ones.
- **How:** Look at backgrounds, text, buttons, accents, and borders. Identify colors that appear more than once. Ignore one-offs in images or ads.
- **Format:** Object with named keys and hex values. Name by appearance, not by role.
  ```json
  { "blue": "#0A66C2", "darkBlue": "#004182", "white": "#FFFFFF" }
  ```
- **Example:** LinkedIn uses 5 core colors — medium blue, dark blue, white, near-black, green.

### fonts

- **What:** Every font family the brand uses.
- **How:** Look at headings, body paragraphs, buttons, captions. Note the distinct families — usually 2-3.
- **Format:** Array of font family strings.
  ```json
  ["Helvetica Neue", "system-ui"]
  ```
- **Example:** Apple uses San Francisco for UI, New York for editorial.

### fontWeights

- **What:** The set of font weights used across all text.
- **How:** Look at headings (usually bold), body (regular), and labels (medium). Note the distinct weights.
- **Format:** Array of integers (100–900).
  ```json
  [400, 600, 700]
  ```
- **Example:** Most brands use 3 weights — regular, semibold, bold.

### fontSizes

- **What:** The set of text sizes forming a consistent scale.
- **How:** Note sizes across headings, body, and captions. Look for a scale, not random values.
- **Format:** Array of numbers in rem, ascending.
  ```json
  [0.75, 0.875, 1, 1.25, 1.75, 2.5]
  ```
- **Example:** A common scale follows roughly 1.25x progression from a 1rem base.

### spacing

- **What:** The set of spacing values for padding, margins, and gaps.
- **How:** Look at space inside containers, between elements, and between sections. Most brands use multiples of a base unit (0.25rem or 0.5rem).
- **Format:** Array of numbers in rem, ascending.
  ```json
  [0.25, 0.5, 1, 1.5, 2, 3, 4]
  ```
- **Example:** A 0.5rem-base system uses 0.5, 1, 1.5, 2, 3, 4.

### radii

- **What:** The set of border-radius values used on containers and elements.
- **How:** Look at buttons, cards, and input fields. Note whether the brand prefers sharp (0), slight (0.25-0.5rem), or pill (99rem).
- **Format:** Array of numbers in rem.
  ```json
  [0, 0.25, 0.5, 99]
  ```
- **Example:** Apple uses large radii. IBM uses small. Some brands mix.

### shadows

- **What:** The set of box-shadow values for elevation.
- **How:** Look at cards, modals, and floating elements. Note shadow levels or whether the brand is flat.
- **Format:** Array of CSS shadow strings. Use `"none"` for flat brands.
  ```json
  ["none", "0 1px 3px rgba(0,0,0,0.1)"]
  ```
- **Example:** Material Design uses multiple levels. Many modern brands are flat.

---

## Layer 2: Roles

*What each palette value means. Maps raw values to purposes.*

### colors

- **What:** The semantic role of each color — which is for actions, danger, backgrounds, text.
- **How:** Look at buttons/links (action), errors (danger), confirmations (success), page background (surface), body text (text). Map each to a palette key.
- **Format:** Object mapping role names to palette color keys.
  ```json
  { "action": "blue", "danger": "red", "surface": "white", "text": "black" }
  ```
- **Example:** LinkedIn's blue = action, white = surface, near-black = text.

### typography

- **What:** Which font+weight combinations serve which purpose.
- **How:** Look at what's used for headlines vs body text vs small labels.
- **Format:** Object with roles, each containing `family` and `weight`.
  ```json
  {
    "heading": { "family": "Helvetica Neue", "weight": 700 },
    "body": { "family": "Helvetica Neue", "weight": 400 },
    "caption": { "family": "Helvetica Neue", "weight": 400 }
  }
  ```
- **Example:** Many brands use the same family for heading and body, differentiated by weight.

---

## Layer 3: Elements

*How individual document pieces look. These are document elements, not web components.*

### headings

- **What:** The exact styling of each heading level as it should appear in a vertical document.
- **How:** Look at the brand's page titles, section headings, and subheadings. Note size, weight, color, and how much space sits below each.
- **Format:** Object with h1–h4 keys, each containing concrete CSS values.
  ```json
  {
    "h1": { "size": 2.5, "weight": 700, "color": "darkBlue", "spacingBelow": 1.5 },
    "h2": { "size": 1.75, "weight": 700, "color": "darkBlue", "spacingBelow": 1 },
    "h3": { "size": 1.25, "weight": 600, "color": "blue", "spacingBelow": 0.75 },
    "h4": { "size": 1, "weight": 600, "color": "blue", "spacingBelow": 0.5 }
  }
  ```
- **Example:** Bold brands use large h1 with big spacing. Corporate brands keep sizes closer together.

### body

- **What:** The exact styling of body text in the document.
- **How:** Look at paragraph text — size, weight, color, line-height, spacing between paragraphs.
- **Format:** Object with CSS values.
  ```json
  { "size": 1, "weight": 400, "color": "text", "lineHeight": 1.6, "paragraphSpacing": 1 }
  ```
- **Example:** Most brands use 1rem body text at 1.5-1.7 line height.

### eyebrow

- **What:** Small label text used above headings or sections (e.g., "QUARTERLY REPORT", "KEY FINDINGS").
- **How:** Look for small uppercase text used to label sections or categories on the brand's site.
- **Format:** Object with size, weight, letter-spacing, and whether it's uppercase.
  ```json
  { "size": 0.75, "weight": 600, "letterSpacing": "0.08em", "uppercase": true, "color": "action" }
  ```
- **Example:** Most brands use 0.7-0.8rem, semibold, with wide letter-spacing, in the action or muted color.

### callout

- **What:** How highlighted/emphasized content blocks look — key stats, important notes, pull quotes.
- **How:** Look at how the brand highlights important information on their site. Note background color, border treatment, padding.
- **Format:** Object with visual treatment.
  ```json
  { "background": "surfaceAlt", "borderLeft": "0.1875rem solid action", "padding": 1.5, "radius": 0.25 }
  ```
- **Example:** Stripe uses light gray boxes. Some brands use colored left borders. Others use full background fills.

### table

- **What:** How data tables are styled in the brand's visual language.
- **How:** Look at any tables or structured data on the brand's site. Note header row treatment, cell padding, and border style.
- **Format:** Object with header and cell styling.
  ```json
  {
    "headerBackground": "surfaceAlt",
    "headerWeight": 600,
    "cellPadding": 0.75,
    "borderStyle": "bottom-only",
    "borderColor": "border"
  }
  ```
- **Example:** Modern brands use bottom-only borders. Traditional brands use full grid borders.

### blockquote

- **What:** How quoted or cited text is styled.
- **How:** Look at testimonials, pullquotes, or cited text on the brand's site. Note indent, border, font treatment.
- **Format:** Object with visual treatment.
  ```json
  { "indent": 1.5, "borderLeft": "0.125rem solid action", "fontStyle": "italic", "color": "textMuted" }
  ```
- **Example:** Most brands use a left border with slight indent. Some use larger text or a different color.

### list

- **What:** How bulleted and numbered lists are styled.
- **How:** Look at lists on the site. Note marker style and indentation.
- **Format:** Object with marker and indent.
  ```json
  { "marker": "bullet", "indent": 1, "itemSpacing": 0.5 }
  ```
- **Example:** McKinsey uses dashes. Most brands use standard bullets or custom markers.

### divider

- **What:** The brand's visual separator style — the line or rule treatment used to separate content.
- **How:** Look at what the brand uses between content groups on their site. Note the color, weight, and whether it's a solid line, dashed, or absent entirely.
- **Format:** Object with style, color, weight.
  ```json
  { "style": "line", "color": "border", "weight": 1 }
  ```
- **Example:** LinkedIn uses thin gray 1px lines. Apple uses no visible dividers — whitespace only. The template decides WHERE dividers appear in the document; this token captures WHAT they look like.

---

## Layer 4: Hierarchy

*Visual weight distribution. What dominates, what recedes.*

### typeScale

- **What:** The ratio progression between text sizes — how much bigger each heading level is relative to body.
- **How:** Compare the largest heading to body text. Note the steps between. Express as multipliers of body size.
- **Format:** Array of multipliers, ascending. 1 = body size.
  ```json
  [1, 1.25, 1.75, 2.5]
  ```
- **Example:** Apple: [1, 1.5, 2.5, 4]. A law firm: [1, 1.1, 1.3, 1.6].

### emphasis

- **What:** How the brand creates visual emphasis — bigger size, heavier weight, different color, or a combination.
- **How:** Look at what changes when something is emphasized on the site.
- **Format:** Enum: `"size"`, `"weight"`, `"color"`, or `"mixed"`.
  ```json
  "size"
  ```
- **Example:** Apple = size. Google = color. Most brands = mixed.

---

## Layer 5: Structure

*Page template for a vertical document. Where content goes.*

### page

- **What:** The overall layout of a single-page vertical document.
- **How:** Look at the brand's content pages. Note the max width, how content is centered or aligned, and the page padding.
- **Format:** Object with layout values.
  ```json
  {
    "maxWidth": "45rem",
    "padding": 3,
    "alignment": "left",
    "background": "surface"
  }
  ```
- **Example:** Most document layouts are 40-50rem centered. Sparse brands use more padding.

### header

- **What:** The document header — title zone at the top of the page.
- **How:** Look at how the brand opens a content page. Note whether there's a background color, how much space the title gets, and whether there's a visual separator below.
- **Format:** Object describing the header zone.
  ```json
  {
    "background": "surface",
    "paddingBottom": 2,
    "borderBottom": "1px solid border",
    "alignment": "left"
  }
  ```
- **Example:** Some brands use a dark header with white text. Others use a simple divider line below the title.

### footer

- **What:** The document footer — source line, date, or branding at the bottom.
- **How:** Look at how the brand closes content pages. Note font size, color, and whether there's a separator above.
- **Format:** Object describing the footer zone.
  ```json
  {
    "size": 0.75,
    "color": "textMuted",
    "borderTop": "0.0625rem solid border",
    "paddingTop": 1.5
  }
  ```
- **Example:** Most use small muted text with a top border or extra whitespace.

---

## Layer 6: Rhythm

*How the document breathes. Pacing and density.*

### density

- **What:** How much content is packed into the page — airy, balanced, or packed.
- **How:** Look at a full viewport. Is most space empty (sparse), roughly half (balanced), or mostly content (dense)?
- **Format:** Enum: `"sparse"`, `"balanced"`, or `"dense"`.
  ```json
  "balanced"
  ```
- **Example:** Apple = sparse. News site = dense. SaaS marketing = balanced.

### sectionGap

- **What:** How much space between major sections of the document.
- **How:** Compare the breathing room between sections to the gap between items within a section.
- **Format:** Number in rem.
  ```json
  3
  ```
- **Example:** Sparse brands: 3-4rem. Dense brands: 1.5-2rem.

### elementGap

- **What:** How much space between elements within a section (paragraphs, list items, cards).
- **How:** Look at the spacing between sibling elements inside a content group.
- **Format:** Number in rem.
  ```json
  1
  ```
- **Example:** Most brands: 0.75-1.25rem between elements within a section.

### whitespaceRatio

- **What:** The approximate proportion of empty space to content on the page.
- **How:** Look at a typical section. Estimate what fraction of the viewport is empty vs filled.
- **Format:** Number between 0 and 1.
  ```json
  0.6
  ```
- **Example:** 0.6 = 60% whitespace (airy). 0.35 = dense, info-heavy.

---

---

## Layer 7: Editorial Mechanics

*The constraints that create harmony. The palette says what's allowed. This layer says what good taste selects from it.*

### sizeSelections

- **What:** Which 3-4 font sizes from the palette to actually use in one document. Using all available sizes creates cacophony.
- **How:** Look at the brand's pages. Count how many distinct text sizes you actually see in a typical section. Most well-designed pages use 3: a heading size, body size, and small/label size.
- **Format:** Array of 3-4 numbers selected from palette.fontSizes.
  ```json
  [1, 1.25, 3]
  ```
- **Example:** Ludeo uses 1rem for body+labels, 1.25rem for subheadings, 3rem for hero titles. Three sizes, that's it.

### weightSelections

- **What:** Which 2 font weights from the palette to use. More than 2 visible weights feels noisy.
- **How:** Look at the contrast between headings and body. Most brands use just regular and bold — two weights.
- **Format:** Array of 2 integers selected from palette.fontWeights.
  ```json
  [300, 600]
  ```
- **Example:** Ludeo uses light (300) for body and semibold (600) for headings. LinkedIn uses regular (400) and bold (700).

### spacingSelections

- **What:** Which 2-3 spacing values to use. One for between elements, one for between sections.
- **How:** Look at the page. There should be a small gap (inside groups) and a large gap (between sections). Two values.
- **Format:** Array of 2-3 numbers selected from palette.spacing.
  ```json
  [1, 3]
  ```
- **Example:** 1rem between elements, 3rem between sections. Two spacing values, consistent everywhere.

### maxColors

- **What:** How many colors from the palette appear in one document. Fewer = more cohesive.
- **How:** Count the distinct colors on a typical brand page. Exclude pure white/black. Usually 3-5.
- **Format:** Number.
  ```json
  4
  ```
- **Example:** LinkedIn doc: blue (#0A66C2), dark blue (#004182), gray (#666666), off-white (#F3F2EF). Four colors plus black and white.

### accentRule

- **What:** How the accent/action color is used. The rule that prevents accent overload.
- **How:** Look at where the brand uses its bold color. Is it on every heading? Only buttons? Only one element per section?
- **Format:** String describing the constraint.
  ```json
  "one element per section"
  ```
- **Example:** Ludeo uses gold on the eyebrow and step numbers only — never on headings, body, or backgrounds. LinkedIn uses blue on stats and the highlight bar but not on body text.

### surfaceAlternation

- **What:** Whether the document alternates between light and dark background sections.
- **How:** Look at whether the brand's site uses full-width dark sections to break up content, or stays uniform.
- **Format:** Enum: `"alternate"`, `"uniform"`, `"hero-only"`.
  ```json
  "hero-only"
  ```
- **Example:** Ludeo alternates (dark hero, light body, dark table). LinkedIn uses hero-only (dark header, everything else white).

### headingStyle

- **What:** How headings are cased and structured.
- **How:** Look at the brand's section headings. Are they short topic labels or full sentences?
- **Format:** Object with casing and type.
  ```json
  { "case": "sentence", "type": "insight" }
  ```
- **Example:** McKinsey uses insight sentences ("AI drove record applications"). Most brands use topic labels ("Key Metrics").

### tone

- **What:** The voice of the copy — formal, conversational, playful, technical.
- **How:** Read the brand's website copy. Note the formality level and word choice.
- **Format:** Enum: `"formal"`, `"conversational"`, `"playful"`, `"technical"`.
  ```json
  "conversational"
  ```
- **Example:** Ludeo = conversational (gaming audience). LinkedIn = formal (professional context).

---

## Layer 8: Asset Semantics

*How brand assets are placed and treated. If you can't get the real asset, leave a placeholder — NEVER fabricate.*

### logo

- **What:** The brand's logo — where it goes, how big, which variant for which background.
- **How:** Download the real logo SVG from the brand's site or brand assets page. Note where they place it (top-left, centered) and how much space surrounds it.
- **Format:** Object with placement, file reference, and variant rules.
  ```json
  {
    "placement": "top-left",
    "clearSpace": 1.5,
    "darkBackground": "white-variant",
    "lightBackground": "dark-variant"
  }
  ```
- **Example:** Ludeo: white logo on dark hero, muted in footer. LinkedIn: blue icon + wordmark on dark hero, gray in footer.
- **CRITICAL:** If you cannot obtain the real logo file, add a labeled placeholder (`[LOGO: Brand Name]`). Never draw, approximate, or fake a logo.

### photoTreatment

- **What:** How photography and images are treated — full color, grayscale, brand-tinted.
- **How:** Look at how the brand uses images on their site. Are they full color? Desaturated? Overlaid with a brand color?
- **Format:** Enum: `"full-color"`, `"grayscale"`, `"brand-overlay"`, `"none"`.
  ```json
  "none"
  ```
- **Example:** Most corporate brands use full-color. Some editorial brands use grayscale. Many document templates use no photos.

### iconStyle

- **What:** The style of icons if the brand uses them — outline, filled, duotone.
- **How:** Look at any icons on the brand's site. Note the line weight and fill style.
- **Format:** Object with style and weight.
  ```json
  { "style": "outline", "strokeWidth": 1.5 }
  ```
- **Example:** Most modern brands use outline icons at 1.5-2px stroke weight.

---

## After tokenization

1. Write the completed token file to `designalign/tokens.json`.
2. Call MCP **`get_design_contract`** to confirm it loads.
3. Tell the user they can now generate on-brand documents.
4. If any tokens were uncertain, note them so the user can refine.
