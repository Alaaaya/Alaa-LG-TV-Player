import os
D=os.path.dirname(os.path.abspath(__file__))
import json,re
css=open(os.path.join(D,'..','src','style.css')).read()
css=css.replace('html,body{width:100%;height:100%;background:#000;overflow:hidden}\n','')
css=css.replace('body{--paper','#stage{--paper',1)
css=css.replace('body[data-','#stage[data-').replace('body.noblur','#stage.noblur').replace('body.clean #switcher','#stage.clean #switcher')
css=css.replace('#stage[data-accent=teal]','#stage[data-accent=teal]')
assert 'body' not in re.sub(r'[a-z-]+-body|tbody','',css), [m.start() for m in re.finditer('body',css)][:5]
css=css+'\n'+open(os.path.join(D,'extra.css')).read()
open(os.path.join(D,'..','..','..','app','ivoire-style.txt'),'w').write(css)
src=open(os.path.join(D,'ivoire.src.js')).read()
icons=open(os.path.join(D,'icons.js')).read().strip()
src=src.replace("/*__CSS__*/''",json.dumps(css)).replace('/*__ICONS__*/',icons)
open(os.path.join(D,'..','..','..','app','ivoire.js'),'w').write(src)
print(len(css),len(src))
