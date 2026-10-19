# Verification record

## Executed locally

The complete source passed:

- Strict TypeScript compilation.
- ESLint with zero warnings.
- Prettier formatting checks.
- **37 unit tests** across spatial rules, file/share round trips, brief validation, SVG escaping, storage failures, stale leases/revisions, recovery and independent brief snapshots.
- Vite production build for `/orqensa/`.
- Asset decoding, dimensions and visual inspection of six licensed reference photographs and twelve WebP variants.

The production build reports an optional Three/R3F chunk larger than its default 500 KB warning threshold (about 914 KB minified / 243 KB gzip). This chunk loads only when a visitor asks for the 3D study. The complete SVG editor works independently. No runtime dependency is loaded from a CDN.

## Prepared, not yet executed

The Playwright suite contains 13 scenarios across desktop Chromium, desktop Firefox and mobile Chromium: **38 executable cases plus one intentional mobile pointer-drag skip**. Mobile movement is covered using the position controls. Scenarios cover:

- Editorial navigation, direct links, study filters, list view and image credits.
- Material pairing into the editor.
- Saved edits, rename, history, keyboard/position controls and reload.
- Invalid geometry, pointer dragging, share copies, JSON import and invalid-file rejection.
- Brief validation, snapshot attachment, persistent review, downloads and print styles.
- Cross-tab updates and stale-history protection.
- Failed writes, corrupt-byte download and explicit reset.
- Safe SVG export and malformed share-link recovery.
- Keyboard entry, reduced motion, mobile layout bounds and axe scans.
- 3D rendering or an explicit usable plan fallback.

The current managed workspace does not expose the required local browser-preview capability, so no local preview server or browser run was attempted. Browser tests are configured to run in GitHub Actions before deployment. Full-page home/lab captures and an available 3D capture are retained with the browser report for visual review.

## Publication status

The source is complete and locally checked. The public GitHub repository has been created with an initial README. Application upload is blocked by the installation’s selected-repository scope: a source blob write returned `403 Resource not accessible by integration`. Adding this new repository awaits an explicit Save in GitHub settings. Browser CI, visual review of rendered pages, Pages deployment and public end-to-end verification are **pending**. This file must be updated with actual commit/run references before marking the release verified.

No Lighthouse, Core Web Vitals, universal browser, professional architecture or full accessibility result is claimed. GPU rendering on physical devices, Safari and a native print-dialog workflow have not been verified.
