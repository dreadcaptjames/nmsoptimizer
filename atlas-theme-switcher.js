/*
 * ATLAS MAX — Signal Themes
 * Non-invasive theme add-on for the vanilla HTML/CSS/JavaScript app.
 * Does not read, write, or mutate loadouts, supercharged slots, or technology data.
 */
(() => {
  'use strict';
  if (window.__atlasMaxThemeSwitcherLoaded) return;
  window.__atlasMaxThemeSwitcherLoaded = true;

  const STORAGE_KEY = 'atlas-max:interface-theme';
  const ROOT_ATTRIBUTE = 'data-atlas-theme';
  const FOOTER_ID = 'atlas-max-theme-switcher';
  const STYLE_ID = 'atlas-max-theme-styles';
  const THEMES = Object.freeze([
    { id: 'atlas', name: 'Atlas', caption: 'CRIMSON SIGNAL', color: '#ff5871', symbol: 'diamond' },
    { id: 'void-mother', name: 'Void Mother', caption: 'VIOLET ECHO', color: '#bb92ff', symbol: 'orbit' },
    { id: 'vykeen', name: 'Vy’keen', caption: 'WARRIOR GREEN', color: '#4de5ae', symbol: 'cross' },
    { id: 'gek', name: 'Gek', caption: 'AMBER COMMERCE', color: '#ffad54', symbol: 'spark' },
    { id: 'korvax', name: 'Korvax', caption: 'COBALT CONVERGENCE', color: '#66baff', symbol: 'circuit' }
  ]);
  const IDs = new Set(THEMES.map(t => t.id));
  const ICONS = Object.freeze({
    diamond: '<path d="M12 2 22 12 12 22 2 12 12 2Z"/><path d="m12 5 6 7-6 7-6-7 6-7Z"/>',
    orbit: '<circle cx="12" cy="12" r="3"/><path d="M3.5 10C6 2 17 1 20 6c3 5-3 14-9 15M2.5 15.5c6 4 16 3 19-4"/>',
    cross: '<path d="m4 4 16 16M20 4 4 20M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4"/>',
    spark: '<path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7L12 2Z"/>',
    circuit: '<circle cx="12" cy="12" r="3"/><path d="M12 2v7m0 6v7M2 12h7m6 0h7"/><circle cx="12" cy="2" r="1"/><circle cx="22" cy="12" r="1"/>'
  });

  const STYLES = String.raw`
    /* Signal palettes: these reassign chrome colors, never supercharged/technology semantics. */
    html[data-atlas-theme="atlas"] {
      --at-theme-accent:#ff5871; --at-theme-bright:#ff899d; --at-theme-rgb:255,88,113;
      --at-theme-deep:#542033; --at-theme-panel:#19151d; --at-theme-bg:#0e1017;
      --at-theme-label:#ffdfe5;
    }
    html[data-atlas-theme="void-mother"] {
      --at-theme-accent:#bb92ff; --at-theme-bright:#d9c2ff; --at-theme-rgb:187,146,255;
      --at-theme-deep:#3e275f; --at-theme-panel:#181525; --at-theme-bg:#0d0d19;
      --at-theme-label:#efe4ff;
    }
    html[data-atlas-theme="vykeen"] {
      --at-theme-accent:#4de5ae; --at-theme-bright:#92fbd5; --at-theme-rgb:77,229,174;
      --at-theme-deep:#164b3d; --at-theme-panel:#111e1d; --at-theme-bg:#091513;
      --at-theme-label:#d3ffed;
    }
    html[data-atlas-theme="gek"] {
      --at-theme-accent:#ffad54; --at-theme-bright:#ffd08d; --at-theme-rgb:255,173,84;
      --at-theme-deep:#664024; --at-theme-panel:#241b17; --at-theme-bg:#17100e;
      --at-theme-label:#fff0d9;
    }
    html[data-atlas-theme="korvax"] {
      --at-theme-accent:#66baff; --at-theme-bright:#a4ddff; --at-theme-rgb:102,186,255;
      --at-theme-deep:#204b73; --at-theme-panel:#111c2a; --at-theme-bg:#09121e;
      --at-theme-label:#def3ff;
    }
    html[data-atlas-theme] {
      --accent:var(--at-theme-accent);
      --accent-2:var(--at-theme-bright);
      --accent-color:var(--at-theme-accent);
      --accent-rgb:var(--at-theme-rgb);
      --primary:var(--at-theme-accent);
      --primary-color:var(--at-theme-accent);
      --primary-rgb:var(--at-theme-rgb);
      --color-primary:var(--at-theme-accent);
      --color-accent:var(--at-theme-accent);
      --brand-accent:var(--at-theme-accent);
      --hud-accent:var(--at-theme-accent);
      --border-accent:var(--at-theme-accent);
      --glow-accent:rgba(var(--at-theme-rgb), .30);
      accent-color:var(--at-theme-accent);
    }
    html[data-atlas-theme] body {
      background-color:var(--at-theme-bg);
      transition:background-color .24s ease;
    }
    /* Keep known SC slot markers purple even when a site's CSS derives them from its accent. */
    html[data-atlas-theme] :is(.slot,.tech-slot,.technology-slot,.grid-slot,.tile).sc,
    html[data-atlas-theme] :is(.slot,.tech-slot,.technology-slot,.grid-slot,.tile).supercharged,
    html[data-atlas-theme] :is(.slot,.tech-slot,.technology-slot,.grid-slot,.tile)[data-supercharged="true"] {
      border-color:#b995ff !important;
      box-shadow:inset 0 0 14px #b995ff20,0 0 8px #a98bff30;
    }
    /* Active navigation and global actions take the chosen color; gameplay slot semantics do not. */
    html[data-atlas-theme] :is(.equipment-nav,.equipment-tabs,.equip-tabs,.nav-tabs,.category-nav,.category-tabs,.equipment-bar)
    :is(.active,.selected,[aria-selected="true"],[data-active="true"]) {
      border-color:var(--at-theme-accent) !important;
      color:var(--at-theme-label) !important;
      box-shadow:inset 0 -2px 0 var(--at-theme-accent),0 0 14px rgba(var(--at-theme-rgb),.10);
    }
    html[data-atlas-theme] :is(.btn-primary,.button-primary,.primary-button,button.primary,button[data-action="optimize"]) {
      border-color:var(--at-theme-accent);
      background-color:var(--at-theme-deep);
      color:var(--at-theme-label);
    }
    html[data-atlas-theme] :is(.app-header,.site-header,.command-header,.topbar) {
      border-color:rgba(var(--at-theme-rgb),.23);
    }
    /* Gentle chrome tint without restyling tiles, slot states, or module class badges. */
    html[data-atlas-theme] body::after {
      content:""; position:fixed; inset:0; pointer-events:none; z-index:2147483000;
      background:radial-gradient(ellipse 82% 62% at 93% -22%,rgba(var(--at-theme-rgb),.08),transparent 75%);
    }
    /* ATLAS MAX's existing command-deck controls: theme the chrome, not the gear. */
    html[data-atlas-theme] {
      --bg:var(--at-theme-bg);
      --surface:var(--at-theme-panel);
      --accent-glow:rgba(var(--at-theme-rgb),.18);
    }
    html[data-atlas-theme] .backdrop {
      background:radial-gradient(ellipse 45% 29% at 42% -2%,rgba(var(--at-theme-rgb),.19),transparent 95%),
        radial-gradient(ellipse 38% 45% at 100% 22%,rgba(var(--at-theme-rgb),.08),transparent 83%),
        linear-gradient(145deg,var(--at-theme-bg) 0%,#080f1a 60%,var(--at-theme-panel) 100%);
    }
    html[data-atlas-theme] .gear-btn.active {
      border-color:var(--at-theme-accent);
      background:linear-gradient(110deg,rgba(var(--at-theme-rgb),.22),rgba(17,42,54,.75));
      box-shadow:0 0 25px rgba(var(--at-theme-rgb),.11),inset 0 -2px var(--at-theme-accent);
    }
    html[data-atlas-theme] .gear-btn.active .gear-arrow,
    html[data-atlas-theme] .gear-btn.active .gear-text small {color:var(--at-theme-bright)}
    html[data-atlas-theme] .brand-icon {
      border-color:var(--at-theme-accent);
      background:linear-gradient(145deg,var(--at-theme-deep),#111f2d 75%);
      box-shadow:0 0 35px rgba(var(--at-theme-rgb),.13),inset 0 0 19px rgba(var(--at-theme-rgb),.10);
    }
    html[data-atlas-theme] .loadout-badge {
      background:var(--at-theme-deep);border-color:var(--at-theme-accent);
      box-shadow:inset 0 0 25px rgba(var(--at-theme-rgb),.13);color:var(--at-theme-bright);
    }
    html[data-atlas-theme] .mode.active:not(.cv-tech-toolbar .mode),
    html[data-atlas-theme] .segmented button.current {
      background:linear-gradient(100deg,var(--at-theme-deep),rgba(var(--at-theme-rgb),.35));
      border-color:var(--at-theme-accent);color:var(--at-theme-label);
      box-shadow:0 1px 9px rgba(var(--at-theme-rgb),.13);
    }
    html[data-atlas-theme] .btn.primary {
      border-color:var(--at-theme-accent);
      background:linear-gradient(120deg,var(--at-theme-accent),var(--at-theme-bright));
      color:#0c1420;box-shadow:0 4px 22px rgba(var(--at-theme-rgb),.21);
    }
    html[data-atlas-theme] .btn.primary:hover:not(:disabled) {
      background:linear-gradient(120deg,var(--at-theme-bright),var(--at-theme-label));
      border-color:var(--at-theme-bright);
    }
    html[data-atlas-theme] .version {
      border-color:rgba(var(--at-theme-rgb),.46);
      background:rgba(var(--at-theme-rgb),.10);color:var(--at-theme-label);
    }
    html[data-atlas-theme] .grid-utility span:first-child,
    html[data-atlas-theme] .library-heading h3 span {color:var(--at-theme-bright)}
    /* Never override .cell.sc, .cell.tile, adjacency lines, or equipment-class colors. */
    #${FOOTER_ID}, #${FOOTER_ID} * {box-sizing:border-box}
    #${FOOTER_ID} {
      --at-footer-border:rgba(var(--at-theme-rgb),.24);
      width:min(1480px,calc(100% - 32px)); margin:44px auto 24px;
      color:#f4f6fc; font-family:inherit,system-ui,sans-serif;
      background:
        linear-gradient(130deg,rgba(var(--at-theme-rgb),.085),transparent 39%),
        linear-gradient(160deg,rgba(22,29,43,.97),var(--at-theme-panel));
      border:1px solid var(--at-footer-border); border-radius:16px;
      box-shadow:0 16px 54px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.045);
      padding:clamp(17px,3vw,30px); position:relative; isolation:isolate;
    }
    #${FOOTER_ID}::before {
      content:""; position:absolute; left:24px; right:24px; top:-1px; height:2px;
      background:linear-gradient(90deg,transparent,var(--at-theme-accent),transparent);
      opacity:.8; pointer-events:none;
    }
    #${FOOTER_ID} .at-head {display:flex;justify-content:space-between;align-items:flex-start;gap:15px;margin-bottom:21px}
    #${FOOTER_ID} .at-eyebrow {letter-spacing:.2em;font:600 10px/1.4 ui-monospace,monospace;color:var(--at-theme-bright);margin:0 0 7px}
    #${FOOTER_ID} .at-heading {font-size:clamp(18px,2vw,24px);font-weight:800;letter-spacing:-.025em;margin:0;color:#f4f6fc}
    #${FOOTER_ID} .at-intro {font-size:12px;line-height:1.55;color:#aab4c5;margin:7px 0 0;max-width:660px}
    #${FOOTER_ID} .at-live {font:700 10px/1.4 ui-monospace,monospace;letter-spacing:.1em;color:var(--at-theme-label);
      border:1px solid var(--at-footer-border);padding:6px 10px;border-radius:99px;white-space:nowrap}
    #${FOOTER_ID} .at-live::before {content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--at-theme-accent);box-shadow:0 0 9px var(--at-theme-accent);margin-right:7px;vertical-align:1px}
    #${FOOTER_ID} .at-options {display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
    #${FOOTER_ID} button.at-option {
      position:relative; appearance:none;text-align:left;min-width:0;cursor:pointer;overflow:hidden;
      display:flex;align-items:center;gap:11px;padding:15px 11px;border-radius:10px;
      background:rgba(6,10,19,.49);border:1px solid rgba(176,190,213,.13);
      font:inherit;color:#ebedf5;box-shadow:none;transition:background .16s,border-color .16s,transform .16s,box-shadow .16s;
    }
    #${FOOTER_ID} button.at-option:hover {transform:translateY(-2px);background:rgba(255,255,255,.065);border-color:var(--at-swatch)}
    #${FOOTER_ID} button.at-option:focus-visible {outline:2px solid #fff;outline-offset:3px}
    #${FOOTER_ID} button.at-option[aria-pressed="true"] {border-color:var(--at-swatch);background:color-mix(in srgb,var(--at-swatch) 13%,#101724);
      box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--at-swatch) 28%,transparent),0 0 22px color-mix(in srgb,var(--at-swatch) 13%,transparent)}
    #${FOOTER_ID} .at-symbol {display:flex;align-items:center;justify-content:center;flex:0 0 34px;height:34px;
      border:1px solid color-mix(in srgb,var(--at-swatch) 44%,transparent);border-radius:9px;
      background:color-mix(in srgb,var(--at-swatch) 12%,transparent);color:var(--at-swatch)}
    #${FOOTER_ID} .at-symbol svg {height:18px;width:18px;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;fill:none}
    #${FOOTER_ID} .at-copy {min-width:0;flex:1}
    #${FOOTER_ID} .at-name {display:block;font-size:13px;font-weight:750;line-height:1.45;white-space:nowrap}
    #${FOOTER_ID} .at-caption {display:block;font-size:9px;letter-spacing:.07em;color:#9da9bc;margin-top:3px;white-space:nowrap}
    #${FOOTER_ID} .at-tick {width:7px;height:7px;border-radius:50%;background:var(--at-swatch);box-shadow:0 0 10px var(--at-swatch);position:absolute;top:7px;right:7px;opacity:0}
    #${FOOTER_ID} .at-option[aria-pressed="true"] .at-tick {opacity:1}
    #${FOOTER_ID} .at-bottom {display:flex;gap:15px;justify-content:space-between;align-items:center;margin-top:17px;
      padding-top:13px;border-top:1px solid rgba(178,192,212,.12);font-size:11px;color:#a5afc0;line-height:1.5}
    #${FOOTER_ID} .at-current {color:var(--at-theme-bright);font-weight:700}
    #${FOOTER_ID} .at-separator {opacity:.45;margin:0 5px}

    /* Companion resource sits below the theme selection, at the very bottom. */
    #${FOOTER_ID} .at-companion {
      margin-top:19px;padding-top:18px;border-top:1px solid rgba(178,192,212,.16);
      display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;
    }
    #${FOOTER_ID} .at-companion-label {
      color:#aab4c5;font-size:10px;font-weight:700;letter-spacing:.12em;
    }
    #${FOOTER_ID} .at-companion-link {
      color:var(--at-theme-label);background:rgba(var(--at-theme-rgb),.12);
      border:1px solid rgba(var(--at-theme-rgb),.4);border-radius:9px;
      display:inline-flex;align-items:center;gap:8px;padding:11px 15px;
      font-size:12px;font-weight:750;line-height:1.4;text-decoration:none;
      transition:background .15s,border-color .15s;
    }
    #${FOOTER_ID} .at-companion-link:hover {
      background:rgba(var(--at-theme-rgb),.22);border-color:var(--at-theme-accent);
    }
    #${FOOTER_ID} .at-companion-link:focus-visible {
      outline:2px solid var(--at-theme-bright);outline-offset:3px;
    }
    @media(max-width:1000px){#${FOOTER_ID} .at-options{grid-template-columns:repeat(3,minmax(0,1fr))}}
    @media(max-width:620px){
      #${FOOTER_ID}{width:calc(100% - 18px);margin:24px auto 12px;padding:16px}
      #${FOOTER_ID} .at-head{flex-direction:column;gap:10px}
      #${FOOTER_ID} .at-options{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
      #${FOOTER_ID} button.at-option{padding:12px 9px;gap:8px}
      #${FOOTER_ID} .at-caption{font-size:8px}
      #${FOOTER_ID} .at-bottom{display:block}
      #${FOOTER_ID} .at-bottom>span{display:block;margin-bottom:5px}
    }
    @media(prefers-reduced-motion:reduce){#${FOOTER_ID} *{transition:none!important}}
  `;

  function savedTheme() {
    try { const t = localStorage.getItem(STORAGE_KEY); return IDs.has(t) ? t : 'atlas'; }
    catch { return 'atlas'; }
  }

  function setTheme(id) {
    if (!IDs.has(id)) return;
    document.documentElement.setAttribute(ROOT_ATTRIBUTE, id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* private browsing: theme works in memory */ }
    updateSelection();
    // Other code may optionally respond without any dependency on this add-on.
    window.dispatchEvent(new CustomEvent('atlasmax:themechange', { detail: { theme: id } }));
  }

  function updateSelection() {
    const root = document.getElementById(FOOTER_ID);
    if (!root) return;
    const active = document.documentElement.getAttribute(ROOT_ATTRIBUTE) || 'atlas';
    root.querySelectorAll('[data-theme-option]').forEach(el => {
      el.setAttribute('aria-pressed', String(el.getAttribute('data-theme-option') === active));
    });
    const current = root.querySelector('[data-theme-current]');
    const theme = THEMES.find(t => t.id === active) || THEMES[0];
    if (current) current.textContent = theme.name;
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style'); el.id = STYLE_ID; el.textContent = STYLES;
    (document.head || document.documentElement).appendChild(el);
  }

  function makeFooter() {
    const footer = document.createElement('footer');
    footer.id = FOOTER_ID; footer.setAttribute('aria-label', 'ATLAS MAX interface themes');
    const header = document.createElement('div'); header.className = 'at-head';
    header.innerHTML = `<div><p class="at-eyebrow">INTERFACE / PERSONALIZATION</p><h2 class="at-heading">Choose your signal</h2><p class="at-intro">Five distinct visual identities. Your technology layout, adjacency rules and supercharged positions stay exactly as they are.</p></div><span class="at-live">SIGNAL ACTIVE</span>`;
    footer.appendChild(header);
    const group = document.createElement('div'); group.className = 'at-options';
    group.setAttribute('role', 'group'); group.setAttribute('aria-label', 'Choose interface theme');
    for (const theme of THEMES) {
      const button = document.createElement('button'); button.type = 'button';
      button.className = 'at-option';button.setAttribute('data-theme-option', theme.id);
      button.setAttribute('aria-label', `${theme.name} theme`); button.setAttribute('aria-pressed', 'false');
      button.style.setProperty('--at-swatch', theme.color);
      button.innerHTML = `<span class="at-symbol" aria-hidden="true"><svg viewBox="0 0 24 24">${ICONS[theme.symbol]}</svg></span><span class="at-copy"><span class="at-name">${theme.name}</span><span class="at-caption">${theme.caption}</span></span><span class="at-tick" aria-hidden="true"></span>`;
      button.addEventListener('click', () => setTheme(theme.id));
      group.appendChild(button);
    }
    footer.appendChild(group);
    const bottom = document.createElement('div');bottom.className = 'at-bottom';
    bottom.innerHTML = '<span>ACTIVE PROFILE <span class="at-separator">/</span> <span class="at-current" data-theme-current>Atlas</span></span><span>Interface theme only · Technology class colors and purple SC markers are unchanged</span>';
    footer.appendChild(bottom);
    const companion = document.createElement('nav');
    companion.className = 'at-companion';
    companion.setAttribute('aria-label', 'Companion resource');
    companion.innerHTML = '<span class="at-companion-label">COMPANION RESOURCE</span><a class="at-companion-link" href="https://dreadcaptjames.github.io/nmscraftingrefining/" target="_blank" rel="noopener noreferrer" aria-label="Open NMS Crafting and Refining Guide in a new tab">NMS Crafting &amp; Refining Guide <span aria-hidden="true">↗</span></a>';
    footer.appendChild(companion);
    return footer;
  }

  function mount() {
    if (!document.body) return;
    installStyles();
    if (!document.getElementById(FOOTER_ID)) document.body.appendChild(makeFooter());
    updateSelection();
  }

  // Apply immediately to avoid flashing the default accent while the document loads.
  document.documentElement.setAttribute(ROOT_ATTRIBUTE, savedTheme());
  installStyles();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();

  // The core app can re-render its root node freely. Recover the selector if a rerender removes it.
  function observe() {
    if (!document.body || !window.MutationObserver) return;
    const observer = new MutationObserver(() => {
      if (!document.getElementById(FOOTER_ID)) mount();
    });
    observer.observe(document.body, { childList: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observe, { once: true });
  else observe();

  window.AtlasMaxThemes = Object.freeze({
    set: setTheme,
    get: () => document.documentElement.getAttribute(ROOT_ATTRIBUTE),
    names: THEMES.map(t => ({ id: t.id, name: t.name }))
  });
})();
