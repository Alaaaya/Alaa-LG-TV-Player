import asyncio
from playwright.async_api import async_playwright
N=['home','live','player-live','player-live-list','movies','movie-detail','series','series-detail','player-series','settings']
async def main():
  errs=[];clicks=0;keys=0
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1920,'height':1080})
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('file:///workspace/work/ivoire/Alaa_Player_Ivoire.html');await pg.wait_for_timeout(1500)
    for n in N:
      await pg.evaluate(f"show('{n}')");await pg.wait_for_timeout(500)
      for seq in ['ArrowDown','ArrowRight','ArrowRight','ArrowDown','ArrowLeft','ArrowUp','ArrowDown','ArrowDown','ArrowRight','Enter','Escape']:
        await pg.keyboard.press(seq);keys+=1;await pg.wait_for_timeout(60)
      await pg.evaluate(f"show('{n}')");await pg.wait_for_timeout(400)
      cnt=await pg.evaluate("document.querySelectorAll('#stage [data-act]:not([data-act=exit]):not([data-act=closeModal]), #stage [data-go]').length")
      for i in range(min(cnt,40)):
        await pg.evaluate(f"(()=>{{const e=[...document.querySelectorAll('#stage [data-act]:not([data-act=exit]):not([data-act=closeModal]), #stage [data-go]')][{i}];if(e&&e.isConnected)e.click()}})()");clicks+=1
        await pg.wait_for_timeout(30)
        if await pg.evaluate("window.currentScreen")!=n: await pg.evaluate(f"show('{n}')");await pg.wait_for_timeout(120)
      print(n,cnt,flush=True)
    # specific
    await pg.evaluate("show('player-series')");await pg.wait_for_timeout(1800)
    for k in ['ArrowDown','ArrowRight','ArrowRight','ArrowLeft','Enter',' ',' ']:await pg.keyboard.press(k);await pg.wait_for_timeout(80)
    await pg.evaluate("show('player-live')");await pg.wait_for_timeout(1600)
    for k in ['PageDown','PageDown','PageUp','Enter','ArrowDown','Enter','Escape']:await pg.keyboard.press(k);await pg.wait_for_timeout(120)
    await pg.evaluate("show('home')");await pg.keyboard.press('ArrowUp');await pg.evaluate("document.querySelector('[data-act=search]').click()");await pg.wait_for_timeout(200);await pg.keyboard.type('sky');await pg.wait_for_timeout(200)
    print('search results',await pg.evaluate("document.querySelectorAll('#gres .res').length"))
    print('clicks',clicks,'keys',keys,'ERR',errs)
    await b.close()
asyncio.run(main())
