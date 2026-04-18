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
  } catch (_) {}
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
