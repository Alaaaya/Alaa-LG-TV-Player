# Alaa Player for LG webOS
Independent web app port, com.alaa.player.webos 1.0.0. Android source was read only, not modified.
Reference source /home/kit/Alaa-Player-2 at 858e09f8. Android AGENTS.md and graph report read before inspection.
No installation, TV mutation, production RPC, or panel activation was performed.

## Included
Panel pairing matches Android register_device / get_device_config RPCs and public anon role.
Fresh persistent 8-character cryptographic device code, displayed grouped as 4-4.
MAC field is explicitly webOS-CODE, not claimed to be hardware MAC.
Inactive/expired panel playlists are removed. Removed assignments are cleared and changed configurations reloaded on refresh.
Active expiry checked every minute; refresh at startup, manually and every 30 minutes.
Direct M3U and Xtream session login supported independently of activation.
M3U channels, Xtream live TV, movies, series and season/episode navigation.
Vertical category and content rows, search, 75-row paging for bounded DOM, remote geometric focus.
Native HTML5 video; Xtream live uses HLS .m3u8; direct M3U .ts gets video/mp2t.
Full-screen playback, Back, retry, pause/play, VOD ±30 second seek, media remote keys.
Visibility change stops playback; Back removes video sources to release resources.
Classic default palette copied from Android AppColors.ClassicPalette. Three-column category/list/detail composition.
No EPG.

## Honest gaps vs Android
This is an initial functional web rewrite, NOT pixel-identical Android UI or all-feature equivalence.
Only Classic styling included, not Android's alternate themes or exact Compose typography/layout/art.
No Stalker portal, EPG, catch-up, DVR/recording, downloads, cast, Android updater, favorites, playback history/resume,
parental/PIN protection, subtitles/audio-track selection UI, Android provider transport profiles/custom request headers,
encrypted offline provider cache or Android's Media3 recovery/format fallback.
M3U entries are shown in Live TV; M3U VOD/series classification is not inferred.
Xtream provides proper separate movies and series catalogue.
All catalogues parse in memory with a 24 MiB response limit. Pagination bounds DOM, not catalogue RAM.
Remote hardware, LG app-origin CORS/TLS/mixed-content policy and actual streams are UNTESTED.
There is no root proxy or disabled web security. A provider without browser CORS may fail even if Android works.
Native HLS/MP4 compatibility depends on the actual codec/container/provider. Direct TS may fail on webOS.
No transmux/transcode, hls.js, DRM license support, or promise that all Android-playable streams play on LG.
UI/browser source-routing tests mock HTMLMediaElement load/play/pause. They DO NOT validate actual playback,
frame progress, audio, decode speed, long-running streams, performance or recovery on hardware.
Offline panel error keeps current in-memory state; credentials are never persisted in browser storage.
No encrypted offline cache is available. Reloading loses direct credentials and catalogues.
Device code remains localStorage only. Clearing app data produces a new panel identity.
Tests use all mocked providers and mocked panel responses. Sample programme titles do not imply supplied content.

## Build and test
npm run check
npm run test:ui
npm run package

Packaging currently uses the existing, pinned @webos-tools/cli 3.2.6 installation in
/home/kit/alaa-tv-webos/node_modules/.bin/ares-package. For a standalone copy, install that version locally.
Tests use existing Playwright in /home/kit/tvp-valet with WebKit and /opt/hako/bin/google-chrome.
No runtime dependency, remote fonts, background artwork, CSS blur, framework, CDN or extra player engine.
The public panel anon key is the same RLS-protected public client key already shipped in Android, NOT a
service-role token. Source generation asserts anon role. No admin credentials are packaged.

## Install after owner review
Use webOS Dev Manager or existing rooted-TV app installer to install
artifacts/com.alaa.player.webos_1.0.0_all.ipk.
Launch Alaa Player from the LG applications menu, open the existing panel in a browser and activate
the NEW displayed code, then assign an authorized playlist and select Refresh connection.
This is a separate app and identity, not a replacement for Android Alaa Player or the LG launcher.
No default Home, root, ads, system services or other installed apps are changed.
First hardware acceptance must test activation, real channels for at least two minutes with changing
frames/audio, multiple channels, Back, pause, movies, episode navigation and CORS errors.
If unsuccessful, uninstall only com.alaa.player.webos from the normal LG app manager.

## Evidence
22 core tests, 60 browser assertions across WebKit and Chrome, screenshots with mocked fixtures.
artifacts/ui-results.json reports the test boundary.
artifacts/live-webkit.jpg, movies-webkit.jpg and connection-webkit.jpg are mock UI previews, not TV photos.
Official LG documentation reviewed 2026-10-25; chub had no webOS documentation matching the query.
https://webostv.developer.lge.com/develop/specifications/streaming-protocol-drm
https://webostv.developer.lge.com/develop/guides/mediaoption-parameter
LG lists native HLS and HTTP/HTTPS; specifies HLS tag restrictions, matching audio/video segment durations,
and platform-dependent format support. This port does not override those limitations.
