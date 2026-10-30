f=open('fonts.css').read();c=open('style.css').read();j=open('app.js').read();d=open('app_data.json').read();i=open('app_images.json').read()
h=f'''<!doctype html><html lang="ar" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data: blob:; connect-src 'none'">
<title>Alaa Player · Ivoire</title><style>{f}
{c}</style></head><body data-accent="rose" data-mode="day"><div id="switcher" role="toolbar" aria-label="الشاشات"></div><main id="stage"><div id="app"></div></main>
<script>window.APP_DATA={d};window.APP_IMAGES={i};</script><script>{j}</script></body></html>'''
open('Alaa_Player_Ivoire.html','w').write(h);print(len(h))
