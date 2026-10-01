from playwright.sync_api import sync_playwright
from pathlib import Path
import json,time,struct,os
P=Path(__file__).parent.parent
results=[]
def result(name,ok,detail=''):
 results.append({'test':name,'passed':bool(ok),'detail':detail});print(name,ok,str(detail)[:200])
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=False,args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 p=b.new_page(viewport={'width':1100,'height':720});errors=[];console=[]
 p.on('pageerror',lambda e:errors.append(str(e)));p.on('console',lambda m:console.append(m.text) if m.type=='error' else None)
 p.set_content((P/'public/index.html').read_text(),wait_until='load',timeout=40000);p.bring_to_front();p.evaluate('renderer.quality=0;renderer.shadows=false;renderer.resize();');p.wait_for_timeout(500)
 print('err',errors,console)
 result('game boot and shader compile',not errors and not p.locator('#fatal').inner_text(),errors+console)
 if errors:raise RuntimeError(str(errors))
 print('humanpanel',p.locator('#humanPanel12').count())
 p.screenshot(path=str(P/'tests/v12_menu.png'))
 p.evaluate('toggleMotionLab12(true)');p.wait_for_timeout(400);p.screenshot(path=str(P/'tests/v12_studio.png'))
 result('inspector opens',p.evaluate('motionStudio12.active'))
 for pose in ['walk','run','crouch','reach','grip','swim','stand']:
  p.locator(f'[data-pose12="{pose}"]').click();p.wait_for_timeout(220)
  result('pose '+pose,p.evaluate('Array.from(motionStudio12.avatar.skinState.palette).every(Number.isFinite)'))
  if pose in ['reach','crouch']:p.screenshot(path=str(P/f'tests/v12_{pose}.png'))
 p.evaluate('toggleMotionLab12(false);TBLab.start("SUMMIT")');p.wait_for_timeout(700)
 p.screenshot(path=str(P/'tests/v12_gameplay.png'))
 initial=p.evaluate('TBLab.status.player.pos')
 p.keyboard.down('Space');p.wait_for_function('player.jumps>0',timeout=60000);mid=p.evaluate('TBLab.status.player.pos');p.keyboard.up('Space');p.wait_for_function('player.vel[1]<=0&&sim.time>1',timeout=60000);p.evaluate('TBLab.step(30,{})');p.wait_for_timeout(500)
 result('keyboard jump raises body',mid[1]>initial[1]+.1,{'from':initial,'to':mid})
 p.keyboard.press('KeyV');p.wait_for_timeout(120);p.evaluate('TBLab.step(1,{});renderer.render(scene.root)');p.screenshot(path=str(P/'tests/v12_fps.png'))
 result('FPS hides own head, keeps skinned arms',p.evaluate("TBLab.status.view==='FPS'&&[...avatarNodes.values()][0].skinMeshes.some(n=>!n._headOnly&&n.visible)&&[...avatarNodes.values()][0].skinMeshes.filter(n=>n._headOnly).every(n=>!n.visible)"))
 # Project the actual hand bones into the framebuffer, not just a visibility flag.
 projections=p.evaluate("()=>{let n=[...avatarNodes.values()][0];return [8,11].map(id=>{let v=mpoint(n.skinState.poses[id],[0,-.045,0]);return renderer.project(add(n.p,Qrot(Qyaw(n.r[1]),v)))});}")
 result('Both first-person palms project inside the viewport',all(q and 0<q[0]<1100 and 0<q[1]<720 for q in projections),projections)
 p.keyboard.press('KeyV');p.wait_for_timeout(800)
 report=p.evaluate('TBAnatomy.report');(P/'tests/anatomy_report.json').write_text(json.dumps(report,indent=2))
 result('skin matrices finite',all(a['finite'] for a in report['avatars']))
 feet=[v for a in report['avatars'] for v in a.get('feet',[]) if v is not None]
 result('stationary sole target residual below 1 cm',feet and max(feet)<.01,feet)
 # Validate skin weights and geometry without depending on the rendered screenshot.
 checks=p.evaluate('''()=>({weights:anatomy12.every(a=>{let w=a.geo.weights;for(let k=0;k<w.length;k+=4)if(Math.abs(w[k]+w[k+1]+w[k+2]+w[k+3]-1)>.0001)return false;return true}),indices:anatomy12.every(a=>Array.from(a.geo.i).every(i=>i<a.geo.p.length/3)),joints:anatomy12.every(a=>Array.from(a.geo.joints).every(i=>i>=0&&i<48)),twoRes:anatomyLow12.reduce((s,a)=>s+a.geo.i.length,0)<anatomy12.reduce((s,a)=>s+a.geo.i.length,0)})''')
 for k,v in checks.items():result(k,v)
 # Actual browser asset export, verify it is a binary GLB with skins and clips.
 with p.expect_download(timeout=30000) as dl:
  p.evaluate('downloadGLB12(false)')
 dl.value.save_as(str(P/'assets/teambound_explorer_rigged.glb'))
 raw=(P/'assets/teambound_explorer_rigged.glb').read_bytes();jlen=struct.unpack_from('<I',raw,12)[0];doc=json.loads(raw[20:20+jlen]);
 result('GLB container length',struct.unpack_from('<I',raw,8)[0]==len(raw))
 result('GLB skin and animations',len(doc['skins'][0]['joints'])==48 and len(doc['animations'])==3)
 # Explicit rejection rather than interpreting arbitrary input as a verified source model.
 tga=p.evaluate('''()=>{let a=new Uint8Array(30);a[2]=2;a[12]=2;a[14]=2;a[16]=24;a[17]=32;a.set([0,0,255,0,255,0,255,0,0,255,255,255],18);let c=tgaCanvas12(a.buffer,2);return Array.from(c.getContext('2d').getImageData(0,0,2,2).data);}''')
 result('TGA RGB orientation',tga==[255,0,0,255,0,255,0,255,0,0,255,255,255,255,255,255],tga)
 # Mock download failure: ensure no fake-success banner or missing avatar.
 p.evaluate('()=>{humanBytes12=async()=>{throw Error("test blocked download")};}')
 p.evaluate('loadPhotographicHuman12()');p.wait_for_timeout(100)
 result('source download failure retains explorer',p.evaluate("!!humanAsset12.error&&!humanAsset12.parts&&[...avatarNodes.values()][0].skinMeshes.some(n=>n.visible)"))
 result('no new browser errors',not errors,errors)
 (P/'tests/browser_checks.json').write_text(json.dumps({'fixture':'Headed Chromium + SwiftShader; actual HTML injected into about:blank because direct navigation is managed-blocked.','checks':results,'pageErrors':errors,'console':console,'externalHumanRender':'Not verified: external asset download unavailable in test environment.'},indent=2))
 b.close()
