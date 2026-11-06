# NYC Live Music — Next 4 Weeks

A rolling four-week calendar of jazz, improvised, and DIY live music in New York City.
Every listing carries a price and a direct ticket link.

**Live site:** https://gighub.nyc/
**Archive:** https://gighub.nyc/archive.html — every show ever listed here, back to July 2026.

## What's in here

`index.html` is the whole site — one self-contained file with the data, styles, and
scripts inline. There is no build step, no framework, and nothing to install. Opening
the file locally in a browser gives you exactly what the hosted page shows.

`archive.html` and `archive.json` are the archive. `build-archive.js` regenerates
`archive.json` from this repository's own git history: every published version of
`index.html` is a dated snapshot, so the archive can always be rebuilt from scratch with
no stored state.

## Venues tracked

44 rooms: The Jazz Gallery · DROM · Nublu · Close Up · Roulette · Ornithology (Jazz Club
+ Cafe) · Le Poisson Rouge · Village Vanguard · Smalls · Mezzrow · Jazzcultural · The
Pocket · 92NY · Lowlands · Barbès · Bar Bayeux · Bar LunÀtico · Public Records ·
Reforesters Laboratory · Zinc Bar · Five Spot Jazz · Groove · Cafe Wha? · Red Pavilion ·
Culture Lab LIC · Amant · Park Avenue Armory · The Lot Radio · Elsewhere · The Sultan
Room · TV Eye · Purgatory · Jupiter Disco · Littlefield · Cassette · C'mon Everybody ·
Young Ethel's · Friends & Lovers · Berlin · Wonderville · Doublé · pinkFROG cafe · 360
Record Shop · Mezcaleria La Milagrosa.

Plus community and DIY shows that run on no venue calendar at all — these turn up rooms
the list above misses, such as Barzakh Cafe, Come To Life, National Sawdust, Birdland,
Smoke and Cinema Village.

## How it stays current

Each refresh re-scrapes every venue calendar and regenerates `index.html` in full. A
weekly reminder fires on Monday morning; the sweep itself is run on request, because
publishing requires a browser session that a scheduled cloud run does not have.

The page also maintains itself between refreshes: it reads the visitor's current date in
the America/New_York timezone, hides any show that has already happened, and displays a
warning banner if the data is more than eight days old. So a stale deploy degrades
visibly rather than quietly showing last month's gigs.

## Prices

Prices come from three places, in descending order of certainty: figures read directly
off a checkout page (these include fees and are labelled as totals), published venue door
policy, and — where a venue publishes nothing at all — an explicit note saying so.
Nothing is ever estimated. Where a listing says no price is published, that is the
finding, not a gap. Always confirm at the door.

## Sources and attribution

Listings sourced from venue calendars are labelled with the domain they came from.
Listings found through community channels are labelled `community` without further
attribution, deliberately: the shows are public promotions, but where a listing was
spotted is not published.

Unofficial and not affiliated with any venue.
