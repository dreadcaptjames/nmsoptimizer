# ATLAS MAX — Technology Relationship Audit

This is a concise record of the modeled relationships verified for the v1.8.1 update. It is **not** a claim to reproduce all hidden in-game technology coefficients. The app uses relative placement scoring.

| Technology / family | Model behavior | Basis |
| --- | --- | --- |
| Emergency Warp Unit | Listed with **Hyperdrive**, links with compatible Hyperdrive technology; not Pulse Engine; no direct supercharged range gain assumed | [Emergency Warp Unit](https://nomanssky.fandom.com/wiki/Emergency_Warp_Unit), [Upgrade bonus](https://nomanssky.fandom.com/wiki/Upgrade_bonus) |
| Aqua Jets | Water-landing utility within launch-system list; **no Launch Thruster adjacency** scored and no supercharged benefit assumed | [Aqua-Jets](https://nomanssky.fandom.com/wiki/Aqua-Jets); players can confirm colored-border behavior in-game |
| Hyperdrive star-color drives | Can serve as Hyperdrive adjacency links, but do not create their own hyperdrive-range stat for supercharging in this model | [Hyperdrive](https://nomanssky.fandom.com/wiki/Hyperdrive), [Upgrade bonus](https://nomanssky.fandom.com/wiki/Upgrade_bonus) |
| Aeration Membrane | Links with general hazard protection; **does not provide bonus to Underwater Protection Modules** | [Aeration Membrane](https://nomanssky.fandom.com/wiki/Aeration_Membrane) |
| Underwater Protection Modules | Adjacency to other Underwater Protection Modules only, not general environmental shielding | [Underwater Oxygen Upgrade](https://nomanssky.fandom.com/wiki/Underwater_Oxygen_Upgrade) |
| Heat, cold, toxic, radiation and suspicious hazard upgrades | Selected **cross-family hazard adjacency** is modeled; these are not isolated solely by catalog group | [Cold thermal protection](https://nomanssky.fandom.com/wiki/Thermal_Protection_Upgrade_(Cold)), [Illegal hazard upgrade](https://nomanssky.fandom.com/wiki/Illegal_Hazard_Protection_Upgrade) |
| Icarus Fuel System | No engine adjacency | [Fusion Engine](https://www.nomansskyresources.com/exocraft-blueprints/fusion-engine) |
| Star Seed + Remembrance | Explicit one-pair adjacency health synergy | [Remembrance](https://www.nomansskyresources.com/exosuit-blueprints/remembrance) |
| Corvette reactors | Related to ship statistics, but **no unverified bonus** is scored between reactor and Hyperdrive/Pulse/Shield families | Corvette links remain functional descriptions, not gameplay equivalences |

## What changed in the code

- Corrected the named blueprint family for Emergency Warp Unit and migrated older JSON exports using `utility:warp` to `hyperdrive:warp`.
- Marked Aqua Jets as functional-only for adjacency and supercharged placement.
- Prevented star-color drives and Emergency Warp from being prioritized as if they contained a rolled Hyperdrive-range stat.
- Separated Aeration Membrane from the dedicated Underwater Protection Module adjacency family.
- Added selected documented cross-family environmental protection links.
- Made the optimizer scoring and the on-screen glowing slot connections share **one adjacency rule**.
- Preserved all six planners and the manual-only Optimize workflow.

**Remaining limits:** The full current internal game data for every item, Corvette-specific exception, procedural stat roll, supercharged effect, and special ship configuration is not independently verified here. Avoid treating the app's score as a guaranteed in-game stat. When a colored in-game inventory border disagrees with the planner, the game is authoritative.
