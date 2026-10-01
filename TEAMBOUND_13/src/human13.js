/* 13 / RESCUE EDITION — data-only, bounded, transactional character loading.
   Gameplay authority, input, hit volumes, maps and room protocol are untouched.
   The prepared asset is public Microsoft Rocketbox data, not executable code. */
const HUMAN13={url:'https://d2ol7oe51mr4n9.cloudfront.net/user_3J0Nno572Kz9GlNbwwAVIZ6FSSG/45f1f65a-fc4a-4ea1-9ed3-67835f385201.json',sha256:'58d55ebd7aa0cbb9906bceaa2042aeb8b6b894676ece4a632c337c3c6fe7e2d6',bytes:6773975,maxBytes:16000000,revision:0,source:'Microsoft Rocketbox Fire_Male_01',cached:false,request:null,diagnostics:null};
const humanLiveNodes13=()=>[...avatarNodes.values(),...(motionStudio12.avatar?[motionStudio12.avatar]:[])];
function humanEnable13(){for(let id of ['humanToggle12','humanHelmet12','humanOffline12','humanSave12','humanNormals12']){let el=$(id);if(el)el.disabled=false;}if($('humanNormals12')){$('humanNormals12').disabled=true;$('humanNormals12').textContent='Colour + normal maps installed';}}
function validateHuman13(data){
 if(!data||data.format!=='teambound-rescue-v1'||!Array.isArray(data.parts)||data.parts.length!==3||!Array.isArray(data.textures)||data.textures.length!==3)throw Error('Not a supported character data package.');
 const expected=['rescueSuit','rescueHead','rescueHelmet'];let vertices=0,triangles=0,maxWeightError=0,min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let k=0;k<3;k++){let a=data.parts[k];if(a.key!==expected[k]||!Array.isArray(a.p)||a.p.length%3||!a.p.length)throw Error('Invalid mesh part.');let n=a.p.length/3;
  if(n>60000||!Array.isArray(a.i)||a.i.length>180000||a.i.length%3)throw Error('Mesh exceeds the importer budget.');
  for(let [name,len]of [['n',n*3],['uv',n*2],['joints',n*4],['weights',n*4],['fold',n*4]])if(!Array.isArray(a[name])||a[name].length!==len||a[name].some(v=>typeof v!=='number'||!Number.isFinite(v)))throw Error('Invalid '+name+' stream.');
  if(a.p.some(v=>typeof v!=='number'||!Number.isFinite(v)||Math.abs(v)>4))throw Error('Character coordinates must use metres.');
  if(a.i.some(v=>!Number.isInteger(v)||v<0||v>=n)||a.joints.some(v=>!Number.isInteger(v)||v<0||v>=48))throw Error('Out-of-range mesh index or joint.');
  if(a.weights.some(v=>v<0||v>1))throw Error('Invalid skin weight.');
  for(let i=0;i<n;i++){let e=Math.abs(a.weights.slice(i*4,i*4+4).reduce((s,v)=>s+v,0)-1);maxWeightError=Math.max(maxWeightError,e);if(e>.0002)throw Error('Skin weights are not normalized.');for(let j=0;j<3;j++){min[j]=Math.min(min[j],a.p[i*3+j]);max[j]=Math.max(max[j],a.p[i*3+j]);}}
  for(let f of a.fold)if(Math.abs(f)>4)throw Error('Invalid corrective displacement control.');
  if(a.headOnly!==(k>0)||a.helmet!==(k===2))throw Error('Invalid first-person visibility classification.');vertices+=n;triangles+=a.i.length/3;
 }
 if(vertices>180000||triangles>180000||max[1]-min[1]<1.3||max[1]-min[1]>2.1)throw Error('Character height is outside the calibrated envelope.');
 for(let t of data.textures){for(let key of ['color','normal']){let u=t[key];if(key==='normal'&&!u)continue;if(typeof u!=='string'||u.length>8500000||!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(u))throw Error('Textures must be embedded PNG or JPEG data, not URLs or scripts.');}}
 return{vertices,triangles,joints:48,maxWeightError,bounds:{min,max},height:max[1]-min[1],source:data.source||HUMAN13.source};
}
async function imageHuman13(uri){return await new Promise((resolve,reject)=>{let im=new Image;im.onload=()=>{if(im.naturalWidth>4096||im.naturalHeight>4096||im.naturalWidth<1)return reject(Error('Texture size exceeds 4096 px.'));resolve(im)};im.onerror=()=>reject(Error('An embedded texture failed to decode.'));im.src=uri;});}
function detachImported13(root){if(root._humanMeshes12){let old=new Set(root._humanMeshes12);root.rig.body.children=root.rig.body.children.filter(n=>!old.has(n));root._humanMeshes12=null;}if(root._baseMeshes12)root.skinMeshes=root._baseMeshes12;root.importedHuman12=false;}
async function commitHuman13(data){
 const report=validateHuman13(data),pendingTextures=[];let parts=data.parts.map((a,k)=>{let g=geometry(a.p,a.i,a.n,a.uv);g.joints=new Float32Array(a.joints);g.weights=new Float32Array(a.weights);g.fold=new Float32Array(a.fold);return{key:a.key,geo:g,headOnly:a.headOnly,helmet:a.helmet,mat:material('#ffffff',16+k,[.88,.64,.50][k])};});
 try{for(let t of data.textures){let im=await imageHuman13(t.color),normal=t.normal?await imageHuman13(t.normal):null;pendingTextures.push({color:humanGLTexture12(im),normal:normal?humanGLTexture12(normal):null,data:t.color,normalData:t.normal||null});}}
 catch(e){for(let t of pendingTextures){renderer.gl.deleteTexture(t.color);if(t.normal)renderer.gl.deleteTexture(t.normal);}throw e;}
 const old=humanAsset12.textures;for(let n of humanLiveNodes13())detachImported13(n);
 Object.assign(humanAsset12,{parts,textures:pendingTextures,counts:data.counts,enabled:true,payload:data,error:null,loading:false,helmet:false});
 for(let n of humanLiveNodes13())installHuman12(n);
 for(let t of old){if(t.color)renderer.gl.deleteTexture(t.color);if(t.normal)renderer.gl.deleteTexture(t.normal);}
 HUMAN13.revision++;HUMAN13.diagnostics=report;humanEnable13();humanStatus12('Textured rescuer ready · '+report.triangles.toLocaleString()+' triangles · 48-joint skin');
 return report;
}
async function boundedFetch13(url,signal){const response=await fetch(url,{credentials:'omit',signal,cache:'no-cache'});if(!response.ok)throw Error('HTTP '+response.status);const size=Number(response.headers.get('content-length')||0);if(size>HUMAN13.maxBytes)throw Error('Character download exceeds its budget.');const reader=response.body.getReader();let chunks=[],total=0;while(true){let {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>HUMAN13.maxBytes){await reader.cancel();throw Error('Character download exceeds its budget.');}chunks.push(value);humanStatus12('Downloading rescuer '+(size?Math.min(100,Math.round(total/size*100))+'%':(total/1048576).toFixed(1)+' MB')+' — you can cancel.');}let out=new Uint8Array(total),at=0;for(let c of chunks){out.set(c,at);at+=c.length;}return out;}
async function shaHuman13(bytes){if(!globalThis.crypto?.subtle)throw Error('Secure hashing unavailable. Open the game from localhost or HTTPS to install the verified online asset.');return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function loadPrepared13(){
 if(HUMAN13.request){HUMAN13.request.abort();return;}
 HUMAN13.request=new AbortController;let timer=setTimeout(()=>HUMAN13.request?.abort(),90000);humanAsset12.loading=true;humanAsset12.error=null;let button=$('humanLoad12');if(button)button.textContent='Cancel character download';
 try{let bytes=null;try{let cached=await humanCache12('prepared-rescuer13-'+HUMAN13.sha256);if(cached){let test=new Uint8Array(cached);if(await shaHuman13(test)===HUMAN13.sha256){bytes=test;HUMAN13.cached=true;}}}catch{}
  if(!bytes){let urls=[];if(/^https?:$/.test(location.protocol))urls.push(new URL('/assets/rocketbox/rescuer.tbchar',location.origin).href);urls.push(HUMAN13.url);let err;for(let url of urls){try{bytes=await boundedFetch13(url,HUMAN13.request.signal);break;}catch(e){err=e;if(HUMAN13.request.signal.aborted)throw e;}}if(!bytes)throw err;}
  if(await shaHuman13(bytes)!==HUMAN13.sha256)throw Error('Prepared asset checksum mismatch. The existing character has not been changed.');
  const data=JSON.parse(new TextDecoder().decode(bytes));await commitHuman13(data);try{await humanCache12('prepared-rescuer13-'+HUMAN13.sha256,bytes.buffer);HUMAN13.cached=true;}catch{}
 }catch(e){humanAsset12.error=e.message;humanStatus12((e.name==='AbortError'?'Download cancelled.':'Rescuer not installed: '+e.message)+' Current character retained.');}
 finally{clearTimeout(timer);HUMAN13.request=null;humanAsset12.loading=false;if(button)button.textContent='Install textured rescuer · 6.8 MB';}
}
async function importPrepared13(file){if(!file)return;if(HUMAN13.request||humanAsset12.loading){humanStatus12('Finish or cancel the current import first.');return;}humanAsset12.loading=true;try{if(file.size>HUMAN13.maxBytes)throw Error('Character file exceeds 16 MB.');const bytes=new Uint8Array(await file.arrayBuffer());const report=await commitHuman13(JSON.parse(new TextDecoder().decode(bytes)));humanStatus12('Local character installed · '+report.vertices.toLocaleString()+' weighted vertices');}catch(e){humanAsset12.error=e.message;humanStatus12('Import rejected. Current character retained: '+e.message);}finally{humanAsset12.loading=false;}}
const originalEmbeddedLoader13=loadEmbeddedHuman12;
loadEmbeddedHuman12=async function(){let tag=$('embedded-human12');if(!tag)return;try{await commitHuman13(JSON.parse(tag.textContent));humanStatus12('Embedded textured rescuer · fully offline');}catch(e){humanStatus12('Embedded character rejected; explorer retained: '+e.message)}};
function setupHuman13(){
 $('humanPanel12')?.remove();setupHumanUI12();let panel=$('humanPanel12');panel.querySelector('summary').innerHTML='CHARACTER / MATERIAL STUDIO <span>13</span>';humanStatus12('Explorer active · install the textured rescuer or import its local .tbchar package.');
 $('humanLoad12').textContent='Install textured rescuer · 6.8 MB';$('humanLoad12').onclick=loadPrepared13;
 $('humanNormals12').textContent='Normal maps included with rescuer';$('humanNormals12').disabled=true;
 const pick=document.createElement('input');pick.type='file';pick.accept='.tbchar,.json';pick.hidden=true;pick.id='humanFile13';pick.onchange=()=>{importPrepared13(pick.files?.[0]);pick.value=''};panel.appendChild(pick);
 const b=document.createElement('button');b.textContent='Import local .tbchar — no upload';b.id='humanImport13';b.onclick=()=>pick.click();panel.querySelector('.humanButtons12').insertBefore(b,$('humanToggle12'));
 const diag=document.createElement('button');diag.id='humanDiagnostic13';diag.textContent='Save character diagnostics';diag.onclick=()=>downloadFile12(new Blob([JSON.stringify({build:BUILD_HASH10,character:HUMAN13.diagnostics,revision:HUMAN13.revision,avatars:TBAnatomy.report,physics:'unchanged from v12',limitations:['Procedural contact posing, not motion capture.','Weighted clothing, not full garment simulation.']},null,2)],{type:'application/json'}),'teambound_character_diagnostics13.json');panel.querySelector('.humanButtons12').appendChild(diag);
 panel.querySelector('small').textContent='Real Microsoft Rocketbox source mesh and colour/normal textures, MIT. The 6.8 MB prepared package downloads only after you click Install. Import reads locally; it does not upload your files. Save offline embeds it into the game. Clothing is skin-deformed, not simulated fabric.';
 $('humanToggle12').onclick=()=>{humanAsset12.enabled=!humanAsset12.enabled;for(let n of humanLiveNodes13())installHuman12(n);humanStatus12(humanAsset12.enabled?'Textured rescuer active':'Original explorer active');};
 let st=document.createElement('style');st.textContent='#humanPanel12{max-height:calc(100vh - 180px);overflow:auto}#humanPanel12[open]{box-shadow:0 16px 40px #0003}.humanButtons12 button:focus-visible{outline:3px solid #ae7350;outline-offset:2px}#humanPanel12 summary{white-space:nowrap}#humanPanel12:not([open]) p{display:none}';document.head.appendChild(st);
}
window.TBHuman13={get status(){return{ready:!!humanAsset12.parts,active:!!humanAsset12.enabled,loading:!!humanAsset12.loading,cached:HUMAN13.cached,revision:HUMAN13.revision,diagnostics:HUMAN13.diagnostics,error:humanAsset12.error}},validate:validateHuman13,commit:commitHuman13,load:loadPrepared13,importFile:importPrepared13};
