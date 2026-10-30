const {chromium}=require('/home/kit/tmp/player124/node_modules/playwright');
const fs=require('fs'),path=require('path');
const out=path.resolve(__dirname,'../artifacts/remote25');fs.mkdirSync(out,{recursive:true});
const themes=['apple','navy','red','blue','aya','alaa','harak','muse','velour'];
const cors={'access-control-allow-origin':'*','access-control-allow-headers':'*'};
const clip=fs.readFileSync('/home/kit/tmp/ovfix/broadcast.webm');
const results=[];
(async()=>{
const b=await chromium.launch({executablePath:'/home/kit/tmp/player124/chrome-linux/chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
for(const theme of ['jamra']){
const p=await b.newPage({bypassCSP:true,viewport:{width:1920,height:1080},recordVideo:{dir:path.join(out,'video'),size:{width:1920,height:1080}}}),errors=[];
p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(t=>{localStorage.clear();localStorage.setItem('ap-theme',t);},theme);
await p.route('**/*',r=>{
 const u=new URL(r.request().url());if(u.protocol==='file:')return r.continue();
 if(u.hostname.includes('supabase'))return r.fulfill({headers:cors,json:u.pathname.includes('register_device')?{status:'registered'}:{status:'active',playlists:[{id:'t',type:'xtream',server:'http://fixture.example',username:'u',password:'p',name:'Virtual TV'}]}});
 if(u.hostname==='fixture.example'){
 const a=u.searchParams.get('action');if(!a)return r.fulfill({headers:cors,contentType:'video/webm',body:clip});
 let d=[];if(a.endsWith('_categories'))d=[{category_id:'1',category_name:'Test'},{category_id:'2',category_name:'Other'}];
 if(['get_live_streams','get_vod_streams','get_series'].includes(a))d=Array.from({length:24},(_,i)=>({stream_id:i+1,series_id:i+1,name:['Dune: Part Two','Interstellar','Oppenheimer','The Batman','Arrival','Blade Runner 2049'][i%6],category_id:i<18?'1':'2',stream_icon:'http://art.example/'+['dune','interstellar','oppenheimer','batman','arrival','blade'][i%6]+'.jpg',cover:'http://art.example/'+['dune','interstellar','oppenheimer','batman','arrival','blade'][i%6]+'.jpg',container_extension:'webm',added:''+(9999-i),last_modified:''+(9999-i),rating:'8',year:'2025'}));
 if(a==='get_vod_info')d={info:{name:'Interstellar',cover_big:'http://art.example/interstellar.jpg',movie_image:'http://art.example/interstellar.jpg',plot:'رحلة إلى ما وراء النجوم، بحثاً عن بداية جديدة.'}};
 if(a==='get_series_info')d={info:{name:'The Last of Us',cover:'http://art.example/last.jpg',plot:'في عالم تغيّر إلى الأبد، رحلة صعبة وروابط إنسانية أقوى من كل شيء.'},seasons:[{season_number:1,name:'Season 1'},{season_number:2,name:'Season 2'}],episodes:{1:Array.from({length:8},(_,i)=>({id:''+(101+i),episode_num:i+1,title:'Episode '+(i+1),container_extension:'webm',info:{duration:'00:05:00'}})),2:[{id:'201',episode_num:1,title:'Season 2 Episode',container_extension:'webm'}]}};
 return r.fulfill({headers:cors,json:d});}
 if(u.hostname==='art.example')return r.fulfill({headers:cors,contentType:'image/jpeg',body:fs.readFileSync('/home/kit/zumurrud-wip/mockup/assets/'+u.pathname.slice(1))});return r.fulfill({headers:cors,body:''});
});
await p.goto('file://'+path.resolve(__dirname,'../dist/index.html'));
await p.waitForFunction(()=>document.querySelector('#home-movies button')&&document.querySelector('#connection').hidden);

const key=async(k,code)=>p.evaluate(({k,code})=>{const a=document.activeElement;a.dispatchEvent(new KeyboardEvent('keydown',{key:k,keyCode:code,which:code,bubbles:true,cancelable:true}));a.dispatchEvent(new KeyboardEvent('keyup',{key:k,keyCode:code,which:code,bubbles:true,cancelable:true}));},{k,code:code||({ArrowLeft:37,ArrowUp:38,ArrowRight:39,ArrowDown:40,Enter:13,BrowserBack:461})[k]});
const click=async sel=>{await p.locator(sel).first().evaluate(e=>e.focus());await key('Enter');await p.waitForTimeout(70);};

async function shot(name,focus){if(focus)await p.locator(focus).first().evaluate(e=>e.focus());await p.waitForTimeout(500);await p.screenshot({path:'/home/kit/jamra_'+name+'.jpg'});}
await p.evaluate(()=>{var h=document.querySelector('#home');h.scrollTop=0;var im=document.querySelector('#home-hero img');if(im)im.src='http://art.example/intbg.jpg';});
await shot('home','#home-play');
for(const kind of ['movies','series','live']){
await click('nav [data-kind="'+kind+'"]');await p.waitForTimeout(200);
await shot(kind,'#items button');
if(kind==='movies'){await click('#items button');await shot('movie_detail','#movie-play');await key('BrowserBack');}
if(kind==='series'){await click('#items button');await p.waitForTimeout(200);await shot('series_detail','#series-start');await click('#episode-list button');await p.evaluate(()=>window.APEpisodePresentation.fullscreen(true));await shot('player_series','#pause');await key('BrowserBack');await key('BrowserBack');}
if(kind==='live'){await click('#items button');await p.waitForTimeout(200);await key('ArrowRight');await shot('player_live','#live-list');await click('#live-list');await shot('player_list','#quick-list button');await key('BrowserBack');await key('BrowserBack');}
}
await click('#settings-open');await shot('settings','#theme-jamra');
await p.close();
}await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
