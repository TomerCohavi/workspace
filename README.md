# DesignAlign

Claude Code plugin that keeps generated **HTML presentations** and **static sites** on-brand.

1. Set a palette (preset or custom colors)  
2. Generate a deck or one-pager  
3. Local MCP **`validate_artifact`** returns violations  
4. Claude Code fixes until validation passes  

No database. No hosted API key. Uses the user’s Claude Code account for generation; MCP validation runs locally.

## Requirements

- [Claude Code](https://code.claude.com/) CLI  
- Node.js 20+ (to run the bundled MCP server)

## Install Claude Code (once)

```bash
npm install -g @anthropic-ai/claude-code
claude --version
claude login    # or: claude   # follow the browser auth prompt
```

Confirm you’re signed in:

```bash
claude auth status
```

## Run DesignAlign locally (dev — no GitHub needed)

From a **demo project folder**, mount this repo’s plugin:

```bash
mkdir -p /tmp/designalign-demo && cd /tmp/designalign-demo
claude --plugin-dir /Users/tomer/Development/workspace/plugin
```

You should see `designalign` loaded. Inside Claude Code:

```text
/designalign:setup
```

Pick preset **aurora** or **slate** (or custom colors). Then:

```text
/designalign:presentation
```

or

```text
/designalign:static-site
```

Open the result:

- Presentation: `out/presentation/index.html`
- Static site: `out/site/index.html`

Check MCP tools are available with `/mcp` if needed. After editing plugin MCP code, rebuild then reload:

```bash
cd /Users/tomer/Development/workspace/plugin/mcp-server && npm run build
# in Claude Code:
/reload-plugins
```

## Install for everyday use (marketplace)

After this repo is on GitHub:

```text
/plugin marketplace add <you>/<repo>
/plugin install designalign@designalign
```

Exact marketplace name is `designalign` (see [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json)). Then use the same `/designalign:*` skills in any project.

## Local development checks

```bash
cd plugin/mcp-server
npm install
npm test
npm run build
claude plugin validate ./plugin --strict
claude --plugin-dir ./plugin plugin list
```

### MCP inspector (optional)

```bash
npx @modelcontextprotocol/inspector node plugin/mcp-server/dist/server.js
```

## Repo layout

```text
.claude-plugin/marketplace.json   # marketplace catalog
plugin/
  .claude-plugin/plugin.json
  .mcp.json                       # stdio MCP via CLAUDE_PLUGIN_ROOT
  skills/                         # setup, presentation, static-site
  presets/                        # aurora, slate
  mcp-server/                     # validate + MCP (dist/server.js committed)
```

## Branding

DesignAlign is an independent plugin **for Claude Code**. It is not Claude Code or an Anthropic product.
