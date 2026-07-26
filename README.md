# NYC Live Music — Next 4 Weeks

A rolling four-week calendar of jazz, improvised, and DIY live music in New York City.
Every listing carries a price and a direct ticket link.

**Live site:** _(fill in once GitHub Pages is enabled)_

## What's in here

`index.html` is the whole site — one self-contained file with the data, styles, and
scripts inline. There is no build step, no framework, and nothing to install. Opening
the file locally in a browser gives you exactly what the hosted page shows.

## Venues tracked

The Jazz Gallery · DROM · Nublu · Close Up · Roulette · Ornithology (Jazz Club + Cafe) ·
Le Poisson Rouge · Village Vanguard · Smalls · Mezzrow · Jazzcultural · The Pocket · 92NY,
plus community and DIY shows that don't run on a venue calendar.

## How it stays current

Venue calendars are re-scraped once a week; community and DIY listings twice a week.
Each refresh regenerates `index.html` in full.

The page also maintains itself between refreshes: it reads the visitor's current date in
the America/New_York timezone, hides any show that has already happened, and displays a
warning banner if the data is more than eight days old. So a stale deploy degrades
visibly rather than quietly showing last month's gigs.

## Prices

Prices come from three places, in descending order of certainty: figures read directly
off a checkout page (these include fees), published venue door policy, and — where a
venue publishes nothing at all — an explicit "at door" note. Nothing is estimated
without being labelled. Always confirm at the door.

## Sources and attribution

Listings sourced from venue calendars are labelled with the domain they came from.
Listings found through community channels are labelled `community` without further
attribution, deliberately: the shows are public promotions, but where a listing was
spotted is not published.

Unofficial and not affiliated with any venue.
