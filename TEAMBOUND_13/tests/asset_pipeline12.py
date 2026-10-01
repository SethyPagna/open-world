"""Parser/container smoke checks with synthetic data, NOT real Rocketbox visual validation."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,struct,zlib,base64
P=Path(__file__).parent.parent

def prop(x):
 if isinstance(x,str):
  b=x.encode();return b'S'+struct.pack('<I',len(b))+b
 if isinstance(x,int):return b'L'+struct.pack('<q',x)
 raw=struct.pack('<'+'d'*len(x),*x);b=zlib.compress(raw)
 return b'd'+struct.pack('<III',len(x),1,len(b))+b

def node(name,props,children,start):
 n=name.encode();p=b''.join(prop(x) for x in props);at=start+13+len(n)+len(p);ch=b''
 for item in children:
  c=node(*item,at);ch+=c;at+=len(c)
 end=at+13
 return struct.pack('<IIIB',end,len(props),len(p),len(n))+n+p+ch+b'\0'*13
head=b'Kaydara FBX Binary  \0\x1a\0'+struct.pack('<I',7400)
fx=head+node('Objects',[],[('Geometry',[100,'fixture\0\1Geometry','Mesh'],[('Vertices',[[0.,0.,0.,1.,0.,0.,0.,1.,0.]],[])])],len(head))+b'\0'*13
results=[]
def result(name,ok,detail=None):results.append({'test':name,'passed':bool(ok),'detail':detail});print(name,ok)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=False,args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 p=b.new_page(viewport={'width':850,'height':600});p.set_content((P/'public/index.html').read_text(),wait_until='load',timeout=40000);p.evaluate('renderer.quality=0;renderer.shadows=false;renderer.resize()')
 decoded=p.evaluate('''async b64=>{let b=Uint8Array.from(atob(b64),x=>x.charCodeAt(0));let r=await fbxRead12(b.buffer);return r[0].c[0].c[0].p[0];}''',base64.b64encode(fx).decode())
 result('FBX 7.4 compressed array and nested node offsets',decoded==[0,0,0,1,0,0,0,1,0])
 rejected=p.evaluate('''async b64=>{let b=Uint8Array.from(atob(b64),x=>x.charCodeAt(0));let roots=await fbxRead12(b.buffer);try{fbxToHuman12(roots);return false}catch(e){return /topology/.test(e.message)}}''',base64.b64encode(fx).decode())
 result('Wrong source topology rejected',rejected)
 rejected=p.evaluate('''async b64=>{let b=Uint8Array.from(atob(b64),x=>x.charCodeAt(0));try{await fbxRead12(b.slice(0,100).buffer);return false}catch(e){return true}}''',base64.b64encode(fx).decode())
 result('Truncated FBX rejected',rejected)
 # A deliberately tiny fixture exercises asset saving. It is not a human/model screenshot.
 p.evaluate('''()=>{let parts=[0,1,2].map(k=>{let g=geometry([0,0,0,.1,0,0,0,.1,0],[0,1,2],null,[0,0,1,0,0,1]);g.joints=new Float32Array(12);g.weights=new Float32Array([1,0,0,0,1,0,0,0,1,0,0,0]);g.fold=new Float32Array(12);return{key:'synthetic'+k,geo:g,mat:material('#ffffff',16+k),headOnly:k>0,helmet:k===2}});let c=document.createElement('canvas');c.width=c.height=2;let x=c.getContext('2d');x.fillStyle='#98634a';x.fillRect(0,0,2,2);humanAsset12.parts=parts;humanAsset12.counts={source:'synthetic fixture',triangles:3};humanAsset12.textures=[0,1,2].map(()=>({data:c.toDataURL(),color:humanGLTexture12(c),normal:null}));}''')
 with p.expect_download(timeout=15000) as dl:p.evaluate('saveHumanGame12()')
 tmp=P/'tests/_synthetic_export.html';dl.value.save_as(str(tmp));saved=tmp.read_text();result('Save-offline inserts model payload and preserves the main script','id="embedded-human12"' in saved and 'const ORIGINAL_PAGE12=' in saved)
 p2=b.new_page(viewport={'width':850,'height':600});errs=[];p2.on('pageerror',lambda e:errs.append(str(e)));p2.set_content(saved,wait_until='load',timeout=40000);p2.evaluate('renderer.quality=0;renderer.shadows=false;renderer.resize()');p2.wait_for_function('humanAsset12.parts!==null',timeout=20000)
 result('Saved-file embedded model and textures reload with no external download',p2.evaluate('humanAsset12.parts.length===3&&humanAsset12.textures.length===3&&humanAsset12.status.includes("offline")') and not errs,errs)
 result('Embedded 48-joint weights retain their values',p2.evaluate('humanAsset12.parts.every(a=>a.geo.weights[0]===1&&a.geo.joints.length===12)'))
 tmp.unlink();b.close()
(P/'tests/asset_pipeline_report.json').write_text(json.dumps({'fixture':'Synthetic FBX and triangle meshes only. Actual external human visual import not tested locally.','checks':results},indent=2))
if any(not r['passed'] for r in results):raise SystemExit(1)
