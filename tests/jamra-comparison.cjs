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
await p.evaluate(()=>{
 const urls=n=>'file:///home/kit/jamra-wip/dist/assets/jamra/'+n+'.jpg';
 const movies=[['dune','Dune: Part Two','2024','خيال علمي','8.8'],['interstellar','Interstellar','2014','مغامرة','8.7'],['oppenheimer','Oppenheimer','2023','دراما','8.6'],['batman','The Batman','2022','جريمة','7.8'],['arrival','Arrival','2016','خيال علمي','7.9'],['blade','Blade Runner 2049','2017','خيال علمي','8.0']].map((a,i)=>({id:''+i,kind:'movies',name:a[1],logo:urls(a[0]),year:a[2],genre:a[3],rating:a[4],quality:'4K'}));
 const shows=[['dark','Dark','3 مواسم','غموض','8.7'],['last','The Last of Us','موسمان','دراما','8.8'],['shogun','Shōgun','موسم واحد','تاريخي','8.6'],['bear','The Bear','4 مواسم','دراما','8.6'],['last','The Last of Us · S2','الموسم الثاني','دراما','8.8'],['dark','Dark · Season 3','الموسم الثالث','غموض','8.7']].map((a,i)=>({id:'s'+i,kind:'series',name:a[1],logo:urls(a[0]),year:a[2],genre:a[3],rating:a[4]}));
 const channels=[['beIN','beIN SPORTS 1'],['beIN','beIN SPORTS 2'],['MBC','MBC 1 HD'],['MBC','MBC 2 HD'],['AD','Abu Dhabi TV'],['DXB','Dubai One'],['AR','Al Arabiya']].map((a,i)=>({id:'c'+i,kind:'live',shortName:a[0],name:a[1],quality:i<2?'4K':'HD'}));
 const hero={...movies[1],duration:'2h 49m',quality:'4K HDR',backdrop:urls('intbg'),description:'حين يصبح الأمل أكبر من عالمنا.\nرحلة إلى ما وراء النجوم، بحثاً عن بداية جديدة.'};
 const movie={...hero,quality:'4K',audio:'DOLBY AUDIO',genre:'دراما · مغامرة',year:'2014',duration:'2h 49m',description:'يقود طيّار سابق بعثة عبر ثقب دودي بحثاً عن موطن جديد للبشرية. وبين الزمن والمسافات، يبقى الحب هو الرابط الذي يتجاوز كل الحدود.',director:'Christopher Nolan',cast:'Matthew McConaughey · Anne Hathaway · Jessica Chastain'};
 const show={...shows[1],quality:'4K',audio:'DOLBY AUDIO',genre:'دراما · مغامرة',year:'2023',duration:'موسمان',backdrop:urls('lastbg'),description:'في عالم تغيّر إلى الأبد، يلتقي جويل بإيلي. رحلة صعبة عبر مدن مهجورة، وروابط إنسانية أقوى من كل شيء.',cast:'Pedro Pascal · Bella Ramsey'};
 const names=['الكل','مضاف حديثاً','الأعلى تقييماً','دراما','خيال علمي','إثارة','أكشن','مغامرة','جريمة','كوميديا','وثائقي','عائلي','تاريخي','غموض','رومانسي','رعب'];
 window.fixture={screen:'home',ready:true,nativeOpen:false,items:movies.concat([movies[4],movies[2],movies[5],movies[0],movies[1],movies[3]]),movies,hero,item:movie,channels,selected:channels[0],categories:names.map((n,i)=>({name:n,value:i?'cat'+i:'All'})),group:'All',search:'',date:'الجمعة، 30 أكتوبر',time:'12:52',controls:true,progress:'00:24:18 / 00:54:32',percent:38,episodes:[],playing:channels[0]};
 fixture.selected={...channels[0],description:'عالمك الرياضي، بجودة استثنائية.',backdrop:urls('sports'),quality:'4K UHD',fps:50,language:'العربية',signal:'● إشارة مستقرة  ·  18.6 Mbps'};
 window.APJamra.snapshot=()=>fixture;
 window.fixtureShows=shows;window.fixtureShow=show;window.fixtureMovie=movie;window.fixtureMovies=movies;
});
const screens=['home','live','player-live','player-live-list','movies','movie-detail','series','series-detail','player-series','settings'];
for(let n=0;n<screens.length;n++){
 await p.evaluate(({name,n})=>{
  const f=window.fixture;f.screen=name;
  if(name==='movies')f.items=fixtureMovies.concat([fixtureMovies[4],fixtureMovies[2],fixtureMovies[5],fixtureMovies[0],fixtureMovies[1],fixtureMovies[3]]);
  if(name==='series')f.items=fixtureShows.concat([fixtureShows[3],fixtureShows[2],fixtureShows[1],fixtureShows[0],fixtureShows[5],fixtureShows[4]]);
  if(name==='series-detail'){f.item=fixtureShow;f.episodes=[1,2,3].map((i)=>({name:i+'  '+['حين نحتاج الأمل','البداية الثانية','وقت طويل'][i-1],logo:fixtureShow.backdrop,duration:'54 دقيقة · 4K'}));}
  if(name==='movie-detail')f.item=fixtureMovie;
  if(name==='player-series')f.playing={name:'The Last of Us',episode:'الموسم الأول · الحلقة 3'};
  if(name.includes('live')||name==='live')f.playing={...f.channels[0],description:'عالمك الرياضي، مباشرة'};
  if(name==='live')f.categories=['كل القنوات','المفضلة','رياضة','عربية','أفلام','أخبار','أطفال'].map((v,i)=>({name:v,value:i?'c'+i:'All'}));
  if(name==='movies'||name==='series')f.categories=['الكل','مضاف حديثاً','الأعلى تقييماً','دراما','خيال علمي','إثارة','أكشن','مغامرة','جريمة','كوميديا','وثائقي','عائلي','تاريخي','غموض','رومانسي','رعب'].map((v,i)=>({name:v,value:i?'cat'+i:'All'}));
 },{name:screens[n],n});
 await p.waitForTimeout(500);
 // Use actual media layer with a deterministic paused frame for visual-only comparison.
 await p.evaluate(name=>{
  var active=name.indexOf('player')===0,pl=document.querySelector('#player'),v=document.querySelector('#video');
  pl.hidden=!active;v.style.backgroundImage=active?'url("assets/jamra/'+(name==='player-series'?'lastbg':'sports')+'.jpg")':'none';v.style.backgroundSize='cover';v.style.backgroundPosition='center';
 },screens[n]);
 await p.waitForTimeout(1400);await p.evaluate(()=>document.fonts.ready);
 await p.screenshot({path:'/home/kit/jamra_exact_'+n+'.png'});
 if(n===1)console.log('LIVE',await p.evaluate(()=>{var r=document.querySelector('#jamra-exact').shadowRoot;return ['.livegrid','.channels','.preview','.previewimage','.libraryhead','.search'].map(s=>{let e=r.querySelector(s),b=e.getBoundingClientRect();return [s,b.x,b.y,b.width,b.height,getComputedStyle(e).backgroundImage]});}));
}
console.log('errors',errors);
await p.close();}await b.close();})().catch(e=>{console.error(e);process.exit(1)});
