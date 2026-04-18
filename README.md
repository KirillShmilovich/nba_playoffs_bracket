# NBA Playoffs 2026 — Bracket Pool

A static site that tracks four friends' NBA playoff bracket picks and scores them live against real playoff results.

**Live site:** https://kirillshmilovich.github.io/nba_playoffs_bracket/

## Participants

- Austin
- Kirill
- Noah
- Mason

## Scoring

| Round | Winner | Exact series length bonus |
|---|---|---|
| Round 1 | 1 pt | +1 |
| Conf. Semifinals | 2 pts | +1 |
| Conf. Finals | 4 pts | +2 |
| NBA Finals | 8 pts | +3 |

**Max possible = 51 points.**

## Local development

Open `index.html` directly in a browser, or run any static file server:

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## Deploy

Hosted on **GitHub Pages**. Settings → Pages → Source: *Deploy from a branch* → `main` / root. The `.nojekyll` file disables Jekyll so files are served as-is. Every push to `main` auto-deploys.

`render.yaml` is also included for deploying on Render as a Static Site if you'd prefer.

## Updating picks

Edit `picks.js`. Commit + push. Live site updates automatically.
