/* ATLAS MAX printable build report. Self-contained PDF 1.4 writer: no CDN, tracking, or server. */
(function(root){
'use strict';
const W=612,H=792,M=34,BG=[.052,.077,.111],PANEL=[.092,.133,.188],WHITE=[.93,.965,.99],MUTED=[.57,.67,.76],BORDER=[.21,.29,.36],PURPLE=[.79,.64,.99];
const latin=s=>String(s??'').replace(/[\u2018\u2019\u02bc]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[\u2013\u2014\u2212]/g,'-').replace(/[\u2022\u00b7]/g,' / ').replace(/[\u2192\u21d2]/g,'->').replace(/[\u2713\u2714]/g,'OK').replace(/[\u00d7]/g,'x').replace(/[\u2026]/g,'...').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7e]/g,'?');
const pdfString=s=>`(${latin(s).replace(/[\\()]/g,'\\$&')})`;
const c=n=>(Math.max(0,Math.min(1,Number(n)||0))).toFixed(3);
const rgb=a=>`${c(a[0])} ${c(a[1])} ${c(a[2])}`;
const hex=s=>{const v=String(s||'').trim().replace(/^#/,'');if(!/^[a-f0-9]{6}$/i.test(v))return [.98,.35,.44];return [0,2,4].map(i=>parseInt(v.slice(i,i+2),16)/255);};
const hsl=s=>{const found=/hsla?\(\s*([\d.]+)(?:deg)?[ ,]+([\d.]+)%[ ,]+([\d.]+)%/i.exec(String(s));if(!found)return hex(s);let h=+found[1]/360,sl=+found[2]/100,l=+found[3]/100;const f=n=>{const k=(n+h*12)%12,a=sl*Math.min(l,1-l);return l-a*Math.max(-1,Math.min(k-3,9-k,1));};return [f(0),f(8),f(4)];};
const shorten=(s,n)=>{s=latin(s);return s.length>n?s.slice(0,Math.max(1,n-3))+'...':s;};
const blend=(a,b,ratio)=>a.map((x,i)=>x*(1-ratio)+b[i]*ratio);
const loc=(p,cols)=>`R${Math.floor(p/cols)+1} C${p%cols+1}`;
const role=t=>t.role==='core'?'CORE':t.role==='upgrade'?`U${t.sequence}`:t.role==='crafted'?'CRAFT':t.role==='construction'?'BUILT':'TECH';
const familyName=(gear,id)=>gear.families[id]?.name||id;
const nameFile=s=>latin(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,52)||'build';
function makeReport(opts){
 const {key,gear,profile,techGear,stats,corvette,parts,release,tones,accent}=opts;
 const tech=key==='corvette'?profile.tech:profile;
 const catalog=key==='corvette'?techGear:gear;
 if(!tech||!catalog)throw Error('Missing technology data for PDF export.');
 const accentRGB=hex(accent||'#ff5871');
 const layout=tech.layout&&Array.isArray(tech.layout.map)&&Array.isArray(tech.layout.tiles)?tech.layout:null;
 const cols=tech.cols,rows=tech.rows,cellTotal=cols*rows;
 const locked=new Set(tech.blocked||[]),sc=new Set(tech.sc||[]);
 const label=key==='corvette'?(profile.name||'My Corvette'):(profile.name||gear.name);
 const goal=key==='corvette'?catalog.goals[tech.goal]?.label:gear.goals[tech.goal]?.label;
 const chosen=Object.entries((key==='corvette'?profile.counts:null)||{}).filter(([,qty])=>qty>0);
 const madeAt=new Date();const date=madeAt.toISOString().slice(0,10);
 const familyHue=id=>hsl(tones?.[id]||catalog.families[id]?.color||'#75cddb');
 const pages=[];
 const page=(subtitle)=>{const p={subtitle,commands:[]};pages.push(p);return p;};
 let p;
 const rect=(x,y,w,h,fill,stroke=null,sw=1)=>{if(fill)p.commands.push(`${rgb(fill)} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);if(stroke)p.commands.push(`${rgb(stroke)} RG ${sw} w ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`);};
 const line=(x,y,x2,y2,color=BORDER,thickness=.8)=>p.commands.push(`${rgb(color)} RG ${thickness} w ${x.toFixed(2)} ${y.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
 const txt=(s,x,y,size=10,color=WHITE,bold=false)=>p.commands.push(`BT ${rgb(color)} rg /${bold?'F2':'F1'} ${size.toFixed(1)} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm ${pdfString(s)} Tj ET`);
 const header=(subtitle)=>{p=page(subtitle);rect(0,0,W,H,BG);rect(0,H-8,W,8,accentRGB);rect(M,H-80,W-2*M,1,BORDER);rect(M,H-53,25,25,PANEL,accentRGB,1.2);
 // The nested ATLAS MAX triangle, drawn as vectors to stay crisp at any PDF zoom.
 const tri=(x1,y1,x2,y2,x3,y3,width)=>p.commands.push(`${rgb(accentRGB)} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l ${x3} ${y3} l h S`);
 tri(M+12.5,H-33,M+4.7,H-48,M+20.3,H-48,1.7);
 tri(M+12.5,H-38,M+8.3,H-46,M+16.7,H-46,1.25);txt('ATLAS MAX',M+35,H-40,15,WHITE,true);txt('NO MAN\'S SKY / LOADOUT INTELLIGENCE',M+35,H-55,8,MUTED);txt(subtitle.toUpperCase(),W-M-220,H-47,8,accentRGB,true);};
 const footer=()=>{const pageNumber=pages.indexOf(p)+1;line(M,47,W-M,47);txt('FAN-MADE REFERENCE  /  VERIFY ALL STATS IN-GAME',M,33,7.2,MUTED);txt('ATLAS MAX',W-M-115,33,7.2,MUTED);};
 const lines=(str,x,y,maxWidth,size=9,color=MUTED,lineH=13,maxLines=10)=>{let result=[];for(const para of String(str||'').split(/\n/)){let current='';for(const word of latin(para).split(/\s+/)){if(!word)continue;if((current+' '+word).length*size*.50>maxWidth&&current){result.push(current);current=word;}else current+=(current?' ':'')+word;}result.push(current);}result=result.slice(0,maxLines);result.forEach((line,i)=>txt(line,x,y-i*lineH,size,color));return y-result.length*lineH;};
 const statBox=(x,y,w,title,value)=>{rect(x,y,w,51,PANEL,BORDER);rect(x,y+49,w,2,accentRGB);txt(title.toUpperCase(),x+10,y+33,7.6,MUTED,true);txt(String(value),x+10,y+11,15,WHITE,true);};
 const summaryPage=()=>{
   header('BUILD REPORT / '+date);
   txt(shorten(label,42),M,675,23,WHITE,true);
   txt(`${gear.name}  /  ${profile.cls}-CLASS  /  ${shorten(goal||'Custom focus',43)}`,M,655,10,accentRGB,true);
   if(key==='corvette')txt('CONSTRUCTION FOCUS: '+shorten(gear.goals[profile.goal]?.label||profile.goal,52),M,637,9,MUTED);
   else txt('UPGRADE TARGET: '+tech.target+'-class  /  '+(tech.vehicle||'Default equipment'),M,637,9,MUTED);
   const boxW=(W-2*M-27)/4;
   statBox(M,568,boxW,'GRID',`${cols} x ${rows}`);
   statBox(M+boxW+9,568,boxW,'PLACED',`${layout?layout.map.filter(i=>i>=0).length:0}/${cellTotal-locked.size}`);
   statBox(M+(boxW+9)*2,568,boxW,'SUPERCHARGED',`${sc.size} marked`);
   statBox(M+(boxW+9)*3,568,boxW,'ADJACENCY',stats?`${stats.connections} links`:'Not optimized');
   txt('TECHNOLOGY MATRIX',M,542,10,WHITE,true);
   txt('PURPLE = PLAYER-MARKED SC  /  COLOR = FAMILY',W-M-262,542,7.2,MUTED);
   const gap=4,rowH=46,gw=W-2*M,cw=(gw-gap*(cols-1))/cols,top=528;
   for(let r=0;r<rows;r++)for(let j=0;j<cols;j++){
     const idx=r*cols+j,x=M+j*(cw+gap),y=top-(r+1)*(rowH+gap)+gap;
     const scSlot=sc.has(idx),isLocked=locked.has(idx),tileId=layout?.map[idx]??-1,tile=tileId>=0?layout.tiles[tileId]:null;
     const tone=tile?familyHue(tile.family):BORDER;
     rect(x,y,cw,rowH,isLocked?[.11,.13,.17]:tile?blend(PANEL,tone,.16):PANEL,scSlot?PURPLE:tile?blend(tone,BORDER,.28):BORDER,scSlot?1.7:.7);
     if(tile){rect(x,y+rowH-3,cw,3,tone);txt(shorten(catalog.families[tile.family]?.short||tile.family,7),x+4,y+rowH-15,9.1,tone,true);
       txt(role(tile),x+4,y+16,7.4,WHITE,true);txt(shorten(tile.label,Math.max(6,Math.floor(cw/3.5))),x+4,y+6,6.1,MUTED);}
     else if(isLocked){txt('LOCKED',x+4,y+22,7,MUTED,true);}else{txt(scSlot?'SC':'-',x+4,y+23,8.5,scSlot?PURPLE:MUTED,true);}
     if(scSlot){rect(x+cw-13,y+rowH-15,11,11,PURPLE);txt('S',x+cw-10.5,y+rowH-12,7,BG,true);}
     txt(String(idx+1),x+cw-11,y+4,5.3,MUTED);
   }
   const bottom=top-rows*(rowH+gap)+gap;
   const summaryBottom=Math.min(bottom-28,185);
   txt('SUPERCHARGED POSITIONS',M,summaryBottom,9,accentRGB,true);
   const scList=[...sc].sort((a,b)=>a-b);
   const scNames=scList.map(pos=>{const idx=layout?.map[pos]??-1;const t=idx>=0?layout.tiles[idx]:null;return loc(pos,cols)+(t?' '+shorten(t.label,19):' [empty]');});
   if(scNames.length){let sx=M,sy=summaryBottom-16;for(const s of scNames){txt(s,sx,sy,8,WHITE);sx+=180;if(sx>W-M-130){sx=M;sy-=14;}}}else txt('None marked. Match your actual inventory before optimizing.',M,summaryBottom-16,8,MUTED);
   const noteY=Math.min(summaryBottom-51,bottom-84);
   if(!layout)txt('No layout generated yet. Select Optimize in ATLAS MAX, then export again.',M,Math.max(91,noteY),9,accentRGB,true);
   else if(tech.dirty)txt('NOTE: Layout is marked out of date. Re-optimize before copying this arrangement.',M,Math.max(91,noteY),8.4,accentRGB,true);
   txt('PDF is a read-only reference. Use Backup JSON in ATLAS MAX to keep an editable build.',M,70,8,MUTED);
   footer();
 };
 const groupTiles=()=>{
   header('TECHNOLOGY INVENTORY');
   txt('TECHNOLOGY INDEX',M,675,21,WHITE,true);
   txt('Exact installed module names and row/column coordinates.',M,655,9,MUTED);
   const list=[];
   if(layout){for(let i=0;i<cellTotal;i++){const ix=layout.map[i],tile=ix>=0?layout.tiles[ix]:null;if(tile)list.push({...tile,position:i});}}
   const groups=new Map();for(const t of list){if(!groups.has(t.family))groups.set(t.family,[]);groups.get(t.family).push(t);}
   const missing=layout?.skipped||[];
   let col=0,y=627;
   const nextCol=()=>{if(col===0){col=1;y=627;}else{footer();header('TECHNOLOGY INVENTORY / CONTINUED');txt('TECHNOLOGY INDEX  /  CONTINUED',M,675,19,WHITE,true);col=0;y=641;}};
   const ensure=h=>{if(y-h<81)nextCol();};
   const colW=258,positions=[M,M+colW+24];
   if(!list.length){txt('No placed technology yet.',M,611,11,MUTED);}
   for(const [fid,tiles] of groups){
     // Keep an entire family together when it fits in a single column.
     if(tiles.length*13+31<535)ensure(tiles.length*13+31);
     else ensure(35);
     const x=positions[col],hue=familyHue(fid);
     rect(x,y-9,5,17,hue);txt(shorten(familyName(catalog,fid),36),x+12,y-4,10,WHITE,true);
     y-=19;
     for(const t of tiles){const oldCol=col;ensure(15);if(col!==oldCol){rect(positions[col],y-8,5,16,hue);txt(shorten(familyName(catalog,fid)+' / CONTINUED',32),positions[col]+12,y-4,9,WHITE,true);y-=21;}const xRow=positions[col];txt(loc(t.position,cols),xRow+8,y,7.2,hue,true);txt(shorten(role(t)+' / '+t.label,37),xRow+68,y,7.2,WHITE);y-=13;}
     y-=12;
   }
   if(missing.length){ensure(44);txt('COULD NOT FIT',positions[col],y,10,accentRGB,true);y-=18;for(const t of missing){ensure(14);txt(shorten(t.label,43),positions[col]+6,y,7.2,MUTED);y-=13;}}
   if(!layout){txt('Current selected technology families:',M,578,9,accentRGB,true);let ty=558;for(const f of (tech.enabled||[])){txt(shorten(familyName(catalog,f),52),M,ty,8,MUTED);ty-=14;if(ty<87)break;}}
   footer();
 };
 const manifestPage=()=>{
   header('CORVETTE CONSTRUCTION MANIFEST');
   txt('CORVETTE MODULE MANIFEST',M,675,20,WHITE,true);
   txt(shorten(label,65)+'  /  '+shorten(gear.goals[profile.goal]?.label||profile.goal,34),M,653,9,accentRGB,true);
   const valid=chosen.map(([id,qty])=>({part:(parts||[]).find(item=>item.id===id),id,qty})).filter(x=>x.part);
   valid.sort((a,b)=>a.part.section.localeCompare(b.part.section)||a.part.name.localeCompare(b.part.name));
   const groups=new Map();for(const v of valid){let k=v.part.section||'Other';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(v);}
   let y=626;
   const next=()=>{footer();header('CORVETTE MANIFEST / CONTINUED');txt('MODULE MANIFEST  /  CONTINUED',M,675,19,WHITE,true);y=644;};
   if(!valid.length)txt('No Corvette construction parts selected.',M,599,11,MUTED);
   for(const [section,items] of groups){if(y<114)next();rect(M,y-9,5,18,accentRGB);txt(shorten(section,75),M+12,y-4,11,WHITE,true);y-=23;
     for(const {part,qty,id} of items){if(y<90)next();const zone=profile.zones?.[id]||part.zone||'mid';txt(`x${qty}`,M+6,y,9,accentRGB,true);txt(shorten(part.name,64),M+48,y,9,WHITE);txt(zone.toUpperCase(),W-M-80,y,7.5,MUTED);y-=18;}y-=16;
   }
   if(y>120){line(M,y-10,W-M,y-10);lines('This is a planning manifest. Verify construction limits, actual stats, and snap connections inside No Man\'s Sky.',M,y-26,525,8,MUTED,12,3);}
   footer();
 };
 summaryPage();groupTiles();if(key==='corvette')manifestPage();
 for(let i=0;i<pages.length;i++){
   const pageCmd=pages[i].commands;
   // Reprint page counters as total-page footnotes. These are in the content stream.
   pageCmd.push(`BT ${rgb(MUTED)} rg /F2 7 Tf 1 0 0 1 ${W-M-45} 32 Tm ${pdfString(`${i+1} / ${pages.length}`)} Tj ET`);
 }
 const objs=['', '',`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`];
 const pageIds=[];
 for(const p of pages){const pid=objs.length+1,sid=pid+1;pageIds.push(pid);objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${sid} 0 R >>`);const str=p.commands.join('\n')+'\n';objs.push(`<< /Length ${str.length} >>\nstream\n${str}endstream`);}
 objs[0]='<< /Type /Catalog /Pages 2 0 R >>';objs[1]=`<< /Type /Pages /Count ${pages.length} /Kids [${pageIds.map(i=>i+' 0 R').join(' ')}] >>`;
 const chunks=['%PDF-1.4\n%ATLAS MAX Report\n'],offsets=[0];let bytePos=chunks[0].length;
 for(let i=0;i<objs.length;i++){offsets.push(bytePos);const obj=`${i+1} 0 obj\n${objs[i]}\nendobj\n`;chunks.push(obj);bytePos+=obj.length;}
 const start=bytePos;chunks.push(`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`);
 for(let i=1;i<offsets.length;i++)chunks.push(String(offsets[i]).padStart(10,'0')+' 00000 n \n');
 chunks.push(`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`);
 const encoded=new TextEncoder().encode(chunks.join(''));
 return {bytes:encoded,filename:`atlas-max-${nameFile(label)}-${date}.pdf`,pages:pages.length};
}
const api=Object.freeze({makeReport});
if(root)root.ATLAS_PDF_EXPORT=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:null);
