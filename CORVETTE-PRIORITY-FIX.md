# Corvette supercharged priority correction — 29 October 2026

## Problem

1. The primary-weapon boost previously raised an installed Corvette weapon above *every* other family in *all* technology goals, so even Long-range explorer assigned supercharged slots to guns.
2. Construction `Build focus` and `Technology goal` were independent, so selecting `Long-range traveller` could leave the technology optimizer set to `Space dogfighter`.
3. The Corvette grid's displayed SC impact used the uncustomized weight table, which could differ from the solver's actual weapon weight.

## Fix

- Goal-specific Corvette weighting: Long Range prioritizes hyperdrive, Zenith, pulse/propulsion and Medusa; guns get zero SC priority. Balanced favors mobility/defense, with selected weapon as a secondary choice. Combat prioritizes the *selected* installed/enabled weapon only.
- Construction goal changes now update the matching technology goal. Manually choosing a separate `Technology goal` later is still supported.
- Default Corvette technology focus starts Balanced rather than inheriting Starship Combat.
- Slot labels use the same personalized weights as the solver. A previous optimized result is flagged as stale when goal or module settings change; select Optimize Corvette tech again.
- This is a heuristic scoring change, not a claim about No Man's Sky's exact stat formulas. No other equipment scoring rules were modified.

Regression tests cover Long Range, Combat, Balanced, a selected alternate weapon, constructor-to-tech goal synchronization and original app assets.
