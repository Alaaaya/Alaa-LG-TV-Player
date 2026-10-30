(function(){
'use strict';
const D=window.APP_DATA,IM=window.APP_IMAGES;
const has=k=>k!==''&&k!=null&&IM[String(k)];
const src=k=>IM[String(k)]||'';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const hash=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
/* icons */
const P={home:'<path d="M3 11 12 4l9 7"/><path d="M5.5 9.5V20h13V9.5"/>',tv:'<rect x="3" y="6" width="18" height="13" rx="3"/><path d="m8.5 2.5 3.5 3.5 3.5-3.5"/>',film:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7.5 3v18M16.5 3v18M3 8.5h4.5M3 15.5h4.5M16.5 8.5H21M16.5 15.5H21"/>',
series:'<rect x="3" y="7" width="18" height="14" rx="3"/><path d="M7 3h10"/><path d="m10.5 11 4 3-4 3z"/>',heart:'<path d="M12 20s-7.5-4.6-9.3-9.4C1.6 7.6 3.6 4.5 7 4.5c2 0 3.3 1 5 3 1.7-2 3-3 5-3 3.4 0 5.4 3.1 4.3 6.1C19.5 15.4 12 20 12 20z"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M4.2 7.5l2.1 1.2M17.7 15.3l2.1 1.2M4.2 16.5l2.1-1.2M17.7 8.7l2.1-1.2"/><circle cx="12" cy="12" r="6.8"/>',
play:'<path d="M7 4.5v15l12.5-7.5z"/>',pause:'<rect x="6" y="4.5" width="4" height="15" rx="1.2"/><rect x="14" y="4.5" width="4" height="15" rx="1.2"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.1"/>',
plus:'<path d="M12 5v14M5 12h14"/>',check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',chevL:'<path d="m15 5-7 7 7 7"/>',chevR:'<path d="m9 5 7 7-7 7"/>',chevU:'<path d="m5 15 7-7 7 7"/>',chevD:'<path d="m5 9 7 7 7-7"/>',
list:'<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".6"/><circle cx="4.5" cy="12" r=".6"/><circle cx="4.5" cy="18" r=".6"/>',hd:'<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M6.5 9v6M6.5 12h3.5M10 9v6M13.5 9v6h2a3 3 0 0 0 0-6z"/>',
audio:'<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',cc:'<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M10 10.2a2.5 2.5 0 1 0 0 3.6M17 10.2a2.5 2.5 0 1 0 0 3.6"/>',
prev:'<path d="M18 6 9.5 12 18 18z"/><path d="M6 6v12"/>',next:'<path d="M6 6l8.5 6L6 18z"/><path d="M18 6v12"/>',back10:'<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3 4v4.5h4.5"/><path d="M10 10v5M13 10h2.2v5H13z" stroke-width="1.6"/>',fwd10:'<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M21 4v4.5h-4.5"/><path d="M10 10v5M13 10h2.2v5H13z" stroke-width="1.6"/>',
arrowL:'<path d="M19 12H5M11 6l-6 6 6 6"/>',x:'<path d="M6 6l12 12M18 6 6 18"/>',sync:'<path d="M20 11a8 8 0 0 0-14.3-4.3L4 8.5"/><path d="M4 4v4.5h4.5"/><path d="M4 13a8 8 0 0 0 14.3 4.3l1.7-1.8"/><path d="M20 20v-4.5h-4.5"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',palette:'<path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-1.8 0-1.4-1.3-1.7-1.3-3 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3z"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z"/>',
sliders:'<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',stack:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'};
const I=(n,c)=>`<svg viewBox="0 0 24 24"${c?` class="${c}"`:''}>${P[n]}</svg>`;
/* illustrated art */
const PAL=[['#e9c9a0','#7a2333','#1e1414'],['#cfe0d6','#1f5a4a','#0e1c18'],['#f0d9a8','#9a7038','#241a10'],['#c9d3e8','#22355e','#0c1222'],['#e8c3b8','#8a3d2e','#1f120e'],['#dccfe6','#4b3466','#140e1c'],['#efe2c8','#5b4a36','#17120c'],['#d6e2e8','#2f5566','#0c171c']];
function scene(seed){const p=PAL[seed%PAL.length],t=seed%4,id='g'+seed;
 const defs=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p[2]}"/><stop offset=".55" stop-color="${p[1]}"/><stop offset="1" stop-color="${p[0]}"/></linearGradient><radialGradient id="${id}s"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".35" stop-color="${p[0]}" stop-opacity=".8"/><stop offset="1" stop-color="${p[0]}" stop-opacity="0"/></radialGradient></defs>`;
 let body=`<rect width="200" height="300" fill="url(#${id})"/>`;const r=n=>((seed>>n)&31);
 if(t===0)body+=`<circle cx="${70+r(2)*2}" cy="150" r="70" fill="url(#${id}s)"/><path d="M0 210 L40 170 L80 200 L120 150 L170 195 L200 175 V300 H0Z" fill="${p[2]}" opacity=".85"/><path d="M0 240 L60 205 L110 235 L160 210 L200 230 V300 H0Z" fill="#000" opacity=".55"/>`;
 if(t===1){body+=`<circle cx="150" cy="80" r="40" fill="url(#${id}s)"/>`;for(let i=0;i<9;i++){const w=14+((seed>>i)&15),h=60+((seed>>(i+3))&63);body+=`<rect x="${i*23}" y="${300-h-30}" width="${w}" height="${h+30}" fill="#05030a" opacity=".82"/>`;for(let j=0;j<5;j++)if((seed>>(i+j))&1)body+=`<rect x="${i*23+4}" y="${300-h-20+j*12}" width="3" height="4" fill="${p[0]}" opacity=".8"/>`}}
 if(t===2)body+=`<circle cx="100" cy="120" r="55" fill="url(#${id}s)"/><path d="M0 200 Q50 185 100 200 T200 200 V300 H0Z" fill="${p[1]}" opacity=".7"/><path d="M0 225 Q50 210 100 225 T200 225 V300 H0Z" fill="${p[2]}" opacity=".8"/><path d="M0 255 Q50 240 100 255 T200 255 V300 H0Z" fill="#000" opacity=".6"/>`;
 if(t===3)body+=`<circle cx="100" cy="130" r="80" fill="none" stroke="${p[0]}" stroke-opacity=".5" stroke-width="2"/><circle cx="100" cy="130" r="56" fill="none" stroke="${p[0]}" stroke-opacity=".35" stroke-width="10"/><circle cx="100" cy="130" r="30" fill="url(#${id}s)"/><path d="M30 300 L100 175 L170 300Z" fill="#000" opacity=".5"/>`;
 return `<svg class="scene" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice">${defs}${body}<rect width="200" height="300" fill="url(#${id})" opacity=".12"/></svg>`;}
function cover(t,sub){const s=hash(t);return `<div class="cover">${scene(s)}<span class="cs">${esc(sub||'')}</span><span class="ct">${esc(clean(t))}</span></div>`;}
function coverBg(t){const p=PAL[hash(t)%PAL.length];return `radial-gradient(600px 400px at 60% 35%,${p[0]}88,transparent 60%),linear-gradient(160deg,${p[1]},${p[2]})`;}
function art(it,sub){return has(it.img)?`<img alt="" src="${src(it.img)}">`:cover(it.t,sub);}
function logoSvg(name){const s=hash(name),p=PAL[s%PAL.length];const w=(clean(name).replace(/^4K:?\s*/,'').match(/[A-Za-z0-9+]+/g)||['TV']);let word=w[0].toUpperCase();if(word.length<3&&w[1])word+=' '+w[1].toUpperCase();word=word.slice(0,8);
 const fs=word.length>6?26:word.length>4?32:40;
 return `<svg viewBox="0 0 120 120"><defs><linearGradient id="l${s}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p[1]}"/><stop offset="1" stop-color="${p[2]}"/></linearGradient></defs><rect width="120" height="120" fill="url(#l${s})"/><circle cx="96" cy="24" r="34" fill="${p[0]}" opacity=".35"/><path d="M14 86h92" stroke="${p[0]}" stroke-width="4" stroke-linecap="round" opacity=".9"/><text x="60" y="${70}" text-anchor="middle" font-family="Tajawal,Arial" font-weight="800" font-size="${fs}" fill="#fff">${esc(word)}</text><text x="60" y="104" text-anchor="middle" font-family="Tajawal,Arial" font-weight="700" font-size="12" letter-spacing="3" fill="#fff" opacity=".75">UHD</text></svg>`;}
function logo(c,cls){return `<span class="lg ${cls||''}">${has(c.img)?`<img alt="" src="${src(c.img)}">`:logoSvg(c.t)}</span>`;}
function clean(t){return String(t).replace(/#{2,}/g,'').replace(/\s+/g,' ').trim().replace(/^(4K-AR|4K-TOP|AR-TR-S|AR-SUBS|TOP|AS|4K)\s*-\s*/,'').trim();}
const yearOf=t=>(String(t).match(/\((\d{4})\)/)||[])[1]||'';
/* state */
const S={screen:'home',fav:new Set(),recent:[],hero:0,liveCat:1,liveSel:0,liveQ:'',movCat:0,movQ:'',serCat:0,serQ:'',serSort:0,movie:null,series:null,season:2,ch:38,ep:0,pos:0,dur:0,playing:false,quality:'تلقائي',audio:'الافتراضي',sub:'إيقاف',accent:'rose',mode:'day',lang:'ar',blur:true,lg:false,autoNext:true,setSec:0,manualType:'m3u',grp:1};
const HERO=[{img:D.hero.img,t:D.hero.title,kick:D.hero.meta,meta:['2025','★ 8','Drama','2 مواسم'],desc:D.hero.desc,kind:'series',i:0}].concat([0,1,3,4].map(i=>{const m=D.movies.items[i];return {img:m.img,t:m.t,kick:'أحدث الأفلام',meta:[yearOf(m.t)||'جديد','4K','فيلم'],desc:'',kind:'movies',i}}));
const L={ar:['الرئيسية','البث المباشر','الأفلام','المسلسلات','الإعدادات'],de:['Start','Live-TV','Filme','Serien','Einstellungen'],en:['Home','Live TV','Movies','Series','Settings']};
/* ---- shell ---- */
const ROMAN=['I','II','III','IV','V','VI','VII','VIII'];
function shell(){
 $('#app').innerHTML=`<div id="bg"><i class="arc a1"></i><i class="arc a2"></i><i class="sunk"></i></div><div id="backdrop"><div class="layer"></div><div class="layer"></div></div>
 <aside id="top"><div class="mast"><div class="crest"><img alt="" src="${src(D.brand)}"></div><div class="wm"><b>Alaa Player</b><small>Édition Ivoire</small></div></div>
 <div class="side-rule"><i></i><span>✦</span><i></i></div>
 <nav id="tabs">${[['home','home'],['live','tv'],['movies','film'],['series','series'],['settings','gear']].map((x,i)=>`<button class="tab f" data-go="${x[0]}" id="tab-${x[0]}"><span class="ti">${I(x[1])}</span><span class="tl bd" data-l="${i}">${L.ar[i]}</span><em>${ROMAN[i]}</em></button>`).join('')}</nav>
 <span class="grow"></span><div class="side-tools"><button class="ib f" data-act="search" aria-label="بحث">${I('search')}</button><button class="ib f" data-act="favs" aria-label="المفضلة">${I('heart')}</button><button class="ib f" data-act="recent" aria-label="المشاهدة مؤخراً">${I('clock')}</button></div>
 <div id="clock"><b></b><small></small></div></aside><div id="view"></div><div id="ringglow"></div><div id="ring"><i></i><i></i><i></i><i></i></div><div id="grain"></div><div class="toast" id="toast"></div>`;tick();}
function tick(){const n=new Date(),hm=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');$$('#clock b,.p-clock b').forEach(e=>e.textContent=hm);
 const d=n.toLocaleDateString('ar',{weekday:'long',day:'numeric',month:'long',numberingSystem:'latn'});$$('#clock small').forEach(e=>e.textContent=d);}
setInterval(tick,10000);
let BL=0;function backdrop(k,title){const ls=$$('#backdrop .layer');if(!ls.length)return;BL^=1;const l=ls[BL];l.style.backgroundImage=has(k)?`url(${src(k)})`:coverBg(title||'x');ls[BL^1].classList.remove('on');l.classList.add('on');}
function noBackdrop(){$$('#backdrop .layer').forEach(l=>l.classList.remove('on'));}
function toast(m,ic){const t=$('#toast');t.innerHTML=I(ic||'check')+'<span>'+esc(m)+'</span>';t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),2300);}
function setTab(k){$$('.tab').forEach(t=>t.classList.toggle('sel',t.dataset.go===k));}
/* ---- card builders ---- */
function card(it,attrs,key,sub){const on=S.fav.has(key);const y=yearOf(it.t);
 return `<button class="card f" ${attrs}><div class="art">${art(it,sub)}</div><span class="fav${on?' on':''}">${I('heart')}</span><span class="nm">${esc(clean(it.t))}</span><span class="mt">${y?`<span>${y}</span><i></i>`:''}<span>${sub==='مسلسل'?'HD':'4K UHD'}</span></span></button>`;}
function wide(m,attrs){const on=S.fav.has('s:'+m.t);const y=yearOf(m.t);
 return `<button class="wide f" ${attrs}><div class="wb">${has(m.img)?`<img alt="" src="${src(m.img)}">`:`<div class="wfb" style="background:${coverBg(m.t)}"></div>`}<span class="wp">${art(m,'مسلسل')}</span></div><div class="wi"><b>${esc(clean(m.t))}</b><span class="mt">${y?`<span>${y}</span><i></i>`:''}<span>مسلسل</span><i></i><span>HD</span></span></div><span class="fav${on?' on':''}">${I('heart')}</span></button>`;}
/* ---- screens ---- */
const R={};
R.home=()=>{const h=HERO[S.hero];
 return `<section id="home" class="screen scroll" style="overflow-y:auto"><div class="hero"><div class="hero-copy swap" id="hcopy">${heroCopy(h)}</div>
 <div class="hero-poster swap" id="hposter"><div class="arch"><div class="pc">${art(h)}</div></div><div class="arch-line"></div><span class="plate" id="plate">Plate ${ROMAN[S.hero]} · ${h.kind==='series'?'Série':'Cinéma'}</span></div>
 <div id="hero-index">${HERO.map((x,i)=>`<button class="hx f${i===S.hero?' sel':''}" data-act="heroGo" data-i="${i}"><span>${ROMAN[i]}</span><span class="bar"><i></i></span></button>`).join('')}</div></div>
 <div class="section">
 <div class="index rise">${[['live','tv','البث المباشر','346 قناة · 11 باقة',[9,13,17,21].map(k=>D.live.items[k])],['movies','film','الأفلام','400 فيلم · 4K',[2,3,4,5].map(i=>D.movies.items[i])],['series','series','المسلسلات','360 مسلسل',[1,5,9,13].map(i=>D.series.items[i])]].map((x,j)=>`<button class="portal f" data-go="${x[0]}" style="animation-delay:${.08+j*.08}s"><span class="pn">0${j+1}</span><span class="pt"><b>${x[2]}</b><small>${x[3]}</small></span><span class="pm">${x[4].map((it,q)=>x[0]==='live'?`<span class="pl" style="--q:${q}">${logo(it)}</span>`:`<span class="pp" style="--q:${q}">${art(it)}</span>`).join('')}</span><span class="pa">${I('arrowL')}</span></button>`).join('')}</div>
 <div class="mini-tiles rise"><button class="mini f" data-act="favs">${I('heart')}<b>المفضلة</b><small>${S.fav.size} عنصر</small></button><button class="mini f" data-act="recent">${I('clock')}<b>المشاهدة مؤخراً</b><small>${S.recent.length} عنصر</small></button><button class="mini f" data-act="search">${I('search')}<b>البحث</b><small>قنوات، أفلام ومسلسلات</small></button></div>
 <div class="sec-h"><em>§ 01</em><h2>أحدث الأفلام</h2><span class="rule"></span><button class="lnk f" data-go="movies">عرض الكل</button></div>
 <div class="rail hscroll">${D.movies.items.slice(0,12).map((m,i)=>card(m,`data-act="openMovie" data-i="${i}"`,'m:'+m.t,'فيلم')).join('')}</div>
 <div class="sec-h"><em>§ 02</em><h2>أحدث المسلسلات</h2><span class="rule"></span><button class="lnk f" data-go="series">عرض الكل</button></div>
 <div class="rail hscroll wides">${D.series.items.slice(0,10).map((m,i)=>wide(m,`data-act="openSeries" data-i="${i}"`)).join('')}</div></div></section>`;};
function heroCopy(h){return `<span class="kicker"><b>N° 0${S.hero+1}</b><i></i>${esc(h.kick)}</span><h1>${esc(clean(h.t))}</h1><div class="hero-meta">${h.meta.map(x=>`<span>${esc(x)}</span>`).join('<span class="dot"></span>')}</div>${h.desc?`<p>${esc(h.desc)}</p>`:'<p class="ph">عرض جديد ضمن مكتبتك، بجودة عالية وصوت محيطي. اختر المشاهدة الآن أو احفظه لوقت لاحق.</p>'}
 <div class="hero-actions"><button class="btn pri f" data-act="heroPlay">${I('play','fill')}<span>شاهد الآن</span></button><button class="btn f" data-act="heroInfo">${I('info')}<span>التفاصيل</span></button><button class="btn sq f${S.fav.has(heroKey(h))?' on':''}" data-act="heroFav" aria-label="المفضلة">${I('heart')}</button></div>`;}
const heroKey=h=>(h.kind==='series'?'s:':'m:')+h.t.replace(/^.*?$/,x=>h.kind==='series'?D.series.items[0].t:D.movies.items[h.i].t);
function paintHero(){const h=HERO[S.hero];const c=$('#hcopy');if(!c)return;c.innerHTML=heroCopy(h);c.classList.remove('swap');void c.offsetWidth;c.classList.add('swap');
 const p=$('#hposter');p.classList.remove('swap');void p.offsetWidth;p.classList.add('swap');$('.pc',p).innerHTML=art(h);$('#plate').textContent=`Plate ${ROMAN[S.hero]} · ${h.kind==='series'?'Série':'Cinéma'}`;
 $$('.hx').forEach((x,i)=>{x.classList.toggle('sel',i===S.hero);const b=$('.bar i',x);b.style.animation='none';void b.offsetWidth;b.style.animation='';});backdrop(h.img,h.t);}
setInterval(()=>{if(S.screen==='home'&&!$('#player')&&!$('.modal')&&!(document.activeElement&&document.activeElement.closest('.hero'))){S.hero=(S.hero+1)%HERO.length;paintHero();}},10000);
/* live */
function liveList(){let it=D.live.items.map((c,i)=>Object.assign({i},c));const q=S.liveQ.trim().toLowerCase();if(q)it=it.filter(c=>c.t.toLowerCase().includes(q));
 if(S.liveCat===D.live.cats.length-1)it=it.filter(c=>S.fav.has('c:'+c.t));
 if(!it.length)return `<div class="empty">${S.liveCat===D.live.cats.length-1?'أضف قنواتك المفضلة بالنجمة لتظهر هنا.':'لا توجد قناة بهذا الاسم.'}</div>`;
 return it.map(c=>`<button class="row f${c.i===S.liveSel?' sel':''}" data-act="ch" data-i="${c.i}"><span class="no">${String(+c.num).padStart(2,'0')}</span>${logo(c)}<span class="cn">${esc(clean(c.t))}</span><span class="eq"><i></i><i></i><i></i></span><span class="qual">UHD</span><span class="st${S.fav.has('c:'+c.t)?' on':''}" data-act="favCh" data-key="c:${esc(c.t)}">${I('star')}</span></button>`).join('');}
function sceneFor(i){const pool=D.related;return pool[i%pool.length].img;}
function monHtml(i){const c=D.live.items[i];return `<div class="sc" style="background-image:url(${src(sceneFor(i))})"></div><span class="tl"><span class="onair">مباشر</span><span class="hd">UHD 3840P</span></span><span class="sl">${logo(c)}</span><span class="pb">${I('play','fill')}</span>`;}
R.live=()=>{const c=D.live.items[S.liveSel];const cat=D.live.cats[S.liveCat];
 return `<section class="screen live"><div class="lib-h"><div><span class="kicker"><b>02</b><i></i>Live · ${esc(D.live.cats[0].n)} قناة</span><h1>البث المباشر</h1></div><span class="grow"></span><input class="inp f" id="q-live" type="search" placeholder="ابحث في القنوات" value="${esc(S.liveQ)}"></div>
 <div class="live-body"><div class="glist scroll"><small class="cats-h">الفئات</small>${D.live.cats.map((g,i)=>`<button class="grp f${i===S.liveCat?' sel':''}" data-act="grp" data-i="${i}"><span class="gt">${esc(g.l)}</span><span class="gn">${esc(g.n)}</span></button>`).join('')}</div><div class="rows scroll" id="rows">${liveList()}</div>
 <div class="monitor"><button class="screenbox f" data-act="playLive" id="mon">${monHtml(S.liveSel)}</button>
 <div class="mon-info"><small class="lbl">الآن على الهواء</small><h2 id="mon-name">${esc(clean(c.t))}</h2><p><span id="mon-grp">${esc(cat?cat.l:'')}</span></p><div class="acts"><button class="btn pri f" data-act="playLive">${I('play','fill')}<span>مشاهدة</span></button><button class="btn f${S.fav.has('c:'+c.t)?' on':''}" data-act="favCur">${I('star')}<span>المفضلة</span></button></div></div></div></div></section>`;};
/* grids */
function vod(kind){const X=D[kind];let it=X.items.map((m,i)=>Object.assign({i},m));const q=(kind==='movies'?S.movQ:S.serQ).trim().toLowerCase();if(q)it=it.filter(m=>m.t.toLowerCase().includes(q));
 if(kind==='series'){if(S.serSort===3)it.sort((a,b)=>clean(a.t).localeCompare(clean(b.t)));if(S.serSort===1)it.sort((a,b)=>(+yearOf(b.t)||0)-(+yearOf(a.t)||0));}
 if(!it.length)return `<div class="empty">لا توجد نتائج مطابقة.</div>`;
 if(kind==='movies')return `<div class="grid rise">${it.map((m,k)=>card(m,`data-act="openMovie" data-i="${m.i}" style="animation-delay:${Math.min(k,14)*35}ms"`,'m:'+m.t,'فيلم')).join('')}</div>`;
 return `<div class="grid sgrid rise">${it.map((m,k)=>wide(m,`data-act="openSeries" data-i="${m.i}" style="animation-delay:${Math.min(k,12)*40}ms"`)).join('')}</div>`;}
function catsCol(kind,act,cur){return `<div class="cats-row scroll"><small class="cats-h">الفئات</small>${D[kind].cats.map((c,i)=>`<button class="sg f${i===cur?' sel':''}" data-act="${act}" data-i="${i}"><span>${esc(c.l)}</span><em>${esc(c.n)}</em></button>`).join('')}</div>`;}
R.movies=()=>`<section class="screen lib"><div class="lib-h"><div><span class="kicker"><b>03</b><i></i>Cinéma</span><h1>الأفلام</h1></div><p class="cnt">${esc(D.movies.cats[S.movCat].n)} عنوان · ${esc(D.movies.cats[S.movCat].l)}</p><span class="grow"></span><input class="inp f" id="q-movies" type="search" placeholder="ابحث في الأفلام" value="${esc(S.movQ)}"></div>
 <div class="lib-body">${catsCol('movies','movCat',S.movCat)}<div class="gridwrap scroll" id="grid">${vod('movies')}</div></div></section>`;
R.series=()=>`<section class="screen lib"><div class="lib-h"><div><span class="kicker"><b>04</b><i></i>Séries</span><h1>المسلسلات</h1></div><p class="cnt">${esc(D.series.cats[S.serCat].n)} عنوان · ${esc(D.series.cats[S.serCat].l)}</p><span class="grow"></span><select class="sel f" id="sort">${D.series.sort.map((o,i)=>`<option value="${i}"${i===S.serSort?' selected':''}>${esc(o)}</option>`).join('')}</select><input class="inp f" id="q-series" type="search" placeholder="ابحث في المسلسلات" value="${esc(S.serQ)}"></div>
 <div class="lib-body">${catsCol('series','serCat',S.serCat)}<div class="gridwrap scroll" id="grid">${vod('series')}</div></div></section>`;
function facts(list){return `<dl class="facts">${list.filter(x=>x[1]).map(x=>`<div><dt>${x[0]}</dt><dd>${esc(x[1])}</dd></div>`).join('')}</dl>`;}
R['movie-detail']=()=>{const m=S.movie||D.movies.items[0];const k='m:'+m.t,y=yearOf(m.t),cat=D.movies.cats[S.movCat];
 return `<section class="screen detail scroll" style="overflow-y:auto"><div class="d-top">
 <div class="d-copy rise"><span class="kicker"><b>Cinéma</b><i></i>فيلم</span><h1>${esc(clean(m.t))}</h1>${facts([['السنة',y||'جديد'],['الجودة','4K UHD'],['الصوت','Dolby Audio'],['التصنيف',cat.l==='جميع التصنيفات'?D.movies.cats[1].l:cat.l]])}
 <p class="ds">فيلم من مكتبتك، جاهز للتشغيل بأعلى جودة يدعمها التلفزيون. تابع من حيث توقفت في أي وقت.</p>
 <div class="acts"><button class="btn pri f" id="movie-play" data-act="playMovie">${I('play','fill')}<span>تشغيل</span></button>${S.recent.some(r=>r.key===k)?`<button class="btn f" data-act="playMovie">${I('clock')}<span>متابعة المشاهدة</span></button>`:''}<button class="btn f${S.fav.has(k)?' on':''}" data-act="favBtn" data-key="${esc(k)}">${I('heart')}<span>المفضلة</span></button><button class="btn f" data-go="movies">${I('arrowL')}<span>رجوع</span></button></div></div>
 <button class="d-poster f" data-act="playMovie"><span class="arch">${art(m,'فيلم')}</span><span class="arch-line"></span><span class="plate">Plate · ${esc(y||'Nouveau')}</span></button></div>
 <div class="section"><div class="sec-h"><em>§</em><h2>أفلام من نفس التصنيف</h2><span class="rule"></span><small>${D.related.length} فيلم</small></div><div class="rail hscroll">${D.related.map((r,i)=>card(r,`data-act="openRel" data-i="${i}"`,'m:'+r.t,'فيلم')).join('')}</div></div></section>`;};
function sInfo(){const s=S.series;if(!s||s.ref){const sd=D.seriesD;return {ref:true,img:sd.poster,t:sd.title,meta:sd.meta,desc:sd.desc,seasons:sd.seasons.map(x=>x.t),eps:{2:sd.episodes}};}return {img:s.img,t:s.t,meta:'',desc:'',seasons:['الموسم 1'],eps:{}};}
R['series-detail']=()=>{const si=sInfo();const eps=si.eps[S.season]||[];const k='s:'+(S.series&&!S.series.ref?S.series.t:D.series.items[0].t);const mm=si.meta?si.meta.split('·').map(x=>x.trim()):[];
 return `<section class="screen detail scroll" style="overflow-y:auto"><div class="d-top">
 <div class="d-copy rise"><span class="kicker"><b>Série</b><i></i>مسلسل</span><h1>${esc(clean(si.t))}</h1>${facts([['التقييم',mm[0]||''],['النوع',mm[1]||''],['المواسم',si.seasons.length+''],['الجودة','HD']])}${si.desc?`<p class="ds">${esc(si.desc)}</p>`:''}
 <div class="acts"><button class="btn pri f" id="series-start" data-act="playEp" data-i="0">${I('play','fill')}<span>${S.recent.some(r=>r.key.startsWith('e:'))?'متابعة':'من البداية'}</span></button><button class="btn f" data-act="sInfo">${I('info')}<span>القصة كاملة</span></button><button class="btn f${S.fav.has(k)?' on':''}" data-act="favBtn" data-key="${esc(k)}">${I('heart')}<span>المفضلة</span></button><button class="btn sq f" data-act="later" aria-label="لاحقاً">${I('clock')}</button></div></div>
 <button class="d-poster f" data-act="playEp" data-i="0"><span class="arch">${art(si,'مسلسل')}</span><span class="arch-line"></span><span class="plate">Série · ${si.seasons.length} ${si.seasons.length>1?'Saisons':'Saison'}</span></button></div>
 <div class="seasons-wrap"><div class="sec-h"><em>§</em><h2>المواسم والحلقات</h2><span class="rule"></span><div class="season-col">${si.seasons.map((x,i)=>`<button class="ssn f${S.season===i+1?' sel':''}" data-act="season" data-n="${i+1}"><em>${i+1}</em><span>${esc(x)}</span></button>`).join('')}</div></div>
 <div class="eps rise">${eps.length?eps.map((e,i)=>{const r=S.recent.find(x=>x.key==='e:'+e.code);return `<button class="ep f" data-act="playEp" data-i="${i}" style="animation-delay:${i*70}ms"><span class="en">${String(i+1).padStart(2,'0')}</span><span class="th"><img alt="" src="${src(e.img)}"><span class="pl">${I('play','fill')}</span></span><span class="ei"><span class="ec">${esc(e.code)}</span><b class="et">${esc(e.t)}</b><small>الحلقة ${i+1} · الموسم ${S.season}</small></span><span class="ed">${e.d?I('clock')+esc(e.d):''}</span>${r&&r.p?`<span class="pr" style="width:${r.p}%"></span>`:''}</button>`}).join(''):`<div class="empty">حلقات هذا الموسم لم تُحمَّل بعد.</div>`}</div></div></section>`;};
R.settings=()=>{const secs=[['user','الحساب والتفعيل'],['stack','القوائم'],['palette','المظهر'],['globe','اللغة'],['sliders','التشغيل']];
 return `<section class="screen settings"><div class="set-nav"><span class="kicker"><b>05</b><i></i>Réglages</span><h1>الإعدادات</h1>${secs.map((s,i)=>`<button class="sn f${i===S.setSec?' sel':''}" data-act="setSec" data-i="${i}"><em>${ROMAN[i]}</em><span>${s[1]}</span>${I('chevR')}</button>`).join('')}</div><div class="set-body scroll" id="setbody">${setBody()}</div></section>`;};
function setBody(){const code=D.settings.code;
 if(S.setSec===0)return `<div class="glass rise"><span class="kicker"><i></i>Activation</span><h2>شاشتك، مكتبتك.</h2><p>فعّل هذا الجهاز من لوحة تحكم Alaa Player.</p><small class="lbl">رمز تفعيل الجهاز</small><div class="code">${[...code].map(ch=>ch==='-'?'<span class="dash">–</span>':`<span>${ch}</span>`).join('')}</div><div class="okline">${I('check')}${esc(D.settings.act)}</div><div class="url">${esc(D.settings.url)}</div>
 <div class="acts-row"><button class="btn pri f" data-act="sync">${I('sync')}<span>تحديث الاتصال</span></button><button class="btn f" data-go="home">${I('arrowL')}<span>العودة للمكتبة</span></button></div><p class="note">رمز جهاز webOS مستقل عن Android TV. استخدم القوائم المصرّح لك بمشاهدتها فقط.</p></div>`;
 if(S.setSec===1)return `<div class="glass rise"><span class="kicker"><i></i>Listes</span><h2>القوائم</h2><p>Provider · 346 قناة · 400 فيلم · 360 مسلسل</p><div class="acts-row" style="margin-top:0"><button class="btn pri f" data-act="refresh">${I('sync')}<span>تحديث القائمة</span></button><button class="btn f" data-act="manual">${I('plus')}<span>إضافة قائمة مباشرة</span></button></div>
 <div class="form" id="manual" ${S.manual?'':'hidden'}><label>نوع القائمة<select class="f" id="mtype"><option value="m3u"${S.manualType==='m3u'?' selected':''}>M3U URL</option><option value="xtream"${S.manualType==='xtream'?' selected':''}>Xtream Codes</option></select></label><label>رابط القائمة أو خادم Xtream<input class="f" id="murl" type="url" dir="ltr" placeholder="https://your-provider.example"></label>
 <div id="creds" class="form" style="margin:0" ${S.manualType==='xtream'?'':'hidden'}><label>اسم المستخدم<input class="f" dir="ltr" autocomplete="off"></label><label>كلمة المرور<input class="f" type="password" dir="ltr" autocomplete="off"></label></div>
 <div><button class="btn pri f" data-act="manualGo">${I('check')}<span>فتح القائمة لهذه الجلسة</span></button></div><p class="note">تُحفظ بيانات الدخول في الذاكرة فقط. يجب أن يسمح المزوّد بالوصول من المتصفح.</p></div></div>`;
 if(S.setSec===2){const md=[['day','Ivoire','نهاري · ورق عاجي','linear-gradient(135deg,#fbf7f0,#efe6d8)'],['night','Nocturne','ليلي · حبر دافئ','linear-gradient(135deg,#2a241e,#14110e)']];
  const sw=[['rose','Bordeaux','#7a2333'],['teal','Émeraude','#1f5a4a'],['amber','Laiton','#9a7038'],['ice','Marine','#22355e']];
  return `<div class="glass rise"><span class="kicker"><i></i>Apparence</span><h2>الوضع</h2><p>ورق نهاري فاتح أو حبر ليلي هادئ للمشاهدة بالعتمة.</p><div class="sw-row">${md.map(x=>`<button class="mode f${S.mode===x[0]?' sel':''}" data-act="mode" data-v="${x[0]}"><i style="background:${x[3]}"><s></s><s></s></i><b>${x[1]}</b><small>${x[2]}</small></button>`).join('')}</div></div>
  <div class="glass rise"><h2>لون الحبر</h2><p>اللون المميّز للأزرار والعناوين الصغيرة.</p><div class="sw-row">${sw.map(x=>`<button class="swatch f${S.accent===x[0]?' sel':''}" data-act="accent" data-v="${x[0]}"><i style="background:${x[2]}"></i><b>${x[1]}</b></button>`).join('')}</div></div>`;}
 if(S.setSec===3){const fl={ar:'<svg viewBox="0 0 3 2" style="stroke:none"><rect width="3" height="2" fill="#0a7a3d"/><rect width="3" height=".67" fill="#111"/><rect y=".67" width="3" height=".67" fill="#fff"/><path d="M0 0l1 1-1 1z" fill="#c8102e"/></svg>',de:'<svg viewBox="0 0 5 3" style="stroke:none"><rect width="5" height="1" fill="#000"/><rect y="1" width="5" height="1" fill="#dd0000"/><rect y="2" width="5" height="1" fill="#ffce00"/></svg>',en:'<svg viewBox="0 0 60 30" style="stroke:none"><rect width="60" height="30" fill="#012169"/><path d="M0 0l60 30M60 0 0 30" stroke="#fff" stroke-width="6"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#c8102e" stroke-width="6"/></svg>'};
  return `<div class="glass rise"><span class="kicker"><i></i>Langue</span><h2>اللغة</h2><p>لغة القوائم والعناوين.</p><div class="opt-row">${[['ar','العربية'],['de','Deutsch'],['en','English']].map(x=>`<button class="lang f${S.lang===x[0]?' sel':''}" data-act="lang" data-v="${x[0]}"><span class="flag">${fl[x[0]]}</span>${x[1]}</button>`).join('')}</div></div>`;}
 return `<div class="glass rise"><span class="kicker"><i></i>Lecture</span><h2>التشغيل</h2><p>خيارات المشغّل على هذا التلفزيون.</p><button class="tg f" data-act="autoNext" aria-pressed="${S.autoNext}"><span class="tx"><b>تشغيل الحلقة التالية تلقائياً</b><small>عدّ تنازلي قصير قبل بدء الحلقة التالية.</small></span><span class="knob"></span></button>

 <button class="tg f" data-act="lg" aria-pressed="${S.lg}"><span class="tx"><b>مسارات LG التجريبية</b><small>تجريبي على LG فقط. قد لا تعمل المسارات أو قد يتجمّد التشغيل حسب التلفزيون. أوقفه إذا واجهت مشكلة.</small></span><span class="knob"></span></button></div>`;}
/* ---- overlays ---- */
function entries(){const o=[];D.live.items.forEach((c,i)=>o.push({key:'c:'+c.t,t:clean(c.t),type:'قناة',c,go:()=>{S.liveSel=i;playLive(i)}}));
 D.movies.items.forEach(m=>o.push({key:'m:'+m.t,t:clean(m.t),type:'فيلم',m,go:()=>openMovie(m)}));D.related.forEach(m=>o.push({key:'m:'+m.t,t:clean(m.t),type:'فيلم',m,go:()=>openMovie(m)}));
 D.series.items.forEach((m,i)=>o.push({key:'s:'+m.t,t:clean(m.t),type:'مسلسل',m,go:()=>openSeries(i)}));D.seriesD.episodes.forEach((e,i)=>o.push({key:'e:'+e.code,t:e.t,type:'حلقة',m:{img:e.img,t:e.t},go:()=>playEp(i)}));
 const seen=new Set();return o.filter(e=>!seen.has(e.key)&&seen.add(e.key));}
let ME=[];function rows(list){ME=list;if(!list.length)return '<div class="empty">لا يوجد شيء هنا بعد.</div>';
 return list.map((e,i)=>`<button class="res f" data-act="res" data-i="${i}">${e.c?logo(e.c):`<span class="ra">${art(e.m)}</span>`}<b>${esc(e.t)}</b><span class="tag">${e.type}</span></button>`).join('');}
function modal(html,fsel){closeModal();const m=document.createElement('div');m.className='modal';m.id='modal';m.innerHTML=`<div class="mbox">${html}</div>`;$('#app').appendChild(m);setTimeout(()=>focusIn(m,fsel),40);}
function closeModal(){const m=$('#modal');if(m){m.remove();return true}return false;}
function list(kind){const all=entries();
 if(kind==='search'){modal(`<h2>${I('search')}بحث</h2><input class="inp f" id="gq" type="search" placeholder="ابحث عن قناة، فيلم أو مسلسل"><div class="mb scroll" id="gres">${rows(all.slice(0,8))}</div>`,'#gq');const q=$('#gq');q.oninput=()=>{const v=q.value.trim().toLowerCase();$('#gres').innerHTML=rows(all.filter(e=>!v||e.t.toLowerCase().includes(v)).slice(0,30));};return}
 const L2=kind==='favs'?all.filter(e=>S.fav.has(e.key)):S.recent.map(r=>all.find(e=>e.key===r.key)).filter(Boolean);
 modal(`<h2>${I(kind==='favs'?'heart':'clock')}${kind==='favs'?'المفضلة':'المشاهدة الأخيرة'}</h2><div class="mb scroll">${rows(L2)}</div><div class="mfoot"><button class="btn f" data-act="closeModal">${I('x')}<span>إغلاق</span></button></div>`);}
/* ---- navigation ---- */
const NAMES=['home','live','player-live','player-live-list','movies','movie-detail','series','series-detail','player-series','settings'];
const AR={home:'الرئيسية',live:'البث المباشر','player-live':'مشغّل البث','player-live-list':'المشغّل مع القنوات',movies:'الأفلام','movie-detail':'تفاصيل الفيلم',series:'المسلسلات','series-detail':'تفاصيل المسلسل','player-series':'مشغّل المسلسل',settings:'الإعدادات'};
function show(n){if(!AR[n])n='home';closeModal();closePlayer();
 if(n==='player-live'||n==='player-live-list'){render('live');return playLive(S.liveSel,n==='player-live-list');}
 if(n==='player-series'){S.series={ref:true};S.season=2;render('series-detail');return playEp(0);}
 render(n);}
function render(n){S.screen=n;const v=$('#view');const old=$('.screen',v);v.innerHTML=R[n]();setTab({'movie-detail':'movies','series-detail':'series'}[n]||n);bind();
 if(n==='home')backdrop(HERO[S.hero].img,HERO[S.hero].t);else if(n==='movie-detail'){const m=S.movie||D.movies.items[0];backdrop(m.img,m.t);}else if(n==='series-detail'){const si=sInfo();backdrop(si.img,si.t);}else if(n==='live')backdrop(sceneFor(S.liveSel));else noBackdrop();
 const f={home:'[data-act=heroPlay]',live:'.row.sel',movies:'#grid .card',series:'#grid .wide','movie-detail':'#movie-play','series-detail':'#series-start','settings':'.sn.sel'}[n];
 setTimeout(()=>{focusIn($('#view'),f);const s=$('.row.sel');s&&reveal(s,true);},30);cur(n);}
function cur(n){window.currentScreen=n;$$('#switcher button').forEach(b=>b.setAttribute('aria-current',String(b.dataset.s===n)));}
function openMovie(m){S.movie=m;closeModal();render('movie-detail');}
function openSeries(i){const m=D.series.items[i];S.series=i===0?{ref:true}:{img:m.img,t:m.t};S.season=i===0?2:1;closeModal();render('series-detail');}
function bind(){const b=(id,k,fn)=>{const e=$(id);if(e)e.oninput=()=>{S[k]=e.value;fn();}};
 b('#q-live','liveQ',()=>$('#rows').innerHTML=liveList());b('#q-movies','movQ',()=>$('#grid').innerHTML=vod('movies'));b('#q-series','serQ',()=>$('#grid').innerHTML=vod('series'));
 const so=$('#sort');if(so)so.onchange=()=>{S.serSort=+so.value;$('#grid').innerHTML=vod('series');};
 const mt=$('#mtype');if(mt)mt.onchange=()=>{S.manualType=mt.value;$('#creds').hidden=mt.value!=='xtream';};}
/* ---- players ---- */
let TM=0,NX=0;
function closePlayer(){clearInterval(TM);clearInterval(NX);const p=$('#player');if(p){p.remove();return true}return false;}
function recent(key,p){S.recent=S.recent.filter(r=>r.key!==key);S.recent.unshift({key,p:p||0});}
function pshell(kind){closePlayer();const p=document.createElement('section');p.id='player';p.dataset.kind=kind;$('#app').appendChild(p);return p;}
function playLive(li,withList){if(li!=null){const c=D.live.items[li];const ci=D.channels.findIndex(x=>x.t===clean(c.t).replace(/^4K:\s*/,'')||c.t.endsWith(x.t));S.ch=ci>=0?ci:li;recent('c:'+c.t);}
 const p=pshell('live');p.innerHTML=`<video id="video" playsinline muted></video><div class="feed" id="feed"></div><div class="state" id="st"><span class="spin"></span><b>${esc(D.playerMeta.state)}</b></div>
 <div class="p-ui" id="pui"><div class="sh"></div><div class="p-badge" id="pbadge"></div><div class="p-clock"><b></b><small>البث المباشر</small></div>
 <div class="dock"><button class="k f" id="k-list" data-act="drawer">${'<span class="kb">'+I('list')+'</span>'}<span class="kl">القنوات</span></button><span class="sep"></span>
 <button class="k f" data-act="zapD" data-d="-1"><span class="kb">${I('chevU')}</span><span class="kl">السابقة</span></button><button class="k f" data-act="zapD" data-d="1"><span class="kb">${I('chevD')}</span><span class="kl">التالية</span></button><span class="sep"></span>
 <button class="k f" id="k-fav" data-act="liveFav"><span class="kb">${I('star')}</span><span class="kl">المفضلة</span></button><button class="k f" data-act="qPop"><span class="kb">${I('hd')}</span><span class="kl">الجودة</span></button><button class="k f" data-act="aPop"><span class="kb">${I('audio')}</span><span class="kl">الصوت</span></button>
 <button class="k f" data-act="exit"><span class="kb">${I('arrowL')}</span><span class="kl">رجوع</span></button></div></div>`;
 paintCh(false);tick();buffer();S.screen='player-live';cur('player-live');if(withList)drawer();else setTimeout(()=>focusIn(p,'#k-list'),40);wake();}
function chName(i){const c=D.channels[i];if(i===38)return clean(D.liveNow.name);const lv=D.live.items.find(x=>clean(x.t).replace(/^4K:\s*/,'')===c.t);return lv?clean(lv.t):clean(c.t);}
function chKey(i){const c=D.channels[i];const lv=D.live.items.find(x=>clean(x.t).replace(/^4K:\s*/,'')===c.t);return 'c:'+(lv?lv.t:c.t);}
function paintCh(zap){const c=D.channels[S.ch];const sc=sceneFor(S.ch+3);
 $('#feed').innerHTML=`<div class="fs b" style="background-image:url(${src(sc)})"></div><div class="lt"></div>`;
 $('#pbadge').innerHTML=`${logo(c)}<div><span class="num">${esc(c.n)}</span><h2>${esc(chName(S.ch))}</h2><p><span class="onair">مباشر</span><span>${esc(D.liveNow.group)}</span><span class="tag">${S.quality==='تلقائي'?'UHD':esc(S.quality)}</span></p></div>`;
 const f=$('#k-fav');f.classList.toggle('on',S.fav.has(chKey(S.ch)));
 $$('#drawer .row').forEach(r=>r.classList.toggle('sel',+r.dataset.i===S.ch));
 if(zap){let z=$('#zap');if(!z){z=document.createElement('div');z.id='zap';$('#player').appendChild(z);}z.innerHTML=`<b>${esc(c.n)}</b><span class="bd">${esc(chName(S.ch))}</span>`;clearTimeout(z._t);z._t=setTimeout(()=>z.remove(),2200);buffer();}}
function buffer(){const st=$('#st');if(!st)return;st.hidden=false;S.playing=false;clearTimeout(st._t);st._t=setTimeout(()=>{if(st.isConnected){st.hidden=true;S.playing=true;}},1400);}
function drawer(){const p=$('#player');if(!p)return;if($('#drawer'))return closeDrawer();const d=document.createElement('div');d.id='drawer';
 if(p.dataset.kind==='live'){S.screen='player-live-list';d.innerHTML=`<h2>${I('list')}القنوات<small>${D.channels.length} قناة</small></h2><div class="dgrp"><button class="btn f" data-act="grpD" data-d="-1">${I('chevL')}</button><b id="dg">${esc(D.live.cats[S.grp].l)}</b><button class="btn f" data-act="grpD" data-d="1">${I('chevR')}</button></div>
 <div class="rows scroll">${D.channels.map((c,i)=>`<button class="row f${i===S.ch?' sel':''}" data-act="zap" data-i="${i}"><span class="no">${esc(c.n)}</span>${logo(c)}<span class="cn">${esc(clean(c.t))}</span><span class="eq"><i></i><i></i><i></i></span><span class="qual">${esc(c.q.replace(' 3840P',''))}</span></button>`).join('')}</div>`;cur('player-live-list');}
 else{d.innerHTML=`<h2>${I('series')}الحلقات<small>الموسم 2</small></h2><div class="rows scroll" style="margin-top:20px">${D.seriesD.episodes.map((e,i)=>`<button class="row f${i===S.ep?' sel':''}" data-act="epGo" data-i="${i}"><span class="no">${i+1}</span><span class="lg" style="width:120px;border-radius:12px"><img alt="" src="${src(e.img)}" style="object-fit:cover"></span><span class="cn">${esc(e.t)}</span><span class="eq"><i></i><i></i><i></i></span><span class="qual">${esc(e.d||e.code)}</span></button>`).join('')}</div>`;}
 p.appendChild(d);p.classList.add('dr');$('#pui').classList.remove('idle');setTimeout(()=>{const s=$('.row.sel',d)||$('.row',d);s.focus({preventScroll:true});reveal(s,true);},60);}
function closeDrawer(){const d=$('#drawer');if(!d)return false;d.remove();const p=$('#player');p.classList.remove('dr');if(p.dataset.kind==='live'){S.screen='player-live';cur('player-live');focusIn(p,'#k-list');}else focusIn(p,'#k-eps');return true;}
function pop(title,opts,curv,pick,anchor){closePop();const d=document.createElement('div');d.className='pop';d.innerHTML=`<h3>${esc(title)}</h3>${opts.map((o,i)=>`<button class="po f${o===curv?' sel':''}" data-act="popPick" data-i="${i}">${I('check')}${esc(o)}</button>`).join('')}`;
 d._pick=i=>{pick(opts[i]);closePop();};d._a=anchor;$('#player').appendChild(d);const st=$('#stage').getBoundingClientRect(),sc=st.width/1920,r=anchor.getBoundingClientRect();
 d.style.left=Math.max(40,Math.min(1520,(r.left-st.left)/sc+r.width/sc/2-180))+'px';d.style.bottom=(1080-(r.top-st.top)/sc+40)+'px';setTimeout(()=>focusIn(d,'.po.sel'),40);}
function closePop(){const d=$('.pop');if(!d)return false;const a=d._a;d.remove();a&&a.isConnected&&a.focus();return true;}
function playEp(i){const e=D.seriesD.episodes[i];S.ep=i;S.dur=parseDur(e.d)||2*3600+51*60+18;S.pos=0;recent('e:'+e.code);const nx=D.seriesD.episodes[i+1];
 const p=pshell('episode');p.innerHTML=`<video id="video" playsinline muted></video><div class="feed"><div class="fs" style="background-image:url(${src(e.img)});filter:blur(2px) saturate(1.2) brightness(.9)"></div><div class="lt"></div></div><div class="state" id="st"><span class="spin"></span><b>${esc(D.playerMeta.state)}</b></div>
 <div class="p-ui" id="pui"><div class="sh"></div><div class="v-top"><button class="back f" data-act="exit" aria-label="رجوع">${I('arrowL')}</button><div><h2>${esc(e.t)}</h2><p><span class="tag">${esc(e.code)}</span><span>Drama</span><span style="color:var(--a2)">★★★★</span></p></div></div>
 <div class="v-center"><button class="k c f" data-act="seek" data-d="-10"><span class="kb">${I('back10')}</span><span class="kl">−10 ثوانٍ</span></button><button class="k c big f" id="k-pp" data-act="pp"><span class="kb" id="ppi">${I('pause','fill')}</span><span class="kl" id="ppl">إيقاف مؤقت</span></button><button class="k c f" data-act="seek" data-d="10"><span class="kb">${I('fwd10')}</span><span class="kl">+10 ثوانٍ</span></button></div>
 <div class="v-bottom"><div class="v-time"><span id="t1">00:00</span><span id="t2">${fmt(S.dur)}</span></div><button class="seek f" id="seek" aria-label="موضع التشغيل"><span class="tr"><span class="bf" style="width:18%"></span><span class="fl" id="fl"></span><span class="kn" id="kn"></span></span><span class="tip" id="tip">00:00</span></button>
 <div class="v-row"><button class="k f" id="k-eps" data-act="drawer"><span class="kb">${I('list')}</span><span class="kl">الحلقات</span></button><button class="k f" data-act="sPop"><span class="kb">${I('cc')}</span><span class="kl" id="subl">الترجمة</span></button><button class="k f" data-act="aPop"><span class="kb">${I('audio')}</span><span class="kl">الصوت</span></button><span class="grow"></span>
 <button class="k f" data-act="nextEp" ${nx?'':'disabled style="opacity:.35"'}><span class="kb">${I('next')}</span><span class="kl">الحلقة التالية</span></button></div></div>
 ${nx?`<button class="next f" data-act="nextEp" id="nextcard"><span class="nt"><img alt="" src="${src(nx.img)}"><span class="ring2"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" stroke="rgba(255,255,255,.25)" stroke-width="3"/><circle class="p" id="nring" cx="18" cy="18" r="16" pathLength="100" stroke-dashoffset="0"/><path d="M14.5 12v12l10-6z" fill="#fff" stroke="none"/></svg></span></span><span><small>الحلقة التالية</small><b>${esc(nx.t)}</b><span class="cd" id="cd">${S.autoNext?'تبدأ خلال 15 ثانية':'اضغط للتشغيل'}</span></span></button>`:''}</div>`;
 S.screen='player-series';cur('player-series');buffer();paintT();
 TM=setInterval(()=>{if(!$('#player'))return clearInterval(TM);if(S.playing){S.pos=Math.min(S.dur,S.pos+1);paintT();}},1000);
 let left=15;clearInterval(NX);if(nx&&S.autoNext)NX=setInterval(()=>{if(!$('#nextcard'))return clearInterval(NX);if(!S.playing)return;left--;$('#cd').textContent='تبدأ خلال '+left+' ثانية';$('#nring').style.strokeDashoffset=String((15-left)/15*100);if(left<=0){clearInterval(NX);playEp(i+1);}},1000);
 setTimeout(()=>focusIn(p,'#k-pp'),40);wake();}
function parseDur(d){if(!d)return 0;const a=d.split(':').map(Number);return a.length===3?a[0]*3600+a[1]*60+a[2]:a[0]*60+a[1];}
function fmt(s){s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return (h?h+':':'')+String(m).padStart(2,'0')+':'+String(x).padStart(2,'0');}
function paintT(){const fl=$('#fl');if(!fl)return;const pc=S.dur?S.pos/S.dur*100:0;fl.style.width=pc+'%';$('#kn').style.left=pc+'%';$('#tip').style.left=pc+'%';$('#tip').textContent=fmt(S.pos);$('#t1').textContent=fmt(S.pos);
 const e=D.seriesD.episodes[S.ep];const r=S.recent.find(x=>x.key==='e:'+e.code);if(r)r.p=Math.round(pc);}
let IDLE=0;function wake(){const u=$('#pui');if(!u)return;u.classList.remove('idle');clearTimeout(IDLE);IDLE=setTimeout(()=>{if(S.playing&&!$('#drawer')&&!$('.pop')&&u.isConnected){u.classList.add('idle');}},7000);}
function exitPlayer(){const k=$('#player')&&$('#player').dataset.kind;closePlayer();render(k==='live'?'live':'series-detail');}
/* ---- actions ---- */
const A={
heroGo:e=>{S.hero=+e.dataset.i;paintHero();},
heroPlay:()=>{const h=HERO[S.hero];if(h.kind==='series'){S.series={ref:true};S.season=2;playEp(0);}else openMovie(D.movies.items[h.i]);},
heroInfo:()=>{const h=HERO[S.hero];h.kind==='series'?openSeries(0):openMovie(D.movies.items[h.i]);},
heroFav:e=>{const k=heroKey(HERO[S.hero]);togg(k);e.classList.toggle('on',S.fav.has(k));},
openMovie:e=>openMovie(D.movies.items[+e.dataset.i]),openRel:e=>openMovie(D.related[+e.dataset.i]),openSeries:e=>openSeries(+e.dataset.i),
grp:e=>{S.liveCat=+e.dataset.i;$$('.grp').forEach(g=>g.classList.toggle('sel',g===e));$('#rows').innerHTML=liveList();$('#mon-grp').textContent=D.live.cats[S.liveCat].l;},
ch:e=>{const i=+e.dataset.i;if(i===S.liveSel)return playLive(i);S.liveSel=i;const c=D.live.items[i];$$('#rows .row').forEach(r=>r.classList.toggle('sel',r===e));
 $('#mon').innerHTML=monHtml(i);$('#mon-name').textContent=clean(c.t);backdrop(sceneFor(i));
 const fb=$('[data-act=favCur]');fb&&fb.classList.toggle('on',S.fav.has('c:'+c.t));},
favCh:e=>{const k=e.dataset.key;togg(k);e.classList.toggle('on',S.fav.has(k));},
favCur:e=>{const k='c:'+D.live.items[S.liveSel].t;togg(k);e.classList.toggle('on',S.fav.has(k));const st=$(`#rows .row[data-i="${S.liveSel}"] .st`);st&&st.classList.toggle('on',S.fav.has(k));},
playLive:()=>playLive(S.liveSel),
movCat:e=>{S.movCat=+e.dataset.i;$$('.cats-row .sg').forEach(x=>x.classList.toggle('sel',x===e));$('.cnt').textContent=D.movies.cats[S.movCat].n+' عنوان · '+D.movies.cats[S.movCat].l;$('#grid').innerHTML=vod('movies');},
serCat:e=>{S.serCat=+e.dataset.i;$$('.cats-row .sg').forEach(x=>x.classList.toggle('sel',x===e));$('.cnt').textContent=D.series.cats[S.serCat].n+' عنوان · '+D.series.cats[S.serCat].l;$('#grid').innerHTML=vod('series');},
favBtn:e=>{const k=e.dataset.key;togg(k);e.classList.toggle('on',S.fav.has(k));},
playMovie:()=>{const m=S.movie||D.movies.items[0];recent('m:'+m.t);toast('جارٍ فتح الفيلم','play');},
sInfo:()=>{const si=sInfo();modal(`<h2>${I('info')}${esc(clean(si.t))}</h2><div class="mb scroll"><p style="font-size:24px;line-height:1.8;color:#e6d9e0;unicode-bidi:plaintext;direction:rtl;text-align:left">${esc(si.desc||'لا يوجد وصف متاح لهذا العنوان من المزوّد.')}</p></div><div class="mfoot"><button class="btn pri f" data-act="playEp" data-i="0">${I('play','fill')}<span>من البداية</span></button><button class="btn f" data-act="closeModal">${I('x')}<span>إغلاق</span></button></div>`);},
later:()=>{recent('s:'+(S.series&&!S.series.ref?S.series.t:D.series.items[0].t));toast('أضيف إلى المشاهدة الأخيرة','clock');},
season:e=>{S.season=+e.dataset.n;const sc=$('.detail').scrollTop;$('#view').innerHTML=R['series-detail']();$('.detail').scrollTop=sc;focusIn($('#view'),`.ssn[data-n="${S.season}"]`);},
playEp:e=>{closeModal();if(!sInfo().ref){toast('حلقات هذا المسلسل لم تُحمَّل بعد','info');return}playEp(+e.dataset.i||0);},
setSec:e=>{S.setSec=+e.dataset.i;$$('.sn').forEach(x=>x.classList.toggle('sel',x===e));$('#setbody').innerHTML=setBody();bind();},
sync:()=>toast('تم تحديث الاتصال','sync'),refresh:()=>toast('تم تحديث القائمة · 346 قناة · 400 فيلم · 360 مسلسل','sync'),
manual:()=>{S.manual=!S.manual;$('#manual').hidden=!S.manual;if(S.manual)focusIn($('#manual'),'#mtype');},
manualGo:()=>{const u=$('#murl');if(!u.value||!u.checkValidity()){u.focus();toast('أدخل رابطاً صالحاً للقائمة','info');return}toast('تم فتح القائمة لهذه الجلسة','check');},
mode:e=>{S.mode=e.dataset.v;document.body.dataset.mode=S.mode;$$('.mode').forEach(x=>x.classList.toggle('sel',x===e));},
accent:e=>{S.accent=e.dataset.v;document.body.dataset.accent=S.accent;$$('.swatch').forEach(x=>x.classList.toggle('sel',x===e));},
blur:e=>{S.blur=!S.blur;e.setAttribute('aria-pressed',S.blur);document.body.classList.toggle('noblur',!S.blur);},
lg:e=>{S.lg=!S.lg;e.setAttribute('aria-pressed',S.lg);},autoNext:e=>{S.autoNext=!S.autoNext;e.setAttribute('aria-pressed',S.autoNext);},
lang:e=>{S.lang=e.dataset.v;$$('.lang').forEach(x=>x.classList.toggle('sel',x===e));$$('[data-l]').forEach(s=>s.textContent=L[S.lang][+s.dataset.l]);},
search:()=>list('search'),favs:()=>list('favs'),recent:()=>list('recent'),res:e=>{const x=ME[+e.dataset.i];x&&x.go();},closeModal:()=>{closeModal();focusIn($('#view'));},
drawer:()=>drawer(),zap:e=>{S.ch=+e.dataset.i;recent(chKey(S.ch));paintCh(true);setTimeout(closeDrawer,300);},
zapD:e=>{S.ch=(S.ch+(+e.dataset.d)+D.channels.length)%D.channels.length;recent(chKey(S.ch));paintCh(true);},
grpD:e=>{S.grp=(S.grp+(+e.dataset.d)+D.live.cats.length-1)%(D.live.cats.length-1)||1;$('#dg').textContent=D.live.cats[S.grp].l;},
liveFav:e=>{const k=chKey(S.ch);togg(k);e.classList.toggle('on',S.fav.has(k));},
qPop:e=>pop('الجودة',['تلقائي','4K UHD','1080p','720p'],S.quality,v=>{S.quality=v;paintCh(false);toast('الجودة: '+v,'check');},e),
aPop:e=>pop('الصوت',['الافتراضي','Türkçe · Stereo','العربية · 5.1'],S.audio,v=>{S.audio=v;toast('الصوت: '+v,'audio');},e),
sPop:e=>pop('الترجمة',['إيقاف','العربية','English','Türkçe'],S.sub,v=>{S.sub=v;$('#subl').textContent=v==='إيقاف'?'الترجمة':v;e.classList.toggle('on',v!=='إيقاف');},e),
popPick:e=>e.closest('.pop')._pick(+e.dataset.i),
exit:()=>exitPlayer(),
pp:()=>{if($('#st')&&!$('#st').hidden)return;S.playing=!S.playing;$('#ppi').innerHTML=I(S.playing?'pause':'play','fill');$('#ppl').textContent=S.playing?'إيقاف مؤقت':'تشغيل';},
seek:e=>{S.pos=Math.max(0,Math.min(S.dur,S.pos+(+e.dataset.d)));paintT();let f=$('#seekfb');if(!f){f=document.createElement('div');f.id='seekfb';$('#player').appendChild(f);}f.textContent=(+e.dataset.d>0?'+':'−')+Math.abs(+e.dataset.d)+' · '+fmt(S.pos);clearTimeout(f._t);f._t=setTimeout(()=>f.remove(),1200);},
nextEp:()=>{if(D.seriesD.episodes[S.ep+1])playEp(S.ep+1);},epGo:e=>playEp(+e.dataset.i)};
function togg(k){if(S.fav.has(k)){S.fav.delete(k);toast('أزيل من المفضلة','heart')}else{S.fav.add(k);toast('أضيف إلى المفضلة','heart')}}
document.addEventListener('click',e=>{if(e.target.closest('#switcher'))return;const g=e.target.closest('[data-go]');const a=e.target.closest('[data-act]');
 if(a&&A[a.dataset.act]&&!a.disabled){e.preventDefault();e.stopPropagation();A[a.dataset.act](a);return}if(g){e.preventDefault();show(g.dataset.go);}});
document.addEventListener('mouseover',e=>{const f=e.target.closest('.f');if(f&&f!==document.activeElement&&layer().contains(f)&&f.tagName!=='INPUT')f.focus({preventScroll:true});wake();});
document.addEventListener('mousemove',wake);
/* ---- focus ring ---- */
const ring=()=>$('#ring'),glow=()=>$('#ringglow');let RC={x:0,y:0,w:0,h:0,r:20},init=false,LT=0;
function loop(now){const dt=Math.min(100,now-(LT||now));LT=now;const el=document.activeElement,rg=ring(),gl=glow();
 if(rg&&el&&el!==document.body&&el.closest('#stage')&&!el.closest('#switcher')){const st=$('#stage').getBoundingClientRect(),sc=st.width/1920;const b=el.getBoundingClientRect();const fs=parseFloat(getComputedStyle(el).getPropertyValue('--fs'))||1.04;
  const w=el.offsetWidth*fs+12,h=el.offsetHeight*fs+12;const cx=(b.left+b.width/2-st.left)/sc,cy=(b.top+b.height/2-st.top)/sc;const T={x:cx-w/2,y:cy-h/2,w,h,r:(parseFloat(getComputedStyle(el).borderTopLeftRadius)||14)*fs+6};
  const vis=b.width>0&&!(el.closest('#pui')&&el.closest('#pui').classList.contains('idle'));
  if(!init){RC=T;init=true}const k=1-Math.exp(-(dt||16)/70);for(const p of['x','y','w','h','r'])RC[p]+=(T[p]-RC[p])*k;
  rg.style.transform=`translate(${RC.x}px,${RC.y}px)`;rg.style.width=RC.w+'px';rg.style.height=RC.h+'px';rg.style.borderRadius=RC.r+'px';rg.classList.toggle('on',vis);
  gl.style.transform=`translate(${RC.x}px,${RC.y}px)`;gl.style.width=RC.w+'px';gl.style.height=RC.h+'px';gl.style.borderRadius=RC.r+'px';gl.classList.toggle('on',vis);}
 else if(rg){rg.classList.remove('on');gl.classList.remove('on');}requestAnimationFrame(loop);}
/* ---- spatial nav ---- */
function reveal(el,center){let p=el.parentElement;while(p&&p.id!=='stage'){const cs=getComputedStyle(p);const v=/(auto|scroll)/.test(cs.overflowY)&&p.scrollHeight>p.clientHeight,h=/(auto|scroll)/.test(cs.overflowX)&&p.scrollWidth>p.clientWidth;
 if(v||h){const pr=p.getBoundingClientRect(),r=el.getBoundingClientRect(),sc=$('#stage').getBoundingClientRect().width/1920,pad=60*sc;
  if(v){let d=0;if(center)d=(r.top+r.height/2)-(pr.top+pr.height/2);else if(r.top<pr.top+pad)d=r.top-pr.top-pad;else if(r.bottom>pr.bottom-pad)d=r.bottom-pr.bottom+pad;if(d)p.scrollBy({top:d/sc,behavior:center?'auto':'smooth'});}
  if(h){let d=0;if(r.left<pr.left+pad)d=r.left-pr.left-pad;else if(r.right>pr.right-pad)d=r.right-pr.right+pad;if(d)p.scrollBy({left:d/sc,behavior:'smooth'});}}
 p=p.parentElement;}}
function layer(){return $('.pop')||$('#modal')||$('#drawer')||$('#player')||$('#app');}
function focusables(root){return $$('button,input,select,[tabindex="0"]',root||layer()).filter(e=>{if(e.disabled||e.closest('[hidden]'))return false;if(!(root||layer()).contains(e))return false;if(e.closest('#player')&&layer()===$('#app'))return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0;});}
function focusIn(root,sel){const c=focusables(root||layer());const el=sel?$(sel,root||document):null;const t=(el&&c.includes(el)?el:c[0]);if(t){t.focus({preventScroll:true});reveal(t);}}
function move(dir){const list=focusables(layer());const cur=document.activeElement;if(!list.includes(cur)){list[0]&&list[0].focus();return}const r=cur.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let best=null,bs=1e12;
 for(const el of list){if(el===cur)continue;const b=el.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,dx=x-cx,dy=y-cy;let m,c;
  if(dir==='l'){if(b.right>r.left+6)continue;m=-dx;c=Math.abs(dy);if(b.bottom<r.top||b.top>r.bottom)c*=2.5}else if(dir==='r'){if(b.left<r.right-6)continue;m=dx;c=Math.abs(dy);if(b.bottom<r.top||b.top>r.bottom)c*=2.5}
  else if(dir==='u'){if(b.bottom>r.top+6)continue;m=-dy;c=Math.abs(dx);if(b.right<r.left||b.left>r.right)c*=2.5}else{if(b.top<r.bottom-6)continue;m=dy;c=Math.abs(dx);if(b.right<r.left||b.left>r.right)c*=2.5}
  const s=m+c*2;if(s<bs){bs=s;best=el}}
 if(best){best.focus({preventScroll:true});reveal(best);if(best.closest('.hero')){const h=$('#home');h&&h.scrollTo({top:0,behavior:'smooth'});}}}
function back(){if(closePop())return;if(closeModal()){focusIn($('#view'));return}if(closeDrawer())return;if($('#player'))return exitPlayer();
 if(S.screen==='movie-detail')return show('movies');if(S.screen==='series-detail')return show('series');if(S.screen!=='home')return show('home');}
document.addEventListener('keydown',e=>{wake();const k=e.key,ae=document.activeElement;const typing=ae&&ae.tagName==='INPUT';
 if(ae&&ae.id==='seek'&&(k==='ArrowLeft'||k==='ArrowRight')){e.preventDefault();A.seek({dataset:{d:k==='ArrowRight'?10:-10}});return}
 if(k.startsWith('Arrow')){if(typing&&(k==='ArrowLeft'||k==='ArrowRight'))return;if(ae&&ae.tagName==='SELECT'&&(k==='ArrowUp'||k==='ArrowDown'))return;e.preventDefault();move({ArrowLeft:'l',ArrowRight:'r',ArrowUp:'u',ArrowDown:'d'}[k]);return}
 if(k==='Escape'||k==='GoBack'||k==='BrowserBack'||(k==='Backspace'&&!typing)){e.preventDefault();back();return}
 if($('#player')&&$('#player').dataset.kind==='live'&&!$('#drawer')&&!$('.pop')&&(k==='PageUp'||k==='PageDown'||k==='ChannelUp'||k==='ChannelDown')){e.preventDefault();A.zapD({dataset:{d:(k==='PageUp'||k==='ChannelUp')?-1:1}});return}
 if(k===' '&&$('#player')&&$('#player').dataset.kind==='episode'&&!typing){e.preventDefault();A.pp();}});
/* ---- boot ---- */
function resize(){const s=Math.min(innerWidth/1920,innerHeight/1080);$('#stage').style.transform=`translate(${(innerWidth-1920*s)/2}px,${(innerHeight-1080*s)/2}px) scale(${s})`;}
addEventListener('resize',resize);
function boot(){const sw=$('#switcher');NAMES.forEach((n,i)=>{const b=document.createElement('button');b.textContent=(i+1)+'. '+AR[n];b.dataset.s=n;b.onclick=()=>show(n);sw.appendChild(b);});
 const q=new URLSearchParams(location.search);if(q.has('clean'))document.body.classList.add('clean');document.body.dataset.mode=q.get('mode')||'day';S.mode=document.body.dataset.mode;resize();shell();show(q.get('screen')||'home');requestAnimationFrame(loop);}
window.show=show;boot();
})();
