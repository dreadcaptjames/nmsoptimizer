(function(){
'use strict';
const DATA=window.ATLAS_DATA;
const SOLVER=window.ATLAS_SOLVER;
const ICONS=window.ATLAS_ICONS;
const STORAGE='atlas-max-v1';
const gearKeys=Object.keys(DATA.gear);
const app=document.getElementById('app');
let editing='move',selectedCell=null,activeTile=null,toastTimer=null;
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
      section=f.section||'Technology';parts.push(`<h4 class="tech-section-title">${esc(section)}</h4>`);
    }
    const picked=(f.addons||[]).filter(a=>canUse(a,profile.vehicle)&&profile.addons.includes(id+':'+a.id));
    const summary=f.core?`Base + ${Math.min(profile.depth,f.maxUpgrades||0)} rolled`:
      f.maxUpgrades?`${Math.min(profile.depth,f.maxUpgrades)} rolled modules`:'Individual blueprints';
    const addons=(f.addons||[]).filter(a=>canUse(a,profile.vehicle));
    parts.push(`<div class="family-row"><input type="checkbox" id="fam-${id}" data-family="${id}" ${profile.enabled.includes(id)?'checked':''}><label for="fam-${id}"><span class="fam-topline"><span class="family-icon ${esc(f.color)}">${ICONS.render(f.icon,'family-glyph')}</span><span class="fam-title">${esc(f.name)} <span class="prio">${'◆'.repeat(Math.min(3,Math.ceil((goal.weights[id]||0)/2.5)))}</span></span></span><span class="fam-sub">${esc(summary)}${addons.length?` · ${picked.length}/${addons.length} extras`:''}</span></label></div>`);
    if(addons.length){
      parts.push(`<details class="addon-details" data-addon-group="${id}" ${expandedAddons.has(id)?'open':''}>
        <summary>Choose ${esc(f.name)} blueprints <span>${picked.length}/${addons.length}</span></summary>
        <div class="addon-list">${addons.map(a=>`<label class="addon-row ${profile.enabled.includes(id)?'':'dimmed'}"><input type="checkbox" data-addon="${id}:${esc(a.id)}" ${profile.addons.includes(id+':'+a.id)?'checked':''} ${profile.enabled.includes(id)?'':'disabled'}><span class="addon-glyph ${esc(f.color)}">${ICONS.render(a.icon||f.icon,'family-glyph')}</span><span>${esc(a.name)}</span></label>`).join('')}</div>
      </details>`);
    }
  }
  return parts.join('');
}
function render(){
  const {gear,profile,key}=context(),goal=gear.goals[profile.goal],stats=currentStats(gear,profile);
  const scCount=wantedSC(key,profile.cls),openSlots=profile.cols*profile.rows-profile.blocked.length;
  const tilesInGrid=profile.layout?profile.layout.map.filter(x=>x>=0).length:0;
  const profSC=profile.sc.filter(pos=>!profile.blocked.includes(pos));
  const sorted=familyPriority(gear,profile);
  const scMismatched=profSC.length!==scCount;
  const hasSkipped=profile.layout&&profile.layout.skipped&&profile.layout.skipped.length;
  app.innerHTML=`
    <header class="topbar">
      <div class="brand"><span class="brand-icon" aria-hidden="true">⟁</span><div><div class="brand-name">ATLAS <span>MAX</span></div><div class="brand-sub">NO MAN'S SKY EQUIPMENT LAB</div></div></div>
      <div class="top-actions"><span class="version"><i class="dot"></i>${esc(DATA.release)} REFERENCE</span><button class="top-link" data-action="export" title="Download your saved equipment profiles">⇩ Export</button><button class="top-link" data-action="import">⇧ Import</button><input type="file" id="import-file" accept="application/json,.json" class="sr-only"></div>
    </header>
    <section class="hero"><div><div class="eyebrow">// Traveller loadout command</div><h1>Every slot matters.<br><em>Make yours count.</em></h1><p class="lead">Design your technology grid around actual supercharged slots, same-family adjacency and the way you play. No random builds, no imaginary damage numbers.</p></div><div class="hero-side"><strong>YOUR GAME. YOUR BUILD.</strong>Plan your layout here, then move technology manually in-game. Nothing connects to your save file.</div></section>
    <div class="workspace"><aside class="panel side">
      <div class="side-block"><div class="section-caption">01 / Choose equipment</div><nav class="gear-list" aria-label="Equipment types">
        ${gearKeys.map(k=>`<button class="gear-btn ${k===key?'active':''}" data-action="gear" data-gear="${k}" aria-pressed="${k===key}"><span class="gear-icon">${ICONS.render(DATA.gear[k].icon,'gear-glyph')}</span>${esc(DATA.gear[k].name)}<span class="gear-arrow">›</span></button>`).join('')}
      </nav></div>
      <div class="side-block"><div class="section-caption">02 / Your equipment</div>
        <div class="form-row"><label for="gear-name" class="label">Loadout name</label><input id="gear-name" class="control" maxlength="80" placeholder="${esc(gear.placeholder)}" value="${esc(profile.name)}"></div>
        <div class="controls-2"><div class="form-row"><label for="gear-class" class="label">Class</label><select id="gear-class" class="control" ${gear.fixedSC?'disabled title="Exosuit / Exocraft supercharged slots do not scale by class"':''}>${selectorOptions(['C','B','A','S'],profile.cls,v=>v+' class')}</select></div>
        <div class="form-row"><label for="gear-target" class="label">Upgrade target</label><select id="gear-target" class="control">${selectorOptions(['S','X'],profile.target,v=>v+' class')}</select></div></div>
        ${gear.vehicleOptions?`<div class="form-row"><label for="vehicle" class="label">Exocraft model</label><select id="vehicle" class="control">${Object.entries(gear.vehicleOptions).map(([id,name])=>`<option value="${id}" ${profile.vehicle===id?'selected':''}>${esc(name)}</option>`).join('')}</select><p class="tiny">Builds are saved independently for each vehicle. New vehicles start with compatible technology.</p></div>`:''}
        <div class="form-row"><label for="goal" class="label">Optimization focus</label><select id="goal" class="control">${Object.entries(gear.goals).map(([id,g])=>`<option value="${id}" ${id===profile.goal?'selected':''}>${esc(g.label)}</option>`).join('')}</select></div>
        <div class="form-row"><label class="label">Procedural modules per family</label><div class="segmented" role="group" aria-label="Module cap">${[1,2,3].map(i=>`<button data-action="depth" data-depth="${i}" class="${i===profile.depth?'current':''}" aria-pressed="${i===profile.depth}">${i}</button>`).join('')}</div><p class="tiny">Crafted blueprint technology does not consume these module slots.</p></div>
      </div>
      <div class="side-block"><div class="section-caption">03 / Include technology <small>${sorted.length} groups selected</small></div>
        ${renderTechnologyChoices(gear,profile,goal)}
        <p class="tiny">Each crafted blueprint is selectable. Add-ons never count against the three procedural module slots. Nothing auto-generates until you press Optimize.</p>
      </div>
      <div class="side-footer">Unofficial fan project. Not affiliated with Hello Games. Built for manual, player-controlled planning.</div>
    </aside>
    <main class="main">
      <div class="metrics">
        <div class="panel metric accent"><div class="metric-name">TECH SLOTS</div><div class="metric-value">${openSlots}<span class="soft">/${profile.cols*profile.rows}</span></div><div class="metric-sub">Unlocked in planner</div></div>
        <div class="panel metric violet"><div class="metric-name">SUPERCHARGED</div><div class="metric-value">${profSC.length}<span class="soft">/${scCount}</span></div><div class="metric-sub">Marked locations</div></div>
        <div class="panel metric"><div class="metric-name">ADJACENCY LINKS</div><div class="metric-value">${stats?stats.connections:'—'}</div><div class="metric-sub">Same-family shared edges</div></div>
        <div class="panel metric"><div class="metric-name">LAYOUT SCORE</div><div class="metric-value">${stats?Math.round(stats.score):'—'}</div><div class="metric-sub">Relative planning metric</div></div>
      </div>
      <section class="panel planner" aria-labelledby="grid-heading">
        <div class="planner-head"><div><div class="planner-title"><h2 id="grid-heading">${esc(profile.name.trim()||gear.name)} technology grid</h2><span class="${profile.layout&&!profile.dirty?'ready':'pending'}">${esc(status(profile))}</span></div><p class="helper">${esc(gear.subtitle)}${gear.vehicleOptions?' · '+esc(gear.vehicleOptions[profile.vehicle]):''} · Select slot locations to match your in-game inventory.</p></div>
          <div class="planner-settings"><label class="sr-only" for="grid-cols">Columns</label><select id="grid-cols" class="small-select">${selectorOptions([6,7,8,9,10],profile.cols,n=>n+' columns')}</select><label class="sr-only" for="grid-rows">Rows</label><select id="grid-rows" class="small-select">${selectorOptions([3,4,5,6],profile.rows,n=>n+' rows')}</select></div>
        </div>
        <div class="modes" role="group" aria-label="Technology grid editing modes">
          <button data-action="mode" data-mode="move" class="mode ${editing==='move'?'active':''}" aria-pressed="${editing==='move'}">↔ Move tech</button>
          <button data-action="mode" data-mode="charge" class="mode ${editing==='charge'?'active':''}" aria-pressed="${editing==='charge'}">✧ Mark supercharged</button>
          <button data-action="mode" data-mode="lock" class="mode ${editing==='lock'?'active':''}" aria-pressed="${editing==='lock'}">▨ Lock / unlock</button>
          <button data-action="clear-sc" class="mode" title="Remove all example supercharged slots">Clear SC</button>
        </div>
        <div class="grid-scroll"><div class="tech-grid" style="--columns:${profile.cols}" role="group" aria-label="Technology layout with ${profile.rows} rows and ${profile.cols} columns">${Array.from({length:profile.cols*profile.rows},(_,i)=>renderCell(i,gear,profile)).join('')}</div></div>
        <div class="grid-legend"><span><i class="swatch tlswatch"></i> Installed technology</span><span><i class="swatch scswatch"></i> Supercharged</span><span><i class="swatch lkswatch"></i> Locked</span><span>CORE = base · U1 = rolled module · TECH = crafted blueprint</span></div>
        ${profile.scExample?`<div class="notice warning"><strong>Example supercharged locations.</strong> These are illustrative, not your actual in-game coordinates. Select <b>Clear SC</b>, then mark your own slots for a personalized result.</div>`:''}
        ${scMismatched?`<div class="notice warning"><strong>Slot-count check:</strong> You marked ${profSC.length} supercharged slots; ${scCount} are expected for this equipment setting. The planner can still run, but verify your layout.</div>`:''}
        ${profile.layout&&profile.dirty?`<div class="notice warning">The layout or settings have changed since optimization. Select <strong>Optimize layout</strong> to calculate a new arrangement.</div>`:''}
        ${hasSkipped?`<div class="notice warning">${profile.layout.skipped.length} requested technology tiles could not fit. Not placed: ${esc(profile.layout.skipped.slice(0,5).map(t=>t.label).join(', '))}${profile.layout.skipped.length>5?' …':''}. Enlarge the grid, unlock slots, reduce module count or disable a lower-priority group.</div>`:''}
        ${activeTile?renderInspector(activeTile,gear):''}
        <div class="toolbar-bottom"><div class="action-row"><button class="btn primary" data-action="optimize">✧ Optimize layout</button><button class="btn" data-action="copy" ${!profile.layout?'disabled':''}>⧉ Copy build</button></div><div class="action-row"><button class="btn quiet" data-action="clear-layout">Clear layout</button><button class="btn quiet warn" data-action="reset">Reset profile</button></div></div>
        <div class="score-explainer">The optimizer rewards compatible shared edges and priority supercharged placements. Score is a comparative heuristic, <strong>not</strong> the game's hidden damage, shield, range or other stat formula.</div>
      </section>
      <div class="bottom-grid"><section class="panel detail-panel"><div class="catalog-head"><h3>Optimization briefing</h3><span class="eyebrow">${esc(goal.label)}</span></div>
        <p class="intro">${esc(goal.tip)}</p>
        ${profile.layout?renderBriefing(gear,profile,sorted,stats):`<div class="empty-state"><span class="empty-icon">✧</span><span><strong>Your planner is ready.</strong> Choose technology families, mark your actual supercharged slots and click <b>Optimize layout</b>. No build is generated automatically.</span></div>`}
        <div class="notice"><strong>Equipment note:</strong> ${esc(gear.note)}</div>
      </section><section class="panel detail-panel"><div class="catalog-head"><h3>Technology plan</h3><span class="eyebrow">${profile.target}-class target</span></div>
        <p class="intro">Place compatible technology next to one another; standalone utilities and cosmetics have no assumed adjacency bonus. Compare actual module rolls in-game.</p>
        ${sorted.length?sorted.map((id,i)=>renderFamilyCard(id,gear,profile,i)).join(''):'<div class="empty-state">Enable a technology family to begin.</div>'}
      </section></div>
      <section class="panel guide"><div class="heading-line"><h3>How to use ATLAS MAX</h3><span class="muted">Three steps. No save-file access.</span></div>
        <div class="guide-steps"><div class="step"><span class="step-num">01 / MATCH</span><strong>Recreate your inventory</strong><p>Choose grid dimensions, lock unavailable slots, then mark the real supercharged locations.</p></div>
        <div class="step"><span class="step-num">02 / PRIORITIZE</span><strong>Choose tech & blueprints</strong><p>Pick your priorities, procedural modules, and the exact crafted technologies you own or want to install.</p></div>
        <div class="step"><span class="step-num">03 / OPTIMIZE</span><strong>Apply the arrangement</strong><p>Generate a compact layout. Then compare your actual stats and rearrange technologies inside the game.</p></div></div>
        <div class="guide-footer">Mechanics references: ${DATA.sources.map(s=>`<a target="_blank" rel="noopener noreferrer" href="${esc(s.url)}">${esc(s.name)} ↗</a>`).join('')} · Current reference: ${esc(DATA.release)}.</div>
      </section>
    </main></div>
    <footer class="footer"><span>ATLAS MAX // UNOFFICIAL NO MAN'S SKY COMPANION</span><span>Profiles saved in this browser · Not affiliated with Hello Games</span></footer>
  `;
}
function renderCell(i,gear,profile){
  const locked=profile.blocked.includes(i),sc=profile.sc.includes(i);
  const tileIndex=profile.layout?profile.layout.map[i]:-1;
  const tile=tileIndex>=0?profile.layout.tiles[tileIndex]:null;
  const fam=tile?gear.families[tile.family]:null;
  const text=locked?'LOCK':tile?(tile.role==='core'?'CORE':tile.role==='crafted'?'TECH':'U'+tile.sequence):(sc?'SC':'+');
  const name=locked?'Unavailable':tile?tile.label:sc?'Supercharged':'Empty';
  const subtitle=tile?(tile.role==='core'?'Core technology':tile.role==='crafted'?'Crafted blueprint':`Upgrade ${tile.sequence}`):'';
  return `<button type="button" class="cell ${locked?'locked':''} ${sc?'sc':''} ${tile?'tile '+fam.color:''} ${selectedCell===i?'selected':''}" data-action="cell" data-cell="${i}" aria-label="Row ${Math.floor(i/profile.cols)+1}, column ${i%profile.cols+1}: ${esc(name)}${sc?' (supercharged)':''}${locked?' (locked)':''}" title="${esc(name)}${tile?' — '+esc(subtitle):''}">${tile?`<span class="slot-icon ${esc(fam.color)}">${ICONS.render(tile.icon||fam.icon,'slot-glyph')}</span><span class="cell-name">${esc(tile.role==='crafted'?tile.label:fam.name)}</span><span class="cell-rank">${esc(text)}</span>`:locked?`<span class="slot-icon lock-icon">${ICONS.render('lock','slot-glyph')}</span><span class="cell-rank">LOCKED</span>`:sc?`<span class="slot-icon sc-empty-icon">${ICONS.render('spark','slot-glyph')}</span><span class="cell-rank">SC SLOT</span>`:`<span class="cell-code">+</span><span class="number">${i+1}</span>`}</button>`;
}
function renderInspector(tile,gear){
  const fam=gear.families[tile.family];if(!fam)return'';
  return `<div class="inspector"><div class="inspector-title"><span class="family-icon ${esc(fam.color)}">${ICONS.render(tile.icon||fam.icon,'family-glyph')}</span><strong>${esc(tile.label)} · ${tile.role==='core'?'Core technology':tile.role==='crafted'?'Crafted blueprint':'Upgrade slot '+tile.sequence}</strong></div><div class="mini">${esc(fam.why)}</div><div class="mini">${tile.role==='upgrade'&&tile.sequence===1?'U1 is a placeholder for the strongest module roll you actually own. ':''}Use Move tech to click this tile and another slot to swap them.</div></div>`;
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
render();
})();
