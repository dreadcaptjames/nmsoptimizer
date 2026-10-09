/* ATLAS MAX original, self-contained icon set.
   Every illustration uses editable inline SVG; no fonts, CDN or game artwork. */
(function(){
'use strict';
const shapes=Object.freeze({
  suit: '<path d="M8 3.5 5 6v6l-2 3v4h6v-4h6v4h6v-4l-2-3V6l-3-2.5"/><path d="M8 3.5h8v6l-2 2h-4l-2-2zM10 15h4M7 19v2m10-2v2"/>',
  multitool: '<path d="m3 8 12-3 5 3v5l-5 2-3-2-3 8H5l1-9-3-1z"/><path d="M15 5v8m-9-2 6-2m5-1h4M9 13l3 1"/>',
  ship: '<path d="M12 2 8.5 11 3 15l6 1 3 6 3-6 6-1-5.5-4z"/><path d="M12 2v12m-3 2h6M5 11l-3-3m17 3 3-3"/>',
  freighter: '<path d="m3 10 9-7 9 7-1 7-8 4-8-4z"/><path d="M3 10h18M8 6v11m8-11v11M7 17l5 4 5-4M10 11h4"/>',
  exocraft: '<path d="m4 14 2-6h12l3 6v4H3v-4z"/><path d="M8 8V5h8v3m-9 6h10m-11 4v2m12-2v2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  jetpack: '<path d="M7 3h10l2 5-2 8H7L5 8zM9 3v9m6-9v9M5 8H3v6h3m13-6h2v6h-3"/><path d="m9 17-1 4 4-2 4 2-1-4"/>',
  shield: '<path d="M12 2 20 6v6c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6z"/><path d="m8 12 3 3 5-6"/>',
  life: '<path d="M20.5 8.5c0 4.5-8.5 11-8.5 11S3.5 13 3.5 8.5a4.5 4.5 0 0 1 8.5-2 4.5 4.5 0 0 1 8.5 2z"/><path d="M4.5 12h4l2-3 3.5 6 2-3h3.5"/>',
  hazard: '<circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="9"/><path d="M12 10 9.5 4.5 12 3l2.5 1.5zM13.5 13l6.3.8-.5 2.9-6 .3zM10.5 13l-3.4 5.3-2.4-1.6 2.3-5.9z"/>',
  neutron: '<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)"/><path d="M12 2v2m0 16v2"/>',
  spitter: '<path d="M3 12h10m-8-4h8m-8 8h8M14 12l3-4m-3 4 3 4"/><path d="m19 6 1-2m-1 14 1 2M21 12h2"/>',
  scatter: '<path d="M3 12h8l4-5M11 12l5 0m-5 0 4 5"/><circle cx="19" cy="5" r="1"/><circle cx="21" cy="10" r="1"/><circle cx="19" cy="15" r="1"/><circle cx="16" cy="20" r="1"/>',
  mining: '<path d="m4 19 7-7m-2-3 4 4m-6-7a10 10 0 0 1 13 6c-5-3-9-3-13 0L4 9z"/><path d="m11 16 4 4"/>',
  scanner: '<path d="M4 18a10 10 0 0 1 16 0M7 18a6 6 0 0 1 10 0M10 18a2 2 0 0 1 4 0"/><path d="M12 18 19 5M4 21h16"/><circle cx="19" cy="5" r="2"/>',
  infra: '<path d="m5 5 14 14m0-14L5 19"/><path d="M4 4h5l11 11v5h-5L4 9zM20 4h-5L4 15v5h5L20 9z"/>',
  photon: '<circle cx="12" cy="12" r="4"/><path d="M12 1v5m0 12v5M1 12h5m12 0h5M4.2 4.2l3.6 3.6m8.4 8.4 3.6 3.6m0-15.6-3.6 3.6m-8.4 8.4-3.6 3.6"/>',
  positron: '<circle cx="12" cy="12" r="2"/><path d="M5 5a10 10 0 0 1 14 14M19 5A10 10 0 0 0 5 19M8 8a6 6 0 0 1 8 8M16 8a6 6 0 0 0-8 8"/>',
  engine: '<path d="M4 5h12l4 7-4 7H4l4-7z"/><path d="M9 8h6m-6 8h6M2 9v6m20-6v6"/><circle cx="12" cy="12" r="2"/>',
  hyperdrive: '<ellipse cx="12" cy="12" rx="9" ry="6" transform="rotate(-33 12 12)"/><path d="M12 5v14m-7-7h14M20 3v4m-2-2h4"/><circle cx="12" cy="12" r="2"/>',
  launch: '<path d="M12 2c4 3 6 8 6 13l-6 3-6-3C6 10 8 5 12 2z"/><circle cx="12" cy="10" r="2"/><path d="m9 19-2 3m8-3 2 3m-5-3v4M6 15l-3 2v2h3m12-4 3 2v2h-3"/>',
  warpFreighter: '<path d="m3 14 9-8 9 8-2 6H5zM12 6V3m-6 9h12M9 16h6"/><path d="M3 3v4M1 5h4m16-4v4m-2-2h4"/>',
  combat: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v5m0 12v5M1 12h5m12 0h5"/>',
  explore: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2"/>',
  trade: '<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="8" cy="7" r="4"/><circle cx="16" cy="17" r="4"/><path d="M8 5v4m8 6v4"/>',
  industry: '<path d="M3 21V9l6 4V9l6 4V4h5v17zM15 8h5M6 17h2m3 0h2m3 0h2"/>',
  fuel: '<path d="M12 2c-4 6-7 9-7 13a7 7 0 0 0 14 0c0-4-3-7-7-13z"/><path d="M9 16a3 3 0 0 0 3 3"/>',
  boost: '<path d="m4 5 7 7-7 7M12 5l7 7-7 7"/><path d="M2 12h4m6 0h4"/>',
  laser: '<path d="M3 12h7m4-3 4-4 4 4-4 4-4-4z"/><path d="m10 12 4-3m-4 3 4 3m-4 0 4 3"/><path d="m4 9-2-2m2 8-2 2"/>',
  cannon: '<path d="M3 14V9h11l4-3 3 3-3 3H9v6H5v-4z"/><path d="m20 14 2 2m-4 1 1 3M15 3l2-2"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  spark: '<path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z"/>',
  module: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6v6H9zM9 1v3m6-3v3M9 20v3m6-3v3M1 9h3m-3 6h3m16-6h3m-3 6h3"/>'
});
function render(name,className='tech-icon'){
  const safe=Object.prototype.hasOwnProperty.call(shapes,name)?name:'module';
  const cls=String(className).replace(/[^\w\s-]/g,'').trim();
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${shapes[safe]}</svg>`;
}
window.ATLAS_ICONS=Object.freeze({render,keys:Object.freeze(Object.keys(shapes))});
})();
