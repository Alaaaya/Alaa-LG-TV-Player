(function(){
'use strict';
var $=function(id){return document.getElementById(id);},A=window.AP,P=window.PANEL_PUBLIC;
var state={kind:'live',group:'All',items:[],filtered:[],providers:[],provider:null,page:0,selected:null,playing:null,request:0,status:null,panelBusy:false,episodes:null,expires:null},pageSize=75,hideTimer;
function status(s){$('status').textContent=s;}
function resize(){var scale=Math.min(innerWidth/1920,innerHeight/1080);$('screen').style.transform='scale('+scale+')';}
addEventListener('resize',resize);resize();
function clock(){$('clock').textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}clock();setInterval(clock,60000);
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
function connection(show){$('connection').hidden=!show;if(show)$('sync').focus();else focusFirst();}
function focusFirst(){var el=$('items').querySelector('button')||document.querySelector('nav button.selected');if(el)el.focus();}
async function sync(){
if(state.panelBusy)return;state.panelBusy=true;$('sync').disabled=true;$('activation').textContent='Checking activation…';
try{await rpc('register_device',{p_device_code:code,p_mac:'webOS-'+code,p_model:'LG webOS · Alaa Player 1.0.0'});var c=A.config(await rpc('get_device_config',{p_device_code:code}));state.status=c.status;state.expires=c.expires_at;
state.providers=state.providers.filter(function(p){return p.manual;}).concat(c.playlists);
$('activation').textContent=c.status==='active'?'Activated'+(c.expires_at?' · Expires '+new Date(c.expires_at).toLocaleDateString():'')+' · '+c.playlists.length+' playlists':c.status==='expired'?'Activation expired. Renew this device in the panel.':'Waiting for activation in your panel.';
if(c.status!=='active'&&state.provider&&!state.provider.manual){stop();state.items=[];state.provider=null;state.request++;render();}
if(state.provider&&!state.provider.manual){var updated=state.providers.find(function(p){return p.id===state.provider.id;});if(!updated){stop();state.provider=null;state.items=[];state.request++;render();}else if(JSON.stringify(updated)!==JSON.stringify(state.provider)){stop();state.provider=updated;await load();}}
providers();
if(c.status==='active'&&c.playlists.length&&!state.provider){await selectProvider(c.playlists[0].id);connection(false);}
else if(!state.provider){connection(true);}
status(c.status==='active'?'Panel connected':'Device '+code+' · '+c.status);
}catch(e){$('activation').textContent=errorMessage(e);status('Panel unavailable · '+errorMessage(e));if(!state.provider)connection(true);}
finally{state.panelBusy=false;$('sync').disabled=false;}}
function providers(){var select=$('providers'),old=state.provider&&state.provider.id;select.replaceChildren();state.providers.forEach(function(p){var o=document.createElement('option');o.value=p.id;o.textContent=p.name||'Playlist';select.appendChild(o);});if(old&&state.providers.some(function(p){return p.id===old;}))select.value=old;}
async function xc(p,action,id){return JSON.parse(await request(A.xcAPI(p,action,id),null,24*1024*1024));}
async function selectProvider(id){state.provider=state.providers.find(function(p){return p.id===id;})||null;state.episodes=null;await load();}
async function load(){
var p=state.provider,version=++state.request;state.items=[];state.selected=null;state.group='All';state.page=0;$('search').value='';render();if(!p)return;status('Loading '+(p.name||'playlist')+'…');
try{var list=[];if(p.type==='m3u'){if(state.kind==='live')list=A.parseM3U(await request(p.url,null,24*1024*1024),p.url);}
else{var mode=state.kind==='live'?'live':state.kind==='movies'?'vod':'series',result=await Promise.all([xc(p,'get_'+mode+'_categories'),xc(p,state.kind==='series'?'get_series':'get_'+mode+'_streams')]);if(!Array.isArray(result[0])||!Array.isArray(result[1]))throw Error('Invalid catalogue');list=A.xcItems(result[1],result[0],p,state.kind);}
if(version!==state.request)return;state.items=list;render();status(list.length+' titles loaded'+(p.type==='m3u'&&state.kind!=='live'?' · M3U entries are available under Live TV':''));focusFirst();
}catch(e){if(version!==state.request)return;state.items=[];render();status(errorMessage(e));}}
function button(text,fn){var b=document.createElement('button');b.textContent=text;b.onclick=fn;return b;}
function render(){
$('heading').textContent=state.episodes?'Episodes':({live:'Live TV',movies:'Movies',series:'Series'})[state.kind];
$('search').placeholder='Search '+(state.episodes?'episodes':state.kind==='live'?'channels':state.kind);
document.querySelectorAll('[data-kind]').forEach(function(b){b.classList.toggle('selected',b.dataset.kind===state.kind);});
var groups={All:state.items.length};state.items.forEach(function(i){groups[i.group]=(groups[i.group]||0)+1;});var cat=$('categories');cat.replaceChildren();
Object.keys(groups).forEach(function(g){var b=button(g,function(){state.group=g;state.page=0;render();focusFirst();});var n=document.createElement('small');n.textContent=groups[g];b.appendChild(n);b.classList.toggle('selected',g===state.group);cat.appendChild(b);});
renderItems();}
function renderItems(){
var q=$('search').value.trim().toLocaleLowerCase();state.filtered=state.items.filter(function(i){return (state.group==='All'||i.group===state.group)&&(!q||i.name.toLocaleLowerCase().indexOf(q)!==-1);});
var total=state.filtered.length,start=state.page*pageSize;if(start>=total){state.page=0;start=0;}
$('count').textContent=total+' '+(state.kind==='live'?'channels':'titles')+(state.group==='All'?'':' · '+state.group);
var el=$('items');el.replaceChildren();
state.filtered.slice(start,start+pageSize).forEach(function(item,index){var b=button('',function(){select(item);open(item);});b.setAttribute('role','listitem');var num=document.createElement('span');num.className='number';num.textContent=String(start+index+1).padStart(2,'0');b.appendChild(num);
if(item.logo){var img=document.createElement('img');img.src=item.logo;img.alt='';img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=function(){this.remove();};b.appendChild(img);}
var text=document.createElement('span');text.className='item-name';text.textContent=item.name;b.appendChild(text);
if(item.kind==='live'){var live=document.createElement('span');live.className='live';live.textContent='LIVE';b.appendChild(live);}
b.onfocus=function(){select(item);};el.appendChild(b);});
if(!total){var empty=document.createElement('p');empty.className='note';empty.textContent=!state.provider?'Connect your panel or open a playlist in Connection.':state.provider.type==='m3u'&&state.kind!=='live'?'M3U entries are listed in Live TV. Use Xtream for a movie and series catalogue.':'No titles in this selection.';el.appendChild(empty);}
var pages=Math.max(1,Math.ceil(total/pageSize)),pag=$('pagination');pag.replaceChildren();if(pages>1){var prev=button('Previous',function(){state.page--;renderItems();focusFirst();});prev.disabled=state.page===0;pag.appendChild(prev);var label=document.createElement('span');label.textContent=(state.page+1)+' / '+pages;pag.appendChild(label);var next=button('Next',function(){state.page++;renderItems();focusFirst();});next.disabled=state.page+1>=pages;pag.appendChild(next);}
if(state.filtered.length)select(state.filtered[start]);else select(null);}
function select(item){state.selected=item;$('detail-name').textContent=item?item.name:'Alaa Player';$('detail-group').textContent=item?item.group:'Your channels. Your screen.';$('detail-kind').textContent=item?item.kind.toUpperCase():'YOUR ENTERTAINMENT';$('play-selected').disabled=!item;$('play-selected').textContent=item&&item.kind==='series'?'Show episodes':'Play';var cover=$('cover');cover.replaceChildren();if(item&&item.logo){var img=document.createElement('img');img.src=item.logo;img.alt='';img.referrerPolicy='no-referrer';img.onerror=function(){this.remove();};cover.appendChild(img);}else{var mark=document.createElement('span');mark.textContent='AP';cover.appendChild(mark);}}
async function open(item){
if(item.kind==='series'){var version=++state.request;status('Loading episodes…');try{var json=await xc(item.provider,'get_series_info',item.id);if(version!==state.request)return;state.episodes=state.items;state.items=A.episodes(json,item.provider);state.group='All';state.page=0;$('search').value='';render();focusFirst();status(state.items.length+' episodes');}catch(e){status(errorMessage(e));}return;}
play(item);}
var video=$('video'),playTimeout;
function play(item){var url=A.safeURL(item.url);if(!url){status('Unsupported stream URL');return;}stop(false);state.playing=item;$('player').hidden=false;$('playing-name').textContent=item.name;$('play-state').textContent='Opening stream…';var source=document.createElement('source');source.src=url;
if(/\.m3u8(?:$|\?)/i.test(url))source.type='application/vnd.apple.mpegurl';else if(/\.ts(?:$|\?)/i.test(url))source.type='video/mp2t';
video.appendChild(source);video.load();video.play().catch(function(){$('play-state').textContent='Press Pause / play to start. If it fails, try another format.';});showControls();$('stop').focus();
playTimeout=setTimeout(function(){if(video.readyState<3)$('play-state').textContent='Still buffering. Provider, CORS or codec may be incompatible.';},20000);
$('seek-back').hidden=$('seek-forward').hidden=item.kind==='live';}
function stop(focus){clearTimeout(playTimeout);clearTimeout(hideTimer);video.pause();video.removeAttribute('src');video.replaceChildren();video.load();state.playing=null;$('player').hidden=true;if(focus!==false)focusFirst();}
function showControls(){clearTimeout(hideTimer);$('player-ui').classList.remove('dim');hideTimer=setTimeout(function(){if(!video.paused&&video.readyState>=3)$('player-ui').classList.add('dim');},6000);}
video.addEventListener('playing',function(){clearTimeout(playTimeout);$('play-state').textContent='Playing';showControls();});
video.addEventListener('waiting',function(){$('play-state').textContent='Buffering…';showControls();});
video.addEventListener('error',function(){if(!state.playing)return;$('play-state').textContent='Cannot play this stream. Native webOS codecs or provider access may be incompatible. Try HLS or MP4.';showControls();});
video.addEventListener('ended',function(){$('play-state').textContent='Playback ended';showControls();});
function toggle(){if(video.paused)video.play().catch(function(){$('play-state').textContent='Playback could not start';});else video.pause();showControls();}
function seek(delta){if(state.playing&&state.playing.kind!=='live'&&isFinite(video.duration)){video.currentTime=Math.max(0,Math.min(video.duration,video.currentTime+delta));showControls();}}
function back(){if(!$('player').hidden){stop();return;}if(!$('manual').hidden){$('manual').hidden=true;$('manual-toggle').focus();return;}if(!$('connection').hidden){connection(false);return;}if(state.episodes){state.items=state.episodes;state.episodes=null;state.group='All';state.page=0;$('search').value='';render();focusFirst();return;}if(window.webOS&&webOS.platformBack)webOS.platformBack();else if(window.PalmSystem&&PalmSystem.stageReady)window.close();else connection(true);}
$('providers').onchange=function(){selectProvider(this.value);};
document.querySelectorAll('[data-kind]').forEach(function(b){b.onclick=function(){state.kind=b.dataset.kind;state.episodes=null;load();};});
$('search').oninput=function(){state.page=0;renderItems();};
$('settings-open').onclick=function(){connection(true);};
$('connection-close').onclick=function(){connection(false);};
$('sync').onclick=sync;
$('manual-toggle').onclick=function(){$('manual').hidden=!$('manual').hidden;if(!$('manual').hidden)$('manual-type').focus();};
$('manual-type').onchange=function(){$('credentials').hidden=this.value!=='xtream';};
$('manual').onsubmit=async function(e){e.preventDefault();var type=$('manual-type').value,url=A.safeURL($('manual-url').value.trim());if(!url){$('activation').textContent='Enter a valid HTTP or HTTPS URL';return;}if(type==='xtream'&&(!$('manual-user').value||!$('manual-pass').value)){$('activation').textContent='Username and password required';return;}
var p={id:'manual',manual:true,type:type,name:'Direct playlist',url:url,server:url,username:$('manual-user').value,password:$('manual-pass').value};state.providers=state.providers.filter(function(p){return !p.manual;}).concat([p]);state.kind='live';providers();await selectProvider('manual');$('providers').value='manual';$('manual-pass').value='';connection(false);};
$('play-selected').onclick=function(){if(state.selected)open(state.selected);};
$('stop').onclick=function(){stop();};$('pause').onclick=toggle;$('retry').onclick=function(){if(state.playing)play(state.playing);};$('seek-back').onclick=function(){seek(-30);};$('seek-forward').onclick=function(){seek(30);};
function focusables(){return Array.from(document.querySelectorAll('button,input,select')).filter(function(el){return !el.disabled&&el.getBoundingClientRect().width&&el.getBoundingClientRect().height&&($('player').hidden?($('connection').hidden?!$('connection').contains(el)&&!$('player').contains(el):$('connection').contains(el)):$('player').contains(el));});}
function move(key){var els=focusables(),current=document.activeElement;if(els.indexOf(current)<0){if(els[0])els[0].focus();return;}
var c=current.getBoundingClientRect(),cx=c.left+c.width/2,cy=c.top+c.height/2,candidates=els.filter(function(el){return el!==current;}).map(function(el){var r=el.getBoundingClientRect(),dx=r.left+r.width/2-cx,dy=r.top+r.height/2-cy;var main=key==='ArrowDown'?dy:key==='ArrowUp'?-dy:key==='ArrowRight'?dx:-dx,cross=key==='ArrowDown'||key==='ArrowUp'?Math.abs(dx):Math.abs(dy);return {el:el,score:main+cross*4,main:main,cross:cross};}).filter(function(x){return x.main>5;}).sort(function(a,b){return a.score-b.score;});
if(candidates.length){candidates[0].el.focus();candidates[0].el.scrollIntoView({block:'nearest',inline:'nearest'});}}
document.addEventListener('keydown',function(e){
var key=e.key;if(e.keyCode===461||key==='Escape'||key==='BrowserBack'){e.preventDefault();back();return;}
if(!key&&e.keyCode)key=({37:'ArrowLeft',38:'ArrowUp',39:'ArrowRight',40:'ArrowDown',13:'Enter'})[e.keyCode];
if(!$('player').hidden){if(e.keyCode===415){video.play().catch(function(){});showControls();e.preventDefault();return;}if(e.keyCode===19){video.pause();showControls();e.preventDefault();return;}if(e.keyCode===413){stop();e.preventDefault();return;}if(e.keyCode===417||e.keyCode===412){seek(e.keyCode===417?30:-30);e.preventDefault();return;}if($('player-ui').classList.contains('dim')){showControls();$('stop').focus();e.preventDefault();return;}showControls();}
if(/^Arrow/.test(key)){if(document.activeElement.tagName==='SELECT')return;if(document.activeElement.tagName==='INPUT'&&(key==='ArrowLeft'||key==='ArrowRight'))return;e.preventDefault();move(key);}
});
document.addEventListener('visibilitychange',function(){if(document.hidden&&state.playing)stop(false);});
render();sync();setInterval(sync,30*60*1000);setInterval(function(){if(state.expires&&Date.parse(state.expires)<=Date.now()&&state.provider&&!state.provider.manual){stop();state.items=[];state.provider=null;state.request++;render();$('activation').textContent='Activation expired. Renew in your panel.';connection(true);}},60000);
})();
