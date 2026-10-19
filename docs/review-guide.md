# Code walkthrough

Use this guide to understand the implementation, make a small change and explain the decisions from the source. A live walkthrough is more useful than memorizing a feature list.

## Follow one complete interaction

Open the material library, choose Fine terrazzo and Sage, and enter the lab. The pairing is represented by query parameters and validated before becoming the draft room. Rename the room, save it, move a chair with the keyboard, then undo that move and reload. The persisted arrangement should match the last successful change.

Start at `pages/Materials.tsx`, follow the parameters into `pages/Lab.tsx`, and then follow a command through `components/RoomEditor.tsx`, `domain/scene.ts` and `domain/repository.ts`. The React view subscribes to repository changes through `state/CollectionProvider.tsx`.

## Explain the model

Positions are measured in metres, not CSS pixels. The SVG and Three.js views project the same scene. A furniture catalogue defines size; a right-angle rotation changes the collision footprint. Pointer movement is a temporary preview until pointer-up commits a validated command. That split avoids writing storage for every pointer frame.

Try changing the desk width in the catalogue. Inspect how both views and placement validation respond, then run the unit tests. Explain why a real architectural planner would need door clearances, irregular geometry, accessibility rules and more precise models than this demonstration.

## Explain persistence and failures

The repository validates stored data before it reaches the editor. A collection generation/revision and scene revision detect stale changes. Successful persistence happens before React receives a new saved snapshot. Read the quota-failure and stale-revision tests, then explain what the visitor sees when those operations fail.

Open the saved room in two tabs and change its material. The other tab should refresh and disable history from the older version. Web Locks coordinate cooperating writers where supported; local storage alone cannot guarantee atomic writes between simultaneous contexts. A shared room is a portable snapshot with new identifiers, not a collaborative document.

## Explain the visual choices

The visual system uses large Manrope typography, small monospaced annotations, bone/charcoal/cobalt colours and asymmetric photography. Spacing, contrast and a restrained set of motion patterns carry the hierarchy. Reference photographs are credited and separated from fictional project narratives.

Inspect `components/PageMotion.tsx`: the animation scope is reverted on route unmount and motion changes. Text remains readable before animation. The system preference and the visitor’s pause control provide a complete static path through the presentation.

## Explain progressive rendering

Switch from the plan to the 3D study. Three.js loads on request and renders on demand, with a capped pixel ratio. The SVG view remains the full editing path if WebGL is unavailable or lost. The camera and renderer have explicit lifecycle responsibilities; the domain model has none.

The 3D chunk is a measurable cost. A next iteration could reduce it with a narrower renderer/model strategy, but should retain the independent plan workflow. There is no performance-score claim in this release.

## Explain verification honestly

Unit tests cover domain invariants and persistence failures. Browser scenarios exercise user flows, reloads, downloads, cross-tab behavior, focus, layout bounds and representative axe checks in three browser profiles. Passing automation does not establish full assistive-technology or physical-device GPU coverage. Use the actual commit/run evidence in `validation.md` when describing results.
