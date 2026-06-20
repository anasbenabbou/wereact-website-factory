# Migrating the factory to a new laptop / Claude account

Most of the factory lives in **this git repo** — clone it and you have the code,
template, workflow, premium components, motion library, design-knowledge, intake
form, and CLAUDE.md. Only **secrets**, **machine tools**, and **account-linked
connectors** need to be re-set. This guide + `bootstrap.sh` make that ~10 minutes.

---

## What's portable vs. what you re-set

| Portable (in this git repo — comes with the clone) | Re-set on the new machine |
|---|---|
| Factory code, `template/`, `workflows/`, `tools/` | Toolchain: bun, gh, ffmpeg, node deps |
| `components/` (premium kit + motion library) | Plugins: claude-seo, frontend-design, etc. |
| `design-knowledge/` (reference teardowns) | MCP servers: chrome-devtools, magic, higgsfield |
| `clients/_TEMPLATE/intake.md`, `new-client.mjs` | API keys (`.env`) + tokens |
| `CLAUDE.md`, `DESIGN-RESOURCES.md`, docs | GitHub auth (`gh auth login`) |
| | Global `~/.claude/CLAUDE.md` (copy from §5) |

**NOT in git (carry separately, securely):** your `.env` keys and the 21st.dev Magic key.

---

## Step 0 — carry these secrets with you (password manager / secure note)
From the old machine's `~/Desktop/wereact-website-factory/.env`:
- `VERCEL_TOKEN`
- `GEMINI_API_KEY`
- `FAL_KEY`
- `TOGETHER_API_KEY`
- `PEXELS_API_KEY`
- `UNSPLASH_ACCESS_KEY`
And from `~/.claude.json` MCP config: the **21st.dev Magic `API_KEY`**.
(You can also just re-generate any of these from their dashboards — see `.env.example`.)

## Step 1 — clone the factory
```bash
cd ~/Desktop
git clone <your-factory-repo-url> wereact-website-factory
cd wereact-website-factory
```

## Step 2 — run the bootstrap (installs toolchain + deps + plugins)
```bash
bash bootstrap.sh
```
This installs bun, gh, ffmpeg (prebuilt binaries — no slow source builds), runs
`npm install` in the factory + template (project-local cache), and installs the
Claude Code plugins. Re-open your shell afterwards so PATH updates apply.

## Step 3 — keys
```bash
cp .env.example .env    # then paste the keys you carried in Step 0
```

## Step 4 — GitHub auth
```bash
~/.local/bin/gh auth login          # OR: echo "<PAT>" | gh auth login --with-token
gh auth setup-git
```

## Step 5 — global CLAUDE.md (so any session, any folder, knows the factory)
Copy `./SETUP-global-CLAUDE.md` (shipped in this repo) to `~/.claude/CLAUDE.md`:
```bash
mkdir -p ~/.claude && cp SETUP-global-CLAUDE.md ~/.claude/CLAUDE.md
```
Also register the workflow globally:
```bash
mkdir -p ~/.claude/workflows && cp workflows/website-factory.mjs ~/.claude/workflows/
```

## Step 6 — MCP servers
Local (CLI) MCPs — re-add with the new paths:
```bash
F=~/Desktop/wereact-website-factory
claude mcp add chrome-devtools --scope user -- ~/.bun/bin/bun $F/node_modules/.bin/chrome-devtools-mcp --headless --isolated
claude mcp add magic --scope user --env API_KEY=<your-21st-key> -- /usr/local/bin/node $F/node_modules/.bin/magic
```
Account-linked (claude.ai) connectors — reconnect in the **new Claude account**:
- **Higgsfield** (image/video): Claude → Connectors → add `https://mcp.higgsfield.ai/mcp` → sign in
- **Vercel** (optional; we deploy via the CLI + token, so not required)
Verify: `claude mcp list` (chrome-devtools + magic should show ✔ Connected).

## Step 7 — verify
```bash
cd template && npm run build --prefix . 2>/dev/null || (npm install --cache ./.npm-cache && npm run build)
```
A clean build = you're ready. Then in Claude Code: **"build <slug>"** works as before.

---

## ⚠️ Switching Claude *account* specifically
- **claude.ai connectors** (Higgsfield, Google Drive, Vercel-via-claude.ai) are tied to
  the account → must be reconnected on the new account (Step 6).
- **CLI MCPs** (chrome-devtools, magic, gbrain) live in `~/.claude.json` → re-add (Step 6); they're not account-bound.
- **Plugins** are per-user → reinstalled by `bootstrap.sh`.
- **Usage limits** reset per account — a fresh account = fresh limit (the thing that
  blocked the Marrakech deploy).
- **claude-mem / gbrain** memory DBs are local; optional to migrate (copy `~/gbrain` and
  the claude-mem data dir if you want past memory). The factory doesn't depend on them.
