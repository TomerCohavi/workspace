import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { apiFetch } from "./api-client.js";
import { loadDesignContract, TokensSchema } from "./tokens.js";
import { validateArtifact, type ArtifactKind } from "./validate.js";

function projectRoot(): string {
  return process.env.DESIGNALIGN_PROJECT_ROOT || process.cwd();
}

const server = new McpServer({
  name: "designalign",
  version: "0.1.0",
});

server.tool(
  "list_design_systems",
  "List design systems in the DesignAlign library via REST GET /api/v1/systems.",
  {},
  async () => {
    try {
      const data = await apiFetch<{ systems: unknown[] }>("/api/v1/systems");
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [{ type: "text" as const, text: message }],
      };
    }
  },
);

server.tool(
  "get_design_contract",
  "Read the DesignAlign design contract. Prefer REST (library slug or current project). Falls back to local designalign/ files if the API is down and no slug is given.",
  {
    slug: z
      .string()
      .optional()
      .describe("Library system slug. Omit to use the current project contract."),
  },
  async ({ slug }) => {
    try {
      if (slug) {
        const data = await apiFetch<{
          slug: string;
          tokens: unknown;
          designLanguageMd: string;
        }>(`/api/v1/systems/${encodeURIComponent(slug)}`);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  tokens: data.tokens,
                  designLanguageMd: data.designLanguageMd,
                  slug: data.slug,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      try {
        const root = projectRoot();
        const data = await apiFetch<{
          tokens: unknown;
          designLanguageMd: string;
        }>(
          `/api/v1/projects/current/contract?projectRoot=${encodeURIComponent(root)}`,
        );
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  tokens: data.tokens,
                  designLanguageMd: data.designLanguageMd,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch {
        const contract = loadDesignContract(projectRoot());
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(contract, null, 2),
            },
          ],
        };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [{ type: "text" as const, text: message }],
      };
    }
  },
);

server.tool(
  "update_design_system",
  "Update a library design system via REST PUT /api/v1/systems/:slug.",
  {
    slug: z.string().describe("Library system slug"),
    tokens: z.record(z.unknown()).describe("Full tokens object"),
    designLanguageMd: z.string().optional().describe("Optional design-language.md body"),
  },
  async ({ slug, tokens, designLanguageMd }) => {
    try {
      const parsed = TokensSchema.parse(tokens);
      const data = await apiFetch(`/api/v1/systems/${encodeURIComponent(slug)}`, {
        method: "PUT",
        body: JSON.stringify({ tokens: parsed, designLanguageMd }),
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [{ type: "text" as const, text: message }],
      };
    }
  },
);

server.tool(
  "apply_system_to_project",
  "Export a library system into a project designalign/ folder via REST POST /api/v1/systems/:slug/export.",
  {
    slug: z.string(),
    projectRoot: z
      .string()
      .optional()
      .describe("Absolute project root. Defaults to DESIGNALIGN_PROJECT_ROOT or cwd."),
  },
  async ({ slug, projectRoot: rootArg }) => {
    try {
      const projectRoot = rootArg || projectRoot();
      const data = await apiFetch(
        `/api/v1/systems/${encodeURIComponent(slug)}/export`,
        {
          method: "POST",
          body: JSON.stringify({ projectRoot }),
        },
      );
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [{ type: "text" as const, text: message }],
      };
    }
  },
);

server.tool(
  "validate_artifact",
  "Validate an HTML/CSS artifact against the design contract. Uses REST POST /api/v1/validate when the admin API is up; otherwise local MCP validation.",
  {
    path: z
      .string()
      .describe(
        "Path to the main HTML file relative to the project root, e.g. out/presentation/index.html",
      ),
    kind: z
      .enum(["presentation", "static-site", "document"])
      .describe("Which artifact rules to apply"),
    systemSlug: z
      .string()
      .optional()
      .describe("Optional library slug to validate against instead of the project contract"),
  },
  async ({ path, kind, systemSlug }) => {
    const root = projectRoot();
    try {
      const data = await apiFetch("/api/v1/validate", {
        method: "POST",
        body: JSON.stringify({
          path,
          kind,
          projectRoot: root,
          systemSlug,
        }),
      });
      const ok =
        data &&
        typeof data === "object" &&
        "ok" in data &&
        Boolean((data as { ok: boolean }).ok);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
        isError: !ok,
      };
    } catch {
      const result = validateArtifact({
        projectRoot: root,
        path,
        kind: kind as ArtifactKind,
      });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
        isError: !result.ok,
      };
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
