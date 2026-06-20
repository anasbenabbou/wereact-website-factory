# Global notes — Job Workflow Hub

This file loads in EVERY Claude Code session (any directory). It is the registry
of reusable **agent workflows** ("jobs") and the shared machine setup.

## Job workflows (reusable multi-agent pipelines)
Registered workflows live in `~/.claude/workflows/` and run via the **Workflow tool**
by name. Each job is a self-contained project folder with its own `CLAUDE.md` + `.env`,
so it is portable and independent of any other project (including `dkm-apis`).

### Registry
| Workflow name | Project folder | Trigger phrase | Output |
|---|---|---|---|
| `website-factory` | `~/Desktop/wereact-website-factory/` | "build a website for X" / "run the website factory" | live `*.vercel.app` site, GitHub repo |
<!-- add new jobs below this line -->

When the user invokes a trigger above, read that project's `CLAUDE.md`, then run the
Workflow tool with `name:"<workflow>"` and `args:{...}` as that CLAUDE.md specifies.

### To create a NEW job workflow
1. `mkdir ~/Desktop/<job>` , `git init`, add a `CLAUDE.md` (trigger + layout + run steps).
2. Write `workflows/<job>.mjs` — start with `export const meta = {...}` then the crew
   using `agent()/parallel()/pipeline()/phase()/log()` and read inputs from `args`.
3. Register globally: copy it to `~/.claude/workflows/<job>.mjs`
   (re-copy after every edit so the global trigger stays in sync).
4. Add a row to the Registry table above.
5. Put any API keys in the job's own `.env` (gitignored).

## Machine / toolchain (macOS 13 Ventura — Homebrew Tier 3)
- Binaries: `bun` → `~/.bun/bin/bun` · `gh` → `~/.local/bin/gh` · `ffmpeg` → `~/.local/bin/ffmpeg`.
  Ensure `~/.local/bin` and `~/.bun/bin` are on PATH (they are in `~/.zshrc`).
- **npm**: always `npm install --cache ./.npm-cache` — the Bash sandbox blocks writes to `~/.npm`.
- **Avoid `brew install`** for heavy formulae — this OS has no bottles (Tier 3) so it builds
  from source (e.g. bun pulled LLVM+Rust). Use official prebuilt binaries / install scripts.
- Global npm needs sudo — avoid; install locally or to `~/.local`.
- Installed tooling: gstack skills (`~/.claude/skills/gstack`), gbrain (PGLite + MCP `gbrain serve`),
  claude-mem, claude-seo, frontend-design, pr-review-toolkit, code-review.

## Connection state (for the factory; reused by future image/deploy jobs)
- ✅ GitHub (`gh`, user `anasbenabbou`) · Vercel (token in factory `.env`) · Pexels · Unsplash · higgsfield (MCP).
- 🟡 Gemini key valid but image gen needs billing · fal.ai key valid but needs balance.
- ⏳ OpenAI/GPT key to be added later (will extend the image Asset Engine).
