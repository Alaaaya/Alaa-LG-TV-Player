Jamra 2.6.1 exact-reference port
Source markup and CSS directly from approved /home/kit/zumurrud-wip/mockup/index.html, isolated Shadow DOM renderer. Live provider data connected via APJamra bridge. Same 1920x1080 coordinate stage scaled to viewport, original assets/fonts/effects, left category columns, all old themes preserved. No changes to player135.
Comparison captures use deterministic reference-matching fixture data, not a real account. Player comparison paused background is test-only; installed app displays actual native video. Comparison left is approved zum_N.jpg, right is installed dist renderer with fixture. Version/date/counts/provider metadata and live footage naturally differ. Home watch arrow has separate span from label, no overlap.
npm check: 30 pass.
Integration: home, movies, detail, VOD, series, episodes, live, channel drawer, settings, picker, back; four D-pad directions on each view except theme-list, no lost focus or runtime errors. CSP enforced.
Regression: apple+velour remote25 graphwalk42 contexts, all reachable.
Package69 files byte-identical to dist, verification artifacts/jamra261-package-verification.json.
Not tested on physical LG or real provider. No push.
