# No Man’s Sky: FORSAKEN 7.10 — ATLAS MAX update

Updated October 28, 2026. Source: [Hello Games — official 7.10 notes](https://www.nomanssky.com/forsaken-update/), [Hello Games announcement](https://www.nomanssky.com/2026/10/no-mans-sky-forsaken/).

## Included in this web app

- Added Vantage-Class, Hornet-Class, Viper-Class and Mantis-Class cockpit families to the Corvette catalog. Official notes state **three variants each for Hornet, Viper, and Mantis**. Their entries are `Variant 1–3` for planning convenience; these are **not official unique variant names**.
- Added a Legion-Class interior planning entry. The game describes cruiser-style habitation/interior modules; it is modeled as interior furnishings, not a functional technology/adjacency item.
- Added two **explicit generic placeholders**, Forsaken Hab and Biomechanical Hull, so newly confirmed unnamed hab/structure modules can be represented while exact inventory names are checked. These placeholders are **not** an exhaustive inventory catalog, do **not** imply confirmed snap connections, are **not** counted as required functional hab tech, and do **not** create tech tiles.
- Added Forsaken Corvette design family and a courier-planning focus. The starter plan intentionally mixes verified pre-existing functional modules with the new cockpit/hull placeholders, and requires explicit Generate action. Courier missions require a Corvette and a **Gravitino Coil**; the coil is not modeled as a Corvette construction piece.
- Added in-app acquisition instructions for haunting mementos and Forsaken traders, plus official notes links.
- Added a Multi-Tool note about the Larva Cannon (a purchasable living Multi-Tool, **not** a separately installable weapon upgrade). Existing weapon and utility optimization remains the correct use of that workbench.
- Updated the release reference label to Forsaken 7.10.

## October 28 Corvette catalog audit and expansion

The initial Forsaken build contained a curated *subset* of older Corvette modules, making many established parts impossible to plan. This release adds **119 named historical catalog entries** across hull connectors, exterior fairings/plating, additional thruster and wing shapes, cargo racks, windows, attachments and interior accessways. The part names were cross-checked against [No Man's Sky Resources Corvette directory](https://www.nomansskyresources.com/corvette-parts) and [No Man's Sky Handbook](https://nmshandbook.com/corvette/). The older part directories are *not* proof that each entry belongs to FORSAKEN.

The Corvette catalog now includes a category filter, full-text search, a **In my plan** view, and a result count. These changes keep a broad part library usable on mobile and desktop. Existing part IDs and exported manifests are preserved. Newly added visual and structural entries are intentionally **catalog-only**—there are no invented tech tiles, adjacency bonuses or performance numbers. Generic Forsaken biomechanical placeholders remain labeled as such; Hello Games' launch notes do not provide an exhaustive itemized list.

## Deliberately unchanged

- Supercharged slot selection, scoring, grouping and adjacency rules. Official 7.10 notes do not specify new verified adjacency modifiers or SC math.
- Existing six equipment types, tech family catalogs, build import/export JSON version, and optimizer engine.
- All five site themes and the Crafting & Refining link below the theme selection.
- Static deployment: the same ZIP works on GitHub Pages, Netlify or static web hosting.

## Known limitations

Hello Games' launch-day notes do not enumerate every new biomechanical hull/hab part or publish per-piece ship statistics, official variant item IDs or inventory technology effects. These are never fabricated in the app. The Corvette workshop remains a concept planner, not a 3D snap validator. Cosmetic variants should be verified in the player's own game. New cockpit technology tiles follow the app's existing generic cockpit construction planning assumption, not proof of a newly verified adjacency rule.

## October 29 — Functional Corvette catalog follow-up

The main catalog is now **performance-first** (76 visible entries after the October 30 correction), replacing the 181-entry all-purpose listing. Cosmetic wings, plating, hull attachments, accessories and interior furnishings are hidden; earlier build-export part IDs remain available to the importer, with a cleanup control for obsolete decorative counts. Construction essentials (cockpit, hab and landing access) remain listed because they are needed for a viable ship even if their direct stat effects are uncertain.

New confirmed FORSAKEN functional entries: **Limos-Class Generator**, **Vile Proboscis Generator**, **Chelone-Class Generator**, **Dematerialisation Ray**, **Arachnid Thruster**, **Razor Jet**, **Rover Landing Thrusters**, plus **Legion-Class, Legionnaire-Class and Gunner-Class** habs and walkways. The nine newer cockpit variants now use the documented `i`, `ii`, `iii` item naming.

The new reactor types each own an independent construction technology family. Dematerialisation Ray has its own primary-weapon family. Rear thrusters, landing systems and hab/cargo parts link through the existing group-capped construction technology. Actual percentages, rolls, precise new reactor effects and adjacency rules are **not asserted**: they vary by save/installation and are not documented in official patch notes. An October 30 item-data audit reinstated Eldritch, Gorgon, Plated and Lockjaw Thrusters as disputed Main Engine candidates: NMS Recipes tags them with a Main Engines A-class upgrade, while NMS Resources describes them as cosmetic wings. Their exact in-game tech output requires verification; no fixed percentage is assumed. Venom Spitter was also added as its own weapon family. See `FORSAKEN-CATALOG-CORRECTION.md`.

References:
- https://www.nomanssky.com/forsaken-update/
- https://nomansskyrecipes.com/new/ (October 28 datamined/new item index)
- https://www.nomansskyresources.com/corvette-parts/vile-proboscis-generator
- https://www.nomansskyresources.com/corvette-parts/chelone-class-generator
- https://www.nomansskyresources.com/corvette-parts/limos-class-generator
- https://www.nomansskyresources.com/corvette-parts/dematerialization-ray
- https://www.nomansskyresources.com/corvette-parts/arachnid-thruster
- https://www.nomansskyresources.com/corvette-parts/razor-jet
- https://www.nomansskyresources.com/corvette-parts/eldritch-thruster
