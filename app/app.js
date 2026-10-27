(function(){
'use strict';
var $=function(id){return document.getElementById(id);},A=window.AP,P=window.PANEL_PUBLIC;
var featured=window.APFeatured,featuredWriter=featured.writer(function(cmd){return featured.exec(window,cmd);}),featuredQueue=featured.queue(),catalogEpoch=0,catalogReady=false,homeLoadTask=null;
function resetFeatured(){
catalogEpoch++;catalogReady=false;homeLoadTask=null;
homeCatalog={live:[],movies:[],series:[]};homeLoadState={movies:'idle',series:'idle'};heroIndex=0;
return featuredWriter.clear();
}
function receiveFeatured(params){
if(!featuredQueue.accept(params))return;
flushFeatured();
}
function flushFeatured(){
if(!state||!state.provider)return;
var item=featuredQueue.take(homeCatalog,catalogReady);
if(!item)return;
stop(false);stopPreview();connection(false);
state.kind=item.kind;state.view='catalog';state.filter='all';state.episodes=null;state.items=homeCatalog[item.kind];state.group='All';$('search').value='';
render();open(item);
}
document.addEventListener('webOSLaunch',function(e){receiveFeatured(e.detail);});
document.addEventListener('webOSRelaunch',function(e){receiveFeatured(e.detail);});
try{if(window.PalmSystem)featuredQueue.accept(window.PalmSystem.launchParams);}catch(e){}
var state={kind:'live',group:'All',items:[],filtered:[],providers:[],provider:null,page:0,selected:null,playing:null,request:0,status:null,panelBusy:false,episodes:null,expires:null,view:'home',filter:'all',virtualStart:0},pageSize=24,hideTimer;
var statusTimer;
function status(s){
var el=$('status');clearTimeout(statusTimer);el.textContent=s;
el.hidden=!s||/^(تم تحميل|متصل بلوحة التحكم)/.test(s);
if(!el.hidden)statusTimer=setTimeout(function(){el.hidden=true;},7000);
}
function resize(){var scale=Math.min(innerWidth/1920,innerHeight/1080);$('screen').style.transform='scale('+scale+')';}
addEventListener('resize',resize);resize();
function clock(){$('clock').textContent=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});$('date').textContent=new Date().toLocaleDateString('ar',{weekday:'long',day:'numeric',month:'long',year:'numeric'});}clock();setInterval(clock,60000);
function storeRead(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function storeWrite(k,v){try{localStorage.setItem(k,v);}catch(e){}}
var code=storeRead('ap-webos-code');if(!code||!new RegExp('^['+A.alphabet+']{8}$').test(code)){code=A.deviceCode(window.crypto);storeWrite('ap-webos-code',code);}
$('device-code').textContent=code.slice(0,4)+'-'+code.slice(4);
async function request(url,options,limit){
url=A.safeURL(url);if(!url)throw Error('Invalid URL');
var abort=new AbortController(),timer=setTimeout(function(){abort.abort();},25000);
try{var r=await fetch(url,Object.assign({signal:abort.signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'},options||{}));if(!r.ok)throw Error('Server HTTP '+r.status);
if(Number(r.headers.get('content-length'))>limit)throw Error('Response too large');
var text='';if(r.body&&r.body.getReader){var reader=r.body.getReader(),size=0,decoder=new TextDecoder();while(true){var part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>limit){await reader.cancel();throw Error('Response too large');}text+=decoder.decode(part.value,{stream:true});}text+=decoder.decode();}else{text=await r.text();if(text.length>limit)throw Error('Response too large');}return text;
}catch(e){if(e.name==='AbortError')throw Error('Connection timed out');if(e instanceof TypeError)throw Error('Network or browser access (CORS) blocked');throw e;}finally{clearTimeout(timer);}}
async function rpc(name,body){return JSON.parse(await request(P.base+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:P.anon,Authorization:'Bearer '+P.anon,'Content-Type':'application/json'},body:JSON.stringify(body)},524288));}
function errorMessage(e){
if(/^Server HTTP/.test(e.message))return 'تعذّر الاتصال بالمزوّد. حاول مجدداً أو تحقّق من الاشتراك.';
if(e.message==='Connection timed out')return 'انتهت مهلة الاتصال. حاول مجدداً.';
if(e.message==='Response too large')return 'قائمة المزوّد أكبر من الحد المسموح.';
if(e.message==='Network or browser access (CORS) blocked')return 'تعذّر الوصول للمزوّد. تحقّق من الاتصال وإعدادات الوصول.';
return 'تعذّر قراءة القائمة. تحقّق من بيانات المزوّد والاتصال.';
}
function connection(show){$('settings-open').classList.toggle('selected',show);if(show)stopPreview();$('connection').hidden=!show;if(show)$('sync').focus();else focusFirst();}
function focusFirst(){if(!$('movie-detail').hidden){$('movie-back').focus();return;}if(!$('series-detail').hidden){$('series-back').focus();return;}if(state.view==='home'&&$('connection').hidden){$('home-play').focus();return;}var el=$('items').querySelector('button')||document.querySelector('nav button.selected');if(el)el.focus();}
async function sync(){
if(state.panelBusy)return;state.panelBusy=true;$('sync').disabled=true;$('activation').textContent='جارٍ التحقق من التفعيل…';
try{await rpc('register_device',{p_device_code:code,p_mac:'webOS-'+code,p_model:'LG webOS · Alaa Player 1.2.5'});var c=A.config(await rpc('get_device_config',{p_device_code:code}));state.status=c.status;state.expires=c.expires_at;
state.providers=state.providers.filter(function(p){return p.manual;}).concat(c.playlists);
$('activation').textContent=c.status==='active'?'تم التفعيل'+(c.expires_at?' · ينتهي '+new Date(c.expires_at).toLocaleDateString():'')+' · '+c.playlists.length+' قوائم':c.status==='expired'?'انتهى التفعيل. جدّد الجهاز من لوحة التحكم.':'بانتظار تفعيل الجهاز من لوحة التحكم.';
if(c.status!=='active'&&state.provider&&!state.provider.manual){stop();featuredQueue.clear();resetFeatured();state.items=[];state.provider=null;state.request++;render();}
if(state.provider&&!state.provider.manual){var updated=state.providers.find(function(p){return p.id===state.provider.id;});if(!updated){stop();featuredQueue.clear();resetFeatured();state.provider=null;state.items=[];state.request++;render();}else if(JSON.stringify(updated)!==JSON.stringify(state.provider)){stop();featuredQueue.clear();var cleared=resetFeatured();state.provider=updated;await cleared;await load();}}
providers();
if(c.status==='active'&&c.playlists.length&&!state.provider){await selectProvider(c.playlists[0].id);connection(false);}
else if(!state.provider){connection(true);}
status(c.status==='active'?'متصل بلوحة التحكم':'Device '+code+' · '+c.status);
}catch(e){$('activation').textContent=errorMessage(e);status('Panel unavailable · '+errorMessage(e));if(!state.provider)connection(true);}
finally{state.panelBusy=false;$('sync').disabled=false;}}
function providers(){var select=$('providers'),old=state.provider&&state.provider.id;select.replaceChildren();state.providers.forEach(function(p){var o=document.createElement('option');o.value=p.id;o.textContent=p.name||'Playlist';select.appendChild(o);});if(old&&state.providers.some(function(p){return p.id===old;}))select.value=old;}
async function xc(p,action,id){return JSON.parse(await request(A.xcAPI(p,action,id),null,/get_vod_streams|get_series$/.test(action)?96*1024*1024:24*1024*1024));}
async function xcCatalog(p,kind){
var mode=kind==='movies'?'vod':kind==='live'?'live':'series';
/* Category metadata is optional: a broken category endpoint must not hide usable titles. */
var cats=xc(p,'get_'+mode+'_categories').catch(function(){return [];});
var rows=await xc(p,kind==='series'?'get_series':'get_'+mode+'_streams');
if(!Array.isArray(rows))throw Error('Invalid catalogue');
var groups=await cats;
return A.xcItems(rows,Array.isArray(groups)?groups:[],p,kind);
}
async function selectProvider(id){
if(state.provider)featuredQueue.clear();
var cleared=resetFeatured(),epoch=catalogEpoch;stopPreview();
state.request++;state.items=[];state.selected=null;
state.provider=state.providers.find(function(p){return p.id===id;})||null;state.episodes=null;
await cleared;if(epoch!==catalogEpoch)return;await load();
}
async function load(){
var p=state.provider,version=++state.request;state.items=[];state.selected=null;state.group='All';state.page=0;$('search').value='';render();if(!p)return;status('جارٍ تحميل '+(p.name||'القائمة')+'…');
try{var list=[];if(p.type==='m3u'){if(state.kind==='live')list=A.parseM3U(await request(p.url,null,24*1024*1024),p.url);}
else{list=await xcCatalog(p,state.kind);}
if(version!==state.request)return;state.items=list;homeCatalog[state.kind]=list;if(state.kind!=='live')homeLoadState[state.kind]='ready';render();loadHomeCatalog(p);status('تم تحميل '+list.length+' عنوان'+(p.type==='m3u'&&state.kind!=='live'?' · عناصر M3U متاحة ضمن البث المباشر':''));focusFirst();flushFeatured();
}catch(e){if(version!==state.request)return;state.items=[];if(state.kind!=='live')homeLoadState[state.kind]='error';render();status(errorMessage(e));}}
function button(text,fn){var b=document.createElement('button');b.textContent=text;b.onclick=fn;return b;}
function categoryIcon(name){
var type=name==='All'?'grid':name==='@favorites'?'heart':
/أخبار|اخبار|news|nachricht/i.test(name)?'news':
/رياض|sport|football|كرة/i.test(name)?'sports':
/موسيق|اغاني|أغاني|music|hits/i.test(name)?'music':
/دين|اسلام|إسلام|قرآن|قران|religio|islam|quran/i.test(name)?'religion':
/أفلام|افلام|سينما|movie|film|cinema/i.test(name)?'movies':
/طفل|اطفال|أطفال|kids|child|cartoon/i.test(name)?'kids':
/وثائق|document|nature|طبيع/i.test(name)?'documentary':
/تعليم|مدرس|education|learn|school/i.test(name)?'education':
/اقتصاد|اعمال|أعمال|business|finance/i.test(name)?'business':'tv';
var shapes={
grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
news:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M6 8h12M6 12h5M6 16h5M15 12h3M15 16h3"/>',
sports:'<circle cx="12" cy="12" r="9"/><path d="M12 7l5 4-2 6H9l-2-6zM12 3v4M21 10l-4 1M18 20l-3-3M6 20l3-3M3 10l4 1"/>',
music:'<path d="M10 17V5l10-2v12M10 8l10-2"/><ellipse cx="7" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>',
religion:'<path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12z"/><path d="M17 3v5M14.5 5.5h5"/>',
movies:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4M10 8l5 4-5 4z"/>',
kids:'<circle cx="12" cy="12" r="9"/><path d="M8 14q4 5 8 0M8 8v2M16 8v2"/>',
documentary:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/>',
education:'<path d="M12 5Q7 2 2 5v15q5-3 10 0q5-3 10 0V5q-5-3-10 0v15"/>',
business:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12q9 6 18 0M12 12v5"/>',
heart:'<path d="M12 20L4 12C-2 5 7 0 12 6C17 0 26 5 20 12z"/>',
tv:'<rect x="2" y="6" width="20" height="15" rx="3"/><path d="M7 2l5 4 5-4M8 17h8"/>'};
var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('data-icon',type);svg.innerHTML=shapes[type];return svg;
}
function render(){
$('screen').classList.toggle('home-reference',state.view==='home');
$('nav-home').classList.toggle('selected',state.view==='home');
var movieNav=document.querySelector('nav [data-kind="movies"]');movieNav.lastChild.textContent=state.view==='home'?'الأفلام والمسلسلات':'الأفلام';
$('series-detail').hidden=true;$('movie-detail').hidden=true;
$('home').hidden=state.view!=='home';$('browser').hidden=state.view==='home';$('browser').className=state.kind==='live'?'live-view':state.episodes?'vod-view episodes-view':'vod-view poster-view';
$('categories').setAttribute('aria-label',state.episodes?'المواسم':'التصنيفات');
$('heading').textContent=state.episodes?'الحلقات':({live:'البث المباشر',movies:'الأفلام',series:'المسلسلات'})[state.kind];
$('search').placeholder='ابحث في '+(state.episodes?'الحلقات':state.kind==='live'?'القنوات':state.kind==='movies'?'الأفلام':'المسلسلات');
document.querySelectorAll('[data-kind]').forEach(function(b){b.classList.toggle('selected',state.view!=='home'&&state.filter==='all'&&b.dataset.kind===state.kind);});
$('nav-favorites').classList.toggle('selected',state.view!=='home'&&state.filter==='favorites');$('nav-recent').classList.toggle('selected',state.view!=='home'&&state.filter==='recent');
var groups={All:state.items.length};state.items.forEach(function(i){groups[i.group]=(groups[i.group]||0)+1;});var cat=$('categories');cat.replaceChildren();
orderedGroups(Object.keys(groups)).forEach(function(g){var b=button((g==='All'?(state.episodes?'كل المواسم':'جميع التصنيفات'):g==='@favorites'?'المفضلة':g.replace(/^Season /,'الموسم ')),function(){state.group=g;state.page=0;render();if(state.kind==='live'){var chosen=$('categories').querySelector('button.selected');if(chosen)chosen.focus();}else focusFirst();});if(state.kind==='live')b.dataset.organizeGroup=g;var n=document.createElement('small');n.textContent=g==='@favorites'?state.items.filter(isFavorite).length:groups[g];b.appendChild(n);b.classList.toggle('selected',g===state.group);var icon=document.createElement('span');icon.className='category-symbol';icon.appendChild(categoryIcon(g));b.prepend(icon);cat.appendChild(b);});
renderItems();homeContent();}

function safeList(k){try{var list=JSON.parse(storeRead(k)||'[]');return Array.isArray(list)?list.filter(function(x){return typeof x==='string';}).slice(0,300):[];}catch(e){return [];}}
var favorites=safeList('ap-favorites'),recent=safeList('ap-recent');
/* Remote organization is scoped to the current provider, and never changes provider data. */
var categoryFavorites=safeList('ap-category-favorites'),organizeOrders=readOrders(),organize=null,hold=null;
function readOrders(){try{var o=JSON.parse(storeRead('ap-live-order')||'{}');return o&&typeof o==='object'&&!Array.isArray(o)?o:{};}catch(e){return {};}}
function orderScope(type){return JSON.stringify([state.provider&&state.provider.id||'',type]);}
function groupKey(g){return JSON.stringify([state.provider&&state.provider.id||'',g]);}
function isFavorite(i){return saved(favorites,i)||(i.kind==='live'&&(categoryFavorites.indexOf(groupKey(i.group))>=0||categoryFavorites.indexOf(groupKey('All'))>=0));}
function applyOrder(values,ids,type){
 var list=organizeOrders[orderScope(type)];if(!Array.isArray(list))return values;
 var ranks=new Map();list.forEach(function(id,n){if(typeof id==='string')ranks.set(id,n);});
 return values.map(function(v,n){return {v:v,n:n,r:ranks.has(ids(v))?ranks.get(ids(v)):list.length+n};}).sort(function(a,b){return a.r-b.r||a.n-b.n;}).map(function(x){return x.v;});
}
function orderedGroups(groups){if(state.kind!=='live')return groups;return applyOrder(groups,function(g){return g;},'categories').concat('@favorites');}
function orderedChannels(items){return applyOrder(items,key,'channels');}
function organizationTarget(el){if(!el||state.kind!=='live'||state.view==='home'||!$('player').hidden||!$('connection').hidden)return null;
 if(el.dataset.organizeChannel)return {type:'channels',id:el.dataset.organizeChannel,label:el.querySelector('.item-name').textContent};
 if(el.dataset.organizeGroup&&el.dataset.organizeGroup!=='@favorites')return {type:'categories',id:el.dataset.organizeGroup,label:el.textContent};
 return null;
}
function findOrganizationTarget(t){
 var list=t.type==='channels'?'#items button':'#categories button',attr=t.type==='channels'?'organizeChannel':'organizeGroup';
 return Array.from(document.querySelectorAll(list)).find(function(b){return b.dataset[attr]===t.id;});
}
function focusOrganization(t){if(t.type==='channels'){var n=state.filtered.findIndex(function(i){return key(i)===t.id;});if(n>=0)renderWindow(Math.max(0,n-2));}var el=findOrganizationTarget(t);if(el){el.classList.toggle('moving-item',!!(organize&&organize.mode==='move'));el.focus();el.scrollIntoView({block:'nearest'});}}
function closeOrganization(){var old=organize;organize=null;var panel=$('organize-panel');if(panel)panel.remove();document.querySelectorAll('.moving-item').forEach(function(b){b.classList.remove('moving-item');});if(old)focusOrganization(old.target);}
function showOrganization(t){
 stopPreview();organize={mode:'menu',target:t};var panel=document.createElement('div');panel.id='organize-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','خيارات العنصر');
 var title=document.createElement('p');title.textContent=t.label;panel.appendChild(title);
 var yes=t.type==='channels'?favorites.indexOf(t.id)>=0:categoryFavorites.indexOf(groupKey(t.id))>=0;
 panel.appendChild(button(yes?'إزالة من المفضلة':'إضافة للمفضلة',function(){
 if(t.type==='channels'){favorites=yes?favorites.filter(function(k){return k!==t.id;}):favorites.concat(t.id);setSaved('ap-favorites',favorites);}
 else{var k=groupKey(t.id);categoryFavorites=yes?categoryFavorites.filter(function(x){return x!==k;}):categoryFavorites.concat(k);setSaved('ap-category-favorites',categoryFavorites);}
 closeOrganization();render();focusOrganization(t);
 }));
 var reorder=button('ترتيب',function(){
 organize.mode='move';organize.scope=orderScope(t.type);organize.before=organizeOrders[organize.scope];organize.draft=t.type==='channels'?orderedChannels(state.items).map(key):orderedGroups(Array.from(new Set(['All'].concat(state.items.map(function(i){return i.group;}))))).filter(function(g){return g!=='@favorites';});
 panel.replaceChildren();var note=document.createElement('p');note.textContent='ترتيب · ↑ ↓ للتحريك · OK للتثبيت · رجوع للإلغاء';panel.appendChild(note);panel.classList.add('move-hint');focusOrganization(t);
 });reorder.id='organize-move';panel.appendChild(reorder);$('screen').appendChild(panel);panel.querySelector('button').focus();
}
function reorderStep(delta){
 var t=organize.target,visible=t.type==='channels'?state.filtered.map(key):organize.draft,n=visible.indexOf(t.id),other=visible[n+delta];if(!other)return;
 var a=organize.draft.indexOf(t.id),b=organize.draft.indexOf(other);organize.draft[a]=other;organize.draft[b]=t.id;organizeOrders[organize.scope]=organize.draft.slice();
 render();focusOrganization(t);
}
function finishOrganization(cancel){
 var t=organize.target;if(cancel){if(organize.before===undefined)delete organizeOrders[organize.scope];else organizeOrders[organize.scope]=organize.before;}else storeWrite('ap-live-order',JSON.stringify(organizeOrders));
 closeOrganization();render();focusOrganization(t);
}
document.addEventListener('keydown',function(e){
 var k=({13:'Enter',38:'ArrowUp',40:'ArrowDown',461:'BrowserBack'})[e.keyCode]||e.key,back=e.keyCode===461||k==='Escape'||k==='BrowserBack';
 if(organize){e.preventDefault();e.stopImmediatePropagation();if(k==='Enter'&&hold&&hold.opened)return;
 if(organize.mode==='move'){if(back)finishOrganization(true);else if(k==='Enter'&&!e.repeat)finishOrganization(false);else if(k==='ArrowUp'||k==='ArrowDown')reorderStep(k==='ArrowUp'?-1:1);}
 else if(back)closeOrganization();else if(k==='ArrowUp'||k==='ArrowDown'){var bs=$('organize-panel').querySelectorAll('button');bs[document.activeElement===bs[0]?1:0].focus();}else if(k==='Enter'&&!e.repeat)document.activeElement.click();
 return;}
 if(k!=='Enter')return;var t=organizationTarget(document.activeElement);if(!t)return;
 e.preventDefault();e.stopImmediatePropagation();if(hold)return;
 hold={el:document.activeElement,target:t,opened:false};hold.timer=setTimeout(function(){if(hold){hold.opened=true;showOrganization(hold.target);}},650);
},true);
document.addEventListener('keyup',function(e){if((e.key!=='Enter'&&e.keyCode!==13)||!hold)return;e.preventDefault();e.stopImmediatePropagation();var h=hold;hold=null;clearTimeout(h.timer);if(!h.opened&&h.el.isConnected)h.el.click();},true);
addEventListener('blur',function(){if(hold){clearTimeout(hold.timer);hold=null;}if(organize){if(organize.mode==='move')finishOrganization(true);else closeOrganization();}});

function key(item){return (state.provider?state.provider.id:'')+':'+item.kind+':'+item.id;}
function saved(list,item){return list.indexOf(key(item))>=0;}
function setSaved(name,list){storeWrite(name,JSON.stringify(list.slice(0,300)));}
function channelLogo(item){
var box=document.createElement('span');box.className='channel-logo';
var initials=document.createElement('span');initials.className='logo-initials';initials.textContent=(item.name||'?').trim().split(/\s+/).slice(0,2).map(function(x){return Array.from(x)[0];}).join('').toUpperCase();box.appendChild(initials);
if(item.logo){var img=image(item.logo);img.loading='eager';img.onload=function(){initials.hidden=true;};img.onerror=function(){img.remove();initials.hidden=false;};box.appendChild(img);}
return box;
}
function image(src,cls){var img=document.createElement('img');img.src=src;img.alt='';img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';if(cls)img.className=cls;img.onerror=function(){this.remove();};return img;}
function metadata(item){return [item.year,item.seasons?item.seasons+' مواسم':'',item.episodeCount?item.episodeCount+' حلقات':'',item.rating?'★ '+item.rating:'',item.quality].filter(Boolean).join('  ·  ');}
function renderItems(){
['hd','4k'].forEach(function(f){$('filter-'+f).hidden=!state.items.some(function(i){return (f==='hd'?/\bHD\b|FHD|1080|720/i:/4K|UHD|2160/i).test(i.quality||i.name);});});

['all','favorites','hd','4k'].forEach(function(f){$('filter-'+f).classList.toggle('selected',state.filter===f);});

var q=$('search').value.trim().toLocaleLowerCase();
var live=state.kind==='live';if(live){$('browser').appendChild($('detail'));document.querySelector('.library').insertBefore($('subcategories'),$('hero'));}else if($('detail').parentNode!==$('browser')){$('browser').appendChild($('detail'));}
$('browser').classList.toggle('movie-view',state.kind==='movies'&&!state.episodes);state.filtered=state.items.filter(function(i){return (state.group==='All'||(state.group==='@favorites'?isFavorite(i):i.group===state.group))&&(!q||i.name.toLocaleLowerCase().indexOf(q)!==-1)&&(state.filter!=='favorites'||isFavorite(i))&&(state.filter!=='recent'||saved(recent,i))&&(state.filter!=='hd'||/\bHD\b|FHD|1080|720/i.test(i.quality||i.name))&&(state.filter!=='4k'||/4K|UHD|2160/i.test(i.quality||i.name));});
if(state.kind==='live')state.filtered=orderedChannels(state.filtered);
$('count').textContent=state.filtered.length+' '+(state.kind==='live'?'قناة':'عنوان')+(state.group==='All'?'':' · '+(state.group==='@favorites'?'المفضلة':state.group));
movieDiscovery(q);
seriesControls();
state.virtualStart=0;$('items').scrollTop=0;renderWindow(0);
livePages();
if(state.filtered.length)select(state.filtered[0]);else select(null);
if(state.kind!=='live'&&state.filtered.length)hero(state.filtered[0]);else $('hero').hidden=true;
}
function movieDiscovery(query){
var show=state.kind==='movies'&&!state.episodes&&!query&&state.filter==='all';
$('movie-discovery').hidden=!show;
var genres=$('genre-cards'),shelf=$('movie-shelf');genres.replaceChildren();shelf.replaceChildren();
if(!show)return;
var groups={};state.items.forEach(function(i){if(!groups[i.group])groups[i.group]={count:0,item:i};groups[i.group].count++;});
Object.keys(groups).slice(0,16).forEach(function(g){
var b=button('',function(){state.group=g;render();focusFirst();});
var item=groups[g].item;if(item.backdrop)b.appendChild(image(item.backdrop));
var t=document.createElement('span');t.textContent=g;var n=document.createElement('small');n.textContent=groups[g].count+' فيلم';b.appendChild(t);b.appendChild(n);b.classList.toggle('selected',state.group===g);genres.appendChild(b);
});
state.filtered.slice(0,6).forEach(function(item){
var b=button('',function(){open(item);});if(item.logo)b.appendChild(image(item.logo));else{var ph=document.createElement('span');ph.className='shelf-placeholder';ph.textContent='▶';b.appendChild(ph);}
var t=document.createElement('span');t.textContent=item.name;b.appendChild(t);var m=document.createElement('small');m.textContent=metadata(item);b.appendChild(m);shelf.appendChild(b);
});
$('latest-heading').textContent='جميع الأفلام'+(state.group==='All'?'':' · '+(state.group==='@favorites'?'المفضلة':state.group));
}
function renderWindow(start){
var el=$('items'),rowHeight=state.kind==='live'?93:158;var cols=state.kind!=='live'&&!state.episodes?6:1;start=Math.floor(start/cols)*cols;rowHeight=cols===6?310:rowHeight;state.virtualStart=start;el.replaceChildren();
function spacer(height){var d=document.createElement('div');d.className='virtual-space';d.style.height=height+'px';el.appendChild(d);}
spacer(start/cols*rowHeight);
state.filtered.slice(start,start+pageSize).forEach(function(item,index){
var b=button('',function(){select(item);open(item);});b.dataset.index=start+index;if(item.kind==='live')b.dataset.organizeChannel=key(item);b.setAttribute('role','listitem');
var num=document.createElement('span');num.className='number';num.textContent=String(start+index+1).padStart(2,'0');b.appendChild(num);
if(item.kind==='live')b.appendChild(channelLogo(item));else if(item.logo)b.appendChild(image(item.logo));else{var icon=document.createElement('span');icon.className='item-icon';icon.textContent='▶';b.appendChild(icon);}
var stack=document.createElement('div');stack.className='title-stack';var text=document.createElement('div');text.className='item-name';text.textContent=item.name;stack.appendChild(text);
if(item.program){var program=document.createElement('small');program.textContent=item.program;stack.appendChild(program);}
b.appendChild(stack);
if(item.kind==='series'&&(item.quality||(item.added>0&&Date.now()/1000-item.added>=0&&Date.now()/1000-item.added<2592000))){var badge=document.createElement('b');badge.className='poster-badge';badge.textContent=item.quality||'جديد';b.appendChild(badge);}
var meta=document.createElement('span');meta.className=item.kind==='live'?'live':'metadata';meta.textContent=item.kind==='live'?'مباشر':metadata(item);b.appendChild(meta);
if(item.kind==='live'){var heart=document.createElement('span');heart.className='row-heart';heart.textContent=saved(favorites,item)?'♥':'♡';heart.setAttribute('aria-label','المفضلة');heart.onclick=function(e){e.stopPropagation();var k=key(item);if(saved(favorites,item))favorites=favorites.filter(function(x){return x!==k;});else favorites.push(k);setSaved('ap-favorites',favorites);heart.textContent=saved(favorites,item)?'♥':'♡';select(item);};b.appendChild(heart);}
b.onfocus=function(){select(item);};el.appendChild(b);if(organize&&organize.mode==='move'&&organize.target.type==='channels'&&key(item)===organize.target.id){b.classList.add('moving-item');b.focus();}
});
spacer(Math.ceil(Math.max(0,state.filtered.length-start-pageSize)/cols)*rowHeight);
if(!state.filtered.length){var empty=document.createElement('p');empty.className='catalog-empty';empty.textContent=!state.provider?'اربط جهازك أو أضف قائمة من الإعدادات':state.provider.type==='m3u'&&state.kind!=='live'?'تظهر عناصر M3U ضمن البث المباشر. استخدم Xtream للأفلام والمسلسلات.':state.filter==='favorites'?'لم تضف عناصر للمفضلة بعد':state.filter==='recent'?'لم تشاهد أي عناصر بعد':$('search').value?'لا توجد نتائج مطابقة للبحث':'لا توجد عناصر في هذه القائمة';el.appendChild(empty);}
}
var scrollFrame=false;
$('items').addEventListener('scroll',function(){if(scrollFrame)return;scrollFrame=true;requestAnimationFrame(function(){scrollFrame=false;var cols=state.kind!=='live'&&!state.episodes?6:1,rowHeight=cols===6?310:state.kind==='live'?93:158,start=Math.max(0,Math.floor($('items').scrollTop/rowHeight)-1)*cols;if(start!==state.virtualStart){var focused=$('items').contains(document.activeElement)?document.activeElement.dataset.index:null;if(focused!=null&&Number(focused)>=state.virtualStart&&Number(focused)<state.virtualStart+pageSize)return;renderWindow(start);}});});
function livePages(){$('pagination').replaceChildren();}
function hero(item){
$('hero').hidden=false;$('hero-name').textContent=item.name;$('hero-meta').textContent=metadata(item)||item.group;
var previous=$('hero').querySelector('img');if(previous)previous.remove();if(item.backdrop)$('hero').prepend(image(item.backdrop));
$('hero-play').onclick=function(){open(item);};
}
function select(item){
if(state.selected!==item)stopPreview();state.selected=item;$('detail-quality').textContent=item?item.quality||'':'';$('detail-quality').hidden=!(item&&item.quality);$('detail-name').textContent=item?item.name:'Alaa IPTV';$('detail-group').textContent=item?item.group:'اختر قناة للمشاهدة';
$('detail-kind').textContent=item?(item.program||'من مكتبتك'):'';$('play-selected').disabled=!item;$('favorite-selected').disabled=!item;$('preview-selected').disabled=!item||item.kind!=='live';
$('play-selected').textContent=item&&item.kind==='series'?'المواسم والحلقات':'شاهد الآن ▶';
$('favorite-selected').textContent=item&&saved(favorites,item)?'♥ إزالة من المفضلة':'♡ أضف للمفضلة';
var cover=$('cover'),old=cover.querySelector('img');if(old)old.remove();var mark=cover.querySelector('span');mark.hidden=!!(item&&item.logo);
if(item&&item.logo)cover.prepend(image(item.logo));
}
var homeCatalog={live:[],movies:[],series:[]},homeLoadState={movies:'idle',series:'idle'},heroIndex=0;
async function loadHomeCatalog(p){
if(p.type!=='xtream'){homeLoadState={movies:'unsupported',series:'unsupported'};catalogReady=true;homeContent();flushFeatured();return;}
if(homeLoadTask)return homeLoadTask;
var epoch=catalogEpoch;
var task=(async function(){
await Promise.all(['movies','series'].map(async function(kind){
if(homeLoadState[kind]==='ready')return;
homeLoadState[kind]='loading';homeContent();
try{
var list=await xcCatalog(p,kind);
if(state.provider!==p||epoch!==catalogEpoch)return;
homeCatalog[kind]=list;homeLoadState[kind]='ready';
}catch(e){
if(state.provider!==p||epoch!==catalogEpoch)return;
homeLoadState[kind]='error';
}
if(state.provider===p&&epoch===catalogEpoch)homeContent();
}));
if(state.provider!==p||epoch!==catalogEpoch)return;
catalogReady=true;
featuredWriter.publish(homeCatalog.movies.concat(homeCatalog.series),p);flushFeatured();
})().finally(function(){if(epoch===catalogEpoch)homeLoadTask=null;});
homeLoadTask=task;return task;
}
function homeContent(){
if(!homeCatalog)return;
var candidates=homeCatalog.movies.concat(homeCatalog.series).filter(function(i){return i.backdrop;}).slice(0,6);
if(!candidates.length)candidates=state.items.slice(0,5);
var item=candidates[heroIndex%candidates.length],old=$('home-hero').querySelector('img');if(old)old.remove();
$('home-hero').classList.add('reference-fallback');
var ref=image('assets/reference-hero.jpg');ref.className='reference-hero-art';$('home-hero').prepend(ref);
$('home-title').textContent=item?item.name:'مكتبتك، على شاشتك';
$('home-meta').textContent=item?[metadata(item),item.genre||item.group].filter(Boolean).join(' · '):'';
$('home-description').textContent=item?item.description||'':'أضف قائمة تشغيل لتظهر مكتبتك هنا';
$('home-play').setAttribute('aria-label','استعراض المسلسلات، صورة ترويجية');
$('home-play').onclick=function(){navigate('series');};
$('home-info').disabled=!item;
$('home-info').onclick=function(){if(!item)return;$('home-detail-title').textContent=item.name;$('home-detail-description').textContent=item.description||'لا يوفّر المزوّد وصفاً إضافياً';$('home-details').showModal();$('home-detail-close').focus();};
var dots=$('hero-dots');dots.replaceChildren();candidates.forEach(function(i,n){var d=button('',function(){heroIndex=n;homeContent();});d.setAttribute('aria-label','العرض '+(n+1));d.className=n===heroIndex%candidates.length?'selected':'';dots.appendChild(d);});
$('hero-prev').onclick=function(){heroIndex=(heroIndex+candidates.length-1)%Math.max(1,candidates.length);homeContent();};
$('hero-next').onclick=function(){heroIndex=(heroIndex+1)%Math.max(1,candidates.length);homeContent();};
var tiles=$('home-tiles');tiles.replaceChildren();
[['live','البث المباشر','▣'],['movies','الأفلام','▤'],['series','المسلسلات','▦'],['kids','الأطفال','☆'],['news','الأخبار','◎'],['sports','الرياضة','◉']].forEach(function(t,n){
var pattern={kids:/kids|child|أطفال|اطفال/i,news:/news|أخبار|اخبار/i,sports:/sport|رياض/i}[t[0]],list=pattern?homeCatalog.live.filter(function(i){return pattern.test(i.group);}):homeCatalog[t[0]];
var tile=button('',function(){var kind=pattern?'live':t[0];navigate(kind);if(pattern){var match=homeCatalog.live.find(function(i){return pattern.test(i.group);});state.group=match?match.group:'All';$('search').value=match?'':'__no_matching_category__';renderItems();}});
var art=document.createElement('span');art.className='tile-art';var im=image('assets/reference-category-'+n+'.jpg');art.appendChild(im);tile.appendChild(art);var label=document.createElement('strong');label.textContent=t[1];tile.appendChild(label);var count=document.createElement('small');count.textContent=homeLoadState[t[0]]==='loading'?'جارٍ التحميل…':homeLoadState[t[0]]==='error'?'تعذّر التحميل':homeLoadState[t[0]]==='unsupported'?'غير متاح لقائمة M3U':list.length+' '+(t[0]==='movies'?'فيلم':t[0]==='series'?'مسلسل':'قناة');tile.appendChild(count);tiles.appendChild(tile);
});
['movies','series'].forEach(function(kind){var el=$('home-'+kind);el.replaceChildren();var list=homeCatalog[kind].slice().sort(function(a,b){return b.added-a.added;}).slice(0,kind==='movies'?6:5);
list.forEach(function(i){var card=button('',function(){open(i);});if(i.logo)card.appendChild(image(i.logo));else{var ph=document.createElement('div');ph.className='poster-blank';ph.textContent='▶';card.appendChild(ph);}
var title=document.createElement('span');title.textContent=i.name;card.appendChild(title);
var meta=document.createElement('small');meta.textContent=kind==='series'&&i.seasons?i.seasons+' مواسم':i.year;card.appendChild(meta);
if(i.quality||(i.added>0&&Date.now()/1000-i.added>=0&&Date.now()/1000-i.added<2592000)){var badge=document.createElement('b');badge.textContent=i.quality||'جديد';card.appendChild(badge);}el.appendChild(card);
});if(!list.length){var empty=document.createElement('p');empty.className='note';empty.textContent=homeLoadState[kind]==='error'?'تعذّر تحميل العناوين. تحقّق من اتصال المزوّد وصلاحية الاشتراك.':homeLoadState[kind]==='unsupported'?'هذه قائمة M3U للبث المباشر. أضف حساب Xtream لعرض مكتبة الأفلام والمسلسلات.':homeLoadState[kind]==='ready'?'لم يُرجع المزوّد عناوين لهذا القسم.':'جارٍ تحميل العناوين…';el.appendChild(empty);
if(homeLoadState[kind]==='error'){var retry=button('إعادة المحاولة',function(){loadHomeCatalog(state.provider);});retry.className='catalog-retry';el.appendChild(retry);}}});
}
$('home-detail-close').onclick=function(){$('home-details').close();$('home-info').focus();};
function navigate(kind,filter){
stopPreview();state.view='catalog';state.filter=filter||'all';state.episodes=null;$('search').value='';
document.querySelectorAll('nav button').forEach(function(b){b.classList.remove('selected');});
if(kind===state.kind){render();focusFirst();}else{state.kind=kind;load();}
}
function stopPreview(){var v=$('preview');v.pause();v.removeAttribute('src');v.replaceChildren();v.load();v.hidden=true;}
var movieItem=null;
function showMovie(item){
movieItem=item;stopPreview();$('home').hidden=true;$('browser').hidden=true;$('series-detail').hidden=true;$('movie-detail').hidden=false;
$('movie-title').textContent=item.name;$('movie-meta').textContent=[metadata(item),item.genre,item.duration].filter(Boolean).join(' · ');
$('movie-description').textContent=item.description||'';
['movie-poster','movie-backdrop'].forEach(function(id){$(id).replaceChildren();});
if(item.logo)$('movie-poster').appendChild(image(item.logo));
if(item.backdrop)$('movie-backdrop').appendChild(image(item.backdrop));
var pr=progressFor(item);$('movie-resume').hidden=!(pr&&pr.time>10&&pr.duration-pr.time>10);
$('movie-play').onclick=function(){storeWrite('ap-progress-'+key(item),'null');play(item);};
$('movie-resume').onclick=function(){play(item);};
$('movie-favorite').textContent=saved(favorites,item)?'♥ المفضلة':'♡ المفضلة';
$('movie-favorite').onclick=function(){var k=key(item);favorites=saved(favorites,item)?favorites.filter(function(x){return x!==k;}):favorites.concat(k);setSaved('ap-favorites',favorites);showMovie(item);};
$('movie-back').focus();
}
$('movie-back').onclick=function(){$('movie-detail').hidden=true;navigate('movies');};
async function open(item){
if(item.kind==='movies'){
var token=++state.request;showMovie(Object.assign({},item));
if(item.provider){try{var result=await xc(item.provider,'get_vod_info',item.id);if(token!==state.request||$('movie-detail').hidden)return;var info=result.info||{};var detail=Object.assign({},item);detail.description=info.plot||item.description;detail.genre=info.genre||item.genre;detail.duration=info.duration||'';detail.rating=info.rating||item.rating;detail.year=info.releasedate&&String(info.releasedate).slice(0,4)||item.year;detail.logo=A.safeURL(info.movie_image)||item.logo;detail.backdrop=A.safeURL(Array.isArray(info.backdrop_path)?info.backdrop_path[0]:info.backdrop_path)||item.backdrop;showMovie(detail);}catch(e){/* Catalogue metadata remains usable if optional detail endpoint is unavailable. */}}
return;
}

if(item.kind==='series'){
var version=++state.request;status('جارٍ تحميل الحلقات…');
try{var json=await xc(item.provider,'get_series_info',item.id);if(version!==state.request)return;
state.view='catalog';state.kind='series';seriesItem=Object.assign({},item);var info=json.info||{};
seriesItem.description=info.plot||item.description;seriesItem.genre=info.genre||item.genre;seriesItem.rating=info.rating||item.rating;
seriesItem.status=info.status||'';seriesItem.backdrop=A.safeURL(Array.isArray(info.backdrop_path)?info.backdrop_path[0]:info.backdrop_path)||item.backdrop;
seriesEpisodes=A.episodes(json,item.provider);seriesSeason=seriesEpisodes[0]&&seriesEpisodes[0].season;seriesSelected=null;
$('heading').textContent='الحلقات';showSeries();status('تم تحميل '+seriesEpisodes.length+' حلقة');
}catch(e){status(errorMessage(e));}return;}

play(item);}
var seriesItem=null,seriesEpisodes=[],seriesSeason=null,seriesSelected=null;
function seriesControls(){
var show=state.kind==='series'&&!state.episodes;
$('series-sort').hidden=!show;$('series-chips').hidden=!show;
var chips=$('series-chips');chips.replaceChildren();
if(!show)return;
var mode=$('series-sort').value;
if(mode==='latest')state.filtered.sort(function(a,b){return b.added-a.added;});
if(mode==='rating')state.filtered.sort(function(a,b){return Number(b.rating||0)-Number(a.rating||0);});
if(mode==='name')state.filtered.sort(function(a,b){return a.name.localeCompare(b.name,'ar');});
['All'].concat(Array.from(new Set(state.items.map(function(i){return i.group;})))).slice(0,20).forEach(function(g){var b=button(g==='All'?'الكل':g,function(){state.group=g;renderItems();});b.classList.toggle('selected',state.group===g);chips.appendChild(b);});
}
$('series-sort').onchange=renderItems;
function progressFor(ep){try{return JSON.parse(storeRead('ap-progress-'+key(ep))||'null');}catch(e){return null;}}
function showSeries(){
stopPreview();$('home').hidden=true;$('browser').hidden=true;$('series-detail').hidden=false;
$('series-title').textContent=seriesItem.name;
$('series-meta').textContent=[metadata(seriesItem),seriesItem.genre,seriesItem.status].filter(Boolean).join(' · ');
$('series-description').textContent=seriesItem.description||'';
['series-poster','series-backdrop'].forEach(function(id){$(id).replaceChildren();});
if(seriesItem.logo)$('series-poster').appendChild(image(seriesItem.logo));
if(seriesItem.backdrop)$('series-backdrop').appendChild(image(seriesItem.backdrop));
var tabs=$('season-tabs');tabs.replaceChildren();Array.from(new Set(seriesEpisodes.map(function(e){return e.season;}))).forEach(function(season){var b=button('الموسم '+season,function(){seriesSeason=season;showSeries();});b.classList.toggle('selected',season===seriesSeason);tabs.appendChild(b);});
var list=$('episode-list');list.replaceChildren();
seriesEpisodes.filter(function(e){return e.season===seriesSeason;}).slice(0,150).forEach(function(e){var b=button('',function(){seriesSelected=e;selectEpisode(e);});b.className='episode-row';var title=document.createElement('strong');title.textContent='▷ '+e.name;b.appendChild(title);var meta=document.createElement('small');meta.textContent=[e.date,e.duration].filter(Boolean).join(' · ');b.appendChild(meta);var pr=progressFor(e);if(pr&&pr.duration>0){var bar=document.createElement('progress');bar.max=pr.duration;bar.value=pr.time;b.appendChild(bar);}b.onfocus=function(){seriesSelected=e;selectEpisode(e);};list.appendChild(b);});
selectEpisode(seriesEpisodes.find(function(e){return e.season===seriesSeason;})||null);
var resume=seriesEpisodes.find(function(e){var pr=progressFor(e);return pr&&pr.time>10&&pr.duration-pr.time>10;});
$('series-continue').hidden=!resume;$('series-continue').textContent=resume?'متابعة S'+resume.season+' E'+resume.episode:'';
$('series-continue').onclick=function(){if(resume)play(resume);};
$('series-start').disabled=!seriesEpisodes.length;$('series-start').onclick=function(){if(seriesEpisodes[0]){storeWrite('ap-progress-'+key(seriesEpisodes[0]),'null');play(seriesEpisodes[0]);}};
$('series-favorite').textContent=saved(favorites,seriesItem)?'♥ المفضلة':'♡ المفضلة';
$('series-favorite').onclick=function(){var k=key(seriesItem);favorites=saved(favorites,seriesItem)?favorites.filter(function(x){return x!==k;}):favorites.concat(k);setSaved('ap-favorites',favorites);showSeries();};
var later=safeList('ap-later');$('series-later').textContent=saved(later,seriesItem)?'✓ محفوظة للاحق':'◷ لاحقاً';
$('series-later').onclick=function(){var k=key(seriesItem),l=safeList('ap-later');setSaved('ap-later',saved(l,seriesItem)?l.filter(function(x){return x!==k;}):l.concat(k));showSeries();};
$('series-info').onclick=function(){$('series-description').classList.toggle('expanded');};
$('series-back').focus();
}
function selectEpisode(e){seriesSelected=e;$('episode-title').textContent=e?e.name:'لا توجد حلقات';$('episode-meta').textContent=e?[e.date,e.duration].filter(Boolean).join(' · '):'';$('episode-description').textContent=e?e.description:'';$('episode-play').disabled=!e;$('episode-play').onclick=function(){if(e)play(e);};}
$('series-back').onclick=function(){$('series-detail').hidden=true;render();focusFirst();};
var video=$('video'),playTimeout;
$('preview-selected').onclick=function(){if(!state.selected||state.selected.kind!=='live')return;var url=A.safeURL(state.selected.url);if(!url)return;var v=$('preview');stopPreview();var source=document.createElement('source');source.src=url;if(/\.m3u8(?:$|\?)/i.test(url))source.type='application/vnd.apple.mpegurl';else if(/\.ts(?:$|\?)/i.test(url))source.type='video/mp2t';v.appendChild(source);v.hidden=false;v.load();v.play().catch(function(){status('تعذّر تشغيل المعاينة. تحقق من صيغة البث أو المزوّد.');});};
function play(item){stopPreview();var id=key(item);recent=recent.filter(function(k){return k!==id;});recent.unshift(id);setSaved('ap-recent',recent);var url=A.safeURL(item.url);if(!url){status('رابط البث غير مدعوم');return;}stop(false);state.playing=item;$('player').hidden=false;$('quick-channels').hidden=true;quickList();$('playing-name').textContent=item.name;$('play-state').textContent='جارٍ فتح البث…';var source=document.createElement('source');source.src=url;
if(/\.m3u8(?:$|\?)/i.test(url))source.type='application/vnd.apple.mpegurl';else if(/\.ts(?:$|\?)/i.test(url))source.type='video/mp2t';
video.appendChild(source);video.load();video.play().catch(function(){$('play-state').textContent='اضغط تشغيل للمحاولة مجدداً أو جرّب قناة أخرى.';});showControls();$('stop').focus();
playTimeout=setTimeout(function(){if(video.readyState<3)$('play-state').textContent='البث ما زال قيد التحميل. تحقّق من المزوّد أو جرّب قناة أخرى.';},20000);
$('seek-back').hidden=$('seek-forward').hidden=item.kind==='live';}
function stop(focus){clearTimeout(zapTimer);$('zap-banner').hidden=true;clearTimeout(playTimeout);clearTimeout(hideTimer);video.pause();video.removeAttribute('src');video.replaceChildren();video.load();state.playing=null;$('player').hidden=true;if(focus!==false)focusFirst();}
var zapTimer;
function hideControls(){clearTimeout(hideTimer);$('player-ui').classList.add('dim');}
function zapChannel(delta){
var list=state.filtered.filter(function(i){return i.kind==='live';});
if(!list.length||!state.playing)return;
var index=list.findIndex(function(i){return key(i)===key(state.playing);});
var next=list[(Math.max(0,index)+delta+list.length)%list.length];
play(next);hideControls();
var banner=$('zap-banner');banner.textContent=(list.indexOf(next)+1)+' / '+list.length+' · '+next.name;banner.hidden=false;
clearTimeout(zapTimer);zapTimer=setTimeout(function(){banner.hidden=true;},3000);
}
function showControls(){clearTimeout(hideTimer);$('player-ui').classList.remove('dim');hideTimer=setTimeout(function(){if(!video.paused&&video.readyState>=3)$('player-ui').classList.add('dim');},6000);}
video.addEventListener('playing',function(){clearTimeout(playTimeout);$('play-state').textContent='قيد التشغيل';if($('zap-banner').hidden)showControls();});
video.addEventListener('waiting',function(){$('play-state').textContent='جارٍ التخزين المؤقت…';if($('zap-banner').hidden)showControls();});
video.addEventListener('error',function(){if(!state.playing)return;$('play-state').textContent='تعذّر تشغيل البث. قد تكون صيغة الفيديو غير مدعومة أو المزوّد غير متاح.';showControls();});
video.addEventListener('ended',function(){$('play-state').textContent='انتهى التشغيل';showControls();});
function toggle(){if(video.paused)video.play().catch(function(){$('play-state').textContent='تعذّر بدء التشغيل';});else video.pause();showControls();}
function seek(delta){if(state.playing&&state.playing.kind!=='live'&&isFinite(video.duration)){video.currentTime=Math.max(0,Math.min(video.duration,video.currentTime+delta));showControls();}}
function back(){if(!$('movie-detail').hidden&&$('player').hidden&&$('connection').hidden){++state.request;$('movie-back').click();return;}if($('home-details').open){$('home-details').close();$('home-info').focus();return;}if(!$('quick-channels').hidden){$('quick-channels').hidden=true;hideControls();$('stop').focus();return;}if(!$('player').hidden){stop();return;}if(!$('manual').hidden){$('manual').hidden=true;$('manual-toggle').focus();return;}if(!$('connection').hidden){connection(false);return;}if(!$('series-detail').hidden){$('series-detail').hidden=true;render();focusFirst();return;}if(state.episodes){state.items=state.episodes;state.episodes=null;state.group='All';state.page=0;$('search').value='';render();focusFirst();return;}if(state.view!=='home'){state.view='home';state.filter='all';render();$('nav-home').focus();return;}if(window.webOS&&webOS.platformBack)webOS.platformBack();else if(window.PalmSystem&&PalmSystem.stageReady)window.close();else connection(true);}
$('providers').onchange=function(){selectProvider(this.value);};
document.querySelectorAll('[data-kind]').forEach(function(b){b.onclick=function(){navigate(b.dataset.kind);};});
$('search').oninput=function(){state.page=0;renderItems();};
$('settings-open').onclick=function(){connection(true);};
$('connection-close').onclick=function(){connection(false);};
$('sync').onclick=sync;
$('manual-toggle').onclick=function(){$('manual').hidden=!$('manual').hidden;if(!$('manual').hidden)$('manual-type').focus();};
$('manual-type').onchange=function(){$('credentials').hidden=this.value!=='xtream';};
$('manual').onsubmit=async function(e){e.preventDefault();var type=$('manual-type').value,url=A.safeURL($('manual-url').value.trim());if(!url){$('activation').textContent='أدخل رابط HTTP أو HTTPS صالحاً';return;}if(type==='xtream'&&(!$('manual-user').value||!$('manual-pass').value)){$('activation').textContent='أدخل اسم المستخدم وكلمة المرور';return;}
var p={id:'manual',manual:true,type:type,name:'قائمة مباشرة',url:url,server:url,username:$('manual-user').value,password:$('manual-pass').value};state.providers=state.providers.filter(function(p){return !p.manual;}).concat([p]);state.kind='live';providers();await selectProvider('manual');$('providers').value='manual';$('manual-pass').value='';connection(false);};
$('play-selected').onclick=function(){if(state.selected)open(state.selected);};
$('favorite-selected').onclick=function(){if(!state.selected)return;var k=key(state.selected);if(saved(favorites,state.selected))favorites=favorites.filter(function(x){return x!==k;});else favorites.push(k);setSaved('ap-favorites',favorites);select(state.selected);if(state.filter==='favorites')renderItems();};
$('nav-home').onclick=function(){stopPreview();state.view='home';state.filter='all';render();document.querySelectorAll('nav button').forEach(function(b){b.classList.remove('selected');});this.classList.add('selected');$('home-play').focus();};
$('nav-favorites').onclick=function(){navigate(state.kind,'favorites');};
$('nav-recent').onclick=function(){navigate(state.kind,'recent');};
$('nav-search').onclick=function(){if(state.view==='home')navigate('live');$('search').focus();};
$('filter-all').onclick=function(){state.filter='all';state.page=0;renderItems();};
$('filter-hd').onclick=function(){state.filter='hd';state.page=0;renderItems();};
$('filter-4k').onclick=function(){state.filter='4k';state.page=0;renderItems();};
$('filter-favorites').onclick=function(){state.filter='favorites';renderItems();};
$('filter-recent').onclick=function(){state.filter='recent';renderItems();};
document.querySelectorAll('[data-home-kind]').forEach(function(b){b.onclick=function(){navigate(b.dataset.homeKind);};});
function theme(value){
if(['apple','red','blue'].indexOf(value)<0)value='apple';
document.body.classList.toggle('blue',value==='blue');
document.body.classList.toggle('apple',value==='apple');
['apple','red','blue'].forEach(function(t){$('theme-'+t).classList.toggle('selected',value===t);});
storeWrite('ap-theme',value);
}
$('theme-apple').onclick=function(){theme('apple');};
$('theme-red').onclick=function(){theme('red');};
$('theme-blue').onclick=function(){theme('blue');};
if(!storeRead('ap-red-audit-125')){storeWrite('ap-theme','red');storeWrite('ap-red-audit-125','1');}
theme(storeRead('ap-theme')||'red');
var quickItems=[],quickIndex=0;
function renderQuick(index){
var list=$('quick-list');quickIndex=Math.max(0,Math.min(quickItems.length-1,index));list.replaceChildren();
var start=Math.max(0,Math.min(quickItems.length-24,quickIndex-4));
function space(n){var el=document.createElement('div');el.className='virtual-space';el.style.height=(n*76)+'px';list.appendChild(el);}
space(start);
quickItems.slice(start,start+24).forEach(function(i,n){
var b=button('',function(){play(i);hideControls();});b.dataset.quickIndex=start+n;b.dataset.channelKey=key(i);
b.appendChild(channelLogo(i));var label=document.createElement('span');label.textContent=(start+n+1)+' · '+i.name;b.appendChild(label);
b.classList.toggle('selected',state.playing&&key(i)===key(state.playing));list.appendChild(b);
});
space(Math.max(0,quickItems.length-start-24));
}
function focusQuick(index){
if(!quickItems.length)return;
index=(index+quickItems.length)%quickItems.length;renderQuick(index);
var el=$('quick-list').querySelector('[data-quick-index="'+index+'"]');if(el){el.focus();el.scrollIntoView({block:'nearest'});}
}
function quickList(){
quickItems=state.filtered.filter(function(i){return i.kind==='live';});
quickIndex=Math.max(0,quickItems.findIndex(function(i){return state.playing&&key(i)===key(state.playing);}));
renderQuick(quickIndex);
}
function openChannelList(){
if(!state.playing||state.playing.kind!=='live')return;
hideControls();quickList();$('quick-channels').hidden=false;
focusQuick(quickIndex);
}
$('quick-toggle').onclick=openChannelList;
function timestamp(s){if(!isFinite(s))return '--:--';s=Math.floor(s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
video.addEventListener('loadedmetadata',function(){if(state.playing&&(state.playing.kind==='episodes'||state.playing.kind==='movies')){var p=progressFor(state.playing);if(p&&p.time<video.duration-10)video.currentTime=p.time;}});
var lastProgressSave=0;
video.addEventListener('timeupdate',function(){
if(state.playing&&(state.playing.kind==='episodes'||state.playing.kind==='movies')&&isFinite(video.duration)&&video.duration>0&&Date.now()-lastProgressSave>5000){lastProgressSave=Date.now();storeWrite('ap-progress-'+key(state.playing),JSON.stringify({time:video.currentTime,duration:video.duration}));}
var valid=video.duration>0&&isFinite(video.duration)&&state.playing&&state.playing.kind!=='live';$('progress').disabled=!valid;$('progress').value=valid?video.currentTime/video.duration*100:0;$('time-progress').textContent=valid?timestamp(video.currentTime)+' / '+timestamp(video.duration):'بث مباشر';});
$('progress').onchange=function(){if(isFinite(video.duration)&&video.duration>0)video.currentTime=video.duration*Number(this.value)/100;};

$('stop').onclick=function(){stop();};$('pause').onclick=toggle;$('retry').onclick=function(){if(state.playing)play(state.playing);};$('seek-back').onclick=function(){seek(-30);};$('seek-forward').onclick=function(){seek(30);};
function focusables(){if(!$('movie-detail').hidden&&$('player').hidden&&$('connection').hidden)return Array.from($('movie-detail').querySelectorAll('button')).filter(function(e){return !e.disabled&&e.getBoundingClientRect().width;});if(!$('series-detail').hidden&&$('player').hidden&&$('connection').hidden)return Array.from($('series-detail').querySelectorAll('button')).filter(function(e){return !e.disabled&&e.getBoundingClientRect().width;});return Array.from(document.querySelectorAll('button,input,select')).filter(function(el){return !el.disabled&&el.getBoundingClientRect().width&&el.getBoundingClientRect().height&&getComputedStyle(el).visibility!=='hidden'&&getComputedStyle(el).opacity!=='0'&&el.getBoundingClientRect().right>0&&el.getBoundingClientRect().left<innerWidth&&($('player').hidden?($('connection').hidden?!$('connection').contains(el)&&!$('player').contains(el):$('connection').contains(el)):$('player').contains(el));});}
function move(key){var els=focusables(),current=document.activeElement;if(els.indexOf(current)<0){if(els[0])els[0].focus();return;}
var c=current.getBoundingClientRect(),cx=c.left+c.width/2,cy=c.top+c.height/2,candidates=els.filter(function(el){return el!==current;}).map(function(el){var r=el.getBoundingClientRect(),dx=r.left+r.width/2-cx,dy=r.top+r.height/2-cy;var main=key==='ArrowDown'?dy:key==='ArrowUp'?-dy:key==='ArrowRight'?dx:-dx,cross=key==='ArrowDown'||key==='ArrowUp'?Math.abs(dx):Math.abs(dy);return {el:el,score:main+cross*4,main:main,cross:cross};}).filter(function(x){return x.main>5;}).sort(function(a,b){return a.score-b.score;});
if(candidates.length){candidates[0].el.focus();candidates[0].el.scrollIntoView({block:'nearest',inline:'nearest'});}}
function liveZone(el){
if(document.querySelector('nav').contains(el))return 0;
if($('browser').querySelector('aside').contains(el))return 1;
if($('subcategories').contains(el))return 2;
if($('items').contains(el)||$('browser').querySelector('.library').contains(el))return 3;
if($('detail').contains(el))return 4;
return -1;
}
function liveFocus(zone){
var selectors=['nav button.selected','#categories button.selected','#subcategories button.selected','#items button','#detail button'];
var el=document.querySelector(selectors[zone]);
if(!el)el=document.querySelector(zone===1?'#categories button':selectors[zone]);
if(el&&!el.disabled){el.focus();el.scrollIntoView({block:'nearest',inline:'nearest'});}
}
document.addEventListener('keydown',function(e){
var key=({37:'ArrowLeft',38:'ArrowUp',39:'ArrowRight',40:'ArrowDown',13:'Enter'})[e.keyCode]||e.key;if(e.keyCode===461||key==='Escape'||key==='BrowserBack'){
e.preventDefault();
if(state.view!=='home'&&state.kind==='live'&&$('player').hidden&&$('connection').hidden&&liveZone(document.activeElement)>0){liveFocus(liveZone(document.activeElement)-1);return;}
back();return;}
if(!key&&e.keyCode)key=({37:'ArrowLeft',38:'ArrowUp',39:'ArrowRight',40:'ArrowDown',13:'Enter'})[e.keyCode];
if(!$('player').hidden){
if(!$('quick-channels').hidden){
e.preventDefault();
if(key==='ArrowUp'||key==='ArrowDown')focusQuick(quickIndex+(key==='ArrowDown'?1:-1));
else if(key==='Enter'&&!e.repeat&&document.activeElement.dataset.quickIndex!=null)document.activeElement.click();
return;
}
if(e.keyCode===457){e.preventDefault();showControls();$('pause').focus();return;}
if(state.playing&&state.playing.kind==='live'&&(key==='ArrowUp'||key==='ArrowDown'||[33,34,427,428].indexOf(e.keyCode)>=0)){
e.preventDefault();zapChannel(key==='ArrowUp'||e.keyCode===33||e.keyCode===427?-1:1);return;
}
if(key==='Enter'){e.preventDefault();if(!e.repeat){if(state.playing&&state.playing.kind==='live')openChannelList();else{showControls();$('pause').focus();}}return;}
if(key==='ArrowLeft'||key==='ArrowRight'){
e.preventDefault();if($('player-ui').classList.contains('dim')){showControls();$('pause').focus();return;}if(!$('player-ui').classList.contains('dim')){
var controls=Array.from($('player-ui').querySelectorAll('button')).filter(function(b){return !b.disabled&&b.getBoundingClientRect().height;});
var index=controls.indexOf(document.activeElement),next=Math.max(0,Math.min(controls.length-1,index+(key==='ArrowRight'?1:-1)));if(controls[next])controls[next].focus();showControls();
}return;}
if(key==='ArrowUp'||key==='ArrowDown'){e.preventDefault();return;}
if(e.keyCode===415){video.play().catch(function(){});showControls();e.preventDefault();return;}
if(e.keyCode===19){video.pause();showControls();e.preventDefault();return;}
if(e.keyCode===413){stop();e.preventDefault();return;}
if(e.keyCode===417||e.keyCode===412){seek(e.keyCode===417?30:-30);e.preventDefault();return;}
return;
}
var active=document.activeElement,nav=document.querySelector('nav');
var baseView=$('player').hidden&&$('connection').hidden&&$('movie-detail').hidden&&$('series-detail').hidden&&!$('home-details').open;
if(baseView&&state.view!=='home'&&state.kind==='live'){
var zone=liveZone(active);
if(zone>=0&&(key==='ArrowLeft'||key==='ArrowRight')){
e.preventDefault();liveFocus(Math.max(0,Math.min(4,zone+(key==='ArrowRight'?1:-1))));return;
}
if(zone===1||zone===2||zone===4){
if(key==='ArrowDown'||key==='ArrowUp'){e.preventDefault();var container=zone===1?$('browser').querySelector('aside'):zone===2?$('subcategories'):$('detail');var bs=Array.from(container.querySelectorAll('button,select')).filter(function(b){return !b.disabled&&b.getBoundingClientRect().height;}),idx=bs.indexOf(active)+(key==='ArrowDown'?1:-1);if(bs[idx]){bs[idx].focus();bs[idx].scrollIntoView({block:'nearest'});}return;}
}
}
if(baseView&&nav.contains(active)){
if(key==='Enter'){e.preventDefault();if(!e.repeat)active.click();return;}
if(key==='ArrowRight'){e.preventDefault();focusFirst();return;}
if(key==='ArrowUp'||key==='ArrowDown'){e.preventDefault();var ns=Array.from(nav.querySelectorAll('button')),ni=ns.indexOf(active)+(key==='ArrowDown'?1:-1);if(ns[ni])ns[ni].focus();return;}
if(key==='ArrowLeft'){e.preventDefault();return;}
}
if(baseView&&key==='ArrowLeft'&&active.tagName!=='INPUT'&&active.tagName!=='SELECT'){
e.preventDefault();var selected=nav.querySelector('button.selected')||$('nav-home');selected.focus();return;
}
if(key==='Enter'&&active.tagName==='BUTTON'){e.preventDefault();if(!e.repeat)active.click();return;}
if(/^Arrow/.test(key)){
if(state.kind!=='live'&&!state.episodes&&document.activeElement.dataset.index!=null&&(key==='ArrowLeft'||key==='ArrowRight')){var n=Number(document.activeElement.dataset.index)+(key==='ArrowRight'?1:-1);if(n>=0&&n<state.filtered.length){e.preventDefault();var t=$('items').scrollTop;renderWindow(Math.max(0,n-6));$('items').scrollTop=t;var target=$('items').querySelector('[data-index="'+n+'"]');if(target){target.focus();target.scrollIntoView({block:'nearest'});}return;}}
var current=document.activeElement;if(current&&current.dataset.index!=null&&(key==='ArrowDown'||key==='ArrowUp')){var step=state.kind!=='live'&&!state.episodes?6:1;var index=Number(current.dataset.index)+(key==='ArrowDown'?step:-step);if(state.kind==='live'&&state.filtered.length)index=(index+state.filtered.length)%state.filtered.length;if(index>=0&&index<state.filtered.length){e.preventDefault();var top=$('items').scrollTop;renderWindow(Math.max(0,index-2));$('items').scrollTop=top;var next=$('items').querySelector('[data-index="'+index+'"]');if(next){next.focus();next.scrollIntoView({block:'nearest'});}return;}}
if(document.activeElement.tagName==='SELECT')return;if(document.activeElement.tagName==='INPUT'&&(key==='ArrowLeft'||key==='ArrowRight'))return;e.preventDefault();move(key);}
});
document.addEventListener('visibilitychange',function(){if(document.hidden){stopPreview();if(state.playing)stop(false);}});
render();featuredWriter.clear().then(sync);setInterval(sync,30*60*1000);setInterval(function(){if(state.expires&&Date.parse(state.expires)<=Date.now()&&state.provider&&!state.provider.manual){stop();featuredQueue.clear();resetFeatured();state.items=[];state.provider=null;state.request++;render();$('activation').textContent='انتهى التفعيل. جدّد الجهاز من لوحة التحكم.';connection(true);}},60000);
})();
