const SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";

const VALID_TEAMS = new Set([
  "OKC","PHX","HOU","LAL","DEN","MIN","SAS","POR",
  "DET","ORL","CLE","TOR","NYK","ATL","BOS","PHI"
]);

// ESPN sometimes abbreviates teams differently than we do. Map to our canonical form.
const ABBR_FIX = { "NY": "NYK", "SA": "SAS" };

const PLAYOFFS_START = "20260418";
const PLAYOFFS_END   = "20260701";

function canonicalAbbr(raw) {
  if (!raw) return null;
  const up = String(raw).toUpperCase();
  return ABBR_FIX[up] || up;
}

function detectRound(headline) {
  if (!headline) return null;
  const h = headline.toLowerCase();
  if (h.includes("nba finals") || h === "finals" || h.startsWith("finals -")) return "finals";
  if (h.includes("conf. finals") || h.includes("conference finals") || h.includes("conf finals") || /\b(east|west) finals\b/.test(h)) return "confFinals";
  if (h.includes("conf. semifinals") || h.includes("conference semifinals") || h.includes("conf semifinals") || h.includes("2nd round") || h.includes("semifinals")) return "round2";
  if (h.includes("1st round") || h.includes("first round")) return "round1";
  return null;
}

function pairKey(a, b) {
  return [a, b].sort().join("|");
}

/**
 * Group an array of completed playoff games into series.
 * Each game has: round, teamA (abbr), teamB (abbr), winnerAbbr.
 * Returns normalized LIVE object.
 */
export function buildSeriesFromGames(games) {
  const result = { round1: [], round2: [], confFinals: [], finals: null };
  const bucketByRound = { round1: new Map(), round2: new Map(), confFinals: new Map(), finals: new Map() };

  for (const g of games) {
    if (!g.round || !bucketByRound[g.round]) continue;
    const teamA = canonicalAbbr(g.teamA);
    const teamB = canonicalAbbr(g.teamB);
    const winnerAbbr = canonicalAbbr(g.winnerAbbr);
    if (!VALID_TEAMS.has(teamA) || !VALID_TEAMS.has(teamB)) continue;
    const key = pairKey(teamA, teamB);
    const bucket = bucketByRound[g.round];
    let s = bucket.get(key);
    if (!s) {
      s = { matchup: [teamA, teamB].sort(), wins: {} };
      s.wins[teamA] = 0;
      s.wins[teamB] = 0;
      bucket.set(key, s);
    }
    if (winnerAbbr === teamA || winnerAbbr === teamB) {
      s.wins[winnerAbbr] = (s.wins[winnerAbbr] || 0) + 1;
    }
  }

  for (const round of Object.keys(bucketByRound)) {
    for (const s of bucketByRound[round].values()) {
      const [teamA, teamB] = s.matchup;
      const winsA = s.wins[teamA] || 0;
      const winsB = s.wins[teamB] || 0;
      const complete = winsA === 4 || winsB === 4;
      const winner = !complete ? null : (winsA > winsB ? teamA : teamB);
      const loser  = !complete ? null : (winsA > winsB ? teamB : teamA);
      const games  = !complete ? null : winsA + winsB;
      const series = {
        matchup: [teamA, teamB],
        winner, loser, games, complete,
        currentScore: `${winsA}-${winsB}`
      };
      if (round === "finals") result.finals = series;
      else result[round].push(series);
    }
  }
  return result;
}

/**
 * Normalize an ESPN scoreboard response (or concatenation of responses) into the LIVE shape.
 */
export function normalizeEspn(rawEventsOrScoreboard) {
  const empty = { round1: [], round2: [], confFinals: [], finals: null };
  if (!rawEventsOrScoreboard) return empty;

  const events = Array.isArray(rawEventsOrScoreboard)
    ? rawEventsOrScoreboard
    : (rawEventsOrScoreboard.events || []);

  const games = [];
  for (const e of events) {
    const seasonType = e.season?.type;
    if (seasonType !== 3 && seasonType !== "3") continue;
    const comp = (e.competitions && e.competitions[0]) || {};
    const completed = comp.status?.type?.completed === true;
    if (!completed) continue;
    const competitors = comp.competitors || [];
    if (competitors.length < 2) continue;
    const a = competitors[0];
    const b = competitors[1];
    const abbrA = canonicalAbbr(a.team?.abbreviation);
    const abbrB = canonicalAbbr(b.team?.abbreviation);
    if (!abbrA || !abbrB) continue;
    const winnerAbbr = a.winner === true ? abbrA : (b.winner === true ? abbrB : null);
    if (!winnerAbbr) continue;
    const headline = (comp.notes && comp.notes[0] && comp.notes[0].headline) || "";
    const round = detectRound(headline);
    games.push({ round, teamA: abbrA, teamB: abbrB, winnerAbbr });
  }

  return buildSeriesFromGames(games);
}

export async function fetchLiveResults() {
  const url = `${SCOREBOARD_URL}?dates=${PLAYOFFS_START}-${PLAYOFFS_END}&limit=1000`;
  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) throw new Error(`ESPN returned ${resp.status}`);
  const raw = await resp.json();
  return normalizeEspn(raw);
}
