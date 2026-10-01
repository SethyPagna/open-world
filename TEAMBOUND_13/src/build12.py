from pathlib import Path
import re,hashlib,json,base64
P=Path(__file__).parent; root=P.parent
s=(P/'base_v11.html').read_text()
# Replace the actual character implementation, not the gameplay or server simulation.
a=s.index('/* Articulated alpine');b=s.index('/* TEAMBOUND v9',a)
s=s[:a]+(P/'character12.js').read_text()+'\n'+s[b:]
a=s.index('function contactPose(');b=s.index('function headFace(',a)
s=s[:a]+s[b:]
a=s.index('function modePose10(');b=s.index('\nfunction ',a+20)
s=s[:a]+(P/'motion12.js').read_text()+'\n'+s[b:]
# Add GPU skinning to both colour and depth passes.
attr='layout(location=3)in vec4 skinJoints;layout(location=4)in vec4 skinWeights;layout(location=5)in vec4 jointFold;uniform float uSkinned;uniform mat4 uBones[48];uniform vec4 uBends;'
fn='''mat4 poseSkin(){if(uSkinned<.5)return mat4(1.);return uBones[int(skinJoints.x)]*skinWeights.x+uBones[int(skinJoints.y)]*skinWeights.y+uBones[int(skinJoints.z)]*skinWeights.z+uBones[int(skinJoints.w)]*skinWeights.w;}
vec3 foldPosition(vec3 P,vec3 N){if(uSkinned<.5||jointFold.x<.5)return P;int j=int(jointFold.x)-1;float bend=uBends[j];float fold=sin(P.y*190.+jointFold.z*1.3)*.0036*bend*jointFold.y*(.5+.5*max(0.,jointFold.z));return P+N*fold;}
'''
s=s.replace('uniform mat4 world, vp,lightVP;',attr+'uniform mat4 world, vp,lightVP;')
s=s.replace('void main(){vec4 p=world*vec4(position,1.);',fn+'void main(){mat4 bone=poseSkin();vec4 p=world*bone*vec4(foldPosition(position,normal),1.);')
s=s.replace('transpose(inverse(mat3(world)))*normal','transpose(inverse(mat3(world)))*mat3(bone)*normal')
old='layout(location=0)in vec3 position;uniform mat4 world,lightVP;void main(){gl_Position=lightVP*world*vec4(position,1.);}'
new='layout(location=0)in vec3 position;layout(location=1)in vec3 normal;'+attr+'uniform mat4 world,lightVP;'+fn+'void main(){gl_Position=lightVP*world*poseSkin()*vec4(foldPosition(position,normal),1.);}'
# shadow source is in a JS single template, preserve newlines safely.
s=s.replace(old,new)
s=s.replace("['world','vp','lightVP'","['uSkinned','uBones','uBends','humanTex','uHumanReady','world','vp','lightVP'")
s=s.replace('[[0,g.p,3],[1,g.n,3],[2,g.uv,2]]','[[0,g.p,3],[1,g.n,3],[2,g.uv,2],...(g.joints?[[3,g.joints,4],[4,g.weights,4],[5,g.fold,4]]:[])]')
s=s.replace('gl.uniformMatrix4fv(s.world,false,ob.world);gl.drawElements','gl.uniformMatrix4fv(s.world,false,ob.world);this.skinUniforms(s,ob);gl.drawElements')
s=s.replace('let m=ob.mat;gl.uniform3fv','this.skinUniforms(l,ob);let m=ob.mat;gl.uniform3fv')
loc=s.index(' program(v,f){')
s=s[:loc]+''' skinUniforms(l,ob){let gl=this.gl;gl.uniform1f(l.uSkinned,ob.skin?1:0);if(ob.skin){gl.uniformMatrix4fv(l.uBones,false,ob.skin.palette);gl.uniform4fv(l.uBends,ob.skin.bends);}}
'''+s[loc:]
s=s.replace('if(uType>8.5){','if(uType>8.5&&uType<9.5){')
s=s.replace('float sh=shadowing(n);','float sh=shadowing(n);if(uType>9.5)sh=mix(1.,sh,.60);')
# Stable model-space appearance: no world-space swimming fabric on the skinned explorer.
s=s.replace('uniform sampler2D noiseTex,shadowTex,albedoTex,normalTex,armTex;','uniform sampler2D noiseTex,shadowTex,albedoTex,normalTex,armTex,humanTex;uniform float uHumanReady;')
# Exact actual declaration may have different arrangement, fallback below.
if 'uniform float uHumanReady' not in s:
 a=s.index('precision highp float;',s.index('this.fs='))+len('precision highp float;')
 s=s[:a]+'uniform sampler2D humanTex;uniform float uHumanReady;'+s[a:]
pat='vec3 view=normalize(uEye-vP),halfway=normalize(uSun+view);'
extra='''
if(uType>9.5&&uType<11.5){float weave=(sin(vUV.x*920.)*sin(vUV.y*1100.))*.017;float grain=texture(noiseTex,vUV*24.).r;base*=.88+grain*.18+weave;rough=mix(.86,.95,grain);}
if(uType>11.5&&uType<12.5){if(uHumanReady>.5)base=pow(texture(humanTex,vUV).rgb,vec3(2.2));rough=.57+texture(noiseTex,vUV*14.).r*.12;}
if(uType>12.5&&uType<13.5){base*=.80+texture(noiseTex,vUV*30.).r*.26;rough=.74;}
if(uType>13.5&&uType<14.5){base*=.72+texture(noiseTex,vUV*vec2(43.,8.)).r*.38;rough=.88;}
'''
s=s.replace(pat,extra+pat)
# Bind character albedo to its own sampler; shadow map stays at unit 1.
s=s.replace('const draw=ob=>{','gl.uniform1f(l.uHumanReady,this.humanReady?1:0);if(this.humanTexture){gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,this.humanTexture);gl.uniform1i(l.humanTex,5);}\n const draw=ob=>{')
# Load skin texture embedded; other modes and environment textures stay untouched.
texture=(root/'assets/skin_albedo.jpg').read_bytes()
asset='data:image/jpeg;base64,'+base64.b64encode(texture).decode()
s=s.replace('function loadTextures(){','function loadTextures(){loadHumanTexture12();')
insert='''function loadHumanTexture12(){let gl=renderer.gl,tex=gl.createTexture();renderer.humanTexture=tex;gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([190,150,122,255]));let img=new Image;img.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);renderer.humanReady=true;};img.src=SKIN_ALBEDO12;}
'''
s=s.replace('function loadTextures(){','const SKIN_ALBEDO12='+json.dumps(asset)+';\n'+insert+'function loadTextures(){')
# Update final palette AFTER optional swimming/body mode edits and FPS head culling.
s=s.replace('modePose10(n,drawP,dt);','modePose10(n,drawP,dt);selectCharacterLOD12(n,dist(n.p,renderer.camera.eye),renderer.quality);updateSkin12(n,dt);')
# Correct labels; v12 still uses the established v10 wire protocol but a new fenced build hash.
s=s.replace('TEAMBOUND 11','TEAMBOUND 12').replace('Alpine Field Notes','Field Anatomy').replace('ALPINE FIELD NOTES','FIELD ANATOMY').replace('v10 server','matching v12 server').replace('v11','v12')
s=s.replace('SHARED EXPEDITIONS / BUILD 10','FIELD ANATOMY / BUILD 12')
# Diagnostic model summary (no write access into authoritative network state).
s=s.replace('window.TBLab={','window.TBAnatomy={get report(){return {joints:48,vertices:anatomy12.reduce((n,a)=>n+a.geo.p.length/3,0),triangles:anatomy12.reduce((n,a)=>n+a.geo.i.length/3,0),meshParts:anatomy12.length,avatars:[...avatarNodes].map(([id,n])=>({id,feet:n.motion12?.soleError,hands:n.motion12?.handError,bends:n.skinState?.bends,finite:n.skinState?Array.from(n.skinState.palette).every(Number.isFinite):false,grips:n.motion12?.gripCurl}))}},exportAsset:()=>({bones:skel12.map(b=>({name:b.name,parent:b.parent,bind:Array.from(b.bind)})),meshes:anatomy12.map(a=>({name:a.key,color:a.mat.color,rough:a.mat.rough,metal:a.mat.metal,p:Array.from(a.geo.p),n:Array.from(a.geo.n),uv:Array.from(a.geo.uv),indices:Array.from(a.geo.i),joints:Array.from(a.geo.joints),weights:Array.from(a.geo.weights)}))})};\nwindow.TBLab={')
# Real-source FBX importer is opt-in and states its external download requirement.
s=s.replace('function selectCharacterLOD12(root,distance,quality=1){','function selectCharacterLOD12(root,distance,quality=1){installHuman12(root);if(root.importedHuman12)return;')
s=s.replace('for(let m of root.skinMeshes)m.visible=!m._headOnly||r.head.visible;','for(let m of root.skinMeshes)m.visible=(!m._headOnly||r.head.visible)&&(!m._helmet||humanAsset12.helmet);')
s=s.replace('uniform float uHumanReady;','uniform float uHumanReady;uniform sampler2D assetColorTex,assetNormalTex;uniform float uAssetReady,uAssetNormal;')
s=s.replace("['uSkinned','uBones'","['assetColorTex','assetNormalTex','uAssetReady','uAssetNormal','uSkinned','uBones'")
s=s.replace('float hash(vec3 p)',"vec3 assetBump12(vec3 N){vec3 T=normalize(dFdx(vP)*dFdy(vUV).y-dFdy(vP)*dFdx(vUV).y),B=normalize(cross(N,T));vec3 M=texture(assetNormalTex,vUV).xyz*2.-1.;return normalize(mat3(T,-B,N)*M);}\nfloat hash(vec3 p)")
s=s.replace(pat,"if(uType>15.5&&uAssetReady>.5){base=pow(texture(assetColorTex,vUV).rgb,vec3(2.2));rough=uRough;if(uAssetNormal>.5)n=normalize(mix(n,assetBump12(n),.62));}\n"+pat)
s=s.replace('this.skinUniforms(l,ob);let m=ob.mat;',"this.skinUniforms(l,ob);let tx=typeof humanAsset12!=='undefined'&&ob._assetTexture!==undefined?humanAsset12.textures[ob._assetTexture]:null;gl.uniform1f(l.uAssetReady,tx?1:0);gl.uniform1f(l.uAssetNormal,tx?.normal?1:0);if(tx){gl.activeTexture(gl.TEXTURE6);gl.bindTexture(gl.TEXTURE_2D,tx.color);gl.uniform1i(l.assetColorTex,6);gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,tx.normal||tx.color);gl.uniform1i(l.assetNormalTex,7);}let m=ob.mat;")
# Separate inspection stage; never changes authoritative game simulation state.
s=s.replace('renderer.time=ts/1000;renderer.render(scene.root);','renderer.time=ts/1000;updateMotionStudio12(dt);renderer.render(motionStudio12.active?motionStudio12.root:scene.root);')
s=s.replace("if(!net.online&&state==='PLAY'&&!$$", "if(!motionStudio12.active&&!net.online&&state==='PLAY'&&!$$")
s=s.replace('window.TBAnatomy={',''+(P/'rocketbox12.js').read_text()+'\n'+(P/'studio12.js').read_text()+'\nwindow.TBAnatomy={')
s=s.replace("$('load').classList.add('hide');requestAnimationFrame(renderFrame)","$('load').classList.add('hide');setupHumanUI12();requestAnimationFrame(renderFrame)")
s=s.replace("if(state!=='PLAY')return;canvas.focus", "if(motionStudio12.active||state!=='PLAY')return;canvas.focus")
s=s.replace("if(state!=='PLAY'||e.altKey||e.button===1)return;", "if(motionStudio12.active||state!=='PLAY'||e.altKey||e.button===1)return;")
s=s.replace("window.addEventListener('keydown',e=>{if(['INPUT'", "window.addEventListener('keydown',e=>{if(motionStudio12.active){if(e.code==='Escape')toggleMotionLab12(false);return;}if(['INPUT'")
s=s.replace('distance>13','distance>3.2')
s=s.replace("document.addEventListener('pointermove',e=>{if(state!=='PLAY')return;", "document.addEventListener('pointermove',e=>{if(motionStudio12.active||state!=='PLAY')return;")
s=s.replace("canvas.addEventListener('wheel',e=>{if(state!=='PLAY')return;", "canvas.addEventListener('wheel',e=>{if(motionStudio12.active||state!=='PLAY')return;")
s=s.replace("canvas.addEventListener('dblclick',()=>capture());", "canvas.addEventListener('dblclick',()=>{if(!motionStudio12.active)capture()});")
s=s.replace('<script>','<script>\nconst ORIGINAL_PAGE12="<!doctype html>"+document.documentElement.outerHTML;',1)
s=s.replace('setupHumanUI12();requestAnimationFrame(renderFrame)','setupHumanUI12();loadEmbeddedHuman12();requestAnimationFrame(renderFrame)')
# Cryptographic matching with the exact delivered simulation and client.
digest=hashlib.sha256(s.encode()+b''.join((P/x).read_bytes() for x in ['lab_sim.js','party_sim.js','spatial10.js','protocol10.js'])).hexdigest()[:20]
s=re.sub(r'const BUILD_HASH10="[a-f0-9]+";',f'const BUILD_HASH10="{digest}";',s,count=1)
(root/'public/index.html').write_text(s)
(root/'teambound_field_anatomy_v12.html').write_text(s)
(root/'BUILD.json').write_text(json.dumps({'protocol':10,'hash':digest,'name':'TEAMBOUND 12 - Field Anatomy'},indent=2))
# Track exact implementation and build inputs in readable source as well.
js=s[s.index('<script>')+8:s.rindex('</script>')];(root/'src/client_bundled.js').write_text(js)
print('Base generated',len(s),'bytes, build',digest)
