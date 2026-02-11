## What changed

- **mobile-proxy** – A small Node.js reverse proxy that sits in front of vibe-kanban and injects a single stylesheet link into HTML so the app can be used with a mobile-optimized UI **without any changes to the main frontend codebase**.
- **proxy.mjs** – Proxies all requests to the upstream app; for `text/html` responses it injects `<link rel="stylesheet" href="/mobile-override.css">` just before `</head>`. Requests to `/mobile-override.css` are served from the local `mobile.css` file.
- **mobile.css** – Mobile-only overrides (scoped to `.new-design` and `@media (max-width: 768px)` / `428px`):
  - **Safe area & viewport**: `env(safe-area-inset-*)` padding, `100dvh` min-height, and `-webkit-text-size-adjust: 100%` to avoid unwanted zoom on focus.
  - **Layout**: Left AppBar hidden on narrow screens; main content full width; kanban columns switched from horizontal scroll to a vertical stack; when the issue detail panel is open, the layout stacks (kanban above, panel below) using `:has()`.
  - **Touch**: Minimum tap targets of 44px for buttons and `[role="button"]`; subdued tap highlight.
  - **Spacing**: Tighter padding for project header, filter bar, and cards at 768px and again at 428px.
- **Operational bits**: `start.sh` for manual runs; systemd units for vibe-kanban (upstream) and vibe-kanban-mobile-proxy; Makefile with `register`, `status`, `restart`, `logs`, etc.; README with setup, port layout (e.g. 58081 upstream, 58080 proxy for Tailscale serve), and a short description of the mobile CSS behavior.

## Why

- To allow serving a **mobile-friendly** experience (e.g. via Tailscale) to phones and small tablets without forking or patching the main app.
- All customization is done via the proxy-injected CSS and optional env (e.g. `TARGET_ORIGIN`, `PORT`, `HOST`), so the core frontend stays untouched and easy to upgrade.

## Implementation details

- The proxy sets `accept-encoding: identity` on proxied requests and rewrites only HTML so that it can safely inject the link and recalculate `content-length`; other responses are streamed through unchanged.
- Mobile CSS uses existing class names and structure from the new UI (e.g. `.new-design`, KanbanBoard grid, `#kanban-left` / `#kanban-right`). The issue panel stacking uses `div:has(> #kanban-left):has(> #kanban-right)` to switch the flex container to column and size the two panels (35% / 65%).
- Two breakpoints: 768px for the main mobile layout and 428px for extra padding reduction on smaller phones.

---

This PR was written using [Vibe Kanban](https://vibekanban.com).
