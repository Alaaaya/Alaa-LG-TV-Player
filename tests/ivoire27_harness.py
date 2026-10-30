import asyncio,sys,json,http.server,threading,functools,os,urllib.parse
from playwright.async_api import async_playwright
ROOT=os.environ.get('ROOT',os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','dist'));BYPASS=os.environ.get('BYPASS','0')=='1'
class H(http.server.SimpleHTTPRequestHandler):
  def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(H,directory=ROOT));threading.Thread(target=srv.serve_forever,daemon=True).start()
PORT=srv.server_address[1]
LIVE=['MBC 1','MBC Drama','MBC 2','MBC 3','MBC 4','الجزيرة','العربية','beIN Sports 1','beIN Sports 2','beIN Sports 3','Rotana Cinema','Rotana Drama','OSN Movies','OSN Series','LBC','Syria TV','تلفزيون دبي','أبوظبي','قناة سما','الجديد','MTV Lebanon','ناشيونال جيوغرافيك','الشرق','الجزيرة الوثائقية','SSC 1']
COL=['#7a2333','#1c1814','#a9824a','#2b4a6b','#2f5d4a']
def svg(w,h,t,c):return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}"><defs><linearGradient id="g" x2="0" y2="1"><stop stop-color="{c}"/><stop offset="1" stop-color="#0d0b09"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="55%" text-anchor="middle" fill="#f3ebdd" font-family="serif" font-size="{w//9}">{t}</text></svg>'
async def route(r):
  u=urllib.parse.urlparse(r.request.url);q=urllib.parse.parse_qs(u.query)
  if 'supabase' in u.hostname:
    return await r.fulfill(headers={'access-control-allow-origin':'*','access-control-allow-headers':'*'},json={'status':'registered'} if 'register_device' in u.path else {'status':'active','expires_at':'2028-01-01','playlists':[{'id':'t1','type':'xtream','server':os.environ.get('XS','https://provider.example'),'name':'المزوّد','username':os.environ.get('XU','u'),'password':os.environ.get('XP','p')}]})
  if u.hostname=='images.example':
    n=u.path.split('-')[-1].split('.')[0]
    if 'badge' in u.path:
      i=int(n);return await r.fulfill(content_type='image/svg+xml',body=f'<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="60" fill="{COL[i%5]}"/><text x="60" y="68" fill="white" font-family="sans-serif" font-weight="bold" font-size="20" text-anchor="middle">{LIVE[i][:7]}</text></svg>')
    if 'back' in u.path: return await r.fulfill(content_type='image/svg+xml',body=svg(1600,900,'BACKDROP',COL[int(n)%5]))
    return await r.fulfill(content_type='image/svg+xml',body=svg(300,450,'POSTER '+n,COL[int(n)%5]))
  if u.hostname=='provider.example':
    a=(q.get('action') or [''])[0];d=[]
    if a.endswith('_categories'):d=[{'category_id':str(i+1),'category_name':n} for i,n in enumerate(['أخبار','ترفيه','وثائقي','رياضة','أطفال','أفلام عربية'])]
    elif a=='get_live_streams':d=[{'stream_id':i+1,'name':n,'category_id':str(i%4+1),'stream_icon':f'https://images.example/badge-{i}.svg','quality':'4K' if i%3==0 else 'HD'} for i,n in enumerate(LIVE)]
    elif a=='get_vod_streams':d=[{'stream_id':2001+i,'name':f'فيلم تجريبي {i+1} (2025)','category_id':str(i%4+1),'stream_icon':f'https://images.example/poster-{i}.svg','backdrop_path':[f'https://images.example/back-{i}.svg'],'added':str(10000-i),'plot':'وصف تجريبي يقدّمه مزوّد المحتوى لاختبار عرض التفاصيل في الثيم الجديد.','genre':'دراما','rating':'8.2','year':'2025','container_extension':'mp4'} for i in range(80)]
    elif a=='get_series':d=[{'series_id':3001+i,'name':f'مسلسل تجريبي {i+1}','category_id':str(i%4+1),'cover':f'https://images.example/poster-{i+3}.svg','rating':'7.8','year':'2024','backdrop_path':[f'https://images.example/back-{i}.svg'],'plot':'ملخص تجريبي.'} for i in range(36)]
    elif a=='get_series_info':d={'info':{'plot':'ملخص تجريبي من المزوّد عن أحداث المسلسل وشخصياته.','genre':'دراما'},'episodes':{'1':[{'id':4001+k,'episode_num':k+1,'title':f'الحلقة {k+1}','info':{'plot':'وصف الحلقة.','duration':'00:43:20'},'container_extension':'mp4'} for k in range(6)],'2':[{'id':4101,'episode_num':1,'title':'بداية جديدة','container_extension':'mp4'}]}}
    return await r.fulfill(json=d,headers={'access-control-allow-origin':'*','access-control-allow-headers':'*'})
  if os.environ.get('XS') and u.hostname in os.environ['XS']:
    try:
      resp=await r.fetch(timeout=90000);h=dict(resp.headers);h['access-control-allow-origin']='*';h['access-control-allow-headers']='*'
      return await r.fulfill(response=resp,headers=h)
    except Exception as e:return await r.abort()
  if os.environ.get('XS') and u.hostname not in ('127.0.0.1','localhost'):
    import urllib.request as UR
    def get():
      req=UR.Request(r.request.url,headers={'User-Agent':'Mozilla/5.0'})
      with UR.urlopen(req,timeout=60) as f:return f.read(),f.headers.get('content-type','application/octet-stream')
    try:
      body,ct=await asyncio.get_event_loop().run_in_executor(None,get)
      return await r.fulfill(body=body,content_type=ct,headers={'access-control-allow-origin':'*','access-control-allow-headers':'*'})
    except Exception as e:return await r.abort()
  return await r.continue_()
INIT="""HTMLMediaElement.prototype.load=function(){};HTMLMediaElement.prototype.play=function(){return Promise.resolve()};HTMLMediaElement.prototype.pause=function(){};localStorage.setItem('ap-theme','%s');"""
async def setup(theme,ctxp=None):
  p=await async_playwright().start();b=await p.chromium.launch(args=['--no-sandbox'])
  pg=await b.new_page(viewport={'width':1920,'height':1080},bypass_csp=BYPASS);errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)))
  await pg.add_init_script(INIT%theme)
  await pg.route('**/*',route)
  await pg.goto(f'http://127.0.0.1:{PORT}/index.html')
  for _ in range(100):
    if await pg.evaluate("document.querySelectorAll('#home-movies button').length"):break
    await pg.wait_for_timeout(200)
  await pg.wait_for_timeout(500)
  return p,b,pg,errs
async def shots(theme,out):
  p,b,pg,errs=await setup(theme)
  os.makedirs(out,exist_ok=True)
  async def s(n):await pg.wait_for_timeout(700);await pg.screenshot(path=f'{out}/{n}.png')
  await s('home')
  await pg.click('nav [data-kind="live"]');await pg.wait_for_selector('#items button');await pg.locator('#items button').nth(2).focus();await s('live')
  await pg.locator('#items button').nth(2).click();await pg.wait_for_timeout(400);await s('player-live')
  await pg.keyboard.press('Escape');await pg.evaluate("document.getElementById('stop')&&document.getElementById('stop').click()")
  await pg.click('nav [data-kind="movies"]',force=True);await pg.wait_for_timeout(600);await pg.locator('#items button').nth(0).focus();await s('movies')
  await pg.locator('#items button').nth(0).click();await s('movie-detail')
  await pg.click('#movie-back');await pg.click('nav [data-kind="series"]',force=True);await pg.wait_for_timeout(600);await s('series')
  await pg.locator('#items button').nth(0).click();await pg.wait_for_timeout(800);await s('series-detail')
  await pg.click('#series-back');await pg.click('#settings-open',force=True);await s('settings')
  print('ERR',errs);await b.close();await p.stop()
if __name__=='__main__':asyncio.run(shots(sys.argv[1],sys.argv[2]))
