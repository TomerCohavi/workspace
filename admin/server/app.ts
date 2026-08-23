import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { optionalBearerAuth } from "./auth";
import { ApiError, errorBody } from "./errors";
import type { SystemsRepository } from "./repository";
import { TokensSchema } from "./tokens";

function projectRootFromEnv(): string {
  return process.env.DESIGNALIGN_PROJECT_ROOT || process.cwd();
}

function collectCssFiles(mainPath: string): string {
  const abs = isAbsolute(mainPath) ? mainPath : resolve(mainPath);
  if (!existsSync(abs)) {
    throw new ApiError(404, "not_found", `Artifact not found: ${mainPath}`);
  }
  let content = readFileSync(abs, "utf8");
  const dir = abs.replace(/[^/\\]+$/, "");
  const linkRe = /<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi;
  for (const m of content.matchAll(linkRe)) {
    const cssPath = join(dir, m[1]);
    if (existsSync(cssPath)) {
      content += `\n${readFileSync(cssPath, "utf8")}`;
    }
  }
  return content;
}

/** Minimal color validation against contract tokens (full checkers live in MCP package). */
function validateColors(
  content: string,
  tokens: z.infer<typeof TokensSchema>,
): { ok: boolean; violations: { rule: string; detail: string }[] } {
  const allowed = new Set<string>();
  const add = (hex: string) => {
    let h = hex.trim().toLowerCase();
    if (!h.startsWith("#")) h = `#${h}`;
    if (h.length === 4) {
      h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
    }
    allowed.add(h);
  };
  if (tokens.palette?.colors) Object.values(tokens.palette.colors).forEach(add);
  if (tokens.colors) Object.values(tokens.colors).forEach(add);

  const violations: { rule: string; detail: string }[] = [];
  const HEX_RE = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g;
  for (const m of content.matchAll(HEX_RE)) {
    let h = m[0].toLowerCase();
    if (h.length === 4) {
      h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
    }
    if (!allowed.has(h)) {
      violations.push({
        rule: "colors",
        detail: `Disallowed color "${h}". Allowed: ${[...allowed].join(", ")}`,
      });
    }
  }
  return { ok: violations.length === 0, violations };
}

export function createApp(repo: SystemsRepository) {
  const app = new Hono();

  app.use("*", cors());
  app.use("/api/*", optionalBearerAuth);

  app.onError((err, c) => {
    if (err instanceof ApiError) {
      return c.json(errorBody(err), err.status as 400);
    }
    if (err instanceof z.ZodError) {
      return c.json(
        {
          error: {
            code: "validation_error",
            message: "Request validation failed",
            details: err.flatten(),
          },
        },
        400,
      );
    }
    console.error(err);
    return c.json(
      {
        error: {
          code: "internal",
          message: err instanceof Error ? err.message : String(err),
        },
      },
      500,
    );
  });

  app.get("/api/v1/health", (c) =>
    c.json({ ok: true, service: "designalign-api", version: "0.1.0" }),
  );

  app.get("/api/v1/systems", (c) => c.json({ systems: repo.list() }));

  app.post("/api/v1/systems", async (c) => {
    const body = z
      .object({
        name: z.string().min(1),
        slug: z.string().optional(),
        preset: z.enum(["aurora", "slate"]).optional(),
      })
      .parse(await c.req.json());
    const created = repo.create(body);
    return c.json(created, 201);
  });

  app.get("/api/v1/systems/:slug", (c) => {
    return c.json(repo.get(c.req.param("slug")));
  });

  app.put("/api/v1/systems/:slug", async (c) => {
    const body = z
      .object({
        tokens: TokensSchema,
        designLanguageMd: z.string().optional(),
      })
      .parse(await c.req.json());
    return c.json(repo.update(c.req.param("slug"), body));
  });

  app.delete("/api/v1/systems/:slug", (c) => {
    repo.delete(c.req.param("slug"));
    return c.json({ ok: true });
  });

  app.post("/api/v1/systems/:slug/export", async (c) => {
    const body = z
      .object({
        projectRoot: z.string().min(1),
      })
      .parse(await c.req.json());
    const result = repo.exportToProject(c.req.param("slug"), body.projectRoot);
    return c.json(result);
  });

  app.get("/api/v1/projects/current/contract", (c) => {
    const root = c.req.query("projectRoot") || projectRootFromEnv();
    return c.json(repo.getProjectContract(root));
  });

  app.put("/api/v1/projects/current/contract", async (c) => {
    const body = z
      .object({
        projectRoot: z.string().optional(),
        tokens: TokensSchema,
        designLanguageMd: z.string().optional(),
      })
      .parse(await c.req.json());
    const root = body.projectRoot || projectRootFromEnv();
    return c.json(
      repo.putProjectContract(root, {
        tokens: body.tokens,
        designLanguageMd: body.designLanguageMd,
      }),
    );
  });

  app.post("/api/v1/validate", async (c) => {
    const body = z
      .object({
        path: z.string().min(1),
        kind: z.enum(["presentation", "static-site", "document"]),
        projectRoot: z.string().optional(),
        systemSlug: z.string().optional(),
      })
      .parse(await c.req.json());

    const root = body.projectRoot || projectRootFromEnv();
    const contract = body.systemSlug
      ? repo.get(body.systemSlug)
      : repo.getProjectContract(root);

    const artifactPath = isAbsolute(body.path)
      ? body.path
      : join(root, body.path);
    const content = collectCssFiles(artifactPath);
    const result = validateColors(content, contract.tokens);
    return c.json({
      ...result,
      kind: body.kind,
      contractSlug: body.systemSlug || "current",
    });
  });

  return app;
}
