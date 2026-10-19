# Implementation notes

ORQENSA combines an editorial architecture concept with a functional, browser-local planning tool. Presentation pages explain a small spatial idea, the material library offers a concrete pairing, and the lab makes that pairing editable. The brief builder carries the result into a portable document.

## Source boundaries

| Area                            | Responsibility                                                                                  |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/domain/scene.ts`           | Validated room model, furniture dimensions, rotation, snapping, bounds, collisions and commands |
| `src/domain/repository.ts`      | Collection schema, leases, persistent writes, corruption recovery and cross-tab refresh         |
| `src/domain/transfer.ts`        | Versioned room files, Unicode-safe share tokens and escaped standalone SVG drawings             |
| `src/domain/brief.ts`           | Brief validation and plain-text export                                                          |
| `src/state/`                    | Repository subscription, serialized UI actions, notices and motion preference                   |
| `src/components/FloorPlan.tsx`  | SVG projection, pointer preview/capture, keyboard controls and selection                        |
| `src/components/ThreeRoom.tsx`  | Lazy, on-demand isometric rendering from the same room model                                    |
| `src/components/RoomEditor.tsx` | Editing controls, bounded history, sharing and exports                                          |
| `src/pages/`                    | Route composition, editorial content and local workflows                                        |

## Spatial editing

The room measures 6 × 4.5 m. Each object has a centre position, one of four right-angle rotations, and a fixed catalogue footprint. Rotations at 90°/270° swap the footprint axes. Commands snap moves to 0.1 m, reject objects outside the room, and reject overlapping axis-aligned footprints. Boundary tolerances account for floating-point arithmetic; they are not building clearances.

Dragging previews a candidate locally. Releasing commits a single command with the scene revision captured at pointer-down; an invalid drop leaves the model intact. Arrow keys move by 0.1 m, Shift + arrow keys by 0.5 m. The object list and position controls provide an alternative to spatial pointer targeting.

All furniture, including the plant, uses a rectangular clearance footprint. This is deliberately conservative. No doorway, access, ergonomic or structural assessment is performed. A room holds up to 16 objects, bounding both geometry work and portable snapshot size.

Undo/redo keeps up to 30 successful snapshots. Restoring a snapshot preserves the current room identity and advances its revision. A change received from another tab invalidates local history instead of restoring an old version over that change.

## Persistence and concurrency

The collection has a schema version, a generation UUID, a collection revision, rooms and brief snapshots. Every write reads current storage, checks the captured generation/revision lease, applies a change to a clone, validates the result, and writes it before notifying React. Room edits also check the expected scene revision. Quota or permission failures leave the previous saved snapshot visible and show a specific error.

The provider uses `useSyncExternalStore`; `storage` and window-focus events refresh the repository. `navigator.locks` serializes cooperating writes where the browser supports Web Locks. The fallback retains optimistic revision checks but cannot make local storage transactional between simultaneous browser contexts. This is a local demonstration, not a collaborative multi-user backend.

Unreadable collections are not overwritten automatically. The original bytes remain available for recovery download. Resetting requires the original corrupt bytes to still match, so a stale recovery dialog cannot replace a newer collection. Storage denial still permits unsaved exploration, file export and brief download.

Rooms and briefs are limited to 12 each. A saved brief contains a room snapshot, not a live reference, so later room edits or removal cannot alter the brief. Imported and shared rooms receive fresh room/object identifiers and require an explicit save.

## Portable content

Room files carry the format `orqensa-space` and version `1`. Strict Zod schemas reject unsupported fields, unknown versions, duplicate object identifiers, invalid coordinates and invalid geometry. File input is capped at 40 KB; share tokens have a separate size/character limit. Base64url encoding preserves UTF-8 names. Share URLs hold a snapshot rather than a server lookup.

The SVG drawing escapes user text and contains no scripts, external resources or embedded HTML. The plain-text brief accurately states that it has not been sent. No email address, payment detail or contact submission is collected.

## Rendering and motion

The initial route does not import Three.js. The 3D study loads after an explicit view change, uses the same object dimensions/coordinates, caps pixel ratio at 1.5, and renders on demand. The camera projection adapts to the available canvas. Context loss returns the visitor to the intact SVG plan; a rendering exception offers a clear fallback. React Three Fiber owns geometry/material disposal on unmount.

GSAP animations are scoped to each presentation page and reverted on unmount or motion preference change. Image masks, spatial translation and scroll-linked image framing support the editorial rhythm. Text is never made invisible to wait for an animation. System reduced motion takes priority; a global pause preference persists where storage permits it. The interactive editor does not depend on animation.

Reference images have two local WebP sizes. Fonts are hosted from the production bundle. Normal operation makes no runtime request to an image service or API. The optional Three/R3F chunk is approximately 243 KB gzip in the initial verified build; this is a deliberate load-after-interaction cost, not a claimed performance score.

## Routing and inclusion

Hash routing supports direct links on static GitHub Pages. Study filters and list/grid presentation live in query parameters. Navigation updates the document title, scroll position and main-region focus. The first keyboard tab remains the skip link. Dialogs use native focus management and Escape behavior.

The SVG plan exposes named, focusable furniture controls. The 3D view has a descriptive label and does not contain the only editing path. Material/light selections use pressed-state buttons. The brief form associates validation errors with fields. A separate print stylesheet removes navigation and actions from brief output.

Automated axe scans are a regression check, not a certification. Physical-device GPU behavior, Safari/VoiceOver, native print dialogs and full assistive-technology coverage require additional testing. Actual check results belong in [validation.md](validation.md).
