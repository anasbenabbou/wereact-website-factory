#!/usr/bin/env bash
# Wereact Website Factory — new-machine bootstrap (macOS).
# Installs the toolchain via prebuilt binaries (no slow source builds), project
# deps, and Claude Code plugins. Safe to re-run. See SETUP.md for the full guide.
set -uo pipefail
FACTORY="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARCH="amd64"; [ "$(uname -m)" = "arm64" ] && ARCH="arm64"
mkdir -p "$HOME/.local/bin"

say() { printf "\n\033[1m▶ %s\033[0m\n" "$1"; }

# --- PATH (bun + local bin) ---
if ! grep -q '.bun/bin' "$HOME/.zshrc" 2>/dev/null; then
  printf '\n# factory toolchain\nexport BUN_INSTALL="$HOME/.bun"\nexport PATH="$HOME/.local/bin:$HOME/.bun/bin:$PATH"\n' >> "$HOME/.zshrc"
fi
export BUN_INSTALL="$HOME/.bun"; export PATH="$HOME/.local/bin:$HOME/.bun/bin:$PATH"

# --- bun (official prebuilt installer) ---
if ! command -v bun >/dev/null 2>&1; then say "Installing bun"; curl -fsSL https://bun.sh/install | bash; fi
export PATH="$HOME/.bun/bin:$PATH"

# --- gh (prebuilt binary) ---
if ! command -v gh >/dev/null 2>&1 && [ ! -x "$HOME/.local/bin/gh" ]; then
  say "Installing gh CLI"
  V=$(curl -fsSL https://api.github.com/repos/cli/cli/releases/latest | grep '"tag_name"' | head -1 | sed -E 's/.*"v?([^"]+)".*/\1/')
  curl -fsSL "https://github.com/cli/cli/releases/download/v${V}/gh_${V}_macOS_${ARCH}.zip" -o /tmp/gh.zip
  (cd /tmp && unzip -oq gh.zip && cp "gh_${V}_macOS_${ARCH}/bin/gh" "$HOME/.local/bin/gh" && chmod +x "$HOME/.local/bin/gh")
fi

# --- ffmpeg (static binary) ---
if [ ! -x "$HOME/.local/bin/ffmpeg" ] && ! command -v ffmpeg >/dev/null 2>&1; then
  say "Installing ffmpeg (static)"
  curl -fsSL "https://evermeet.cx/ffmpeg/getrelease/ffmpeg/zip" -o /tmp/ffmpeg.zip
  (cd /tmp && unzip -oq ffmpeg.zip && cp ffmpeg "$HOME/.local/bin/ffmpeg" && chmod +x "$HOME/.local/bin/ffmpeg")
fi

# --- node deps (project-local cache; sandbox-safe) ---
say "Installing factory tooling deps"
(cd "$FACTORY" && npm install --cache ./.npm-cache --no-audit --no-fund)
say "Installing template deps"
(cd "$FACTORY/template" && npm install --cache ./.npm-cache --no-audit --no-fund)

# --- Claude Code plugins ---
if command -v claude >/dev/null 2>&1; then
  say "Installing Claude Code plugins"
  claude plugin marketplace add anthropics/claude-plugins-official 2>/dev/null || true
  claude plugin marketplace add AgriciDaniel/claude-seo 2>/dev/null || true
  claude plugin marketplace add thedotmack/claude-mem 2>/dev/null || true
  for p in "frontend-design@claude-plugins-official" "code-review@claude-plugins-official" \
           "pr-review-toolkit@claude-plugins-official" "claude-seo@agricidaniel-claude-seo" \
           "claude-mem@thedotmack"; do
    claude plugin install "$p" 2>/dev/null || true
  done
else
  echo "  (claude CLI not found on PATH — install Claude Code, then re-run this for plugins)"
fi

say "Bootstrap done. Next: SETUP.md steps 3-7 (keys, gh auth, global CLAUDE.md, MCP servers, verify)."
echo "  bun:    $(command -v bun || echo MISSING)"
echo "  gh:     $($HOME/.local/bin/gh --version 2>/dev/null | head -1 || echo MISSING)"
echo "  ffmpeg: $($HOME/.local/bin/ffmpeg -version 2>/dev/null | head -1 | cut -c1-30 || echo MISSING)"
echo "  Re-open your terminal so PATH changes take effect."
