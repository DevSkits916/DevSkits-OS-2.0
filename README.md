# DevSkits OS 95

DevSkits OS 95 is a framework-free retro web desktop (HTML/CSS/JavaScript) with a boot flow, start menu, window manager, app manifest, terminal shell, and persistent local state.

## Architecture

### 1) Core shell
- `index.html` boot + desktop scaffold.
- `js/core/state.js` central app manifest (id, title, icon, launcher visibility, start menu metadata, aliases, and default window behavior).
- `js/core/window-manager.js` consistent focus/z-index/minimize/maximize/restore/session behavior.
- `js/core/desktop.js` desktop icon rendering, drag/grid persistence, context menus, rename support, and notifications.
- `js/core/start-menu.js` manifest-driven launcher UI and search.

### 2) Shared virtual filesystem (VFS)
- `js/core/vfs.js` is the single source of truth for virtual file storage in `localStorage` (`devskits-vfs-v1`).
- File Explorer (`js/apps/files.js`) reads/writes that same VFS state.
- Terminal (`js/core/terminal-engine.js`) supports `ls`, `cd`, `cat`, and `open` over the same VFS paths.
- Notepad (`js/apps/notes.js`) restores/saves `devskits-note.txt` through VFS (`This PC/Documents`).

### 3) Persistent settings model
Settings persist in `localStorage` via both direct keys and `devskits-app-settings-v2`:
- Theme
- Wallpaper
- Boot animation mode
- Sound enabled
- Icon density
- Mobile density
- Clock format (12h/24h)
- Reduced motion

## App manifest model
All app metadata is registered in `js/core/state.js` via `defineApp(id, config)`.

Manifest fields include:
- `id`
- `title`
- `icon` and `iconSvg`
- `category`
- `terminalCommand`
- `launcher` (`desktop`, `tray`)
- `startMenu` (`visible`, `section`)
- `windowDefaults` (`width`, `height`, `mobileFullscreen`)
- `multiInstance`
- `description`

## Terminal commands
- `help [command]`
- `clear`, `cls`
- `ver`, `status`, `uptime`, `hostname`
- `settings`, `reboot`, `restart`
- `date`, `time`, `whoami`, `about`, `contact`, `donate`, `github`, `loki`
- `apps`, `open <target>`, `run <app>`, `browser <route|url>`, `links`, `projects`
- `pwd`, `ls [path]`, `dir [path]`, `cd <path>`, `cat <file>`
- `echo <text>`, `history [clear]`, `recent`, `search <query>`, `find <query>`, `notify <message>`, `alias [name=value]`, `theme`, `exit`, `?`

## Storage keys
Major keys:
- `devskits-vfs-v1` (shared virtual filesystem)
- `devskits-app-settings-v2` (persistent system/app settings)
- `devskits-session` + `devskits-window-bounds` (window/session state)
- `devskits-icon-positions` + `devskits-desktop-labels-v1` (desktop icon layout + rename)
- `devskits-term-history` + `devskits-shell-history-v1` + `devskits-shell-aliases-v1` (terminal persistence)

## Product polish rules
- No runtime dependencies.
- Framework-free implementation.
- Retro visual style preserved while improving consistency and resilience.
- Incomplete modules must show clearly intentional, polished “not yet enabled” messaging.
