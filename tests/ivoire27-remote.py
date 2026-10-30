import asyncio,random
from ivoire27_harness import *
async def main():
  p,b,pg,errs=await setup('ivoire');lost=0;presses=0
  fk="(()=>{const a=document.getElementById('ivoire-exact').shadowRoot.activeElement;return a?a.dataset.key||a.tagName:null})()"
  for tab in ['home','live','movies','series','settings']:
    await pg.click(f'#ivoire-exact >> [data-key="tab-{tab}"]');await pg.wait_for_timeout(700)
    for i in range(30):
      await pg.keyboard.press(random.choice(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight']));presses+=1;await pg.wait_for_timeout(60)
      if not await pg.evaluate(fk):lost+=1
  print('presses',presses,'lost',lost)
  await pg.click('#ivoire-exact >> [data-key="tab-settings"]');await pg.wait_for_timeout(500)
  await pg.click('#ivoire-exact >> [data-key="theme-jamra"]');await pg.wait_for_timeout(800)
  print(await pg.evaluate("[document.body.dataset.theme,document.getElementById('ivoire-exact').style.display,document.getElementById('jamra-exact').style.display,localStorage.getItem('ap-theme')]"))
  await pg.evaluate("document.getElementById('theme-ivoire').click()");await pg.wait_for_timeout(800)
  print(await pg.evaluate("[document.body.dataset.theme,document.getElementById('ivoire-exact').style.display,document.getElementById('jamra-exact').style.display]"))
  print('ERR',errs);await b.close();await p.stop()
asyncio.run(main())
