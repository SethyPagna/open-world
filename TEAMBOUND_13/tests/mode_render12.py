from pathlib import Path
from playwright.sync_api import sync_playwright
import json
P=Path(__file__).parent.parent;out=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=False,args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 p=b.new_page(viewport={'width':1000,'height':650});errs=[];p.on('pageerror',lambda e:errs.append(str(e)));p.set_content((P/'public/index.html').read_text(),wait_until='load',timeout=40000);p.evaluate('renderer.quality=0;renderer.shadows=false;renderer.resize();TBLab.manual(true)')
 for mode in ['SUMMIT','CHAINED','BODY','ECHO','RIVER','DIVE','DELIVERY','TOWER']:
  d=p.evaluate('''m=>{TBLab.start(m);TBLab.step(90,{});renderer.render(scene.root);return{mode:TBLab.status.mode,avatarCount:avatarNodes.size,finite:[...avatarNodes.values()].every(n=>Array.from(n.skinState.palette).every(Number.isFinite)),error:drawError};}''',mode)
  out.append({'mode':mode,'passed':d['finite'] and d['avatarCount']>0 and not d['error'] and not errs,'detail':d});print(mode,out[-1]['passed'])
 b.close()
(P/'tests/mode_render_report.json').write_text(json.dumps({'fixture':'Headed Chromium software WebGL. Startup/render smoke, NOT full rendered playthroughs.','checks':out,'errors':errs},indent=2))
if any(not t['passed'] for t in out):raise SystemExit(1)
