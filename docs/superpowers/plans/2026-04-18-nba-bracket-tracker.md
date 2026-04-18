# NBA Playoffs 2026 Bracket Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static site that displays four friends' NBA playoff bracket picks, fetches live playoff series data from ESPN, scores each bracket, and shows a leaderboard. Deploy to Render via GitHub.

**Architecture:** Pure static site (HTML/CSS/JS, no build step). `picks.js` holds hardcoded picks. `app.js` fetches ESPN playoff data, normalizes it, computes scores, renders UI. No backend.

**Tech Stack:** Vanilla HTML/CSS/JavaScript (ES modules). Google Fonts (Anton, DM Sans, JetBrains Mono, Caveat). ESPN public JSON endpoints. Render static site hosting.

**Design direction:** "Playoffs Almanac" — cream newsprint background (`#f4ece0`), black ink, one hot basketball-orange accent (`#e85a2a`), condensed Anton display type for headers, JetBrains Mono for stats, Caveat for handwritten touches (nods to Noah/Mason's handwritten brackets). Brutalist card borders with hard drop shadows. Asymmetric, confident layout.

---

## File Structure

```
nba_playoffs_bracket/
├── index.html              # Page structure & font imports
├── styles.css              # All styling
├── picks.js                # PICKS constant (four brackets, hardcoded)
├── scoring.js              # Pure scoring logic (scoreBracket, isEliminated, etc.)
├── espn.js                 # fetchLiveResults() + ESPN response normalizer
├── render.js               # DOM rendering: renderLeaderboard, renderBracket
├── app.js                  # Main entry: orchestrates fetch → score → render
├── tests/
│   └── test.html           # Test runner page that loads scoring.js and asserts
├── render.yaml             # Render static site config
├── .gitignore
└── README.md
```

Each module has one responsibility. `scoring.js` is pure (no DOM, no fetch) so it's easily unit-testable.

---

## Task 1: Project Scaffolding & Git Init

**Files:**
- Create: `.gitignore`
- Create: `README.md`

- [ ] **Step 1: Initialize git repo**

Run:
```bash
cd /Users/shmilovk/Projects/claude_code/nba_playoffs_bracket
git init
git branch -M main
```

Expected: `Initialized empty Git repository`.

- [ ] **Step 2: Create `.gitignore`**

Create `.gitignore`:
```
.DS_Store
node_modules/
*.log
.env
.vscode/
.idea/
```

- [ ] **Step 3: Create `README.md`**

Create `README.md`:
```markdown
# NBA Playoffs 2026 — Bracket Pool

A static site that tracks four friends' NBA playoff bracket picks and scores them live against real playoff results.

**Live site:** <add Render URL after deploy>

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
3. Build command: *(leave empty)*
4. Publish directory: `.`
5. Deploy. Every push to `main` auto-deploys.

`render.yaml` is included for reproducibility.

## Updating picks

Edit `picks.js`. Commit + push. Live site updates automatically.
```

- [ ] **Step 4: Commit**

Run:
```bash
git add .gitignore README.md
git commit -m "chore: initial project scaffolding"
```

Expected: commit succeeds.

---

## Task 2: Hardcode Picks Data

**Files:**
- Create: `picks.js`

- [ ] **Step 1: Create `picks.js` with all four brackets**

Create `picks.js`:
```js
// ESPN team abbreviations used throughout:
// OKC, PHX, HOU, LAL, DEN, MIN, SAS, POR, DET, ORL, CLE, TOR, NYK, ATL, BOS, PHI

export const PICKS = {
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

  "Kirill": {
    round1: [
      { winner: "OKC", loser: "PHX", games: 5 },
      { winner: "HOU", loser: "LAL", games: 6 },
      { winner: "DEN", loser: "MIN", games: 7 },
      { winner: "SAS", loser: "POR", games: 5 },
      { winner: "DET", loser: "ORL", games: 6 },
      { winner: "TOR", loser: "CLE", games: 7 },
      { winner: "NYK", loser: "ATL", games: 7 },
      { winner: "BOS", loser: "PHI", games: 5 }
    ],
    round2: [
      { winner: "OKC", loser: "HOU", games: 5 },
      { winner: "SAS", loser: "DEN", games: 6 },
      { winner: "DET", loser: "TOR", games: 6 },
      { winner: "BOS", loser: "NYK", games: 6 }
    ],
    confFinals: [
      { winner: "OKC", loser: "SAS", games: 7 },
      { winner: "DET", loser: "BOS", games: 6 }
    ],
    finals: { winner: "OKC", loser: "DET", games: 6 }
  },

  "Noah": {
    round1: [
      { winner: "OKC", loser: "PHX", games: 4 },
      { winner: "HOU", loser: "LAL", games: 4 },
      { winner: "DEN", loser: "MIN", games: 5 },
      { winner: "SAS", loser: "POR", games: 5 },
      { winner: "DET", loser: "ORL", games: 5 },
      { winner: "CLE", loser: "TOR", games: 6 },
      { winner: "NYK", loser: "ATL", games: 7 },
      { winner: "BOS", loser: "PHI", games: 4 }
    ],
    round2: [
      { winner: "OKC", loser: "HOU", games: 4 },
      { winner: "DEN", loser: "SAS", games: 7 },
      { winner: "DET", loser: "CLE", games: 6 },
      { winner: "BOS", loser: "NYK", games: 7 }
    ],
    confFinals: [
      { winner: "OKC", loser: "DEN", games: 6 },
      { winner: "BOS", loser: "DET", games: 6 }
    ],
    finals: { winner: "OKC", loser: "BOS", games: 5 }
  },

  "Mason": {
    round1: [
      { winner: "OKC", loser: "PHX", games: 4 },
      { winner: "HOU", loser: "LAL", games: 5 },
      { winner: "DEN", loser: "MIN", games: 5 },
      { winner: "SAS", loser: "POR", games: 4 },
      { winner: "DET", loser: "ORL", games: 5 },
      { winner: "CLE", loser: "TOR", games: 7 },
      { winner: "NYK", loser: "ATL", games: 6 },
      { winner: "BOS", loser: "PHI", games: 4 }
    ],
    round2: [
      { winner: "OKC", loser: "HOU", games: 4 },
      { winner: "DEN", loser: "SAS", games: 7 },
      { winner: "CLE", loser: "DET", games: 7 },
      { winner: "BOS", loser: "NYK", games: 5 }
    ],
    confFinals: [
      { winner: "OKC", loser: "DEN", games: 7 },
      { winner: "BOS", loser: "CLE", games: 5 }
    ],
    finals: { winner: "OKC", loser: "BOS", games: 4 }
  }
};

export const TEAM_NAMES = {
  OKC: "Thunder", PHX: "Suns", HOU: "Rockets", LAL: "Lakers",
  DEN: "Nuggets", MIN: "Timberwolves", SAS: "Spurs", POR: "Trail Blazers",
  DET: "Pistons", ORL: "Magic", CLE: "Cavaliers", TOR: "Raptors",
  NYK: "Knicks", ATL: "Hawks", BOS: "Celtics", PHI: "76ers"
};
```

- [ ] **Step 2: Commit**

Run:
```bash
git add picks.js
git commit -m "feat: hardcode all four bracket picks"
```

---

## Task 3: Scoring Module (TDD) — Point Values & Series Scoring

**Files:**
- Create: `scoring.js`
- Create: `tests/test.html`

- [ ] **Step 1: Write the failing test for `scoreSeries` (test.html scaffold + first assertion)**

Create `tests/test.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Bracket Tracker Tests</title>
<style>body{font-family:monospace;padding:20px}.pass{color:green}.fail{color:red;font-weight:bold}</style>
</head>
<body>
<h1>Bracket Tracker Tests</h1>
<div id="results"></div>
<script type="module">
import { scoreSeries, scoreBracket, isEliminated, ROUND_POINTS } from '../scoring.js';

const results = document.getElementById('results');
let passed = 0, failed = 0;

function assertEq(actual, expected, label) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  const div = document.createElement('div');
  div.textContent = `${ok ? 'PASS' : 'FAIL'}: ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
  div.className = ok ? 'pass' : 'fail';
  results.appendChild(div);
  ok ? passed++ : failed++;
}

// --- scoreSeries tests ---
assertEq(
  scoreSeries({ winner: "OKC", games: 5 }, { winner: "OKC", games: 5, complete: true }, "round1"),
  { points: 2, status: "correct-exact" },
  "round1: correct winner + exact length = 2pt"
);

// More tests added in later steps

document.title = `${failed === 0 ? 'PASS' : 'FAIL'} ${passed}/${passed + failed}`;
results.insertAdjacentHTML('afterbegin', `<h2>${passed} passed, ${failed} failed</h2>`);
</script>
</body>
</html>
```

- [ ] **Step 2: Run the test (should fail — scoring.js doesn't exist)**

Run:
```bash
python3 -m http.server 8000 &
sleep 1
curl -s http://localhost:8000/tests/test.html > /dev/null
echo "Open http://localhost:8000/tests/test.html in a browser. Expected: blank page + console error 'Failed to resolve module specifier ../scoring.js'"
```

Expected: browser console shows module-not-found error. Kill server with `kill %1` when done.

- [ ] **Step 3: Implement minimal `scoring.js` to make test pass**

Create `scoring.js`:
```js
// Points awarded per round for correct winner, plus bonus for exact series length.
export const ROUND_POINTS = {
  round1:     { winner: 1, lengthBonus: 1 },
  round2:     { winner: 2, lengthBonus: 1 },
  confFinals: { winner: 4, lengthBonus: 2 },
  finals:     { winner: 8, lengthBonus: 3 }
};

/**
 * Score a single picked series against the actual (live) series result.
 * @param {{winner: string, games: number}} pick
 * @param {{winner: string|null, games: number|null, complete: boolean}|null} actual
 * @param {"round1"|"round2"|"confFinals"|"finals"} round
 * @returns {{points: number, status: string}}
 *   status: "correct-exact" | "correct-winner" | "wrong" | "pending" | "eliminated"
 */
export function scoreSeries(pick, actual, round) {
  if (!actual || !actual.complete) {
    return { points: 0, status: "pending" };
  }
  if (actual.winner !== pick.winner) {
    return { points: 0, status: "wrong" };
  }
  const pts = ROUND_POINTS[round];
  if (actual.games === pick.games) {
    return { points: pts.winner + pts.lengthBonus, status: "correct-exact" };
  }
  return { points: pts.winner, status: "correct-winner" };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
python3 -m http.server 8000 &
sleep 1
echo "Open http://localhost:8000/tests/test.html — expected: 1 passed, 0 failed (tab title starts with 'PASS')"
```

- [ ] **Step 5: Add more `scoreSeries` assertions**

Edit `tests/test.html` — add after the first `assertEq`:
```js
assertEq(
  scoreSeries({ winner: "OKC", games: 5 }, { winner: "OKC", games: 6, complete: true }, "round1"),
  { points: 1, status: "correct-winner" },
  "round1: correct winner, wrong length = 1pt"
);

assertEq(
  scoreSeries({ winner: "OKC", games: 5 }, { winner: "PHX", games: 6, complete: true }, "round1"),
  { points: 0, status: "wrong" },
  "round1: wrong winner = 0pt"
);

assertEq(
  scoreSeries({ winner: "OKC", games: 5 }, { winner: null, games: null, complete: false }, "round1"),
  { points: 0, status: "pending" },
  "round1: incomplete = pending"
);

assertEq(
  scoreSeries({ winner: "BOS", games: 6 }, { winner: "BOS", games: 6, complete: true }, "finals"),
  { points: 11, status: "correct-exact" },
  "finals: correct winner + exact = 11pt (8+3)"
);

assertEq(
  scoreSeries({ winner: "SAS", games: 6 }, { winner: "DET", games: 5, complete: true }, "confFinals"),
  { points: 0, status: "wrong" },
  "confFinals: wrong = 0pt"
);

assertEq(
  scoreSeries({ winner: "DET", games: 5 }, { winner: "DET", games: 6, complete: true }, "round2"),
  { points: 2, status: "correct-winner" },
  "round2: correct winner, wrong length = 2pt"
);
```

Reload test page. Expected: 7 passed, 0 failed.

- [ ] **Step 6: Commit**

Run:
```bash
git add scoring.js tests/test.html
git commit -m "feat: add scoreSeries with TDD"
```

---

## Task 4: Scoring Module — `isEliminated`

**Files:**
- Modify: `scoring.js`
- Modify: `tests/test.html`

- [ ] **Step 1: Add failing `isEliminated` tests**

Edit `tests/test.html` — append before the `document.title` line:
```js
// --- isEliminated tests ---
const liveElim = {
  round1: [
    { matchup: ["OKC","PHX"], winner: "OKC", loser: "PHX", games: 4, complete: true },
    { matchup: ["HOU","LAL"], winner: "LAL", loser: "HOU", games: 6, complete: true },
    { matchup: ["DEN","MIN"], winner: null,  loser: null,  games: null, complete: false }
  ],
  round2: [],
  confFinals: [],
  finals: null
};

assertEq(isEliminated("PHX", liveElim), true,  "PHX eliminated in round1");
assertEq(isEliminated("HOU", liveElim), true,  "HOU eliminated in round1");
assertEq(isEliminated("OKC", liveElim), false, "OKC still alive");
assertEq(isEliminated("DEN", liveElim), false, "DEN series incomplete, not eliminated");
assertEq(isEliminated("BOS", liveElim), false, "BOS unknown in live data, not eliminated");
```

Reload test page. Expected: 5 new FAILs (function not defined → JS throws and tests halt; or TypeError). Fix next.

- [ ] **Step 2: Implement `isEliminated`**

Edit `scoring.js` — append:
```js
/**
 * Check if a team has been eliminated in any completed series in live results.
 * @param {string} team
 * @param {object} live
 * @returns {boolean}
 */
export function isEliminated(team, live) {
  const allSeries = [
    ...(live.round1 || []),
    ...(live.round2 || []),
    ...(live.confFinals || []),
    ...(live.finals ? [live.finals] : [])
  ];
  return allSeries.some(s => s && s.complete && s.loser === team);
}
```

- [ ] **Step 3: Reload test page**

Expected: 12 passed, 0 failed.

- [ ] **Step 4: Commit**

Run:
```bash
git add scoring.js tests/test.html
git commit -m "feat: add isEliminated helper with tests"
```

---

## Task 5: Scoring Module — `scoreBracket` (full bracket scoring)

**Files:**
- Modify: `scoring.js`
- Modify: `tests/test.html`

- [ ] **Step 1: Add failing `scoreBracket` tests**

Edit `tests/test.html` — append before `document.title`:
```js
// --- scoreBracket tests ---
const samplePicks = {
  round1: [
    { winner: "OKC", loser: "PHX", games: 5 },
    { winner: "HOU", loser: "LAL", games: 6 }
  ],
  round2: [
    { winner: "OKC", loser: "HOU", games: 4 }
  ],
  confFinals: [],
  finals: { winner: "OKC", loser: "BOS", games: 5 }
};

const liveAllPending = { round1: [], round2: [], confFinals: [], finals: null };

const scoredPending = scoreBracket(samplePicks, liveAllPending);
assertEq(scoredPending.current, 0, "all pending: current = 0");
// max = round1 (2*2) + round2 (1*3) + finals (1*11) = 4+3+11 = 18
assertEq(scoredPending.max, 18, "all pending: max = 18");

const liveR1Done = {
  round1: [
    { matchup: ["OKC","PHX"], winner: "OKC", loser: "PHX", games: 5, complete: true },  // exact match
    { matchup: ["HOU","LAL"], winner: "LAL", loser: "HOU", games: 6, complete: true }   // wrong
  ],
  round2: [],
  confFinals: [],
  finals: null
};

const scoredR1 = scoreBracket(samplePicks, liveR1Done);
assertEq(scoredR1.current, 2, "R1 done: current = 2 (OKC exact)");
// HOU eliminated → round2 pick (OKC over HOU) still viable since OKC alive, but HOU can't appear → pick is dead
// Finals pick OKC → still viable.
// Expected max: current (2) + round2 pick dead (0) + finals pick OKC alive (11) = 13
assertEq(scoredR1.max, 13, "R1 done: max = current + alive future picks");

assertEq(scoredR1.correctCount, 1, "R1 done: 1 correct series");
assertEq(scoredR1.totalCompleted, 2, "R1 done: 2 completed series");
```

Reload test page. Expected: 4 new FAILs (function not defined).

- [ ] **Step 2: Implement `scoreBracket`**

Edit `scoring.js` — append:
```js
/**
 * Match a pick to the live series involving the same two teams.
 * @returns {object|null} live series or null if not found
 */
function findLiveSeries(pick, liveRound) {
  if (!liveRound) return null;
  return liveRound.find(s =>
    s.matchup && s.matchup.includes(pick.winner) && s.matchup.includes(pick.loser)
  ) || null;
}

/**
 * Compute a bracket's current and maximum-possible scores.
 * @param {object} picks
 * @param {object} live
 * @returns {{current: number, max: number, correctCount: number, totalCompleted: number, perPick: object}}
 */
export function scoreBracket(picks, live) {
  let current = 0;
  let max = 0;
  let correctCount = 0;
  let totalCompleted = 0;
  const perPick = { round1: [], round2: [], confFinals: [], finals: null };

  const rounds = ["round1", "round2", "confFinals"];
  for (const round of rounds) {
    const picksInRound = picks[round] || [];
    const liveInRound = live[round] || [];
    for (const pick of picksInRound) {
      const actual = findLiveSeries(pick, liveInRound);
      const result = scoreSeries(pick, actual, round);

      if (actual && actual.complete) {
        totalCompleted++;
        current += result.points;
        if (result.status === "correct-exact" || result.status === "correct-winner") correctCount++;
        max += result.points;  // completed series contribute actual points to max
      } else {
        // Pending. Check if picked winner is eliminated.
        if (isEliminated(pick.winner, live) || isEliminated(pick.loser, live)) {
          // Pick can't happen as drawn — 0 to max.
          result.status = "eliminated";
        } else {
          const pts = ROUND_POINTS[round];
          max += pts.winner + pts.lengthBonus;
        }
      }
      perPick[round].push({ pick, result });
    }
  }

  // Finals (single series, not array)
  if (picks.finals) {
    const actual = live.finals && findLiveSeries(picks.finals, [live.finals]);
    const result = scoreSeries(picks.finals, actual, "finals");
    if (actual && actual.complete) {
      totalCompleted++;
      current += result.points;
      if (result.status === "correct-exact" || result.status === "correct-winner") correctCount++;
      max += result.points;
    } else {
      if (isEliminated(picks.finals.winner, live) || isEliminated(picks.finals.loser, live)) {
        result.status = "eliminated";
      } else {
        const pts = ROUND_POINTS.finals;
        max += pts.winner + pts.lengthBonus;
      }
    }
    perPick.finals = { pick: picks.finals, result };
  }

  return { current, max, correctCount, totalCompleted, perPick };
}
```

- [ ] **Step 3: Reload test page**

Expected: 16 passed, 0 failed.

- [ ] **Step 4: Commit**

Run:
```bash
git add scoring.js tests/test.html
git commit -m "feat: add scoreBracket with max-possible calculation"
```

---

## Task 6: ESPN Fetch & Normalizer Module

**Files:**
- Create: `espn.js`

- [ ] **Step 1: Create `espn.js` with documented normalizer + fetcher**

Create `espn.js`:
```js
// ESPN playoff bracket endpoint. This is a public, undocumented JSON endpoint.
// If it changes or is blocked, the site falls back to cached data (see app.js).
const ESPN_BRACKET_URL =
  "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/tournament/bracket";

// Canonical team abbreviations we use internally (matches ESPN's).
const VALID_TEAMS = new Set([
  "OKC","PHX","HOU","LAL","DEN","MIN","SAS","POR",
  "DET","ORL","CLE","TOR","NYK","ATL","BOS","PHI"
]);

/**
 * Normalize a raw ESPN bracket response into our internal shape.
 * Returns the canonical LIVE object:
 *   { round1: [{matchup, winner, loser, games, complete}], round2: [...], confFinals: [...], finals: {...}|null }
 *
 * ESPN's exact response shape is verified during implementation; this function
 * tolerates missing fields and incomplete rounds.
 */
export function normalizeEspn(raw) {
  const empty = { round1: [], round2: [], confFinals: [], finals: null };
  if (!raw || typeof raw !== "object") return empty;

  // ESPN's bracket endpoint returns a `rounds` array with series inside.
  // Each round has { ordinal: 1..4 } and a list of matchups.
  // Matchup contains two competitors with { abbreviation, wins } and a `completed` flag.
  const rounds = raw.rounds || raw.bracket?.rounds || [];

  const result = { round1: [], round2: [], confFinals: [], finals: null };
  for (const round of rounds) {
    const ordinal = round.ordinal ?? round.number;
    const matchups = round.matchups || round.series || [];
    for (const m of matchups) {
      const competitors = m.competitors || m.teams || [];
      if (competitors.length < 2) continue;
      const [a, b] = competitors;
      const abbrA = a.abbreviation || a.team?.abbreviation;
      const abbrB = b.abbreviation || b.team?.abbreviation;
      if (!VALID_TEAMS.has(abbrA) || !VALID_TEAMS.has(abbrB)) continue;

      const winsA = a.wins ?? 0;
      const winsB = b.wins ?? 0;
      const complete = (m.completed === true) || winsA === 4 || winsB === 4;
      const winner = !complete ? null : (winsA > winsB ? abbrA : abbrB);
      const loser  = !complete ? null : (winsA > winsB ? abbrB : abbrA);
      const games  = !complete ? null : winsA + winsB;

      const series = {
        matchup: [abbrA, abbrB],
        winner, loser, games, complete,
        currentScore: `${winsA}-${winsB}`
      };

      if (ordinal === 1) result.round1.push(series);
      else if (ordinal === 2) result.round2.push(series);
      else if (ordinal === 3) result.confFinals.push(series);
      else if (ordinal === 4) result.finals = series;
    }
  }
  return result;
}

/**
 * Fetch live playoff series data from ESPN and normalize it.
 * @returns {Promise<object>} normalized LIVE object
 * @throws on network error or bad response
 */
export async function fetchLiveResults() {
  const resp = await fetch(ESPN_BRACKET_URL, { cache: "no-store" });
  if (!resp.ok) throw new Error(`ESPN returned ${resp.status}`);
  const raw = await resp.json();
  return normalizeEspn(raw);
}
```

- [ ] **Step 2: Add tests for `normalizeEspn`**

Edit `tests/test.html` — add import at top:
```js
import { normalizeEspn } from '../espn.js';
```

Append tests before `document.title`:
```js
// --- normalizeEspn tests ---
assertEq(
  normalizeEspn(null),
  { round1: [], round2: [], confFinals: [], finals: null },
  "normalizeEspn: null → empty"
);

assertEq(
  normalizeEspn({}),
  { round1: [], round2: [], confFinals: [], finals: null },
  "normalizeEspn: empty object → empty"
);

const espnSample = {
  rounds: [
    {
      ordinal: 1,
      matchups: [
        { competitors: [
          { abbreviation: "OKC", wins: 4 },
          { abbreviation: "PHX", wins: 1 }
        ], completed: true }
      ]
    }
  ]
};
const out = normalizeEspn(espnSample);
assertEq(out.round1.length, 1, "normalizeEspn: 1 series in round1");
assertEq(out.round1[0].winner, "OKC", "normalizeEspn: winner OKC");
assertEq(out.round1[0].loser, "PHX", "normalizeEspn: loser PHX");
assertEq(out.round1[0].games, 5, "normalizeEspn: 5 games");
assertEq(out.round1[0].complete, true, "normalizeEspn: completed");
```

- [ ] **Step 3: Reload test page**

Expected: 21 passed, 0 failed.

- [ ] **Step 4: Commit**

Run:
```bash
git add espn.js tests/test.html
git commit -m "feat: add ESPN fetcher and response normalizer"
```

---

## Task 7: HTML Structure & Font Imports

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create `index.html`**

Create `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NBA Playoffs 2026 — Bracket Pool</title>
  <meta name="description" content="Four friends, four brackets, one champion. Live-tracked NBA playoff bracket pool." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Anton&family=Caveat:wght@400;700&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>

  <header class="masthead">
    <div class="masthead-top">
      <span class="edition">Vol. I · April 18, 2026</span>
      <span class="edition">Four Brackets · One Champion</span>
    </div>
    <h1 class="title">Playoffs Almanac</h1>
    <p class="subtitle">NBA 2026 · Bracket Pool of Record</p>
    <div class="status-line">
      <span id="last-updated">Loading live data…</span>
      <span class="dot">●</span>
      <span id="fetch-status">Fetching ESPN</span>
    </div>
  </header>

  <div id="fetch-banner" class="banner" hidden></div>

  <section class="leaderboard-section">
    <h2 class="section-heading">Standings</h2>
    <div id="leaderboard"></div>
  </section>

  <section class="brackets-section">
    <h2 class="section-heading">The Brackets</h2>
    <div id="brackets" class="brackets-grid"></div>
  </section>

  <footer class="colophon">
    <p>Scoring: R1 1pt / R2 2pt / CF 4pt / F 8pt · series-length bonus: +1 / +1 / +2 / +3. Max 51.</p>
    <p>Data: ESPN. Updates on page refresh.</p>
  </footer>

  <script type="module" src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

Run:
```bash
git add index.html
git commit -m "feat: add HTML structure with font imports"
```

---

## Task 8: Styles — Base, Typography, Masthead

**Files:**
- Create: `styles.css`

- [ ] **Step 1: Create `styles.css` with the full stylesheet**

Create `styles.css`:
```css
:root {
  --bg: #f4ece0;
  --bg-ink: #ecdfc8;
  --ink: #111111;
  --ink-soft: #3a342a;
  --accent: #e85a2a;
  --ok: #2a7a3e;
  --wrong: #b8321c;
  --rule: #111111;
  --shadow: 4px 4px 0 0 var(--ink);
  --shadow-lg: 8px 8px 0 0 var(--ink);
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: "DM Sans", system-ui, sans-serif;
  font-size: 17px;
  line-height: 1.5;
}

body {
  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(17,17,17,0.035) 0px,
      rgba(17,17,17,0.035) 1px,
      transparent 1px,
      transparent 3px
    );
  min-height: 100vh;
}

/* === Masthead === */
.masthead {
  border-bottom: 3px solid var(--ink);
  padding: 28px clamp(20px, 4vw, 64px) 24px;
  position: relative;
}
.masthead::after {
  content: "";
  display: block;
  border-bottom: 1px solid var(--ink);
  margin-top: 10px;
}
.masthead-top {
  display: flex;
  justify-content: space-between;
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-soft);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--ink);
}
.title {
  font-family: "Anton", "Impact", sans-serif;
  font-size: clamp(64px, 12vw, 180px);
  line-height: 0.9;
  letter-spacing: -0.02em;
  margin: 18px 0 6px;
  text-transform: uppercase;
}
.subtitle {
  font-family: "Caveat", cursive;
  font-size: clamp(22px, 3vw, 34px);
  margin: 0;
  color: var(--accent);
  transform: rotate(-1.5deg);
  display: inline-block;
}
.status-line {
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 14px;
  color: var(--ink-soft);
  display: flex;
  gap: 10px;
  align-items: center;
}
.status-line .dot { color: var(--accent); font-size: 18px; line-height: 0; }

/* === Fetch banner === */
.banner {
  margin: 16px clamp(20px, 4vw, 64px);
  padding: 14px 18px;
  border: 2px solid var(--wrong);
  background: #fff0e8;
  font-family: "JetBrains Mono", monospace;
  font-size: 14px;
  box-shadow: var(--shadow);
}
.banner[hidden] { display: none; }

/* === Section headings === */
.section-heading {
  font-family: "Anton", sans-serif;
  font-size: clamp(32px, 5vw, 54px);
  letter-spacing: -0.01em;
  text-transform: uppercase;
  margin: 48px clamp(20px, 4vw, 64px) 18px;
  border-bottom: 3px solid var(--ink);
  padding-bottom: 8px;
  display: inline-block;
}

/* === Leaderboard === */
.leaderboard-section { padding: 0 clamp(20px, 4vw, 64px); }

.leaderboard {
  display: flex;
  flex-direction: column;
  border: 3px solid var(--ink);
  background: #fff;
  box-shadow: var(--shadow-lg);
  max-width: 900px;
}
.leaderboard-row {
  display: grid;
  grid-template-columns: 64px 1fr 120px 120px 120px;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--ink);
  gap: 16px;
}
.leaderboard-row:last-child { border-bottom: none; }
.leaderboard-row.header {
  background: var(--ink);
  color: var(--bg);
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 10px 20px;
}
.leaderboard-row .rank {
  font-family: "Anton", sans-serif;
  font-size: 44px;
  line-height: 1;
  color: var(--accent);
}
.leaderboard-row.header .rank { color: var(--bg); font-size: 12px; font-family: "JetBrains Mono", monospace; }
.leaderboard-row .name {
  font-family: "Anton", sans-serif;
  font-size: 28px;
  text-transform: uppercase;
  letter-spacing: 0.01em;
}
.leaderboard-row.header .name { font-family: "JetBrains Mono", monospace; font-size: 12px; text-transform: uppercase; }
.leaderboard-row .num {
  font-family: "JetBrains Mono", monospace;
  font-size: 22px;
  font-weight: 700;
  text-align: right;
}
.leaderboard-row.header .num { font-size: 12px; font-weight: 400; }
.leaderboard-row.leader {
  background: linear-gradient(90deg, #fff 0%, #ffe6db 100%);
}
.leaderboard-row.leader .name::after {
  content: "★";
  color: var(--accent);
  margin-left: 10px;
  font-size: 24px;
}

/* === Brackets === */
.brackets-section { padding: 0 clamp(20px, 4vw, 64px) 60px; }
.brackets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 32px;
  margin-top: 20px;
}
.bracket-card {
  border: 3px solid var(--ink);
  background: #fff;
  box-shadow: var(--shadow-lg);
  padding: 20px 22px 24px;
  position: relative;
}
.bracket-card:nth-child(2n) { transform: rotate(-0.4deg); }
.bracket-card:nth-child(3n) { transform: rotate(0.5deg); }
.bracket-card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 2px solid var(--ink);
  padding-bottom: 10px;
  margin-bottom: 14px;
}
.bracket-card h3 {
  font-family: "Anton", sans-serif;
  font-size: 36px;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.01em;
}
.bracket-card .card-score {
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.bracket-card .card-score strong {
  color: var(--ink);
  font-size: 18px;
  margin-left: 6px;
}

.round-label {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--ink-soft);
  margin: 14px 0 6px;
  display: flex;
  justify-content: space-between;
}

.pick {
  display: grid;
  grid-template-columns: 26px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-bottom: 1px dashed var(--ink);
  font-size: 15px;
}
.pick:last-child { border-bottom: none; }
.pick .icon {
  font-family: "Anton", sans-serif;
  font-size: 22px;
  line-height: 1;
  width: 26px;
  text-align: center;
}
.pick.correct-exact .icon { color: var(--ok); }
.pick.correct-winner .icon { color: var(--ok); opacity: 0.75; }
.pick.wrong .icon { color: var(--wrong); }
.pick.pending .icon { color: var(--ink-soft); }
.pick.eliminated .icon { color: var(--wrong); opacity: 0.5; }
.pick .team-line strong {
  font-family: "Anton", sans-serif;
  font-size: 18px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.pick .team-line .sub {
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  color: var(--ink-soft);
  margin-left: 6px;
}
.pick.wrong .team-line strong { text-decoration: line-through; text-decoration-thickness: 2px; }
.pick.eliminated .team-line strong { text-decoration: line-through; opacity: 0.6; }
.pick .pts {
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  min-width: 38px;
  text-align: right;
}
.pick.wrong .pts, .pick.pending .pts, .pick.eliminated .pts { color: var(--ink-soft); opacity: 0.8; }

.finals-pick {
  margin-top: 18px;
  padding: 14px 16px;
  border: 2px solid var(--accent);
  background: #fff5ef;
  box-shadow: 3px 3px 0 0 var(--accent);
  position: relative;
}
.finals-pick .stamp {
  position: absolute;
  top: -12px;
  right: 14px;
  background: var(--accent);
  color: #fff;
  padding: 3px 10px;
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transform: rotate(2deg);
}

/* === Colophon === */
.colophon {
  border-top: 3px solid var(--ink);
  padding: 22px clamp(20px, 4vw, 64px);
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  color: var(--ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.colophon p { margin: 4px 0; }

@media (max-width: 640px) {
  .leaderboard-row { grid-template-columns: 48px 1fr 70px 70px; gap: 10px; padding: 12px; }
  .leaderboard-row .max-col { display: none; }
  .leaderboard-row .rank { font-size: 32px; }
  .leaderboard-row .name { font-size: 20px; }
  .leaderboard-row .num { font-size: 16px; }
}
```

- [ ] **Step 2: Commit**

Run:
```bash
git add styles.css
git commit -m "style: add Playoffs Almanac aesthetic styles"
```

---

## Task 9: Render Module

**Files:**
- Create: `render.js`

- [ ] **Step 1: Create `render.js`**

Create `render.js`:
```js
import { TEAM_NAMES } from './picks.js';

const STATUS_ICON = {
  "correct-exact":  "✓",
  "correct-winner": "✓",
  "wrong":          "✗",
  "pending":        "·",
  "eliminated":     "✗"
};

const ROUND_LABELS = {
  round1: "Round 1",
  round2: "Conference Semifinals",
  confFinals: "Conference Finals",
  finals: "NBA Finals"
};

function teamDisplay(abbr) {
  return TEAM_NAMES[abbr] || abbr;
}

function pickLine(pickResult, roundKey) {
  const { pick, result } = pickResult;
  const cls = `pick ${result.status}`;
  const icon = STATUS_ICON[result.status] || "·";
  const winner = teamDisplay(pick.winner);
  const loser = teamDisplay(pick.loser);
  const ptsText = result.points > 0 ? `+${result.points}` : (result.status === "pending" ? "—" : "0");
  return `
    <div class="${cls}">
      <span class="icon">${icon}</span>
      <span class="team-line"><strong>${winner}</strong> in ${pick.games} <span class="sub">over ${loser}</span></span>
      <span class="pts">${ptsText}</span>
    </div>
  `;
}

function roundSection(picksInRound, label) {
  const rows = picksInRound.map(pr => pickLine(pr)).join("");
  return `
    <div class="round-label"><span>${label}</span></div>
    ${rows}
  `;
}

export function renderBracket(name, scored) {
  const r1 = roundSection(scored.perPick.round1, ROUND_LABELS.round1);
  const r2 = roundSection(scored.perPick.round2, ROUND_LABELS.round2);
  const cf = roundSection(scored.perPick.confFinals, ROUND_LABELS.confFinals);
  const f  = scored.perPick.finals
    ? `<div class="finals-pick">
         <span class="stamp">Champ Pick</span>
         ${pickLine(scored.perPick.finals)}
       </div>`
    : "";

  return `
    <article class="bracket-card">
      <header class="bracket-card-header">
        <h3>${name}</h3>
        <span class="card-score">Pts <strong>${scored.current}</strong> · Max <strong>${scored.max}</strong></span>
      </header>
      ${r1}
      ${r2}
      ${cf}
      ${f}
    </article>
  `;
}

export function renderLeaderboard(rows) {
  const sorted = [...rows].sort((a, b) => b.current - a.current || b.max - a.max);
  const leaderCurrent = sorted.length ? sorted[0].current : 0;
  const header = `
    <div class="leaderboard-row header">
      <span class="rank">#</span>
      <span class="name">Player</span>
      <span class="num">Current</span>
      <span class="num max-col">Max</span>
      <span class="num">Correct</span>
    </div>
  `;
  const body = sorted.map((r, i) => {
    const isLeader = r.current === leaderCurrent && leaderCurrent > 0;
    return `
      <div class="leaderboard-row ${isLeader ? 'leader' : ''}">
        <span class="rank">${i + 1}</span>
        <span class="name">${r.name}</span>
        <span class="num">${r.current}</span>
        <span class="num max-col">${r.max}</span>
        <span class="num">${r.correctCount}/${r.totalCompleted || 0}</span>
      </div>
    `;
  }).join("");
  return `<div class="leaderboard">${header}${body}</div>`;
}
```

- [ ] **Step 2: Commit**

Run:
```bash
git add render.js
git commit -m "feat: add render module for leaderboard and bracket cards"
```

---

## Task 10: App Entry Point

**Files:**
- Create: `app.js`

- [ ] **Step 1: Create `app.js`**

Create `app.js`:
```js
import { PICKS } from './picks.js';
import { fetchLiveResults } from './espn.js';
import { scoreBracket } from './scoring.js';
import { renderLeaderboard, renderBracket } from './render.js';

const CACHE_KEY = 'nba_bracket_live_v1';
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const EMPTY_LIVE = { round1: [], round2: [], confFinals: [], finals: null };

function showBanner(msg) {
  const el = document.getElementById('fetch-banner');
  el.textContent = msg;
  el.hidden = false;
}

function setStatus(last, fetching) {
  document.getElementById('last-updated').textContent = last;
  document.getElementById('fetch-status').textContent = fetching;
}

function saveCache(live) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ live, ts: Date.now() }));
  } catch (_) { /* storage full or blocked — ignore */ }
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_MAX_AGE_MS) return null;
    return parsed;
  } catch (_) { return null; }
}

function formatTimestamp(ms) {
  const d = new Date(ms);
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

async function main() {
  setStatus('Loading…', 'Fetching ESPN');
  let live = EMPTY_LIVE;
  let timestamp = Date.now();
  try {
    live = await fetchLiveResults();
    saveCache(live);
    setStatus(`Updated ${formatTimestamp(timestamp)}`, 'Live');
  } catch (err) {
    console.error('ESPN fetch failed:', err);
    const cached = loadCache();
    if (cached) {
      live = cached.live;
      timestamp = cached.ts;
      setStatus(`Cached ${formatTimestamp(timestamp)}`, 'Offline');
      showBanner('Live data unavailable — showing last cached results.');
    } else {
      setStatus('No data yet', 'Offline');
      showBanner('Live data unavailable and no cache. Showing picks without scores.');
    }
  }

  const rows = [];
  const bracketsHtml = [];
  for (const [name, picks] of Object.entries(PICKS)) {
    const scored = scoreBracket(picks, live);
    rows.push({ name, ...scored });
    bracketsHtml.push(renderBracket(name, scored));
  }

  document.getElementById('leaderboard').innerHTML = renderLeaderboard(rows);
  document.getElementById('brackets').innerHTML = bracketsHtml.join('');
}

main();
```

- [ ] **Step 2: Manual smoke test**

Run:
```bash
python3 -m http.server 8000 &
sleep 1
echo "Open http://localhost:8000/ in a browser."
echo "Verify: masthead renders, leaderboard shows all 4 players with 0 current / 51 max (until real playoff data appears)."
echo "Verify: all 4 bracket cards render with all picks showing · (pending)."
echo "Verify: banner appears if ESPN fetch fails (check browser console)."
echo "Kill server when done: kill %1"
```

- [ ] **Step 3: Commit**

Run:
```bash
git add app.js
git commit -m "feat: wire up app entry with fetch + cache + render"
```

---

## Task 11: Render Deploy Config

**Files:**
- Create: `render.yaml`

- [ ] **Step 1: Create `render.yaml`**

Create `render.yaml`:
```yaml
services:
  - type: web
    name: nba-playoffs-bracket
    runtime: static
    buildCommand: ""
    staticPublishPath: .
    pullRequestPreviewsEnabled: true
    headers:
      - path: /*
        name: X-Frame-Options
        value: DENY
      - path: /*
        name: X-Content-Type-Options
        value: nosniff
```

- [ ] **Step 2: Commit**

Run:
```bash
git add render.yaml
git commit -m "chore: add Render static site config"
```

---

## Task 12: End-to-End Verification

**Files:**
- None (manual verification)

- [ ] **Step 1: Run local server and verify full page**

Run:
```bash
python3 -m http.server 8000 &
sleep 1
echo "Open http://localhost:8000/"
```

Verify:
- [ ] Masthead renders with "Playoffs Almanac" in Anton font
- [ ] Date line and subtitle visible
- [ ] Leaderboard table shows all 4 players
- [ ] All 4 bracket cards render with correct picks transcribed
- [ ] All picks show · (pending dot) since playoffs haven't started
- [ ] "Champ Pick" stamp appears on each bracket's finals pick
- [ ] No console errors (other than possibly ESPN CORS / 404 which is expected and should trigger banner)
- [ ] Responsive: resize window to 400px width — leaderboard + brackets stay readable

Kill server: `kill %1`

- [ ] **Step 2: Run unit tests**

Run:
```bash
python3 -m http.server 8000 &
sleep 1
echo "Open http://localhost:8000/tests/test.html — expected: all 21 tests pass (tab title starts with 'PASS')"
```

Kill server: `kill %1`

- [ ] **Step 3: Final commit if anything adjusted**

Any fixes found during verification go into a single commit:
```bash
git add -A
git status  # review
git commit -m "chore: end-to-end verification fixes" || echo "nothing to commit"
```

---

## Task 13: Push to GitHub

**Files:**
- None

- [ ] **Step 1: Ask user to create a GitHub repo**

Since this requires user account access, prompt:
> "Create an empty GitHub repo named `nba-playoffs-bracket` (or name of your choice). Don't initialize it with a README. Paste the `git remote add origin <url>` command here or run it yourself."

- [ ] **Step 2: Push main**

Once the remote is added:
```bash
git push -u origin main
```

- [ ] **Step 3: Wire up Render**

Prompt user:
> "In Render dashboard:
> 1. **New +** → **Static Site** → connect your GitHub repo
> 2. Name: `nba-playoffs-bracket`
> 3. Build command: (blank)
> 4. Publish directory: `.`
> 5. Click **Create Static Site**. Render auto-deploys on every push to main."

Once deployed, add the URL to `README.md` in place of `<add Render URL after deploy>` and commit.

---

## Self-Review

- **Spec coverage:** Every section of the spec has a task. Picks (Task 2), Scoring (Tasks 3–5), ESPN (Task 6), UI (Tasks 7–10), deploy (Tasks 11, 13), testing (Task 12). ✓
- **Placeholders:** None — every code step has complete code. "Add Render URL after deploy" is a user-action note, not a code placeholder. ✓
- **Type consistency:** `scoreBracket` returns `{ current, max, correctCount, totalCompleted, perPick }` — matches usage in `render.js` and `app.js`. `perPick.finals` is `{pick, result}` or null — handled in `render.js`. ESPN team abbreviations consistent (`OKC/BOS/DET/SAS` etc.). Round keys `round1|round2|confFinals|finals` consistent across files. ✓
