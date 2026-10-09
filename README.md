# ATLAS MAX — No Man's Sky Equipment Optimizer

A standalone fan-created web app that helps players design technology inventory layouts for **No Man's Sky**. No accounts, game-save access, API keys, dependencies, paid services, external fonts, or build tooling are needed.

## Quick start

Extract the ZIP and open `index.html` in a browser, or upload the files to any static web host.

## GitHub Pages deployment

1. Upload **the files inside the extracted folder**, including `index.html`, `styles.css`, `data.js`, `optimizer.js`, `icons.js`, `app.js` and `favicon.svg`, to the root of a GitHub repository.
2. Open the repository's **Settings → Pages**.
3. Choose **Deploy from a branch**, select `main` and `/(root)`, then save.
4. Use the Pages address GitHub displays after publishing.

This app also works on Cloudflare Pages, Netlify, Vercel or any static HTTP server.

## What's new: expanded Exosuit (October 2026)

The Exosuit now has **15 technology groups and 42 individually selectable crafted technologies**, plus separate procedural-module slots. Its catalog is grouped into:

- **Core systems**: Jetpack, Movement Modules, Airburst Engine, Rocket Boots, Efficient Water Jets, Neural Stimulator; Exosuit shields; Life Support, Oxygen Recycler and Oxygen Rerouter; Hazard Protection and Shield Lattice.
- **Environmental protection**: Separate heat, cold, toxic, radiation and underwater systems. Includes Coolant Network, Thermic Layer, Toxin Suppressor, Radiation Deflector, Aeration Membrane and Pressure Membrane, plus each environment's own procedural protection modules.
- **Specialized upgrades**: Forbidden Exosuit Modules (Sentinel-related, optional).
- **Utilities & exploration**: Haz-Mat Gauntlet, Trade Rocket, Nutrient Ingestor, Exo-Skiff, Exocraft Summoning Unit, Archive Bypass Implant, Visceral Synthesiser, Personal Refiner, Personal Refiner Mk 2, Simple/Superior/Advanced/Artemis' Translators.
- **Story / rare tech**: Star Seed, Mark of the Denier, Remembrance, Anomaly Suppressor and Living Lens.
- **Cosmetics**: Sixteen optional Jetpack trail technologies.

The app distinguishes an equipment family's **base technology (CORE)**, **procedurally rolled upgrades (U1–U3)** and **individual named blueprint tech (TECH)**. Blueprint items don't consume the three-module procedural limit. Compatible technology is clustered; unrelated utility and cosmetic items are not awarded imaginary synergy. Star Seed and Remembrance receive a specific, documented adjacency preference if both are included.

Personal Refiner and Personal Refiner Mk 2 are mutually exclusive in the normal loadout planner, as are Star Seed and Mark of the Denier. The app doesn't attempt to model installation exploits or save-editor configurations.

Players can choose one of four Exosuit goals: balanced exploration, mobility, extreme survival, or oceans/fishing. Exosuit profiles default to a 10×6 planner grid; the actual unlocked inventory and supercharged positions still must be matched in-game. **Existing local profiles are preserved**, and older Exosuit configurations are offered the newly introduced categories on reload. No optimization ever runs automatically.

## Core features

- Five equipment categories: Exosuit, Multi-tool, Starship, Freighter and Exocraft.
- Per-equipment loadout goals, technology checkboxes, crafted-blueprint choices, and procedural-module depth.
- Editable locked/unlocked slots, supercharged positions, and technology grid dimensions.
- Explicit **Optimize layout** button; never generates automatically on load or when selecting settings.
- A placement solver favoring compatible cardinal adjacency and higher-priority supercharged modules, with manual tile swaps.
- Browser-local saved profiles, JSON import/export, copyable text build and personalized equipment names.
- Offline SVG icons for every equipment group and its technology components, including individual crafted blueprint icons.

## Important limits

**ATLAS MAX is a planning tool**, not an exact game-stat calculator. Its layout score is a heuristic: it does **not** claim to calculate real DPS, jetpack capacity, shielding, environmental survival duration, scanning reward, or hidden synergy percentage. The values of individual procedural module rolls are not imported. Upgrade numbering (U1, U2, U3) is just a planning placeholder, with U1 reserved for the player's strongest roll.

The model awards adjacency only within known conceptual technology groups and for the explicitly verified Star Seed / Remembrance pair. In-game bonuses can be more nuanced than this model. Players should verify the arrangement, in-game outlines, exact stats and module limits before applying a build. Story and rare tech may not be available to every save.

Default supercharged positions are **examples**, not reliable coordinates for your inventory. Select **Clear SC**, then mark the actual locations you see in-game.

Other equipment categories still have intentionally smaller catalogs; this release's completeness expansion focuses on the Exosuit.

## Sources and maintenance

The app's displayed patch reference was **Cosmos 7.06** when this version was prepared (October 9, 2026). Review the [Hello Games release log](https://www.nomanssky.com/release-log/) for changes to technology and slots.

Catalog cross-checks: [NMS Resources Exosuit Blueprints](https://www.nomansskyresources.com/exosuit-blueprints), [No Man's Sky Exosuit technology overview](https://nomanssky.fandom.com/wiki/Exosuit), [NMS Resources Remembrance](https://www.nomansskyresources.com/exosuit-blueprints/remembrance), [Hello Games Aquarius update](https://www.nomanssky.com/2024/09/aquarius-update/), and [Worlds Part II update](https://www.nomanssky.com/worlds-part-ii-update/).

To edit catalog entries, use `data.js`; the scorer is `optimizer.js`, controls and persistence are `app.js`, SVG artwork is in `icons.js` and appearance is in `styles.css`. The icons are original generic representations and are not copies of proprietary No Man's Sky artwork.

## Tests

Run `node --test tests/*.cjs` with Node.js. Nothing needs to be installed with npm.

## Disclaimer

Unofficial fan project. Not affiliated with or endorsed by Hello Games. All trademarks belong to their respective owners.
