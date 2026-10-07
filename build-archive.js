#!/usr/bin/env node
/*
 * build-archive.js — regenerate archive.json from this repo's own git history.
 *
 * The site only ever shows a rolling four-week window, and each refresh replaces
 * the whole dataset. Nothing is lost, though: every published version of
 * index.html is a dated snapshot of the calendar. This script walks all of them,
 * pulls out each snapshot's event array, de-duplicates across them and writes a
 * single archive.json covering everything the calendar has ever listed.
 *
 * It is idempotent and needs no state: run it after any refresh and it rebuilds
 * the whole archive from scratch.
 *
 *   git clone https://github.com/tmgaus513/nyc-live-music.git
 *   cd nyc-live-music && node build-archive.js
 *
 * De-duplication key: date + venue + start time (normalised to minutes) +
 * artist billing (normalised: lowercased, accents and punctuation stripped).
 * Where the same show appears in several snapshots the most recent listing wins,
 * and any field the newer snapshot left blank is backfilled from the older one.
 */
const fs = require('fs');
const { execSync } = require('child_process');

const git = c => execSync(c, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const commits = git("git log --format='%H %ad' --date=short -- index.html")
  .trim().split('\n').map(l => { const [sha, date] = l.split(' '); return { sha, date }; });
if (!commits.length) { console.error('No history for index.html — run this inside a full clone.'); process.exit(1); }

const norm  = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
                     .replace(/&amp;/g, '&').replace(/[^a-z0-9]+/g, '');
const normT = t => { if (!t) return '';
  const m = String(t).match(/(\d{1,2})(?::(\d{2}))?\s*([ap])/i);
  if (!m) return norm(t);
  let h = +m[1] % 12; if (/p/i.test(m[3])) h += 12;
  return String(h * 60 + (m[2] ? +m[2] : 0)); };

const by = new Map();
const snapshots = [];
for (const { sha, date } of commits) {
  let html;
  try { html = git(`git show ${sha}:index.html`); } catch { continue; }
  const i = html.indexOf('const E = [');
  if (i < 0) continue;
  const end = html.indexOf('\n];', i);
  let events;
  try { events = JSON.parse(html.slice(i + 'const E = '.length, end + 2).replace(/,(\s*)\]$/, '$1]')); }
  catch (e) { console.error(`  skipped ${sha.slice(0, 7)} (${date}): ${e.message}`); continue; }

  const vi = html.indexOf('const VENUES = {'), ve = html.indexOf('\n};', vi);
  const vmap = {};
  for (const m of html.slice(vi, ve).matchAll(/^\s*(\w+):\{name:"([^"]*)"/gm)) vmap[m[1]] = m[2];

  for (const r of events) {
    if (!r.d || !/^\d{4}-\d{2}-\d{2}$/.test(r.d)) continue;
    const key = [r.d, r.v, normT(r.t), norm(r.a)].join('|');
    const rec = { d: r.d, t: r.t || '', a: r.a, v: r.v, vn: vmap[r.v] || r.v, g: r.g || '',
                  det: r.det || '', u: r.u || '', p: r.p || '', s: r.s || '',
                  tu: (r.tu && r.tu !== r.u) ? r.tu : '', fs: date, ls: date, n: 1 };
    const prev = by.get(key);
    if (!prev) { by.set(key, rec); continue; }
    prev.n++;
    if (date < prev.fs) prev.fs = date;
    if (date > prev.ls) {                       // newer snapshot wins
      prev.ls = date;
      for (const f of ['t','a','vn','g','det','u','p','s','tu']) if (rec[f]) prev[f] = rec[f];
    } else {                                    // older snapshot only backfills blanks
      for (const f of ['g','det','u','p','s','tu']) if (!prev[f] && rec[f]) prev[f] = rec[f];
    }
  }
  snapshots.push({ sha: sha.slice(0, 7), date, events: events.length });
}

const out = [...by.values()].sort((a, b) =>
  a.d < b.d ? -1 : a.d > b.d ? 1 : (a.v < b.v ? -1 : a.v > b.v ? 1 : 0));
const venues = {};
out.forEach(e => { venues[e.v] = e.vn; delete e.vn; });

const days = [...new Set(out.map(e => e.d))].sort();
const missing = [];
for (let d = new Date(days[0] + 'T12:00:00'), last = new Date(days.at(-1) + 'T12:00:00'); d <= last; d.setDate(d.getDate() + 1)) {
  const s = d.toISOString().slice(0, 10);
  if (!days.includes(s)) missing.push(s);
}

fs.writeFileSync('archive.json', JSON.stringify({
  generated: new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }),
  sources: `${snapshots.length} published versions of gighub.nyc, ${snapshots.at(-1).date} – ${snapshots[0].date}`,
  snapshots, missingDays: missing, venues, events: out
}));

console.log(`${snapshots.length} snapshots → ${out.length} unique shows`);
console.log(`${days[0]} – ${days.at(-1)} · ${days.length} nights · ${Object.keys(venues).length} rooms`);
if (missing.length) console.log(`no data for ${missing.length} day(s): ${missing.join(' ')}`);
