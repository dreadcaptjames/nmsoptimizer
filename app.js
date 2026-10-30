(function(){
'use strict';
const DATA=window.ATLAS_DATA;
const SOLVER=window.ATLAS_SOLVER;
const ICONS=window.ATLAS_ICONS;
const CV=window.ATLAS_CORVETTE;
const STORAGE='atlas-max-v1';
const gearKeys=Object.keys(DATA.gear);
// Corvette construction modules can generate inventory technology tiles.
// The two views share a manifest, while explicit Optimize remains the only
// operation that rearranges the player's entire technology layout.
const cvSharedFamilies=['launch','pulse','hyperdrive','shield','photon','beam','positron','infra','cyclotron','rockets','scanners','utility'];
const cvTechFamilies={...Object.fromEntries(cvSharedFamilies.map(id=>[id,DATA.gear.starship.families[id]]).filter(x=>x[1])),...CV.specialFamilies};
const cvWeaponFamilies=['photon','beam','positron','rockets','cyclotron','infra','cv-deadeye','cv-dematerialisation','cv-venom'];
const cvConstructionToTechnologyGoal=Object.freeze({combat:'combat',range:'explorer',balanced:'balanced',crew:'balanced',salvage:'balanced',courier:'explorer'});
// Corvette priorities must be independent of the standard starship preset.
// In particular, a chosen primary weapon MUST NOT override Long Range.
const cvTechGoals=Object.fromEntries(Object.entries(DATA.gear.starship.goals).map(([id,goal])=>{
 const weights={...goal.weights,
  'cv-zenith':goal.weights.hyperdrive||0,'cv-medusa':goal.weights.pulse||0,
  'cv-azimuth':goal.weights.launch||0,'cv-ceto':goal.weights.shield||0,
  'cv-limos':0,'cv-proboscis':0,'cv-chelone':0,
  'cv-cockpit':0,'cv-hab':0,'cv-deadeye':0,'cv-dematerialisation':0,'cv-venom':0};
 if(id==='explorer')Object.assign(weights,{
  hyperdrive:10,'cv-zenith':9,pulse:8,'cv-medusa':7,
  launch:6,'cv-azimuth':5,shield:3,'cv-ceto':2
 });
 if(id==='balanced')Object.assign(weights,{
  pulse:7,'cv-medusa':6,hyperdrive:6,'cv-zenith':6,
  shield:6,'cv-ceto':5,launch:5,'cv-azimuth':4
 });
 if(id==='combat')Object.assign(weights,{
  shield:6,'cv-ceto':6,pulse:5,'cv-medusa':5,
  hyperdrive:2,'cv-zenith':2,launch:1,'cv-azimuth':1
 });
 // Weapons only receive intentional priority for Combat or modest priority
 // in Balanced builds. Long Range reserves its SC budget for travel systems.
 for(const weapon of cvWeaponFamilies)weights[weapon]=0;
 return [id,{...goal,weights,
  tip:id==='explorer'?'Prioritize hyperdrive and propulsion before defensive systems. Weapons do not receive supercharged priority in this focus.':goal.tip}];
}));
const cvTechGear={...DATA.gear.starship,name:'Corvette technology',families:cvTechFamilies,goals:cvTechGoals};
// A selected Corvette weapon influences combat builds, not travel builds.
function chosenCorvetteWeapon(p){
 const installed=Object.entries(p.counts||{}).filter(([id,count])=>count>0&&CV.weaponFamilyByPart[id]).map(([id])=>CV.weaponFamilyByPart[id]);
 const enabled=(p.tech?.enabled||[]).filter(id=>cvWeaponFamilies.includes(id));
 if(p.primaryWeapon!=='auto'&&(installed.includes(p.primaryWeapon)||enabled.includes(p.primaryWeapon)))return p.primaryWeapon;
 return installed[0]||enabled[0]||null;
}
function corvetteGearForProfile(p){
 const chosen=chosenCorvetteWeapon(p);
 const goals=Object.fromEntries(Object.entries(cvTechGoals).map(([id,g])=>{
  const weights={...g.weights};
  if(chosen && id==='combat')weights[chosen]=10;
  else if(chosen && id==='balanced')weights[chosen]=4;
  // Explorer always keeps ALL weapons at zero, including installed ones.
  return [id,{...g,weights}];
 }));
 return {...cvTechGear,goals};
}

let cvTechMode='charge';
const app=document.getElementById('app');
let editing='move',selectedCell=null,activeTile=null,toastTimer=null;
let technologyQuery='',configOpen=false,insightsOpen=false,dragFrom=null;
const expandedAddons=new Set(['jetpack','life','hazard','underwater','mining','hyperdrive','freighterWarp','launch','mechLaser']);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||min));
const uniqueValid=(xs,size)=>[...new Set((Array.isArray(xs)?xs:[]).filter(x=>Number.isInteger(x)&&x>=0&&x<size))];
const wantedSC=(key,cls)=>DATA.gear[key].fixedSC || ({C:1,B:2,A:3,S:4}[cls]||4);
// No sample supercharged coordinates: every new profile starts without markers.
// Players must mark the positions from their own in-game inventory.
function canUse(f,vehicle){return !f.vehicles || !vehicle || f.vehicles.includes(vehicle);}
function availableFamilies(gear,vehicle){return Object.entries(gear.families).filter(([id,f])=>canUse(f,vehicle));}
function goalDefaults(gear,goal,vehicle){const g=gear.goals[goal];return (g.defaultsByVehicle?.[vehicle] || g.defaults).filter(id=>gear.families[id]&&canUse(gear.families[id],vehicle));}
function defaultAddons(gear,vehicle){
  return availableFamilies(gear,vehicle).flatMap(([id,f])=>(f.addons||[]).filter(a=>a.default&&canUse(a,vehicle)).map(a=>id+':'+a.id));
}
function validAddons(gear,raw,vehicle){
  const request=new Set(Array.isArray(raw)?raw:[]),out=[],exclusive=new Set();
  for(const [id,f] of availableFamilies(gear,vehicle))for(const addon of f.addons||[]){
    if(!request.has(id+':'+addon.id)||!canUse(addon,vehicle))continue;
    const group=addon.exclusive?id+':'+addon.exclusive:null;
    if(group&&exclusive.has(group))continue;
    if(group)exclusive.add(group);
    out.push(id+':'+addon.id);
  }
  return out;
}
// Every construction-generated tile is identified by part id and copy number.
// Refreshing the manifest preserves tile coordinates and manual swaps wherever
// possible. Newly added physical parts are inserted immediately without running
// the optimizer or creating optional rolled upgrades automatically.
function syncCorvetteTechnology(tech,counts,oldLayout=tech.layout){
  const fixed=CV.technologyManifest(counts).tiles;
  tech.fixedTiles=fixed;
  if(!fixed.length&&!oldLayout){tech.layout=null;return;}
  const size=tech.cols*tech.rows;
  const blocked=new Set(tech.blocked);
  const oldPositions=new Map();
  if(oldLayout&&Array.isArray(oldLayout.tiles)&&Array.isArray(oldLayout.map)&&oldLayout.map.length===size){
    for(let position=0;position<size;position++){
      const idx=oldLayout.map[position],item=oldLayout.tiles[idx];
      if(idx>=0 && item && typeof item.id==='string' && !oldPositions.has(item.id))oldPositions.set(item.id,position);
    }
  }
  // Import validation: only catalog-derived optional technologies can survive.
  // Linked construction tiles are always rebuilt from actual selected parts.
  const requested=SOLVER.assemble(cvTechGear,{...tech,fixedTiles:[]},size+150).tiles;
  const ordinaryAllowed=new Map(requested.map(item=>[item.id,item]));
  const seen=new Set(),ordinary=[];
  if(oldLayout&&Array.isArray(oldLayout.tiles))for(const tile of oldLayout.tiles){
    if(!tile||tile.role==='construction'||!ordinaryAllowed.has(tile.id)||seen.has(tile.id))continue;
    seen.add(tile.id);ordinary.push(ordinaryAllowed.get(tile.id));
  }
  const placed=[],map=Array(size).fill(-1),skipped=[];
  const positionOf=id=>{
    const prev=oldPositions.get(id);
    return prev!==undefined&&!blocked.has(prev)&&map[prev]===-1?prev:-1;
  };
  const chooseSlot=item=>{
    let pos=positionOf(item.id);
    if(pos>=0)return pos;
    const open=[];for(let i=0;i<size;i++)if(!blocked.has(i)&&map[i]<0)open.push(i);
    if(!open.length)return -1;
    // An addition is placed near an existing linked system only when we have
    // modeled an adjacency-capable family. Reactors have only functional links.
    if(!item.noAdjacency){
      const neighbours=open.filter(i=>SOLVER.getNeighbors(i,tech.cols,tech.rows).some(j=>{
        const other=placed[map[j]];
        return other && other.family===item.family && !other.noAdjacency;
      }));
      if(neighbours.length)return neighbours[0];
    }
    return open[0];
  };
  const install=(item,pos)=>{if(pos<0){skipped.push(item);return;}map[pos]=placed.length;placed.push(item);};
  // Existing physical tile coordinates are protected before new additions.
  for(const item of fixed){const pos=positionOf(item.id);if(pos>=0)install(item,pos);}
  for(const item of fixed){if(placed.some(t=>t.id===item.id))continue;install(item,chooseSlot(item));}
  for(const item of ordinary)install(item,chooseSlot(item));
  tech.layout=placed.length||skipped.length?{tiles:placed,map,skipped,requested:fixed.length+ordinary.length}:null;
  // The shared family's enabled checkboxes remain opt-in; no automatic optimization.
}
function corvetteTechProfile(raw,cls='S',counts={}){
  const profile=normalizeProfile('starship',raw||null);
  profile.cls=cls;
  if(!raw){profile.cols=10;profile.rows=6;profile.sc=[];profile.scExample=false;profile.layout=null;profile.dirty=false;profile.goal='balanced';
    profile.enabled=profile.enabled.filter(id=>!cvWeaponFamilies.includes(id));}
  profile.optimized=!!raw?.optimized || !!(raw?.layout?.tiles||[]).some(x=>x?.role==='upgrade');
  profile.enabled=profile.enabled.filter(id=>cvSharedFamilies.includes(id)&&!!cvTechGear.families[id]);
  profile.addons=validAddons(cvTechGear,profile.addons,profile.vehicle);
  profile.sc=uniqueValid(profile.sc,profile.cols*profile.rows).filter(x=>!profile.blocked.includes(x)).slice(0,4);
  profile.scExample=false;
  // normalizeProfile validates standard technology, then this imports the
  // linked physical modules using the current count manifest (never raw IDs).
  syncCorvetteTechnology(profile,counts,raw?.layout||profile.layout);
  return profile;
}
function defaultProfile(key){
  if(key==='corvette')return {...CV.defaults(),tech:corvetteTechProfile(null,'S',{})};
  const gear=DATA.gear[key],goal=Object.keys(gear.goals)[0],cls='S',vehicle=gear.vehicleOptions?Object.keys(gear.vehicleOptions)[0]:null;
  const cols=key==='exosuit'?10:8,rows=key==='exosuit'?6:5;
  return {name:'',cls,goal,vehicle,cols,rows,sc:[],blocked:[],scExample:false,enabled:goalDefaults(gear,goal,vehicle),addons:defaultAddons(gear,vehicle),catalogVersion:2,depth:3,target:'S',layout:null,dirty:false,...(vehicle?{savedVehicles:{}}:{})};
}
function initialState(){return {version:1,current:'starship',equipment:Object.fromEntries(gearKeys.map(k=>[k,defaultProfile(k)]))};}
function normalizeProfile(key,raw){
  if(key==='corvette'){const profile=CV.normalize(raw);profile.tech=corvetteTechProfile(raw?.tech,profile.cls,profile.counts);return profile;}
  const base=defaultProfile(key),gear=DATA.gear[key];
  if(!raw||typeof raw!=='object')return base;
  const p={...base};
  p.name=String(raw.name||'').slice(0,80);
  p.vehicle=gear.vehicleOptions?.[raw.vehicle]?raw.vehicle:base.vehicle;
  p.cls=['C','B','A','S'].includes(raw.cls)?raw.cls:'S';
  p.goal=gear.goals[raw.goal]?raw.goal:base.goal;
  p.cols=clamp(raw.cols,6,10);p.rows=clamp(raw.rows,3,6);
  p.scExample=raw.scExample!==false;
  p.sc=uniqueValid(raw.sc,p.cols*p.rows).slice(0,10);
  p.blocked=uniqueValid(raw.blocked,p.cols*p.rows);
  p.sc=p.sc.filter(pos=>!p.blocked.includes(pos));
  p.depth=clamp(raw.depth,1,3);p.target=raw.target==='X'?'X':'S';
  p.enabled=[...new Set((Array.isArray(raw.enabled)?raw.enabled:base.enabled).filter(id=>gear.families[id]&&canUse(gear.families[id],p.vehicle)))];
  // Pre-audit exports stored Emergency Warp under Ship Utilities.
  // Preserve ownership and migrate it to the actual Hyperdrive family.
  const oldWarp=key==='starship' && Array.isArray(raw.addons) && raw.addons.includes('utility:warp');
  const addonRequest=Array.isArray(raw.addons)?raw.addons.map(x=>oldWarp&&x==='utility:warp'?'hyperdrive:warp':x):base.addons;
  p.addons=validAddons(gear,addonRequest,p.vehicle);
  if(oldWarp && !p.enabled.includes('hyperdrive'))p.enabled.push('hyperdrive');
  // Upgrade old four-family Exosuit saves without deleting their existing layout.
  const migrating=key==='exosuit'&&!Array.isArray(raw.addons);
  // Existing v1 profiles predate these expanded catalogs. Preserve their hand-built
  // grid, offer the newly recommended systems, and require a manual re-optimization.
  const migratingCatalog=key!=='exosuit'&&Number(raw.catalogVersion||0)<2;
  if(migratingCatalog){
    p.enabled=[...new Set([...p.enabled,...goalDefaults(gear,p.goal,p.vehicle)])];
    p.addons=validAddons(gear,[...p.addons,...defaultAddons(gear,p.vehicle)],p.vehicle);
  }
  if(migrating){
    const old=new Set(['jetpack','shield','life','hazard']);
    p.enabled=[...new Set([...p.enabled,...gear.goals[p.goal].defaults.filter(id=>!old.has(id))])];
  }
  p.dirty=!!raw.dirty;
  // Translate the old utility tile without discarding manually positioned layouts.
  const importedTiles=Array.isArray(raw.layout?.tiles)?raw.layout.tiles.map(t=>
    key==='starship' && t?.role==='crafted' && t.family==='utility' && t.addon==='warp'
      ?{...t,family:'hyperdrive'}:t):null;
  if(raw.layout&&Array.isArray(raw.layout.map)&&Array.isArray(importedTiles)
    &&raw.layout.map.length===p.cols*p.rows&&importedTiles.length<=p.cols*p.rows
    &&raw.layout.map.every(t=>Number.isInteger(t)&&t>=-1&&t<importedTiles.length)
    &&importedTiles.every(t=>t&&gear.families[t.family]&&['core','upgrade','crafted'].includes(t.role)&&Number.isInteger(t.sequence)&&t.sequence>=0&&t.sequence<=3)
    &&raw.layout.map.every((t,i)=>t===-1||!p.blocked.includes(i))){
    // Reconstitute only known family identifiers and safe, known technology labels.
    const tiles=importedTiles.map(t=>{
      const fam=gear.families[t.family];
      if(!canUse(fam,p.vehicle))return null;
      if(t.role==='crafted'){
        const addon=(fam.addons||[]).find(a=>a.id===t.addon&&canUse(a,p.vehicle));
        return addon?{id:t.family+':crafted:'+addon.id,family:t.family,role:'crafted',sequence:0,
          addon:addon.id,label:addon.name,icon:addon.icon||fam.icon,noAdjacency:!!addon.noAdjacency,noSC:!!addon.noSC,adjacencyNote:addon.adjacencyNote||null}:null;
      }
      return {id:t.family+':'+(t.role==='core'?'core':t.sequence),family:t.family,role:t.role,
        sequence:t.sequence,label:t.role==='core'?fam.core:fam.upgrade};
    });
    const seen=new Set();let valid=true;
    for(const t of tiles){
      if(!t||!t.label||seen.has(t.id)){valid=false;break;} seen.add(t.id);
    }
    const usage={};
    for(const t of tiles){if(t.role==='upgrade')usage[t.family]=(usage[t.family]||0)+1;}
    if(Object.entries(usage).some(([id,n])=>n>gear.families[id].maxUpgrades))valid=false;
    if(new Set(raw.layout.map.filter(x=>x!==-1)).size!==raw.layout.map.filter(x=>x!==-1).length)valid=false;
    if(valid){
      const planned=SOLVER.assemble(gear,p,p.cols*p.rows-p.blocked.length);
      p.layout={tiles,map:raw.layout.map.slice(),skipped:planned.skipped,requested:planned.requested};
      if(migrating||migratingCatalog||oldWarp)p.dirty=true;
    }
  }
  if(key==='exocraft'){
    p.savedVehicles={};
    if(raw.savedVehicles && typeof raw.savedVehicles==='object'){
      for(const vehicle of Object.keys(gear.vehicleOptions)){
        if(vehicle===p.vehicle)continue;
        const old=raw.savedVehicles[vehicle];
        if(old && typeof old==='object'){
          const snapshot=normalizeProfile(key,{...old,vehicle,savedVehicles:null});
          delete snapshot.savedVehicles;
          p.savedVehicles[vehicle]=snapshot;
        }
      }
    }
  }
  return p;
}
// Every page load starts with the same clean defaults as the Reset controls.
// Browser-local snapshots may exist for an older version or the current visit,
// but must never be restored automatically. Only the Import button restores builds.
// Normal in-page category changes still use this in-memory state.
let state=initialState();
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch(e){}}
function context(){const key=state.current;return{key,gear:DATA.gear[key],profile:state.equipment[key]};}
function noteChange(){const{profile}=context();profile.dirty=!!profile.layout;save();}
function familyPriority(gear,profile){return profile.enabled.filter(id=>gear.families[id]&&canUse(gear.families[id],profile.vehicle)).sort((a,b)=>(gear.goals[profile.goal].weights[b]||1)-(gear.goals[profile.goal].weights[a]||1));}
function currentStats(gear,profile){return profile.layout?SOLVER.summarize(profile.layout,gear,profile):null;}
function status(profile){return !profile.layout?'Not generated':profile.dirty?'Review changes':'Optimized layout';}
function selectorOptions(values,current,formatter){return values.map(v=>`<option value="${esc(v)}" ${v===current?'selected':''}>${esc(formatter?formatter(v):v)}</option>`).join('');}
function renderTechnologyChoices(gear,profile,goal){
  let section='';const parts=[];
  for(const [id,f] of availableFamilies(gear,profile.vehicle)){
    if((f.section||'Technology')!==section){
      section=f.section||'Technology';
      parts.push(`<h4 class="tech-section-title">${esc(section)}</h4>`);
    }
    const picked=(f.addons||[]).filter(a=>canUse(a,profile.vehicle)&&profile.addons.includes(id+':'+a.id));
    const addons=(f.addons||[]).filter(a=>canUse(a,profile.vehicle));
    const summary=f.core?`Core + ${Math.min(profile.depth,f.maxUpgrades||0)} rolled`:
      f.maxUpgrades?`${Math.min(profile.depth,f.maxUpgrades)} rolled modules`:'Individual blueprints';
    const searchValue=(f.name+' '+f.section+' '+f.core+' '+f.upgrade+' '+addons.map(a=>a.name).join(' ')).toLowerCase();
    const hidden=technologyQuery&&!searchValue.includes(technologyQuery.toLowerCase())?'filtered-out':'';
    const enabled=profile.enabled.includes(id);
    parts.push(`<div class="family-entry ${enabled?'is-enabled':''} ${hidden}" data-search="${esc(searchValue)}">
      <div class="family-row">
        <input type="checkbox" id="fam-${id}" data-family="${id}" ${enabled?'checked':''}>
        <label for="fam-${id}"><span class="fam-topline"><span class="family-icon ${esc(f.color)}">${ICONS.render(f.icon,'family-glyph')}</span><span class="fam-title">${esc(f.name)}</span></span><span class="fam-sub">${esc(summary)}${addons.length?` · ${picked.length}/${addons.length} blueprints`:''}</span></label>
        ${goal.weights[id]>=6?'<span class="family-priority" title="High-priority for this optimization focus">◆</span>':''}
      </div>
      ${addons.length?`<details class="addon-details" data-addon-group="${esc(id)}" ${expandedAddons.has(id)?'open':''}>
        <summary>Blueprints <span>${picked.length}/${addons.length}</span></summary>
        <div class="addon-list">${addons.map(a=>`<label class="addon-row ${enabled?'':'dimmed'}"><input type="checkbox" data-addon="${id}:${esc(a.id)}" ${profile.addons.includes(id+':'+a.id)?'checked':''} ${enabled?'':'disabled'}><span class="addon-glyph ${esc(f.color)}">${ICONS.render(a.icon||f.icon,'family-glyph')}</span><span>${esc(a.name)}</span></label>`).join('')}</div>
      </details>`:''}
    </div>`);
  }
  return parts.join('');
}
function adjacencyFor(i,gear,profile,tile){
  if(!tile||!profile.layout)return [];
  const map=profile.layout.map,tiles=profile.layout.tiles,cols=profile.cols,rows=profile.rows;
  const sides=[['top',i-cols,i>=cols],['bottom',i+cols,i<cols*(rows-1)],['left',i-1,i%cols>0],['right',i+1,i%cols<cols-1]];
  return sides.filter(([side,p,valid])=>valid&&map[p]>=0&&SOLVER.areAdjacent(tile,tiles[map[p]],gear)).map(x=>x[0]);
}
function chrome(key){return `
    <header class="topbar">
      <div class="brand"><span class="brand-icon" aria-hidden="true">⟁</span><div><div class="brand-name">ATLAS <span>MAX</span></div><div class="brand-sub">NO MAN'S SKY <b>·</b> EQUIPMENT LAB</div></div></div>
      <div class="top-actions"><span class="version"><i class="dot"></i> ${esc(DATA.release)} REFERENCE</span><button class="top-link" data-action="import" title="Load saved equipment profiles">⇧ <span>Import</span></button><button class="top-link" data-action="export" title="Download your saved equipment profiles">⇩ <span>Export</span></button><input type="file" id="import-file" accept="application/json,.json" class="sr-only"></div>
    </header>
    <div class="command-heading"><div><span class="eyebrow"><span class="signal-dot"></span> // TRAVELLER LOADOUT COMMAND</span><h1>Build for <em>what's out there.</em></h1><p>Every slot matters. Design the loadout, find your synergies, and bring the plan into your game.</p></div><div class="command-aside"><span>OPERATIONS / 06 SYSTEMS</span><strong>TECHNOLOGY WORKBENCH</strong><small>Offline-ready · Fresh session · Export to keep</small></div></div>
    <nav class="gear-nav" aria-label="Equipment types">${gearKeys.map((k,i)=>`<button class="gear-btn ${k===key?'active':''}" data-action="gear" data-gear="${k}" aria-pressed="${k===key}"><span class="gear-icon">${ICONS.render(DATA.gear[k].icon,'gear-glyph')}</span><span class="gear-text"><b>${esc(DATA.gear[k].name)}</b><small>0${i+1} / EQUIPMENT</small></span><span class="gear-arrow">↗</span></button>`).join('')}</nav>
`; }

// Rebuilding the entire workbench used to jump long blueprint lists back to the top.
// Preserve real scroll containers, expanded groups, and checkbox focus across refreshes.
// Only restore when the user is staying in the same equipment category.
const scrollContainers=['#config-panel','#family-list','.insight-panel',
  '.cv-library','#cv-catalog','.cv-insights','.cv-tech-families','.grid-scroll'];
const persistentDetails=['.cv-tech-library','.cv-tech-family details','.addon-details',
  '.technology-plan','.guide'];
const checkboxKeys=['addon','family','cvTechAddon','cvTechFamily'];
function captureWorkbenchView(){
  if(!app.querySelector || !app.querySelector('.gear-btn.active'))return null;
  const current=app.querySelector('.gear-btn.active').dataset.gear;
  const scrolls=scrollContainers.map(selector=>({selector,positions:
    [...app.querySelectorAll(selector)].map(node=>[node.scrollTop,node.scrollLeft])}));
  const details=persistentDetails.map(selector=>({selector,
    opened:[...app.querySelectorAll(selector)].map(node=>node.open)}));
  const active=document.activeElement;
  const focus=active&&app.contains(active)?checkboxKeys.map(key=>active.dataset?.[key]!=null?
    {key,value:active.dataset[key]}:null).find(Boolean):null;
  return {current,scrolls,details,focus,
    pageX:window.scrollX||0,pageY:window.scrollY||0};
}
function restoreWorkbenchView(view){
  if(!view || view.current!==state.current || !app.querySelectorAll)return;
  // Details must be expanded before restoring scroll; otherwise the browser
  // clamps scrollTop to the shortened list's height.
  for(const group of view.details){
    const nodes=app.querySelectorAll(group.selector);
    group.opened.forEach((opened,i)=>{if(nodes[i])nodes[i].open=opened;});
  }
  if(view.focus){
    const selector=`[data-${view.focus.key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}]`;
    const next=[...app.querySelectorAll(selector)].find(node=>node.dataset[view.focus.key]===view.focus.value);
    if(next&&!next.disabled&&typeof next.focus==='function')next.focus({preventScroll:true});
  }
  for(const group of view.scrolls){
    const nodes=app.querySelectorAll(group.selector);
    group.positions.forEach(([top,left],i)=>{
      if(nodes[i]){nodes[i].scrollTop=top;nodes[i].scrollLeft=left;}
    });
  }
  if(typeof window.scrollTo==='function')window.scrollTo(view.pageX,view.pageY);
}
function render(){
  const view=captureWorkbenchView();
  if(state.current==='corvette'){renderCorvette();restoreWorkbenchView(view);return;}
  const {gear,profile,key}=context(),goal=gear.goals[profile.goal],stats=currentStats(gear,profile);
  const scCount=wantedSC(key,profile.cls),openSlots=profile.cols*profile.rows-profile.blocked.length;
  const tilesInGrid=profile.layout?profile.layout.map.filter(x=>x>=0).length:0;
  const profSC=profile.sc.filter(pos=>!profile.blocked.includes(pos));
  const sorted=familyPriority(gear,profile);
  const scMismatched=profSC.length!==scCount;
  const hasSkipped=profile.layout&&profile.layout.skipped&&profile.layout.skipped.length;
  const pct=Math.round(100*tilesInGrid/Math.max(1,openSlots));
  app.innerHTML=`
    ${chrome(key)}
    <section class="loadout-banner" aria-label="Current loadout">
      <div class="loadout-identity"><span class="loadout-badge">${ICONS.render(gear.icon,'gear-glyph')}</span><div><div class="eyebrow">ACTIVE PROFILE / ${esc(gear.name.toUpperCase())}</div><h2>${esc(profile.name.trim()||gear.name)} <span class="class-badge">${esc(profile.cls)}-CLASS</span></h2><p>${esc(gear.subtitle)}${gear.vehicleOptions?' · '+esc(gear.vehicleOptions[profile.vehicle]):''}</p></div></div>
      <div class="loadout-status ${profile.layout&&!profile.dirty?'ready':''}"><span class="status-dot"></span>${esc(status(profile))}</div>
    </section>
    ${key==='multitool'?`<aside class="forsaken-note" aria-label="Forsaken update for Multi-Tools"><span class="forsaken-tag">NEW IN 7.10 · FORSAKEN</span><div><strong>Larva Cannon Multi-Tool</strong><p>Forsaken traders offer this living Multi-Tool in exchange for preserved grubs. The Larva Cannon is an equipment choice, <em>not a standalone technology module</em>: use this workbench to arrange its actual installed weapons and utilities. A new radial weapon selector is also available in-game.</p></div><a href="https://www.nomanssky.com/forsaken-update/" target="_blank" rel="noopener noreferrer">Official patch notes ↗</a></aside>`:''}
    <div class="workspace">
      <aside class="panel config-panel ${configOpen?'is-open':''}" id="config-panel">
        <div class="panel-heading"><div><div class="eyebrow">01 / CONFIGURE</div><h3>Loadout setup</h3></div><button class="collapse-button" data-action="panel" data-panel="config" aria-expanded="${configOpen}" aria-controls="config-body"><span class="when-closed">Open settings ⌄</span><span class="when-open">Close settings ⌃</span></button></div>
        <div class="config-body" id="config-body">
          <div class="config-block"><div class="form-row"><label class="label" for="gear-name">Loadout name</label><input id="gear-name" class="control" maxlength="80" placeholder="${esc(gear.placeholder)}" value="${esc(profile.name)}"></div>
            <div class="controls-2"><div class="form-row"><label class="label" for="gear-class">Equipment class</label><select id="gear-class" class="control" ${gear.fixedSC?'disabled title="Supercharged slots do not scale with class for this equipment"':''}>${selectorOptions(['C','B','A','S'],profile.cls,v=>v+' class')}</select></div><div class="form-row"><label class="label" for="gear-target">Upgrade target</label><select id="gear-target" class="control">${selectorOptions(['S','X'],profile.target,v=>v+' class')}</select></div></div>
            ${gear.vehicleOptions?`<div class="form-row"><label class="label" for="vehicle">Exocraft model</label><select id="vehicle" class="control">${Object.entries(gear.vehicleOptions).map(([id,name])=>`<option value="${id}" ${profile.vehicle===id?'selected':''}>${esc(name)}</option>`).join('')}</select><p class="tiny">Each vehicle keeps its layout until the page is reloaded. Export to keep it.</p></div>`:''}
            <div class="form-row"><label class="label" for="goal">Optimization focus</label><select id="goal" class="control">${Object.entries(gear.goals).map(([id,g])=>`<option value="${id}" ${id===profile.goal?'selected':''}>${esc(g.label)}</option>`).join('')}</select></div>
            <div class="form-row"><label class="label">Rolled modules / family</label><div class="segmented" role="group" aria-label="Module cap">${[1,2,3].map(i=>`<button data-action="depth" data-depth="${i}" class="${i===profile.depth?'current':''}" aria-pressed="${i===profile.depth}">${i}</button>`).join('')}</div><p class="tiny">Crafted blueprints do not use these slots.</p></div>
          </div>
          <div class="library-heading"><div><span class="eyebrow">02 / TECHNOLOGY LIBRARY</span><h3>Installed systems <span>${sorted.length} selected</span></h3></div></div>
          <div class="library-search"><span aria-hidden="true">⌕</span><label class="sr-only" for="search-tech">Search technology</label><input id="search-tech" type="search" placeholder="Search technology or blueprint" value="${esc(technologyQuery)}" autocomplete="off"></div>
          <div class="family-list" id="family-list">${renderTechnologyChoices(gear,profile,goal)}</div>
          <div class="config-note">Choose your systems and individual blueprints. Nothing auto-generates until you press <strong>Optimize layout</strong>.</div>
        </div>
      </aside>
      <main class="workbench">
        <div class="metrics" aria-label="Technology grid metrics">
          <div class="metric"><span class="metric-icon" aria-hidden="true">▦</span><div><div class="metric-name">OPEN SLOTS</div><div class="metric-value">${openSlots}<span>/${profile.cols*profile.rows}</span></div></div></div>
          <div class="metric purple"><span class="metric-icon" aria-hidden="true">✦</span><div><div class="metric-name">SC PRIORITY</div><div class="metric-value">${stats?stats.effectiveSC:0}<span>/${profSC.length} useful</span></div></div></div>
          <div class="metric"><span class="metric-icon" aria-hidden="true">⌁</span><div><div class="metric-name">ADJACENCY</div><div class="metric-value">${stats?stats.connections:'—'}<span> links</span></div></div></div>
          <div class="metric score"><span class="metric-icon" aria-hidden="true">◈</span><div><div class="metric-name">PLAN SCORE</div><div class="metric-value">${stats?Math.round(stats.score):'—'}</div></div></div>
        </div>
        <section class="panel planner" aria-labelledby="grid-heading">
          <div class="planner-head"><div><div class="eyebrow">03 / TECHNOLOGY MATRIX</div><h2 id="grid-heading">${esc(profile.name.trim()||gear.name)} technology grid</h2><p class="helper">Match your real inventory first. Select technologies to inspect connections and swap positions.</p></div><div class="planner-settings"><label class="sr-only" for="grid-cols">Columns</label><select id="grid-cols" class="small-select">${selectorOptions([6,7,8,9,10],profile.cols,n=>n+' cols')}</select><label class="sr-only" for="grid-rows">Rows</label><select id="grid-rows" class="small-select">${selectorOptions([3,4,5,6],profile.rows,n=>n+' rows')}</select></div></div>
          <div class="modes" role="group" aria-label="Technology grid editing modes"><span class="mode-label">EDIT MODE</span><button data-action="mode" data-mode="move" class="mode ${editing==='move'?'active':''}" aria-pressed="${editing==='move'}">⤧ <span>Move tech</span></button><button data-action="mode" data-mode="charge" class="mode ${editing==='charge'?'active':''}" aria-pressed="${editing==='charge'}">✦ <span>Supercharged</span></button><button data-action="mode" data-mode="lock" class="mode ${editing==='lock'?'active':''}" aria-pressed="${editing==='lock'}">▧ <span>Lock slots</span></button><button data-action="clear-sc" class="mode subtle" title="Remove all marked supercharged positions">Clear SC</button></div>
          <div class="grid-frame"><div class="grid-utility"><span><span class="live-dot"></span> GRID CONFIGURATION</span><span>${profile.cols} × ${profile.rows} / ${profile.cols*profile.rows} POSITIONS</span></div>
            <div class="grid-scroll"><div class="tech-grid" style="--columns:${profile.cols}" role="group" aria-label="Technology layout with ${profile.rows} rows and ${profile.cols} columns">${Array.from({length:profile.cols*profile.rows},(_,i)=>renderCell(i,gear,profile)).join('')}</div></div>
            <div class="grid-footer"><span>${tilesInGrid} technologies placed</span><div class="occupancy"><span style="width:${pct}%"></span></div><span>${pct}% occupied</span></div>
          </div>
          <div class="grid-legend"><span><i class="swatch tlswatch"></i> Technology</span><span><i class="swatch scswatch"></i> Supercharged</span><span><i class="swatch adjwatch"></i> Adjacency</span><span><i class="swatch lkswatch"></i> Locked</span></div>
          <div class="hint-line">${editing==='move'?'↔ Drag a module or select two slots to swap. Tap a module to inspect it.':editing==='charge'?'✦ Select a position to add or remove a supercharged marker.':'▧ Select slots to lock or unlock their positions.'} <span>CORE = base · U1–U3 = rolled · TECH = crafted</span></div>
          ${profile.scExample?`<div class="notice warning"><strong>Example supercharged positions.</strong> These aren't your real slot coordinates. Choose <b>Clear SC</b> and mark your own for a personalized build.</div>`:''}
          ${!profSC.length?`<div class="notice"><strong>No supercharged slots marked.</strong> Choose <b>Supercharged</b> and select the positions from your in-game inventory. No sample slots are preselected.</div>`:scMismatched?`<div class="notice warning"><strong>Slot-count check:</strong> ${profSC.length} supercharged positions marked; ${scCount} expected for this equipment setting. Verify your inventory.</div>`:''}
          ${profile.layout&&profile.dirty?`<div class="notice warning"><strong>Supercharged placement may be out of date.</strong> Your slot positions, focus, or module arrangement changed. Select <b>Optimize layout</b> again to assign the strongest candidates to your purple slots. Nothing rearranges automatically.</div>`:''}
          ${hasSkipped?`<div class="notice warning"><strong>${profile.layout.skipped.length} requested technologies didn't fit.</strong> ${esc(profile.layout.skipped.slice(0,5).map(t=>t.label).join(', '))}${profile.layout.skipped.length>5?' …':''}. Unlock slots, enlarge the grid or reduce selected technology.</div>`:''}
          <div class="toolbar-bottom"><div class="action-row"><button class="btn primary" data-action="optimize">✧ Optimize layout <span>↗</span></button><button class="btn" data-action="copy" ${!profile.layout?'disabled':''}>⧉ Copy build</button></div><div class="action-row"><button class="btn quiet" data-action="clear-layout">Clear layout</button><button class="btn quiet warn" data-action="reset">Reset</button></div></div>
          <div class="score-explainer">Supercharged-first strategy: fill as many purple positions as possible with beneficial technologies from your highest-weighted eligible family, then move through the next priorities. Once those choices are secured, improve adjacency. Match your real SC positions and select Optimize layout. Scores are planning heuristics, not actual game statistics; U1 assumes your strongest roll.</div>
        </section>
        <details class="panel guide"><summary><span>◈ <strong>How to use ATLAS MAX</strong></span><span>3-step quick guide <b>⌄</b></span></summary><div class="guide-steps"><div class="step"><span class="step-num">01 / MATCH</span><strong>Recreate your inventory</strong><p>Set dimensions, lock missing slots, and mark real supercharged positions.</p></div><div class="step"><span class="step-num">02 / PRIORITIZE</span><strong>Choose tech & blueprints</strong><p>Select the technology families and crafted upgrades appropriate to your equipment.</p></div><div class="step"><span class="step-num">03 / OPTIMIZE</span><strong>Apply your arrangement</strong><p>Generate a layout and transfer the placement to your in-game inventory.</p></div></div><div class="guide-footer">Reference material: ${DATA.sources.map(s=>`<a target="_blank" rel="noopener noreferrer" href="${esc(s.url)}">${esc(s.name)} ↗</a>`).join('')}.</div></details>
      </main>
      <aside class="panel insight-panel ${insightsOpen?'is-open':''}"><div class="panel-heading"><div><div class="eyebrow">04 / LIVE ANALYSIS</div><h3>Build intelligence</h3></div><button class="collapse-button" data-action="panel" data-panel="insights" aria-expanded="${insightsOpen}" aria-controls="insights-body"><span class="when-closed">Show ⌄</span><span class="when-open">Hide ⌃</span></button></div>
        <div id="insights-body" class="insights-body"><section class="inspector-card"><div class="inspector-kicker">SELECTED MODULE <span>◉ LIVE</span></div>${activeTile?renderInspector(activeTile,gear,profile,selectedCell):`<div class="inspect-empty"><span class="inspect-placeholder">${ICONS.render(gear.icon,'gear-glyph')}</span><strong>No module selected</strong><p>${profile.layout?'Select an installed tile to view its role and system details.':'Generate a layout to inspect technology placement and adjacency.'}</p></div>`}</section>
          <section class="insight-metrics"><div class="insight-metric"><span>Installed / capacity</span><strong>${tilesInGrid} <small>/ ${openSlots}</small></strong></div><div class="progress-track"><span style="width:${pct}%"></span></div><div class="insight-metric"><span>Goal preset</span><strong>${esc(goal.label)}</strong></div><div class="insight-metric"><span>Upgrade target</span><strong>${esc(profile.target)}-class modules</strong></div></section>
          <section class="briefing"><div class="catalog-head"><h3>Priority briefing</h3><span>✧</span></div><p class="intro">${esc(goal.tip)}</p>${profile.layout?renderBriefing(gear,profile,sorted,stats):`<div class="empty-state"><span>✧</span><p><strong>Your planner is ready.</strong> Nothing has been generated yet. No build is generated automatically; click Optimize layout when ready.</p></div>`}<div class="notice"><strong>Equipment note</strong><p>${esc(gear.note)}</p></div></section>
          <details class="technology-plan"><summary><span>Technology plan <small>${sorted.length} families</small></span><span>⌄</span></summary><div class="plan-content">${sorted.length?sorted.map((id,i)=>renderFamilyCard(id,gear,profile,i)).join(''):'<div class="empty-state">Enable a technology family to begin.</div>'}</div></details>
        </div>
      </aside>
    </div>
    <footer class="footer"><span>⟁ ATLAS MAX / UNOFFICIAL NO MAN'S SKY COMPANION</span><span>Fresh start on reload · Export builds to keep · Unofficial fan project</span></footer>`;
  if(technologyQuery)applySearch();
  restoreWorkbenchView(view);
}
function corvetteStatus(p,stats){return !stats.exterior&&!stats.interior?'No build yet':p.generated&&!p.dirty?'Starter plan ready':p.generated?'Customized plan':'Custom draft';}
function renderCorvetteTech(p){
 const t=p.tech,scCount=wantedSC('starship',p.cls),techGear=corvetteGearForProfile(p),primary=chosenCorvetteWeapon(p),stat=t.optimized&&!t.dirty&&t.layout?SOLVER.summarize(t.layout,techGear,t):null;
 const matchingGoal=cvConstructionToTechnologyGoal[p.goal];
 const linked=CV.technologyManifest(p.counts),placed=t.layout?.tiles||[],pending=(t.layout?.skipped||[]).filter(x=>x.role==='construction');
 const links=linked.tiles.reduce((map,item)=>{const key=item.relationLabel||'Other Corvette system';
  (map[key]||=[]).push(item);return map;},{});
 const active=cvSharedFamilies.map(id=>[id,cvTechGear.families[id]]).filter(x=>x[1]);
 const groups=active.map(([id,f])=>{
  const addons=(f.addons||[]).filter(a=>canUse(a,t.vehicle));
  return `<div class="cv-tech-family"><label><input type="checkbox" data-cv-tech-family="${id}" ${t.enabled.includes(id)?'checked':''}> <span class="family-icon ${esc(f.color)}">${ICONS.render(f.icon,'family-glyph')}</span> ${esc(f.name)}</label>${addons.length?`<details><summary>Blueprints (${addons.filter(a=>t.addons.includes(id+':'+a.id)).length}/${addons.length})</summary>${addons.map(a=>`<label class="cv-tech-addon"><input type="checkbox" data-cv-tech-addon="${id}:${a.id}" ${t.addons.includes(id+':'+a.id)?'checked':''}> ${esc(a.name)}</label>`).join('')}</details>`:''}</div>`;
 }).join('');
 const assignments=stat?.scPlacements.map(x=>`<div class="cv-tech-sc-item"><span>R${Math.floor(x.position/t.cols)+1} C${x.position%t.cols+1} · ${esc(x.label)}</span><strong>${x.priority>0?'+'+Math.round(x.priority):'no SC benefit'}</strong></div>`).join('')||'';
 return `<section class="panel cv-tech-planner" aria-label="Corvette technology grid and supercharged optimizer">
  <div class="planner-head"><div><span class="eyebrow">05 / SUPERCHARGED SYSTEMS</span><h2>Corvette technology optimizer</h2><p class="helper">Construction modules now create their corresponding technology tiles here immediately. Mark the purple coordinates in your <strong>actual Corvette inventory</strong>, then Optimize to arrange installed parts and selected starship upgrades together.</p></div></div>
  <div class="cv-link-summary"><strong>◈ Linked construction technology · ${linked.tiles.length} modeled tiles</strong><span>${Object.keys(links).length?Object.entries(links).map(([key,items])=>`<span class="cv-link-pill"><b>${esc(key)}</b> ×${items.length}</span>`).join(''):'Add a functional Corvette part to populate its technology slots.'}</span><p>Reactor ↔ flight-system links describe the statistic affected, <em>not</em> an unverified adjacency bonus. Only modeled same-family tile edges receive adjacency points.</p></div>
  <div class="cv-grid-legend"><span><b class="cv-legend-swatch cv-installed"></b> Linked construction tile</span><span><b class="cv-legend-swatch cv-synergy"></b> Modeled adjacency</span><span><b class="cv-legend-swatch cv-functional"></b> Related flight system (not necessarily adjacency)</span></div>
  <div class="cv-tech-options"><label>Technology goal<select id="cv-tech-goal" class="control">${Object.entries(cvTechGear.goals).map(([id,g])=>`<option value="${id}" ${t.goal===id?'selected':''}>${esc(g.label)}</option>`).join('')}</select></label><label>Primary weapon priority<select id="cv-primary-weapon" class="control"><option value="auto" ${p.primaryWeapon==='auto'?'selected':''}>Auto · installed weapon</option>${cvWeaponFamilies.map(id=>`<option value="${id}" ${p.primaryWeapon===id?'selected':''}>${esc(cvTechGear.families[id]?.name||id)}</option>`).join('')}</select></label><label>Upgrade modules<select id="cv-tech-depth" class="control">${[1,2,3].map(n=>`<option value="${n}" ${t.depth===n?'selected':''}>${n} per family</option>`).join('')}</select></label><label>Grid columns<select id="cv-tech-cols" class="control">${[6,7,8,9,10].map(n=>`<option value="${n}" ${t.cols===n?'selected':''}>${n}</option>`).join('')}</select></label><label>Grid rows<select id="cv-tech-rows" class="control">${[3,4,5,6].map(n=>`<option value="${n}" ${t.rows===n?'selected':''}>${n}</option>`).join('')}</select></label></div>
  <p class="cv-weapon-priority">${primary?`Primary weapon: <strong>${esc(cvTechGear.families[primary]?.name||primary)}</strong>. ${t.goal==='combat'?'Prioritized for combat supercharged slots.':t.goal==='balanced'?'Eligible after core travel and defensive systems.':'Kept out of supercharged priority for Long Range.'}`:'No Corvette weapon selected yet. Add a weapon in the construction catalog or check a shared weapon below.'} ${p.primaryWeapon!=='auto'&&!primary?'Your preferred weapon is not installed or enabled yet.':''} Changing Build focus above also updates this technology goal; you can override it here.</p>
  <details class="cv-tech-library"><summary>Choose shared starship technology & blueprints (${t.enabled.length} families)</summary><div class="cv-tech-families">${groups}</div></details>
  ${t.goal!==matchingGoal?`<div class="notice warning"><strong>Build/technology focus mismatch.</strong> Your build focus is ${esc(CV.goals[p.goal].label)} but the technology goal is ${esc(cvTechGoals[t.goal].label)}. This may be intentional; if not, <button type="button" class="btn quiet" data-action="cv-sync-tech-goal">Match build focus</button>.</div>`:''}
  <p class="cv-tech-focus-note">${t.goal==='explorer'?'Long Range: warp and propulsion technologies take SC slots first. Weapons have zero SC priority.':t.goal==='combat'?'Combat: your selected primary weapon takes SC priority.':'Balanced: mobility and defensive systems lead; your weapon remains a secondary SC option.'} Re-run <strong>Optimize Corvette tech</strong> after changing the focus.</p>
  <div class="cv-tech-toolbar"><strong>SC positions: ${t.sc.length}/${scCount}</strong><button type="button" class="mode ${cvTechMode==='charge'?'active':''}" data-action="cv-tech-mode" data-mode="charge">✦ Mark SC</button><button type="button" class="mode ${cvTechMode==='move'?'active':''}" data-action="cv-tech-mode" data-mode="move">⤧ Move tech</button><button type="button" class="mode ${cvTechMode==='lock'?'active':''}" data-action="cv-tech-mode" data-mode="lock">▧ Lock slots</button><button type="button" class="mode subtle" data-action="cv-tech-clear-sc">Clear SC</button></div>
  <div class="grid-frame cv-tech-frame"><div class="grid-utility"><span><span class="live-dot"></span> CORVETTE TECH MATRIX</span><span>${t.cols} × ${t.rows} · ${t.sc.length} marked SC</span></div><div class="grid-scroll"><div class="tech-grid" style="--columns:${t.cols}" role="group" aria-label="Corvette technology inventory">${Array.from({length:t.cols*t.rows},(_,i)=>renderCell(i,techGear,t,'cv-tech-cell')).join('')}</div></div></div>
  ${pending.length?`<div class="notice warning"><strong>${pending.length} construction-generated technology tile(s) cannot fit.</strong> ${esc(pending.slice(0,4).map(x=>x.label).join(', '))}. Increase grid capacity, unlock slots, or revise the manifest. The game controls actual available slots.</div>`:''}
  ${activeTile?.role==='construction'?`<div class="cv-link-detail"><strong>${esc(activeTile.label)}</strong><span>Functional relationship: ${esc(activeTile.relationLabel||'Corvette technology')}</span><p>${esc(activeTile.relationNote|| (activeTile.noAdjacency?'No adjacency bonus is assumed for this part.':'Position alongside compatible technology for the modeled adjacency benefit.'))}</p></div>`:''}
  <div class="cv-tech-instruction">${cvTechMode==='charge'?'Tap the exact purple slot positions seen in your Corvette inventory.':cvTechMode==='lock'?'Mark positions that are not unlocked.':'Select a technology and then its destination, or drag a tile to another cell.'} Changes do not automatically rerun optimization.</div>
  ${t.optimized&&t.layout&&t.dirty?'<div class="notice warning"><strong>Technology goal or layout changed.</strong> The placements shown are from the previous optimization. Select <b>Optimize Corvette tech</b> to apply the new priorities.</div>':''}
  ${t.layout&&!t.optimized?'<div class="cv-tech-auto-state">Construction-linked modules are showing in the grid. Their positions are provisional until you choose <strong>Optimize Corvette tech</strong>.</div>':''}
  ${!t.sc.length?'<div class="notice warning"><strong>No supercharged slots marked yet.</strong> The optimizer can still group adjacent technology, but cannot prioritize purple slots until you mark real positions.</div>':''}
  <div class="cv-tech-toolbar cv-tech-actions"><button type="button" class="btn primary" data-action="cv-tech-optimize">✧ Optimize Corvette tech ↗</button><button type="button" class="btn quiet" data-action="cv-tech-clear-layout">Clear tech layout</button></div>
  ${stat?`<div class="cv-tech-result"><strong>✦ SC impact: +${Math.round(stat.scScore)} planning points · ${stat.effectiveSC}/${t.sc.length} useful purple slots</strong><span>SC strategy: ${esc(cvTechGear.families[SOLVER.superchargedPlan(t.layout.tiles,techGear,techGear.goals[t.goal],t.sc.length).focusFamily]?.name||'No eligible family')} first, then remaining eligible families; adjacency afterwards.</span><span>Adjacency: +${Math.round(stat.adjacencyScore)} · ${stat.connections} links</span>${assignments||'<p>Mark SC slots to receive placement recommendations.</p>'}<p>These are relative planning scores, not in-game percentages or DPS. U1 assumes your strongest roll. Verify real Corvette technology, class limits, construction order and actual stats in-game.</p></div>`:''}
 </section>`;
}
function renderCorvette(){
 const key='corvette',p=state.equipment.corvette,stats=CV.assess(p),goal=CV.goals[p.goal],linked=CV.technologyManifest(p.counts);
 const active=CV.parts.filter(part=>p.counts[part.id]);
 const visualLegacy=active.filter(part=>!CV.performanceIds.has(part.id));
 const inspected=(CV.performanceIds.has(p.selected)?CV.byId[p.selected]:null)||active.find(part=>CV.performanceIds.has(part.id))||null;
 const sections=[...new Set(CV.performanceParts.map(part=>part.section))];
 const zoneLabel={fore:'FORE / COMMAND',mid:'MID / SYSTEMS',aft:'AFT / PROPULSION'};
 const viewZone=z=>active.filter(part=>CV.performanceIds.has(part.id)&&(p.zones[part.id]||part.zone)===z&&part.kind==='exterior');
 const partsHtml=sections.map(section=>{
   const list=CV.performanceParts.filter(part=>part.section===section);
   const selectedCount=list.reduce((n,x)=>n+(p.counts[x.id]||0),0);
   return `<section class="cv-group" data-cv-group="${esc(section)}"><h4>${esc(section)} <span>${selectedCount} selected</span></h4>
    ${list.map(part=>{const qty=p.counts[part.id]||0;
     return `<div class="cv-part" data-cv-search="${esc((part.name+' '+section+' '+part.group+' '+part.description+' '+part.era).toLowerCase())}" data-cv-tab="${esc(({reactor:'reactors',engine:'engines',weapon:'weapons',shield:'shields'}[part.group]||'core'))}" data-cv-era="${esc(part.era)}" data-cv-qty="${qty}"><button type="button" class="cv-part-title" data-action="cv-select" data-part="${esc(part.id)}" title="Inspect ${esc(part.name)}"><span class="cv-part-icon">${ICONS.render(part.icon,'family-glyph')}</span><span><strong>${esc(part.name)}</strong><small>${esc(part.provisional?'Planning placeholder · unverified':part.kind==='interior'?'Interior furnishing':part.group==='appearance'?'Physical / visual component':part.group)}${linked.statuses[part.id]?.represented?` · ${linked.statuses[part.id].represented} tech` :''}</small></span></button><div class="cv-stepper"><button type="button" data-action="cv-minus" data-part="${esc(part.id)}" aria-label="Remove one ${esc(part.name)}" ${qty===0?'disabled':''}>−</button><output aria-label="Quantity">${qty}</output><button type="button" data-action="cv-plus" data-part="${esc(part.id)}" aria-label="Add one ${esc(part.name)}" ${qty===part.limit?'disabled':''}>+</button></div></div>`;
    }).join('')}</section>`;
 }).join('');
 app.innerHTML=`${chrome(key)}
  <section class="loadout-banner cv-banner" aria-label="Current Corvette plan">
    <div class="loadout-identity"><span class="loadout-badge">${ICONS.render('corvette','gear-glyph')}</span><div><div class="eyebrow">ACTIVE PROFILE / CORVETTE WORKSHOP</div><h2>${esc(p.name||'My Corvette')} <span class="class-badge">${esc(p.cls)}-CLASS</span></h2><p>Modular construction · Habitable ship · Conceptual layout</p></div></div>
    <div class="loadout-status ${stats.ready&&stats.exterior?'ready':''}"><span class="status-dot"></span>${esc(corvetteStatus(p,stats))}</div>
  </section>
  <aside class="forsaken-note cv-forsaken-note" aria-label="Forsaken Corvette update"><span class="forsaken-tag">LATEST UPDATE · FORSAKEN 7.10</span><div><strong>New corvette designs are here</strong><p>The performance catalog now includes the Limos, Vile Proboscis and Chelone reactors; Dematerialisation Ray; Arachnid and Razor thrusters; Eldritch, Gorgon, Plated and Lockjaw engine candidates; Rover landing system; Venom Spitter and new habs. Decorative hull and interior parts are hidden. Several thrusters have conflicting community classifications: check the in-game technology readout. No unverified stat percentages or adjacency bonuses have been added.</p><p class="forsaken-sub">Find mementos at infested outposts, hulks, derelict freighters and planetary digsites. Space courier contracts require a Corvette and a Gravitino Coil.</p></div><a href="https://www.nomanssky.com/forsaken-update/" target="_blank" rel="noopener noreferrer">Full 7.10 notes ↗</a></aside>
  <div class="cv-metrics">
   <div class="metric"><span class="metric-icon">◈</span><div><div class="metric-name">EXTERIOR MODULES</div><div class="metric-value">${stats.exterior}</div></div></div>
   <div class="metric"><span class="metric-icon">⌂</span><div><div class="metric-name">RELEVANT MODULES</div><div class="metric-value">${Object.entries(p.counts).reduce((n,[id,count])=>n+(CV.performanceIds.has(id)?count:0),0)}</div></div></div>
   <div class="metric"><span class="metric-icon">✓</span><div><div class="metric-name">REQUIRED SYSTEMS</div><div class="metric-value">${CV.required.length-stats.missing.length}<span>/${CV.required.length}</span></div></div></div>
   <div class="metric purple"><span class="metric-icon">⌘</span><div><div class="metric-name">CONFIGURATION</div><div class="metric-value cv-metric-word">${stats.ready?'VALID CORE':'DRAFT'}</div></div></div>
  </div>
  <div class="cv-workspace">
   <aside class="panel cv-library">
    <div class="panel-heading"><div><span class="eyebrow">01 / PERFORMANCE MODULES</span><h3>Stat &amp; system catalog</h3></div><small>${CV.performanceParts.length} relevant modules</small></div>
    <div class="cv-library-inner"><p class="cv-help">Only parts with a modeled stat/technology contribution or a required flight/cargo function appear here. Decorative interior furnishings, plating, cosmetic wings and exterior fittings have been removed from browsing. New reactors remain separate technology systems; actual values depend on your in-game rolls and placement order.</p>
       <div class="cv-catalog-tools"><label for="cv-category">Browse parts<select id="cv-category" class="control">${[['all','All functional parts'],['selected','In my plan'],['forsaken','New in FORSAKEN 7.10'],['reactors','Reactors'],['engines','Propulsion'],['weapons','Weapons'],['shields','Shields'],['core','Cockpits, cargo & essentials']].map(([v,l])=>`<option value="${v}" ${corvetteFilter===v?'selected':''}>${l}</option>`).join('')}</select></label><label for="cv-search">Find a part<input id="cv-search" class="control" type="search" placeholder="Search by name or type" value="${esc(corvetteQuery)}" autocomplete="off"></label></div>
       <div class="cv-catalog-summary" id="cv-catalog-summary" role="status" aria-live="polite"></div>${visualLegacy.length?`<div class="notice warning cv-legacy-note"><strong>${visualLegacy.length} cosmetic part type(s) retained from your imported plan.</strong> They no longer appear in the stat catalog. <button type="button" class="btn quiet" data-action="cv-cleanup-visual">Remove cosmetic items from plan</button></div>`:''}<div class="cv-catalog" id="cv-catalog">${partsHtml}</div><p class="cv-catalog-empty" id="cv-catalog-empty" hidden>No functional parts match. Select All functional parts or clear the search.</p></div>
   </aside>
   <main class="cv-main">
    <section class="panel cv-planner"><div class="planner-head"><div><span class="eyebrow">02 / WORKSHOP CONFIGURATION</span><h2>Build your Corvette</h2><p class="helper">Create a suggested starter manifest or assemble your own. Export to keep your work after this visit.</p></div></div>
     <div class="cv-settings">
       <label>Ship name<input id="cv-name" class="control" maxlength="80" placeholder="My Corvette" value="${esc(p.name)}"></label>
       <label>Build focus<select id="cv-goal" class="control">${Object.entries(CV.goals).map(([id,g])=>`<option value="${id}" ${p.goal===id?'selected':''}>${esc(g.label)}</option>`).join('')}</select></label>
       <label>Design family<select id="cv-style" class="control">${['Titan','Ambassador','Thunderbird','Mixed','Forsaken'].map(v=>`<option value="${v}" ${p.style===v?'selected':''}>${v}</option>`).join('')}</select></label>
       <label>Current ship class<select id="cv-class" class="control">${['C','B','A','S'].map(v=>`<option value="${v}" ${p.cls===v?'selected':''}>${v}-class</option>`).join('')}</select></label>
     </div>
     <div class="cv-toolbar"><button class="btn primary" data-action="cv-generate">✧ Generate starter plan ↗</button><button class="btn" data-action="cv-copy">⧉ Copy manifest</button><button class="btn quiet warn" data-action="cv-reset">Reset Corvette</button></div>
     <div class="cv-assignment-note">${esc(goal.tip)} <strong>Starter-plan weapon:</strong> ${esc(CV.byId[CV.weaponPartByFamily[p.primaryWeapon]||Object.keys(p.counts).find(id=>p.counts[id]>0&&CV.weaponFamilyByPart[id]===chosenCorvetteWeapon(p))||'photon-array']?.name||'Photon Cannon Array')}. Changing the focus or design family does not replace your current plan. Generate only when you're ready.</div>
     <div class="cv-ship-panel"><div class="cv-ship-head"><span class="eyebrow">03 / SCHEMATIC OVERVIEW</span><span>NOT TO SCALE · NO SNAP VALIDATION</span></div>
       <div class="cv-blueprint">
         <div class="cv-hull-shape" aria-hidden="true"><span>◆</span></div>
         <div class="cv-zones">${['fore','mid','aft'].map(z=>`<section class="cv-zone"><h4>${zoneLabel[z]}</h4>${viewZone(z).length?viewZone(z).map(part=>`<button class="cv-chip" data-action="cv-select" data-part="${esc(part.id)}">${ICONS.render(part.icon,'cv-chip-icon')}<span>${esc(part.name)}</span><b>×${p.counts[part.id]}</b></button>`).join(''):'<p>No modules assigned</p>'}</section>`).join('')}</div>
       </div>
       <p class="tiny cv-schematic-note">This is a planning map of module groups, not a 3D Corvette build or a substitute for the Space Station Workshop. You can assign modules to broad zones in the inspector.</p>
     </div>
     <div class="cv-validation"><h3>Flight-ready core checklist <span>${CV.required.length-stats.missing.length} of ${CV.required.length}</span></h3><div class="cv-checks">${CV.required.map(([id,label])=>`<div class="cv-check ${stats.byGroup[id]?'ok':''}"><span>${stats.byGroup[id]?'✓':'○'}</span>${esc(label)}</div>`).join('')}</div>
      <div class="notice ${stats.ready?'':'warning'}">${stats.ready?'<strong>All required module groups present.</strong> Physical placement, snap connections, limits, and performance must still be verified in-game.':`<strong>Missing required groups:</strong> ${esc(stats.missing.map(x=>x[1]).join(', '))}.`}</div>
     </div>
    </section>
    ${renderCorvetteTech(p)}
   </main>
   <aside class="panel cv-insights"><div class="panel-heading"><div><span class="eyebrow">04 / ASSEMBLY INTELLIGENCE</span><h3>Workshop inspector</h3></div></div>
    <div class="cv-inspector-body">${inspected?`<div class="inspector-card"><div class="inspector-kicker">SELECTED MODULE</div><div class="inspector-title"><span class="family-icon mint">${ICONS.render(inspected.icon,'family-glyph')}</span><div><strong>${esc(inspected.name)}</strong><small>${esc(inspected.section)}</small></div></div><p>${esc(inspected.description)}</p><div class="cv-part-system"><strong>${linked.statuses[inspected.id]?.represented?`${linked.statuses[inspected.id].represented} linked technology tile(s)`:'No modeled technology tile'}</strong><span>${esc(linked.statuses[inspected.id]?.relation?.label||'Physical construction or interior module only')}</span>${linked.statuses[inspected.id]?.cosmetic?`<small>${linked.statuses[inspected.id].cosmetic} remaining physical copy/copies modeled as decorative or beyond the supported tech contribution.</small>`:''}</div><div class="inspector-note">${esc(inspected.kind==='interior'?'Interior furnishing — not included in exterior structural count.':'Exterior module — verify availability and attachment rules in the game.')}</div><label class="cv-zone-select">Planning zone<select class="control" data-cv-zone="${esc(inspected.id)}">${['fore','mid','aft'].map(z=>`<option value="${z}" ${(p.zones[inspected.id]||inspected.zone)===z?'selected':''}>${zoneLabel[z]}</option>`).join('')}</select></label></div>`:`<div class="inspect-empty"><span class="inspect-placeholder">${ICONS.render('corvette','gear-glyph')}</span><strong>Nothing selected</strong><p>Choose a module in the catalog to see its details and edit its planned position.</p></div>`}
     <section class="cv-readiness"><h4>Build assessment</h4><p>${stats.ready?'Required systems are represented in this plan. This is not proof of build validity.':'Add all required module groups before attempting to finalize your Corvette.'}</p><div class="cv-priority"><strong>Focus: ${esc(goal.label)}</strong><span>${esc(goal.tip)}</span></div></section>
     <section class="cv-readiness"><h4>Corvette-only mechanics</h4><p>Functional construction parts now produce linked technology tiles automatically. These are separate from the normal three rolled upgrade modules. Reactor relationships identify affected systems without inventing adjacency bonuses; construction order, the class slot cap, and in-game bugs can change what actually appears.</p><p>Cosmetic hull, wing and interior pieces are deliberately excluded from this stat-first planner. They may still alter ship mass/handling indirectly; only in-game readouts are authoritative.</p></section>
     <section class="cv-reference"><a href="https://www.nomanssky.com/voyagers-update/" target="_blank" rel="noopener noreferrer">Voyagers Corvette Workshop ↗</a><a href="https://www.nomanssky.com/cosmos-update/" target="_blank" rel="noopener noreferrer">Cosmos Tractor Beam ↗</a><a href="https://www.nomansskyresources.com/corvette-parts" target="_blank" rel="noopener noreferrer">Browse Corvette parts ↗</a><a href="https://www.nomanssky.com/forsaken-update/" target="_blank" rel="noopener noreferrer">Forsaken 7.10 patch notes ↗</a></section>
    </div>
   </aside>
  </div>
  <footer class="footer"><span>⟁ ATLAS MAX / UNOFFICIAL NO MAN'S SKY COMPANION</span><span>Fresh start on reload · Export builds to keep · Unofficial fan project</span></footer>`;
 applyCorvetteSearch();
}
let corvetteQuery='';
let corvetteFilter='all';
function applyCorvetteSearch(){
 const root=document.getElementById('cv-catalog');if(!root||!root.querySelectorAll)return;
 const q=corvetteQuery.toLowerCase().trim();let shown=0;
 root.querySelectorAll('.cv-group').forEach(group=>{
  let visible=0;group.querySelectorAll('.cv-part').forEach(el=>{
   const matchesCategory=corvetteFilter==='all'||(corvetteFilter==='selected'?Number(el.dataset.cvQty)>0:corvetteFilter==='forsaken'?el.dataset.cvEra==='Forsaken 7.10':el.dataset.cvTab===corvetteFilter);
   const match=matchesCategory&&(!q||el.dataset.cvSearch.includes(q));el.classList.toggle('filtered-out',!match);
   if(match){visible++;shown++;}
  });group.classList.toggle('filtered-out',visible===0);
 });
 const summary=document.getElementById('cv-catalog-summary');if(summary)summary.textContent=shown+' matching module'+(shown===1?'':'s')+' · '+'Functional/essential modules, plus disputed engine candidates; verify game stats.';
 const empty=document.getElementById('cv-catalog-empty');if(empty)empty.hidden=shown>0;
}

function corvetteMutate(partId,increment){
 const part=CV.byId[partId],p=state.equipment.corvette;if(!part)return;
 const old=p.counts[partId]||0,next=Math.min(part.limit,Math.max(0,old+increment));
 if(next===old)return;
 if(part.group==='cockpit'&&next>0){for(const other of CV.parts.filter(item=>item.group==='cockpit'&&item.id!==partId))delete p.counts[other.id];}
 if(next)p.counts[partId]=next;else delete p.counts[partId];
 if(next>old&&CV.weaponFamilyByPart[partId])p.primaryWeapon=CV.weaponFamilyByPart[partId];
 if(!next&&CV.weaponFamilyByPart[partId]===p.primaryWeapon&&!Object.entries(p.counts).some(([id,count])=>count>0&&CV.weaponFamilyByPart[id]===p.primaryWeapon)&&!p.tech.enabled.includes(p.primaryWeapon))p.primaryWeapon='auto';
 p.selected=partId;p.dirty=!!p.generated;syncCorvetteTechnology(p.tech,p.counts);p.tech.dirty=!!p.tech.optimized&&!!p.tech.layout;save();render();
}
function corvetteTechChanged(){const p=state.equipment.corvette.tech;p.dirty=!!p.optimized&&!!p.layout;save();render();}
function handleCorvetteTechCell(pos){
 const t=state.equipment.corvette.tech;
 if(!Number.isInteger(pos)||pos<0||pos>=t.cols*t.rows)return;
 if(cvTechMode==='charge'){
  if(t.blocked.includes(pos)){toast('Unlock this position first.',true);return;}
  if(t.sc.includes(pos))t.sc=t.sc.filter(i=>i!==pos);
  else {if(t.sc.length>=wantedSC('starship',t.cls)){toast('Unmark a supercharged position first.',true);return;}t.sc.push(pos);}
  selectedCell=null;activeTile=null;corvetteTechChanged();return;
 }
 if(cvTechMode==='lock'){
  if(t.blocked.includes(pos)){t.blocked=t.blocked.filter(i=>i!==pos);syncCorvetteTechnology(t,state.equipment.corvette.counts);}
  else {t.blocked.push(pos);t.sc=t.sc.filter(i=>i!==pos);syncCorvetteTechnology(t,state.equipment.corvette.counts);}
  selectedCell=null;activeTile=null;corvetteTechChanged();return;
 }
 if(t.blocked.includes(pos)){toast('This position is locked.',true);return;}
 if(!t.layout){toast('Select Optimize Corvette tech first.');return;}
 if(selectedCell===null){if(t.layout.map[pos]<0)return;selectedCell=pos;activeTile=t.layout.tiles[t.layout.map[pos]];render();return;}
 if(selectedCell!==pos){[t.layout.map[selectedCell],t.layout.map[pos]]=[t.layout.map[pos],t.layout.map[selectedCell]];t.dirty=true;}
 selectedCell=null;activeTile=t.layout.map[pos]>=0?t.layout.tiles[t.layout.map[pos]]:null;save();render();
}
function handleCorvetteClick(action,d){const p=state.equipment.corvette;
 if(action==='cv-tech-mode'){cvTechMode=d.mode;selectedCell=null;activeTile=null;render();return;}
 if(action==='cv-tech-cell'){handleCorvetteTechCell(Number(d.cell));return;}
 if(action==='cv-tech-clear-sc'){p.tech.sc=[];corvetteTechChanged();return;}
 if(action==='cv-tech-clear-layout'){p.tech.layout=null;p.tech.optimized=false;syncCorvetteTechnology(p.tech,p.counts);p.tech.dirty=false;selectedCell=null;activeTile=null;save();render();return;}
 if(action==='cv-sync-tech-goal'){p.tech.goal=cvConstructionToTechnologyGoal[p.goal];corvetteTechChanged();return;}
 if(action==='cv-tech-optimize'){
  try{p.tech.layout=SOLVER.solve({gear:corvetteGearForProfile(p),profile:p.tech});p.tech.optimized=true;p.tech.dirty=false;cvTechMode='move';selectedCell=null;activeTile=null;save();render();toast('Corvette tech optimized against your marked supercharged positions.');}
  catch(e){toast(e.message||'Could not optimize Corvette technology.',true);}return;
 }
 if(action==='cv-plus'||action==='cv-minus'){corvetteMutate(d.part,action==='cv-plus'?1:-1);return;}
 if(action==='cv-select'){if(CV.byId[d.part]){p.selected=d.part;save();render();}return;}
 if(action==='cv-cleanup-visual'){if(!window.confirm('Remove all non-stat decorative and interior entries from this Corvette plan?'))return;for(const id of Object.keys(p.counts))if(!CV.performanceIds.has(id)){delete p.counts[id];delete p.zones[id];}if(!CV.performanceIds.has(p.selected))p.selected=null;syncCorvetteTechnology(p.tech,p.counts);save();render();toast('Decorative entries removed; functional modules preserved.');return;}
 if(action==='cv-generate'){
  if(Object.keys(p.counts).length && !window.confirm('Replace this Corvette manifest with a new starter plan? Your current module quantities will be replaced.'))return;
  const installedChoice=Object.keys(p.counts).find(id=>p.counts[id]>0&&CV.weaponFamilyByPart[id]===chosenCorvetteWeapon(p));
  const chosenPart=CV.weaponPartByFamily[p.primaryWeapon]||installedChoice||'photon-array';
  p.counts=CV.generate(p.goal,p.style,chosenPart);p.zones={};p.selected=null;p.generated=true;p.dirty=false;syncCorvetteTechnology(p.tech,p.counts);p.tech.dirty=!!p.tech.optimized&&!!p.tech.layout;save();render();toast('Starter plan generated. Linked construction technology was added to the grid.');return;
 }
 if(action==='cv-reset'){if(window.confirm('Reset the Corvette manifest and settings?')){state.equipment.corvette=defaultProfile('corvette');cvTechMode='charge';selectedCell=null;activeTile=null;save();render();toast('Corvette profile reset.');}return;}
 if(action==='cv-copy'){
  const assessment=CV.assess(p);const partList=CV.parts.filter(x=>p.counts[x.id]).map(x=>`${p.counts[x.id]} × ${x.name} [${p.zones[x.id]||x.zone}, ${x.kind}]`).join('\n');
  const txt=`ATLAS MAX • Corvette: ${p.name||'My Corvette'}\nFocus: ${CV.goals[p.goal].label} | Class: ${p.cls} | Style: ${p.style}\nExterior modules: ${assessment.exterior}; Interior furnishings: ${assessment.interior}\nRequired core groups: ${CV.required.length-assessment.missing.length}/${CV.required.length}\n${assessment.missing.length?'Missing: '+assessment.missing.map(x=>x[1]).join(', '):'All required part groups represented'}\n\n${partList||'(No modules selected)'}\n\nConceptual manifest only; verify assembly, availability and real stats in No Man’s Sky.`;
  copyPlainText(txt,'Corvette manifest copied.');return;
 }
}
async function copyPlainText(txt,done){try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(txt);else{const t=document.createElement('textarea');t.value=txt;document.body.appendChild(t);t.select();if(!document.execCommand('copy'))throw Error('Unsupported clipboard');t.remove();}toast(done);}catch(e){toast('Clipboard unavailable; use Export to save all profiles.',true);}}

function renderCell(i,gear,profile,cellAction='cell'){
  const locked=profile.blocked.includes(i),sc=profile.sc.includes(i);
  const cellEditMode=cellAction==='cv-tech-cell'?cvTechMode:editing;
  const tileIndex=profile.layout?profile.layout.map[i]:-1;
  const tile=tileIndex>=0?profile.layout.tiles[tileIndex]:null;
  const fam=tile?gear.families[tile.family]:null;
  const priority=sc&&tile?SOLVER.scValue(tile,gear,gear.goals[profile.goal]):0;
  const text=locked?'LOCK':tile?(tile.role==='core'?'CORE':tile.role==='crafted'?'TECH':tile.role==='construction'?'CV'+tile.sequence:'U'+tile.sequence):(sc?'SC':'+');
  const name=locked?'Unavailable':tile?tile.label:sc?'Supercharged':'Empty';
  const subtitle=tile?(tile.role==='core'?'Core technology':tile.role==='crafted'?'Crafted blueprint':tile.role==='construction'?'Linked Corvette construction module':`Upgrade ${tile.sequence}`):'';
  const edges=adjacencyFor(i,gear,profile,tile);
  const selectedFamily=activeTile&&activeTile.family===tile?.family;
  const functionalLink=activeTile&&tile&&activeTile.id!==tile.id&&(
    (activeTile.role==='construction'&&activeTile.linkFamily===tile.family)||
    (tile.role==='construction'&&tile.linkFamily===activeTile.family));
  const scHint=sc&&tile?(priority>0?` — SC priority +${Math.round(priority)} planning points`:' — no modeled SC benefit'):'';
  return `<button type="button" class="cell ${locked?'locked':''} ${sc?'sc':''} ${sc&&tile?(priority>0?'sc-effective':'sc-low'):''} ${tile?'tile '+fam.color:''} ${tile?.role==='construction'?'cv-linked-tile':''} ${selectedCell===i?'selected':''} ${selectedFamily?'same-family':''} ${functionalLink?'cv-function-linked':''} ${activeTile&&tile&&!selectedFamily&&!functionalLink?'deemphasized':''}" data-action="${cellAction}" data-cell="${i}" ${tile&&cellEditMode==='move'?'draggable="true"':''} aria-label="Row ${Math.floor(i/profile.cols)+1}, column ${i%profile.cols+1}: ${esc(name)}${sc?' (supercharged)':''}${locked?' (locked)':''}${esc(scHint)}" title="${esc(name)}${tile?' — '+esc(subtitle):''}${esc(scHint)}">${edges.map(side=>`<span class="adjacency-edge ${side}" aria-hidden="true"></span>`).join('')}${tile?`<span class="slot-icon ${esc(fam.color)}">${ICONS.render(tile.icon||fam.icon,'slot-glyph')}</span><span class="cell-name">${esc(tile.role==='crafted'?tile.label:fam.name)}</span><span class="cell-rank">${esc(text)}</span>${sc&&priority>0?`<span class="sc-impact" aria-hidden="true">✦ +${Math.round(priority)}</span>`:''}`:locked?`<span class="slot-icon lock-icon">${ICONS.render('lock','slot-glyph')}</span><span class="cell-rank">LOCKED</span>`:sc?`<span class="slot-icon sc-empty-icon">${ICONS.render('spark','slot-glyph')}</span><span class="cell-rank">SC SLOT</span>`:`<span class="cell-code">+</span><span class="number">${String(i+1).padStart(2,'0')}</span>`}</button>`;
}
function renderInspector(tile,gear,profile,selectedPos){
  const fam=gear.families[tile.family];if(!fam)return'';
  const role=tile.role==='core'?'Base technology':tile.role==='crafted'?'Crafted blueprint':`Rolled upgrade / slot ${tile.sequence}`;
  const value=SOLVER.scValue(tile,gear,gear.goals[profile.goal]);
  const onSC=selectedPos!==null&&profile.sc.includes(selectedPos);
  const scAdvice=value>0?(onSC?`This technology is benefiting from the marked supercharged position (+${Math.round(value)} relative planning points).`:`Potential SC priority: +${Math.round(value)} relative planning points. The optimizer fills the highest-priority eligible technology family first, then optimizes adjacency.`):'This technology has no modeled supercharged priority. Reserve purple slots for performance technology where possible.';
  return `<div class="inspector"><div class="inspector-title"><span class="family-icon ${esc(fam.color)}">${ICONS.render(tile.icon||fam.icon,'family-glyph')}</span><div><strong>${esc(tile.label)}</strong><small>${esc(role)}</small></div></div><p>${esc(fam.why)}</p>${tile.adjacencyNote?`<p class="inspector-relationship"><strong>Adjacency:</strong> ${esc(tile.adjacencyNote)}</p>`:tile.noAdjacency?'<p class="inspector-relationship"><strong>Adjacency:</strong> No confirmed placement bonus for this technology.</p>':''}<div class="inspector-sc"><strong>✦ Supercharged evaluation</strong><span>${esc(scAdvice)}</span></div><div class="inspector-note">${tile.role==='upgrade'&&tile.sequence===1?'U1 represents your best module roll, not a guaranteed stat value. ':'Use Move tech to select another slot or drag this module to relocate it.'}</div></div>`;
}
function renderBriefing(gear,profile,sorted,stats){
  const goal=gear.goals[profile.goal];
  const allocation=SOLVER.superchargedPlan(profile.layout.tiles,gear,goal,profile.sc.length);
  const focus=allocation.focusFamily;
  const eligibleOrder=[...new Set(allocation.ranked.map(x=>x.family))].slice(0,4);
  const allocatedFocus=allocation.selected.filter(i=>profile.layout.tiles[i].family===focus).length;
  const placedFocus=stats.scPlacements.filter(x=>x.family===focus&&x.priority>0).length;
  const ranked=stats.scPlacements.slice().sort((a,b)=>
    (goal.weights[b.family]||0)-(goal.weights[a.family]||0)||b.priority-a.priority);
  const placements=ranked.map(item=>`<li class="sc-assignment ${item.priority>0?'is-useful':'is-filler'}"><span class="sc-coord">R${Math.floor(item.position/profile.cols)+1} C${item.position%profile.cols+1}</span><span>${esc(item.label)}${item.priority<=0?' · no modeled SC benefit':''}</span><b>${item.priority>0?'+'+Math.round(item.priority):'—'}</b></li>`).join('');
  const priorityLine=focus?`<p class="sc-focus-strategy"><strong>✦ Focus first: ${esc(gear.families[focus].name)}</strong> · ${placedFocus}/${allocatedFocus} planned SC placements<br><span>Allocation order: ${eligibleOrder.map(id=>esc(gear.families[id].name)).join(' → ')}. Adjacency is optimized afterwards.</span></p>`:
    `<p class="sc-focus-strategy">No selected technology has a modeled SC benefit. No performance bonus is assumed for unused purple slots.</p>`;
  return `<div class="sc-analysis" aria-label="Supercharged optimization breakdown"><div class="sc-analysis-head"><strong>✦ Supercharged assignments</strong><span>${stats.effectiveSC}/${profile.sc.length} useful</span></div>
    ${priorityLine}
    <div class="sc-score-row"><span>SC priority</span><strong>+${Math.round(stats.scScore)}</strong><span>Adjacency</span><strong>+${Math.round(stats.adjacencyScore)}</strong></div>
    ${placements?`<ul class="sc-assignment-list">${placements}</ul>`:`<p class="sc-analysis-empty">${profile.sc.length?'No technology occupies your marked SC slots.':'Mark your real purple slots and select Optimize layout to prioritize them.'}</p>`}
    <p class="sc-disclaimer">Relative planning points, not actual in-game stat bonuses. U1 assumes your strongest rolled upgrade.</p></div>
  <div class="priority-item"><span class="number-badge">✧</span><div><h4>${stats.effectiveSC}/${profile.sc.length} supercharged positions with performance tech</h4><p>Prioritized for your ${esc(gear.goals[profile.goal].label.toLowerCase())} goal. Only marked positions can receive these bonuses.</p></div></div>
  <div class="priority-item"><span class="number-badge">⌗</span><div><h4>${stats.connections} verified adjacency links</h4><p>Only modeled compatible side-by-side technologies count, including confirmed cross-family hazard links, not diagonals.</p></div></div>
  ${sorted.slice(0,3).map((id,i)=>`<div class="priority-item"><span class="number-badge">${i+1}</span><div><h4>${esc(gear.families[id].name)}</h4><p>${esc(gear.families[id].next)}</p></div></div>`).join('')}
  <div class="notice">${profile.target==='X'?'<strong>X-class reminder:</strong> X-class rolls vary dramatically. A good S-class module can outperform a poor X-class roll.':'<strong>S-class reminder:</strong> S-class is a reliable target, but compare actual stats rather than assuming every roll is identical.'}</div>`;
}
function renderFamilyCard(id,gear,profile,i){
  const fam=gear.families[id];const count=Math.min(profile.depth,fam.maxUpgrades||0);
  const addons=(fam.addons||[]).filter(a=>canUse(a,profile.vehicle)&&profile.addons.includes(id+':'+a.id));
  const replacement=Object.entries(gear.families).flatMap(([fId,owner])=>(owner.addons||[]).filter(a=>a.replacesCore===id&&profile.enabled.includes(fId)&&profile.addons.includes(fId+':'+a.id)));
  return `<div class="family-card"><div class="family-head"><strong class="family-heading"><span class="family-icon ${esc(fam.color)}">${ICONS.render(fam.icon,'family-glyph')}</span><span>${esc(fam.name)}</span></strong><span class="tag">PRIORITY ${i+1}</span></div><div class="family-desc">${esc(fam.why)}</div><div class="family-components">${fam.core?`<b>Core:</b> ${esc(replacement.length?replacement[0].name+' (replaces '+fam.core+')':fam.core)}`:'<b>Selectable technology</b>'}${count?` · <b>${count} ×</b> ${esc(fam.upgrade)}`:''}${addons.length?`<div class="crafted-list"><b>Crafted:</b> ${addons.map(a=>esc(a.name)).join(' · ')}</div>`:''}</div></div>`;
}
function toast(message,error=false){
  const old=document.querySelector('.toast');if(old)old.remove();if(toastTimer)clearTimeout(toastTimer);
  const el=document.createElement('div');el.className='toast'+(error?' error':'');el.setAttribute('role','status');el.textContent=message;document.body.appendChild(el);
  toastTimer=setTimeout(()=>el.remove(),4300);
}
function layoutChanged(profile){profile.dirty=!!profile.layout;save();render();}
function handleCell(pos){
  const {key,gear,profile}=context();
  if(editing==='charge'){
    if(profile.blocked.includes(pos)){toast('Unlock this position before marking it supercharged.',true);return;}
    if(profile.sc.includes(pos)){profile.sc=profile.sc.filter(i=>i!==pos);}else{
      const limit=wantedSC(key,profile.cls);
      if(profile.sc.length>=limit){toast(`This equipment setting supports ${limit} supercharged markers. Unmark one first.`,true);return;}
      profile.sc.push(pos);
    }
    profile.scExample=false;activeTile=null;selectedCell=null;layoutChanged(profile);return;
  }
  if(editing==='lock'){
    if(profile.blocked.includes(pos))profile.blocked=profile.blocked.filter(i=>i!==pos);
    else {profile.blocked.push(pos);profile.sc=profile.sc.filter(i=>i!==pos);if(profile.layout)profile.layout.map[pos]=-1;}
    profile.scExample=false;activeTile=null;selectedCell=null;layoutChanged(profile);return;
  }
  if(profile.blocked.includes(pos)){toast('This position is locked. Change to Lock / unlock to open it.',true);return;}
  if(!profile.layout){toast('Select Optimize layout to create the technology plan first.');return;}
  if(selectedCell===null){
    if(profile.layout.map[pos]<0){toast('Select an installed technology tile first.');return;}
    selectedCell=pos;activeTile=profile.layout.tiles[profile.layout.map[pos]];render();return;
  }
  if(selectedCell!==pos){
    [profile.layout.map[selectedCell],profile.layout.map[pos]]=[profile.layout.map[pos],profile.layout.map[selectedCell]];
    profile.dirty=true;
  }
  selectedCell=null;activeTile=profile.layout.map[pos]>=0?profile.layout.tiles[profile.layout.map[pos]]:null;
  save();render();
}
function updateGoal(value){const {gear,profile}=context();if(!gear.goals[value])return;
  profile.goal=value;profile.enabled=goalDefaults(gear,value,profile.vehicle);profile.dirty=!!profile.layout;save();render();
}
function optimize(){const {gear,profile}=context();
  if(profile.scExample)toast('Using example SC locations. For a real optimization, mark your actual in-game slots.');
  try{profile.layout=SOLVER.solve({gear,profile});profile.dirty=false;selectedCell=null;activeTile=null;editing='move';save();render();
    if(profile.layout.skipped.length)toast(`Optimized available space; ${profile.layout.skipped.length} requested tiles did not fit.`,true);
  }catch(e){toast(e.message||'Could not optimize this profile.',true);}
}
function buildSummary(){const{gear,profile}=context();if(!profile.layout)return null;
  const stats=currentStats(gear,profile),sorted=familyPriority(gear,profile);
  const rows=[];
  for(let r=0;r<profile.rows;r++){
    const cells=[];for(let c=0;c<profile.cols;c++){
      const p=r*profile.cols+c,tId=profile.layout.map[p];
      const t=tId>=0?profile.layout.tiles[tId]:null;
      const base=profile.blocked.includes(p)?'BLOCK':t?(gear.families[t.family].short+(t.role==='core'?'':t.role==='crafted'?'+':t.sequence)):'.';
      cells.push((profile.sc.includes(p)?'*':' ')+base.padEnd(6,' '));
    } rows.push(cells.join(' '));
  }
  const crafted=profile.layout.tiles.filter(t=>t.role==='crafted').map(t=>t.label);
  return `ATLAS MAX • ${profile.name||gear.name}\nEquipment: ${gear.name} | Class: ${profile.cls}\nFocus: ${gear.goals[profile.goal].label} | Target: ${profile.target} class\nTechnology: ${sorted.map(id=>gear.families[id].name).join(', ')}\nPlanning score: ${Math.round(stats.score)} (heuristic, NOT in-game stats)
SC priority: +${Math.round(stats.scScore)} planning points; ${stats.effectiveSC}/${profile.sc.length} meaningful SC placements
SC assignments: ${stats.scPlacements.map(x=>`R${Math.floor(x.position/profile.cols)+1}C${x.position%profile.cols+1} ${x.label} (+${Math.round(x.priority)})`).join(' | ') || '(none)'}\nAdjacency links: ${stats.connections} | SC tiles used: ${stats.usedSC}/${profile.sc.length}\n${profile.scExample?'WARNING: Example SC positions — not personalized to a game save.\n':''}* = supercharged slot\n${rows.join('\n')}\n\nFan-made planner. Verify the arrangement and technology stats in No Man's Sky.`;
}
async function copySummary(){const summary=buildSummary();if(!summary)return;
  try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(summary);}else{
    const t=document.createElement('textarea');t.value=summary;document.body.appendChild(t);t.select();if(!document.execCommand('copy'))throw new Error('Unsupported clipboard');t.remove();
  }toast('Build summary copied.');}catch(e){toast('Clipboard unavailable. Use Export to save your build.',true);}
}
function downloadJSON(){
  const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='atlas-max-loadouts.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('Saved profiles exported as JSON.');
}
async function importJSON(file){if(!file)return;try{
  if(file.size>600000)throw new Error('File is too large.');
  const parsed=JSON.parse(await file.text());if(parsed.version!==1||!parsed.equipment)throw new Error('Not an ATLAS MAX profile export.');
  state={version:1,current:gearKeys.includes(parsed.current)?parsed.current:'starship',equipment:Object.fromEntries(gearKeys.map(k=>[k,normalizeProfile(k,parsed.equipment[k])]))};
  selectedCell=null;activeTile=null;editing='move';save();render();toast('Profiles imported successfully.');
}catch(e){toast(e.message||'Unable to import that file.',true);}}
app.addEventListener('click',event=>{
  const button=event.target.closest('button[data-action]');if(!button)return;
  const action=button.dataset.action;const{key,gear,profile}=context();
  if(action==='gear'){if(gearKeys.includes(button.dataset.gear)){state.current=button.dataset.gear;selectedCell=null;activeTile=null;editing='move';save();render();}return;}
  if(key==='corvette' && action.startsWith('cv-')){handleCorvetteClick(action,button.dataset);return;}
  if(action==='panel'){if(button.dataset.panel==='config')configOpen=!configOpen;else if(button.dataset.panel==='insights')insightsOpen=!insightsOpen;render();return;}
  if(action==='depth'){profile.depth=clamp(button.dataset.depth,1,3);layoutChanged(profile);return;}
  if(action==='mode'){editing=button.dataset.mode;selectedCell=null;activeTile=null;render();return;}
  if(action==='cell'){handleCell(Number(button.dataset.cell));return;}
  if(action==='optimize'){optimize();return;}
  if(action==='clear-sc'){profile.sc=[];profile.scExample=false;layoutChanged(profile);toast('Supercharged markers cleared. Mark your actual slot locations.');return;}
  if(action==='clear-layout'){profile.layout=null;profile.dirty=false;selectedCell=null;activeTile=null;save();render();return;}
  if(action==='copy'){copySummary();return;}
  if(action==='export'){downloadJSON();return;}
  if(action==='import'){document.getElementById('import-file').click();return;}
  if(action==='reset'){if(window.confirm(`Reset ${gear.name} profile and all its layout settings?`)){state.equipment[key]=defaultProfile(key);selectedCell=null;activeTile=null;editing='move';save();render();toast('Equipment profile reset.');}}
});
app.addEventListener('change',event=>{
  const t=event.target;const{key,gear,profile}=context();
  if(t.id==='import-file'){importJSON(t.files&&t.files[0]);return;}
  if(key==='corvette'){
    const p=state.equipment.corvette;
    if(t.id==='cv-category'){corvetteFilter=['all','selected','forsaken','reactors','engines','weapons','shields','core'].includes(t.value)?t.value:'all';applyCorvetteSearch();return;}
    if(t.id==='cv-goal'&&CV.goals[t.value]){p.goal=t.value;p.tech.goal=cvConstructionToTechnologyGoal[t.value];p.tech.dirty=!!p.tech.optimized&&!!p.tech.layout;save();render();return;}
    if(t.id==='cv-style'&&['Titan','Ambassador','Thunderbird','Mixed','Forsaken'].includes(t.value)){p.style=t.value;save();render();return;}
    if(t.id==='cv-class'&&['C','B','A','S'].includes(t.value)){p.cls=t.value;p.tech.cls=t.value;p.tech.sc=p.tech.sc.slice(0,wantedSC('starship',p.cls));p.tech.dirty=!!p.tech.optimized&&!!p.tech.layout;save();render();return;}
    if(t.id==='cv-name'){p.name=t.value.trim().slice(0,80);save();render();return;}
    if(t.id==='cv-tech-goal'&&cvTechGear.goals[t.value]){p.tech.goal=t.value;corvetteTechChanged();return;}
    if(t.id==='cv-primary-weapon'&&(t.value==='auto'||cvWeaponFamilies.includes(t.value))){p.primaryWeapon=t.value;corvetteTechChanged();return;}
    if(t.id==='cv-tech-depth'){p.tech.depth=clamp(t.value,1,3);corvetteTechChanged();return;}
    if(t.id==='cv-tech-cols'||t.id==='cv-tech-rows'){
      if(t.id==='cv-tech-cols')p.tech.cols=clamp(t.value,6,10);else p.tech.rows=clamp(t.value,3,6);
      p.tech.layout=null;p.tech.optimized=false;p.tech.dirty=false;p.tech.blocked=[];p.tech.sc=[];syncCorvetteTechnology(p.tech,p.counts);selectedCell=null;activeTile=null;save();render();return;
    }
    if(t.dataset?.cvTechFamily){const id=t.dataset.cvTechFamily;if(!cvTechGear.families[id])return;
      if(t.checked&&!p.tech.enabled.includes(id))p.tech.enabled.push(id);
      if(t.checked&&cvWeaponFamilies.includes(id))p.primaryWeapon=id;
      if(!t.checked)p.tech.enabled=p.tech.enabled.filter(x=>x!==id);
      if(!t.checked&&p.primaryWeapon===id&&!Object.entries(p.counts).some(([partId,count])=>count>0&&CV.weaponFamilyByPart[partId]===id))p.primaryWeapon='auto';
      corvetteTechChanged();return;
    }
    if(t.dataset?.cvTechAddon){const token=t.dataset.cvTechAddon;const [id,addonId]=token.split(':');
      if(!(cvTechGear.families[id]?.addons||[]).some(a=>a.id===addonId))return;
      if(t.checked&&!p.tech.addons.includes(token))p.tech.addons.push(token);
      if(!t.checked)p.tech.addons=p.tech.addons.filter(x=>x!==token);
      corvetteTechChanged();return;
    }
    if(t.dataset?.cvZone&&CV.byId[t.dataset.cvZone]&&['fore','mid','aft'].includes(t.value)){p.zones[t.dataset.cvZone]=t.value;save();render();return;}
    return;
  }
  if(t.dataset && t.dataset.family){const id=t.dataset.family;if(t.checked&&!profile.enabled.includes(id))profile.enabled.push(id);
    if(!t.checked)profile.enabled=profile.enabled.filter(x=>x!==id);layoutChanged(profile);return;}
  if(t.dataset && t.dataset.addon){
    const [id,addonId]=t.dataset.addon.split(':'),f=gear.families[id];
    const addon=(f?.addons||[]).find(a=>a.id===addonId);
    if(!addon)return;
    if(t.checked){
      if(addon.exclusive)profile.addons=profile.addons.filter(token=>{
        const [g,a]=token.split(':');
        return g!==id || !(f.addons.find(x=>x.id===a)?.exclusive===addon.exclusive);
      });
      if(!profile.addons.includes(t.dataset.addon))profile.addons.push(t.dataset.addon);
    }else profile.addons=profile.addons.filter(x=>x!==t.dataset.addon);
    layoutChanged(profile);return;
  }
  if(t.id==='gear-name'){profile.name=t.value.trim().slice(0,80);save();render();return;}
  if(t.id==='gear-class'){if(gear.fixedSC)return;profile.cls=t.value;
    // Class changes never create sample SC markers. Preserve explicit positions,
    // trimming any that exceed the class's supported marker count.
    profile.sc=profile.sc.slice(0,wantedSC(key,profile.cls));
    profile.scExample=false;
    layoutChanged(profile);return;}
  if(t.id==='gear-target'){profile.target=t.value==='X'?'X':'S';layoutChanged(profile);return;}
  if(t.id==='vehicle'&&gear.vehicleOptions?.[t.value]){
    if(profile.vehicle===t.value)return;
    const savedVehicles=profile.savedVehicles||{};
    const {savedVehicles:unused,...snapshot}=profile;
    savedVehicles[profile.vehicle]=snapshot;
    let next;
    if(savedVehicles[t.value]){
      next=normalizeProfile(key,{...savedVehicles[t.value],vehicle:t.value,savedVehicles:null});
    }else{
      next=defaultProfile(key);
      next.vehicle=t.value;
      next.enabled=goalDefaults(gear,next.goal,next.vehicle);
      next.addons=defaultAddons(gear,next.vehicle);
    }
    next.savedVehicles=savedVehicles;
    state.equipment[key]=next;
    activeTile=null;selectedCell=null;editing='move';save();render();
    toast(`${gear.vehicleOptions[t.value]} selected. ${next.layout?'Previous layout restored.':'Select Optimize to plan this vehicle.'}`);return;
  }
  if(t.id==='goal'){updateGoal(t.value);return;}
  if(t.id==='grid-cols'||t.id==='grid-rows'){
    const oldCols=profile.cols,oldRows=profile.rows;
    if(t.id==='grid-cols')profile.cols=clamp(t.value,6,10);else profile.rows=clamp(t.value,3,6);
    if(profile.cols!==oldCols||profile.rows!==oldRows){
      // Coordinates change when row width changes; never silently remap technology.
      profile.layout=null;profile.dirty=false;profile.blocked=[];
      profile.sc=[];profile.scExample=false;
      activeTile=null;selectedCell=null;
      save();render();toast('Grid dimensions changed. Technology placement cleared; re-mark real slot positions.');
    }return;
  }
});
// Persist the name while typing, without interrupting input focus or resetting the cursor.
app.addEventListener('toggle',event=>{
  const t=event.target;
  if(!t.dataset?.addonGroup)return;
  if(t.open)expandedAddons.add(t.dataset.addonGroup);
  else expandedAddons.delete(t.dataset.addonGroup);
},true);
app.addEventListener('input',event=>{if(event.target.id==='gear-name'){context().profile.name=event.target.value.slice(0,80);save();} if(event.target.id==='cv-name'){state.equipment.corvette.name=event.target.value.slice(0,80);save();}});
function applySearch(){
  const list=document.getElementById('family-list');if(!list||!list.querySelectorAll)return;
  const query=technologyQuery.trim().toLowerCase();
  list.querySelectorAll('.family-entry').forEach(entry=>entry.classList.toggle('filtered-out',!!query&&!entry.dataset.search.includes(query)));
  let group=null,hasVisible=false;
  list.querySelectorAll('.tech-section-title, .family-entry').forEach(el=>{
    if(el.classList.contains('tech-section-title')){
      if(group)group.classList.toggle('filtered-out',!hasVisible);
      group=el;hasVisible=false;
    }else if(!el.classList.contains('filtered-out'))hasVisible=true;
  });
  if(group)group.classList.toggle('filtered-out',!hasVisible);
}
app.addEventListener('input',event=>{
  if(event.target.id==='cv-search'){corvetteQuery=event.target.value.slice(0,100);applyCorvetteSearch();return;}
  if(event.target.id==='search-tech'){
    technologyQuery=event.target.value.slice(0,100);
    applySearch();
  }
});
function dragCell(event){const cell=event.target.closest?.('.cell[data-cell]');return cell?Number(cell.dataset.cell):null;}
app.addEventListener('dragstart',event=>{
  const {key,profile:ordinary}=context();
  const profile=key==='corvette'?state.equipment.corvette.tech:ordinary;
  const mode=key==='corvette'?cvTechMode:editing;
  const cell=dragCell(event);
  if(cell===null||mode!=='move'||!profile.layout||profile.layout.map[cell]<0){event.preventDefault();return;}
  dragFrom=cell;
  event.dataTransfer?.setData('text/plain',String(cell));
  if(event.dataTransfer)event.dataTransfer.effectAllowed='move';
});
app.addEventListener('dragover',event=>{
  if(dragFrom===null)return;
  const cell=event.target.closest?.('.cell[data-cell]');if(!cell)return;
  if((context().key==='corvette'?state.equipment.corvette.tech:context().profile).blocked.includes(Number(cell.dataset.cell)))return;
  event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect='move';
  app.querySelectorAll('.cell.drag-over').forEach(el=>el.classList.remove('drag-over'));
  cell.classList.add('drag-over');
});
app.addEventListener('drop',event=>{
  if(dragFrom===null)return;
  const cell=dragCell(event),from=dragFrom;dragFrom=null;
  app.querySelectorAll('.cell.drag-over').forEach(el=>el.classList.remove('drag-over'));
  if(cell===null||cell===from)return;
  event.preventDefault();
  const {key,profile:ordinary}=context();
  const profile=key==='corvette'?state.equipment.corvette.tech:ordinary;
  if(!profile.layout||profile.blocked.includes(cell))return;
  [profile.layout.map[from],profile.layout.map[cell]]=[profile.layout.map[cell],profile.layout.map[from]];
  selectedCell=null;activeTile=profile.layout.map[cell]>=0?profile.layout.tiles[profile.layout.map[cell]]:null;
  profile.dirty=true;save();render();
});
app.addEventListener('dragend',()=>{dragFrom=null;app.querySelectorAll('.cell.drag-over').forEach(el=>el.classList.remove('drag-over'));});
render();
})();