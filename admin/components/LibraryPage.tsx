"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { client, type SystemSummary } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function LibraryPage() {
  const [systems, setSystems] = useState<SystemSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [preset, setPreset] = useState<"aurora" | "slate" | "blank">("aurora");
  const [creating, setCreating] = useState(false);

  async function refresh() {
    try {
      const data = await client.listSystems();
      setSystems(data.systems);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function create() {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const created = await client.createSystem({
        name: name.trim(),
        preset: preset === "blank" ? undefined : preset,
      });
      setOpen(false);
      setName("");
      window.location.href = `/systems/${created.slug}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  }

  async function remove(slug: string) {
    if (!confirm(`Delete “${slug}”?`)) return;
    try {
      await client.deleteSystem(slug);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Systems</h1>
          <p className="text-sm text-muted-foreground">
            Local library. Edit visually, serve over REST for Claude.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus />
            New system
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New design system</DialogTitle>
              <DialogDescription>
                Start from a preset or a blank palette.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="sys-name">Name</Label>
                <Input
                  id="sys-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Brand"
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <Label>Preset</Label>
                <Select
                  value={preset}
                  onValueChange={(v) =>
                    setPreset(v as "aurora" | "slate" | "blank")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aurora">Aurora</SelectItem>
                    <SelectItem value="slate">Slate</SelectItem>
                    <SelectItem value="blank">Blank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={creating || !name.trim()}
                onClick={create}
              >
                {creating ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {systems.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No systems yet</CardTitle>
            <CardDescription>
              Create one from a preset to start editing colors and tokens.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {systems.map((s) => {
            const entries = Object.entries(s.colors);
            return (
              <Card key={s.slug} className="overflow-hidden py-0 gap-0">
                <div className="flex h-14">
                  {(entries.length ? entries : [["empty", "#e5e5e5"]]).map(
                    ([k, v]) => (
                      <div
                        key={k}
                        className="flex-1"
                        style={{ background: v }}
                        title={`${k}: ${v}`}
                      />
                    ),
                  )}
                </div>
                <CardHeader className="pt-4">
                  <CardTitle className="text-base">{s.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 font-mono text-xs">
                    /{s.slug}
                    {s.version ? (
                      <Badge variant="secondary" className="font-mono">
                        v{s.version}
                      </Badge>
                    ) : null}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="gap-2 pb-4">
                  <Link
                    href={`/systems/${s.slug}`}
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    Open
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(s.slug)}
                  >
                    <Trash2 />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
