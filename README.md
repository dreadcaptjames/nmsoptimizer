# ATLAS MAX — Hybrid Command Deck + Corvette Supercharged Fix (Version 1.6, October 2026)

ATLAS MAX is an unofficial, self-contained **No Man’s Sky equipment-layout planner**. This release preserves all six equipment categories, expanded technology catalogs and the Corvette assembly workshop while fixing how supercharged slots affect module selection, priority, and placement. Corvettes also have an independent supercharged-technology grid below the physical construction planner.

There is **no npm install, internet connection, account, API key, or build step**. The browser saves profiles locally. A copy of the game or a save-file connection is not required to explore the planner.

## Install / update

1. Extract the complete ZIP.
2. Open `index.html` in a browser, or upload **all files** to the root of your GitHub Pages repository (including `catalog-expanded.js`, `corvette.js` and `corvette.css`).
3. If using GitHub Pages, open **Settings → Pages**, set **Deploy from a branch** and select `main` / `/(root)`.
4. Existing profiles in the same browser's local storage are loaded and retained, with newly added default systems made available where appropriate. Imported/exported JSON loadouts are supported.

**Important:** Do not upload only `index.html` or omit any referenced `.js`/`.css` file. The expanded catalogs and Corvette section require their separate supporting files. You can replace all files from this ZIP over the previous website files.

## What's new in Version 1.6 — Supercharged Slots Fix

- **Meaningful optimization:** The solver now seeds the marked purple coordinates with the best eligible module candidates before refining adjacency. The supercharged contribution is weighted more heavily than small adjacency changes, so it materially affects decisions instead of behaving like decoration.
- **Clear proof in the interface:** Purple technology tiles with modeled performance benefit glow more prominently and show their relative `+SC` planning points. The right-hand briefing lists each SC position, the technology placed there, and SC-vs-adjacency planning scores. It distinguishes useful SC occupancy from simply filling a purple square.
- **No misleading stat claims:** These numbers are *ranking heuristics*, not No Man's Sky damage/range/maneuverability percentages. The first rolled module (U1) is treated as the best actual roll; U2 and U3 are progressively less-preferred placeholders. Check your exact stats in-game and swap the upgrade order as necessary.
- **Corvette tech matrix:** The Corvette page has a separate technology grid after the construction checklist. Choose the relevant shared starship technologies, mark your Corvette's real purple slot coordinates, and select **Optimize Corvette tech** to generate and compare arrangements. It does not invent a direct mapping between a physical hull part and an inventory technology tile. Structural manifests and technology layouts save separately inside the Corvette profile.
- **Manual editing stays manual:** Marking purple slots, moving tiles, changing goals, or switching class *never auto-runs* either optimizer. Re-select **Optimize layout** or **Optimize Corvette tech** to apply new priorities. Older loadouts remain in local storage; older Corvette saves receive a blank tech matrix without disrupting construction modules.

### How to use the fix

1. Open your existing equipment category. For Corvette, scroll to **Corvette technology optimizer** below the construction planner.
2. Set the grid dimensions, mark only unlocked technology slots, and mark the **actual** supercharged positions you see in-game (the original equipment demo markers are not your real positions).
3. Select **Optimize layout** or **Optimize Corvette tech**. Review each purple slot's installed technology and relative SC priority, and compare your real module rolls in-game.

**Scope:** Corvette structural modules, their exact technology side effects, and any game-generated bonus multipliers are not simulated. Shared starship technologies are exposed as editable planning choices, not inferred from the Corvette's hull. The SC heuristic does not replace testing actual results on your save.

## What's new in Version 1.5 — Corvette Workshop

- **Sixth equipment tab, Corvette:** separate construction planner, built for Corvette modules instead of incorrectly using the ordinary starship grid.
- **48 curated named Corvette modules**, grouped into cockpits, habitation, access and landing, reactors, engines, weapons, defensive systems, wing/structural parts, external utilities, and interior amenities. This is a practical starter library, **not** a complete inventory of every decorative and structural Corvette part in the game.
- **Manual quantities** and selection inspector, including a single-cockpit rule, conceptual **fore/mid/aft** assignment, and an exterior-vs-interior tally.
- **Seven required part groups** checklist for cockpit, hab, access, landing, reactor, main engine, and weapon. Passing this checklist **does not** validate physical attachment/snap rules or other construction restrictions in the actual game.
- **Five goal-based starting manifests**: balanced explorer, combat, long-range travel, mobile crew base, and salvage specialist. Design variations include Titan, Thunderbird, Ambassador and Mixed styles. The generated starter plan is explicitly requested, never automatic.
- **Current utility:** the **Tractor Beam** introduced with the Cosmos update; certain expedition-only parts are labeled accordingly.
- **Save/export compatibility:** the same `atlas-max-v1` localStorage and JSON structure are retained. Existing users get a fresh, empty Corvette profile while the five previous loadouts remain intact. Import and export include the new Corvette manifest automatically.
- **Mobile-ready** Corvette workshop plus SVG module glyphs. The schematic is deliberately a visual *planning map*, not a 3D hull designer or a numerical stat calculator.

The official [Voyagers release notes](https://www.nomanssky.com/voyagers-update/) explain why Corvettes need a separate system: modular hulls, living quarters and functional modules can affect stats. [Cosmos](https://www.nomanssky.com/cosmos-update/) added the Corvette Tractor Beam. The part catalog is an intentionally limited selection cross-checked with [NMS Resources' Corvette parts index](https://www.nomansskyresources.com/corvette-parts).

## Hybrid interface retained from Version 1.4

- **Horizontal equipment navigation** for Exosuit, Multi-tool, Starship, Freighter, Exocraft, and Corvette. All original technologies, family counts and six separate Exocraft saves are preserved.
- **Three-column desktop layout:** loadout settings and searchable technology library on the left; larger technology grid and workflow controls in the center; live module inspection, progress, briefing and technology plan on the right.
- **More expressive technology tiles:** color-coded SVG illustrations, class markers, clear core/rolled/crafted labels, purple supercharged glow, locked slots, active selections and glowing same-family adjacency-edge indicators. The highlights follow the existing scoring rules, including the special Star Seed/Remembrance pair and blueprint exceptions.
- **Drag-and-drop technology swaps** on desktop. The original two-click/tap swap flow remains available, including on touchscreens. Changes mark the arrangement as needing review; they never auto-run the optimizer.
- **Searchable technology catalog** for large groups and blueprints. Search only filters what appears in the list; it never unchecks technologies or edits saved profiles.
- **Mobile layout** with expandable Settings and Build Intelligence panels, larger touch areas and horizontally scrollable grids. The technology list stays navigable on narrow screens.
- **Refined activity and status indicators:** selected goal, class, placed technology count, open-slot utilization, adjacency-link count, supercharged positions and relative planning score.

**Save compatibility:** The profile storage key, JSON export format, named catalogs and existing save behavior remain compatible. The SC solver was improved and the Corvette profile gained an optional technology subsection. On your own device/browser, existing saved profiles should appear automatically when you replace the files. Back up using **Export** first as good practice.

## Expanded equipment sections

### Multi-tool

Individual tech for **Scanner**, **Analysis Visor**, **Survey Device**, **Waveform Recycler**, **Autophage detectors**, **Mining Beam**, **Optical Drill**, **Advanced Mining Laser**, **Plasma Resonator**, **Terrain Manipulator**, **Boltcaster**, **Neutron Cannon**, **Pulse Spitter**, **Scatter Blaster**, **Blaze Javelin**, **Paralysis Mortar**, **Voltaic Amplifier**, **Plasma Launcher**, **Geology Cannon**, **Cloaking Device**, **Personal Forcefield**, **Combat Scope**, **Gravitino Coil** (Remnant, 2026), and optional special Sentinel upgrades. The five primary weapon families have their own crafted support parts and module slots.

### Starship

Separate weapon families for **Photon Cannon**, **Phase Beam**, **Positron Ejector**, **Infra-Knife**, **Cyclotron Ballista**, and **Rocket Launcher**. Flight systems have named blueprints including **Launch Auto-Charger**, **Efficient Thrusters**, **Aqua Jets**, **Sub-Light Amplifier**, **Flight Assist Override**, **Photonix Core**, and **Ablative Armour**. Hyperdrive color progression includes **Cadmium**, **Emeril**, **Indium**, and **Atlantid Drive** (purple systems). Utility options include **Economy Scanner**, **Conflict Scanner**, **Teleport Receiver**, **Cargo Scan Deflector**, and **Emergency Warp Unit**.

**Sentinel Interceptor cores** are also available as optional special technology: **Anti-Gravity Well**, **Luminance Engine**, **Crimson Core**, **Aeron Shield**, **Sentinel Cannon**, and **Pilot Interface**. The optimizer will *not* place the ordinary core technology if you also select the Sentinel replacement for that core system; it retains the regular procedural module slots. It does not invent a cross-family adjacency modifier. **Vesper Sail** is marked as Solar-only. This app does not yet model Living Ship organic technology. Corvette construction now has its own separate Workshop tab rather than pretending Corvette parts follow the ordinary starship technology-grid rules.

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
- **Only clicking Optimize layout generates a technology-grid build** (or **Generate starter plan** for Corvette); changing the focus or other settings marks previous output for review, rather than silently rerolling a layout.
- Base technology is **CORE**, procedural upgrades are **U1 / U2 / U3**, and crafted, named items are **TECH**.
- Procedural upgrades are capped at three per family; crafted upgrades do **not** consume those slots.
- Known incompatibilities are handled conservatively, including ordinary vs. Sentinel Interceptor core replacements and mutually exclusive refiners in the Exosuit.
- The heuristic prioritizes same-family orthogonal adjacency and goals / supercharged slots. It is **not** a prediction of real-game DPS, warp range, shield strength or randomized module rolls.
- The app has no access to actual No Man's Sky save-file data. The Corvette planner makes no claims to predict exact physical attachment, hull dimensions, module-roll stats, or game-calculated maneuverability. Its example supercharged locations are **illustrative**, not your inventory. Select **Clear SC** and mark your actual locations.
- Some technologies are obtained from expeditions, missions, special ships or later progression. Select only blueprints appropriate for your save and ship.
- A vehicle, ship or freighter may have fewer installed/unlocked positions than the default planner grid. Match the real dimensions and lock unusable slots.

## Project files

- `index.html` — page shell / load order (includes `catalog-expanded.js` and `corvette.js`)
- `data.js` — original database with fully expanded Exosuit and default game reference links
- `catalog-expanded.js` — expanded Multi-tool, Starship, Freighter and Exocraft databases
- `corvette.js` — curated Corvette construction catalog, profile data, preset manifests, and checklist logic; its technology grid is handled in `app.js` with the shared starship technology catalog
- `corvette.css` — Corvette command-workbench styling, including its responsive schematic
- `icons.js` — offline SVG component icon designs
- `optimizer.js` — placement scoring, capacity handling, crafted-component assembly
- `app.js` — redesigned UI, module inspection, technology search, drag/drop, profile migration, per-model Exocraft saves, JSON import/export
- `styles.css` — full hybrid command-deck visual system and responsive styling
- `favicon.svg` — site identity
- `tests/` — Node.js regression tests

Run the checks with `node --test tests/*.test.cjs` (Node.js only). This release passes **40 automated regression tests**, including 8 new tests for supercharged weighting, edited coordinates, Corvette technology layout, persistence and reset. The previous release had interactive Chromium coverage; this release has **not** passed a separate Chromium screenshot check in the current environment, so visually review it on your deployed site.

## Sources and references

Use the [official Hello Games release log](https://www.nomanssky.com/release-log/) to confirm patch changes. Cross-checked named technologies against [Multi-tool Blueprints](https://www.nomansskyresources.com/multi-tool-blueprints), [Starship Blueprints](https://www.nomansskyresources.com/starship-blueprints), [Freighter Blueprints](https://www.nomansskyresources.com/freighter-blueprints), [Exocraft Blueprints](https://www.nomansskyresources.com/exocraft-blueprints), the [Remnant update](https://www.nomanssky.com/2026/02/no-mans-sky-remnant/), and the [Interceptor update](https://www.nomanssky.com/interceptor-update/).

**Unofficial fan work.** Not affiliated with or endorsed by Hello Games. Names are used to describe in-game systems, and artwork is original generic vector illustration.
