# DesignAlign Admin

Next.js local admin for design systems. UI + REST `/api/v1` in one process.

## Run

```bash
cd admin
npm install
npm run dev
```

Open http://127.0.0.1:3000

API base (for MCP / SaaS later): `http://127.0.0.1:3000`

```bash
export DESIGNALIGN_API_BASE=http://127.0.0.1:3000
# optional later:
# export DESIGNALIGN_API_TOKEN=...
```

Library files: `../systems/<slug>/tokens.json` (+ `design-language.md`).
