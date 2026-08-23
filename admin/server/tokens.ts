import { z } from "zod";

const HexColor = z.string().regex(/^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/);

const TypographyRole = z.object({
  family: z.string(),
  weight: z.number().int().min(1).max(1000),
});

const HeadingLevel = z.object({
  size: z.number(),
  weight: z.number().int(),
  color: z.string(),
  spacingBelow: z.number(),
});

export const TokensSchema = z.object({
  name: z.string().min(1),
  version: z.string().optional(),
  source: z.string().optional(),
  scraped_at: z.string().optional(),

  palette: z
    .object({
      colors: z.record(HexColor),
      fonts: z.array(z.string()).optional(),
      fontWeights: z.array(z.number().int()).optional(),
      fontSizes: z.array(z.number()).optional(),
      spacing: z.array(z.number()).optional(),
      radii: z.array(z.number()).optional(),
      shadows: z.array(z.string()).optional(),
    })
    .optional(),

  colors: z
    .object({
      primary: HexColor,
      secondary: HexColor,
      background: HexColor,
      text: HexColor,
      accent: HexColor,
    })
    .optional(),

  roles: z
    .object({
      colors: z.record(z.string()).optional(),
      typography: z.record(TypographyRole).optional(),
    })
    .optional(),

  elements: z
    .object({
      headings: z.record(HeadingLevel).optional(),
      body: z
        .object({
          size: z.number(),
          weight: z.number().int(),
          color: z.string(),
          lineHeight: z.number(),
          paragraphSpacing: z.number(),
        })
        .optional(),
      eyebrow: z
        .object({
          size: z.number(),
          weight: z.number().int(),
          letterSpacing: z.string(),
          uppercase: z.boolean(),
          color: z.string(),
        })
        .optional(),
      callout: z
        .object({
          background: z.string(),
          borderLeft: z.string(),
          padding: z.number(),
          radius: z.number(),
        })
        .optional(),
      table: z
        .object({
          headerBackground: z.string(),
          headerWeight: z.number().int(),
          cellPadding: z.number(),
          borderStyle: z.string(),
          borderColor: z.string(),
        })
        .optional(),
      blockquote: z
        .object({
          indent: z.number(),
          borderLeft: z.string(),
          fontStyle: z.string(),
          color: z.string(),
        })
        .optional(),
      list: z
        .object({
          marker: z.enum(["bullet", "dash", "number", "none"]),
          indent: z.number(),
          itemSpacing: z.number(),
        })
        .optional(),
      divider: z
        .object({
          style: z.enum(["line", "space", "none"]),
          color: z.string().optional(),
          weight: z.number().optional(),
        })
        .optional(),
    })
    .optional(),

  hierarchy: z
    .object({
      typeScale: z.array(z.number()).optional(),
      emphasis: z.enum(["size", "weight", "color", "mixed"]).optional(),
    })
    .optional(),

  structure: z
    .object({
      page: z
        .object({
          maxWidth: z.string(),
          padding: z.number(),
          alignment: z.enum(["left", "center", "right"]),
          background: z.string(),
        })
        .optional(),
      header: z
        .object({
          background: z.string(),
          paddingBottom: z.number(),
          borderBottom: z.string(),
          alignment: z.enum(["left", "center", "right"]),
        })
        .optional(),
      footer: z
        .object({
          size: z.number(),
          color: z.string(),
          borderTop: z.string(),
          paddingTop: z.number(),
        })
        .optional(),
    })
    .optional(),

  editorial: z
    .object({
      sizeSelections: z.array(z.number()).optional(),
      weightSelections: z.array(z.number().int()).optional(),
      spacingSelections: z.array(z.number()).optional(),
      maxColors: z.number().int().optional(),
      accentRule: z.string().optional(),
      surfaceAlternation: z.enum(["alternate", "uniform", "hero-only"]).optional(),
      headingStyle: z
        .object({
          case: z.enum(["sentence", "title", "uppercase"]).optional(),
          type: z.enum(["topic", "insight"]).optional(),
        })
        .optional(),
      tone: z.enum(["formal", "conversational", "playful", "technical"]).optional(),
    })
    .optional(),

  assets: z
    .object({
      logo: z
        .object({
          file: z.string().optional(),
          fileDark: z.string().optional(),
          placement: z.enum(["top-left", "top-center", "top-right"]).optional(),
          clearSpace: z.number().optional(),
        })
        .optional(),
      photoTreatment: z
        .enum(["full-color", "grayscale", "brand-overlay", "none"])
        .optional(),
      iconStyle: z
        .object({
          style: z.enum(["outline", "filled", "duotone"]).optional(),
          strokeWidth: z.number().optional(),
        })
        .optional(),
    })
    .optional(),

  rhythm: z
    .object({
      density: z.enum(["sparse", "balanced", "dense"]).optional(),
      sectionGap: z.number().optional(),
      elementGap: z.number().optional(),
      whitespaceRatio: z.number().min(0).max(1).optional(),
    })
    .optional(),
});

export type DesignTokens = z.infer<typeof TokensSchema>;

export function normalizeHex(hex: string): string {
  let h = hex.trim().toLowerCase();
  if (!h.startsWith("#")) h = `#${h}`;
  if (h.length === 4) {
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  }
  return h;
}

export function extractColorMap(tokens: DesignTokens): Record<string, string> {
  if (tokens.palette?.colors && Object.keys(tokens.palette.colors).length > 0) {
    return { ...tokens.palette.colors };
  }
  if (tokens.colors) {
    return { ...tokens.colors };
  }
  return {};
}

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}
