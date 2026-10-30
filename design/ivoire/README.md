# Ivoire — approved theme mockup (Alaa Player)

Light editorial luxury theme with a night variant ("Nocturne").

- `Alaa_Player_Ivoire.html` — self-contained 1920×1080 mockup (fonts/images embedded, offline). Open in a browser; D-pad/arrow keys + Enter + Back work.
  - URL params: `?clean&screen=<home|live|player-live|player-live-list|movies|movie-detail|series|series-detail|player-series|settings>&mode=night`
- `screens/` — reference captures of each screen.
- `src/` — mockup sources (`app.js`, `style.css`, `fonts.css`, `build.py` builds the HTML).

## Layout rules (owner requirements)
- Main menu: vertical sidebar on the LEFT (Home, Live TV, Movies, Series, Settings) — dark charcoal with gold frame, gold crest logo, icon tiles + Roman numerals, search/favourites/recent + clock at the bottom.
- Live TV: categories as a vertical column on the left, channel list next to it, preview monitor on the right.
- Movies / Series: categories as a vertical column on the left, poster grid to the right.

## Palette
Day: paper #F4EEE4, ink #1C1814, bordeaux #7A2333, brass #A9824A.
Night: #14110E / #F2EADD / #C9566B / #CFAB6E. Extra accents: Bordeaux, Émeraude, Laiton, Marine.

## Type
Playfair Display + Amiri (display), IBM Plex Sans Arabic (UI). Embedded offline.

## Focus
Single "viewfinder" focus indicator with four animated camera corners.

Mockup tested: 10 screens, 316 clicks, 110 D-pad presses, 0 runtime errors. Ported into the webOS app on branch ivoire-2.7 (see docs/ivoire27.md).
