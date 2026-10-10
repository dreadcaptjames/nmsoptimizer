# ATLAS MAX

**A No Man’s Sky equipment and technology optimization companion**

ATLAS MAX is an unofficial, browser-based planning tool for players who want to make better use of their equipment technology slots. It helps you explore upgrade combinations, organize technology around adjacency bonuses, decide what belongs in supercharged slots, and compare possible layouts before recreating them in the game.

It combines a No Man’s Sky-inspired inventory workbench with a streamlined dashboard. Everything is designed for manual, player-controlled experimentation: **changing a setting or selecting a blueprint never generates a new layout on its own.**

## What you can plan

| Equipment | What ATLAS MAX helps you explore |
| --- | --- |
| **Exosuit** | Movement, jetpack systems, life support, shields, environmental protection, underwater equipment, and utilities. |
| **Multi-tool** | Mining, scanning, weapons, defensive tools, and specialist upgrades. |
| **Starship** | Flight systems, launch efficiency, weapons, defenses, hyperdrives, and utility technology, including supported Sentinel Interceptor systems. |
| **Freighter** | Warp technology, expedition-related upgrades, and onboard utilities. |
| **Exocraft** | Separate layouts for the Roamer, Nomad, Pilgrim, Colossus, Minotaur, and Nautilon, with vehicle-appropriate technology. |
| **Corvette** | A modular construction workshop linked directly to a technology grid, with supercharged-slot and adjacency-aware planning. |

The technology catalogs include named crafted upgrades and procedural module families, rather than treating every system as a generic upgrade.

## What the app does

### Build a layout that matches your equipment

- Set up an editable technology-slot grid, including locked slots and the supercharged positions found in your own inventory.
- Choose technology families and individual blueprints from searchable, collapsible lists.
- Rearrange an existing layout using drag-and-drop on desktop or tap/click-to-swap controls.
- Review individual technologies in the inspector alongside the overall layout.

### Optimize for your priorities

- Choose a goal suited to the equipment, such as movement, combat, exploration, or travel.
- Generate a suggested arrangement **only when you explicitly choose Optimize layout**.
- **Fill supercharged slots according to your chosen goal first:** prioritize as many eligible modules from the highest-ranked family as are useful and available, then continue to the next family if purple slots remain.
- Arrange the remaining technology around those supercharged assignments to improve compatible orthogonal adjacency.
- Inspect which technologies occupy supercharged slots and view their *relative planning contribution*.
- Distinguish core technology, crafted blueprints, and procedural upgrades; enforce supported procedural module limits and selected incompatibilities.

### Plan Corvettes in two ways

**Corvette Workshop** provides a curated catalog of structural and functional modules, quantity selection, a conceptual front/middle/rear schematic, build-goal starter plans, and a checklist of essential part types. Starter manifests appear only after you request one.

**Corvette Technology Optimizer** now mirrors functional construction modules in the technology grid as soon as they are added to the Corvette manifest. Reactor types, weapon arrays, engines, shields, landing systems, cockpit, and relevant habitation modules can produce individual construction-linked technology tiles. Additional physical copies beyond each supported tech contribution are tracked as non-tech copies; purely decorative and interior parts do not create technology tiles. These construction tiles are reserved in the grid before optional rolled starship upgrades.

Each linked construction tile records the physical part that created it and the related ship system. For example, Zenith reactors are related to hyperdrive range, Medusa to maneuverability, Azimuth to recharge, and Ceto to defensive systems. Such functional relationships **do not by themselves prove an adjacency bonus**, so the planner visibly distinguishes modeled adjacency connections from relationships that have not been established as adjacency effects. Construction order, Corvette class, available technology space, and current game behavior may affect the actual inventory.

**Adding or removing a Corvette part immediately updates its modeled technology tile(s)** while preserving existing manual slot coordinates when possible. It never silently runs full optimization: press **Optimize Corvette tech** to rearrange the entire matrix based on your supercharged positions, chosen goal, and same-family adjacency. The Corvette planner still includes manually selected shared starship technology and crafted upgrades, separately from construction modules.

### Keep and revisit your builds

- Work with independent equipment layouts and individual Exocraft models during the current visit. Every new page load starts from the default presets.
- **Export your work as JSON before leaving**, and manually import an exported file when you want to resume a previous build.
- Use the responsive workbench on desktop and smaller screens.
- Browse without an account or a connection to the game; the interface and its icons are self-contained.

## What ATLAS MAX does *not* do

**ATLAS MAX is a planning aid, not an in-game stat simulator or save editor.** Its optimization score is a relative heuristic for comparing possible placements. It is **not** an exact calculation of damage per second, hyperdrive range, shields, maneuverability, jetpack performance, or the random rolls on installed upgrades. Players should compare recommendations against their actual module stats in-game.

In particular:

- It **does not** read, edit, or sync No Man’s Sky save files or inventories.
- It **does not** automatically know your unlocked slots, supercharged positions, owned blueprints, installed modules, or upgrade rolls; you supply those details.
- It **does not** guarantee the strongest possible numerical build for every real-game situation.
- It **does not** automatically regenerate a layout when you change checkboxes, equipment, goals, or slot positions.
- The Corvette schematic **does not** simulate full 3D placement, snapping, collision, ship dimensions, or workshop validation. Its essential-parts checklist is a planning check, not proof that a ship can be built exactly as drawn.
- Corvette construction-to-technology mappings are **planning approximations**, not a direct readout of your in-game inventory. Some parts compete for tech slots, and installation order, class caps and game updates/bugs can change what is shown. Check the Corvette's actual technology inventory after construction.
- A Corvette reactor's effect on flight statistics **does not imply adjacency synergy** with the corresponding starship system. Unverified relationships are labeled as functional links and are not scored as adjacency bonuses.
- The Corvette construction catalog is **curated rather than exhaustive**; it does not include every cosmetic, decorative, or structural part.
- It **does not** provide a dedicated Living Ship organic-technology optimizer.
- Some upgrades are mission-, expedition-, ship-, or progression-specific. Catalog availability does not mean an item is currently obtainable in every save.

## Player control and data

**ATLAS MAX always starts fresh.** Opening or refreshing the page restores the default settings for all six equipment categories; it does not automatically reload a previous build. While the page is open, switching equipment categories retains your changes within that visit. To keep a build between visits, use **Export** to download a JSON file and **Import** to load that file manually later. If you close or refresh the page before exporting, you should expect to start over. Nothing is uploaded to an ATLAS MAX account or game service.

The app's illustrated icons are original, game-inspired interface artwork, not official No Man’s Sky inventory icons.

## About this project

ATLAS MAX is an **unofficial fan-made companion** and is not affiliated with, sponsored by, or endorsed by Hello Games. No Man’s Sky names are used to identify the in-game systems being discussed.

For official game changes and patch information, see the [No Man’s Sky release log](https://www.nomanssky.com/release-log/).
