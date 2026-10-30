import asyncio,sys
from playwright.async_api import async_playwright
N=['home','live','player-live','player-live-list','movies','movie-detail','series','series-detail','player-series','settings']
async def main():
  errs=[]
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1920,'height':1080})
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    for n in N:
      await pg.goto('file:///workspace/work/ivoire/Alaa_Player_Ivoire.html?clean&screen='+n);await pg.wait_for_timeout(2300)
      await pg.screenshot(path=f'out/{n}.png');print(n,await pg.evaluate('window.currentScreen'),flush=True)
    print('ERR',errs)
    await b.close()
asyncio.run(main())
