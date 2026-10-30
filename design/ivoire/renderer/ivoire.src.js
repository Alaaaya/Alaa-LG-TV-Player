/* Ivoire 2.7 — editorial ivory renderer. Ported from the approved Ivoire mockup (design/ivoire).
   Isolated Shadow DOM, live provider data through the APJamra bridge (app.js). Loaded after red.js. */
(function(){'use strict';
var CSS=/*__CSS__*/'';
/*__ICONS__*/
var I=function(n,c){return '<svg viewBox="0 0 24 24"'+(c?' class="'+c+'"':'')+'>'+(P[n]||'')+'</svg>';};
var host=document.createElement('div');host.id='ivoire-exact';host.style.cssText='position:fixed;inset:0;z-index:2147483000;display:none';
var root=host.attachShadow({mode:'open'});document.body.appendChild(host);
var style=document.createElement('style');style.textContent=CSS;root.appendChild(style);
var stage=document.createElement('div');stage.id='stage';root.appendChild(stage);
var ROMAN=['I','II','III','IV','V','VI','VII','VIII','IX','X'];
var snap=null,screen='',lastKey='',suspended=false,setSec=0,heroIx=0,R={x:0,y:0,w:0,h:0},prevScreen='';
function LS(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function url(u){return String(u||'').replace(/["\\()]/g,'');}
function bridge(){return window.APJamra;}
function nm(t){return String(t==null?'':t).replace(/[\u1D2C-\u1D7F\u00B2\u00B3\u00B9\u2070-\u209F]+/g,'').replace(/#{2,}|[★☆]{2,}/g,'').replace(/\s+/g,' ').trim().replace(/^(4K-AR|4K-TOP|AR-TR-S|AR-SUBS|TOP|AS|AR|4K)\s*[-:|]\s*/i,'').trim()||String(t||'');}
function tidy(x){if(!x)return x;if(Array.isArray(x)){x.forEach(tidy);return x;}if(x.name!=null)x.name=nm(x.name);if(x.seriesName)x.seriesName=nm(x.seriesName);return x;}
function cmd(a,arg){var b=bridge();if(b)b.act(a,arg);lastKey='';update();}
function q(s){return stage.querySelector(s);}
function qa(s){return Array.prototype.slice.call(stage.querySelectorAll(s));}
function hash(s){var h=2166136261;s=String(s||'');for(var i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;}
var PAL=[['#7a2333','#1c1814'],['#a9824a','#2a2016'],['#22355e','#14110e'],['#1f5a4a','#121a16'],['#5a3a52','#18121a']];
function cover(t){var p=PAL[hash(t)%PAL.length];return '<div class="cover" style="background:linear-gradient(160deg,'+p[0]+','+p[1]+')"><span class="ct">'+esc(t)+'</span></div>';}
function art(it){return it&&it.logo?'<img alt="" src="'+esc(it.logo)+'">':cover(it&&it.name);}
function ini(c){return String(c&&c.name||'TV').replace(/^[^A-Za-z\u0600-\u06FF0-9]+/,'').split(/\s+/).slice(0,2).map(function(x){return x[0]||'';}).join('').toUpperCase()||'TV';}
function logo(c){var p=PAL[hash(c&&c.name)%PAL.length];if(c&&c.logo)return '<span class="lg"><img alt="" data-i="'+esc(ini(c))+'" data-c="'+p[0]+'" src="'+esc(c.logo)+'"></span>';var w=ini(c);return '<span class="lg"><span class="lgf" style="background:'+p[0]+'">'+esc(w)+'</span></span>';}
function meta(it){return [it.year,it.genre,it.quality].filter(Boolean);}
function mt(list){return '<span class="mt">'+list.map(function(x){return '<span>'+esc(x)+'</span>';}).join('<i></i>')+'</span>';}
function card(it,key){return '<button class="card f" data-key="'+key+'"><div class="art">'+art(it)+'</div><span class="nm">'+esc(it.name)+'</span>'+mt([it.year,it.rating&&('★ '+it.rating)].filter(Boolean))+'</button>';}
function wide(it,key){var bg=it.backdrop||it.logo;return '<button class="wide f" data-key="'+key+'"><div class="wb">'+(bg?'<img alt="" src="'+esc(bg)+'">':'<div class="wfb" style="background:linear-gradient(160deg,'+PAL[hash(it.name)%PAL.length][0]+',#14110e)"></div>')+'<span class="wp">'+art(it)+'</span></div><div class="wi"><b>'+esc(it.name)+'</b>'+mt([it.year,'مسلسل',it.rating&&('★ '+it.rating)].filter(Boolean))+'</div></button>';}
function kicker(b,t){return '<span class="kicker"><b>'+b+'</b><i></i>'+esc(t)+'</span>';}
/* ---------- shell ---------- */
var TABS=[['home','home','الرئيسية',0],['live','tv','البث المباشر',1],['movies','film','الأفلام',2],['series','series','المسلسلات',3],['settings','gear','الإعدادات',5]];
function tabOf(s){return s==='home'?'home':s.indexOf('live')>=0?'live':s.indexOf('movie')>=0?'movies':s.indexOf('series')>=0?'series':'settings';}
function sidebar(){var cur=tabOf(screen);return '<aside id="top"><div class="mast"><div class="crest"><img alt="" src="assets/ap-mark.png"></div><div class="wm"><b>Alaa Player</b><small>Édition Ivoire</small></div></div><div class="side-rule"><i></i><span>✦</span><i></i></div><nav id="tabs">'+TABS.map(function(t,i){return '<button class="tab f'+(t[0]===cur?' sel':'')+'" data-key="tab-'+t[0]+'" data-nav="'+t[3]+'"><span class="ti">'+I(t[1])+'</span><span class="tl bd">'+t[2]+'</span><em>'+ROMAN[i]+'</em></button>';}).join('')+'</nav><span class="grow"></span><div class="side-tools"><button class="ib f" data-key="tool-search" aria-label="بحث">'+I('search')+'</button><button class="ib f" data-key="tool-fav" aria-label="المفضلة">'+I('heart')+'</button><button class="ib f" data-key="tool-recent" aria-label="المشاهدة مؤخراً">'+I('clock')+'</button></div><div id="clock"><b>'+esc(snap.time||'')+'</b><small>'+esc(snap.date||'')+'</small></div></aside>';}
/* ---------- screens ---------- */
function home(){var h=snap.hero||{},movies=snap.movies||[],series=snap.seriesHome||[],live=snap.liveHome||snap.channels||[];var isS=h.kind==='series';
 return '<section id="home" class="screen scroll"><div class="hero"><div class="hero-copy swap">'+kicker('N° 01',isS?'مسلسل مميز':'فيلم مميز')+'<h1>'+esc(h.name||'مكتبتك، على شاشتك')+'</h1><div class="hero-meta">'+meta(h).concat(h.rating?['★ '+h.rating]:[]).map(function(x){return '<span>'+esc(x)+'</span>';}).join('<span class="dot"></span>')+'</div>'+(h.description?'<p>'+esc(h.description)+'</p>':'<p class="ph">عرض جديد ضمن مكتبتك، بجودة عالية. اختر المشاهدة الآن أو احفظه لوقت لاحق.</p>')+'<div class="hero-actions"><button class="btn pri f" data-key="hero-play">'+I('play','fill')+'<span>شاهد الآن</span></button><button class="btn f" data-key="hero-info">'+I('info')+'<span>التفاصيل</span></button><button class="btn sq f" data-key="hero-fav" aria-label="المفضلة">'+I('heart')+'</button></div></div>'+
 '<div class="hero-poster swap"><div class="arch"><div class="pc">'+art(h)+'</div></div><div class="arch-line"></div><span class="plate">Plate I · '+(isS?'Série':'Cinéma')+'</span></div></div>'+
 '<div class="section"><div class="index rise">'+[['live',1,'البث المباشر',live.length+' قناة',live.slice(0,4)],['movies',2,'الأفلام',movies.length+' فيلم',movies.slice(0,4)],['series',3,'المسلسلات',series.length+' مسلسل',series.slice(0,4)]].map(function(x,j){return '<button class="portal f" data-key="portal-'+x[0]+'" data-nav="'+x[1]+'"><span class="pn">0'+(j+1)+'</span><span class="pt"><b>'+x[2]+'</b><small>'+esc(x[3])+'</small></span><span class="pm">'+x[4].map(function(it,k){return x[0]==='live'?'<span class="pl" style="--q:'+k+'">'+logo(it)+'</span>':'<span class="pp" style="--q:'+k+'">'+art(it)+'</span>';}).join('')+'</span><span class="pa">'+I('arrowL')+'</span></button>';}).join('')+'</div>'+
 (movies.length?'<div class="sec-h"><em>§ 01</em><h2>أحدث الأفلام</h2><span class="rule"></span><button class="lnk f" data-key="all-movies" data-nav="2">عرض الكل</button></div><div class="rail hscroll">'+movies.slice(0,12).map(function(m,i){return card(m,'hm-'+i);}).join('')+'</div>':'')+
 (series.length?'<div class="sec-h"><em>§ 02</em><h2>أحدث المسلسلات</h2><span class="rule"></span><button class="lnk f" data-key="all-series" data-nav="3">عرض الكل</button></div><div class="rail hscroll wides">'+series.slice(0,10).map(function(m,i){return wide(m,'hs-'+i);}).join('')+'</div>':'')+'</div></section>';}
function cats(cls){var cs=snap.categories||[];return '<div class="'+cls+' scroll"><small class="cats-h">الفئات</small>'+cs.map(function(c,i){return '<button class="'+(cls==='glist'?'grp':'sg')+' f'+(c.value===snap.group?' sel':'')+'" data-key="cat-'+i+'"><span class="gt">'+esc(c.name)+'</span></button>';}).join('')+'</div>';}
function search(ph){return '<input class="inp f" id="q" data-key="search" type="search" placeholder="'+ph+'" value="'+esc(snap.search||'')+'">';}
function live(){var list=(snap.channels||[]).slice(0,200),sel=snap.selected&&snap.selected.kind==='live'?snap.selected:list[0]||{};
 return '<section class="screen live"><div class="lib-h"><div>'+kicker('02','Live · '+(snap.channels||[]).length+' قناة')+'<h1>البث المباشر</h1></div><span class="grow"></span>'+search('ابحث في القنوات')+'</div><div class="live-body">'+cats('glist')+
 '<div class="rows scroll">'+(list.length?list.map(function(c,i){return '<button class="row f'+(sel.id===c.id?' sel':'')+'" data-key="ch-'+i+'"><span class="no">'+String(i+1).padStart(2,'0')+'</span>'+logo(c)+'<span class="cn">'+esc(c.name)+'</span><span class="eq"><i></i><i></i><i></i></span><span class="qual">'+esc(c.quality||'HD')+'</span></button>';}).join(''):'<div class="empty">لا توجد قنوات هنا.</div>')+'</div>'+
 '<div class="monitor"><button class="screenbox f" data-key="mon"><div class="sc" style="background-image:'+(sel.backdrop?'url(&quot;'+esc(url(sel.backdrop))+'&quot;)':'linear-gradient(160deg,#2a2016,#0d0b09)')+'"></div><span class="tl"><span class="onair">مباشر</span><span class="hd">'+esc(sel.quality||'HD')+'</span></span><span class="sl">'+logo(sel)+'</span><span class="pb">'+I('play','fill')+'</span></button><div class="mon-info"><small class="lbl">الآن على الهواء</small><h2>'+esc(sel.name||'')+'</h2><p><span>'+esc(sel.group||'')+'</span></p><div class="acts"><button class="btn pri f" data-key="mon-play">'+I('play','fill')+'<span>مشاهدة</span></button><button class="btn f" data-key="mon-fav">'+I('star')+'<span>المفضلة</span></button></div></div></div></div></section>';}
function lib(series){var list=(snap.items||[]).slice(0,120),g=(snap.categories||[]).filter(function(c){return c.value===snap.group;})[0];
 return '<section class="screen lib"><div class="lib-h"><div>'+kicker(series?'04':'03',series?'Séries':'Cinéma')+'<h1>'+(series?'المسلسلات':'الأفلام')+'</h1></div><p class="cnt">'+(snap.items||[]).length+' عنوان · '+esc(g?g.name:'الكل')+'</p><span class="grow"></span>'+search(series?'ابحث في المسلسلات':'ابحث في الأفلام')+'</div><div class="lib-body">'+cats('cats-row')+
 '<div class="gridwrap scroll" id="grid">'+(list.length?'<div class="grid'+(series?' sgrid':'')+' rise">'+list.map(function(m,i){return series?wide(m,'it-'+i):card(m,'it-'+i);}).join('')+'</div>':'<div class="empty">لا توجد نتائج مطابقة.</div>')+'</div></div></section>';}
function facts(list){return '<dl class="facts">'+list.filter(function(x){return x[1];}).map(function(x){return '<div><dt>'+x[0]+'</dt><dd>'+esc(x[1])+'</dd></div>';}).join('')+'</dl>';}
function mdetail(){var m=snap.item||{},rel=(snap.movies||[]).filter(function(x){return x.id!==m.id;}).slice(0,14);
 return '<section class="screen detail scroll"><div class="d-top"><div class="d-copy rise">'+kicker('Cinéma','فيلم')+'<h1>'+esc(m.name)+'</h1>'+facts([['السنة',m.year],['المدة',m.duration],['التقييم',m.rating&&('★ '+m.rating)],['النوع',m.genre],['الجودة',m.quality]])+(m.description?'<p class="ds">'+esc(m.description)+'</p>':'')+
 '<div class="acts"><button class="btn pri f" data-key="d-play">'+I('play','fill')+'<span>تشغيل</span></button><button class="btn f" data-key="d-fav">'+I('heart')+'<span>المفضلة</span></button><button class="btn f" data-key="d-back">'+I('arrowL')+'<span>رجوع</span></button></div></div>'+
 '<button class="d-poster f" data-key="d-poster"><span class="arch">'+art(m)+'</span><span class="arch-line"></span><span class="plate">Plate · '+esc(m.year||'Nouveau')+'</span></button></div>'+
 (rel.length?'<div class="section"><div class="sec-h"><em>§</em><h2>أفلام أخرى</h2><span class="rule"></span><small>'+rel.length+' فيلم</small></div><div class="rail hscroll">'+rel.map(function(r,i){return card(r,'rel-'+i);}).join('')+'</div></div>':'')+'</section>';}
function sdetail(){var s=snap.item||{},eps=snap.episodes||[],season=eps[0]&&eps[0].group||'';
 return '<section class="screen detail scroll"><div class="d-top"><div class="d-copy rise">'+kicker('Série','مسلسل')+'<h1>'+esc(s.name)+'</h1>'+facts([['التقييم',s.rating&&('★ '+s.rating)],['النوع',s.genre],['السنة',s.year],['الحلقات',eps.length?String(eps.length):'']])+(s.description?'<p class="ds">'+esc(s.description)+'</p>':'')+
 '<div class="acts"><button class="btn pri f" data-key="s-start">'+I('play','fill')+'<span>من البداية</span></button><button class="btn f" data-key="s-fav">'+I('heart')+'<span>المفضلة</span></button><button class="btn sq f" data-key="s-later" aria-label="لاحقاً">'+I('clock')+'</button><button class="btn f" data-key="d-back">'+I('arrowL')+'<span>رجوع</span></button></div></div>'+
 '<button class="d-poster f" data-key="s-poster"><span class="arch">'+art(s)+'</span><span class="arch-line"></span><span class="plate">Série</span></button></div>'+
 '<div class="seasons-wrap"><div class="sec-h"><em>§</em><h2>المواسم والحلقات</h2><span class="rule"></span><div class="season-col"><button class="ssn f sel" data-key="season"><em>'+esc(String(season).replace(/\D+/g,'')||'1')+'</em><span>'+esc(season||'الموسم')+' ›</span></button></div></div>'+
 '<div class="eps rise">'+(eps.length?eps.map(function(e,i){return '<button class="ep f" data-key="ep-'+i+'"><span class="en">'+String(i+1).padStart(2,'0')+'</span><span class="th">'+(e.logo||s.backdrop||s.logo?'<img alt="" src="'+esc(e.logo||s.backdrop||s.logo)+'">':'')+'<span class="pl">'+I('play','fill')+'</span></span><span class="ei"><span class="ec">'+esc(e.group||'')+'</span><b class="et">'+esc(e.name)+'</b><small>'+esc(e.description||('الحلقة '+(i+1)))+'</small></span><span class="ed">'+(e.duration?I('clock')+esc(e.duration):'')+'</span></button>';}).join(''):'<div class="empty">جاري تحميل الحلقات…</div>')+'</div></div></section>';}
var THEMES=[['ivoire','Ivoire'],['jamra','جمرة'],['velour','Velour'],['apple','Apple Graphite'],['navy','Navy / Red'],['red','Red / Black'],['blue','Blue'],['aya','Aya'],['alaa','Alaa'],['harak','Harak'],['muse','Muse']];
var ACC=[['rose','Bordeaux','#7a2333'],['teal','Émeraude','#1f5a4a'],['amber','Laiton','#8c6326'],['ice','Marine','#22355e']];
function settings(){var secs=[['palette','المظهر'],['sliders','الوضع والألوان'],['user','الحساب والتفعيل'],['stack','القوائم والتشغيل']];
 return '<section class="screen settings"><div class="set-nav">'+kicker('05','Réglages')+'<h1>الإعدادات</h1>'+secs.map(function(s,i){return '<button class="sn f'+(i===setSec?' sel':'')+'" data-key="sec-'+i+'"><em>'+ROMAN[i]+'</em><span>'+s[1]+'</span>'+I('chevR')+'</button>';}).join('')+'</div><div class="set-body scroll">'+setBody()+'</div></section>';}
function setBody(){var mode=LS('ap-ivoire-mode')||'day',acc=LS('ap-ivoire-accent')||'rose';
 if(setSec===0)return '<div class="glass rise">'+kicker('','Thème')+'<h2>المظهر</h2><p>Ivoire: ورق عاجي، حبر نبيذي ونحاسي، وطابع تحريري فاخر.</p><div class="opts">'+THEMES.map(function(t){return '<button class="opt f'+(t[0]==='ivoire'?' sel':'')+'" data-key="theme-'+t[0]+'">'+esc(t[1])+'</button>';}).join('')+'</div></div>';
 if(setSec===1)return '<div class="glass rise">'+kicker('','Ambiance')+'<h2>الوضع والألوان</h2><p>اختر بين Ivoire النهاري و Nocturne الليلي، ولون الحبر.</p><div class="opts"><button class="opt f'+(mode==='day'?' sel':'')+'" data-key="mode-day">Ivoire · نهاري</button><button class="opt f'+(mode==='night'?' sel':'')+'" data-key="mode-night">Nocturne · ليلي</button></div><div class="opts">'+ACC.map(function(a){return '<button class="opt f'+(a[0]===acc?' sel':'')+'" data-key="acc-'+a[0]+'"><i class="sw" style="background:'+a[2]+'"></i>'+a[1]+'</button>';}).join('')+'</div></div>';
 return '<div class="glass rise">'+kicker('',setSec===2?'Activation':'Listes')+'<h2>'+(setSec===2?'شاشتك، مكتبتك.':'القوائم والتشغيل')+'</h2><p>'+(setSec===2?'رمز التفعيل وتحديث الاتصال وإضافة قائمة مباشرة.':'تحديث القائمة، القوائم المباشرة، وتأثير الزجاج.')+'</p><div class="acts-row"><button class="btn pri f" data-key="native">'+I('sync')+'<span>فتح الإعدادات</span></button></div><p class="note">رمز جهاز webOS مستقل عن Android TV. استخدم القوائم المصرّح لك بمشاهدتها فقط.</p></div>';}
function player(){var p=snap.playing||{},isLive=p.kind==='live',list=screen==='player-live-list';
 if(isLive){var chs=snap.channels||[];return '<section id="player" class="pv"><div class="p-ui'+(snap.controls||list?'':' idle')+'"><div class="sh"></div><div class="p-badge">'+logo(p)+'<div><span class="num">Live</span><h2>'+esc(p.name)+'</h2><p><span class="onair">مباشر</span><span>'+esc(p.group||'')+'</span><span class="tag">'+esc(p.quality||'HD')+'</span></p></div></div><div class="p-clock"><b>'+esc(snap.time||'')+'</b><small>البث المباشر</small></div>'+
  '<div class="dock"><button class="k f" data-key="k-list"><span class="kb">'+I('list')+'</span><span class="kl">القنوات</span></button><span class="sep"></span><button class="k f" data-key="k-prev"><span class="kb">'+I('chevU')+'</span><span class="kl">السابقة</span></button><button class="k f" data-key="k-next"><span class="kb">'+I('chevD')+'</span><span class="kl">التالية</span></button><span class="sep"></span><button class="k f" data-key="k-fav"><span class="kb">'+I('star')+'</span><span class="kl">المفضلة</span></button><button class="k f" data-key="k-q"><span class="kb">'+I('hd')+'</span><span class="kl">الجودة</span></button><button class="k f" data-key="k-back"><span class="kb">'+I('arrowL')+'</span><span class="kl">رجوع</span></button></div></div>'+
  (list?'<div id="drawer"><h2>'+I('list')+'القنوات<small>'+chs.length+' قناة</small></h2><div class="rows scroll">'+chs.slice(0,200).map(function(c,i){return '<button class="row f'+(c.id===p.id?' sel':'')+'" data-key="dch-'+i+'"><span class="no">'+String(i+1).padStart(2,'0')+'</span>'+logo(c)+'<span class="cn">'+esc(c.name)+'</span><span class="eq"><i></i><i></i><i></i></span><span class="qual">'+esc(c.quality||'HD')+'</span></button>';}).join('')+'</div></div>':'')+'</section>';}
 return '<section id="player" class="pv"><div class="p-ui'+(snap.controls?'':' idle')+'"><div class="sh"></div><div class="v-top"><button class="back f" data-key="k-back" aria-label="رجوع">'+I('arrowL')+'</button><div><h2>'+esc(p.seriesName||p.name)+'</h2><p><span class="tag">'+esc(p.kind==='episodes'?(p.group||'حلقة'):'فيلم')+'</span><span>'+esc(p.kind==='episodes'?p.name:(p.genre||''))+'</span></p></div></div>'+
  '<div class="v-center"><button class="k c f" data-key="k-rw"><span class="kb">'+I('back10')+'</span><span class="kl">−10 ثوانٍ</span></button><button class="k c big f" data-key="k-pp"><span class="kb">'+I('pause','fill')+'</span><span class="kl">تشغيل / إيقاف</span></button><button class="k c f" data-key="k-ff"><span class="kb">'+I('fwd10')+'</span><span class="kl">+10 ثوانٍ</span></button></div>'+
  '<div class="v-bottom"><div class="v-time"><span id="t1">'+esc(snap.progress||'')+'</span><span></span></div><div class="seek"><span class="tr"><span class="fl" id="fl" style="width:'+(+snap.percent||0)+'%"></span><span class="kn" id="kn" style="left:'+(+snap.percent||0)+'%"></span></span></div><div class="v-row"><button class="k f" data-key="k-tracks"><span class="kb">'+I('cc')+'</span><span class="kl">الترجمة والصوت</span></button><span class="grow"></span><button class="k f" data-key="k-back2"><span class="kb">'+I('arrowL')+'</span><span class="kl">رجوع</span></button></div></div></div></section>';}
/* ---------- actions ---------- */
function nativeClick(id){var e=document.getElementById(id);if(e)e.click();}
function act(key){var p=key.split('-'),n=+p[p.length-1],s=snap;
 if(key.indexOf('tab-')===0||key.indexOf('portal-')===0||key.indexOf('all-')===0){var el=q('[data-key="'+key+'"]');var nv=+el.dataset.nav;if(nv===5){setSec=0;cmd('nav',5);}else cmd('nav',nv);return;}
 if(key==='tool-fav')return cmd('nav',4);
 if(key==='tool-recent'){nativeClick('nav-recent');lastKey='';return update();}
 if(key==='tool-search'){var i=q('#q');if(i){i.focus();return;}cmd('nav',2);setTimeout(function(){var x=q('#q');if(x)x.focus();},300);return;}
 if(key==='hero-play')return s.hero&&cmd(s.hero.kind==='series'?'open':'play',s.hero);
 if(key==='hero-info')return s.hero&&cmd('open',s.hero);
 if(key==='hero-fav')return s.hero&&cmd('favorite',s.hero);
 if(p[0]==='hm')return cmd('open',s.movies[n]);
 if(p[0]==='hs')return cmd('open',(s.seriesHome||[])[n]);
 if(p[0]==='it')return cmd('open',s.items[n]);
 if(p[0]==='rel'){var rel=(s.movies||[]).filter(function(x){return !s.item||x.id!==s.item.id;});return cmd('open',rel[n]);}
 if(p[0]==='cat')return cmd('category',s.categories[n].value);
 if(p[0]==='ch'||p[0]==='dch')return cmd('channel',s.channels[n]);
 if(key==='mon'||key==='mon-play'){var sel=s.selected&&s.selected.kind==='live'?s.selected:s.channels[0];return sel&&cmd('channel',sel);}
 if(key==='mon-fav'){var sl=s.selected||s.channels[0];return sl&&cmd('favorite',sl);}
 if(key==='d-play'||key==='d-poster')return cmd('play',s.item);
 if(key==='d-fav'||key==='s-fav')return cmd('favorite',s.item);
 if(key==='d-back'||key==='k-back'||key==='k-back2')return cmd('back');
 if(key==='s-start'||key==='s-poster')return cmd('episode',0);
 if(key==='s-later')return cmd('later',s.item);
 if(key==='season')return cmd('season');
 if(p[0]==='ep')return cmd('episode',n);
 if(p[0]==='sec'){setSec=n;lastKey='';update();var f=q('[data-key="sec-'+n+'"]');if(f)f.focus();return;}
 if(p[0]==='theme'){return cmd('theme',p[1]);}
 if(p[0]==='mode'){LS('ap-ivoire-mode',p[1]);applyLook();lastKey='';update();return;}
 if(p[0]==='acc'){LS('ap-ivoire-accent',p[1]);applyLook();lastKey='';update();return;}
 if(key==='native'){suspended=true;cmd('nativeSettings');return;}
 if(key==='k-list')return cmd('list');
 if(key==='k-prev'||key==='k-next'){var chs=s.channels||[],ix=chs.findIndex(function(c){return s.playing&&c.id===s.playing.id;});var nx=chs[(ix+(key==='k-next'?1:-1)+chs.length)%chs.length];return nx&&cmd('channel',nx);}
 if(key==='k-fav')return cmd('favorite',s.playing);
 if(key==='k-q'){suspended=false;return cmd('quality');}
 if(key==='k-pp')return cmd('pause');
 if(key==='k-rw')return cmd('seek',-10);
 if(key==='k-ff')return cmd('seek',10);
 if(key==='k-tracks'){suspended=true;return cmd('controls');}
}
function applyLook(){stage.dataset.mode=LS('ap-ivoire-mode')||'day';stage.dataset.accent=LS('ap-ivoire-accent')||'rose';}
/* ---------- render loop ---------- */
function render(){var html;
 if(screen.indexOf('player')===0)html=player();
 else{var body=screen==='home'?home():screen==='live'?live():screen==='movies'?lib(false):screen==='series'?lib(true):screen==='movie-detail'?mdetail():screen==='series-detail'?sdetail():settings();html=sidebar()+'<div id="view">'+body+'</div>';}
 stage.innerHTML='<div id="bg"><i class="arc a1"></i><i class="arc a2"></i><i class="sunk"></i></div><div id="backdrop"><div class="layer on"></div></div><div id="app">'+html+'</div><div id="ring"><i></i><i></i><i></i><i></i></div><div id="grain"></div>';
 var bgsrc=screen==='home'?snap.hero:screen.indexOf('detail')>0?snap.item:null;var L=q('#backdrop .layer');if(L&&bgsrc&&(bgsrc.backdrop||bgsrc.logo))L.style.backgroundImage='url("'+url(bgsrc.backdrop||bgsrc.logo)+'")';else if(L)L.classList.remove('on');
 qa('[data-key]').forEach(function(e){if(e.tagName!=='INPUT'){e.tabIndex=0;e.onclick=function(){act(e.dataset.key);};}});
 var inp=q('#q');if(inp){inp.oninput=function(){var b=bridge();if(b)b.act('search',inp.value);};}
 qa('img').forEach(function(im){im.onerror=function(){var p=im.parentNode;if(p&&p.classList.contains('lg')){p.innerHTML='<span class="lgf" style="background:'+(im.dataset.c||'#7a2333')+'">'+esc(im.dataset.i||'TV')+'</span>';return;}if(p&&!p.querySelector('.cover')){im.remove();var d=document.createElement('div');d.className='cover';d.style.background='linear-gradient(160deg,#a9824a,#1c1814)';p.insertBefore(d,p.firstChild);}};});
}
function focusables(){return qa('[tabindex="0"],input').filter(function(e){var r=e.getBoundingClientRect();return r.width>0&&r.height>0&&!e.closest('.p-ui.idle');});}
function defaultFocus(){var m={home:'hero-play',live:'ch-0',movies:'it-0',series:'it-0','movie-detail':'d-play','series-detail':'s-start',settings:'sec-'+setSec,'player-live':'k-list','player-live-list':null,'player-series':'k-pp'}[screen];
 if(screen==='player-live-list'){var d=q('#drawer .row.sel')||q('#drawer .row');return d;}
 if(screen==='live'){var s=q('.rows .row.sel');if(s)return s;}
 return (m&&q('[data-key="'+m+'"]'))||q('.cats-row .sel,.glist .sel')||focusables()[0];}
function off(){if(host.style.display!=='none')host.style.display='none';document.body.classList.remove('ivoire-exact-active');}
function update(){var b=bridge();if(!b)return;
 if(document.body.dataset.theme!=='ivoire'){lastKey='';return off();}
 snap=b.snapshot();['items','movies','seriesHome','liveHome','channels','episodes','categories'].forEach(function(k){tidy(snap[k]);});['hero','item','selected','playing'].forEach(function(k){tidy(snap[k]);});
 if(suspended){off();if(snap.nativeOpen)return;suspended=false;lastKey='';}
 if(!snap.ready)return off();
 host.style.display='block';document.body.classList.add('ivoire-exact-active');
 var sc=Math.min(innerWidth/1920,innerHeight/1080);stage.style.transform='translate('+((innerWidth-1920*sc)/2)+'px,'+((innerHeight-1080*sc)/2)+'px) scale('+sc+')';
 var key=JSON.stringify([snap.screen,snap.group,(snap.items||[]).length,(snap.items||[]).slice(0,120).map(function(i){return i.id;}),snap.hero&&snap.hero.id,snap.item&&snap.item.id,(snap.channels||[]).length,(snap.channels||[]).slice(0,4).map(function(i){return i.id;}),(snap.episodes||[]).map(function(e){return e.id;}),snap.selected&&snap.selected.id,snap.playing&&snap.playing.id,(snap.movies||[]).length,(snap.seriesHome||[]).length,snap.categories&&snap.categories.length,snap.screen.indexOf('player')===0?!!snap.controls:0]);
 if(key!==lastKey){var a=root.activeElement,fk=a&&a.dataset?a.dataset.key:'',st=a&&a.tagName==='INPUT'?a.value:null;var old=screen;screen=snap.screen;
  var scrolls={};qa('.scroll,.hscroll').forEach(function(e,i){scrolls[i]=[e.scrollTop,e.scrollLeft];});
  stage.classList.toggle('playing',screen.indexOf('player')===0);render();lastKey=key;
  if(old===screen)qa('.scroll,.hscroll').forEach(function(e,i){if(scrolls[i]){e.scrollTop=scrolls[i][0];e.scrollLeft=scrolls[i][1];}});
  var f=old===screen&&fk?q('[data-key="'+fk+'"]'):null;f=f||defaultFocus();if(f){f.focus({preventScroll:old===screen});if(f.tagName==='INPUT'&&st!=null){var v=f.value;f.value='';f.value=v;}if(old!==screen)reveal(f);snapRing(f);}
 } else if(screen.indexOf('player')===0){var t=q('#t1');if(t)t.textContent=snap.progress||'';var fl=q('#fl'),kn=q('#kn');if(fl){fl.style.width=(+snap.percent||0)+'%';kn.style.left=(+snap.percent||0)+'%';}var c=q('.p-clock b');if(c)c.textContent=snap.time||'';}
 else{var cb=q('#clock b');if(cb)cb.textContent=snap.time||'';}
}
function reveal(el){var p=el.parentElement;while(p&&p!==stage){var cs=getComputedStyle(p);if(/(auto|scroll)/.test(cs.overflowY+cs.overflowX)){var r=el.getBoundingClientRect(),pr=p.getBoundingClientRect(),sc=pr.width/p.offsetWidth||1;if(/(auto|scroll)/.test(cs.overflowY)){if(r.top<pr.top+40)p.scrollTop-=(pr.top+40-r.top)/sc;else if(r.bottom>pr.bottom-40)p.scrollTop+=(r.bottom-pr.bottom+40)/sc;}if(/(auto|scroll)/.test(cs.overflowX)){if(r.left<pr.left+30)p.scrollLeft-=(pr.left+30-r.left)/sc;else if(r.right>pr.right-30)p.scrollLeft+=(r.right-pr.right+30)/sc;}}p=p.parentElement;}}
function move(k){var a=root.activeElement,bs=focusables();if(!a||bs.indexOf(a)<0){var d=defaultFocus();if(d){d.focus();reveal(d);}return;}
 var b=a.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,best=null,score=Infinity;
 bs.forEach(function(e){if(e===a)return;var r=e.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=cx-x,dy=cy-y;var pri=k==='ArrowLeft'?-dx:k==='ArrowRight'?dx:k==='ArrowUp'?-dy:dy;
  var overlap=k==='ArrowLeft'||k==='ArrowRight'?Math.max(0,Math.min(r.bottom,b.bottom)-Math.max(r.top,b.top)):Math.max(0,Math.min(r.right,b.right)-Math.max(r.left,b.left));
  var oth=k==='ArrowLeft'||k==='ArrowRight'?Math.abs(dy):Math.abs(dx);if(pri>4){var s=pri+oth*(overlap>0?.6:3);if(s<score){score=s;best=e;}}});
 if(best){best.focus({preventScroll:true});reveal(best);}}
window.addEventListener('keydown',function(e){if(host.style.display==='none')return;var k=e.key||'',back=k==='Escape'||k==='Backspace'&&!(root.activeElement&&root.activeElement.tagName==='INPUT')||k==='BrowserBack'||e.keyCode===461||k==='GoBack';
 if(!back&&!/^Arrow/.test(k)&&k!=='Enter')return;var a=root.activeElement;
 if(a&&a.tagName==='INPUT'&&!back&&(k==='ArrowLeft'||k==='ArrowRight'))return;
 e.preventDefault();e.stopImmediatePropagation();var b=bridge();if(b)b.act('wake');
 if(screen.indexOf('player')===0&&!snap.controls&&!back&&screen!=='player-live-list'){lastKey='';update();return;}
 if(back){cmd('back');return;}
 if(k==='Enter'){if(a&&!e.repeat&&a.tagName!=='INPUT')a.click();return;}
 move(k);},true);
root.addEventListener('focusin',function(e){var t=e.target;if(screen==='live'&&t.dataset&&/^ch-/.test(t.dataset.key||'')){}});
function snapRing(f){var r=f.getBoundingClientRect(),sc=Math.min(innerWidth/1920,innerHeight/1080),st=stage.getBoundingClientRect();R.x=(r.left-st.left)/sc;R.y=(r.top-st.top)/sc;R.w=r.width/sc;R.h=r.height/sc;}
function ring(){var f=root.activeElement,rg=q('#ring');if(rg){if(f&&f!==document.body&&stage.contains(f)&&!f.closest('.p-ui.idle')){var r=f.getBoundingClientRect(),st=stage.getBoundingClientRect(),sc=st.width/1920||1,k=.28;var tx=(r.left-st.left)/sc-8,ty=(r.top-st.top)/sc-8,tw=r.width/sc+16,th=r.height/sc+16;R.x+=(tx-R.x)*k;R.y+=(ty-R.y)*k;R.w+=(tw-R.w)*k;R.h+=(th-R.h)*k;rg.style.cssText='left:'+R.x+'px;top:'+R.y+'px;width:'+R.w+'px;height:'+R.h+'px;border-radius:'+(f.classList.contains('k')||f.classList.contains('ib')||f.classList.contains('back')?'50%':'14px');rg.classList.add('on');}else rg.classList.remove('on');}requestAnimationFrame(ring);}
applyLook();requestAnimationFrame(ring);setInterval(update,200);addEventListener('resize',function(){lastKey='';update();});update();
window.APIvoire={update:update,screen:function(){return screen;}};
})();
