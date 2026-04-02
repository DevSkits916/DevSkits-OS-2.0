# DevSkits OS 95

DevSkits OS 95 is a framework-free retro web desktop built with plain **HTML, CSS, and JavaScript**. It recreates a Windows 95-inspired shell with a boot sequence, desktop icons, start menu, draggable windows, a terminal-first workflow, and local persistence.

No build tooling, package manager, or runtime dependencies are required.

## What this project is

- A static web OS shell with intentional retro UX.
- A manifest-driven app/window system.
- A terminal that can launch apps, browse routes, and inspect a virtual filesystem.
- A persistent local environment backed by `localStorage`.

## Architecture overview

### Shell core
- `index.html`: desktop scaffold, templates, and script loading order.
- `js/core/state.js`: app manifest, start menu sections, aliases, and shared UI state.
- `js/core/window-manager.js`: open/focus/minimize/maximize/close, taskbar buttons, session restore.
- `js/core/desktop.js`: desktop icon layout, drag/grid persistence, context menu, run dialog, tray, notifications, boot handoff.
- `js/core/start-menu.js`: searchable launcher rendered from manifest data.

### Shared systems
- `js/core/world.js`: simulated “living system” data model (logs, reminders, updates, services, presence, index).
- `js/core/vfs.js`: virtual filesystem (`devskits-vfs-v1`) used by Terminal + File Explorer + Notepad flows.
- `js/core/terminal-engine.js`: command parser/executor, help metadata, aliases, completions.
- `js/core/app-helpers.js`: shared utilities for app registration, clipboard copy, safe links, and downloads.

### App layer
- `js/apps/*.js`: app implementations registered into `window.DevSkitsAppRegistry`.
- `js/apps/phase4-world.js`: navigator, inbox, install center, recycle, search, and additional system modules.
- `js/apps/loki-game/*`: standalone Loki mini-game engine modules.

## App overview

Core desktop apps include:
- Terminal
- My Computer (Explorer)
- Settings
- Notepad
- Navigator (internal `devskits://` + external URL embedding attempts)
- Calculator
- Calendar / Clock

System + utility modules include:
- Updater
- Process Monitor
- System Logs
- Activity Log
- Profile
- Presence
- Recycle Bin
- Search Everywhere

Creator + identity modules include:
- Projects, Links, Contact, Donate, About
- Reminders, Quote Forge, ASCII Maker, Draft Pad
- Loki + Loki Game

## Terminal overview

The shell supports grouped commands for:
- System controls (`help`, `status`, `uptime`, `reboot`, `settings`)
- Identity shortcuts (`about`, `contact`, `donate`, `github`, `loki`)
- App launching (`apps`, `open`, `run`, `browser`)
- Filesystem navigation (`pwd`, `ls`, `cd`, `cat`)
- Session utilities (`history`, `recent`, `search`, `alias`, `notify`, `theme`)

All exposed commands are backed by real handlers in `js/core/terminal-engine.js`.

## Persistence / localStorage overview

Main keys used by DevSkits OS 95:
- `devskits-vfs-v1` – virtual filesystem tree.
- `devskits-app-settings-v2` – settings model (theme, motion, density, clock, sound, boot behavior).
- `devskits-session` + `devskits-window-bounds` – open windows + per-app geometry.
- `devskits-icon-positions`, `devskits-icon-layout-version`, `devskits-desktop-labels-v1` – desktop layout and renames.
- `devskits-term-history`, `devskits-shell-aliases-v1` – terminal history and custom aliases.
- `devskits-nav-history-v2`, `devskits-nav-bookmarks-v2`, `devskits-nav-last-v2` – navigator state.
- `devskits-*` world keys from `js/core/world.js` (logs, updates, reminders, notifications, profile, services, etc.).

## Run / deploy

### Local run
Because this is a static site, serve the repository root with any static server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

### Static hosting
Deploy as static assets on GitHub Pages, Netlify, Vercel static output, Cloudflare Pages, or any CDN/static host.

## Guardrails

- Keep it framework-free.
- Preserve DevSkits OS 95 visual identity and desktop metaphor.
- Prefer focused quality fixes over broad rewrites.
