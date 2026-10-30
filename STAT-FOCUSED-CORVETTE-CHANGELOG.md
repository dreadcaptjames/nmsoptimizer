# Corvette Workshop — Stat-focused catalog (29 October 2026)

> **Updated October 30:** Five modules were subsequently added (four disputed Main Engine candidates plus Venom Spitter), raising the visible catalog from 71 to 76. The exclusion note below reflects the October 29 understanding and has been superseded for those four thrusters; see `FORSAKEN-CATALOG-CORRECTION.md`.

This release narrows the visible Corvette part picker to **71 functional and construction-essential modules**, instead of listing every exterior accessory, cosmetic wing, hull panel and interior furnishing. Earlier decorative part IDs remain recognized on import to avoid discarding saved plans; an optional cleanup control removes non-functional entries from a plan. The existing Corvette weapon-priority bug fix is preserved.

## Newly added gameplay-system items from FORSAKEN 7.10

- Reactors: **Limos-Class Generator**, **Vile Proboscis Generator**, **Chelone-Class Generator** — three distinct reactor families and up to three construction-linked tiles *per reactor*. The specific stat and roll are not presumed; other reactor families remain separate.
- Weapons: **Dematerialisation Ray** — its own construction weapon family and primary-weapon choice (not automatically treated as Phase Beam adjacency).
- Propulsion: **Arachnid Thruster**, **Razor Jet** — rear thrusters that use the existing shared engine technology cap.
- Landing: **Rover Landing Thrusters** — uses the shared landing cap.
- Cargo/habitation: **Legion-Class Hab/Walkway**, **Legionnaire-Class Hab/Walkway**, **Gunner-Class Hab/Walkway** — supported by the existing shared hab/cargo planning model, without inventing numeric slot bonuses.
- Official cockpit variant names: Hornet-i/ii/iii, Viper-i/ii/iii, Mantis-i/ii/iii.

Additional older propulsion items previously misclassified as decorative have been moved into the engine group; Thunderbird Landing Thrusters are now recognized as landing equipment that can also satisfy the required engine group. Structural landing access remains visible because it's required to build a Corvette, even though it isn't claimed to provide a distinct stat upgrade.

**Excluded deliberately (October 29 policy):** biomechanical cosmetic hull pieces, decorative wings, ornamental fittings, interior furniture, generic unnamed placeholders. **Updated October 30:** Eldritch, Gorgon, Plated and Lockjaw Thrusters are now visible as disputed Main Engine candidates based on separate item-data classifications, with unverified bonuses clearly noted.

## Technical notes

The app shows *modeled technology relationships*, not claimed in-game percentages. Bonus amounts and installation order depend on each game save, and patch 7.10 does not publish a complete table of new reactor effects or adjacency compatibility. The actual readout in the Corvette Workshop is authoritative. New unique reactor and weapon families are independent and receive no guessed orthogonal adjacency bonus. Visual-only modules may still affect overall mass/handling, but are outside this stat-focused equipment planner.

The app's five themes, web manifest/icon assets, crafting/refining link, six equipment categories, JSON build import/export and relative URLs for GitHub Pages, Netlify and other static hosts are preserved. The previously centered iPhone Home Screen icon is retained.

## References

- Hello Games official FORSAKEN patch notes: https://www.nomanssky.com/forsaken-update/
- FORSAKEN 7.10 additions index: https://nomansskyrecipes.com/new/
- Detailed Corvette modules: https://www.nomansskyresources.com/corvette-parts
- New generators: https://www.nomansskyresources.com/corvette-parts/limos-class-generator ; https://www.nomansskyresources.com/corvette-parts/vile-proboscis-generator ; https://www.nomansskyresources.com/corvette-parts/chelone-class-generator
- Distinct weapon: https://www.nomansskyresources.com/corvette-parts/dematerialization-ray
- Rear thrusters: https://www.nomansskyresources.com/corvette-parts/arachnid-thruster ; https://www.nomansskyresources.com/corvette-parts/razor-jet
- Cosmetic stabilizer example: https://www.nomansskyresources.com/corvette-parts/eldritch-thruster
