
const {chromium}=require('/home/kit/tmp/player124/node_modules/playwright'),path=require('path'),assert=require('assert');
const dist=path.resolve(process.argv[2]||'dist');
(async()=>{
const b=await chromium.launch({executablePath:'/home/kit/tmp/player124/chrome-linux/chrome',headless:true,args:['--no-sandbox']});
try{
const p=await b.newPage({bypassCSP:true,viewport:{width:1920,height:1080}});
const cors={'access-control-allow-origin':'*','access-control-allow-headers':'*'};
await p.route('**/*',async r=>{const u=new URL(r.request().url());if(u.protocol==='file:')return r.continue();
if(u.hostname.includes('supabase'))return r.fulfill({headers:cors,json:u.pathname.includes('register_device')?{}:{status:'active',playlists:[{id:'bench',type:'xtream',server:'https://fixture.example',username:'test',password:'test',name:'Benchmark'}]}});
if(u.hostname==='fixture.example'){const a=u.searchParams.get('action');let data=[];
if(a==='get_vod_categories'||a==='get_series_categories')data=[{category_id:'1',category_name:'ALL'}];
if(a==='get_vod_streams'||a==='get_series')data=Array.from({length:120},(_,i)=>({stream_id:i+1,series_id:i+1,name:'Item '+i,category_id:'1',rating:'7',added:'1700000000'}));
if(a==='get_series_info')data={info:{name:'Show',plot:'x',genre:'Drama',rating:'8'},episodes:{'1':Array.from({length:80},(_,i)=>({id:i+1,title:'Episode '+(i+1),episode_num:i+1,season:1,container_extension:'mp4',info:{}}))}};
return r.fulfill({headers:cors,json:data});}
return r.fulfill({headers:cors,body:''});});
await p.goto('file://'+dist+'/index.html');
await p.evaluate(()=>localStorage.setItem('ap-theme','red'));await p.reload();
await p.waitForFunction(()=>document.querySelector('#home-tiles button')&&document.querySelector('#connection').hidden);
const key=async(k,n=1)=>{for(let i=0;i<n;i++){await p.keyboard.press(k);await p.waitForTimeout(40);}};
const idx=()=>p.evaluate(()=>{const a=document.activeElement;return a&&a.dataset.index!=null?+a.dataset.index:(a&&a.dataset.episodeIndex!=null?+a.dataset.episodeIndex:-1)});
// movies grid
await p.evaluate(()=>document.querySelector('nav [data-kind="movies"]').click());
await p.waitForSelector('#items button');await p.waitForTimeout(500);
await p.evaluate(()=>document.querySelector('#items button').focus());
await key('ArrowDown',6);assert.strictEqual(await idx(),30,'movies down x6 crosses 25 boundary');
await key('ArrowUp',6);assert.strictEqual(await idx(),0,'movies up back');
await key('ArrowRight',26);assert.strictEqual(await idx(),26);
await key('ArrowLeft',1);assert.strictEqual(await idx(),25);await key('ArrowLeft');assert.strictEqual(await idx(),-1,'left at col0 goes to nav');
const H=await p.evaluate(()=>{const l=document.querySelector('#items');return l.scrollHeight-l.clientHeight});
// series
await p.evaluate(()=>document.querySelector('nav [data-kind="series"]').click());
await p.waitForSelector('#items button');await p.waitForTimeout(500);
await p.evaluate(()=>document.querySelector('#items button').click());
await p.waitForFunction(()=>document.querySelectorAll('#episode-list button').length>5);await p.waitForTimeout(300);
const geo=()=>p.evaluate(()=>{const l=document.querySelector('#episode-list'),rs=[...l.querySelectorAll('.episode-row')];return {rows:rs.length,h:rs[0].offsetHeight,pitch:rs.length>1?rs[1].offsetTop-rs[0].offsetTop:0,sh:l.scrollHeight,ch:l.clientHeight,st:l.scrollTop,sp:[...l.querySelectorAll('.episode-spacer')].map(s=>s.offsetHeight)}});
let g=await geo();assert.strictEqual(g.pitch,64,'row pitch 64 got '+g.pitch);
assert.ok(Math.abs(g.sh-80*64)<=64,'scrollHeight ~ items*64: '+g.sh);
await p.evaluate(()=>document.querySelector('.episode-row').focus());
await key('ArrowDown',40);assert.strictEqual(await idx(),40);
await key('ArrowUp',20);assert.strictEqual(await idx(),20);
await key('ArrowDown',59);assert.strictEqual(await idx(),79,'end item');
g=await geo();assert.ok(g.sp.every(x=>x<=64*80),'spacer ok');
const vis=await p.evaluate(()=>{const a=document.activeElement.getBoundingClientRect(),l=document.querySelector('#episode-list').getBoundingClientRect();return a.top>=l.top-1&&a.bottom<=l.bottom+1});
assert.ok(vis,'last focused visible');
// scroll away and back
await p.evaluate(()=>{document.activeElement.blur();document.querySelector('#episode-list').scrollTop=0});await p.waitForTimeout(200);
g=await geo();assert.strictEqual(g.st,0);assert.ok((await p.evaluate(()=>document.querySelector('[data-episode-index="0"]')))!==null,'top painted');
await p.evaluate(()=>{const l=document.querySelector('#episode-list');l.scrollTop=l.scrollHeight});await p.waitForTimeout(300);
assert.ok(await p.evaluate(()=>!!document.querySelector('[data-episode-index="79"]')),'bottom painted');
// inline playback + subtitles
await p.evaluate(()=>{const v=document.getElementById('video');v.play=function(){return Promise.resolve()};v.pause=function(){};const t1=v.addTextTrack('subtitles','English','en'),t2=v.addTextTrack('subtitles','Arabic','ar');t1.mode='disabled';t2.mode='disabled';document.querySelector('[data-episode-index="79"]').focus()});
await key('Enter');await p.waitForTimeout(500);
assert.ok(await p.evaluate(()=>!document.getElementById('player').hidden),'player open');
await p.evaluate(()=>document.getElementById('red-sub').click());await p.waitForTimeout(200);
const tr=()=>p.evaluate(()=>[...document.getElementById('video').textTracks].map(t=>t.mode));
const foc=()=>p.evaluate(()=>{const a=document.activeElement;return !!(a&&a!==document.body&&a.offsetParent&&document.querySelector('#red-sublist').contains(a))});
await p.evaluate(()=>document.querySelector('#red-sublist div button[data-track="1"]').focus());
await key('Enter');assert.deepStrictEqual(await tr(),['disabled','showing']);assert.ok(await foc(),'focus valid after pick');
await key('Enter');assert.deepStrictEqual(await tr(),['disabled','showing'],'repeat Enter no toggle');
await p.evaluate(()=>document.querySelector('#red-sublist div button').focus());await key('Enter');
assert.deepStrictEqual(await tr(),['disabled','disabled'],'OFF');assert.ok(await foc());
await key('Escape');
// switch to Apple
await p.evaluate(()=>{document.getElementById('player').hidden=true;});
await p.evaluate(()=>document.getElementById('theme-apple').click());await p.waitForTimeout(300);
const ap=await p.evaluate(()=>({cls:document.body.className,fs:document.body.classList.contains('red-inline')||document.body.classList.contains('red-fs'),first:document.querySelector('.episode-row').getBoundingClientRect().top,tops:[...document.querySelectorAll('.episode-row')].slice(0,6).map(e=>Math.round(e.getBoundingClientRect().left))}));
assert.ok(!ap.fs,'red classes cleared');assert.strictEqual(new Set(ap.tops.slice(0,5)).size,5,'apple 5 cols '+ap.tops);
console.log('red133-nav PASS');
}finally{await b.close();}
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
