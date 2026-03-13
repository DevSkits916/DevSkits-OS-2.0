https://devskits916.github.io/DevSkits-OS-2.0/# DevSkits 3.1

A browser-based retro desktop experience built as a **fictional operating system**, personal identity hub, and interactive portfolio for **Travis Ramsey / DevSkits**.

**DevSkits 3.1** is the next evolution of the DevSkits OS project: a monochrome, Windows-inspired desktop environment with draggable windows, terminal tooling, internal apps, browser-style pages, simulated system behavior, and a growing in-OS world.

---

## Windows 3.1 Restyle Update

Recent UI/UX repairs focused on a stronger **Windows 3.1 Program Manager** look while keeping the same app/content structure:

- Rebuilt shell styling into a consistent Windows 3.1 visual system: gray beveled controls, blue title bars, sharp corners, and retro font stack.
- Reworked desktop icon rendering/layout so all icons are visible on load, aligned to a responsive desktop grid, and remain clickable on desktop + touch devices.
- Added a unified inline SVG icon library (local inline SVG only, no CDN) and mapped core desktop apps/shortcuts to consistent retro icons.
- Improved desktop behavior: single-tap icon launch on mobile, drag-to-reposition icons on non-touch desktop, and better keyboard navigation.
- Improved window behavior: safer viewport clamping, responsive launch sizing, and mobile-friendly near-fullscreen windows that stay inside bounds.

### Icon System

Icon definitions now live in `js/core/state.js` as an inline SVG library (`ICON_LIBRARY`) and are assigned per app via `iconSvg`.

### Desktop Icon Layout

Desktop icons now use a responsive slot/grid placement strategy based on viewport width:

- desktop: roomy columns + drag support
- tablet: tighter grid spacing
- phone: compact layout, no drag, tap-to-open

Saved icon positions are clamped and deduplicated so icons do not overlap or render off-screen after resize.

### Mobile Behavior

For narrow viewports, windows open near-fullscreen with larger title controls and remain viewport-contained. Desktop icons retain touch-friendly hit targets and readable labels without horizontal overflow.

---

## Live Demo

[Launch DevSkits 3.1](https://devskits916.github.io/DevSkits-OS-2.0/)

> Update this URL if the repo or deployment path changes. GitHub Pages, in its infinite elegance, will not do that for you.

---

## Overview

DevSkits 3.1 is a static front-end “fake operating system” built to feel like a usable retro desktop instead of a normal personal website.

It is designed to function as:

- a **digital identity hub**
- an **interactive portfolio**
- a **retro desktop / OS concept**
- a **creative world with internal apps and routes**
- a **platform for ongoing phased expansion**

Rather than flattening everything into one page, DevSkits 3.1 presents content through a desktop shell with windows, apps, commands, routes, icons, system panels, and persistent state.

---

## Stack

- **HTML**
- **CSS**
- **Vanilla JavaScript**
- **SVG / base64 embedded assets**
- **localStorage**
- **GitHub Pages**

No frameworks.  
No build tools.  
No backend.  
No dependency pile masquerading as ambition.

---

## Core Experience

DevSkits 3.1 is built to feel like a small fictional computer system.

### Shell Features
- boot animation / startup screen
- custom **DevSkits 3.1** boot branding
- retro monochrome desktop
- draggable windows
- taskbar with active app states
- start menu / launcher
- live clock
- local persistence via `localStorage`
- desktop app icons
- internal routing between apps and pages

### Design Language
- Windows 3.x / 95 inspired shell
- monochrome black / white / gray palette
- terminal / CRT influenced styling
- old-school interface chrome
- static-site friendly architecture
- mobile-aware layout

---

## Built-In Apps

Depending on the current phase of the project, DevSkits 3.1 may include:

- **Terminal**
- **Files**
- **Settings**
- **Contact**
- **Donate**
- **Projects**
- **Loki**
- **Notes**
- **Links**
- **About**
- **Browser / Navigator**
- **Inbox**
- **Build Log**
- **Run dialog**
- **Install Center / package system**
- **Quote Forge**
- **ASCII Maker**
- **Post Draft Pad**
- **Recycle Bin**
- **Calculator**
- **Calendar / Planner**
- **Sticky Notes**
- **Activity / Logs**
- **Process Monitor**
- **System Update**
- **Profile / Stats**
- **utility apps and hidden experimental modules**

The exact app list depends on how far the current branch or deployed build has progressed.

---

## Terminal

The terminal is a primary interface layer inside DevSkits 3.1.

### Common Commands

```txt
help
clear
cls
about
contact
donate
links
projects
loki
github
date
whoami
theme
reboot
ls
dir
cd
pwd
cat
open
echo
ver
hostname
settings
run
history
apps
mail
browser
changelog
pkg
recent
search
find
achievements
updates
install
restart
services
ps
logs
notify
inbox
remind
tasks
stats
profile
reindex
events
uptime
status
