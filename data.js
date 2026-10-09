/* ATLAS MAX — editable, intentionally conservative technology catalog.
   Procedural modules are represented as planning placeholders, not claimed stat rolls.
   Verify game changes against the linked official release log. */
window.ATLAS_DATA = Object.freeze({
  release: 'Cosmos 7.06',
  sources: [
    { name: 'Hello Games release log', url: 'https://www.nomanssky.com/release-log/' },
    { name: 'NMS Resources • technology layouts', url: 'https://www.nomansskyresources.com/tech-layout-and-adjacency-bonus' },
    { name: 'NMS Resources • upgrade modules', url: 'https://www.nomansskyresources.com/guide-pages/upgrade-modules' }
  ],
  gear: {
    exosuit: {
      name: 'Exosuit', icon: '◈', subtitle: 'Personal survival systems',
      placeholder: 'My Exosuit', fixedSC: 3,
      note: 'Exosuit supercharged slots are fixed for all players. Match your actual unlocked grid before using the layout.',
      goals: {
        balanced: { label: 'All-round explorer', weights: {jetpack:4, shield:4, life:3, hazard:2}, defaults: ['jetpack','shield','life','hazard'], tip: 'Spread your supercharged slots between movement and survivability rather than over-investing in a single hazard type.' },
        mobility: { label: 'Maximum mobility', weights: {jetpack:7, shield:2, life:2, hazard:1}, defaults: ['jetpack','shield','life'], tip: 'Prioritize your strongest movement roll in a supercharged slot; keep the Jetpack family tightly connected.' },
        survival: { label: 'Extreme survival', weights: {shield:7, hazard:5, life:4, jetpack:1}, defaults: ['shield','hazard','life','jetpack'], tip: 'Concentrate on shields and life support, while matching specialized protection to the worlds you visit.' }
      },
      families: {
        jetpack: { name: 'Jetpack', short: 'JET', core: 'Jetpack', upgrade: 'Movement Module', maxUpgrades: 3, color: 'mint', sc: 'upgrade', why: 'Movement upgrades improve boost performance and travel comfort.', next: 'Replace weak movement rolls before chasing tiny adjacency gains.' },
        shield: { name: 'Personal Shields', short: 'SHD', core: 'Exosuit Defence Systems', upgrade: 'Shield Module', maxUpgrades: 3, color: 'blue', sc: 'upgrade', why: 'Stronger shields buy time in Sentinel fights and hostile environments.', next: 'Compare shield capacity rolls on your installed modules.' },
        life: { name: 'Life Support', short: 'LIF', core: 'Life Support', upgrade: 'Life Support Module', maxUpgrades: 3, color: 'amber', sc: 'upgrade', why: 'Life support upgrades reduce how often you need to refuel your suit.', next: 'Upgrade your weakest life support module next.' },
        hazard: { name: 'Hazard Protection', short: 'HAZ', core: 'Hazard Protection', upgrade: 'Hazard Protection Module', maxUpgrades: 3, color: 'violet', sc: 'upgrade', why: 'General hazard support complements dedicated environmental protections.', next: 'Add planet-specific protection technology separately as needed.' }
      }
    },
    multitool: {
      name: 'Multi-tool', icon: '⌁', subtitle: 'Combat, mining & analysis',
      placeholder: 'My Multi-tool',
      note: 'Specialize in a primary weapon first; splitting supercharged slots across multiple weapon systems can dilute performance.',
      goals: {
        combat: { label: 'Sentinel destroyer', weights: {neutron:7, pulse:5, scatter:5, mining:1, scanner:1}, defaults: ['neutron','mining','scanner'], tip: 'Commit to one primary weapon family. Put the weapon core or your strongest upgrade on a supercharged slot and cluster its other modules.' },
        mining: { label: 'Resource harvester', weights: {mining:7, scanner:4, neutron:2, pulse:2, scatter:2}, defaults: ['mining','scanner','neutron'], tip: 'Build the Mining Beam family into a tight block and give it supercharged priority before a backup weapon.' },
        survey: { label: 'Survey & discoveries', weights: {scanner:7, mining:4, neutron:2, pulse:2, scatter:2}, defaults: ['scanner','mining','neutron'], tip: 'Scanner module quality matters for discovery rewards; prioritize the strongest actual scanner rolls.' }
      },
      families: {
        neutron: { name: 'Neutron Cannon', short: 'NEU', core: 'Neutron Cannon', upgrade: 'Neutron Cannon Module', maxUpgrades: 3, color: 'violet', sc: 'core', why: 'A high-impact weapon suited to a dedicated damage-focused tool.', next: 'Test core-versus-upgrade supercharging in-game; results depend on the upgrade roll.' },
        pulse: { name: 'Pulse Spitter', short: 'PLS', core: 'Pulse Spitter', upgrade: 'Pulse Spitter Module', maxUpgrades: 3, color: 'rose', sc: 'core', why: 'Fast projectile weapon; effective when its family is kept together.', next: 'Choose this as your main gun rather than supercharging two weapons at once.' },
        scatter: { name: 'Scatter Blaster', short: 'SCT', core: 'Scatter Blaster', upgrade: 'Scatter Blaster Module', maxUpgrades: 3, color: 'amber', sc: 'core', why: 'Close-range combat specialization with focused upgrade slots.', next: 'Use a compact upgrade cluster near the core weapon.' },
        mining: { name: 'Mining Beam', short: 'MNE', core: 'Mining Beam', upgrade: 'Mining Beam Module', maxUpgrades: 3, color: 'mint', sc: 'upgrade', why: 'Faster, more comfortable resource extraction and beam handling.', next: 'Install useful crafted mining tech alongside rolled upgrades where available.' },
        scanner: { name: 'Scanner', short: 'SCN', core: 'Scanner', upgrade: 'Scanner Module', maxUpgrades: 3, color: 'blue', sc: 'upgrade', why: 'Raises the value of scanning plants, animals and minerals.', next: 'Compare the actual flora/fauna/mineral bonuses on your scanning rolls.' }
      }
    },
    starship: {
      name: 'Starship', icon: '✦', subtitle: 'Damage, mobility & warp range',
      placeholder: 'My Starship',
      note: 'Normal starships use technology slots. Corvette construction follows different rules and is not modeled here.',
      goals: {
        combat: { label: 'Space dogfighter', weights: {infra:7, shield:5, pulse:4, hyperdrive:2, launch:1, photon:2, positron:2}, defaults: ['infra','shield','pulse','hyperdrive','launch'], tip: 'Maximize a primary weapon family, then feed supercharged capacity into survivability and maneuverability.' },
        explorer: { label: 'Long-range explorer', weights: {hyperdrive:7, pulse:5, launch:4, shield:3, infra:2, photon:2, positron:2}, defaults: ['hyperdrive','pulse','launch','shield','infra'], tip: 'Warp range and pulse handling win over peak damage; bring one reliable weapon but do not scatter the hyperdrive upgrades.' },
        balanced: { label: 'All-purpose captain', weights: {infra:5, shield:5, pulse:5, hyperdrive:4, launch:3, photon:2, positron:2}, defaults: ['infra','shield','pulse','hyperdrive','launch'], tip: 'One main weapon, one compact defensive cluster and strong travel systems make an efficient everyday ship.' }
      },
      families: {
        infra: { name: 'Infra-Knife', short: 'INK', core: 'Infra-Knife Accelerator', upgrade: 'Infra-Knife Module', maxUpgrades: 3, color: 'rose', sc: 'core', why: 'Sustained starship combat damage; a strong main-weapon choice.', next: 'Build a tight weapon cluster and compare in-game DPS when supercharging core vs best roll.' },
        photon: { name: 'Photon Cannon', short: 'PHO', core: 'Photon Cannon', upgrade: 'Photon Cannon Module', maxUpgrades: 3, color: 'amber', sc: 'core', why: 'Dependable general-purpose starship weapon.', next: 'Prefer one upgraded weapon family over multiple half-finished sets.' },
        positron: { name: 'Positron Ejector', short: 'POS', core: 'Positron Ejector', upgrade: 'Positron Ejector Module', maxUpgrades: 3, color: 'violet', sc: 'core', why: 'Close-range weapon specialization.', next: 'Test performance at your usual engagement distances.' },
        shield: { name: 'Deflector Shield', short: 'SHD', core: 'Deflector Shield', upgrade: 'Starship Shield Module', maxUpgrades: 3, color: 'blue', sc: 'upgrade', why: 'Raises survivability in dogfights and dangerous encounters.', next: 'Replace poor shield rolls when the basic set is complete.' },
        pulse: { name: 'Pulse Engine', short: 'PUL', core: 'Pulse Engine', upgrade: 'Pulse Engine Module', maxUpgrades: 3, color: 'mint', sc: 'upgrade', why: 'Better maneuverability and pulse performance make every flight feel better.', next: 'Supercharge a high-roll upgrade where it competes well against your weapon.' },
        hyperdrive: { name: 'Hyperdrive', short: 'HYP', core: 'Hyperdrive', upgrade: 'Hyperdrive Module', maxUpgrades: 3, color: 'violet', sc: 'core', why: 'Greater warp range and efficiency for regional exploration.', next: 'Add known crafted colored-drive technology as needed, beyond the procedural module cap.' },
        launch: { name: 'Launch Thrusters', short: 'LCH', core: 'Launch Thruster', upgrade: 'Launch Thruster Module', maxUpgrades: 3, color: 'amber', sc: 'upgrade', why: 'Reduces launch friction on planets and supports efficient travel.', next: 'Install useful crafted launch tech separately when unlocked.' }
      }
    },
    freighter: {
      name: 'Freighter', icon: '▣', subtitle: 'Warp & expedition capability',
      placeholder: 'My Freighter',
      note: 'Expedition upgrades are grouped by function. These are planning placeholders: review exact installed technology and fleet stat rolls in-game.',
      goals: {
        expedition: { label: 'Fleet commander', weights: {fleetCombat:5, fleetExplore:5, fleetTrade:5, fleetIndustry:5, fleetFuel:4, freighterWarp:2}, defaults: ['fleetCombat','fleetExplore','fleetTrade','fleetFuel','freighterWarp'], tip: 'Improve fleet specialization and efficiency; use the grid for same-family grouping, not made-up expedition outcome percentages.' },
        warp: { label: 'Maximum warp range', weights: {freighterWarp:8, fleetFuel:3, fleetExplore:2, fleetTrade:2, fleetCombat:2, fleetIndustry:2}, defaults: ['freighterWarp','fleetFuel','fleetExplore'], tip: 'Prioritize the freighter hyperdrive family with a tight cluster and strong warp rolls.' },
        industry: { label: 'Industrial fleet', weights: {fleetIndustry:7, fleetFuel:5, fleetTrade:4, freighterWarp:3, fleetExplore:2, fleetCombat:2}, defaults: ['fleetIndustry','fleetFuel','fleetTrade','freighterWarp'], tip: 'Favor industrial expeditions and fuel efficiency alongside enough warp capability to reach destinations.' }
      },
      families: {
        freighterWarp: { name: 'Freighter Hyperdrive', short: 'HYP', core: 'Freighter Hyperdrive', upgrade: 'Freighter Hyperdrive Module', maxUpgrades: 3, color: 'violet', sc: 'core', why: 'Expands capital-ship travel capability.', next: 'Use strong hyperdrive modules, and add crafted warp technology when unlocked.' },
        fleetCombat: { name: 'Fleet Combat', short: 'CBT', core: null, upgrade: 'Fleet Combat Upgrade', maxUpgrades: 3, color: 'rose', sc: 'upgrade', why: 'Supports the combat specialization of dispatched frigate fleets.', next: 'Improve combat expedition reliability with better fleet coverage.' },
        fleetExplore: { name: 'Fleet Exploration', short: 'EXP', core: null, upgrade: 'Fleet Exploration Upgrade', maxUpgrades: 3, color: 'blue', sc: 'upgrade', why: 'Supports exploration expedition stat bonuses.', next: 'Compare installed expedition module classes and rolls.' },
        fleetTrade: { name: 'Fleet Trade', short: 'TRD', core: null, upgrade: 'Fleet Trade Upgrade', maxUpgrades: 3, color: 'amber', sc: 'upgrade', why: 'Supports trade expedition specialization.', next: 'Stack compatible modules without exceeding the procedural upgrade limit.' },
        fleetIndustry: { name: 'Fleet Industry', short: 'IND', core: null, upgrade: 'Fleet Industrial Upgrade', maxUpgrades: 3, color: 'mint', sc: 'upgrade', why: 'Supports industrial frigate expeditions.', next: 'Prioritize industrial modules when they match your fleet strategy.' },
        fleetFuel: { name: 'Fleet Fuel Efficiency', short: 'FUE', core: null, upgrade: 'Fleet Fuel Efficiency Upgrade', maxUpgrades: 3, color: 'violet', sc: 'upgrade', why: 'Targets the operating cost of frigate expeditions.', next: 'Improve efficiency rolls and compare actual fuel usage in-game.' }
      }
    },
    exocraft: {
      name: 'Exocraft', icon: '⬡', subtitle: 'Surface mobility & utilities',
      placeholder: 'My Exocraft', fixedSC: 3,
      note: 'Available exocraft technology differs by vehicle. Confirm that each selected system can be installed in your specific vehicle.',
      goals: {
        travel: { label: 'Planet runner', weights: {engine:7, boost:6, scanner:3, laser:2, cannon:1}, defaults: ['engine','boost','scanner'], tip: 'Mobility and boosting come first for rapid surface travel.' },
        mining: { label: 'Surface mining', weights: {laser:7, engine:5, boost:4, scanner:3, cannon:2}, defaults: ['laser','engine','boost','scanner'], tip: 'Keep the mining laser grouped and retain enough mobility to cross rough terrain.' },
        combat: { label: 'Ground combat', weights: {cannon:7, engine:4, boost:3, laser:2, scanner:1}, defaults: ['cannon','engine','boost'], tip: 'Use a weapon-focused layout, but verify the vehicle can equip the selected cannon upgrades.' }
      },
      families: {
        engine: { name: 'Exocraft Engine', short: 'ENG', core: 'Exocraft Engine', upgrade: 'Exocraft Engine Module', maxUpgrades: 3, color: 'mint', sc: 'upgrade', why: 'Supports ground vehicle speed and driving response.', next: 'Compare roll quality before spending supercharged slots.' },
        boost: { name: 'Exocraft Boost', short: 'BST', core: 'Exocraft Boost', upgrade: 'Exocraft Boost Module', maxUpgrades: 3, color: 'amber', sc: 'upgrade', why: 'Helps cross large stretches of planetary terrain.', next: 'Group supporting boost tech with its core system.' },
        laser: { name: 'Exocraft Mining Laser', short: 'MNE', core: 'Exocraft Mining Laser', upgrade: 'Exocraft Mining Laser Module', maxUpgrades: 3, color: 'blue', sc: 'upgrade', why: 'Enables gathering surface resources from your vehicle.', next: 'Check the exact available laser modules on this exocraft type.' },
        cannon: { name: 'Exocraft Cannon', short: 'CAN', core: 'Exocraft Cannon', upgrade: 'Exocraft Cannon Module', maxUpgrades: 3, color: 'rose', sc: 'core', why: 'A weapon-focused vehicle loadout for hostile surfaces.', next: 'Avoid spending SC slots on combat if your vehicle is mainly for travel.' },
        scanner: { name: 'Exocraft Scanner', short: 'SCN', core: 'Exocraft Signal Booster', upgrade: null, maxUpgrades: 0, color: 'violet', sc: 'core', why: 'Planetary utility scanning; its crafted scanner progression is vehicle-dependent.', next: 'Install any compatible blueprint upgrades independently; no fictitious procedural modules are added here.' }
      }
    }
  }
});
