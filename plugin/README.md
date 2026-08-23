# DesignAlign plugin

See the [repository README](../README.md) for install and local testing.

## Skills

| Skill | Purpose |
| --- | --- |
| `setup` | Write `designalign/tokens.json` + `design-language.md` |
| `presentation` | Generate `out/presentation/index.html` + validate |
| `static-site` | Generate `out/site/*` + validate |

## MCP tools

| Tool | Purpose |
| --- | --- |
| `list_design_systems` | List library systems via REST `/api/v1/systems` |
| `get_design_contract` | Read tokens + design language (REST or local fallback) |
| `update_design_system` | Save a library system via REST |
| `apply_system_to_project` | Export library system into project `designalign/` |
| `validate_artifact` | Check HTML/CSS against tokens (REST or local) |
