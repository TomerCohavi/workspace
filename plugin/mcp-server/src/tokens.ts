import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

export const TokensSchema = z.object({
  name: z.string().min(1),
  colors: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/),
    background: z.string().regex(/^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/),
    text: z.string().regex(/^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/),
    accent: z.string().regex(/^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/),
  }),
});

export type DesignTokens = z.infer<typeof TokensSchema>;

export const DESIGNALIGN_DIR = "designalign";
export const TOKENS_FILE = "tokens.json";
export const LANGUAGE_FILE = "design-language.md";

export function normalizeHex(hex: string): string {
  let h = hex.trim().toLowerCase();
  if (!h.startsWith("#")) h = `#${h}`;
  if (h.length === 4) {
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  }
  return h;
}

export function allowedColorSet(tokens: DesignTokens): Set<string> {
  return new Set(Object.values(tokens.colors).map(normalizeHex));
}

export function tokensPath(projectRoot: string): string {
  return join(projectRoot, DESIGNALIGN_DIR, TOKENS_FILE);
}

export function languagePath(projectRoot: string): string {
  return join(projectRoot, DESIGNALIGN_DIR, LANGUAGE_FILE);
}

export function loadTokens(projectRoot: string): DesignTokens {
  const path = tokensPath(projectRoot);
  if (!existsSync(path)) {
    throw new Error(
      `Missing ${DESIGNALIGN_DIR}/${TOKENS_FILE}. Run /designalign:setup first.`,
    );
  }
  const raw = JSON.parse(readFileSync(path, "utf8"));
  return TokensSchema.parse(raw);
}

export function loadDesignContract(projectRoot: string): {
  tokens: DesignTokens;
  designLanguageMd: string;
} {
  const tokens = loadTokens(projectRoot);
  const langPath = languagePath(projectRoot);
  const designLanguageMd = existsSync(langPath)
    ? readFileSync(langPath, "utf8")
    : "";
  return { tokens, designLanguageMd };
}
