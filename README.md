# DevSkits 3.1

A browser-based retro desktop portfolio that looks and behaves like a fictional operating system.

**Live site:** https://devskits916.github.io/DevSkits-OS-2.0/

---

## What this is

DevSkits 3.1 is a static web app that recreates an old-school desktop environment in the browser, including:

- a BIOS/splash style boot sequence
- desktop icons and right-click context actions
- draggable/resizable app windows
- start menu + run dialog
- system tray clock + taskbar window buttons
- a command-driven in-OS terminal
- app modules for portfolio content, tools, and world/lore pages

This project is both a **personal site** and a **creative OS simulation**.

---

## Current app modules

The current build wires these apps/modules:

- Terminal
- Files
- Settings
- Contact
- Donate
- Projects
- Loki
- Notes
- Links
- About
- Phase 4 Tools
- Phase 4 World
- Phase 5 Living

(See script/app registration in `index.html` and `js/apps/*`.)

---

## Tech stack

- HTML
- CSS
- Vanilla JavaScript
- localStorage (state persistence)
- GitHub Pages (deployment)

No framework, no build step, no backend.

---

## Project structure

```txt
.
├── index.html                # main desktop shell
├── style.css                 # desktop + window + app styling
├── boot.css / boot.js        # boot sequence UI/logic
├── app.js                    # app bootstrap
└── js
    ├── core                  # desktop, state, windowing, start menu, terminal engine
    ├── apps                  # individual app renderers
    └── data                  # projects/filesystem/system seed data
```

---

## Run locally

Because this is a static site, you can run it with any local server.

### Option A: Python

```bash
python3 -m http.server 8080
```

Then open: `http://localhost:8080`

### Option B: VS Code Live Server

Open the repo and start Live Server on `index.html`.

---

## Deployment

This repo is designed for GitHub Pages. Push to the configured branch and serve the root as a static site.

---

## Notes

- Terminal history and parts of desktop/session state are persisted in `localStorage`.
- Mobile behavior is supported with touch-friendly icon/window handling.
- This codebase is intentionally framework-free and easy to edit directly.
