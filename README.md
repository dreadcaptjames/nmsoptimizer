# ATLAS MAX — No Man's Sky Equipment Optimizer

A standalone fan-made website for optimizing technology layouts in **No Man's Sky**. No accounts, server, external libraries, build step, tracking, save file integration or paid APIs are needed.

## Quick start

Open `index.html` in a browser, or publish this directory as a static website. Every file is included in the project.

## Publish on GitHub Pages

1. Create a GitHub repository and upload **all files from inside this folder** into its root directory. Include `index.html`, `styles.css`, `data.js`, `optimizer.js`, `app.js` and `favicon.svg`.
2. In the repository, open **Settings → Pages**.
3. Set **Build and deployment** to **Deploy from a branch**, choose `main` and `/(root)`, and save.
4. Visit the GitHub Pages URL shown in the Pages settings once GitHub has published it.

This website also works on Cloudflare Pages, Netlify, Vercel static hosting, or any regular web server. It does not need Node at runtime.

## What it does

- Five equipment categories: Exosuit, Multi-tool, Starship, Freighter and Exocraft.
- Loadout goals, manually selected technology families, module counts and upgrade targets.
- Editable unlocked/locked inventory slots, actual supercharged positions, and grid dimensions.
- An explicit **Optimize layout** button; no automatic generation on load or when settings change.
- A heuristic placement solver that rewards adjacent related tech and supercharged priority for the player's selected purpose.
- Manual tile swapping after optimization.
- Per-equipment browser-local persistence, JSON profile export/import, and copyable text layouts.
- Descriptions and next-step notes describing why technologies support the selected playstyle.

## What it does *not* do

This is a planning tool, not an emulator of the game's hidden stat calculations. Its **Layout score is a heuristic**, not a prediction of exact DPS, scan rewards, maneuverability, mining speed, shield strength, warp range, or synergy percentage. Procedural upgrade stats vary by roll and are not imported. U1 is reserved as a placeholder for the player's strongest real module roll. Example supercharged positions are **not** the positions of a user's equipment and need to be replaced with the user's actual grid.

Some crafted blueprints, specialist hazards, living ship technology, staff-specific features, vehicle-specific modules and Corvette functional hull modules are not yet represented as individual items. The built-in catalog is deliberately conservative rather than treating all of those as interchangeable systems.

## Information sources and maintenance

Reference patch at authoring: **Cosmos 7.06**, according to the [official Hello Games release log](https://www.nomanssky.com/release-log/) on October 9, 2026.

Read the [NMS Resources technology layout guide](https://www.nomansskyresources.com/tech-layout-and-adjacency-bonus) and [upgrade module guide](https://www.nomansskyresources.com/guide-pages/upgrade-modules) for module and adjacency mechanics. Review the catalog against new Hello Games releases as the game evolves.

- To edit item names, descriptions or role priorities, edit `data.js`.
- To change optimization heuristics, edit `optimizer.js`.
- To change interaction or persistence, edit `app.js`.
- To edit the appearance, edit `styles.css`.

## Testing

From a computer with Node installed, run `node --test tests/optimizer.test.cjs`. No packages need to be installed.

## Disclaimer

Unofficial No Man's Sky fan project. Not affiliated with or endorsed by Hello Games. Game and product names belong to their respective owners.
