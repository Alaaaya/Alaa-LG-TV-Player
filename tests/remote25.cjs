const {chromium}=require('/home/kit/tmp/player124/node_modules/playwright');
const fs=require('fs'),path=require('path');
const out=path.resolve(__dirname,'../artifacts/remote25');fs.mkdirSync(out,{recursive:true});
const themes=['apple','navy','red','blue','aya','alaa','harak','muse','velour'];
const cors={'access-control-allow-origin':'*','access-control-allow-headers':'*'};
const clip=fs.readFileSync('/home/kit/tmp/ovfix/broadcast.webm');
const results=[];
(async()=>{
const b=await chromium.launch({executablePath:'/home/kit/tmp/player124/chrome-linux/chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
for(const theme of (process.env.THEMES||themes.join(',')).split(',')){
const p=await b.newPage({bypassCSP:true,viewport:{width:1920,height:1080},recordVideo:{dir:path.join(out,'video'),size:{width:1920,height:1080}}}),errors=[];
p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(t=>{localStorage.clear();localStorage.setItem('ap-theme',t);},theme);
await p.route('**/*',r=>{
 const u=new URL(r.request().url());if(u.protocol==='file:')return r.continue();
 if(u.hostname.includes('supabase'))return r.fulfill({headers:cors,json:u.pathname.includes('register_device')?{status:'registered'}:{status:'active',playlists:[{id:'t',type:'xtream',server:'http://fixture.example',username:'u',password:'p',name:'Virtual TV'}]}});
 if(u.hostname==='fixture.example'){
 const a=u.searchParams.get('action');if(!a)return r.fulfill({headers:cors,contentType:'video/webm',body:clip});
 let d=[];if(a.endsWith('_categories'))d=[{category_id:'1',category_name:'Test'},{category_id:'2',category_name:'Other'}];
 if(['get_live_streams','get_vod_streams','get_series'].includes(a))d=Array.from({length:24},(_,i)=>({stream_id:i+1,series_id:i+1,name:'Test '+(i+1),category_id:i<18?'1':'2',stream_icon:'',cover:'',container_extension:'webm',added:''+(9999-i),last_modified:''+(9999-i),rating:'8',year:'2025'}));
 if(a==='get_vod_info')d={info:{name:'Test Film',plot:'Virtual TV fixture'}};
 if(a==='get_series_info')d={info:{name:'Test Series'},seasons:[{season_number:1,name:'Season 1'},{season_number:2,name:'Season 2'}],episodes:{1:Array.from({length:8},(_,i)=>({id:''+(101+i),episode_num:i+1,title:'Episode '+(i+1),container_extension:'webm',info:{duration:'00:05:00'}})),2:[{id:'201',episode_num:1,title:'Season 2 Episode',container_extension:'webm'}]}};
 return r.fulfill({headers:cors,json:d});}
 return r.fulfill({headers:cors,body:''});
});
await p.goto('file://'+path.resolve(__dirname,'../dist/index.html'));
await p.waitForFunction(()=>document.querySelector('#home-movies button')&&document.querySelector('#connection').hidden);
await p.addStyleTag({content:'*{scroll-behavior:auto!important;transition:none!important;animation:none!important}'});
const key=async(k,code)=>p.evaluate(({k,code})=>{const a=document.activeElement;a.dispatchEvent(new KeyboardEvent('keydown',{key:k,keyCode:code,which:code,bubbles:true,cancelable:true}));a.dispatchEvent(new KeyboardEvent('keyup',{key:k,keyCode:code,which:code,bubbles:true,cancelable:true}));},{k,code:code||({ArrowLeft:37,ArrowUp:38,ArrowRight:39,ArrowDown:40,Enter:13,BrowserBack:461})[k]});
const click=async sel=>{await p.locator(sel).first().evaluate(e=>e.focus());await key('Enter');await p.waitForTimeout(70);};
async function walk(name,root,seed){
 await p.locator(seed).first().evaluate(e=>{e.focus();e.scrollIntoView({block:'nearest'});});
 const result=await p.evaluate(({root})=>{
 let seq=0;const tag=e=>e?(e.dataset.auditId||(e.dataset.auditId='a'+(++seq))):null;
 const visible=e=>{let r=e.getBoundingClientRect();if(!e.isConnected||e.disabled||e.closest('[hidden]')||!r.width||!r.height)return false;for(let n=e;n&&n.nodeType===1;n=n.parentElement){let s=getComputedStyle(n);if(s.visibility==='hidden'||s.display==='none'||+s.opacity===0)return false;}return true;};
 const nodes=()=>Array.from(document.querySelector(root).querySelectorAll('button,input,select,[tabindex="0"]')).filter(e=>visible(e)&&e.tagName!=='SECTION');
 for(let e of document.querySelectorAll('[data-audit-id]'))delete e.dataset.auditId;
 const start=document.activeElement,queue=[start],seen=new Set([tag(start)]),edges=[],bad=[];
 for(let at=0;at<queue.length&&at<250;at++){
 let from=queue[at];if(!visible(from))continue;
 for(let [k,c] of [['ArrowLeft',37],['ArrowUp',38],['ArrowRight',39],['ArrowDown',40]]){
 from.focus();from.scrollIntoView({block:'nearest',inline:'nearest'});
 from.dispatchEvent(new KeyboardEvent('keydown',{key:k,keyCode:c,which:c,bubbles:true,cancelable:true}));
 let to=document.activeElement,tid=tag(to);edges.push([tag(from),k,tid]);
 if(!visible(to)||to===document.body)bad.push({from:from.id,key:k,to:to.id});
 if(to&&visible(to)&&!seen.has(tid)){seen.add(tid);queue.push(to);}
 }
 }
 const targets=nodes(),missing=targets.filter(e=>!seen.has(tag(e))).map(e=>({id:e.id,text:e.textContent.slice(0,45),tag:e.tagName,rect:{x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y}}));
 const focus=nodes().filter(e=>seen.has(tag(e))).map(e=>{e.focus();const s=getComputedStyle(e);return {id:e.id,outline:s.outlineWidth};});
 return {targets:targets.length,reached:targets.length-missing.length,edges:edges.length,bad,missing,focusMissing:focus.filter(e=>e.outline==='0px')};
 },{root});
 await p.screenshot({path:path.join(out,theme+'-'+name+'.jpg')});
 results.push({theme,page:name,...result});console.log(theme,name,result.reached+'/'+result.targets,'bad',result.bad.length,'missing',JSON.stringify(result.missing));
}
await walk('home','#home','#search');
await click('#home-info');await walk('home-info','#home-details','#home-detail-close');await key('BrowserBack');
await click('#settings-open');await walk('settings','#connection','#sync');
await click('#f21-settings');await walk('watch-settings','#f21-modal','#f21-modal button');await key('BrowserBack');
await click('#manual-toggle');await walk('manual','#connection','#manual-url');await key('BrowserBack');await key('BrowserBack');
await click('#nav-search');await p.locator('#f21-search-input').fill('Test');await p.waitForTimeout(200);await walk('search','#f21-modal','#f21-search-input');await key('BrowserBack');
for(const kind of ['movies','series','live']){
 await click('nav [data-kind="'+kind+'"]');await p.waitForTimeout(120);
 await walk(kind,'#browser','#items button');
 if(kind==='movies'){
 await click('#items button');await walk('movie-detail','#movie-detail','#movie-play');await click('#movie-play');await p.waitForTimeout(250);
 await walk('vod','#player','#pause');
 await click('#f21-speed');await walk('speed','#f21-modal','#f21-modal button');await key('BrowserBack');
 // Hide genuinely using the idle timer, then first key must wake without pausing/seeking.
 await p.evaluate(()=>{document.querySelector('#player-ui').classList.add('dim');});
 const before=await p.locator('#video').evaluate(v=>({paused:v.paused,time:v.currentTime}));await key('Enter');
 const wake=await p.evaluate(()=>({dim:document.querySelector('#player-ui').classList.contains('dim'),paused:document.querySelector('#video').paused,focus:document.activeElement.id}));
 results.push({theme,page:'vod-wake',pass:!wake.dim&&wake.paused===before.paused,details:wake});
 await key('BrowserBack');await key('BrowserBack');
 }
 if(kind==='series'){
 await click('#items button');await p.waitForTimeout(120);await walk('series-detail','#series-detail','#series-start');
 await click('#episode-list button');await p.waitForTimeout(180);await walk('inline-mini','#series-detail','#episode-list button');
 await p.evaluate(()=>window.APEpisodePresentation.fullscreen(true));await walk('episode-full','#player','#pause');await key('BrowserBack');await key('BrowserBack');
 }
 if(kind==='live'){
 await click('#items button');await p.waitForTimeout(180);
 await key('ArrowRight');await walk('live-player','#live-now','#live-list');
 await click('#live-list');await walk('channel-list','#quick-channels','#quick-list button');await key('BrowserBack');
 const quality=await p.locator('#live-quality').count();if(quality){await click('#live-quality');await walk('quality','#live-panel','#live-panel button');await key('BrowserBack');}
 else{await click('#live-settings');await walk('live-settings','#live-panel','#live-panel button');await key('BrowserBack');}
 await p.evaluate(()=>document.querySelector('#live-now').hidden=true);
 const current=await p.locator('#playing-name').textContent();await key('ArrowDown');
 results.push({theme,page:'live-wake',pass:await p.locator('#playing-name').textContent()===current});
 for(let c=403;c<=406;c++)await key('Unidentified',c);
 await key('1',49);await key('Enter');
 await p.mouse.move(900,900);await p.mouse.click(900,900);await key('BrowserBack');await key('BrowserBack');
 }
}
results.push({theme,page:'runtime',errors});await p.close();
fs.writeFileSync(path.join(out,'matrix.json'),JSON.stringify(results,null,2));
}
await b.close();console.log('COMPLETE',results.length);
})().catch(e=>{console.error(e);fs.writeFileSync(path.join(out,'partial.json'),JSON.stringify(results,null,2));process.exit(1)});
