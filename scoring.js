export const ROUND_POINTS = {
  round1:     { winner: 1, lengthBonus: 1 },
  round2:     { winner: 2, lengthBonus: 1 },
  confFinals: { winner: 4, lengthBonus: 2 },
  finals:     { winner: 8, lengthBonus: 3 }
};

export function scoreSeries(pick, actual, round) {
  if (!actual || !actual.complete) {
    return { points: 0, status: "pending" };
  }
  const pts = ROUND_POINTS[round];
  const winnerCorrect = actual.winner === pick.winner;
  const lengthCorrect = actual.games === pick.games;

  if (winnerCorrect && lengthCorrect) {
    return { points: pts.winner + pts.lengthBonus, status: "correct-exact" };
  }
  if (winnerCorrect) {
    return { points: pts.winner, status: "correct-winner" };
  }
  if (lengthCorrect) {
    return { points: pts.lengthBonus, status: "correct-length" };
  }
  return { points: 0, status: "wrong" };
}

export function isEliminated(team, live) {
  const allSeries = [
    ...(live.round1 || []),
    ...(live.round2 || []),
    ...(live.confFinals || []),
    ...(live.finals ? [live.finals] : [])
  ];
  return allSeries.some(s => s && s.complete && s.loser === team);
}

function findLiveSeries(pick, liveRound) {
  if (!liveRound) return null;
  return liveRound.find(s =>
    s.matchup && s.matchup.includes(pick.winner) && s.matchup.includes(pick.loser)
  ) || null;
}

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
        max += result.points;
      } else {
        if (isEliminated(pick.winner, live) || isEliminated(pick.loser, live)) {
          result.status = "eliminated";
        } else {
          const pts = ROUND_POINTS[round];
          max += pts.winner + pts.lengthBonus;
        }
      }
      perPick[round].push({ pick, result });
    }
  }

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

export function buildSeriesView(picksByName, live) {
  const rounds = ["round1", "round2", "confFinals", "finals"];
  const out = {};
  for (const round of rounds) {
    const matchups = new Map();

    const liveList = round === "finals"
      ? (live.finals ? [live.finals] : [])
      : (live[round] || []);
    for (const s of liveList) {
      if (!s || !s.matchup) continue;
      const key = s.matchup.slice().sort().join("|");
      matchups.set(key, { matchup: s.matchup.slice().sort(), actual: s, picks: [] });
    }

    for (const [name, picks] of Object.entries(picksByName)) {
      const picksInRound = round === "finals"
        ? (picks.finals ? [picks.finals] : [])
        : (picks[round] || []);
      for (const p of picksInRound) {
        const key = [p.winner, p.loser].slice().sort().join("|");
        if (!matchups.has(key)) {
          matchups.set(key, {
            matchup: [p.winner, p.loser].slice().sort(),
            actual: null,
            picks: []
          });
        }
        const entry = matchups.get(key);
        const result = scoreSeries(p, entry.actual, round);
        if (!entry.actual || !entry.actual.complete) {
          if (isEliminated(p.winner, live) || isEliminated(p.loser, live)) {
            result.status = "eliminated";
          }
        }
        entry.picks.push({ name, pick: p, result });
      }
    }

    out[round] = [...matchups.values()].sort((a, b) => {
      const aDone = a.actual && a.actual.complete ? 0 : 1;
      const bDone = b.actual && b.actual.complete ? 0 : 1;
      if (aDone !== bDone) return aDone - bDone;
      return a.matchup[0].localeCompare(b.matchup[0]);
    });
  }
  return out;
}
