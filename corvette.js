/* ATLAS MAX • Corvette construction planning, separate from slot-based technology.
   Curated part names from Voyagers/Breach/Cosmos; not a physical snap simulator. */
(function(){
'use strict';
const parts=[
  ['titan-cockpit','Titan-Class Cockpit','Cockpits','cockpit','ship','fore','exterior','Militaristic command module. Only one cockpit can be planned.'],
  ['ambassador-cockpit','Ambassador-Class Cockpit','Cockpits','cockpit','ship','fore','exterior','Minimalist, panoramic cockpit design.'],
  ['thunderbird-cockpit','Thunderbird-Class Cockpit','Cockpits','cockpit','ship','fore','exterior','Outlaw-inspired control module.'],
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
 salvage:{label:'Salvage specialist',tip:'Include the Cosmos Tractor Beam and working onboard utilities for recovering and processing cargo.'}
};
function defaults(){return{name:'',cls:'S',goal:'balanced',style:'Titan',counts:{},zones:{},generated:false,dirty:false,selected:null};}
function normalize(raw){const p=defaults();if(!raw||typeof raw!=='object')return p;
 p.name=String(raw.name||'').slice(0,80);p.cls=['C','B','A','S'].includes(raw.cls)?raw.cls:'S';
 p.goal=goals[raw.goal]?raw.goal:'balanced';p.style=['Titan','Ambassador','Thunderbird','Mixed'].includes(raw.style)?raw.style:'Titan';
 for(const part of parts){const val=Number(raw.counts?.[part.id]);if(Number.isInteger(val)&&val>0)p.counts[part.id]=Math.min(val,part.limit);if(['fore','mid','aft'].includes(raw.zones?.[part.id]))p.zones[part.id]=raw.zones[part.id];}
 // Exactly one cockpit, consistent across imports and manual edits.
 const cockpits=parts.filter(t=>t.group==='cockpit'&&p.counts[t.id]);for(const c of cockpits.slice(1))delete p.counts[c.id];
 p.generated=!!raw.generated;p.dirty=!!raw.dirty;p.selected=byId[raw.selected]?raw.selected:null;return p;
}
function assess(p){const byGroup={};let exterior=0,interior=0;
 for(const part of parts){const count=p.counts[part.id]||0;byGroup[part.group]=(byGroup[part.group]||0)+count;if(part.kind==='interior')interior+=count;else exterior+=count;}
 const missing=required.filter(([id])=>!byGroup[id]);return{missing,byGroup,exterior,interior,ready:missing.length===0};}
const stylePiece={Titan:['titan-cockpit','titan-hab','titan-bay','titan-booster','titan-wing'],Ambassador:['ambassador-cockpit','ambassador-hab','ambassador-bay','ambassador-booster','ambassador-wing'],Thunderbird:['thunderbird-cockpit','thunderbird-hab','thunderbird-bay','thunderbird-booster','osprey-wing'],Mixed:['titan-cockpit','thunderbird-hab','ambassador-bay','arcadia-booster','arcadia-wing']};
function generate(goalId,style){const goal=goals[goalId]?goalId:'balanced';const [cockpit,hab,access,engine,wing]=stylePiece[style]||stylePiece.Titan;const counts={[cockpit]:1,[hab]:1,[access]:1,'landing-gear':1,'zenith-reactor':1,[engine]:1,'photon-array':1};
 if(goal==='combat'){counts['infra-knife']=1;counts['ion-barrier']=1;counts['deflector']=1;counts[wing]=2;}
 else if(goal==='range'){counts['medusa-reactor']=1;counts['ambassador-sublight']=1;counts[wing]=2;counts['deflector']=1;}
 else if(goal==='crew'){counts[hab]=2;counts['mission-radar']=1;counts['nutrition-unit']=1;counts['refiner-unit']=1;counts['med-bay']=1;counts[wing]=2;}
 else if(goal==='salvage'){counts['tractor']=1;counts['refiner-unit']=1;counts['mission-radar']=1;counts['deflector']=1;counts[wing]=1;}
 else{counts['deflector']=1;counts[wing]=2;counts['mission-radar']=1;}
 return counts;
}
window.ATLAS_CORVETTE=Object.freeze({parts:Object.freeze(parts),byId:Object.freeze(byId),required:Object.freeze(required),goals:Object.freeze(goals),defaults,normalize,assess,generate});
window.ATLAS_DATA.gear.corvette={name:'Corvette',icon:'corvette',subtitle:'Modular ship assembly & crew systems',placeholder:'My Corvette',kind:'assembly',goals,families:{}};
window.ATLAS_DATA.sources.push({name:'Voyagers Corvette construction',url:'https://www.nomanssky.com/voyagers-update/'},{name:'Cosmos Tractor Beam',url:'https://www.nomanssky.com/cosmos-update/'});
})();
