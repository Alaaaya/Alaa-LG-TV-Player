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
const p=await b.newPage({bypassCSP:false,viewport:{width:1920,height:1080},recordVideo:{dir:path.join(out,'video'),size:{width:1920,height:1080}}}),errors=[];
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
await p.waitForTimeout(1000);

const key=async(k,code)=>p.evaluate(({k,code})=>{const a=document.activeElement;a.dispatchEvent(new KeyboardEvent('keydown',{key:k,keyCode:code,which:code,bubbles:true,cancelable:true}));a.dispatchEvent(new KeyboardEvent('keyup',{key:k,keyCode:code,which:code,bubbles:true,cancelable:true}));},{k,code:code||({ArrowLeft:37,ArrowUp:38,ArrowRight:39,ArrowDown:40,Enter:13,BrowserBack:461})[k]});
const click=async sel=>{await p.locator(sel).first().evaluate(e=>e.focus());await key('Enter');await p.waitForTimeout(70);};



await p.waitForTimeout(1000);

const results=[];
async function check(name){await p.waitForTimeout(350);const view=await p.evaluate(()=>({screen:APJamra.snapshot().screen,visible:document.querySelector('#jamra-exact').style.display,buttons:document.querySelector('#jamra-exact').shadowRoot.querySelectorAll('[tabindex]').length}));for(const k of (name==='theme-list'?[]:['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'])){await p.keyboard.press(k);await p.waitForTimeout(90);const ok=await p.evaluate(()=>{var r=document.querySelector('#jamra-exact').shadowRoot,e=r.activeElement;return !!e&&!!e.dataset.key;});if(!ok)throw Error('Lost Dpad focus '+name+' '+k);}results.push({name,...view,dpad:4});}
async function hit(k){await p.locator('#jamra-exact').locator('[data-key="'+k+'"]').click();}
await check('home');
await hit('nav-2');await check('movies');
await hit('item-0');await check('movie-detail');
await hit('detail-0');await check('vod');
await p.keyboard.press('Escape');await p.keyboard.press('Escape');await check('movie-back');
await hit('nav-3');await check('series');
await hit('item-0');await check('series-detail');
await hit('ep-0');await check('episode');
await p.keyboard.press('Escape');await p.keyboard.press('Escape');await check('series-back');
await hit('nav-1');await check('live');
await hit('ch-0');await check('player-live');
await hit('live-0');await check('channel-drawer');
await p.keyboard.press('Escape');await p.keyboard.press('Escape');await check('live-back');
await hit('nav-5');await check('settings');
await hit('theme');await check('theme-list');
await hit('theme-jamra');await check('theme-chosen');
console.log(JSON.stringify({results,errors},null,2));fs.writeFileSync('/home/kit/jamra-wip/artifacts/jamra261-integration.json',JSON.stringify({results,errors},null,2));
await p.close();}await b.close();})().catch(e=>{console.error(e);process.exit(1)});
