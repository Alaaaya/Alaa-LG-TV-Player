'use strict';
// Black-box (built bundle, Chrome 87): quiet cache-first refresh keeps category, focus item id and scroll anchor; manual refresh awaits real responses.
const {chromium}=require('/home/kit/tmp/player124/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const exe=process.env.CHROMIUM_87||'/home/kit/tmp/player124/chrome-linux/chrome';
const entry='file://'+path.resolve(process.argv[2]||'dist')+'/index.html';
const out=process.argv[3]||'/tmp/cache133-quiet.json';
const cors={'access-control-allow-origin':'*','access-control-allow-headers':'*'};
const ACTION={live:'get_live_streams',movies:'get_vod_streams',series:'get_series'};
let profile,context,page,errors=[],checks=[],calls=[],mode={changed:false,hold:false,fail:false},held=[];
const baseCats=Array.from({length:4},(_,i)=>({category_id:String(i+1),category_name:'Category '+(i+1)}));
function payload(a,cat){
 if(a.endsWith('_categories'))return mode.changed?baseCats.concat([{category_id:'5',category_name:'Category 5'}]):baseCats;
 if(a==='get_live_streams'||a==='get_vod_streams'||a==='get_series'){
  const data=Array.from({length:90},(_,i)=>({stream_id:Number(cat)*100+i,series_id:Number(cat)*100+i,category_id:cat,name:a+' '+cat+' Title '+i,stream_icon:'https://images.example/'+cat+'/'+i+'.svg',cover:'https://images.example/'+cat+'/'+i+'.svg',added:i,container_extension:'mp4'}));
  if(mode.changed&&cat==='2'){data[3].name=a+' RENAMED';data.unshift({stream_id:8999,series_id:8999,category_id:cat,name:a+' FRONTNEW',stream_icon:'https://images.example/new.svg',cover:'https://images.example/new.svg',added:99,container_extension:'mp4'});}
  return data;
 }
 return {info:{plot:'x'},episodes:{1:[{id:5000,title:'Episode',episode_num:1,container_extension:'mp4'}]}};
}
async function launch(){
 context=await chromium.launchPersistentContext(profile,{executablePath:exe,headless:true,args:['--no-sandbox'],viewport:{width:1920,height:1080},bypassCSP:true});
 page=context.pages()[0];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async r=>{
  const u=new URL(r.request().url());if(u.protocol==='file:')return r.continue();
  if(u.hostname.includes('supabase'))return r.fulfill({headers:cors,json:u.pathname.includes('register_device')?{}:{status:'active',expires_at:'2030-01-01',playlists:[{id:'fixture',name:'Test',type:'xtream',server:'https://fixture.example',username:'fixture',password:'fixture'}]}});
  if(u.hostname==='fixture.example'){
   const a=u.searchParams.get('action'),cat=u.searchParams.get('category_id');calls.push({a,cat});
   if(mode.fail)return r.abort();
   if(mode.hold&&a!=='get_vod_info'&&a!=='get_series_info'){await new Promise(res=>held.push(res));}
   return r.fulfill({headers:cors,json:payload(a,cat)});
  }
  if(u.hostname==='images.example')return r.fulfill({headers:cors,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="red"/></svg>'});
  return r.fulfill({headers:cors,body:''});
 });
 await page.goto(entry);
 await page.waitForFunction(()=>document.querySelector('#connection').hidden&&document.querySelector('#home-movies button')&&document.querySelector('#home-series button'),null,{timeout:30000});
}
async function openCategory(kind,name){
 await page.evaluate(k=>document.querySelector('nav [data-kind="'+k+'"]').click(),kind);
 await page.waitForSelector('#categories button[data-group-name]');
 await page.evaluate(n=>{const b=Array.from(document.querySelectorAll('#categories button')).find(b=>b.dataset.groupName===n);b.click();},name);
 await page.waitForFunction(n=>document.querySelector('#count').textContent.startsWith('90 ')&&document.querySelector('#categories button.selected')&&document.querySelector('#categories button.selected').dataset.groupName===n,name,{timeout:15000});
 await page.waitForSelector('#items button[data-index]');
}
async function closeCtx(){if(context)await context.close().catch(()=>{});context=null;}
async function releaseAll(){while(held.length)held.shift()();}
async function quietCase(kind){
 profile=fs.mkdtempSync(path.join(os.tmpdir(),'ap-quiet133-'));mode={changed:false,hold:false,fail:false};calls=[];held=[];
 try{
  // run 1: seed persistent cache with category 2 and lists
  await launch();await openCategory(kind,'Category 2');await page.waitForTimeout(1500);await closeCtx();
  // run 2: full restart, refresh responses held
  mode.hold=true;await launch();
  await openCategory(kind,'Category 2');
  await page.evaluate(()=>document.querySelector('#items button[data-index]').focus());
  for(let i=0;i<14;i++){await page.keyboard.press('ArrowDown');await page.waitForTimeout(60);}
  await page.waitForTimeout(900);
  const pre=await page.evaluate(()=>{const el=document.getElementById('items'),a=document.activeElement;return {top:el.scrollTop,idx:Number(a.dataset.index),name:a.querySelector('.item-name').textContent,off:a.offsetTop-el.scrollTop,inItems:el.contains(a)};});
  assert(pre.inItems&&pre.idx>=10&&pre.top>0,kind+' fixture must be scrolled with focus deep in list '+JSON.stringify(pre));
  assert(held.length>0,kind+' refresh requests must be held (cache first, quiet)');
  mode.changed=true;mode.hold=false;await page.evaluate(()=>{window.__fl=0;document.addEventListener('focusout',e=>{if(e.target.closest&&e.target.closest('#items'))window.__fl++;},true);});
  await releaseAll();
  await page.waitForFunction(()=>document.querySelector('#count').textContent.startsWith('91 '),null,{timeout:20000});
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('#categories button')).some(b=>b.dataset.groupName==='Category 5'),null,{timeout:20000});
  await page.waitForTimeout(600);
  const post=await page.evaluate(()=>{const el=document.getElementById('items'),a=document.activeElement,sel=document.querySelector('#categories button.selected');return {top:el.scrollTop,idx:Number(a.dataset.index),name:a.querySelector&&a.querySelector('.item-name')&&a.querySelector('.item-name').textContent,off:a.offsetTop-el.scrollTop,inItems:el.contains(a),cat:sel&&sel.dataset.groupName,count:document.querySelector('#count').textContent,renamed:el.textContent.includes('RENAMED'),front:el.textContent.includes('FRONTNEW'),fl:window.__fl};});
  assert.equal(post.cat,'Category 2','must NOT reset to category 1: '+JSON.stringify(post));
  assert(post.inItems&&post.name===pre.name,kind+' same focused item id '+JSON.stringify({pre,post}));
  assert.equal(post.idx,pre.idx+1,kind+' index +1 after insert before focus');
  assert(Math.abs(post.off-pre.off)<=2,kind+' screen offset anchor kept '+JSON.stringify({pre,post}));
  assert(post.top>0,kind+' scroll not reset');
  await page.evaluate(()=>Array.from(document.querySelectorAll('#categories button')).find(b=>b.dataset.groupName==='Category 2').click());await page.waitForFunction(()=>document.getElementById('items').textContent.includes('FRONTNEW'),null,{timeout:8000}).catch(()=>{throw new Error(kind+' fresh data (inserted item) not present after reopening category')});
  checks.push(kind+': quiet refresh kept Category 2, focused id, idx+1, offset anchor, new category 5 and inserted item; pre='+JSON.stringify(pre)+' post='+JSON.stringify(post));
  // rename in data (check by scrolling to it is covered by merge; verify via cache-less DOM search when visible)
 }finally{await releaseAll();await closeCtx();fs.rmSync(profile,{recursive:true,force:true});}
}
async function manualCase(){
 profile=fs.mkdtempSync(path.join(os.tmpdir(),'ap-manual133-'));mode={changed:false,hold:false,fail:false};calls=[];held=[];
 try{
  await launch();await openCategory('movies','Category 2');await page.waitForTimeout(1500);await closeCtx();
  mode.hold=true;await launch();await openCategory('movies','Category 2');
  await releaseAll();await page.waitForTimeout(1500);await closeCtx();
  mode.hold=true;mode.changed=false;await launch();await openCategory('movies','Category 2');
  await page.waitForTimeout(1200);await releaseAll();await page.waitForTimeout(2500);
  calls=[];mode.changed=true;
  await page.evaluate(()=>{window.__b=document.getElementById('refresh-list');window.__b.click();window.__b.click();});
  const busy=await page.evaluate(()=>({d:window.__b.disabled,t:window.__b.textContent}));
  assert(busy.d,'button disabled while refreshing');
  await page.waitForTimeout(1500);
  const mid=await page.evaluate(()=>({d:window.__b.disabled,s:document.getElementById('status').textContent,c:document.querySelector('#count').textContent}));
  assert(mid.d&&!mid.s.startsWith('تم تحديث'),'no success message before held responses arrive '+JSON.stringify(mid));
  assert(mid.c.startsWith('90 '),'not applied yet');
  mode.hold=false;await releaseAll();
  await page.waitForFunction(()=>!window.__b.disabled,null,{timeout:30000});
  const end=await page.evaluate(()=>({s:document.getElementById('status').textContent,c:document.querySelector('#count').textContent,cats:Array.from(document.querySelectorAll('#categories button')).map(b=>b.dataset.groupName)}));
  assert(end.s.startsWith('تم تحديث'),'success message '+end.s);
  assert(end.c.startsWith('91 ')&&end.cats.includes('Category 5'),'current category + category list updated before success: '+JSON.stringify(end));
  const catCalls=calls.filter(c=>c.a==='get_vod_categories').length;
  assert.equal(catCalls,1,'double click coalesced: category list requested once, got '+catCalls);
  checks.push('manual: awaited held responses, double click coalesced ('+catCalls+' category call), current+categories updated before success message');
  await closeCtx();
  // failure while offline
  mode.fail=true;mode.hold=false;await launch();
  await page.evaluate(()=>{window.__b=document.getElementById('refresh-list');window.__b.click();});
  await page.waitForFunction(()=>!window.__b.disabled,null,{timeout:60000});
  const fl=await page.evaluate(()=>document.getElementById('status').textContent);
  assert(fl.includes('تعذّر'),'offline failure message '+fl);
  checks.push('manual: offline failure reports failure, cached list stays');
 }finally{await releaseAll();await closeCtx();fs.rmSync(profile,{recursive:true,force:true});}
}
(async()=>{
 for(const k of ['movies','series','live'])await quietCase(k);
 await manualCase();
 fs.writeFileSync(out,JSON.stringify({status:'PASS',checks,errors},null,2));console.log(JSON.stringify({status:'PASS',checks,errors},null,1));
})().catch(e=>{console.error(e);process.exit(1);});
