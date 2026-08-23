"use client";

import type { DesignTokens } from "@/server/tokens";
import { extractColorMap } from "@/server/tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  tokens: DesignTokens;
  onChange: (tokens: DesignTokens) => void;
};

export function PaletteEditor({ tokens, onChange }: Props) {
  const colors = extractColorMap(tokens);

  function setColor(key: string, value: string) {
    const nextColors = { ...colors, [key]: value };
    const legacyKeys = [
      "primary",
      "secondary",
      "background",
      "text",
      "accent",
    ] as const;
    const hasLegacy = legacyKeys.every((k) => k in nextColors);

    onChange({
      ...tokens,
      palette: {
        ...tokens.palette,
        colors: nextColors,
      },
      colors: hasLegacy
        ? {
            primary: nextColors.primary,
            secondary: nextColors.secondary,
            background: nextColors.background,
            text: nextColors.text,
            accent: nextColors.accent,
          }
        : tokens.colors,
    });
  }

  function renameKey(oldKey: string, newKey: string) {
    if (!newKey || newKey === oldKey || newKey in colors) return;
    const nextColors: Record<string, string> = {};
    for (const [k, v] of Object.entries(colors)) {
      nextColors[k === oldKey ? newKey : k] = v;
    }
    onChange({
      ...tokens,
      palette: { ...tokens.palette, colors: nextColors },
    });
  }

  function removeKey(key: string) {
    const nextColors = { ...colors };
    delete nextColors[key];
    onChange({
      ...tokens,
      palette: { ...tokens.palette, colors: nextColors },
    });
  }

  function addColor() {
    let i = 1;
    let key = `color${i}`;
    while (key in colors) {
      i += 1;
      key = `color${i}`;
    }
    setColor(key, "#888888");
  }

  return (
    <div className="space-y-3">
      {Object.entries(colors).map(([key, value]) => (
        <div key={key} className="grid grid-cols-[1fr_7rem_2.25rem_auto] gap-2">
          <Input
            defaultValue={key}
            onBlur={(e) => renameKey(key, e.target.value.trim())}
            aria-label="Color role"
            className="font-mono text-xs"
          />
          <Input
            value={value}
            onChange={(e) => setColor(key, e.target.value)}
            aria-label={`${key} hex`}
            className="font-mono text-xs"
          />
          <Input
            type="color"
            value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#888888"}
            onChange={(e) => setColor(key, e.target.value)}
            aria-label={`${key} picker`}
            className="cursor-pointer p-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeKey(key)}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addColor}>
        Add color
      </Button>
    </div>
  );
}
