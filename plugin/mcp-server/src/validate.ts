import { readFileSync, existsSync } from "node:fs";
import { resolve, isAbsolute, dirname, join } from "node:path";
import {
  type DesignTokens,
  allowedColorSet,
  loadTokens,
  normalizeHex,
  tokensPath,
} from "./tokens.js";

export type ArtifactKind = "presentation" | "static-site";

export type Violation = {
  rule: string;
  detail: string;
};

export type ValidateResult = {
  ok: boolean;
  violations: Violation[];
};

const HEX_RE = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g;
const RGB_RE = /\brgba?\(\s*([^)]+)\)/gi;
const HSL_RE = /\bhsla?\(\s*[^)]+\)/gi;

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return normalizeHex(
    `#${[clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("")}`,
  );
}

function parseRgbArgs(args: string): string | null {
  const parts = args.split(",").map((p) => p.trim());
  if (parts.length < 3) return null;
  const nums = parts.slice(0, 3).map((p) => {
    if (p.endsWith("%")) return (parseFloat(p) / 100) * 255;
    return parseFloat(p);
  });
  if (nums.some((n) => Number.isNaN(n))) return null;
  return rgbToHex(nums[0], nums[1], nums[2]);
}

function checkColors(
  content: string,
  tokens: DesignTokens,
  violations: Violation[],
): void {
  const allowed = allowedColorSet(tokens);

  for (const m of content.matchAll(HEX_RE)) {
    const hex = normalizeHex(m[0]);
    if (!allowed.has(hex)) {
      violations.push({
        rule: "colors",
        detail: `Disallowed color "${hex}". Allowed: ${[...allowed].join(", ")}`,
      });
    }
  }

  for (const m of content.matchAll(RGB_RE)) {
    const hex = parseRgbArgs(m[1]);
    if (!hex || !allowed.has(hex)) {
      violations.push({
        rule: "colors",
        detail: `Disallowed rgb() color "rgb(${m[1]})". Use token hex values only.`,
      });
    }
  }

  for (const m of content.matchAll(HSL_RE)) {
    violations.push({
      rule: "colors",
      detail: `Disallowed hsl() color "${m[0]}". Use token hex values only.`,
    });
  }
}

function checkPresentation(content: string, violations: Violation[]): void {
  const slides = content.match(/data-slide\b/gi) ?? [];
  if (slides.length < 2) {
    violations.push({
      rule: "presentation-slides",
      detail: `Expected at least 2 elements with data-slide; found ${slides.length}`,
    });
  }
}

function checkStaticSite(content: string, violations: Violation[]): void {
  if (!/<header\b/i.test(content)) {
    violations.push({
      rule: "static-site-header",
      detail: "Missing <header> element",
    });
  }
  const hasCta =
    /\bbtn-primary\b/i.test(content) || /data-cta\b/i.test(content);
  if (!hasCta) {
    violations.push({
      rule: "static-site-cta",
      detail: "Missing primary CTA (class btn-primary or attribute data-cta)",
    });
  }
}

export function validateContent(
  content: string,
  tokens: DesignTokens,
  kind: ArtifactKind,
): ValidateResult {
  const violations: Violation[] = [];
  checkColors(content, tokens, violations);
  if (kind === "presentation") checkPresentation(content, violations);
  if (kind === "static-site") checkStaticSite(content, violations);
  return { ok: violations.length === 0, violations };
}

function gatherFiles(filePath: string): string[] {
  const files = [filePath];
  const cssSibling = join(dirname(filePath), "styles.css");
  if (existsSync(cssSibling) && cssSibling !== filePath) {
    files.push(cssSibling);
  }
  return files;
}

export function validateArtifact(options: {
  projectRoot: string;
  path: string;
  kind: ArtifactKind;
}): ValidateResult {
  const { projectRoot, kind } = options;

  if (!existsSync(tokensPath(projectRoot))) {
    return {
      ok: false,
      violations: [
        {
          rule: "contract-missing",
          detail:
            "designalign/tokens.json not found. Run /designalign:setup first.",
        },
      ],
    };
  }

  let tokens: DesignTokens;
  try {
    tokens = loadTokens(projectRoot);
  } catch (err) {
    return {
      ok: false,
      violations: [
        {
          rule: "contract-invalid",
          detail: err instanceof Error ? err.message : String(err),
        },
      ],
    };
  }

  const filePath = isAbsolute(options.path)
    ? options.path
    : resolve(projectRoot, options.path);

  if (!existsSync(filePath)) {
    return {
      ok: false,
      violations: [
        {
          rule: "file-missing",
          detail: `Artifact not found: ${options.path}`,
        },
      ],
    };
  }

  const violations: Violation[] = [];
  const files = gatherFiles(filePath);
  let htmlContent = "";

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    if (file.endsWith(".html") || file.endsWith(".htm")) {
      htmlContent += content;
    }
    checkColors(content, tokens, violations);
  }

  if (kind === "presentation") checkPresentation(htmlContent || readFileSync(filePath, "utf8"), violations);
  if (kind === "static-site") checkStaticSite(htmlContent || readFileSync(filePath, "utf8"), violations);

  // Dedupe identical violations
  const seen = new Set<string>();
  const unique = violations.filter((v) => {
    const key = `${v.rule}:${v.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { ok: unique.length === 0, violations: unique };
}
