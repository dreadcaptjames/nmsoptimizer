/* ATLAS MAX expanded equipment catalogs (Oct 2026).
   Named blueprint tech is independent of rolled-module cap; default selections
   are conservative starting points, not ownership assertions. */
(function(){
'use strict';
const D=window.ATLAS_DATA;
const add=(id,name,icon,def=false,extra={})=>({id,name,icon,default:def,...extra});
const fam=(section,name,short,icon,color,core,upgrade,addons=[],extra={})=>({section,name,short,icon,color,core:core||null,upgrade:upgrade||null,maxUpgrades:upgrade?3:0,sc:upgrade?'upgrade':core?'core':'none',adjacency:(!core&&!upgrade)?'none':undefined,addons,why:'Group compatible technology and reserve supercharged slots for the most effective systems in your build.',next:'Check actual module quality and slot adjacency in-game.',...extra});
const base=['roamer','nomad','pilgrim','colossus'];
const all=[...base,'minotaur','nautilon'];
const weights=(pairs)=>Object.fromEntries(pairs.split(' ').map(x=>x.split(':')).map(([k,v])=>[k,Number(v)]));
const goal=(label,weightString,defaults,tip,byVehicle)=>({label,weights:weights(weightString),defaults,tip,...(byVehicle?{defaultsByVehicle:byVehicle}:{})});
D.sources.push(
 {name:'Multi-tool technologies',url:'https://www.nomansskyresources.com/multi-tool-blueprints'},
 {name:'Starship technologies',url:'https://www.nomansskyresources.com/starship-blueprints'},
 {name:'Freighter technologies',url:'https://www.nomansskyresources.com/freighter-blueprints'},
 {name:'Exocraft technologies',url:'https://www.nomansskyresources.com/exocraft-blueprints'},
 {name:'Remnant update (gravity tool)',url:'https://www.nomanssky.com/2026/02/no-mans-sky-remnant/'}
);
const mt=D.gear.multitool;
mt.subtitle='Every weapon, scanner, mining upgrade & special tool';
mt.note='Weapons and alternate-fire utilities are intentionally optional. Sentinel upgrades and some exotic components depend on your specific Multi-tool and progression. U1–U3 are rolled-module placeholders, not fixed stat rolls. The Gravitino Coil was introduced with Remnant in 2026.';
mt.goals={
 combat:goal('Sentinel destroyer','neutron:9 boltcaster:7 pulse:8 scatter:8 blaze:6 paralysis:7 volatile:3 mining:2 scanner:1 visor:1 terrain:1 special:3 grav:2 forbidden:5 cloak:4','neutron,mining,scanner,visor,paralysis,cloak'.split(','),'Choose one main damage system; combine stun tools with the Voltaic Amplifier if unlocked, without assuming arbitrary adjacency between unrelated utility tech.'),
 mining:goal('Resource harvester','mining:10 terrain:7 scanner:4 visor:5 special:2 grav:4 neutron:2 boltcaster:1 pulse:1 scatter:1 blaze:1 paralysis:1 volatile:1 forbidden:1 cloak:1','mining,terrain,scanner,visor,grav'.split(','),'Prioritize Mining Beam, Optical Drill and advanced mining blueprints. The Terrain Manipulator and Gravitino Coil are separate tools.'),
 survey:goal('Survey & discoveries','scanner:9 visor:10 mining:5 terrain:3 special:5 grav:2 neutron:1 boltcaster:1 pulse:1 scatter:1 blaze:1 paralysis:1 volatile:1 forbidden:1 cloak:1','scanner,visor,mining,terrain,special'.split(','),'Focus scanning reward rolls, Analysis Visor and Survey Device; specialized Autophage detection is unlocked separately.')
};
mt.families={
 scanner:fam('Scanning & surveying','Scanner','SCN','scanner','blue','Scanner','Scanner Module',[
   add('wave','Waveform Recycler','scanner',true)],{why:'Scanner Modules improve reward values; the Waveform Recycler is a crafted scanner blueprint.',next:'Inspect flora, fauna, mineral and scan-radius rolls on your installed modules.'}),
 visor:fam('Scanning & surveying','Analysis Visor','VIS','eye','violet','Analysis Visor',null,[
   add('survey','Survey Device','scanner',true)],{sc:'none',adjacency:'none',why:'The Analysis Visor and Survey Device unlock scanning modes, including resource hotspot surveys; do not treat them as scanner reward modules.'}),
 special:fam('Scanning & surveying','Autophage Detection','AUT','sentinel','amber',null,null,[
   add('harmoniser','Scan Harmoniser','scanner'),add('polyphonic','Polyphonic Core','anomaly')],{why:'Progression-related technology for detecting Autophage and harmonic sites. Not a generic combat buff.'}),
 mining:fam('Mining & terrain','Mining Beam','MIN','mining','mint','Mining Beam','Mining Beam Module',[
   add('drill','Optical Drill','mining',true),add('advanced','Advanced Mining Laser','laser',true),add('resonator','Plasma Resonator','boost',true)],{why:'Additional named mining blueprints coexist with up to three rolled Mining Beam modules.',next:'Keep Optical Drill and your strongest rolled Mining Beam modules together.'}),
 terrain:fam('Mining & terrain','Terrain Manipulator','TRN','mining','amber','Terrain Manipulator',null,[],{sc:'none',adjacency:'none',why:'Digging and terrain shaping are a different system from the Mining Beam; no procedural slots are invented.'}),
 neutron:fam('Primary weapons','Neutron Cannon','NEU','neutron','violet','Neutron Cannon','Neutron Cannon Module',[
   add('pfield','P-Field Compressor','neutron',true)],{sc:'core',why:'Charged area damage with its own upgrades, not interchangeable with the Boltcaster.'}),
 boltcaster:fam('Primary weapons','Boltcaster','BLT','boltcaster','rose','Boltcaster','Boltcaster Module',[
   add('barrel','Barrel Ioniser','cannon',true),add('ricochet','Boltcaster Ricochet Module','scatter'),add('sm','Boltcaster SM','boost')],{sc:'core',why:'Burst-fire weapon with several crafted attachments. Sentinel boltcaster bonuses should be assessed in-game.'}),
 pulse:fam('Primary weapons','Pulse Spitter','PLS','spitter','rose','Pulse Spitter','Pulse Spitter Module',[
   add('cartridge','Amplified Cartridges','module',true),add('igniter','Impact Igniter','heat',true),add('ricochet','Pulse Spitter Ricochet Module','scatter')],{sc:'core',why:'Rapid fire weapon. Impact Igniter is a named blueprint, not a fourth upgrade module.'}),
 scatter:fam('Primary weapons','Scatter Blaster','SCT','scatter','amber','Scatter Blaster','Scatter Blaster Module',[
   add('greaser','Shell Greaser','module',true)],{sc:'core',why:'Close-range shotgun-style damage; cluster crafted support and rolled weapon upgrades.'}),
 blaze:fam('Primary weapons','Blaze Javelin','BLZ','laser','blue','Blaze Javelin','Blaze Javelin Module',[
   add('accelerator','Mass Accelerator','boost',true),add('oscillator','Waveform Oscillator','radiation',true)],{sc:'core',why:'Precision charged weapon with crafted damage and stun additions.'}),
 paralysis:fam('Secondary & defense','Paralysis Mortar','PAR','radiation','blue','Paralysis Mortar',null,[
   add('voltaic','Voltaic Amplifier','boost',true)],{sc:'none',adjacency:'none',why:'Stun launcher; Voltaic Amplifier gives additional damage to stunned targets across weapons. The planner does not assign fake adjacency buffs to that utility.'}),
 volatile:fam('Secondary & defense','Grenade Weapons','GRN','cannon','rose',null,null,[
   add('plasma','Plasma Launcher','cannon'),add('geology','Geology Cannon','mining')],{why:'Choose optional explosive alternate-fire technologies individually; neither has an invented three-module upgrade family.'}),
 cloak:fam('Secondary & defense','Defense & Cloaking','DEF','shield','mint',null,null,[
   add('cloak','Cloaking Device','eye',true),add('field','Personal Forcefield','shield'),add('scope','Combat Scope','scanner')],{why:'Utility and alternate-fire tech used for repositioning, blocking shots and aiming; no fabricated adjacency score.'}),
 grav:fam('Secondary & defense','Gravitino Coil','GRV','grav','violet','Gravitino Coil',null,[],{sc:'none',adjacency:'none',why:'The Remnant gravity tool grabs and manipulates objects. Not a normal projectile weapon upgrade.'}),
 forbidden:fam('Rare / special','Sentinel Weapon Modules','SNT','sentinel','violet',null,'Forbidden Multi-tool Module',[],{why:'Salvaged Sentinel modules provide special rolled bonuses. Check whether they benefit your actual installed weapon or mining systems.'})
};
const ship=D.gear.starship;
ship.subtitle='All major ship weapons, drive systems & onboard utilities';
ship.note='Conventional starships only. Solar Vesper Sail and Sentinel technology are ship-specific; install only if your ship has them. Corvette technology grids and living-ship organic equipment require their own models. Purple-system access requires the newer Atlantid Drive.';
ship.goals={
 combat:goal('Space dogfighter','infra:9 photon:7 positron:7 beam:7 cyclotron:7 rockets:6 shield:7 pulse:6 hyperdrive:2 launch:3 scanners:1 utility:1 solar:3 sentinel:3','infra,shield,pulse,launch,hyperdrive'.split(','),'Focus on one primary weapon family, shields and maneuverability. You can include other weapons if your ship has the space.'),
 explorer:goal('Long-range explorer','hyperdrive:10 pulse:7 launch:7 shield:5 infra:2 photon:2 positron:2 beam:2 cyclotron:2 rockets:1 scanners:5 utility:4 solar:5 sentinel:3','hyperdrive,pulse,launch,shield,scanners,utility'.split(','),'Put Hyperdrive and color-star drive blueprints together, while retaining launch efficiency and mapping tools.'),
 balanced:goal('All-purpose captain','infra:7 photon:5 positron:5 beam:4 cyclotron:5 rockets:3 shield:7 pulse:7 hyperdrive:7 launch:6 scanners:3 utility:4 solar:3 sentinel:3','infra,shield,pulse,hyperdrive,launch,scanners'.split(','),'One main gun, a robust shield cluster and upgraded travel systems make a practical daily ship.')
};
ship.families={
 launch:fam('Flight & travel','Launch Thrusters','LCH','launch','amber','Launch Thrusters','Launch Thruster Module',[
   add('auto','Launch Auto-Charger','reroute',true),add('efficient','Efficient Thrusters','launch',true),add('aqua','Aqua Jets','water')],{why:'Launch Auto-Charger, Efficient Thrusters, and water landing tech are distinct crafted technologies.'}),
 pulse:fam('Flight & travel','Pulse Engine','PUL','engine','mint','Pulse Engine','Pulse Engine Module',[
   add('sub','Sub-Light Amplifier','boost',true),add('instability','Instability Drive','engine',true),add('assist','Flight Assist Override','boost',true),add('photonix','Photonix Core','photon')],{why:'Maneuverability and boost benefit from crafted flight tech and rolled modules. Photonix Core may depend on acquisition.'}),
 hyperdrive:fam('Flight & travel','Hyperdrive & Stellar Drives','HYP','hyperdrive','violet','Hyperdrive','Hyperdrive Module',[
   add('cadmium','Cadmium Drive','heat'),add('emeril','Emeril Drive','toxic'),add('indium','Indium Drive','cold',true),add('atlantid','Atlantid Drive','anomaly',true)],{why:'Crafted star-color drives are not procedural modules; Atlantid Drive grants access to purple systems.'}),
 shield:fam('Flight & travel','Deflector Shield','SHD','shield','blue','Deflector Shield','Starship Shield Module',[
   add('ablative','Ablative Armour','shield',true)],{why:'Ablative Armour is an extra crafted shield technology, separate from rolled shielding modules.'}),
 photon:fam('Starship weapons','Photon Cannon','PHO','photon','amber','Photon Cannon','Photon Cannon Module',[
   add('nonlinear','Nonlinear Optics','photon',true)],{sc:'core',why:'Standard starship weapon; Nonlinear Optics is a crafted technology attachment.'}),
 beam:fam('Starship weapons','Phase Beam','BEM','beam','blue','Phase Beam','Phase Beam Module',[
   add('fourier','Fourier De-Limiter','boost',true)],{sc:'core',why:'Beam weapon useful against enemy shields; has separate crafted technology.'}),
 positron:fam('Starship weapons','Positron Ejector','POS','positron','rose','Positron Ejector','Positron Ejector Module',[
   add('fragment','Fragment Supercharger','scatter',true)],{sc:'core',why:'Short-range weapon with its own family; not automatically a better choice in every encounter.'}),
 infra:fam('Starship weapons','Infra-Knife Accelerator','INK','infra','rose','Infra-Knife Accelerator','Infra-Knife Module',[
   add('qres','Q-Resonator','boost',true)],{sc:'core',why:'High fire-rate damage option with a separate crafted Q-Resonator.'}),
 cyclotron:fam('Starship weapons','Cyclotron Ballista','CYC','neutron','violet','Cyclotron Ballista','Cyclotron Ballista Module',[
   add('dyson','Dyson Pump','boost',true)],{sc:'core',why:'Charged-particle starship weapon with its own upgrade family.'}),
 rockets:fam('Starship weapons','Rocket Launcher','RKT','rocket','amber','Rocket Launcher',null,[
   add('tubes','Large Rocket Tubes','rocket',true)],{sc:'core',why:'Optional burst-damage rocket weapon; no invented procedural Rocket Launcher Module slots.'}),
 scanners:fam('Utilities & scanners','System Scanners','SCN','scanner','blue',null,null,[
   add('economy','Economy Scanner','trade',true),add('conflict','Conflict Scanner','combat',true)],{why:'Information tools for the galaxy map rather than weapon or warp stats.'}),
 utility:fam('Utilities & scanners','Ship Utilities','UTL','toolkit','mint',null,null,[
   add('teleport','Teleport Receiver','summon',true),add('cargo','Cargo Scan Deflector','shield'),add('warp','Emergency Warp Unit','hyperdrive')],{why:'Independent convenience and safety technologies; they do not share imaginary adjacency bonuses.'}),
 solar:fam('Specialized ship technology','Solar Ship Sail','SOL','spark','amber',null,null,[
   add('vesper','Vesper Sail','spark')],{why:'Vesper Sail is specific to Solar-class starships; other ship classes cannot freely install it.'}),
 sentinel:fam('Specialized ship technology','Sentinel Interceptor Systems','SEN','sentinel','violet',null,null,[
   add('brain','Pilot Interface','sentinel'),add('landing','Antigravity Well','launch',false,{replacesCore:'launch'}),add('luminance','Luminance Engine','engine',false,{replacesCore:'pulse'}),add('crimson','Crimson Core','hyperdrive',false,{replacesCore:'hyperdrive'}),add('aeron','Aeron Shield','shield',false,{replacesCore:'shield'}),add('cannon','Sentinel Cannon','cannon',false,{replacesCore:'photon'})],{why:'These five Interceptor core parts replace standard launch, engine, hyperdrive, shielding and photon systems. If selected, the optimizer suppresses the matching standard core but still permits compatible rolled upgrades; adjacency for cross-family core replacements is conservatively not scored.'})
};
const fr=D.gear.freighter;
fr.subtitle='Hyperdrive, fleet expeditions & command utilities';
fr.note='Freighter hyperdrive blueprints and expedition modules are different. Single-item utilities (Matter Beam, Interstellar Scanner, Singularity Engine) are optional; Singularity Engine availability is limited. Fleet expedition modules are planning placeholders for procedural upgrades; compare actual bonuses in-game.';
fr.goals={
 expedition:goal('Fleet commander','freighterWarp:4 fleetCombat:8 fleetExplore:8 fleetTrade:8 fleetIndustry:8 fleetFuel:7 fleetSpeed:6 freightUtility:3 freightStory:1 freightTrails:0','freighterWarp,fleetCombat,fleetExplore,fleetTrade,fleetIndustry,fleetFuel,fleetSpeed,freightUtility'.split(','),'Choose a strong spread of fleet specializations and boost expedition performance; specific fleet-stat rolls are not known by this planner.'),
 warp:goal('Maximum warp range','freighterWarp:10 fleetCombat:1 fleetExplore:2 fleetTrade:1 fleetIndustry:1 fleetFuel:2 fleetSpeed:2 freightUtility:5 freightStory:1 freightTrails:0','freighterWarp,freightUtility'.split(','),'Cluster Freighter Hyperdrive with its crafted range and star-color units and your best rolled modules.'),
 industry:goal('Industrial fleet','freighterWarp:5 fleetCombat:3 fleetExplore:4 fleetTrade:6 fleetIndustry:10 fleetFuel:8 fleetSpeed:6 freightUtility:4 freightStory:1 freightTrails:0','freighterWarp,fleetIndustry,fleetTrade,fleetFuel,fleetSpeed,freightUtility'.split(','),'Prioritize industrial expedition bonuses, fleet efficiency, and convenient transfers.')
};
fr.families={
 freighterWarp:fam('Freighter travel','Freighter Hyperdrive','HYP','warpFreighter','violet','Freighter Hyperdrive','Freighter Hyperdrive Module',[
   add('core1','Warp Core Resonator','hyperdrive',true),add('core2','Plasmatic Warp Injector','boost',true),add('core3','Reality De-threader','anomaly',true),
   add('red','Amplified Warp Shielding','heat'),add('green','Chromatic Warp Shielding','toxic'),add('blue','Temporal Warp Computer','cold',true),add('purple','Resonance Matrix','atlas',true)],{sc:'core',why:'Seven independently selectable crafted travel technologies, including the newer purple-star Resonance Matrix, plus rolled hyperdrive upgrades.'}),
 fleetCombat:fam('Fleet expedition upgrades','Fleet Combat','CBT','combat','rose',null,'Fleet Combat & Defence Module',[],{why:'Rolled capital-ship module improving frigate fleet combat expedition statistics.'}),
 fleetExplore:fam('Fleet expedition upgrades','Fleet Exploration','EXP','explore','blue',null,'Fleet Exploration & Scientific Module',[],{why:'Rolled capital-ship module improving exploration frigate expedition statistics.'}),
 fleetTrade:fam('Fleet expedition upgrades','Fleet Trade','TRD','trade','amber',null,'Fleet Trade Module',[],{why:'Rolled module improving fleet trade expedition statistics.'}),
 fleetIndustry:fam('Fleet expedition upgrades','Fleet Industry','IND','industry','mint',null,'Fleet Industrial & Mining Module',[],{why:'Rolled module improving industrial/mining frigate expeditions.'}),
 fleetFuel:fam('Fleet expedition upgrades','Fleet Fuel Efficiency','FUE','fuel','violet',null,'Fleet Fuel Efficiency Module',[],{why:'Rolled module affecting expedition fuel usage.'}),
 fleetSpeed:fam('Fleet expedition upgrades','Fleet Expedition Speed','SPD','boost','blue',null,'Fleet Expedition Speed Module',[],{why:'Rolled expedition speed bonus. Treat as its own technology category, not a boost to the freighter pulse engine.'}),
 freightUtility:fam('Fleet command','Freighter Utilities','UTL','toolkit','mint',null,null,[
   add('matter','Matter Beam','summon',true),add('scanner','Interstellar Scanner','scanner',true)],{why:'Freighter-specific quality-of-life components with independent functions and no assumed adjacency bonuses.'}),
 freightStory:fam('Story / specialized','Expedition & Quest Technology','QST','atlas','violet',null,null,[
   add('singularity','Singularity Engine','anomaly'),add('atmospheric','Atmospheric Control Unit','oxygen')],{why:'Specialized or progression-dependent freighter systems, not universally obtainable player upgrades.'}),
 freightTrails:fam('Cosmetic options','Freighter Engine Trails','TRL','spark','rose',null,null,[
   add('standard','Standard Freighter Trail','spark'),add('emeril','Emeril Freighter Trail','toxic'),add('gravity','High Gravity Freighter Trail','grav'),add('gold','Golden Freighter Trail','atlas'),add('antimatter','Antimatter Freighter Trail','anomaly'),add('hadal','Hadal Freighter Trail','water'),add('crimson','Crimson Freighter Trail','heat')],{why:'Optional freighter appearance technologies. They should not use supercharged slots for statistical reasons.'})
};
const ex=D.gear.exocraft;
ex.subtitle='Vehicle-specific planetary systems and upgrades';
ex.note='Select your exact vehicle first. Standard Exocraft, Minotaur and Nautilon use different upgrade families; cross-vehicle modules are hidden. Story-mech body parts may be quest-specific. Positions and capacity are examples until you match your real unlocked inventory.';
ex.vehicleOptions={roamer:'Roamer',nomad:'Nomad',pilgrim:'Pilgrim',colossus:'Colossus',minotaur:'Minotaur',nautilon:'Nautilon'};
ex.goals={
 travel:goal('Planet runner','engine:10 boost:10 suspension:6 vehicleScanner:4 hazardSystems:3 laser:2 cannon:1 flame:1 vehicleUtility:3 mechDrive:10 mechJump:10 mechScanner:4 mechAI:2 nautDrive:10 nautSonar:5 nautLaser:2','engine,boost,suspension,vehicleScanner,hazardSystems'.split(','),'Engine and mobility first. Different vehicles use different propulsion and scanning blueprints.',{minotaur:['mechDrive','mechJump','mechScanner'],nautilon:['nautDrive','nautSonar']}),
 mining:goal('Surface mining','engine:5 boost:5 suspension:2 vehicleScanner:5 hazardSystems:2 laser:10 cannon:1 flame:1 vehicleUtility:7 mechDrive:6 mechJump:4 mechLaser:10 mechScanner:4 mechAI:2 nautDrive:6 nautLaser:10 nautSonar:7','engine,boost,laser,vehicleScanner,vehicleUtility'.split(','),'Group your vehicle’s correct laser technology with its own modules; not every Exocraft can install the same mining beam.',{minotaur:['mechDrive','mechLaser','mechScanner','mechAI'],nautilon:['nautDrive','nautLaser','nautSonar']}),
 combat:goal('Ground combat','engine:5 boost:5 suspension:2 vehicleScanner:2 hazardSystems:3 laser:2 cannon:10 flame:8 vehicleUtility:1 mechDrive:5 mechJump:4 mechLaser:3 mechCannon:10 mechFlame:9 mechAI:7 nautDrive:5 nautCannon:10 nautSonar:5','engine,boost,cannon,flame,hazardSystems'.split(','),'Optimize the correct vehicle-mounted weapons; Minotaur and Nautilon have their own weapon families.',{minotaur:['mechDrive','mechJump','mechCannon','mechFlame','mechAI'],nautilon:['nautDrive','nautCannon','nautSonar']})
};
ex.families={
 engine:fam('Standard vehicle propulsion','Fusion Engine','ENG','engine','mint','Fusion Engine','Exocraft Engine Module',[
   add('icarus','Icarus Fuel System','fuel',true,{noAdjacency:true})],{vehicles:base,why:'Core drive and rolled engine modules for Roamer, Nomad, Pilgrim and Colossus.'}),
 boost:fam('Standard vehicle propulsion','Exocraft Boost','BST','boost','amber','Exocraft Boost','Exocraft Boost Module',[],{vehicles:base,why:'Surface vehicle boosts; Minotaur jumps and Nautilon propulsion use different systems.'}),
 suspension:fam('Standard vehicle propulsion','Suspension & Handling','SUS','suspension','blue',null,null,[
   add('drift','Drift Suspension','boost'),add('grip','Grip Boost Suspension','shield'),add('slide','Hi-Slide Suspension','boost')],{vehicles:base,why:'Selectable handling changes for conventional wheeled or hover Exocraft.'}),
 laser:fam('Standard vehicle tools','Exocraft Mining Laser','MNE','mining','mint','Exocraft Mining Laser','Exocraft Laser Module',[
   add('advanced','Advanced Exocraft Mining Laser','laser',true)],{vehicles:base,why:'Standard planetary mining laser. Does not generate Minotaur or Nautilon-only hardware.'}),
 cannon:fam('Standard vehicle tools','Mounted Cannon','CAN','cannon','rose','Mounted Cannon','Exocraft Cannon Module',[],{vehicles:base,sc:'core',why:'Surface-mounted explosive weapon. Minotaur and Nautilon instead have named dedicated cannons.'}),
 flame:fam('Standard vehicle tools','Mounted Flamethrower','FLM','flame','rose','Mounted Flamethrower',null,[],{vehicles:base,sc:'core',why:'Short-range flame weapon on compatible standard vehicles; choose if your vehicle has the blueprint.'}),
 vehicleScanner:fam('Standard vehicle tools','Exocraft Radar','RAD','scanner','blue','Exocraft Radar',null,[
   add('amplifier','Radar Amplifier','scanner',true),add('resonator','Radar Power Resonator','scanner',true),add('cyclops','Cyclops Scope','eye',true)],{vehicles:base,why:'Ground radar and analysis-visor convenience technologies.'}),
 vehicleUtility:fam('Standard vehicle tools','Mining & Cargo Utilities','UTL','toolkit','amber',null,null,[
   add('blade','Excavation Blade','mining'),add('rig','Mineral Processing Rig','refiner',false,{vehicles:['colossus']})],{vehicles:base,why:'Excavation Blade is a vehicle collision harvester; Mineral Processing Rig is only for Colossus.'}),
 hazardSystems:fam('Vehicle environment','Hazard Defenses','HAZ','hazard','violet',null,null,[
   add('toxic','Air Filtration Unit','toxic'),add('rad','Neutron Shielding','radiation'),add('cold','Megawatt Heater','cold'),add('heat','Thermal Buffer','heat')],{vehicles:base,why:'Four independently selectable environment protections for standard Exocraft.'}),
 mechDrive:fam('Minotaur movement','Daedalus Engine','ENG','engine','mint','Daedalus Engine','Minotaur Engine Module',[
   add('servos','Self-Greasing Servos','fuel',true),add('icarus','Icarus Fuel System','fuel',true,{noAdjacency:true})],{vehicles:['minotaur'],why:'Minotaur-only drive system with its own procedural motor enhancements.'}),
 mechJump:fam('Minotaur movement','Minotaur Jumpjets','JMP','jetpack','amber','Minotaur Jumpjets',null,[
   add('ariadne','Ariadne’s Flame','boost',true)],{vehicles:['minotaur'],why:'Powered jump capabilities for the Minotaur; distinct from conventional vehicle boost modules.'}),
 mechLaser:fam('Minotaur mining & combat','Minotaur Laser','MIN','mining','mint','Minotaur Laser','Minotaur Laser Module',[
   add('precision','Precision Minotaur Laser','laser',true),add('bore','Minotaur Bore','mining',true)],{vehicles:['minotaur'],why:'Mining and terrain-editing capabilities particular to the Minotaur.'}),
 mechCannon:fam('Minotaur mining & combat','Minotaur Cannon','CAN','cannon','rose','Minotaur Cannon','Minotaur Cannon Module',[],{vehicles:['minotaur'],sc:'core',why:'Dedicated Minotaur ranged cannon, not interchangeable with the standard Mounted Cannon.'}),
 mechFlame:fam('Minotaur mining & combat','Minotaur Flamethrower','FLM','flame','rose','Minotaur Flamethrower','Minotaur Flamethrower Module',[],{vehicles:['minotaur'],sc:'core',why:'Minotaur-exclusive flamethrower family.'}),
 mechScanner:fam('Minotaur intelligence','Minotaur Scanner','SCN','scanner','blue','Minotaur Radar Array',null,[],{vehicles:['minotaur'],sc:'none',adjacency:'none',why:'Dedicated Minotaur radar scanner.'}),
 mechAI:fam('Minotaur intelligence','Minotaur AI & Sentinel','AI','sentinel','violet',null,null,[
   add('ai','Minotaur AI Pilot','eye',true),add('hardframe','Hardframe Body','shield'),add('legs','Hardframe Legs','boots'),add('arms','Hardframe Right Arm','gauntlet'),add('left','Hardframe Left Arm','gauntlet')],{vehicles:['minotaur'],why:'AI autopilot and progression-dependent Sentinel Hardframe technologies; verify available parts on your save.'}),
 nautDrive:fam('Nautilon propulsion','Humboldt Drive','ENG','water','blue','Humboldt Drive','Humboldt Drive Module',[
   add('osmotic','Osmotic Generator','fuel',true)],{vehicles:['nautilon'],why:'Submarine-specific drive and efficiency enhancements.'}),
 nautLaser:fam('Nautilon mining','Tethys Beam','MIN','laser','mint','Tethys Beam',null,[
   add('dredge','Dredging Laser','mining',true)],{vehicles:['nautilon'],why:'Nautilon-only mining beam plus terrain excavation capability.'}),
 nautCannon:fam('Nautilon combat','Nautilon Cannon','CAN','cannon','rose','Nautilon Cannon','Nautilon Cannon Module',[],{vehicles:['nautilon'],sc:'core',why:'Submarine explosive weapon with its own procedural cannon upgrades.'}),
 nautSonar:fam('Nautilon scanning','High-Power Sonar','SON','sonar','blue','High-Power Sonar',null,[],{vehicles:['nautilon'],sc:'none',adjacency:'none',why:'Submerged points-of-interest sonar; not the standard Exocraft Radar system.'})
};
})();
