/* ATLAS MAX — editable, intentionally conservative technology catalog.
   Procedural modules are represented as planning placeholders, not claimed stat rolls.
   Verify game changes against the linked official release log. */
window.ATLAS_DATA = Object.freeze({
  release: 'Forsaken 7.10',
  sources: [
    { name: 'Hello Games release log', url: 'https://www.nomanssky.com/release-log/' },
    { name: 'NMS Resources • technology layouts', url: 'https://www.nomansskyresources.com/guide-pages/tech-layouts-and-adjacency-bonus' },
    { name: 'NMS Resources • upgrade modules', url: 'https://www.nomansskyresources.com/guide-pages/upgrade-modules' }
  ],
  gear: {
    exosuit: {
      name: 'Exosuit', icon: 'suit', subtitle: 'Movement, life support, specialized hazards & utilities',
      placeholder: 'My Exosuit', fixedSC: 3,
      note: 'The Exosuit has three fixed supercharged positions. Crafted blueprints are separate from the three-installed procedural-module limit. Optional story, expedition and cosmetic technology should only be selected if you own it. Hazard modules are separated by environment; score is not a real-game stat prediction.',
      goals: {
        balanced: { label: 'All-round explorer', weights: {jetpack:7,shield:6,life:5,hazard:3,heat:2,cold:2,toxic:2,radiation:2,underwater:2,forbidden:4,utility:1,refiner:1,translator:1,story:2,cosmetic:0}, defaults: ['jetpack','shield','life','hazard','heat','cold','toxic','radiation','underwater','utility','refiner','translator','story'], tip: 'Bring full mobility and life-support technology, then specialize your environment modules around destinations. Utility and cosmetic modules should not compete with performance tech for supercharged positions.' },
        mobility: { label: 'Maximum mobility', weights: {jetpack:9,shield:4,life:4,hazard:2,heat:1,cold:1,toxic:1,radiation:1,underwater:3,forbidden:2,utility:1,refiner:1,translator:1,story:1,cosmetic:0}, defaults: ['jetpack','shield','life','hazard','underwater','utility'], tip: 'Keep your four crafted movement enhancements together with the Jetpack and your best Movement Module rolls. Water Jets and Rocket Boots are separate crafted technologies, not procedural modules.' },
        survival: { label: 'Extreme survival', weights: {jetpack:3,shield:9,life:7,hazard:6,heat:5,cold:5,toxic:5,radiation:5,underwater:5,forbidden:6,utility:1,refiner:1,translator:1,story:3,cosmetic:0}, defaults: ['jetpack','shield','life','hazard','heat','cold','toxic','radiation','underwater','forbidden','story'], tip: 'Use separate heat, cold, toxic, radiation and underwater protections. Recharged protection modules have different mechanics from general hazard shielding; prioritize actual defensive rolls.' },
        underwater: { label: 'Oceans & fishing', weights: {underwater:9,life:7,jetpack:6,shield:4,hazard:3,heat:1,cold:1,toxic:1,radiation:1,forbidden:1,utility:3,refiner:2,translator:1,story:1,cosmetic:0}, defaults: ['underwater','life','jetpack','shield','utility','refiner'], tip: 'Use the Aeration Membrane and Pressure Membrane with underwater upgrades, and include Efficient Water Jets from the movement family. The Exo-Skiff is an optional utility, not an underwater protection upgrade.' }
      },
      families: {
        jetpack: { section:'Core systems', name:'Jetpack & Movement', short:'JET', icon:'jetpack', core:'Jetpack', upgrade:'Movement Module', maxUpgrades:3, color:'mint', sc:'upgrade', why:'Jetpack travel, sprint endurance and underwater propulsion are different tech pieces that work alongside up to three Movement Modules.', next:'Compare your three best movement rolls; crafted movement blueprints are additional installs.', addons:[
          {id:'airburst', name:'Airburst Engine', icon:'airburst', default:true},
          {id:'rocketboots', name:'Rocket Boots', icon:'boots', default:true},
          {id:'waterjets', name:'Efficient Water Jets', icon:'water', default:true},
          {id:'neural', name:'Neural Stimulator', icon:'boost', default:true}
        ] },
        shield: { section:'Core systems', name:'Personal Shields', short:'SHD', icon:'shield', core:'Exosuit Defence Systems', upgrade:'Shield Module', maxUpgrades:3, color:'blue', sc:'upgrade', why:'Dedicated shields support combat survivability; procedural Shield Modules have variable rolls.', next:'Compare your three best shield rolls.' },
        life: { section:'Core systems', name:'Life Support', short:'LIF', icon:'life', core:'Life Support', upgrade:'Life Support Module', maxUpgrades:3, color:'amber', sc:'upgrade', why:'Base life support and crafted oxygen systems are separate from Life Support Modules.', next:'Add Oxygen Recycler and Oxygen Rerouter alongside your best module rolls.', addons:[
          {id:'recycler', name:'Oxygen Recycler', icon:'oxygen', default:true},
          {id:'rerouter', name:'Oxygen Rerouter', icon:'reroute', default:true}
        ] },
        hazard: { section:'Core systems', name:'General Hazard Protection', short:'HAZ', icon:'hazard', core:'Hazard Protection', maxUpgrades:0, color:'violet', sc:'none', why:'General environmental shielding. A Shield Lattice is a craftable add-on; distinct elemental protection modules are tracked separately below.', next:'Do not confuse the Shield Lattice with separate heat, cold, toxic and radiation modules.', addons:[
          {id:'lattice', name:'Shield Lattice', icon:'shield', default:true}
        ] },
        heat: { section:'Environmental protection', name:'Heat Protection', short:'HOT', icon:'heat', core:'Coolant Network', upgrade:'Thermal Protection Module (Heat)', maxUpgrades:3, color:'rose', sc:'upgrade', why:'Crafted hot-world shielding plus dedicated, rechargeable heat protection modules.', next:'Keep heat-specific rolled modules distinct from cold modules.' },
        cold: { section:'Environmental protection', name:'Cold Protection', short:'CLD', icon:'cold', core:'Thermic Layer', upgrade:'Thermal Protection Module (Cold)', maxUpgrades:3, color:'blue', sc:'upgrade', why:'Crafted cold-weather insulation and dedicated cold protection modules.', next:'Carry cold protection for frozen and extreme-temperature planets.' },
        toxic: { section:'Environmental protection', name:'Toxic Protection', short:'TOX', icon:'toxic', core:'Toxin Suppressor', upgrade:'Toxic Protection Module', maxUpgrades:3, color:'mint', sc:'upgrade', why:'Additional shielding for toxic worlds; dedicated modules require replenishing.', next:'Install toxin-specific protection rather than using an unrelated environmental module.' },
        radiation: { section:'Environmental protection', name:'Radiation Protection', short:'RAD', icon:'radiation', core:'Radiation Deflector', upgrade:'Radiation Protection Module', maxUpgrades:3, color:'amber', sc:'upgrade', why:'Crafted shielding plus dedicated radiation protection modules for irradiated environments.', next:'Compare radiation protection duration rolls, not just class.' },
        underwater: { section:'Environmental protection', name:'Underwater Protection', short:'SEA', icon:'water', core:'Aeration Membrane', upgrade:'Underwater Protection Module', maxUpgrades:3, color:'blue', sc:'upgrade', why:'Aquatic breathing and pressure protection are independent of heat/cold/toxic/radiation protection.', next:'Add the Pressure Membrane for deep dives and the Jetpack Efficient Water Jets for mobility.', addons:[
          {id:'pressure', name:'Pressure Membrane', icon:'pressure', default:true}
        ] },
        forbidden: { section:'Specialized modules', name:'Sentinel / Forbidden Mods', short:'SNT', icon:'sentinel', upgrade:'Forbidden Exosuit Module', maxUpgrades:3, color:'violet', sc:'upgrade', why:'Forbidden upgrades collected from Sentinel technology can provide their own rolled benefits; verify their actual values.', next:'Use only the modules you actually own; this category is optional.' },
        utility: { section:'Utility & exploration', name:'Suit Utilities', short:'UTL', icon:'toolkit', maxUpgrades:0, adjacency:'none', color:'amber', sc:'none', why:'Standalone quality-of-life technology. These items do not form a stat-boosting adjacency family.', next:'Choose only the utility technology installed in your suit.', addons:[
          {id:'hazmat', name:'Haz-Mat Gauntlet', icon:'gauntlet', default:true},
          {id:'trade', name:'Trade Rocket', icon:'rocket', default:true},
          {id:'nutrient', name:'Nutrient Ingestor', icon:'food', default:false},
          {id:'skiff', name:'Exo-Skiff', icon:'skiff', default:false},
          {id:'exosummon', name:'Exocraft Summoning Unit', icon:'summon', default:true},
          {id:'archive', name:'Archive Bypass Implant', icon:'archive', default:false},
          {id:'visceral', name:'Visceral Synthesiser', icon:'hazard', default:false}
        ] },
        refiner: { section:'Utility & exploration', name:'Personal Refining', short:'REF', icon:'refiner', maxUpgrades:0, adjacency:'none', color:'mint', sc:'none', why:'Portable refiners are installable suit utilities; the Mk 2 replaces the basic version in this planner.', next:'Choose one refiner, not both.', addons:[
          {id:'refiner1', name:'Personal Refiner', icon:'refiner', exclusive:'refiner', default:false},
          {id:'refiner2', name:'Personal Refiner Mk 2', icon:'refiner', exclusive:'refiner', default:true}
        ] },
        translator: { section:'Utility & exploration', name:'Language Translators', short:'TRN', icon:'translator', maxUpgrades:0, adjacency:'none', color:'blue', sc:'none', why:'Installable translator technologies provide language comprehension, not procedurally rolled combat stats.', next:'Select the translator blueprints you have unlocked.', addons:[
          {id:'simple', name:'Simple Translator', icon:'translator', default:false},
          {id:'superior', name:'Superior Translator', icon:'translator', default:false},
          {id:'advanced', name:'Advanced Translator', icon:'translator', default:true},
          {id:'artemis', name:"Artemis' Translator", icon:'translator', default:false}
        ] },
        story: { section:'Story & optional', name:'Atlas, Quest & Rare Tech', short:'STR', icon:'atlas', maxUpgrades:0, adjacency:'none', color:'violet', sc:'none', why:'Quest-specific technologies are optional. Star Seed and Remembrance have a documented health adjacency bonus; unrelated utility/story technologies do not.', next:'Do not include technology you have not unlocked or cannot obtain on your save.', addons:[
          {id:'star', name:'Star Seed', icon:'atlas', exclusive:'atlaspath', default:false},
          {id:'denier', name:'Mark of the Denier', icon:'atlas', exclusive:'atlaspath', default:false},
          {id:'remembrance', name:'Remembrance', icon:'life', default:false},
          {id:'anomaly', name:'Anomaly Suppressor', icon:'anomaly', default:false},
          {id:'lens', name:'Living Lens', icon:'eye', default:false}
        ] },
        cosmetic: { section:'Story & optional', name:'Jetpack Trails (Cosmetic)', short:'TRL', icon:'spark', maxUpgrades:0, adjacency:'none', color:'rose', sc:'none', why:'Optional cosmetic jetpack trail technologies. They should not be prioritized for stat or adjacency gains.', next:'Only select one or more trails if you actually have them installed.', addons:[
          {id:'antimatter', name:'Antimatter Jetpack Trail', icon:'spark'},
          {id:'rainbow', name:'Rainbow Jetpack Trail', icon:'spark'},
          {id:'red', name:'Red Jetpack Trail', icon:'spark'},
          {id:'green', name:'Green Jetpack Trail', icon:'spark'},
          {id:'blue', name:'Blue Jetpack Trail', icon:'spark'},
          {id:'bubbles', name:'Bubble Jetpack Trail', icon:'spark'},
          {id:'ghastly', name:'Ghastly Trail', icon:'spark'},
          {id:'reality', name:'Reality Glitch Trail', icon:'spark'},
          {id:'discordant', name:'Discordant Jetpack Trail', icon:'spark'},
          {id:'electric', name:'Electric Jetpack Trail', icon:'spark'},
          {id:'scorching', name:'Scorching Jetpack Trail', icon:'spark'},
          {id:'festive', name:'Festive Jetpack Trail', icon:'spark'},
          {id:'pyro', name:'Pyrotechnics Jetpack Trail', icon:'spark'},
          {id:'plasma', name:'Plasma Jetpack Trail', icon:'spark'},
          {id:'fusion', name:'Fusion Jetpack Trail', icon:'spark'},
          {id:'ink', name:'Ink-Stained Trail', icon:'spark'}
        ] }
      }
    },
    multitool: {
      name: 'Multi-tool', icon: 'multitool', subtitle: 'Combat, mining & analysis',
      placeholder: 'My Multi-tool',
      note: 'Specialize in a primary weapon first; splitting supercharged slots across multiple weapon systems can dilute performance.',
      goals: {
        combat: { label: 'Sentinel destroyer', weights: {neutron:7, pulse:5, scatter:5, mining:1, scanner:1}, defaults: ['neutron','mining','scanner'], tip: 'Commit to one primary weapon family. Put the weapon core or your strongest upgrade on a supercharged slot and cluster its other modules.' },
        mining: { label: 'Resource harvester', weights: {mining:7, scanner:4, neutron:2, pulse:2, scatter:2}, defaults: ['mining','scanner','neutron'], tip: 'Build the Mining Beam family into a tight block and give it supercharged priority before a backup weapon.' },
        survey: { label: 'Survey & discoveries', weights: {scanner:7, mining:4, neutron:2, pulse:2, scatter:2}, defaults: ['scanner','mining','neutron'], tip: 'Scanner module quality matters for discovery rewards; prioritize the strongest actual scanner rolls.' }
      },
      families: {
        neutron: { name: 'Neutron Cannon', short: 'NEU', icon: 'neutron', core: 'Neutron Cannon', upgrade: 'Neutron Cannon Module', maxUpgrades: 3, color: 'violet', sc: 'core', why: 'A high-impact weapon suited to a dedicated damage-focused tool.', next: 'Test core-versus-upgrade supercharging in-game; results depend on the upgrade roll.' },
        pulse: { name: 'Pulse Spitter', short: 'PLS', icon: 'spitter', core: 'Pulse Spitter', upgrade: 'Pulse Spitter Module', maxUpgrades: 3, color: 'rose', sc: 'core', why: 'Fast projectile weapon; effective when its family is kept together.', next: 'Choose this as your main gun rather than supercharging two weapons at once.' },
        scatter: { name: 'Scatter Blaster', short: 'SCT', icon: 'scatter', core: 'Scatter Blaster', upgrade: 'Scatter Blaster Module', maxUpgrades: 3, color: 'amber', sc: 'core', why: 'Close-range combat specialization with focused upgrade slots.', next: 'Use a compact upgrade cluster near the core weapon.' },
        mining: { name: 'Mining Beam', short: 'MNE', icon: 'mining', core: 'Mining Beam', upgrade: 'Mining Beam Module', maxUpgrades: 3, color: 'mint', sc: 'upgrade', why: 'Faster, more comfortable resource extraction and beam handling.', next: 'Install useful crafted mining tech alongside rolled upgrades where available.' },
        scanner: { name: 'Scanner', short: 'SCN', icon: 'scanner', core: 'Scanner', upgrade: 'Scanner Module', maxUpgrades: 3, color: 'blue', sc: 'upgrade', why: 'Raises the value of scanning plants, animals and minerals.', next: 'Compare the actual flora/fauna/mineral bonuses on your scanning rolls.' }
      }
    },
    starship: {
      name: 'Starship', icon: 'ship', subtitle: 'Damage, mobility & warp range',
      placeholder: 'My Starship',
      note: 'Normal starships use technology slots. Corvette construction follows different rules and is not modeled here.',
      goals: {
        combat: { label: 'Space dogfighter', weights: {infra:7, shield:5, pulse:4, hyperdrive:2, launch:1, photon:2, positron:2}, defaults: ['infra','shield','pulse','hyperdrive','launch'], tip: 'Maximize a primary weapon family, then feed supercharged capacity into survivability and maneuverability.' },
        explorer: { label: 'Long-range explorer', weights: {hyperdrive:7, pulse:5, launch:4, shield:3, infra:2, photon:2, positron:2}, defaults: ['hyperdrive','pulse','launch','shield','infra'], tip: 'Warp range and pulse handling win over peak damage; bring one reliable weapon but do not scatter the hyperdrive upgrades.' },
        balanced: { label: 'All-purpose captain', weights: {infra:5, shield:5, pulse:5, hyperdrive:4, launch:3, photon:2, positron:2}, defaults: ['infra','shield','pulse','hyperdrive','launch'], tip: 'One main weapon, one compact defensive cluster and strong travel systems make an efficient everyday ship.' }
      },
      families: {
        infra: { name: 'Infra-Knife', short: 'INK', icon: 'infra', core: 'Infra-Knife Accelerator', upgrade: 'Infra-Knife Module', maxUpgrades: 3, color: 'rose', sc: 'core', why: 'Sustained starship combat damage; a strong main-weapon choice.', next: 'Build a tight weapon cluster and compare in-game DPS when supercharging core vs best roll.' },
        photon: { name: 'Photon Cannon', short: 'PHO', icon: 'photon', core: 'Photon Cannon', upgrade: 'Photon Cannon Module', maxUpgrades: 3, color: 'amber', sc: 'core', why: 'Dependable general-purpose starship weapon.', next: 'Prefer one upgraded weapon family over multiple half-finished sets.' },
        positron: { name: 'Positron Ejector', short: 'POS', icon: 'positron', core: 'Positron Ejector', upgrade: 'Positron Ejector Module', maxUpgrades: 3, color: 'violet', sc: 'core', why: 'Close-range weapon specialization.', next: 'Test performance at your usual engagement distances.' },
        shield: { name: 'Deflector Shield', short: 'SHD', icon: 'shield', core: 'Deflector Shield', upgrade: 'Starship Shield Module', maxUpgrades: 3, color: 'blue', sc: 'upgrade', why: 'Raises survivability in dogfights and dangerous encounters.', next: 'Replace poor shield rolls when the basic set is complete.' },
        pulse: { name: 'Pulse Engine', short: 'PUL', icon: 'engine', core: 'Pulse Engine', upgrade: 'Pulse Engine Module', maxUpgrades: 3, color: 'mint', sc: 'upgrade', why: 'Better maneuverability and pulse performance make every flight feel better.', next: 'Supercharge a high-roll upgrade where it competes well against your weapon.' },
        hyperdrive: { name: 'Hyperdrive', short: 'HYP', icon: 'hyperdrive', core: 'Hyperdrive', upgrade: 'Hyperdrive Module', maxUpgrades: 3, color: 'violet', sc: 'core', why: 'Greater warp range and efficiency for regional exploration.', next: 'Add known crafted colored-drive technology as needed, beyond the procedural module cap.' },
        launch: { name: 'Launch Thrusters', short: 'LCH', icon: 'launch', core: 'Launch Thruster', upgrade: 'Launch Thruster Module', maxUpgrades: 3, color: 'amber', sc: 'upgrade', why: 'Reduces launch friction on planets and supports efficient travel.', next: 'Install useful crafted launch tech separately when unlocked.' }
      }
    },
    freighter: {
      name: 'Freighter', icon: 'freighter', subtitle: 'Warp & expedition capability',
      placeholder: 'My Freighter',
      note: 'Expedition upgrades are grouped by function. These are planning placeholders: review exact installed technology and fleet stat rolls in-game.',
      goals: {
        expedition: { label: 'Fleet commander', weights: {fleetCombat:5, fleetExplore:5, fleetTrade:5, fleetIndustry:5, fleetFuel:4, freighterWarp:2}, defaults: ['fleetCombat','fleetExplore','fleetTrade','fleetFuel','freighterWarp'], tip: 'Improve fleet specialization and efficiency; use the grid for same-family grouping, not made-up expedition outcome percentages.' },
        warp: { label: 'Maximum warp range', weights: {freighterWarp:8, fleetFuel:3, fleetExplore:2, fleetTrade:2, fleetCombat:2, fleetIndustry:2}, defaults: ['freighterWarp','fleetFuel','fleetExplore'], tip: 'Prioritize the freighter hyperdrive family with a tight cluster and strong warp rolls.' },
        industry: { label: 'Industrial fleet', weights: {fleetIndustry:7, fleetFuel:5, fleetTrade:4, freighterWarp:3, fleetExplore:2, fleetCombat:2}, defaults: ['fleetIndustry','fleetFuel','fleetTrade','freighterWarp'], tip: 'Favor industrial expeditions and fuel efficiency alongside enough warp capability to reach destinations.' }
      },
      families: {
        freighterWarp: { name: 'Freighter Hyperdrive', short: 'HYP', icon: 'warpFreighter', core: 'Freighter Hyperdrive', upgrade: 'Freighter Hyperdrive Module', maxUpgrades: 3, color: 'violet', sc: 'core', why: 'Expands capital-ship travel capability.', next: 'Use strong hyperdrive modules, and add crafted warp technology when unlocked.' },
        fleetCombat: { name: 'Fleet Combat', short: 'CBT', icon: 'combat', core: null, upgrade: 'Fleet Combat Upgrade', maxUpgrades: 3, color: 'rose', sc: 'upgrade', why: 'Supports the combat specialization of dispatched frigate fleets.', next: 'Improve combat expedition reliability with better fleet coverage.' },
        fleetExplore: { name: 'Fleet Exploration', short: 'EXP', icon: 'explore', core: null, upgrade: 'Fleet Exploration Upgrade', maxUpgrades: 3, color: 'blue', sc: 'upgrade', why: 'Supports exploration expedition stat bonuses.', next: 'Compare installed expedition module classes and rolls.' },
        fleetTrade: { name: 'Fleet Trade', short: 'TRD', icon: 'trade', core: null, upgrade: 'Fleet Trade Upgrade', maxUpgrades: 3, color: 'amber', sc: 'upgrade', why: 'Supports trade expedition specialization.', next: 'Stack compatible modules without exceeding the procedural upgrade limit.' },
        fleetIndustry: { name: 'Fleet Industry', short: 'IND', icon: 'industry', core: null, upgrade: 'Fleet Industrial Upgrade', maxUpgrades: 3, color: 'mint', sc: 'upgrade', why: 'Supports industrial frigate expeditions.', next: 'Prioritize industrial modules when they match your fleet strategy.' },
        fleetFuel: { name: 'Fleet Fuel Efficiency', short: 'FUE', icon: 'fuel', core: null, upgrade: 'Fleet Fuel Efficiency Upgrade', maxUpgrades: 3, color: 'violet', sc: 'upgrade', why: 'Targets the operating cost of frigate expeditions.', next: 'Improve efficiency rolls and compare actual fuel usage in-game.' }
      }
    },
    exocraft: {
      name: 'Exocraft', icon: 'exocraft', subtitle: 'Surface mobility & utilities',
      placeholder: 'My Exocraft', fixedSC: 3,
      note: 'Available exocraft technology differs by vehicle. Confirm that each selected system can be installed in your specific vehicle.',
      goals: {
        travel: { label: 'Planet runner', weights: {engine:7, boost:6, scanner:3, laser:2, cannon:1}, defaults: ['engine','boost','scanner'], tip: 'Mobility and boosting come first for rapid surface travel.' },
        mining: { label: 'Surface mining', weights: {laser:7, engine:5, boost:4, scanner:3, cannon:2}, defaults: ['laser','engine','boost','scanner'], tip: 'Keep the mining laser grouped and retain enough mobility to cross rough terrain.' },
        combat: { label: 'Ground combat', weights: {cannon:7, engine:4, boost:3, laser:2, scanner:1}, defaults: ['cannon','engine','boost'], tip: 'Use a weapon-focused layout, but verify the vehicle can equip the selected cannon upgrades.' }
      },
      families: {
        engine: { name: 'Exocraft Engine', short: 'ENG', icon: 'engine', core: 'Exocraft Engine', upgrade: 'Exocraft Engine Module', maxUpgrades: 3, color: 'mint', sc: 'upgrade', why: 'Supports ground vehicle speed and driving response.', next: 'Compare roll quality before spending supercharged slots.' },
        boost: { name: 'Exocraft Boost', short: 'BST', icon: 'boost', core: 'Exocraft Boost', upgrade: 'Exocraft Boost Module', maxUpgrades: 3, color: 'amber', sc: 'upgrade', why: 'Helps cross large stretches of planetary terrain.', next: 'Group supporting boost tech with its core system.' },
        laser: { name: 'Exocraft Mining Laser', short: 'MNE', icon: 'laser', core: 'Exocraft Mining Laser', upgrade: 'Exocraft Mining Laser Module', maxUpgrades: 3, color: 'blue', sc: 'upgrade', why: 'Enables gathering surface resources from your vehicle.', next: 'Check the exact available laser modules on this exocraft type.' },
        cannon: { name: 'Exocraft Cannon', short: 'CAN', icon: 'cannon', core: 'Exocraft Cannon', upgrade: 'Exocraft Cannon Module', maxUpgrades: 3, color: 'rose', sc: 'core', why: 'A weapon-focused vehicle loadout for hostile surfaces.', next: 'Avoid spending SC slots on combat if your vehicle is mainly for travel.' },
        scanner: { name: 'Exocraft Scanner', short: 'SCN', icon: 'scanner', core: 'Exocraft Signal Booster', upgrade: null, maxUpgrades: 0, color: 'violet', sc: 'core', why: 'Planetary utility scanning; its crafted scanner progression is vehicle-dependent.', next: 'Install any compatible blueprint upgrades independently; no fictitious procedural modules are added here.' }
      }
    }
  }
});
