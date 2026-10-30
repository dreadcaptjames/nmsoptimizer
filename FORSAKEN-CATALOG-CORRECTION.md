# FORSAKEN Corvette catalog correction — October 30, 2026

## Why Eldritch Thruster was missing

The earlier stat-focused filter excluded Eldritch Thruster and three similarly named
parts after treating the entire “flight stabilizer/wing” index as decorative.
That source conflicts with a data-driven Corvette item catalog that labels these
parts **Corvette Main Engine** and associates them with an **A-class Main Engines
upgrade**. The in-game inventory is the deciding authority; the application
must not claim precise values or confirmed adjacency from either source.

## Now visible under FORSAKEN and Propulsion

- **Eldritch Thruster** — Main Engine candidate; classification disputed
- **Gorgon Thruster** — Main Engine candidate; classification disputed
- **Plated Thruster** — Main Engine candidate; classification disputed
- **Lockjaw Thruster** — Main Engine candidate; classification disputed

They participate in the *existing capped engine technology planning model*, not
four new technology families. Up to three modeled engine construction contributions
may appear across the selected thrusters. More placed copies are kept as physical
parts. This is a planning convention; verify the actual technology inventory and
bonus in No Man's Sky. Mirrored variants are not assigned invented numerical
values.

- **Venom Spitter** — separately classified FORSAKEN weapon; gets its own
  `cv-venom` construction-technology family and can be selected as the primary
  weapon. It is not assigned assumed adjacency with other weapons.

## Catalog usability correction

The Corvette category dropdown previously showed Reactors, Propulsion,
Weapons, Shields and Essentials options, but its change handler rejected these
values and silently reset to “All”. Their filtering is now functional.

## Preserved behavior

- The existing long-range / combat / balanced supercharged-slot priorities
  remain intact. The new Venom Spitter has zero priority outside combat or a
  deliberately selected balanced weapon goal, and does not override Long Range.
- Older imported Corvette builds still resolve their existing part IDs.
- Previously selected Dematerialisation Ray (and new Venom Spitter) weapon
  priorities now round-trip through import/export instead of resetting to Auto.
- No cosmetic hull panels or interior furniture have been reintroduced.
- Original themes, Home Screen icon, companion link and static hosting compatibility
  are unchanged.

## Sources

- Official update: https://www.nomanssky.com/forsaken-update/
- Corvette item catalog / version additions:
  https://nomansskyrecipes.com/new/
- Eldritch Thruster item-data classification:
  https://nomansskyrecipes.com/corvette/B_WNG_W/
- Alternate (cosmetic) classification:
  https://www.nomansskyresources.com/corvette-parts/eldritch-thruster
- Other new parts and Venom Spitter:
  https://www.nomansskyresources.com/corvette-parts
