import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { DesignTokens } from "./tokens";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRESETS_DIR = join(__dirname, "../../plugin/presets");

export type PresetId = "aurora" | "slate";

export function loadPreset(id: PresetId): DesignTokens {
  const raw = JSON.parse(readFileSync(join(PRESETS_DIR, `${id}.json`), "utf8")) as {
    label?: string;
    name: string;
    colors: DesignTokens["colors"];
  };
  const name = raw.label || raw.name;
  const colors = raw.colors!;
  return {
    name,
    version: "0.1.0",
    colors,
    palette: {
      colors: { ...colors },
    },
  };
}

export function blankSystem(name: string): DesignTokens {
  const colors = {
    primary: "#2563EB",
    secondary: "#1E293B",
    background: "#FFFFFF",
    text: "#0F172A",
    accent: "#F97316",
  };
  return {
    name,
    version: "0.1.0",
    colors,
    palette: { colors: { ...colors } },
  };
}

export function defaultDesignLanguage(name: string): string {
  return `# ${name} design language

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
- Use only the token colors (hex literals)
- Prefer CSS variables mapped 1:1 to tokens

## Don't
- Invent new hex/rgb/hsl colors
- Add gradients that introduce off-token stops
- Use decorative stock-photo heavy layouts
`;
}
