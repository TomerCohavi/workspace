"use client";

import type { DesignTokens } from "@/server/tokens";
import { extractColorMap } from "@/server/tokens";
import { Separator } from "@/components/ui/separator";

type Props = {
  tokens: DesignTokens;
};

export function LivePreview({ tokens }: Props) {
  const colors = extractColorMap(tokens);
  const primary = colors.primary || Object.values(colors)[0] || "#2563EB";
  const secondary = colors.secondary || "#1E293B";
  const background = colors.background || "#FFFFFF";
  const text = colors.text || "#0F172A";
  const accent = colors.accent || primary;

  const font =
    tokens.palette?.fonts?.[0] ||
    tokens.roles?.typography?.heading?.family ||
    "var(--font-sans), system-ui, sans-serif";

  const h1 = tokens.elements?.headings?.h1;
  const body = tokens.elements?.body;
  const eyebrow = tokens.elements?.eyebrow;
  const callout = tokens.elements?.callout;

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ background, color: text, fontFamily: font }}
    >
      <div className="flex flex-wrap gap-2 border-b border-black/5 p-4">
        {Object.entries(colors).map(([key, value]) => (
          <div
            key={key}
            className="w-[4.5rem] overflow-hidden rounded-md border border-black/10 bg-white/70"
          >
            <div className="h-9" style={{ background: value }} />
            <div className="space-y-0.5 px-1.5 py-1 font-mono text-[10px] leading-tight text-neutral-700">
              <div className="truncate">{key}</div>
              <div className="truncate opacity-70">{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 p-5">
        <p
          style={{
            color: accent,
            fontSize: eyebrow ? `${eyebrow.size}rem` : "0.7rem",
            fontWeight: eyebrow?.weight || 600,
            letterSpacing: eyebrow?.letterSpacing || "0.08em",
            textTransform: eyebrow?.uppercase === false ? "none" : "uppercase",
          }}
        >
          Brand specimen
        </p>
        <h1
          className="tracking-tight"
          style={{
            color: h1?.color || secondary,
            fontSize: h1 ? `${h1.size}rem` : "1.75rem",
            fontWeight: h1?.weight || 700,
            lineHeight: 1.15,
          }}
        >
          {tokens.name}
        </h1>
        <p
          className="max-w-md"
          style={{
            fontSize: body ? `${body.size}rem` : "0.95rem",
            fontWeight: body?.weight || 400,
            lineHeight: body?.lineHeight || 1.55,
            color: body?.color || text,
          }}
        >
          Edit tokens on the left. Preview maps palette and element treatments
          into a vertical document chrome.
        </p>

        <div
          className="rounded-r-lg border-l-4 py-3 pr-4 pl-3 text-sm"
          style={{
            background: callout?.background || `${accent}18`,
            borderLeftColor: callout?.borderLeft || accent,
            borderRadius: callout
              ? `0 ${callout.radius}rem ${callout.radius}rem 0`
              : undefined,
            padding: callout ? `${callout.padding}rem` : undefined,
          }}
        >
          Accent callout — use sparingly for emphasis and CTAs.
        </div>

        <Separator style={{ background: secondary, opacity: 0.2 }} />

        <div className="space-y-1">
          <h2
            className="text-base font-semibold"
            style={{ color: secondary }}
          >
            Hierarchy check
          </h2>
          <p className="font-mono text-xs opacity-70">
            {primary} · {accent} · {text}
          </p>
        </div>
      </div>
    </div>
  );
}
