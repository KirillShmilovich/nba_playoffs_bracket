# NBA Playoffs 2026 — Bracket Pool

A static site that tracks four friends' NBA playoff bracket picks and scores them live against real playoff results.

**Live site:** _add Render URL after deploy_

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

## Deploy (Render)

1. Push this repo to GitHub.
2. Render dashboard → **New +** → **Static Site** → connect the repo.
3. Build command: _(leave empty)_
4. Publish directory: `.`
5. Deploy. Every push to `main` auto-deploys.

`render.yaml` is included for reproducibility.

## Updating picks

Edit `picks.js`. Commit + push. Live site updates automatically.
