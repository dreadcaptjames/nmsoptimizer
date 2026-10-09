(function(){
'use strict';
const DATA=window.ATLAS_DATA;
const SOLVER=window.ATLAS_SOLVER;
const ICONS=window.ATLAS_ICONS;
const STORAGE='atlas-max-v1';
const gearKeys=Object.keys(DATA.gear);
const app=document.getElementById('app');
let editing='move',selectedCell=null,activeTile=null,toastTimer=null;
let technologyQuery='',configOpen=false,insightsOpen=false,dragFrom=null;
const expandedAddons=new Set(['jetpack','life','hazard','underwater','mining','hyperdrive','freighterWarp','launch','mechLaser']);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||min));
const uniqueValid=(xs,size)=>[...new Set((Array.isArray(xs)?xs:[]).filter(x=>Number.isInteger(x)&&x>=0&&x<size))];
const wantedSC=(key,cls)=>DATA.gear[key].fixedSC || ({C:1,B:2,A:3,S:4}[cls]||4);
function demoSC(key,cls,cols=8,rows=5){
  const templates={exosuit:[2,19,32],multitool:[3,14,25,37],starship:[4,13,26,35],freighter:[5,14,25,36],exocraft:[2,19,33]};
  const positions=(templates[key]||[]).filter(p=>p<cols*rows);
  return positions.slice(0,wantedSC(key,cls));
}
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
function defaultProfile(key){
  const gear=DATA.gear[key],goal=Object.keys(gear.goals)[0],cls='S',vehicle=gear.vehicleOptions?Object.keys(gear.vehicleOptions)[0]:null;
  const cols=key==='exosuit'?10:8,rows=key==='exosuit'?6:5;
  return {name:'',cls,goal,vehicle,cols,rows,sc:demoSC(key,cls,cols,rows),blocked:[],scExample:true,enabled:goalDefaults(gear,goal,vehicle),addons:defaultAddons(gear,vehicle),catalogVersion:2,depth:3,target:'S',layout:null,dirty:false,...(vehicle?{savedVehicles:{}}:{})};
}
function initialState(){return {version:1,current:'starship',equipment:Object.fromEntries(gearKeys.map(k=>[k,defaultProfile(k)]))};}
function normalizeProfile(key,raw){
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
  p.addons=validAddons(gear,Array.isArray(raw.addons)?raw.addons:base.addons,p.vehicle);
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
  if(raw.layout&&Array.isArray(raw.layout.map)&&Array.isArray(raw.layout.tiles)
    &&raw.layout.map.length===p.cols*p.rows&&raw.layout.tiles.length<=p.cols*p.rows
    &&raw.layout.map.every(t=>Number.isInteger(t)&&t>=-1&&t<raw.layout.tiles.length)
    &&raw.layout.tiles.every(t=>t&&gear.families[t.family]&&['core','upgrade','crafted'].includes(t.role)&&Number.isInteger(t.sequence)&&t.sequence>=0&&t.sequence<=3)
    &&raw.layout.map.every((t,i)=>t===-1||!p.blocked.includes(i))){
    // Reconstitute only known family identifiers and safe, known technology labels.
    const tiles=raw.layout.tiles.map(t=>{
      const fam=gear.families[t.family];
      if(!canUse(fam,p.vehicle))return null;
      if(t.role==='crafted'){
        const addon=(fam.addons||[]).find(a=>a.id===t.addon&&canUse(a,p.vehicle));
        return addon?{id:t.family+':crafted:'+addon.id,family:t.family,role:'crafted',sequence:0,
          addon:addon.id,label:addon.name,icon:addon.icon||fam.icon,noAdjacency:!!addon.noAdjacency}:null;
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
      if(migrating||migratingCatalog)p.dirty=true;
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
function loadState(){
  try{const raw=JSON.parse(localStorage.getItem(STORAGE));if(raw&&raw.version===1&&raw.equipment){
    return{version:1,current:gearKeys.includes(raw.current)?raw.current:'starship',equipment:Object.fromEntries(gearKeys.map(k=>[k,normalizeProfile(k,raw.equipment[k])]))};
  }}catch(e){}
  return initialState();
}
let state=loadState();
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
  if(!tile||!profile.layout||tile.noAdjacency)return [];
  const map=profile.layout.map,tiles=profile.layout.tiles,cols=profile.cols,rows=profile.rows;
  const sides=[['top',i-cols,i>=cols],['bottom',i+cols,i<cols*(rows-1)],['left',i-1,i%cols>0],['right',i+1,i%cols<cols-1]];
  return sides.filter(([side,p,valid])=>{
    if(!valid||map[p]<0)return false;
    const other=tiles[map[p]],fam=gear.families[tile.family];
    if(!other||other.family!==tile.family||other.noAdjacency)return false;
    if(fam.adjacency!=='none')return true;
    return tile.family==='story'&&['star','remembrance'].includes(tile.addon)&&['star','remembrance'].includes(other.addon)&&tile.addon!==other.addon;
  }).map(x=>x[0]);
}
function render(){
  const {gear,profile,key}=context(),goal=gear.goals[profile.goal],stats=currentStats(gear,profile);
  const scCount=wantedSC(key,profile.cls),openSlots=profile.cols*profile.rows-profile.blocked.length;
  const tilesInGrid=profile.layout?profile.layout.map.filter(x=>x>=0).length:0;
  const profSC=profile.sc.filter(pos=>!profile.blocked.includes(pos));
  const sorted=familyPriority(gear,profile);
  const scMismatched=profSC.length!==scCount;
  const hasSkipped=profile.layout&&profile.layout.skipped&&profile.layout.skipped.length;
  const pct=Math.round(100*tilesInGrid/Math.max(1,openSlots));
  app.innerHTML=`
    <header class="topbar">
      <div class="brand"><span class="brand-icon" aria-hidden="true">⟁</span><div><div class="brand-name">ATLAS <span>MAX</span></div><div class="brand-sub">NO MAN'S SKY <b>·</b> EQUIPMENT LAB</div></div></div>
      <div class="top-actions"><span class="version"><i class="dot"></i> ${esc(DATA.release)} REFERENCE</span><button class="top-link" data-action="import" title="Load saved equipment profiles">⇧ <span>Import</span></button><button class="top-link" data-action="export" title="Download your saved equipment profiles">⇩ <span>Export</span></button><input type="file" id="import-file" accept="application/json,.json" class="sr-only"></div>
    </header>
    <div class="command-heading"><div><span class="eyebrow"><span class="signal-dot"></span> // TRAVELLER LOADOUT COMMAND</span><h1>Build for <em>what's out there.</em></h1><p>Every slot matters. Design the loadout, find your synergies, and bring the plan into your game.</p></div><div class="command-aside"><span>OPERATIONS / 05 SYSTEMS</span><strong>TECHNOLOGY WORKBENCH</strong><small>Offline-ready · Saved to this browser</small></div></div>
    <nav class="gear-nav" aria-label="Equipment types">${gearKeys.map((k,i)=>`<button class="gear-btn ${k===key?'active':''}" data-action="gear" data-gear="${k}" aria-pressed="${k===key}"><span class="gear-icon">${ICONS.render(DATA.gear[k].icon,'gear-glyph')}</span><span class="gear-text"><b>${esc(DATA.gear[k].name)}</b><small>0${i+1} / EQUIPMENT</small></span><span class="gear-arrow">↗</span></button>`).join('')}</nav>
    <section class="loadout-banner" aria-label="Current loadout">
      <div class="loadout-identity"><span class="loadout-badge">${ICONS.render(gear.icon,'gear-glyph')}</span><div><div class="eyebrow">ACTIVE PROFILE / ${esc(gear.name.toUpperCase())}</div><h2>${esc(profile.name.trim()||gear.name)} <span class="class-badge">${esc(profile.cls)}-CLASS</span></h2><p>${esc(gear.subtitle)}${gear.vehicleOptions?' · '+esc(gear.vehicleOptions[profile.vehicle]):''}</p></div></div>
      <div class="loadout-status ${profile.layout&&!profile.dirty?'ready':''}"><span class="status-dot"></span>${esc(status(profile))}</div>
    </section>
    <div class="workspace">
      <aside class="panel config-panel ${configOpen?'is-open':''}" id="config-panel">
        <div class="panel-heading"><div><div class="eyebrow">01 / CONFIGURE</div><h3>Loadout setup</h3></div><button class="collapse-button" data-action="panel" data-panel="config" aria-expanded="${configOpen}" aria-controls="config-body"><span class="when-closed">Open settings ⌄</span><span class="when-open">Close settings ⌃</span></button></div>
        <div class="config-body" id="config-body">
          <div class="config-block"><div class="form-row"><label class="label" for="gear-name">Loadout name</label><input id="gear-name" class="control" maxlength="80" placeholder="${esc(gear.placeholder)}" value="${esc(profile.name)}"></div>
            <div class="controls-2"><div class="form-row"><label class="label" for="gear-class">Equipment class</label><select id="gear-class" class="control" ${gear.fixedSC?'disabled title="Supercharged slots do not scale with class for this equipment"':''}>${selectorOptions(['C','B','A','S'],profile.cls,v=>v+' class')}</select></div><div class="form-row"><label class="label" for="gear-target">Upgrade target</label><select id="gear-target" class="control">${selectorOptions(['S','X'],profile.target,v=>v+' class')}</select></div></div>
            ${gear.vehicleOptions?`<div class="form-row"><label class="label" for="vehicle">Exocraft model</label><select id="vehicle" class="control">${Object.entries(gear.vehicleOptions).map(([id,name])=>`<option value="${id}" ${profile.vehicle===id?'selected':''}>${esc(name)}</option>`).join('')}</select><p class="tiny">Each vehicle retains its own saved loadout.</p></div>`:''}
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
          <div class="metric purple"><span class="metric-icon" aria-hidden="true">✦</span><div><div class="metric-name">SUPERCHARGED</div><div class="metric-value">${profSC.length}<span>/${scCount}</span></div></div></div>
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
          ${scMismatched?`<div class="notice warning"><strong>Slot-count check:</strong> ${profSC.length} supercharged positions marked; ${scCount} expected for this equipment setting. Verify your inventory.</div>`:''}
          ${profile.layout&&profile.dirty?`<div class="notice warning"><strong>Review changes.</strong> Your settings or placement changed. Optimize again when you're ready for a fresh result.</div>`:''}
          ${hasSkipped?`<div class="notice warning"><strong>${profile.layout.skipped.length} requested technologies didn't fit.</strong> ${esc(profile.layout.skipped.slice(0,5).map(t=>t.label).join(', '))}${profile.layout.skipped.length>5?' …':''}. Unlock slots, enlarge the grid or reduce selected technology.</div>`:''}
          <div class="toolbar-bottom"><div class="action-row"><button class="btn primary" data-action="optimize">✧ Optimize layout <span>↗</span></button><button class="btn" data-action="copy" ${!profile.layout?'disabled':''}>⧉ Copy build</button></div><div class="action-row"><button class="btn quiet" data-action="clear-layout">Clear layout</button><button class="btn quiet warn" data-action="reset">Reset</button></div></div>
          <div class="score-explainer">Planning score is a relative heuristic for compatible adjacency and supercharged placement—not actual in-game damage, range or shield statistics.</div>
        </section>
        <details class="panel guide"><summary><span>◈ <strong>How to use ATLAS MAX</strong></span><span>3-step quick guide <b>⌄</b></span></summary><div class="guide-steps"><div class="step"><span class="step-num">01 / MATCH</span><strong>Recreate your inventory</strong><p>Set dimensions, lock missing slots, and mark real supercharged positions.</p></div><div class="step"><span class="step-num">02 / PRIORITIZE</span><strong>Choose tech & blueprints</strong><p>Select the technology families and crafted upgrades appropriate to your equipment.</p></div><div class="step"><span class="step-num">03 / OPTIMIZE</span><strong>Apply your arrangement</strong><p>Generate a layout and transfer the placement to your in-game inventory.</p></div></div><div class="guide-footer">Reference material: ${DATA.sources.map(s=>`<a target="_blank" rel="noopener noreferrer" href="${esc(s.url)}">${esc(s.name)} ↗</a>`).join('')}.</div></details>
      </main>
      <aside class="panel insight-panel ${insightsOpen?'is-open':''}"><div class="panel-heading"><div><div class="eyebrow">04 / LIVE ANALYSIS</div><h3>Build intelligence</h3></div><button class="collapse-button" data-action="panel" data-panel="insights" aria-expanded="${insightsOpen}" aria-controls="insights-body"><span class="when-closed">Show ⌄</span><span class="when-open">Hide ⌃</span></button></div>
        <div id="insights-body" class="insights-body"><section class="inspector-card"><div class="inspector-kicker">SELECTED MODULE <span>◉ LIVE</span></div>${activeTile?renderInspector(activeTile,gear):`<div class="inspect-empty"><span class="inspect-placeholder">${ICONS.render(gear.icon,'gear-glyph')}</span><strong>No module selected</strong><p>${profile.layout?'Select an installed tile to view its role and system details.':'Generate a layout to inspect technology placement and adjacency.'}</p></div>`}</section>
          <section class="insight-metrics"><div class="insight-metric"><span>Installed / capacity</span><strong>${tilesInGrid} <small>/ ${openSlots}</small></strong></div><div class="progress-track"><span style="width:${pct}%"></span></div><div class="insight-metric"><span>Goal preset</span><strong>${esc(goal.label)}</strong></div><div class="insight-metric"><span>Upgrade target</span><strong>${esc(profile.target)}-class modules</strong></div></section>
          <section class="briefing"><div class="catalog-head"><h3>Priority briefing</h3><span>✧</span></div><p class="intro">${esc(goal.tip)}</p>${profile.layout?renderBriefing(gear,profile,sorted,stats):`<div class="empty-state"><span>✧</span><p><strong>Your planner is ready.</strong> Nothing has been generated yet. No build is generated automatically; click Optimize layout when ready.</p></div>`}<div class="notice"><strong>Equipment note</strong><p>${esc(gear.note)}</p></div></section>
          <details class="technology-plan"><summary><span>Technology plan <small>${sorted.length} families</small></span><span>⌄</span></summary><div class="plan-content">${sorted.length?sorted.map((id,i)=>renderFamilyCard(id,gear,profile,i)).join(''):'<div class="empty-state">Enable a technology family to begin.</div>'}</div></details>
        </div>
      </aside>
    </div>
    <footer class="footer"><span>⟁ ATLAS MAX / UNOFFICIAL NO MAN'S SKY COMPANION</span><span>Local profiles · No game save access · Not affiliated with Hello Games</span></footer>`;
  if(technologyQuery)applySearch();
}
function renderCell(i,gear,profile){
  const locked=profile.blocked.includes(i),sc=profile.sc.includes(i);
  const tileIndex=profile.layout?profile.layout.map[i]:-1;
  const tile=tileIndex>=0?profile.layout.tiles[tileIndex]:null;
  const fam=tile?gear.families[tile.family]:null;
  const text=locked?'LOCK':tile?(tile.role==='core'?'CORE':tile.role==='crafted'?'TECH':'U'+tile.sequence):(sc?'SC':'+');
  const name=locked?'Unavailable':tile?tile.label:sc?'Supercharged':'Empty';
  const subtitle=tile?(tile.role==='core'?'Core technology':tile.role==='crafted'?'Crafted blueprint':`Upgrade ${tile.sequence}`):'';
  const edges=adjacencyFor(i,gear,profile,tile);
  const selectedFamily=activeTile&&activeTile.family===tile?.family;
  return `<button type="button" class="cell ${locked?'locked':''} ${sc?'sc':''} ${tile?'tile '+fam.color:''} ${selectedCell===i?'selected':''} ${selectedFamily?'same-family':''} ${activeTile&&tile&&!selectedFamily?'deemphasized':''}" data-action="cell" data-cell="${i}" ${tile&&editing==='move'?'draggable="true"':''} aria-label="Row ${Math.floor(i/profile.cols)+1}, column ${i%profile.cols+1}: ${esc(name)}${sc?' (supercharged)':''}${locked?' (locked)':''}" title="${esc(name)}${tile?' — '+esc(subtitle):''}">${edges.map(side=>`<span class="adjacency-edge ${side}" aria-hidden="true"></span>`).join('')}${tile?`<span class="slot-icon ${esc(fam.color)}">${ICONS.render(tile.icon||fam.icon,'slot-glyph')}</span><span class="cell-name">${esc(tile.role==='crafted'?tile.label:fam.name)}</span><span class="cell-rank">${esc(text)}</span>`:locked?`<span class="slot-icon lock-icon">${ICONS.render('lock','slot-glyph')}</span><span class="cell-rank">LOCKED</span>`:sc?`<span class="slot-icon sc-empty-icon">${ICONS.render('spark','slot-glyph')}</span><span class="cell-rank">SC SLOT</span>`:`<span class="cell-code">+</span><span class="number">${String(i+1).padStart(2,'0')}</span>`}</button>`;
}
function renderInspector(tile,gear){
  const fam=gear.families[tile.family];if(!fam)return'';
  const role=tile.role==='core'?'Base technology':tile.role==='crafted'?'Crafted blueprint':`Rolled upgrade / slot ${tile.sequence}`;
  return `<div class="inspector"><div class="inspector-title"><span class="family-icon ${esc(fam.color)}">${ICONS.render(tile.icon||fam.icon,'family-glyph')}</span><div><strong>${esc(tile.label)}</strong><small>${esc(role)}</small></div></div><p>${esc(fam.why)}</p><div class="inspector-note">${tile.role==='upgrade'&&tile.sequence===1?'U1 represents your best module roll, not a guaranteed stat value. ':'Use Move tech to select another slot or drag this module to relocate it.'}</div></div>`;
}
function renderBriefing(gear,profile,sorted,stats){
  return `<div class="priority-item"><span class="number-badge">✧</span><div><h4>${stats.usedSC}/${profile.sc.length} marked supercharged positions filled</h4><p>Priority weighted to your ${esc(gear.goals[profile.goal].label.toLowerCase())} goal, using your current marked positions.</p></div></div>
  <div class="priority-item"><span class="number-badge">⌗</span><div><h4>${stats.connections} same-family adjacency links</h4><p>Only side-by-side technology of the same supported family contributes to this count, not diagonals.</p></div></div>
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
  return `ATLAS MAX • ${profile.name||gear.name}\nEquipment: ${gear.name} | Class: ${profile.cls}\nFocus: ${gear.goals[profile.goal].label} | Target: ${profile.target} class\nTechnology: ${sorted.map(id=>gear.families[id].name).join(', ')}\nPlanning score: ${Math.round(stats.score)} (heuristic, NOT in-game stats)\nAdjacency links: ${stats.connections} | SC tiles used: ${stats.usedSC}/${profile.sc.length}\n${profile.scExample?'WARNING: Example SC positions — not personalized to a game save.\n':''}* = supercharged slot\n${rows.join('\n')}\n\nFan-made planner. Verify the arrangement and technology stats in No Man's Sky.`;
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
    if(profile.scExample)profile.sc=demoSC(key,profile.cls,profile.cols,profile.rows);
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
      profile.sc=profile.scExample?demoSC(key,profile.cls,profile.cols,profile.rows):[];
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
app.addEventListener('input',event=>{if(event.target.id==='gear-name'){context().profile.name=event.target.value.slice(0,80);save();}});
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
  if(event.target.id==='search-tech'){
    technologyQuery=event.target.value.slice(0,100);
    applySearch();
  }
});
function dragCell(event){const cell=event.target.closest?.('.cell[data-cell]');return cell?Number(cell.dataset.cell):null;}
app.addEventListener('dragstart',event=>{
  const {profile}=context();const cell=dragCell(event);
  if(cell===null||editing!=='move'||!profile.layout||profile.layout.map[cell]<0){event.preventDefault();return;}
  dragFrom=cell;
  event.dataTransfer?.setData('text/plain',String(cell));
  if(event.dataTransfer)event.dataTransfer.effectAllowed='move';
});
app.addEventListener('dragover',event=>{
  if(dragFrom===null)return;
  const cell=event.target.closest?.('.cell[data-cell]');if(!cell)return;
  if(context().profile.blocked.includes(Number(cell.dataset.cell)))return;
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
  const {profile}=context();if(!profile.layout||profile.blocked.includes(cell))return;
  [profile.layout.map[from],profile.layout.map[cell]]=[profile.layout.map[cell],profile.layout.map[from]];
  selectedCell=null;activeTile=profile.layout.map[cell]>=0?profile.layout.tiles[profile.layout.map[cell]]:null;
  profile.dirty=true;save();render();
});
app.addEventListener('dragend',()=>{dragFrom=null;app.querySelectorAll('.cell.drag-over').forEach(el=>el.classList.remove('drag-over'));});
render();
})();