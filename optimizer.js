/* ATLAS MAX optimizer: heuristic placement, NOT the game's hidden stat formula.
   Each tile belongs to one technology family.  We seek weighted same-family
   cardinal adjacency, priority supercharged placements and compact clusters. */
(function (root) {
  'use strict';
  const index = (r, c, cols) => r * cols + c;
  const getNeighbors = (pos, cols, rows) => {
    const c = pos % cols, r = Math.floor(pos / cols), a = [];
    if (c > 0) a.push(pos - 1);
    if (c < cols - 1) a.push(pos + 1);
    if (r > 0) a.push(pos - cols);
    if (r < rows - 1) a.push(pos + cols);
    return a;
  };
  function stableSeed(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function randomGenerator(seed) {
    let s = seed >>> 0;
    return () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function assemble(gear, profile, capacity) {
    const goal = gear.goals[profile.goal];
    const active = (profile.enabled || []).filter(id => gear.families[id] && (!gear.families[id].vehicles || !profile.vehicle || gear.families[id].vehicles.includes(profile.vehicle))).sort((a,b) =>
      (goal.weights[b] || 0) - (goal.weights[a] || 0));
    const selected = new Set(profile.addons || []);
    const replacements = new Set();
    for(const id of active){
      for(const addon of gear.families[id].addons||[]){
        if(selected.has(id+':'+addon.id) && addon.replacesCore)replacements.add(addon.replacesCore);
      }
    }
    // Corvette construction-generated technology is mandatory inventory content.
    // Reserve these tiles before optional shared ship upgrades so a crowded grid
    // warns about overflow instead of silently omitting an installed reactor.
    const mandatory=(Array.isArray(profile.fixedTiles)?profile.fixedTiles:[])
      .filter(t=>t && t.role==='construction' && gear.families[t.family]);
    const request = mandatory.slice();
    // Reserve enough capacity for the full highest-priority performance family
    // before spending space on lower-priority families. This is important for
    // small grids: a weapon with 3 upgrades must not be truncated simply
    // because an unrelated engine happened to request its core first.
    // The module cap applies only to procedural upgrades, never blueprints.
    for (const id of active) {
      const family = gear.families[id];
      if (family.core && !replacements.has(id)) request.push({id:id+':core',family:id,role:'core',sequence:0,label:family.core});
      for (let sequence=1;sequence<=Math.min(3,profile.depth||3,family.maxUpgrades||0);sequence++)
        request.push({id:id+':'+sequence,family:id,role:'upgrade',sequence,label:family.upgrade});
    }
    // Every named crafted technology is its own installable tile; these are not
    // generic procedural upgrades and cannot consume the module limit.
    for (const id of active) {
      const family=gear.families[id];
      const chosen=new Set();
      for (const addon of family.addons || []) {
        if (!selected.has(id+':'+addon.id) || (addon.vehicles && profile.vehicle && !addon.vehicles.includes(profile.vehicle))) continue;
        if (addon.exclusive && chosen.has(addon.exclusive)) continue;
        if (addon.exclusive) chosen.add(addon.exclusive);
        request.push({id:id+':crafted:'+addon.id,family:id,role:'crafted',sequence:0,
          addon:addon.id,label:addon.name,icon:addon.icon || family.icon,noAdjacency:!!addon.noAdjacency,noSC:!!addon.noSC,adjacencyNote:addon.adjacencyNote||null});
      }
    }
    return {tiles:request.slice(0,capacity),skipped:request.slice(capacity),requested:request.length};
  }
  // Actual inventory relationships are not equivalent to the catalog section.
  // Never invent adjacency solely from matching functional descriptions.
  // Conservatively model only confirmed links and suppress explicitly unsupported
  // technology pairs (e.g. Aqua-Jets, Aeration vs underwater oxygen modules).
  function hazardAdjacencyMember(tile) {
    if(!tile || tile.noAdjacency) return false;
    if(['hazard','heat','cold','toxic','radiation','forbidden'].includes(tile.family))
      return tile.role==='core' || tile.role==='upgrade' || (tile.family==='hazard' && tile.addon==='lattice');
    return tile.family==='underwater' && tile.role==='core'; // Aeration Membrane: general hazard links
  }
  function areAdjacent(a,b,gear) {
    if(!a || !b || a.noAdjacency || b.noAdjacency) return false;
    // The ONLY adjacency relationship among Atlas story/utility objects.
    if(a.family==='story' || b.family==='story')
      return a.family==='story' && b.family==='story' &&
        ((a.addon==='star' && b.addon==='remembrance') ||
         (b.addon==='star' && a.addon==='remembrance'));
    // These recharged underwater O2 modules link to EACH OTHER, not the
    // Aeration Membrane or other environmental shielding technologies.
    if(a.family==='underwater' || b.family==='underwater') {
      if(a.family==='underwater' && b.family==='underwater')
        return a.role==='upgrade' && b.role==='upgrade';
      return hazardAdjacencyMember(a) && hazardAdjacencyMember(b);
    }
    // Exosuit heat/cold/toxic/radiation shielding and suspicious hazard
    // protection have documented cross-family hazard adjacency relationships.
    // No extra relation is inferred outside of the Exosuit catalog.
    if(gear?.families?.hazard && hazardAdjacencyMember(a) && hazardAdjacencyMember(b))
      return true;
    const f=gear?.families?.[a.family];
    return a.family===b.family && f?.adjacency!=='none';
  }
  // Supercharging depends on the actual module stats, which are not supplied
  // by this catalog. This is an explicit relative priority, never a DPS/% claim.
  // U1 means the player's best rolled module; U2/U3 are progressively weaker
  // candidates until the player compares the actual rolls in-game.
  function scValue(tile, gear, goal) {
    if (!tile) return 0;
    const family = gear.families[tile.family];
    if (!family || tile.noSC || family.sc === 'none' || (tile.role!=='construction' && (family.adjacency === 'none' || tile.noAdjacency))) return 0;
    const weight = Math.max(0, Number(goal.weights[tile.family] ?? 1));
    if (!weight) return 0;
    const preferred = family.sc === tile.role;
    const roleFactor = preferred ? 1.6 : tile.role === 'crafted' ? .58 : .82;
    const quality = tile.role === 'upgrade' ? (tile.sequence === 1 ? 1.3 : tile.sequence === 2 ? 1 : .8) : 1;
    // Supercharging is a primary objective; ordinary adjacency is a secondary
    // objective when two candidates have similar SC value.
    return 18 * weight * roleFactor * quality;
  }
  // The selected goal defines a *family-first* order for supercharged slots.
  // Within a family, use the strongest modeled module first. Ignore technology
  // with no modeled SC benefit. This is intentionally not a claim about exact
  // rolled stats: players still need to compare their real upgrades in-game.
  function superchargedPlan(tiles, gear, goal, count) {
    const ranked = tiles.map((tile,i)=>({index:i,family:tile.family,
      weight:Math.max(0,Number(goal.weights[tile.family]??1)),
      priority:scValue(tile,gear,goal)}))
      .filter(x=>x.priority>0)
      .sort((a,b)=>b.weight-a.weight || b.priority-a.priority || a.index-b.index);
    const selected=ranked.slice(0,Math.max(0,Math.floor(Number(count)||0))).map(x=>x.index);
    return {ranked,selected,focusFamily:ranked.length?ranked[0].family:null};
  }
  function scoreMap(map, tiles, gear, goal, cols, rows, supercharged) {
    let score = 0, connections = 0, usedSC = 0, effectiveSC = 0;
    let scScore = 0, adjacencyScore = 0, compactnessPenalty = 0, fragmentedGroups = 0;
    const sc = new Set(supercharged);
    const groups = {}, scPlacements=[];
    for (let p = 0; p < map.length; p++) {
      const t = tiles[map[p]];
      if (!t) continue;
      const w = Math.max(0, Number(goal.weights[t.family] ?? 1));
      const family = gear.families[t.family];
      (groups[t.family] ||= []).push(p);
      if (sc.has(p)) {
        const priority = scValue(t,gear,goal);
        scScore += priority;
        usedSC++;
        if (priority > 0) effectiveSC++;
        scPlacements.push({position:p,tileId:t.id,label:t.label,family:t.family,
          role:t.role,priority,preferred:priority>0&&family.sc===t.role});
      }
      // Only count right and lower edge to avoid doubling each adjacency.
      const right = p % cols < cols - 1 ? tiles[map[p+1]] : null;
      const down = p + cols < map.length ? tiles[map[p+cols]] : null;
      [right,down].forEach(other => {
        if (areAdjacent(t,other,gear)) {
          const isStoryPair=t.family==='story';
          if(isStoryPair) adjacencyScore += 40; // Star Seed + Remembrance
          else {
            const otherWeight=Math.max(0,Number(goal.weights[other.family]??1));
            const coreBonus = other.role === 'core' || t.role === 'core' ? 1.12 : 1;
            // A compatible pair is valuable even when BOTH systems have zero
            // goal weight. The goal weight is an *extra* bonus, not the only
            // reason to connect second-tier technologies.
            const priorityWeight=Math.max(w,otherWeight);
            adjacencyScore += (5.5 + 1.25 * priorityWeight) * coreBonus;
          }
          connections++;
        }
      });
    }
    // Small compactness preference reduces fragmented same-family islands.
    Object.entries(groups).forEach(([id,positions]) => {
      if (positions.length < 2 || gear.families[id].adjacency === 'none') return;
      positions = positions.filter(pos => !tiles[map[pos]].noAdjacency && !(id==='underwater' && tiles[map[pos]].role!=='upgrade'));
      if(positions.length<2)return;
      const meanX = positions.reduce((s,p)=>s+(p%cols),0)/positions.length;
      const meanY = positions.reduce((s,p)=>s+Math.floor(p/cols),0)/positions.length;
      let spread = 0;
      positions.forEach(p => { spread += Math.abs(p%cols-meanX)+Math.abs(Math.floor(p/cols)-meanY); });
      const weight=Math.max(0,Number(goal.weights[id] ?? 1));
      // Always compact technology families: the old weight-only penalty was
      // exactly zero for the secondary systems Long Range and Combat omit.
      compactnessPenalty += spread * (.20 + .09 * weight);
      // Reward one cohesive group instead of two disconnected mini-clusters.
      // Only count tiles for which at least one same-family adjacency is
      // modeled, so standalone and special-case technology is not penalized.
      const eligible=positions.filter(pos=>positions.some(other=>other!==pos &&
        areAdjacent(tiles[map[pos]],tiles[map[other]],gear)));
      if(eligible.length<2)return;
      const left=new Set(eligible);
      let components=0;
      while(left.size){
        components++;
        const first=left.values().next().value;
        left.delete(first);
        const queue=[first];
        while(queue.length){
          const here=queue.pop();
          for(const neighbor of getNeighbors(here,cols,rows)){
            if(left.has(neighbor)&&areAdjacent(tiles[map[here]],tiles[map[neighbor]],gear)){
              left.delete(neighbor);queue.push(neighbor);
            }
          }
        }
      }
      if(components>1){fragmentedGroups+=components-1;
        compactnessPenalty+=(components-1)*(5 + 1.1*weight);}
    });
    score = scScore + adjacencyScore - compactnessPenalty;
    return {score,connections,usedSC,effectiveSC,scScore,adjacencyScore,
      compactnessPenalty,fragmentedGroups,scPlacements};
  }
  function solve({gear,profile}) {
    const {cols,rows} = profile;
    const size = cols*rows;
    const blocked = new Set(profile.blocked.filter(i => i>=0 && i<size));
    const available = Array.from({length:size},(_,i)=>i).filter(i=>!blocked.has(i));
    const sc = [...new Set(profile.sc.filter(i => i>=0 && i<size && !blocked.has(i)))];
    const goal = gear.goals[profile.goal];
    if (!goal) throw new Error('Unknown build focus.');
    const assembled = assemble(gear,profile,available.length);
    const tiles = assembled.tiles;
    if (tiles.length === 0) throw new Error('Enable at least one technology family before optimizing.');
    // Stage one: commit the most valuable *eligible priority-family* modules to
    // the marked SC positions. Stage two: solve adjacency without evicting them.
    const scChoice=superchargedPlan(tiles,gear,goal,sc.length);
    const requiredSC=new Set(scChoice.selected);
    const scPositions=new Set(sc);
    let bestMap = null, bestStats = null;
    const seed = stableSeed(JSON.stringify([profile.goal,profile.vehicle,profile.enabled,profile.addons,profile.depth,profile.cols,profile.rows,sc,profile.blocked,(profile.fixedTiles||[]).map(t=>t.id)]));
    const loops = Math.min(5600,Math.max(2200,available.length*90));
    for (let run=0;run<7;run++) {
      const rnd = randomGenerator(seed + run*10007);
      const map = Array(size).fill(-1);
      const shuffled = available.slice();
      for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
      // Fill as many marked SC positions as logically beneficial, using goal
      // order first (e.g. all viable primary-weapon tiles), THEN lower ranks.
      // Runs vary the slot assignments to find a stronger adjacency pattern.
      const availableSC=sc.slice().sort((a,b)=>
        getNeighbors(b,cols,rows).filter(p=>!blocked.has(p)).length-
        getNeighbors(a,cols,rows).filter(p=>!blocked.has(p)).length);
      if(run%2===1)availableSC.reverse();
      const assigned=new Set(),filled=new Set();
      for(let j=0;j<scChoice.selected.length;j++){
        map[availableSC[j]]=scChoice.selected[j];
        assigned.add(scChoice.selected[j]);filled.add(availableSC[j]);
      }
      const unfilled=shuffled.filter(p=>!filled.has(p));
      const remaining=tiles.map((_,i)=>i).filter(i=>!assigned.has(i));
      for(let i=0;i<remaining.length;i++)map[unfilled[i]]=remaining[i];
      let now = scoreMap(map,tiles,gear,goal,cols,rows,sc);
      let top = now;
      let topMap = map.slice();
      for (let i=0;i<loops;i++) {
        const a=available[Math.floor(rnd()*available.length)];
        const b=available[Math.floor(rnd()*available.length)];
        if(a===b || (map[a]===-1 && map[b]===-1))continue;
        // Never sacrifice a higher-priority SC placement just to gain a few
        // adjacency points. Swaps inside or outside SC remain unrestricted,
        // and unclaimed purple positions can accept lower-priority modules.
        if(scPositions.has(a)!==scPositions.has(b)){
          const ai=map[a],bi=map[b];
          if((ai>=0&&requiredSC.has(ai)) !== (bi>=0&&requiredSC.has(bi)))continue;
        }
        [map[a],map[b]]=[map[b],map[a]];
        const trial=scoreMap(map,tiles,gear,goal,cols,rows,sc);
        const progress=i/loops;
        const temperature=7.5*Math.pow(.008,progress);
        if(trial.score>now.score || rnd()<Math.exp((trial.score-now.score)/temperature)) {
          now=trial;
          if(now.score>top.score){top=now;topMap=map.slice();}
        } else [map[a],map[b]]=[map[b],map[a]];
      }
      if(!bestStats || top.score>bestStats.score){bestStats=top;bestMap=topMap;}
    }
    // Final cohesion pass: stochastic search can leave a secondary group split
    // despite an obvious nearby legal move. Try swaps that bring compatible
    // technologies together. Never evict the committed SC-priority selection.
    if(bestMap){
      const legalSwap=(a,b,map)=>{
        if(a===b || (map[a]===-1 && map[b]===-1))return false;
        if(scPositions.has(a)!==scPositions.has(b)){
          const ai=map[a],bi=map[b];
          if((ai>=0&&requiredSC.has(ai)) !== (bi>=0&&requiredSC.has(bi)))return false;
        }
        return true;
      };
      for(let pass=0;pass<26;pass++){
        let gain=0,swapA=-1,swapB=-1,nextStats=null;
        // Consider each technology tile moving beside a compatible member.
        for(const a of available){
          const tile=tiles[bestMap[a]];
          if(!tile || tile.noAdjacency)continue;
          for(const anchor of available){
            if(a===anchor || !areAdjacent(tile,tiles[bestMap[anchor]],gear))continue;
            for(const b of getNeighbors(anchor,cols,rows)){
              if(!legalSwap(a,b,bestMap) || blocked.has(b))continue;
              [bestMap[a],bestMap[b]]=[bestMap[b],bestMap[a]];
              const trial=scoreMap(bestMap,tiles,gear,goal,cols,rows,sc);
              [bestMap[a],bestMap[b]]=[bestMap[b],bestMap[a]];
              const delta=trial.score-bestStats.score;
              if(delta>gain+1e-7){gain=delta;swapA=a;swapB=b;nextStats=trial;}
            }
          }
        }
        if(swapA<0)break;
        [bestMap[swapA],bestMap[swapB]]=[bestMap[swapB],bestMap[swapA]];
        bestStats=nextStats;
      }
    }
    return {tiles,map:bestMap,stats:bestStats,skipped:assembled.skipped,requested:assembled.requested};
  }
  function summarize(result, gear, profile) {
    if(!result || !Array.isArray(result.map) || !Array.isArray(result.tiles))return null;
    return scoreMap(result.map,result.tiles,gear,gear.goals[profile.goal],profile.cols,profile.rows,profile.sc);
  }
  const api = { solve, summarize, assemble, areAdjacent, getNeighbors, index, scValue, superchargedPlan };
  if(typeof module !== 'undefined' && module.exports)module.exports=api;
  root.ATLAS_SOLVER=api;
})(typeof window!=='undefined'?window:globalThis);
