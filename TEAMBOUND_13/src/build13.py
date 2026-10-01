"""Reproducible v13 character-only revision over the supplied v12 implementation."""
from pathlib import Path
import hashlib,json,re,subprocess,sys
P=Path(__file__).parent;R=P.parent
subprocess.run([sys.executable,str(P/'build12.py')],check=True)
s=(R/'public/index.html').read_text()
modules='\n'+(P/'human13.js').read_text()+'\n'+(P/'studio13.js').read_text()+'\n'
s=s.replace('window.TBAnatomy={',modules+'window.TBAnatomy={',1)
s=s.replace('setupHumanUI12();loadEmbeddedHuman12();','setupHuman13();loadEmbeddedHuman12();')
s=s.replace("'teambound_12_with_rescue_character.html'","'teambound_rescue_v13_offline.html'")
s=s.replace('TEAMBOUND 12','TEAMBOUND 13').replace('Field Anatomy','Rescue Edition').replace('FIELD ANATOMY / BUILD 12','RESCUE EDITION / BUILD 13').replace('matching v12 server','matching v13 server')
s=s.replace('clamp(motionStudio12.distance+e.deltaY*.003,1.2,5)','clamp(motionStudio12.distance+e.deltaY*.003,.45,5)')
# Numerically safe cotangent frame handles mirrored UVs and avoids NaNs on degeneracy.
old='vec3 assetBump12(vec3 N){vec3 T=normalize(dFdx(vP)*dFdy(vUV).y-dFdy(vP)*dFdx(vUV).y),B=normalize(cross(N,T));vec3 M=texture(assetNormalTex,vUV).xyz*2.-1.;return normalize(mat3(T,-B,N)*M);}'
new='''vec3 assetBump12(vec3 N){vec3 p1=dFdx(vP),p2=dFdy(vP),q2=cross(p2,N),q1=cross(N,p1);vec2 uv1=dFdx(vUV),uv2=dFdy(vUV);vec3 T=q2*uv1.x+q1*uv2.x,B=q2*uv1.y+q1*uv2.y;float area=max(dot(T,T),dot(B,B));if(area<1e-12)return N;float inv=inversesqrt(area);vec3 M=texture(assetNormalTex,vUV).xyz*2.-1.;return normalize((T*M.x-B*M.y)*inv+N*M.z);}'''
assert old in s;s=s.replace(old,new)
# Skin normals must be transformed by the inverse transpose of a blended skin matrix.
s=s.replace('transpose(inverse(mat3(world)))*mat3(bone)*normal','transpose(inverse(mat3(world*bone)))*normal')
# A new hash fences v13 clients without changing shared physical state or the wire schema.
s=re.sub(r'const BUILD_HASH10="[a-f0-9]+";', 'const BUILD_HASH10="BUILD13";',s,count=1)
digest=hashlib.sha256(s.encode()+b''.join((P/x).read_bytes() for x in ['lab_sim.js','party_sim.js','spatial10.js','protocol10.js'])).hexdigest()[:20]
s=s.replace('const BUILD_HASH10="BUILD13";',f'const BUILD_HASH10="{digest}";')
(R/'public/index.html').write_text(s);(R/'teambound_rescue_v13.html').write_text(s)
(R/'src/client_bundled.js').write_text(s[s.index('<script>')+8:s.rindex('</script>')])
(R/'BUILD.json').write_text(json.dumps({'protocol':10,'hash':digest,'name':'TEAMBOUND 13 - Rescue Edition'},indent=2))
print('V13',len(s),'bytes',digest)
