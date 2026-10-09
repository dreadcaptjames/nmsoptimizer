# ATLAS MAX — Hybrid Command Deck (Version 1.4, October 2026)

ATLAS MAX is an unofficial, self-contained **No Man’s Sky equipment-layout planner**. This release keeps the complete five-category technology catalog and optimization engine from Version 1.3, and adds a redesigned **No Man's Sky-inspired + premium futuristic** technology workbench.

There is **no npm install, internet connection, account, API key, or build step**. The browser saves profiles locally. A copy of the game or a save-file connection is not required to explore the planner.

## Install / update

1. Extract the complete ZIP.
2. Open `index.html` in a browser, or upload **all files** to the root of your GitHub Pages repository (including the new `catalog-expanded.js`).
3. If using GitHub Pages, open **Settings → Pages**, set **Deploy from a branch** and select `main` / `/(root)`.
4. Existing profiles in the same browser's local storage are loaded and retained, with newly added default systems made available where appropriate. Imported/exported JSON loadouts are supported.

**Important:** Do not upload only `index.html` or omit `catalog-expanded.js`. It is the additional, required data catalog that expands the other equipment types. You can replace all files from this ZIP over the previous website files.

## What's new in Version 1.4 — visual redesign

- **Horizontal equipment navigation** for Exosuit, Multi-tool, Starship, Freighter and Exocraft. All original technologies, family counts and six separate Exocraft saves are preserved.
- **Three-column desktop layout:** loadout settings and searchable technology library on the left; larger technology grid and workflow controls in the center; live module inspection, progress, briefing and technology plan on the right.
- **More expressive technology tiles:** color-coded SVG illustrations, class markers, clear core/rolled/crafted labels, purple supercharged glow, locked slots, active selections and glowing same-family adjacency-edge indicators. The highlights follow the existing scoring rules, including the special Star Seed/Remembrance pair and blueprint exceptions.
- **Drag-and-drop technology swaps** on desktop. The original two-click/tap swap flow remains available, including on touchscreens. Changes mark the arrangement as needing review; they never auto-run the optimizer.
- **Searchable technology catalog** for large groups and blueprints. Search only filters what appears in the list; it never unchecks technologies or edits saved profiles.
- **Mobile layout** with expandable Settings and Build Intelligence panels, larger touch areas and horizontally scrollable grids. The technology list stays navigable on narrow screens.
- **Refined activity and status indicators:** selected goal, class, placed technology count, open-slot utilization, adjacency-link count, supercharged positions and relative planning score.

**Save compatibility:** This is a presentation/interface upgrade, not a data migration. The profile storage key, JSON export format, optimizer algorithm, named catalogs and existing save behavior are unchanged. On your own device/browser, existing saved profiles should appear automatically when you replace the files. Back up using **Export** first as good practice.

## Expanded equipment sections

### Multi-tool

Individual tech for **Scanner**, **Analysis Visor**, **Survey Device**, **Waveform Recycler**, **Autophage detectors**, **Mining Beam**, **Optical Drill**, **Advanced Mining Laser**, **Plasma Resonator**, **Terrain Manipulator**, **Boltcaster**, **Neutron Cannon**, **Pulse Spitter**, **Scatter Blaster**, **Blaze Javelin**, **Paralysis Mortar**, **Voltaic Amplifier**, **Plasma Launcher**, **Geology Cannon**, **Cloaking Device**, **Personal Forcefield**, **Combat Scope**, **Gravitino Coil** (Remnant, 2026), and optional special Sentinel upgrades. The five primary weapon families have their own crafted support parts and module slots.

### Starship

Separate weapon families for **Photon Cannon**, **Phase Beam**, **Positron Ejector**, **Infra-Knife**, **Cyclotron Ballista**, and **Rocket Launcher**. Flight systems have named blueprints including **Launch Auto-Charger**, **Efficient Thrusters**, **Aqua Jets**, **Sub-Light Amplifier**, **Flight Assist Override**, **Photonix Core**, and **Ablative Armour**. Hyperdrive color progression includes **Cadmium**, **Emeril**, **Indium**, and **Atlantid Drive** (purple systems). Utility options include **Economy Scanner**, **Conflict Scanner**, **Teleport Receiver**, **Cargo Scan Deflector**, and **Emergency Warp Unit**.

**Sentinel Interceptor cores** are also available as optional special technology: **Anti-Gravity Well**, **Luminance Engine**, **Crimson Core**, **Aeron Shield**, **Sentinel Cannon**, and **Pilot Interface**. The optimizer will *not* place the ordinary core technology if you also select the Sentinel replacement for that core system; it retains the regular procedural module slots. It does not invent a cross-family adjacency modifier. **Vesper Sail** is marked as Solar-only. This app does not yet model Living Ship organic technology or Corvette construction; they follow different rules from normal technology grids.

### Freighter

**Freighter Hyperdrive** plus rolled modules and independently selectable **Warp Core Resonator**, **Plasmatic Warp Injector**, **Reality De-threader**, **Amplified Warp Shielding**, **Chromatic Warp Shielding**, **Temporal Warp Computer**, and **Resonance Matrix**. Expedition types are distinct: **Combat & Defence**, **Exploration & Scientific**, **Trade**, **Industrial & Mining**, **Fuel Efficiency**, and **Expedition Speed**. Utilities include **Matter Beam**, **Interstellar Scanner**, and special/quest technology including **Singularity Engine**. Optional **freighter trails** are treated as cosmetic, without invented stat adjacency. *Fleet Command Rooms are base construction and are deliberately not included as installable grid technology.*

### Exocraft (now six independent profiles)

Use the **Exocraft model** selector to choose one vehicle. Each vehicle has independent grid dimensions, supercharged positions, optional technologies, saved loadout, and optimization result. Switching back restores the earlier model's build; nothing regenerates automatically.

- **Roamer, Nomad, Pilgrim, Colossus:** Fusion Engine, Boost, Suspension, Exocraft Radar, dedicated mining and mounted weapons, hazard defenses, optional tools. **Mineral Processing Rig** is shown only for **Colossus**.
- **Minotaur:** Daedalus Engine, jumpjets, dedicated Minotaur Laser and Cannon, Flamethrower, Minotaur Radar Array, AI Pilot, optional Sentinel Hardframe equipment.
- **Nautilon:** Humboldt Drive, Osmotic Generator, Tethys Beam, Dredging Laser, Nautilon Cannon, High-Power Sonar, and their applicable rolled modules.

The catalog suppresses technologies from other vehicle types. **Icarus Fuel System** is treated as crafted technology, and is not awarded an adjacency bonus where its implementation does not provide one.

### Exosuit

The existing 15-category expanded Exosuit remains intact, including environmental protection by hazard type, jetpack enhancements, oxygen, underwater equipment, rare upgrades, story technologies and utilities.

## Optimization rules / limitations

- Select equipment, choose a goal, check technology groups and individual blueprints, and mark your real supercharged positions.
- **Only clicking Optimize layout generates a build**; changing the focus or other settings marks previous output for review, rather than silently rerolling a layout.
- Base technology is **CORE**, procedural upgrades are **U1 / U2 / U3**, and crafted, named items are **TECH**.
- Procedural upgrades are capped at three per family; crafted upgrades do **not** consume those slots.
- Known incompatibilities are handled conservatively, including ordinary vs. Sentinel Interceptor core replacements and mutually exclusive refiners in the Exosuit.
- The heuristic prioritizes same-family orthogonal adjacency and goals / supercharged slots. It is **not** a prediction of real-game DPS, warp range, shield strength or randomized module rolls.
- The app has no access to actual No Man's Sky save-file data. Its example supercharged locations are **illustrative**, not your inventory. Select **Clear SC** and mark your actual locations.
- Some technologies are obtained from expeditions, missions, special ships or later progression. Select only blueprints appropriate for your save and ship.
- A vehicle, ship or freighter may have fewer installed/unlocked positions than the default planner grid. Match the real dimensions and lock unusable slots.

## Project files

- `index.html` — page shell / load order (includes `catalog-expanded.js`)
- `data.js` — original database with fully expanded Exosuit and default game reference links
- `catalog-expanded.js` — expanded Multi-tool, Starship, Freighter and Exocraft databases
- `icons.js` — offline SVG component icon designs
- `optimizer.js` — placement scoring, capacity handling, crafted-component assembly
- `app.js` — redesigned UI, module inspection, technology search, drag/drop, profile migration, per-model Exocraft saves, JSON import/export
- `styles.css` — full hybrid command-deck visual system and responsive styling
- `favicon.svg` — site identity
- `tests/` — Node.js regression tests

Run the checks with `node --test tests/*.cjs` (no dependencies). The packaged release passed all **26** automated tests. A local browser screenshot check did not complete in the environment, so automated testing is not a claim of full visual/browser compatibility.

## Sources and references

Use the [official Hello Games release log](https://www.nomanssky.com/release-log/) to confirm patch changes. Cross-checked named technologies against [Multi-tool Blueprints](https://www.nomansskyresources.com/multi-tool-blueprints), [Starship Blueprints](https://www.nomansskyresources.com/starship-blueprints), [Freighter Blueprints](https://www.nomansskyresources.com/freighter-blueprints), [Exocraft Blueprints](https://www.nomansskyresources.com/exocraft-blueprints), the [Remnant update](https://www.nomanssky.com/2026/02/no-mans-sky-remnant/), and the [Interceptor update](https://www.nomanssky.com/interceptor-update/).

**Unofficial fan work.** Not affiliated with or endorsed by Hello Games. Names are used to describe in-game systems, and artwork is original generic vector illustration.
