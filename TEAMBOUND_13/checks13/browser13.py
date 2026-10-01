from pathlib import Path
from playwright.sync_api import sync_playwright
import json,struct,traceback
P=Path(__file__).resolve().parents[1];out=P/'checks13';results=[]
def check(name,ok,detail=None):
 results.append(dict(test=name,passed=bool(ok),detail=detail));print(name, bool(ok),str(detail)[:180],flush=True)
fixture='''()=>{let canvas=document.createElement('canvas');canvas.width=canvas.height=4;let c=canvas.getContext('2d');c.fillStyle='#987566';c.fillRect(0,0,4,4);const color=canvas.toDataURL();c.fillStyle='#8080ff';c.fillRect(0,0,4,4);const normal=canvas.toDataURL();return{format:'teambound-rescue-v1',counts:{triangles:3,renderJoints:48,fixture:true},license:'Synthetic test fixture, not a human.',source:'Synthetic locally generated triangles',parts:['rescueSuit','rescueHead','rescueHelmet'].map((key,k)=>({key,headOnly:k>0,helmet:k===2,p:[-.10,0,0,.10,0,0,0,1.8,0],n:[0,0,1,0,0,1,0,0,1],uv:[0,0,1,0,.5,1],i:[0,1,2],joints:Array(12).fill(0),weights:[1,0,0,0,1,0,0,0,1,0,0,0],fold:Array(12).fill(0)})),textures:[0,1,2].map(()=>({color,normal}))};}'''
errors=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=False,args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 try:
  p=b.new_page(viewport={'width':1200,'height':780});p.on('pageerror',lambda e:errors.append(str(e)))
  p.set_content((P/'public/index.html').read_text(),wait_until='load',timeout=40000)
  p.evaluate('renderer.quality=0;renderer.shadows=false;renderer.resize()');p.wait_for_timeout(500)
  check('V13 boot and shaders',not errors,errors)
  check('Prepared asset controls mounted',p.locator('#humanImport13').count()==1 and p.locator('#humanLoad12').text_content().startswith('Install'))
  p.screenshot(path=str(out/'menu13.png'))
  p.evaluate('toggleMotionLab12(true)');p.locator('#portrait13').click();p.wait_for_timeout(200)
  check('Portrait inspection camera',p.evaluate('motionStudio12.distance===.6&&motionStudio12.focusY===1.64'))
  p.locator('#slow13').click();check('Slow-motion inspection',p.evaluate('motionStudio12.rate===.25'))
  p.locator('#pause13').click();t=p.evaluate('motionStudio12.time');p.wait_for_timeout(200);check('Inspection pause freezes pose time',p.evaluate('motionStudio12.time')==t)
  p.locator('#pause13').click();p.locator('#body13').click();p.wait_for_timeout(100);p.evaluate('toggleMotionLab12(false);TBLab.start("SUMMIT");TBLab.step(30,{})');p.wait_for_timeout(300)
  p.screenshot(path=str(out/'explorer_fallback13.png'))
  initial=p.evaluate('player.pos.slice()');p.keyboard.down('Space');p.wait_for_function('player.jumps>0',timeout=20000);mid=p.evaluate('player.pos.slice()');p.keyboard.up('Space')
  check('Keyboard jump remains functional',mid[1]>initial[1],{'before':initial,'after':mid})
  p.keyboard.press('KeyV');p.wait_for_timeout(200);p.evaluate('TBLab.step(2,{})')
  check('First person has skinned body and hides head',p.evaluate('view==="FPS"&&[...avatarNodes.values()][0].skinMeshes.some(m=>!m._headOnly&&m.visible)&&[...avatarNodes.values()][0].skinMeshes.filter(m=>m._headOnly).every(m=>!m.visible)'))
  p.screenshot(path=str(out/'fps_fallback13.png'))
  data=p.evaluate(fixture);p.evaluate('window.fixture13='+json.dumps(data))
  check('Valid character data accepted',p.evaluate('TBHuman13.validate(fixture13).height===1.8'))
  rejects=p.evaluate('''()=>{let failures={};for(let [name,mutate]of Object.entries({joint:d=>d.parts[0].joints[0]=48,index:d=>d.parts[0].i[0]=100,weights:d=>d.parts[0].weights[0]=.3,nonfinite:d=>d.parts[0].p[0]=NaN,externalTexture:d=>d.textures[0].color='https://example.com/a.jpg',truncated:d=>d.parts[0].n.pop(),scale:d=>d.parts[0].p[8]=8,classification:d=>d.parts[0].headOnly=true})){let d=structuredClone(fixture13);mutate(d);try{TBHuman13.validate(d);failures[name]=false}catch{failures[name]=true}}return failures}''')
  for name,ok in rejects.items():check('Reject '+name,ok)
  # Freeze simulation; character updates must not mutate authoritative game state.
  p.evaluate('TBLab.manual(true);TBLab.step(1,{})');before=p.evaluate('JSON.stringify({p:player,props:sim.props})');p.evaluate('TBHuman13.commit(fixture13)');after=p.evaluate('JSON.stringify({p:player,props:sim.props})')
  check('Asset commit does not change physics',before==after)
  check('Three imported parts and normal maps committed',p.evaluate('humanAsset12.parts.length===3&&humanAsset12.textures.every(t=>!!t.normal)&&TBHuman13.status.revision===1'))
  p.evaluate('TBLab.step(1,{})');p.wait_for_timeout(100)
  check('Imported FPS head is hidden',p.evaluate('[...avatarNodes.values()][0]._humanMeshes12.filter(m=>m._headOnly).every(m=>!m.visible)'))
  p.evaluate('TBHuman13.commit(fixture13)');check('Reload does not accumulate duplicate imported meshes',p.evaluate('[...avatarNodes.values()].every(n=>n.rig.body.children.filter(x=>x._assetTexture!==undefined).length===3)'))
  bad=structuredClone if False else None
  reject=p.evaluate('''async()=>{let old=humanAsset12.parts,d=structuredClone(fixture13);d.textures[0].color='data:image/png;base64,AAAA';try{await TBHuman13.commit(d);return false}catch{return humanAsset12.parts===old&&humanAsset12.textures.length===3}}''')
  check('Failed texture decode retains working model',reject)
  with p.expect_download(timeout=20000) as dl:p.evaluate('saveHumanGame12()')
  saved=out/'_fixture_saved.html';dl.value.save_as(str(saved));s=saved.read_text();check('Save offline keeps client and data package','id="embedded-human12"' in s and 'setupHuman13' in s)
  p2=b.new_page(viewport={'width':900,'height':700});e2=[];p2.on('pageerror',lambda e:e2.append(str(e)));p2.set_content(s,wait_until='load',timeout=40000);p2.wait_for_function('humanAsset12.parts!==null',timeout=20000)
  check('Embedded package reloads without remote downloads',p2.evaluate('humanAsset12.status.includes("offline")&&humanAsset12.textures.every(t=>!!t.normal)') and not e2,e2)
  with p.expect_download(timeout=20000) as dl:p.evaluate('downloadGLB12(true)')
  dest=out/'_fixture.glb';dl.value.save_as(str(dest));raw=dest.read_bytes();n=struct.unpack_from('<I',raw,12)[0];doc=json.loads(raw[20:20+n]);check('Imported GLB retains skeleton, textures, and normal maps',len(doc['skins'][0]['joints'])==48 and all('normalTexture'in m for m in doc['materials']))
  check('No browser exceptions',not errors,errors);saved.unlink();dest.unlink()
 finally:b.close()
(out/'browser_report13.json').write_text(json.dumps({'scope':'Chromium SwiftShader actual v13 HTML. Ingestion tests use synthetic triangles, not the remote real human. No real-human gameplay render was performed in this local environment.','checks':results,'pageErrors':errors},indent=2))
if any(not r['passed'] for r in results):raise SystemExit(1)
