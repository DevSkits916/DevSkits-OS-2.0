# DevSkits OS 2.0

DevSkits OS 2.0 is a retro browser desktop that combines a boot sequence, window manager, terminal, faux filesystem, internal browser routes, local persistence, and a growing collection of self-contained apps.

**Live demo:** https://devskits916.github.io/DevSkits-OS-2.0/

## Current feature set

### Core shell
- BIOS-style boot flow and splash screen.
- Desktop shell with movable windows, taskbar, notifications, and a start menu.
- LocalStorage-backed persistence for notes, reminders, quotes, drafts, updates, logs, settings, and usage stats.
- Faux filesystem plus a Run dialog and Navigator for `devskits://` routes and external URLs.

### Built-in apps

#### Core / identity
- Terminal
- My Computer
- Settings
- System
- Contact
- Links
- Donate
- Loki

#### Productivity / tools
- Notepad
- Navigator
- Calculator
- Calendar
- Clock
- Reminders
- Draft Pad
- Quote Forge
- ASCII Maker

#### System utilities
- Updater
- Process Monitor
- Activity Log
- System Logs
- Profile
- Presence
- Recycle Bin
- Install Center
- Discoveries
- Network Map
- Search Everywhere

#### Companion
- Loki Game

## Terminal commands
The built-in terminal currently supports these commands:

- `help [command]`
- `clear`, `cls`
- `ver`
- `status`
- `uptime`
- `hostname`
- `settings`
- `reboot`, `restart`
- `date`
- `time`
- `whoami`
- `about`
- `contact`
- `donate`
- `github`
- `loki`
- `apps`
- `open <target>`
- `run <app>`
- `browser <route|url>`
- `links`
- `projects`
- `pwd`
- `ls [path]`, `dir [path]`
- `cd <path>`
- `cat <file>`
- `echo <text>`
- `history [clear]`
- `recent`
- `search <query>`, `find <query>`
- `notify <message>`
- `theme`
- `exit`
- `?`

`run` and `open` accept the canonical app ids plus compatibility aliases such as `calc`, `processmon`, `syslogs`, `planner`, and `lokigame`.

## Canonical app ids and compatibility aliases
- `calculator` (`calc`)
- `calendar` (`calendar-planner`)
- `reminders` (`planner`)
- `updater` (`updates`)
- `process-monitor` (`processmon`, `processmonitor`, `processes`)
- `system-logs` (`syslogs`, `systemlogs`, `logs`)
- `profile` (`system-profile`)
- `presence` (`network-status`)
- `quoteforge` (`quote-forge`)
- `asciimaker` (`ascii-maker`)
- `draftpad` (`draft-pad`)
- `loki-game` (`lokigame`, `lokigamelegacy`)

## Project goals
- Keep app implementations self-contained under `js/apps/`.
- Keep terminal behavior aligned with registered apps and aliases.
- Keep docs and metadata accurate to the code that actually ships.
- Preserve the retro desktop feel while making the codebase easier to maintain.
