"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { client } from "@/lib/api";
import type { DesignTokens } from "@/server/tokens";
import { LivePreview } from "@/components/LivePreview";
import { PaletteEditor } from "@/components/PaletteEditor";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export function SystemEditor({ slug }: { slug: string }) {
  const router = useRouter();
  const [tokens, setTokens] = useState<DesignTokens | null>(null);
  const [language, setLanguage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [exportRoot, setExportRoot] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const detail = await client.getSystem(slug);
        if (cancelled) return;
        setTokens(detail.tokens);
        setLanguage(detail.designLanguageMd);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  function markDirty(next: DesignTokens) {
    setTokens(next);
    setStatus("Unsaved");
  }

  async function save() {
    if (!tokens) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await client.updateSystem(slug, {
        tokens,
        designLanguageMd: language,
      });
      setTokens(updated.tokens);
      setLanguage(updated.designLanguageMd);
      setStatus("Saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function exportToProject() {
    if (!exportRoot.trim()) {
      setError("Enter a project root path to export into");
      return;
    }
    setError(null);
    try {
      const result = await client.exportSystem(slug, exportRoot.trim());
      setStatus(`Exported → ${result.path}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  if (error && !tokens) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!tokens) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground"
            onClick={() => router.push("/")}
          >
            <ArrowLeft />
            Library
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {tokens.name}
            </h1>
            <p className="font-mono text-xs text-muted-foreground">/{slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {status && (
            <span className="text-xs text-muted-foreground">{status}</span>
          )}
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit</CardTitle>
            <CardDescription>Tokens write back to disk via REST.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="palette">
              <TabsList variant="line" className="mb-4 w-full justify-start">
                <TabsTrigger value="palette">Palette</TabsTrigger>
                <TabsTrigger value="meta">Meta</TabsTrigger>
                <TabsTrigger value="language">Language</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="elements">Elements</TabsTrigger>
                <TabsTrigger value="rhythm">Rhythm</TabsTrigger>
              </TabsList>

              <TabsContent value="palette">
                <PaletteEditor tokens={tokens} onChange={markDirty} />
              </TabsContent>

              <TabsContent value="meta" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={tokens.name}
                    onChange={(e) =>
                      markDirty({ ...tokens, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={tokens.version || ""}
                    onChange={(e) =>
                      markDirty({ ...tokens, version: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    value={tokens.source || ""}
                    onChange={(e) =>
                      markDirty({ ...tokens, source: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="exportRoot">Export to project</Label>
                  <div className="flex gap-2">
                    <Input
                      id="exportRoot"
                      placeholder="/path/to/project"
                      value={exportRoot}
                      onChange={(e) => setExportRoot(e.target.value)}
                      className="font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={exportToProject}
                    >
                      Export
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Writes designalign/ into that project for MCP and skills.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="language">
                <div className="grid gap-2">
                  <Label htmlFor="language">design-language.md</Label>
                  <Textarea
                    id="language"
                    className="min-h-72 font-mono text-xs"
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      setStatus("Unsaved");
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="roles">
                <JsonLayerEditor
                  label="roles"
                  value={tokens.roles || {}}
                  onChange={(roles) => markDirty({ ...tokens, roles })}
                />
              </TabsContent>

              <TabsContent value="elements">
                <JsonLayerEditor
                  label="elements"
                  value={tokens.elements || {}}
                  onChange={(elements) => markDirty({ ...tokens, elements })}
                />
              </TabsContent>

              <TabsContent value="rhythm">
                <JsonLayerEditor
                  label="rhythm"
                  value={tokens.rhythm || {}}
                  onChange={(rhythm) => markDirty({ ...tokens, rhythm })}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>Live specimen from current tokens.</CardDescription>
          </CardHeader>
          <CardContent>
            <LivePreview tokens={tokens} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function JsonLayerEditor<T>({
  label,
  value,
  onChange,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setText(JSON.stringify(value, null, 2));
  }, [value]);

  return (
    <div className="grid gap-2">
      <Label htmlFor={label}>{label}</Label>
      <Textarea
        id={label}
        className="min-h-72 font-mono text-xs"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try {
            onChange(JSON.parse(e.target.value) as T);
            setLocalError(null);
          } catch {
            setLocalError("Invalid JSON");
          }
        }}
      />
      {localError && (
        <p className="text-xs text-destructive">{localError}</p>
      )}
    </div>
  );
}
