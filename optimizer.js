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
    const active = (profile.enabled || []).filter(id => gear.families[id]).sort((a,b) =>
      (goal.weights[b] || 1) - (goal.weights[a] || 1));
    const request = [];
    active.forEach(id => {
      const family = gear.families[id];
      if (family.core) request.push({ id: id + ':core', family: id, role: 'core', sequence: 0, label: family.core });
      else if (family.maxUpgrades > 0) request.push({ id: id + ':1', family: id, role: 'upgrade', sequence: 1, label: family.upgrade });
    });
    for (let sequence = 1; sequence <= Math.min(3, profile.depth || 3); sequence++) {
      active.forEach(id => {
        const family = gear.families[id];
        if (sequence > family.maxUpgrades || (!family.core && sequence === 1)) return;
        request.push({id: id + ':' + sequence, family: id, role: 'upgrade', sequence, label: family.upgrade});
      });
    }
    // Cores are given precedence, then high-impact module slots. Nothing is fabricated
    // to squeeze an excessive request into an undersized inventory.
    return { tiles: request.slice(0,capacity), skipped: request.slice(capacity), requested: request.length };
  }
  function scoreMap(map, tiles, gear, goal, cols, rows, supercharged) {
    let score = 0, connections = 0, usedSC = 0;
    const sc = new Set(supercharged);
    const groups = {};
    for (let p = 0; p < map.length; p++) {
      const t = tiles[map[p]];
      if (!t) continue;
      const w = goal.weights[t.family] || 1;
      const family = gear.families[t.family];
      (groups[t.family] ||= []).push(p);
      if (sc.has(p)) {
        const pref = family.sc === t.role;
        const qualityHint = t.role === 'upgrade' ? (t.sequence === 1 ? 1.15 : t.sequence === 2 ? 1.0 : .87) : 1;
        score += 6.2 * w * (pref ? 1.25 : .85) * qualityHint;
        usedSC++;
      }
      // Only count right and lower edge to avoid doubling each adjacency.
      const right = p % cols < cols - 1 ? tiles[map[p+1]] : null;
      const down = p + cols < map.length ? tiles[map[p+cols]] : null;
      [right,down].forEach(other => {
        if (other && other.family === t.family) {
          const coreBonus = other.role === 'core' || t.role === 'core' ? 1.12 : 1;
          score += 3.5 * w * coreBonus;
          connections++;
        }
      });
    }
    // Small compactness preference reduces fragmented same-family islands.
    Object.entries(groups).forEach(([id,positions]) => {
      if (positions.length < 2) return;
      const meanX = positions.reduce((s,p)=>s+(p%cols),0)/positions.length;
      const meanY = positions.reduce((s,p)=>s+Math.floor(p/cols),0)/positions.length;
      let spread = 0;
      positions.forEach(p => { spread += Math.abs(p%cols-meanX)+Math.abs(Math.floor(p/cols)-meanY); });
      score -= spread * .32 * (goal.weights[id] || 1);
    });
    return {score,connections,usedSC};
  }
  function solve({gear,profile}) {
    const {cols,rows} = profile;
    const size = cols*rows;
    const blocked = new Set(profile.blocked.filter(i => i>=0 && i<size));
    const available = Array.from({length:size},(_,i)=>i).filter(i=>!blocked.has(i));
    const sc = profile.sc.filter(i => i>=0 && i<size && !blocked.has(i));
    const goal = gear.goals[profile.goal];
    if (!goal) throw new Error('Unknown build focus.');
    const assembled = assemble(gear,profile,available.length);
    const tiles = assembled.tiles;
    if (tiles.length === 0) throw new Error('Enable at least one technology family before optimizing.');
    let bestMap = null, bestStats = null;
    const seed = stableSeed(JSON.stringify([profile.goal,profile.enabled,profile.depth,profile.cols,profile.rows,sc,profile.blocked]));
    const loops = Math.min(5600,Math.max(2200,available.length*90));
    for (let run=0;run<7;run++) {
      const rnd = randomGenerator(seed + run*10007);
      const map = Array(size).fill(-1);
      const shuffled = available.slice();
      for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
      for(let i=0;i<tiles.length;i++)map[shuffled[i]]=i;
      let now = scoreMap(map,tiles,gear,goal,cols,rows,sc);
      let top = now;
      let topMap = map.slice();
      for (let i=0;i<loops;i++) {
        const a=available[Math.floor(rnd()*available.length)];
        const b=available[Math.floor(rnd()*available.length)];
        if(a===b || (map[a]===-1 && map[b]===-1))continue;
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
    return {tiles,map:bestMap,stats:bestStats,skipped:assembled.skipped,requested:assembled.requested};
  }
  function summarize(result, gear, profile) {
    if(!result || !Array.isArray(result.map) || !Array.isArray(result.tiles))return null;
    return scoreMap(result.map,result.tiles,gear,gear.goals[profile.goal],profile.cols,profile.rows,profile.sc);
  }
  const api = { solve, summarize, assemble, getNeighbors, index };
  if(typeof module !== 'undefined' && module.exports)module.exports=api;
  root.ATLAS_SOLVER=api;
})(typeof window!=='undefined'?window:globalThis);
