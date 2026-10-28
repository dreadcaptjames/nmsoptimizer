/* ATLAS MAX • Corvette construction planning, separate from slot-based technology.
   Curated part names from Voyagers/Breach/Cosmos; not a physical snap simulator. */
(function(){
'use strict';
const parts=[
  ['titan-cockpit','Titan-Class Cockpit','Cockpits','cockpit','ship','fore','exterior','Militaristic command module. Only one cockpit can be planned.'],
  ['ambassador-cockpit','Ambassador-Class Cockpit','Cockpits','cockpit','ship','fore','exterior','Minimalist, panoramic cockpit design.'],
  ['thunderbird-cockpit','Thunderbird-Class Cockpit','Cockpits','cockpit','ship','fore','exterior','Outlaw-inspired control module.'],
  // FORSAKEN 7.10: cockpit families named in official Hello Games patch notes.
  // Numbered variants are planner identifiers; official individual variant names remain unpublished.
  ['forsaken-vantage-cockpit','Vantage-Class Cockpit','Forsaken · Cockpits','cockpit','ship','fore','exterior','Forsaken 7.10. Ultra-wide cockpit with a panoramic view and minimal interior.'],
  ['forsaken-hornet-cockpit-1','Hornet-Class Cockpit · Variant 1','Forsaken · Cockpits','cockpit','ship','fore','exterior','Forsaken 7.10. Insectoid segmented cockpit. Variant number is a planner label, not an official item name.'],
  ['forsaken-hornet-cockpit-2','Hornet-Class Cockpit · Variant 2','Forsaken · Cockpits','cockpit','ship','fore','exterior','Forsaken 7.10. Insectoid segmented cockpit. Variant number is a planner label, not an official item name.'],
  ['forsaken-hornet-cockpit-3','Hornet-Class Cockpit · Variant 3','Forsaken · Cockpits','cockpit','ship','fore','exterior','Forsaken 7.10. Insectoid segmented cockpit. Variant number is a planner label, not an official item name.'],
  ['forsaken-viper-cockpit-1','Viper-Class Cockpit · Variant 1','Forsaken · Cockpits','cockpit','ship','fore','exterior','Forsaken 7.10. Underlit leather-bound panels and gridded viewport. Variant number is a planner label, not an official item name.'],
  ['forsaken-viper-cockpit-2','Viper-Class Cockpit · Variant 2','Forsaken · Cockpits','cockpit','ship','fore','exterior','Forsaken 7.10. Underlit leather-bound panels and gridded viewport. Variant number is a planner label, not an official item name.'],
  ['forsaken-viper-cockpit-3','Viper-Class Cockpit · Variant 3','Forsaken · Cockpits','cockpit','ship','fore','exterior','Forsaken 7.10. Underlit leather-bound panels and gridded viewport. Variant number is a planner label, not an official item name.'],
  ['forsaken-mantis-cockpit-1','Mantis-Class Cockpit · Variant 1','Forsaken · Cockpits','cockpit','ship','fore','exterior','Forsaken 7.10. Reinforced framework with configurable vents and fuselage. Variant number is a planner label, not an official item name.'],
  ['forsaken-mantis-cockpit-2','Mantis-Class Cockpit · Variant 2','Forsaken · Cockpits','cockpit','ship','fore','exterior','Forsaken 7.10. Reinforced framework with configurable vents and fuselage. Variant number is a planner label, not an official item name.'],
  ['forsaken-mantis-cockpit-3','Mantis-Class Cockpit · Variant 3','Forsaken · Cockpits','cockpit','ship','fore','exterior','Forsaken 7.10. Reinforced framework with configurable vents and fuselage. Variant number is a planner label, not an official item name.'],
  // The patch confirms new habs, hull structures and Legion-class interiors, but not every part name.
  // Generic hull/hab entries are explicit placeholders, not invented exact in-game item names.
  ['forsaken-hab-placeholder','Forsaken Hab (planning placeholder)','Forsaken · Hull & interiors','appearance','freighter','mid','exterior','New Forsaken habs are confirmed; individual part names and technology effects are not yet verified. Planning-only hull piece; does not satisfy functional habitation requirement.'],
  ['forsaken-hull-placeholder','Biomechanical Hull (planning placeholder)','Forsaken · Hull & interiors','appearance','ship','mid','exterior','New biomechanical hull structures are confirmed; individual names, snap rules and technology effects have not been verified. Decorative planning placeholder only.'],
  ['forsaken-legion-interior','Legion-Class Interior Modules','Forsaken · Hull & interiors','utility','freighter','mid','interior','Forsaken 7.10. Cruiser-style Legion-class habitation interiors with low ceilings and recessed light; plan module quantities as interior furnishings.'],
  ['titan-hab','Titan-Class Hab','Habitation','hab','freighter','mid','exterior','Main walkable habitation volume.'],
  ['ambassador-hab','Ambassador-Class Hab','Habitation','hab','freighter','mid','exterior','Rounded, elegant living quarters.'],
  ['thunderbird-hab','Thunderbird-Class Hab','Habitation','hab','freighter','mid','exterior','Industrial, practical living quarters.'],
  ['titan-walk','Titan-Class Walkway','Habitation','structure','freighter','mid','exterior','Link sections of the ship.'],
  ['ambassador-walk','Ambassador-Class Walkway','Habitation','structure','freighter','mid','exterior','Habitation connector section.'],
  ['thunderbird-walk','Thunderbird-Class Walkway','Habitation','structure','freighter','mid','exterior','Habitation connector section.'],
  ['titan-bay','Titan-Class Landing Bay','Access & landing','access','launch','mid','exterior','Exterior entry and access system.'],
  ['ambassador-bay','Ambassador-Class Landing Bay','Access & landing','access','launch','mid','exterior','Exterior entry and access system.'],
  ['thunderbird-bay','Thunderbird-Class Landing Bay','Access & landing','access','launch','mid','exterior','Exterior entry and access system.'],
  ['landing-gear','Landing Gear','Access & landing','landing','launch','mid','exterior','Required landing-support component.'],
  ['hydraulic-legs','Hydraulic Legs','Access & landing','landing','suspension','mid','exterior','Alternative landing-support component.'],
  ['mag-landing','Mag-Field Landing Thrusters','Access & landing','landing','launch','mid','exterior','Alternative landing component.'],
  ['heavy-landing','Heavy Landing Gear','Access & landing','landing','launch','mid','exterior','Heavy landing support.'],
  ['zenith-reactor','Zenith-Class Reactor','Reactors','reactor','warpFreighter','mid','exterior','Reactor module associated with ship technology.'],
  ['medusa-reactor','Medusa-Class Reactor','Reactors','reactor','engine','mid','exterior','Reactor module associated with ship technology.'],
  ['azimuth-reactor','Azimuth-Class Reactor','Reactors','reactor','engine','mid','exterior','Reactor variation for system planning.'],
  ['ceto-reactor','Ceto-Class Reactor','Reactors','reactor','shield','mid','exterior','Reactor variation for system planning.'],
  ['titan-booster','Titan Heavy Booster','Engines','engine','engine','aft','exterior','Heavy propulsion module; affects flight characteristics.'],
  ['ambassador-booster','Ambassador Heavy Booster','Engines','engine','engine','aft','exterior','Heavy propulsion module.'],
  ['thunderbird-booster','Thunderbird Heavy Booster','Engines','engine','engine','aft','exterior','Heavy propulsion module.'],
  ['arcadia-booster','Arcadia Heavy Booster','Engines','engine','engine','aft','exterior','Heavy propulsion alternative.'],
  ['ambassador-sublight','Ambassador Sublight Thruster','Engines','engine','boost','aft','exterior','Supplementary sublight propulsion.'],
  ['titan-sublight','Titan Sublight Thruster','Engines','engine','boost','aft','exterior','Supplementary sublight propulsion.'],
  ['echo-jets','Twin Echo Jets','Engines','engine','boost','aft','exterior','Additional thruster styling and propulsion.'],
  ['photon-array','Photon Cannon Array','Weapons','weapon','photon','fore','exterior','Offensive Corvette weapons system.'],
  ['phase-array','Phase Beam Array','Weapons','weapon','beam','fore','exterior','Beam-based Corvette weapon.'],
  ['torpedo','Torpedo Launcher','Weapons','weapon','cannon','fore','exterior','Torpedo weapon module.'],
  ['cyclotron','Cyclotron Defence Cannon','Weapons','weapon','cannon','fore','exterior','Cyclotron-style Corvette weapon module.'],
  ['infra-knife','Infra-Knife Platform','Weapons','weapon','infra','fore','exterior','Rapid-fire Corvette weapon module.'],
  ['deadeye','Deadeye Cannon','Weapons','weapon','cannon','fore','exterior','Expedition-linked weapon; choose only if obtained.'],
  ['deflector','Deflector Shield','Defensive systems','shield','shield','mid','exterior','Shield generator that contributes to Corvette protection.'],
  ['ion-barrier','Ion Barrier','Defensive systems','shield','shield','mid','exterior','Shield generator option.'],
  ['high-energy','High-Energy Shield','Defensive systems','shield','shield','mid','exterior','Shield generator option.'],
  ['defence-field','Defence Field','Defensive systems','shield','shield','mid','exterior','Additional shield generator option.'],
  ['aeron-shield','Aeron Powershield','Defensive systems','shield','shield','mid','exterior','Specialized defensive option.'],
  ['titan-wing','Titan Wing Module','Wings & structure','wing','ship','mid','exterior','Wing / flight-stabilizer silhouette component.'],
  ['osprey-wing','Osprey Wing Module','Wings & structure','wing','ship','mid','exterior','Wing / flight-stabilizer component.'],
  ['arcadia-wing','Arcadia Wing Module','Wings & structure','wing','ship','mid','exterior','Wing / flight-stabilizer component.'],
  ['ambassador-wing','Ambassador Wing Module','Wings & structure','wing','ship','mid','exterior','Wing / flight-stabilizer component.'],
  ['tractor','Tractor Beam','External utilities','utility','grav','aft','exterior','Cosmos-era utility for retrieving physical cargo from space salvage.'],
  ['mission-radar','Mission Radar','Interior amenities','utility','scanner','mid','interior','Onboard mission interface. Constructed within the ship.'],
  ['refiner-unit','Refiner Unit','Interior amenities','utility','refiner','mid','interior','Onboard resource refining.'],
  ['nutrition-unit','Nutrition Unit','Interior amenities','utility','food','mid','interior','Onboard food processing.'],
  ['living-wall','Living Wall','Interior amenities','utility','life','mid','interior','Grow and harvest onboard plants.'],
  ['med-bay','Medical Bay','Interior amenities','utility','life','mid','interior','Furnished medical area; a quality-of-life facility.']
].map(([id,name,section,group,icon,zone,kind,description])=>({id,name,section,group,icon,zone,kind,description,limit:group==='cockpit'?1:(kind==='interior'?30:12)}));
const byId=Object.fromEntries(parts.map(p=>[p.id,p]));
const required=[['cockpit','Cockpit'],['hab','Habitation module'],['access','Access / landing bay'],['landing','Landing gear'],['reactor','Reactor'],['engine','Main engine / thruster'],['weapon','Weapon system']];
const goals={
 balanced:{label:'Balanced explorer',tip:'Cover all seven required structural categories first, then add a shield, utility and crew comfort.'},
 combat:{label:'Combat Corvette',tip:'Build around a valid core, then prioritize weapon variety, defenses and propulsion. In-game rolls still decide actual performance.'},
 range:{label:'Long-range traveller',tip:'Start with reactors and propulsion; size and weight affect handling. Verify real hyperdrive range after assembly.'},
 crew:{label:'Mobile crew base',tip:'Use extra habitation and interior amenities to create a useful walkable home. Interiors are not part of this structural count.'},
 salvage:{label:'Salvage specialist',tip:'Include the Cosmos Tractor Beam and working onboard utilities for recovering and processing cargo.'},
 courier:{label:'Forsaken courier',tip:'Space courier contracts are available at deep-space outposts. The game requires a Corvette and a Gravitino Coil; the coil is not a Corvette construction module. This preset is only a starter manifest.'}
};
function defaults(){return{name:'',cls:'S',goal:'balanced',style:'Titan',primaryWeapon:'auto',counts:{},zones:{},generated:false,dirty:false,selected:null};}
function normalize(raw){const p=defaults();if(!raw||typeof raw!=='object')return p;
 p.name=String(raw.name||'').slice(0,80);p.cls=['C','B','A','S'].includes(raw.cls)?raw.cls:'S';
 p.goal=goals[raw.goal]?raw.goal:'balanced';p.primaryWeapon=['auto','photon','beam','rockets','cyclotron','infra','cv-deadeye'].includes(raw.primaryWeapon)?raw.primaryWeapon:'auto';p.style=['Titan','Ambassador','Thunderbird','Mixed','Forsaken'].includes(raw.style)?raw.style:'Titan';
 for(const part of parts){const val=Number(raw.counts?.[part.id]);if(Number.isInteger(val)&&val>0)p.counts[part.id]=Math.min(val,part.limit);if(['fore','mid','aft'].includes(raw.zones?.[part.id]))p.zones[part.id]=raw.zones[part.id];}
 // Exactly one cockpit, consistent across imports and manual edits.
 const cockpits=parts.filter(t=>t.group==='cockpit'&&p.counts[t.id]);for(const c of cockpits.slice(1))delete p.counts[c.id];
 p.generated=!!raw.generated;p.dirty=!!raw.dirty;p.selected=byId[raw.selected]?raw.selected:null;return p;
}
function assess(p){const byGroup={};let exterior=0,interior=0;
 for(const part of parts){const count=p.counts[part.id]||0;byGroup[part.group]=(byGroup[part.group]||0)+count;if(part.kind==='interior')interior+=count;else exterior+=count;}
 const missing=required.filter(([id])=>!byGroup[id]);return{missing,byGroup,exterior,interior,ready:missing.length===0};}
const stylePiece={Titan:['titan-cockpit','titan-hab','titan-bay','titan-booster','titan-wing'],Ambassador:['ambassador-cockpit','ambassador-hab','ambassador-bay','ambassador-booster','ambassador-wing'],Thunderbird:['thunderbird-cockpit','thunderbird-hab','thunderbird-bay','thunderbird-booster','osprey-wing'],Mixed:['titan-cockpit','thunderbird-hab','ambassador-bay','arcadia-booster','arcadia-wing'],Forsaken:['forsaken-vantage-cockpit','titan-hab','titan-bay','titan-booster','forsaken-hull-placeholder']};
function generate(goalId,style,weaponPartId='photon-array'){const goal=goals[goalId]?goalId:'balanced';const [cockpit,hab,access,engine,wing]=stylePiece[style]||stylePiece.Titan;const chosenWeapon=parts.some(part=>part.id===weaponPartId&&part.group==='weapon')?weaponPartId:'photon-array';
 const counts={[cockpit]:1,[hab]:1,[access]:1,'landing-gear':1,'zenith-reactor':1,[engine]:1,[chosenWeapon]:1};
 if(goal==='combat'){counts['ion-barrier']=1;counts['deflector']=1;counts[wing]=2;}
 else if(goal==='range'){counts['medusa-reactor']=1;counts['ambassador-sublight']=1;counts[wing]=2;counts['deflector']=1;}
 else if(goal==='crew'){counts[hab]=2;counts['mission-radar']=1;counts['nutrition-unit']=1;counts['refiner-unit']=1;counts['med-bay']=1;counts[wing]=2;}
 else if(goal==='salvage'){counts['tractor']=1;counts['refiner-unit']=1;counts['mission-radar']=1;counts['deflector']=1;counts[wing]=1;}
 else if(goal==='courier'){counts['mission-radar']=1;counts['refiner-unit']=1;counts['deflector']=1;counts[wing]=1;}
 else{counts['deflector']=1;counts[wing]=2;counts['mission-radar']=1;}
 return counts;
}
// Only construction parts with a known inventory representation create technology tiles.
// Relationship = functional stat/system supported by the part; it is not proof
// of an in-game adjacency bonus. Reactors deliberately stay separate families.
const systemRelations={
 'zenith-reactor':{family:'cv-zenith',link:'hyperdrive',label:'Hyperdrive range',note:'Zenith contributes to hyperdrive performance. Vanilla reactor-to-hyperdrive adjacency is not confirmed.'},
 'medusa-reactor':{family:'cv-medusa',link:'pulse',label:'Flight maneuverability',note:'Medusa contributes to maneuverability. Do not assume a Pulse Drive adjacency bonus.'},
 'azimuth-reactor':{family:'cv-azimuth',link:'launch',label:'Launch / system recharge',note:'Azimuth is associated with recharge and flight utility. Adjacency is unverified.'},
 'ceto-reactor':{family:'cv-ceto',link:'shield',label:'Defensive systems',note:'Ceto affects defence; a direct shield adjacency bonus is not confirmed.'},
 'photon-array':{family:'photon',link:'photon',label:'Photon Cannon',adjacent:true},
 'phase-array':{family:'beam',link:'beam',label:'Phase Beam',adjacent:true},
 'torpedo':{family:'rockets',link:'rockets',label:'Rocket / torpedo weapons',adjacent:true},
 'cyclotron':{family:'cyclotron',link:'cyclotron',label:'Cyclotron',adjacent:true},
 'infra-knife':{family:'infra',link:'infra',label:'Infra-Knife',adjacent:true},
 'deadeye':{family:'cv-deadeye',link:'photon',label:'Deadeye weapon',note:'Special expedition-linked weapon. Its exact adjacency family is not assumed.'}
};
const weaponFamilyByPart=Object.fromEntries(Object.entries(systemRelations).filter(([id,relation])=>byId[id]?.group==='weapon').map(([id,relation])=>[id,relation.family]));
const weaponPartByFamily=Object.fromEntries(Object.entries(weaponFamilyByPart).map(([id,family])=>[family,id]));
const specialFamilies={
 'cv-zenith':{name:'Zenith Reactor',short:'ZEN',icon:'warpFreighter',color:'violet',sc:'construction',adjacency:'none',maxUpgrades:0,why:'Corvette-built reactor associated with hyperdrive range; adjacency not assumed.',next:'Check the installed module in-game.'},
 'cv-medusa':{name:'Medusa Reactor',short:'MED',icon:'engine',color:'mint',sc:'construction',adjacency:'none',maxUpgrades:0,why:'Corvette-built reactor associated with maneuverability; adjacency not assumed.',next:'Check the installed module in-game.'},
 'cv-azimuth':{name:'Azimuth Reactor',short:'AZI',icon:'engine',color:'amber',sc:'construction',adjacency:'none',maxUpgrades:0,why:'Corvette-built reactor associated with system recharge; adjacency not assumed.',next:'Check the installed module in-game.'},
 'cv-ceto':{name:'Ceto Reactor',short:'CET',icon:'shield',color:'blue',sc:'construction',adjacency:'none',maxUpgrades:0,why:'Corvette-built reactor associated with defence; adjacency not assumed.',next:'Check the installed module in-game.'},
 'cv-cockpit':{name:'Corvette Cockpit',short:'CPT',icon:'ship',color:'blue',sc:'none',adjacency:'none',maxUpgrades:0,why:'Cockpit construction-generated technology; shared reactor capacity/installation order can matter in-game.',next:'Check which modules actually appear when finalizing the build.'},
 'cv-hab':{name:'Habitation / Cargo',short:'HAB',icon:'freighter',color:'amber',sc:'none',adjacency:'none',maxUpgrades:0,why:'Habitation and walkway components provide structural or cargo-related functionality.',next:'Some structural parts may occupy technology space; verify the inventory.'},
 'cv-deadeye':{name:'Deadeye Cannon',short:'DED',icon:'cannon',color:'rose',sc:'construction',adjacency:'none',maxUpgrades:0,why:'Expedition weapon technology, modeled separately pending verified adjacency data.',next:'Check the in-game tooltip.'}
};
const sharedTechGroups={cockpit:{family:'cv-cockpit',link:'pulse',label:'Cockpit / flight controls'},hab:{family:'cv-hab',label:'Cargo / habitation'},structure:{family:'cv-hab',label:'Cargo / habitation'},landing:{family:'launch',link:'launch',label:'Launch systems',adjacent:true},engine:{family:'pulse',link:'pulse',label:'Pulse Drive',adjacent:true},shield:{family:'shield',link:'shield',label:'Shield Systems',adjacent:true}};
const groupCaps={cockpit:1,hab:3,landing:3,engine:3,shield:3};
function technologyManifest(counts){
 const tiles=[],statuses={},usage={};
 for(const part of parts){
  const count=Math.max(0,Math.min(part.limit,Number(counts?.[part.id])||0));
  const relation=systemRelations[part.id]||sharedTechGroups[part.group];
  if(!relation){statuses[part.id]={represented:0,cosmetic:count,relation:null};continue;}
  const pool=part.group==='structure'?'hab':part.group;
  const shared=Object.hasOwn(groupCaps,pool);
  const key=shared?pool:part.id;
  const max=shared?groupCaps[pool]:3;
  const remaining=Math.max(0,max-(usage[key]||0));
  const represented=Math.min(count,remaining);
  usage[key]=(usage[key]||0)+represented;
  statuses[part.id]={represented,cosmetic:count-represented,relation};
  for(let n=1;n<=represented;n++)tiles.push({
   id:`cvpart:${part.id}:${n}`,family:relation.family,role:'construction',sequence:n,
   partId:part.id,linkFamily:relation.link||null,relationLabel:relation.label,
   relationNote:relation.note||'',label:`${part.name}${count>1?' · '+n:''}`,icon:part.icon,
   noAdjacency:!relation.adjacent,construction:true
  });
 }
 return {tiles,statuses};
}
window.ATLAS_CORVETTE=Object.freeze({parts:Object.freeze(parts),byId:Object.freeze(byId),required:Object.freeze(required),goals:Object.freeze(goals),defaults,normalize,assess,generate,
 technologyManifest,weaponFamilyByPart:Object.freeze(weaponFamilyByPart),weaponPartByFamily:Object.freeze(weaponPartByFamily),specialFamilies:Object.freeze(specialFamilies)});
window.ATLAS_DATA.gear.corvette={name:'Corvette',icon:'corvette',subtitle:'Modular ship assembly & crew systems',placeholder:'My Corvette',kind:'assembly',goals,families:{}};
window.ATLAS_DATA.sources.push({name:'Forsaken 7.10 official patch notes',url:'https://www.nomanssky.com/forsaken-update/'},{name:'Voyagers Corvette construction',url:'https://www.nomanssky.com/voyagers-update/'},{name:'Cosmos Tractor Beam',url:'https://www.nomanssky.com/cosmos-update/'});
})();
