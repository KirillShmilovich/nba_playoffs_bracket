# NBA Playoffs 2026 Bracket Tracker — Design

## Purpose

A simple static website that displays four friends' NBA playoff bracket picks side-by-side, pulls live playoff results from a public API, scores each bracket, and shows a leaderboard. Hosted on Render as a free static site, deployed from GitHub.

## Scope

In scope:
- Display four hardcoded brackets (Austin, Kirill, Noah, Mason)
- Fetch live series results from a public NBA data source
- Compute each participant's current score and max-possible remaining score
- Render a leaderboard and per-bracket detail cards with per-pick status
- Auto-update on page load / refresh
- Deploy as a static site on Render via GitHub

Out of scope:
- User login / accounts
- Adding new brackets after launch (edit `picks.js` manually)
- Real-time push updates (user refreshes page)
- Manual override config for completed series
- Backend server

## Architecture

Pure static site. All logic runs in the browser.

Files:
- `index.html` — page structure
- `styles.css` — styling
- `app.js` — orchestration: fetch live data, score brackets, render UI
- `picks.js` — hardcoded `PICKS` object with all four brackets
- `README.md` — project overview + Render deploy instructions
- `render.yaml` — Render static site config (optional but nice for one-click deploy)

Page load flow:
1. Browser loads HTML → loads `picks.js` then `app.js`
2. `app.js` fetches current playoff series state from ESPN's public JSON endpoint
3. Normalizes ESPN data into the internal series-result shape
4. For each of the four picks, compute current score and max-possible score
5. Render leaderboard table + per-bracket detail cards

If the fetch fails: show a warning banner, fall back to `localStorage`-cached last-good response if present; otherwise render brackets with no scoring (just picks).

## Data Model

### Picks (hardcoded)

```js
const PICKS = {
  "Austin": {
    round1: [
      { winner: "OKC", loser: "PHX", games: 5 },
      { winner: "HOU", loser: "LAL", games: 6 },
      { winner: "DEN", loser: "MIN", games: 6 },
      { winner: "SAS", loser: "POR", games: 4 },
      { winner: "DET", loser: "ORL", games: 6 },
      { winner: "TOR", loser: "CLE", games: 7 },
      { winner: "NYK", loser: "ATL", games: 6 },
      { winner: "BOS", loser: "PHI", games: 5 }
    ],
    round2: [
      { winner: "OKC", loser: "HOU", games: 4 },
      { winner: "SAS", loser: "DEN", games: 7 },
      { winner: "DET", loser: "TOR", games: 5 },
      { winner: "BOS", loser: "NYK", games: 6 }
    ],
    confFinals: [
      { winner: "SAS", loser: "OKC", games: 6 },
      { winner: "DET", loser: "BOS", games: 7 }
    ],
    finals: { winner: "SAS", loser: "DET", games: 6 }
  },
  // Kirill, Noah, Mason: same shape
};
```

Team codes use ESPN's three-letter abbreviations: OKC, HOU, DEN, SAS, DET, TOR, NYK, BOS, PHX, LAL, MIN, POR, ORL, CLE, ATL, PHI.

### Live results (normalized from ESPN)

```js
const LIVE = {
  round1: [
    { matchup: ["OKC","PHX"], winner: "OKC", loser: "PHX", games: 4, complete: true },
    { matchup: ["HOU","LAL"], winner: null,  loser: null,  games: null, complete: false, currentScore: "2-1" },
    // ...
  ],
  round2: [...],   // empty arrays until round starts
  confFinals: [...],
  finals: null
};
```

Matchups are identified by the pair of teams involved. Picks are matched to live results by team membership (both picked teams must be in the matchup) — this handles the fact that round-2+ matchups depend on earlier outcomes.

## Scoring

| Round | Winner pts | Exact-length bonus |
|---|---|---|
| Round 1 (×8) | 1 | +1 |
| Conf Semifinals (×4) | 2 | +1 |
| Conf Finals (×2) | 4 | +2 |
| NBA Finals (×1) | 8 | +3 |

**Max possible total = 8×2 + 4×3 + 2×6 + 1×11 = 51 points.**

### Scoring rules

For each pick:
- If the corresponding live series is **complete**:
  - If your pick's winner matches: award winner pts
  - If your pick's games matches too: add length bonus
  - Otherwise: 0
- If the series is **in progress** or **not started**:
  - Contributes 0 to current score
  - Contributes full winner pts + bonus to max-possible, unless the picked winner has already been eliminated (in which case 0)

A picked team is "eliminated" if a completed series shows them losing.

### Max-possible calculation

For round 2+ picks, a pick is **viable** if both teams picked to meet each other are still alive (neither eliminated yet in earlier rounds). If a picked team has been eliminated before reaching that round's matchup, the pick contributes 0 to max-possible.

## UI Layout

```
┌─────────────────────────────────────────────┐
│  NBA Playoffs 2026 — Bracket Pool           │
│  Last updated: <timestamp>                  │
├─────────────────────────────────────────────┤
│  LEADERBOARD                                │
│  ┌──────────┬─────────┬──────────┬────────┐│
│  │ Name     │ Current │ Max Poss │ Correct││
│  │ Noah     │ 12      │ 42       │ 5/8    ││
│  │ Mason    │ 11      │ 40       │ 5/8    ││
│  │ Kirill   │ 9       │ 38       │ 4/8    ││
│  │ Austin   │ 7       │ 30       │ 3/8    ││
│  └──────────┴─────────┴──────────┴────────┘│
├─────────────────────────────────────────────┤
│  AUSTIN'S BRACKET                           │
│  Round 1:                                   │
│    ✅ Thunder in 5 (+2)                     │
│    ❌ Rockets in 6  (actual: LAL in 6)     │
│    ⏳ Nuggets in 6                          │
│    ...                                      │
│  Round 2: ...                               │
│  Conf Finals: ...                           │
│  Finals: ...                                │
│                                             │
│  [repeat for Kirill, Noah, Mason]           │
└─────────────────────────────────────────────┘
```

Status icons: ✅ correct winner, ❌ wrong, ⏳ pending, 💀 eliminated (picked team is out).

Each completed pick shows points earned in parens, e.g. `(+2)` for winner+length bonus, `(+1)` for winner only.

Max-possible remaining column helps people see if their bracket is still alive.

## ESPN Integration

Endpoint: `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard` and playoff bracket endpoints.

Playoff series data is available under the bracket/tournament endpoint (URL to be confirmed during implementation — plan includes a step to identify the correct endpoint empirically).

Team abbreviation mapping: ESPN uses the same codes we're using. No mapping needed.

### Error handling

- Network error / non-200: show banner "Live data unavailable — last updated X ago" and fall back to cached data
- Malformed response: log to console, show banner, render picks without scores
- CORS blocked: pivot to a small Node proxy (out of initial scope — flag as risk)

### Caching

On every successful fetch, write normalized `LIVE` object to `localStorage['nba_bracket_live']` with a timestamp. On fetch failure, fall back to cached value if less than 24 hours old.

## Deploy

1. Push repo to GitHub
2. On Render: New → Static Site → connect GitHub repo
3. Build command: (none)
4. Publish directory: `.` (repo root)
5. Every push to main → auto-deploy

`render.yaml` included for reproducibility.

## Testing

Manual end-to-end test plan:
- Open site → leaderboard renders
- All four brackets render with correct picks
- Completed series show checkmarks with correct points
- In-progress series show ⏳
- Eliminated picks in future rounds show 💀
- Fetch failure: kill network in devtools, reload → banner shows, cached data renders
- No live data at all: clear localStorage + kill network → banner shows, brackets render without scores

Automated unit tests:
- Scoring function: completed correct series with/without length match
- Scoring function: eliminated team in future round
- ESPN response normalizer: valid response → correct internal shape
- Matchup matcher: pick matches live series by team membership

Tests live in `tests/` as a single HTML test runner page that loads the scoring module and asserts in the console. Lightweight, no framework.

## Risks / Open Questions

- ESPN endpoint URL for playoff series needs to be identified during implementation. If blocked by CORS or not available, fall back to `balldontlie.io`.
- Playoff hasn't started as of today (2026-04-18). Until data exists, UI renders all ⏳ — which is fine and will be verified by the deploy.
