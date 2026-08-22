import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadDesignContract } from "./tokens.js";
import { validateArtifact, type ArtifactKind } from "./validate.js";

function projectRoot(): string {
  return process.env.DESIGNALIGN_PROJECT_ROOT || process.cwd();
}

const server = new McpServer({
  name: "designalign",
  version: "0.1.0",
});

server.tool(
  "get_design_contract",
  "Read the DesignAlign design contract (tokens + design language) from the current project. Call this before generating any artifact.",
  {},
  async () => {
    try {
      const contract = loadDesignContract(projectRoot());
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(contract, null, 2),
          },
        ],
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
  "Validate a generated HTML/CSS artifact against the DesignAlign design contract. Returns ok + violations. Always call after writing files; fix and re-validate until ok or 3 attempts.",
  {
    path: z
      .string()
      .describe(
        "Path to the main HTML file relative to the project root, e.g. out/presentation/index.html",
      ),
    kind: z
      .enum(["presentation", "static-site", "document"])
      .describe("Which artifact rules to apply"),
  },
  async ({ path, kind }) => {
    const result = validateArtifact({
      projectRoot: projectRoot(),
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
