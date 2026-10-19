# Verified release

Published and reviewed on **19 October 2026**.

- [Live demo](https://rafayelkaramyan.github.io/orqensa/)
- [Repository](https://github.com/RafayelKaramyan/orqensa)
- Tested application: `d9bfb207f96821716c1f09e34a795ba30b41093e`
- [Successful verification and Pages deployment](https://github.com/RafayelKaramyan/orqensa/actions/runs/39313827849)

The release documentation and homepage image are separate from the tested application code. The later documentation commit does not change application behavior or the deployed build.

## Executed checks

Clean installation, strict TypeScript, zero-warning ESLint, Prettier checks and the production Vite build passed in GitHub Actions.

| Suite                     | Passed | Notes                                                                                                   |
| ------------------------- | -----: | ------------------------------------------------------------------------------------------------------- |
| Domain and persistence    |     37 | Geometry, commands, versions, portable content, recovery, failed writes and independent brief snapshots |
| Desktop Chromium          |     13 | Complete browser scenarios                                                                              |
| Desktop Firefox           |     13 | Complete browser scenarios                                                                              |
| Mobile Chromium / Pixel 7 |     12 | One pointer-drag case intentionally skipped; keyboard and position controls are exercised               |
| **Executed total**        | **75** | **37 unit tests + 38 browser scenarios**                                                                |

The browser suite covers editorial navigation, direct links, filters, material pairing, saved editing, history, keyboard and pointer movement, reload persistence, shared copies, imports, invalid files, brief review/download, print styles, cross-tab updates, failed storage, corrupt-data recovery, SVG escaping, motion controls and representative axe scans.

Responsive assertions compare document width with the actual device viewport, rather than the mobile browser's potentially widened `innerWidth`. Fonts are loaded before measurement. Home, lab and brief views pass at 320 CSS pixels. The final narrow capture is 840 physical pixels wide at a 2.625 pixel ratio, confirming that the page no longer widens beyond the 320-pixel device viewport.

Desktop/mobile home and lab captures were visually inspected, including the narrow layout and rendered Chromium 3D views. The image used in README is an actual published-homepage capture. Six licensed reference photographs and twelve WebP variants were decoded and inspected; exact credits are in [assets-and-sources.md](assets-and-sources.md).

## Public browser review

The published site was exercised through its normal controls:

- Selected Fine terrazzo and Sage in the material library and carried both into the lab.
- Named and saved “Room for a slower Sunday”; moved the sofa, undid and redid the move, and added a plant.
- Reloaded the page and confirmed the same name, material, tone, eight objects and sofa X position of 1.6 m.
- Attached the room to a 96 m² project brief with two priorities and notes, saved it, downloaded the text, reopened it from the collection and reloaded it.
- Inspected the downloaded text: correct room name, Fine terrazzo, eight objects, notes and explicit local delivery status.
- Verified the footer credits route and six photographer links.
- Paused motion, reloaded with the pause retained, and resumed it.
- Verified README and repository About both link to the live demo.

The live review browser does not expose WebGL. Its explicit 3D-unavailable message and intact SVG editing path were verified. The CI Chromium captures show the actual 3D rendering; this does not establish physical-device GPU behavior.

## Scope and limits

This is a static portfolio concept with browser-local rooms and briefs. It has no real client commissions, accounts, cloud synchronization, payments or contact delivery. Drawings are illustrative, not construction documents.

The optional Three/R3F chunk is about 914 KB minified / 243 KB gzip and loads on request. The SVG editor works independently. No runtime dependency is loaded from a CDN, and no Lighthouse or Core Web Vitals score is claimed.

Automated axe checks are regression coverage, not a complete accessibility certification. Safari/VoiceOver, physical-device GPU behavior and a native print-dialog workflow were not verified. Print stylesheet behavior and brief contents were tested.
