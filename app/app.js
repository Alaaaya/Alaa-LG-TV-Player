(function(){
'use strict';
var $=function(id){return document.getElementById(id);},A=window.AP,P=window.PANEL_PUBLIC;
var state={kind:'live',group:'All',items:[],filtered:[],providers:[],provider:null,page:0,selected:null,playing:null,request:0,status:null,panelBusy:false,episodes:null,expires:null,view:'home',filter:'all',virtualStart:0},pageSize=24,hideTimer;
function status(s){$('status').textContent=s;}
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
function errorMessage(e){return /^(Server HTTP \d+|Response too large|Connection timed out|Network or browser access \(CORS\) blocked|Not an M3U playlist|Invalid panel response|Invalid URL)$/.test(e.message)?e.message:'Could not read playlist. Check provider settings and browser access (CORS).';}
function connection(show){if(show)stopPreview();$('connection').hidden=!show;if(show)$('sync').focus();else focusFirst();}
function focusFirst(){if(state.view==='home'&&$('connection').hidden){$('home-play').focus();return;}var el=$('items').querySelector('button')||document.querySelector('nav button.selected');if(el)el.focus();}
async function sync(){
if(state.panelBusy)return;state.panelBusy=true;$('sync').disabled=true;$('activation').textContent='جارٍ التحقق من التفعيل…';
try{await rpc('register_device',{p_device_code:code,p_mac:'webOS-'+code,p_model:'LG webOS · Alaa Player 1.1.0'});var c=A.config(await rpc('get_device_config',{p_device_code:code}));state.status=c.status;state.expires=c.expires_at;
state.providers=state.providers.filter(function(p){return p.manual;}).concat(c.playlists);
$('activation').textContent=c.status==='active'?'تم التفعيل'+(c.expires_at?' · ينتهي '+new Date(c.expires_at).toLocaleDateString():'')+' · '+c.playlists.length+' قوائم':c.status==='expired'?'انتهى التفعيل. جدّد الجهاز من لوحة التحكم.':'بانتظار تفعيل الجهاز من لوحة التحكم.';
if(c.status!=='active'&&state.provider&&!state.provider.manual){stop();state.items=[];state.provider=null;state.request++;render();}
if(state.provider&&!state.provider.manual){var updated=state.providers.find(function(p){return p.id===state.provider.id;});if(!updated){stop();state.provider=null;state.items=[];state.request++;render();}else if(JSON.stringify(updated)!==JSON.stringify(state.provider)){stop();state.provider=updated;await load();}}
providers();
if(c.status==='active'&&c.playlists.length&&!state.provider){await selectProvider(c.playlists[0].id);connection(false);}
else if(!state.provider){connection(true);}
status(c.status==='active'?'متصل بلوحة التحكم':'Device '+code+' · '+c.status);
}catch(e){$('activation').textContent=errorMessage(e);status('Panel unavailable · '+errorMessage(e));if(!state.provider)connection(true);}
finally{state.panelBusy=false;$('sync').disabled=false;}}
function providers(){var select=$('providers'),old=state.provider&&state.provider.id;select.replaceChildren();state.providers.forEach(function(p){var o=document.createElement('option');o.value=p.id;o.textContent=p.name||'Playlist';select.appendChild(o);});if(old&&state.providers.some(function(p){return p.id===old;}))select.value=old;}
async function xc(p,action,id){return JSON.parse(await request(A.xcAPI(p,action,id),null,24*1024*1024));}
async function selectProvider(id){stopPreview();state.provider=state.providers.find(function(p){return p.id===id;})||null;state.episodes=null;await load();}
async function load(){
var p=state.provider,version=++state.request;state.items=[];state.selected=null;state.group='All';state.page=0;$('search').value='';render();if(!p)return;status('جارٍ تحميل '+(p.name||'القائمة')+'…');
try{var list=[];if(p.type==='m3u'){if(state.kind==='live')list=A.parseM3U(await request(p.url,null,24*1024*1024),p.url);}
else{var mode=state.kind==='live'?'live':state.kind==='movies'?'vod':'series',result=await Promise.all([xc(p,'get_'+mode+'_categories'),xc(p,state.kind==='series'?'get_series':'get_'+mode+'_streams')]);if(!Array.isArray(result[0])||!Array.isArray(result[1]))throw Error('Invalid catalogue');list=A.xcItems(result[1],result[0],p,state.kind);}
if(version!==state.request)return;state.items=list;render();status('تم تحميل '+list.length+' عنوان'+(p.type==='m3u'&&state.kind!=='live'?' · عناصر M3U متاحة ضمن البث المباشر':''));focusFirst();
}catch(e){if(version!==state.request)return;state.items=[];render();status(errorMessage(e));}}
function button(text,fn){var b=document.createElement('button');b.textContent=text;b.onclick=fn;return b;}
function render(){
$('home').hidden=state.view!=='home';$('browser').hidden=state.view==='home';$('browser').className=state.kind==='live'?'live-view':state.episodes?'vod-view episodes-view':'vod-view poster-view';
$('categories').setAttribute('aria-label',state.episodes?'المواسم':'التصنيفات');
$('heading').textContent=state.episodes?'الحلقات':({live:'البث المباشر',movies:'الأفلام',series:'المسلسلات'})[state.kind];
$('search').placeholder='ابحث في '+(state.episodes?'الحلقات':state.kind==='live'?'القنوات':state.kind==='movies'?'الأفلام':'المسلسلات');
document.querySelectorAll('[data-kind]').forEach(function(b){b.classList.toggle('selected',b.dataset.kind===state.kind);});
var groups={All:state.items.length};state.items.forEach(function(i){groups[i.group]=(groups[i.group]||0)+1;});var cat=$('categories');cat.replaceChildren();
Object.keys(groups).forEach(function(g){var b=button((g==='All'?(state.episodes?'كل المواسم':'جميع التصنيفات'):g.replace(/^Season /,'الموسم ')),function(){state.group=g;state.page=0;render();focusFirst();});var n=document.createElement('small');n.textContent=groups[g];b.appendChild(n);b.classList.toggle('selected',g===state.group);cat.appendChild(b);});
renderItems();homeContent();}

function safeList(k){try{var list=JSON.parse(storeRead(k)||'[]');return Array.isArray(list)?list.filter(function(x){return typeof x==='string';}).slice(0,300):[];}catch(e){return [];}}
var favorites=safeList('ap-favorites'),recent=safeList('ap-recent');
function key(item){return (state.provider?state.provider.id:'')+':'+item.kind+':'+item.id;}
function saved(list,item){return list.indexOf(key(item))>=0;}
function setSaved(name,list){storeWrite(name,JSON.stringify(list.slice(0,300)));}
function image(src,cls){var img=document.createElement('img');img.src=src;img.alt='';img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';if(cls)img.className=cls;img.onerror=function(){this.remove();};return img;}
function metadata(item){return [item.year,item.rating?'★ '+item.rating:'',item.quality].filter(Boolean).join('  ·  ');}
function renderItems(){
var q=$('search').value.trim().toLocaleLowerCase();state.filtered=state.items.filter(function(i){return (state.group==='All'||i.group===state.group)&&(!q||i.name.toLocaleLowerCase().indexOf(q)!==-1)&&(state.filter!=='favorites'||saved(favorites,i))&&(state.filter!=='recent'||saved(recent,i));});
$('count').textContent=state.filtered.length+' '+(state.kind==='live'?'قناة':'عنوان')+(state.group==='All'?'':' · '+state.group);
state.virtualStart=0;$('items').scrollTop=0;renderWindow(0);
if(state.filtered.length)select(state.filtered[0]);else select(null);
if(state.kind!=='live'&&state.filtered.length)hero(state.filtered[0]);else $('hero').hidden=true;
}
function renderWindow(start){
var el=$('items'),rowHeight=state.kind==='live'?93:158;var cols=state.kind!=='live'&&!state.episodes?6:1;start=Math.floor(start/cols)*cols;rowHeight=cols===6?310:rowHeight;state.virtualStart=start;el.replaceChildren();
function spacer(height){var d=document.createElement('div');d.className='virtual-space';d.style.height=height+'px';el.appendChild(d);}
spacer(start/cols*rowHeight);
state.filtered.slice(start,start+pageSize).forEach(function(item,index){
var b=button('',function(){select(item);open(item);});b.dataset.index=start+index;b.setAttribute('role','listitem');
var num=document.createElement('span');num.className='number';num.textContent=String(start+index+1).padStart(2,'0');b.appendChild(num);
if(item.logo)b.appendChild(image(item.logo));else{var icon=document.createElement('span');icon.className='item-icon';icon.textContent=item.kind==='live'?'▣':'▶';b.appendChild(icon);}
var stack=document.createElement('div');stack.className='title-stack';var text=document.createElement('div');text.className='item-name';text.textContent=item.name;stack.appendChild(text);
if(item.program){var program=document.createElement('small');program.textContent=item.program;stack.appendChild(program);}
b.appendChild(stack);var meta=document.createElement('span');meta.className=item.kind==='live'?'live':'metadata';meta.textContent=item.kind==='live'?'مباشر':metadata(item);b.appendChild(meta);
b.onfocus=function(){select(item);};el.appendChild(b);
});
spacer(Math.ceil(Math.max(0,state.filtered.length-start-pageSize)/cols)*rowHeight);
if(!state.filtered.length){var empty=document.createElement('p');empty.className='catalog-empty';empty.textContent=!state.provider?'اربط جهازك أو أضف قائمة من الإعدادات':state.provider.type==='m3u'&&state.kind!=='live'?'تظهر عناصر M3U ضمن البث المباشر. استخدم Xtream للأفلام والمسلسلات.':'لا توجد عناصر في هذه القائمة';el.appendChild(empty);}
}
var scrollFrame=false;
$('items').addEventListener('scroll',function(){if(scrollFrame)return;scrollFrame=true;requestAnimationFrame(function(){scrollFrame=false;var cols=state.kind!=='live'&&!state.episodes?6:1,rowHeight=cols===6?310:state.kind==='live'?93:158,start=Math.max(0,Math.floor($('items').scrollTop/rowHeight)-1)*cols;if(start!==state.virtualStart)renderWindow(start);});});
function hero(item){
$('hero').hidden=false;$('hero-name').textContent=item.name;$('hero-meta').textContent=metadata(item)||item.group;
var previous=$('hero').querySelector('img');if(previous)previous.remove();if(item.backdrop)$('hero').prepend(image(item.backdrop));
$('hero-play').onclick=function(){open(item);};
}
function select(item){
if(state.selected!==item)stopPreview();state.selected=item;$('detail-name').textContent=item?item.name:'Alaa IPTV';$('detail-group').textContent=item?item.group:'اختر قناة للمشاهدة';
$('detail-kind').textContent=item?(item.program||'من مكتبتك'):'';$('play-selected').disabled=!item;$('favorite-selected').disabled=!item;$('preview-selected').disabled=!item||item.kind!=='live';
$('play-selected').textContent=item&&item.kind==='series'?'المواسم والحلقات':'شاهد الآن ▶';
$('favorite-selected').textContent=item&&saved(favorites,item)?'♥ إزالة من المفضلة':'♡ أضف للمفضلة';
var cover=$('cover'),old=cover.querySelector('img');if(old)old.remove();var mark=cover.querySelector('span');mark.hidden=!!(item&&item.logo);
if(item&&item.logo)cover.prepend(image(item.logo));
}
function homeContent(){
var item=state.items.find(function(i){return !!i.backdrop;})||state.items[0],old=$('home-hero').querySelector('img');if(old)old.remove();
if(item&&item.backdrop)$('home-hero').prepend(image(item.backdrop));
$('home-title').textContent=item?item.name:'كل ما تحب، في مكان واحد';
$('home-description').textContent=item?item.group:'قنواتك وأفلامك ومسلسلاتك من مزوّدك مباشرة';
$('home-play').onclick=function(){if(item)open(item);else navigate('live');};
var r=$('home-recent');r.replaceChildren();state.items.slice(0,5).forEach(function(i){r.appendChild(button(i.name,function(){open(i);}));});
if(!state.items.length){var p=document.createElement('p');p.className='note';p.textContent='أضف قائمة تشغيل لتظهر مكتبتك هنا';r.appendChild(p);}
}
function navigate(kind,filter){
stopPreview();state.view='catalog';state.filter=filter||'all';state.episodes=null;$('search').value='';
document.querySelectorAll('nav button').forEach(function(b){b.classList.remove('selected');});
if(kind===state.kind){render();focusFirst();}else{state.kind=kind;load();}
}
function stopPreview(){var v=$('preview');v.pause();v.removeAttribute('src');v.replaceChildren();v.load();v.hidden=true;}
async function open(item){
if(item.kind==='series'){var version=++state.request;status('جارٍ تحميل الحلقات…');try{var json=await xc(item.provider,'get_series_info',item.id);if(version!==state.request)return;state.episodes=state.items;state.items=A.episodes(json,item.provider);state.group='All';state.page=0;$('search').value='';render();focusFirst();status('تم تحميل '+state.items.length+' حلقة');}catch(e){status(errorMessage(e));}return;}
play(item);}
var video=$('video'),playTimeout;
$('preview-selected').onclick=function(){if(!state.selected||state.selected.kind!=='live')return;var url=A.safeURL(state.selected.url);if(!url)return;var v=$('preview');stopPreview();var source=document.createElement('source');source.src=url;if(/\.m3u8(?:$|\?)/i.test(url))source.type='application/vnd.apple.mpegurl';else if(/\.ts(?:$|\?)/i.test(url))source.type='video/mp2t';v.appendChild(source);v.hidden=false;v.load();v.play().catch(function(){status('تعذّر تشغيل المعاينة. تحقق من صيغة البث أو المزوّد.');});};
function play(item){stopPreview();var id=key(item);recent=recent.filter(function(k){return k!==id;});recent.unshift(id);setSaved('ap-recent',recent);var url=A.safeURL(item.url);if(!url){status('Unsupported stream URL');return;}stop(false);state.playing=item;$('player').hidden=false;$('quick-channels').hidden=true;quickList();$('playing-name').textContent=item.name;$('play-state').textContent='جارٍ فتح البث…';var source=document.createElement('source');source.src=url;
if(/\.m3u8(?:$|\?)/i.test(url))source.type='application/vnd.apple.mpegurl';else if(/\.ts(?:$|\?)/i.test(url))source.type='video/mp2t';
video.appendChild(source);video.load();video.play().catch(function(){$('play-state').textContent='Press Pause / play to start. If it fails, try another format.';});showControls();$('stop').focus();
playTimeout=setTimeout(function(){if(video.readyState<3)$('play-state').textContent='Still buffering. Provider, CORS or codec may be incompatible.';},20000);
$('seek-back').hidden=$('seek-forward').hidden=item.kind==='live';}
function stop(focus){clearTimeout(playTimeout);clearTimeout(hideTimer);video.pause();video.removeAttribute('src');video.replaceChildren();video.load();state.playing=null;$('player').hidden=true;if(focus!==false)focusFirst();}
function showControls(){clearTimeout(hideTimer);$('player-ui').classList.remove('dim');hideTimer=setTimeout(function(){if(!video.paused&&video.readyState>=3)$('player-ui').classList.add('dim');},6000);}
video.addEventListener('playing',function(){clearTimeout(playTimeout);$('play-state').textContent='قيد التشغيل';showControls();});
video.addEventListener('waiting',function(){$('play-state').textContent='جارٍ التخزين المؤقت…';showControls();});
video.addEventListener('error',function(){if(!state.playing)return;$('play-state').textContent='Cannot play this stream. Native webOS codecs or provider access may be incompatible. Try HLS or MP4.';showControls();});
video.addEventListener('ended',function(){$('play-state').textContent='انتهى التشغيل';showControls();});
function toggle(){if(video.paused)video.play().catch(function(){$('play-state').textContent='Playback could not start';});else video.pause();showControls();}
function seek(delta){if(state.playing&&state.playing.kind!=='live'&&isFinite(video.duration)){video.currentTime=Math.max(0,Math.min(video.duration,video.currentTime+delta));showControls();}}
function back(){if(!$('quick-channels').hidden){$('quick-channels').hidden=true;$('quick-toggle').focus();return;}if(!$('player').hidden){stop();return;}if(!$('manual').hidden){$('manual').hidden=true;$('manual-toggle').focus();return;}if(!$('connection').hidden){connection(false);return;}if(state.episodes){state.items=state.episodes;state.episodes=null;state.group='All';state.page=0;$('search').value='';render();focusFirst();return;}if(state.view!=='home'){state.view='home';state.filter='all';render();$('nav-home').focus();return;}if(window.webOS&&webOS.platformBack)webOS.platformBack();else if(window.PalmSystem&&PalmSystem.stageReady)window.close();else connection(true);}
$('providers').onchange=function(){selectProvider(this.value);};
document.querySelectorAll('[data-kind]').forEach(function(b){b.onclick=function(){navigate(b.dataset.kind);};});
$('search').oninput=function(){state.page=0;renderItems();};
$('settings-open').onclick=function(){connection(true);};
$('connection-close').onclick=function(){connection(false);};
$('sync').onclick=sync;
$('manual-toggle').onclick=function(){$('manual').hidden=!$('manual').hidden;if(!$('manual').hidden)$('manual-type').focus();};
$('manual-type').onchange=function(){$('credentials').hidden=this.value!=='xtream';};
$('manual').onsubmit=async function(e){e.preventDefault();var type=$('manual-type').value,url=A.safeURL($('manual-url').value.trim());if(!url){$('activation').textContent='Enter a valid HTTP or HTTPS URL';return;}if(type==='xtream'&&(!$('manual-user').value||!$('manual-pass').value)){$('activation').textContent='Username and password required';return;}
var p={id:'manual',manual:true,type:type,name:'قائمة مباشرة',url:url,server:url,username:$('manual-user').value,password:$('manual-pass').value};state.providers=state.providers.filter(function(p){return !p.manual;}).concat([p]);state.kind='live';providers();await selectProvider('manual');$('providers').value='manual';$('manual-pass').value='';connection(false);};
$('play-selected').onclick=function(){if(state.selected)open(state.selected);};
$('favorite-selected').onclick=function(){if(!state.selected)return;var k=key(state.selected);if(saved(favorites,state.selected))favorites=favorites.filter(function(x){return x!==k;});else favorites.push(k);setSaved('ap-favorites',favorites);select(state.selected);if(state.filter==='favorites')renderItems();};
$('nav-home').onclick=function(){stopPreview();state.view='home';state.filter='all';render();document.querySelectorAll('nav button').forEach(function(b){b.classList.remove('selected');});this.classList.add('selected');$('home-play').focus();};
$('nav-favorites').onclick=function(){navigate(state.kind,'favorites');};
$('nav-recent').onclick=function(){navigate(state.kind,'recent');};
$('nav-search').onclick=function(){if(state.view==='home')navigate('live');$('search').focus();};
$('top-search').oninput=function(){if(state.view==='home'){state.view='catalog';render();}$('search').value=this.value;renderItems();};
$('filter-all').onclick=function(){state.filter='all';renderItems();};
$('filter-favorites').onclick=function(){state.filter='favorites';renderItems();};
$('filter-recent').onclick=function(){state.filter='recent';renderItems();};
document.querySelectorAll('[data-home-kind]').forEach(function(b){b.onclick=function(){navigate(b.dataset.homeKind);};});
function theme(value){document.body.classList.toggle('blue',value==='blue');$('theme-red').classList.toggle('selected',value!=='blue');$('theme-blue').classList.toggle('selected',value==='blue');storeWrite('ap-theme',value);}
$('theme-red').onclick=function(){theme('red');};$('theme-blue').onclick=function(){theme('blue');};theme(storeRead('ap-theme')||'red');
function quickList(){var list=$('quick-list');list.replaceChildren();if(!state.playing||state.playing.kind!=='live')return;var index=state.filtered.indexOf(state.playing),start=Math.max(0,index-3);state.filtered.slice(start,start+10).forEach(function(i){list.appendChild(button(i.name,function(){play(i);}));});}
$('quick-toggle').onclick=function(){$('quick-channels').hidden=!$('quick-channels').hidden;if(!$('quick-channels').hidden){var first=$('quick-list').querySelector('button');if(first)first.focus();}};
function timestamp(s){if(!isFinite(s))return '--:--';s=Math.floor(s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
video.addEventListener('timeupdate',function(){var valid=video.duration>0&&isFinite(video.duration)&&state.playing&&state.playing.kind!=='live';$('progress').disabled=!valid;$('progress').value=valid?video.currentTime/video.duration*100:0;$('time-progress').textContent=valid?timestamp(video.currentTime)+' / '+timestamp(video.duration):'بث مباشر';});
$('progress').onchange=function(){if(isFinite(video.duration)&&video.duration>0)video.currentTime=video.duration*Number(this.value)/100;};

$('stop').onclick=function(){stop();};$('pause').onclick=toggle;$('retry').onclick=function(){if(state.playing)play(state.playing);};$('seek-back').onclick=function(){seek(-30);};$('seek-forward').onclick=function(){seek(30);};
function focusables(){return Array.from(document.querySelectorAll('button,input,select')).filter(function(el){return !el.disabled&&el.getBoundingClientRect().width&&el.getBoundingClientRect().height&&($('player').hidden?($('connection').hidden?!$('connection').contains(el)&&!$('player').contains(el):$('connection').contains(el)):$('player').contains(el));});}
function move(key){var els=focusables(),current=document.activeElement;if(els.indexOf(current)<0){if(els[0])els[0].focus();return;}
var c=current.getBoundingClientRect(),cx=c.left+c.width/2,cy=c.top+c.height/2,candidates=els.filter(function(el){return el!==current;}).map(function(el){var r=el.getBoundingClientRect(),dx=r.left+r.width/2-cx,dy=r.top+r.height/2-cy;var main=key==='ArrowDown'?dy:key==='ArrowUp'?-dy:key==='ArrowRight'?dx:-dx,cross=key==='ArrowDown'||key==='ArrowUp'?Math.abs(dx):Math.abs(dy);return {el:el,score:main+cross*4,main:main,cross:cross};}).filter(function(x){return x.main>5;}).sort(function(a,b){return a.score-b.score;});
if(candidates.length){candidates[0].el.focus();candidates[0].el.scrollIntoView({block:'nearest',inline:'nearest'});}}
document.addEventListener('keydown',function(e){
var key=e.key;if(e.keyCode===461||key==='Escape'||key==='BrowserBack'){e.preventDefault();back();return;}
if(!key&&e.keyCode)key=({37:'ArrowLeft',38:'ArrowUp',39:'ArrowRight',40:'ArrowDown',13:'Enter'})[e.keyCode];
if(!$('player').hidden){if(e.keyCode===415){video.play().catch(function(){});showControls();e.preventDefault();return;}if(e.keyCode===19){video.pause();showControls();e.preventDefault();return;}if(e.keyCode===413){stop();e.preventDefault();return;}if(e.keyCode===417||e.keyCode===412){seek(e.keyCode===417?30:-30);e.preventDefault();return;}if($('player-ui').classList.contains('dim')){showControls();$('stop').focus();e.preventDefault();return;}showControls();}
if(/^Arrow/.test(key)){
if(state.kind!=='live'&&!state.episodes&&document.activeElement.dataset.index!=null&&(key==='ArrowLeft'||key==='ArrowRight')){var n=Number(document.activeElement.dataset.index)+(key==='ArrowLeft'?1:-1);if(n>=0&&n<state.filtered.length){e.preventDefault();var t=$('items').scrollTop;renderWindow(Math.max(0,n-6));$('items').scrollTop=t;var target=$('items').querySelector('[data-index="'+n+'"]');if(target){target.focus();target.scrollIntoView({block:'nearest'});}return;}}
var current=document.activeElement;if(current&&current.dataset.index!=null&&(key==='ArrowDown'||key==='ArrowUp')){var step=state.kind!=='live'&&!state.episodes?6:1;var index=Number(current.dataset.index)+(key==='ArrowDown'?step:-step);if(index>=0&&index<state.filtered.length){e.preventDefault();var top=$('items').scrollTop;renderWindow(Math.max(0,index-2));$('items').scrollTop=top;var next=$('items').querySelector('[data-index="'+index+'"]');if(next){next.focus();next.scrollIntoView({block:'nearest'});}return;}}
if(document.activeElement.tagName==='SELECT')return;if(document.activeElement.tagName==='INPUT'&&(key==='ArrowLeft'||key==='ArrowRight'))return;e.preventDefault();move(key);}
});
document.addEventListener('visibilitychange',function(){if(document.hidden){stopPreview();if(state.playing)stop(false);}});
render();sync();setInterval(sync,30*60*1000);setInterval(function(){if(state.expires&&Date.parse(state.expires)<=Date.now()&&state.provider&&!state.provider.manual){stop();state.items=[];state.provider=null;state.request++;render();$('activation').textContent='Activation expired. Renew in your panel.';connection(true);}},60000);
})();
