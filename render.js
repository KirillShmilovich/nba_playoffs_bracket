import { TEAM_NAMES } from './picks.js';

const STATUS_ICON = {
  "correct-exact":  "✓",
  "correct-winner": "✓",
  "correct-length": "½",
  "wrong":          "✗",
  "pending":        "·",
  "eliminated":     "✗"
};

const STATUS_LABEL = {
  "correct-exact":  "Exact",
  "correct-winner": "Winner",
  "correct-length": "Length",
  "wrong":          "Wrong",
  "pending":        "Pending",
  "eliminated":     "Out"
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

function formatGameDate(iso) {
  if (!iso) return "soon";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function pickLine(pickResult) {
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
      <span class="num"><span class="full-label">Current</span><span class="short-label">Pts</span></span>
      <span class="num possible-col" title="Total possible score"><span class="full-label">Possible</span><span class="short-label">Max</span></span>
      <span class="num"><span class="full-label">Correct</span><span class="short-label">Hit</span></span>
    </div>
  `;
  const body = sorted.map((r, i) => {
    const isLeader = r.current === leaderCurrent && leaderCurrent > 0;
    return `
      <div class="leaderboard-row ${isLeader ? 'leader' : ''}">
        <span class="rank">${i + 1}</span>
        <span class="name">${r.name}</span>
        <span class="num">${r.current}</span>
        <span class="num possible-col" title="${r.name} total possible score">${r.max}</span>
        <span class="num">${r.correctCount}/${r.totalCompleted || 0}</span>
      </div>
    `;
  }).join("");
  return `<div class="leaderboard">${header}${body}</div>`;
}

function seriesStatusLabel(entry) {
  const { actual } = entry;
  if (!actual) {
    const hasLivePath = entry.picks.some(p => p.result.status !== "eliminated");
    return hasLivePath ? "Waiting on bracket path" : "Impossible";
  }
  if (actual.complete) {
    return `Final · ${teamDisplay(actual.winner)} in ${actual.games} (${4}-${actual.games - 4})`;
  }
  const [a, b] = actual.matchup;
  if (actual.started) {
    return `In progress · ${teamDisplay(a)} ${actual.currentScore || ""} ${teamDisplay(b)}`;
  }
  return `Scheduled · ${formatGameDate(actual.nextGameDate)}`;
}

function seriesStatusClass(entry) {
  const { actual } = entry;
  if (!actual) {
    return entry.picks.some(p => p.result.status !== "eliminated") ? "watch" : "dead";
  }
  if (actual.complete) return "done";
  return actual.started ? "live" : "scheduled";
}

function playerRow(p) {
  const cls = `series-player-row ${p.result.status}`;
  const icon = STATUS_ICON[p.result.status] || "·";
  const label = STATUS_LABEL[p.result.status] || "Pending";
  const ptsText = p.result.points > 0
    ? `+${p.result.points}`
    : (p.result.status === "pending" ? "—" : "0");
  return `
    <div class="${cls}">
      <span class="sp-icon">${icon}</span>
      <span class="sp-name">${p.name}</span>
      <span class="sp-pick"><strong>${teamDisplay(p.pick.winner)}</strong> in ${p.pick.games} <span>over ${teamDisplay(p.pick.loser)}</span></span>
      <span class="sp-result">${label}</span>
      <span class="sp-pts">${ptsText}</span>
    </div>
  `;
}

function seriesCard(entry, roundLabel, kindLabel) {
  const [a, b] = entry.matchup;
  const statusCls = seriesStatusClass(entry);
  const statusLabel = seriesStatusLabel(entry);
  const picked = entry.picks.length;

  const picks = entry.picks
    .slice()
    .sort((x, y) => y.result.points - x.result.points || x.name.localeCompare(y.name))
    .map(playerRow)
    .join("");

  const emptyNote = picked === 0
    ? `<div class="series-empty">No one picked this exact matchup</div>`
    : "";

  return `
    <details class="series-card ${statusCls}">
      <summary class="series-summary">
        <span class="series-round">${roundLabel} · ${kindLabel}</span>
        <span class="series-matchup">
          <strong>${teamDisplay(a)}</strong>
          <span class="vs">vs</span>
          <strong>${teamDisplay(b)}</strong>
        </span>
        <span class="series-status">${statusLabel}</span>
        <span class="series-count">${picked} pick${picked === 1 ? "" : "s"}</span>
        <span class="series-chevron">▾</span>
      </summary>
      <div class="series-body">
        ${picks}
        ${emptyNote}
      </div>
    </details>
  `;
}

function renderSeriesSubsection(title, entries, roundLabel, kindLabel) {
  if (!entries.length) return "";
  const cards = entries.map(e => seriesCard(e, roundLabel, kindLabel)).join("");
  return `
    <div class="series-subsection">
      <h4 class="series-subheading">${title}</h4>
      <div class="series-stack">${cards}</div>
    </div>
  `;
}

export function renderSeriesView(seriesByRound) {
  const rounds = ["round1", "round2", "confFinals", "finals"];
  const sections = rounds.map(round => {
    const entries = seriesByRound[round] || [];
    if (!entries.length) return "";
    const officialEntries = entries.filter(e => e.actual);
    const pickOnlyEntries = entries.filter(e => !e.actual);
    const official = renderSeriesSubsection("Official series", officialEntries, ROUND_LABELS[round], "Official");
    const watchlist = renderSeriesSubsection("Prediction watchlist", pickOnlyEntries, ROUND_LABELS[round], "Prediction");
    return `
      <div class="series-round-section">
        <h3 class="series-round-heading">${ROUND_LABELS[round]}</h3>
        ${official}
        ${watchlist}
      </div>
    `;
  }).join("");
  return sections || `<p class="series-empty-state">No series yet — check back once games begin.</p>`;
}
