#!/usr/bin/env node
'use strict';
/* Dependency-free HTTP/WebSocket private-room server. Node 22+.
 * Sole world authority. One body / raft per room. Room+run fencing on every input.
 * Browser render frame rate cannot change server movement, rosters, or simulation time.
 */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm'),os=require('node:os'),zlib=require('node:zlib');
const PORT=Number(process.env.PORT||8080),HOST=process.env.HOST||'0.0.0.0',MAX_ROOMS=Number(process.env.MAX_ROOMS||8),PROTOCOL=10,MAX_FRAME=16384;
const instance=crypto.randomBytes(4).toString('hex').toUpperCase();
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'BUILD.json'),'utf8')),BUILD=manifest.hash;
const html=fs.readFileSync(path.join(__dirname,'public/index.html')),gzip=zlib.gzipSync(html),ctx=vm.createContext({console});
for(let f of ['engine.js','lab_sim.js','party_sim.js','spatial10.js','protocol10.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'src',f),'utf8'),ctx,{filename:f});
vm.runInContext(`globalThis.API={create:(m,c)=>new PartySimulation(m,c),clean:cleanInput10,wire:wireSnapshot10,stringify:stringifyWire10,modes:Object.keys(MODE_DEFS),seats:PARTY_SEATS,links:Object.fromEntries(Object.entries(MODE_DEFS).map(([k,v])=>[k,v.link||null]))}`,ctx);
const api=ctx.API,clients=new Set,rooms=new Map,ipCounts=new Map;let serverTicks=0,overruns=0,lastStepMs=0,maxStepMs=0;
const uuid=()=>crypto.randomBytes(12).toString('hex');
const lanURLs=Object.values(os.networkInterfaces()).flat().filter(x=>x?.family==='IPv4'&&!x.internal).map(x=>'http://'+x.address+':'+PORT);
let publicURL='';try{let u=new URL(process.env.PUBLIC_URL);if(['http:','https:'].includes(u.protocol))publicURL=u.origin}catch{}
function frame(socket,op,data){if(socket.destroyed)return;let p=Buffer.isBuffer(data)?data:Buffer.from(String(data)),h;if(p.length<126){h=Buffer.from([128|op,p.length]);}else if(p.length<65536){h=Buffer.alloc(4);h[0]=128|op;h[1]=126;h.writeUInt16BE(p.length,2)}else{h=Buffer.alloc(10);h[0]=128|op;h[1]=127;h.writeBigUInt64BE(BigInt(p.length),2)}socket.write(Buffer.concat([h,p]));}
function send(c,m,realtime=false){if(c.socket.destroyed)return;if(c.socket.writableLength>262144){c.socket.destroy();return;}if(realtime&&c.socket.writableLength>32768)return;frame(c.socket,1,typeof m==='string'?m:JSON.stringify(m));}
function error(c,text){send(c,{type:'error',text});}
function metadata(r){return {id:r.id,code:r.code,revision:r.revision,host:r.host,mode:r.mode,connection:r.connection,phase:r.phase,run:r.run,startsIn:Math.max(0,r.startAt-performance.now()),members:[...r.members.values()].sort((a,b)=>a.slot-b.slot).map(p=>({id:p.id,name:p.name,slot:p.slot,seat:p.seat,ready:p.ready,connected:p.connected,loaded:p.loaded,seq:p.ack,entityId:r.connection==='BODY'?'shared-body':p.id}))};}
function pack(r,withWorld=true){let world=withWorld&&r.sim?api.wire(r.sim):null;return {type:'state',protocol:PROTOCOL,hash:BUILD,serverId:instance,tx:++r.tx,serverTime:performance.now(),room:metadata(r),world,stats:{stepMs:r.stepMs||0,overruns,rttHint:0}};}
function publish(r,withWorld=true){let m=api.stringify(pack(r,withWorld));r.bytes=m.length;r.lastPacket=m;for(let c of r.members.values())if(c.connected)send(c,m,withWorld);}
function sendState(c,r){send(c,api.stringify(pack(r,true)));}
function clearCommand(c){c.input=api.clean({active:false});c.pending=[];c.lastInput=0;c.seq=-1;c.ack=-1;}
function detach(c,permanent=false){let r=rooms.get(c.room);if(!r||r.members.get(c.id)!==c)return;c.connected=false;c.loaded=false;clearCommand(c);c.disconnectedAt=Date.now();
 if(permanent){r.members.delete(c.id);r.sim?.remove(c.id);c.room=null;}
 if(!r.members.size){rooms.delete(r.code);return;}
 if(r.host===c.id){let next=[...r.members.values()].filter(p=>p.connected).sort((a,b)=>a.slot-b.slot)[0];if(next)r.host=next.id;}
 let p=r.sim?.players.get(c.id);if(p){p.active=false;if(r.connection!=='BODY'){if(p.carry)r.sim.drop(p,false);p.hands=[null,null];p.rope=null;p.vel=[0,0,0];}}r.revision++;publish(r,true);
}
function canonicalConnection(mode,c){if(['RIVER','DIVE'].includes(mode))return 'COOP';return api.links[mode]||(['COOP','CHAINED','BODY'].includes(c)?c:'COOP');}
function newRun(r){r.run=uuid();r.phase='LOADING';r.startAt=0;r.loadingAt=performance.now();r.sim=api.create(r.mode,r.connection);for(let c of [...r.members.values()].sort((a,b)=>a.slot-b.slot)){let p=r.sim.add(c.id,c.seat,c.slot);p.active=c.connected;clearCommand(c);c.loaded=false;}
 r.revision++;publish(r,true);}
function maybeCountdown(r){if(r.phase!=='LOADING')return;let connected=[...r.members.values()].filter(p=>p.connected);if(connected.length&&connected.every(c=>c.loaded)){r.phase='COUNTDOWN';r.startAt=performance.now()+3000;r.revision++;publish(r,true);}}
function join(c,m){if(m.protocol!==PROTOCOL||m.hash!==BUILD){error(c,'Version mismatch. Open the game from this matching v13 server; do not mix old HTML files or servers.');return;}
 let r=null;const code=String(m.code||'').toUpperCase().replace(/[^A-F0-9]/g,'').slice(0,10);
 if(m.type==='create'){if(rooms.size>=MAX_ROOMS){error(c,'This server has reached its room limit.');return;}
  let mode=api.modes.includes(m.mode)?m.mode:'SUMMIT';r={code:crypto.randomBytes(4).toString('hex').toUpperCase(),id:uuid(),run:null,revision:1,tx:0,host:c.id,mode,connection:canonicalConnection(mode,m.connection),phase:'LOBBY',sim:null,members:new Map,startAt:0,created:Date.now()};rooms.set(r.code,r);
 }else{r=rooms.get(code);if(!r){error(c,'Room not found on server '+instance+'. Open the exact shared invite URL.');return;}}
 let old=m.token?[...r.members.values()].find(p=>p.token===m.token):null;
 if(old){if(old.connected&&old.socket!==c.socket){old.socket.destroy();}c.id=old.id;c.token=old.token;c.name=old.name;c.slot=old.slot;c.seat=old.seat;c.ready=old.ready;}
 else{if(r.members.size>=4){error(c,'All four positions are occupied (reconnecting players keep their position for 12 seconds).');return;}
  c.slot=[0,1,2,3].find(k=>![...r.members.values()].some(p=>p.slot===k));c.seat=api.seats.find(k=>![...r.members.values()].some(p=>p.seat===k));c.token=uuid();c.name=String(m.name||'Explorer').replace(/[<>\u0000-\u001f]/g,'').slice(0,24)||'Explorer';c.ready=false;}
 if(c.room&&c.room!==r.code)detach(c,true);
 c.room=r.code;c.connected=true;c.loaded=r.phase==='LOBBY';c.disconnectedAt=0;clearCommand(c);r.members.set(c.id,c);
 if(r.sim){let p=r.sim.players.get(c.id);if(!p){p=r.sim.add(c.id,c.seat,c.slot);let cp=r.sim.world.checkpoints[r.sim.lastCheckpoint]||r.sim.world.spawn;p.pos=[cp[0]+(c.slot-1.5)*.85,cp[1],cp[2]];p.checkpoint=p.pos.slice();}p.active=true;}
 send(c,{type:'joined',id:c.id,token:c.token,code:r.code,roomId:r.id,serverId:instance,slot:c.slot,build:BUILD});r.revision++;publish(r,true);
}
function handle(c,m){if(!m||typeof m!=='object'||Array.isArray(m))return;let now=Date.now();if(now-c.rateAt>1000){c.rateAt=now;c.rate=0;}if(++c.rate>120){error(c,'Message rate exceeded');c.socket.destroy();return;}
 if(m.type==='ping'){send(c,{type:'pong',echo:m.at,serverTime:performance.now()});return;}
 if(['create','join','resume'].includes(m.type)){if(now-c.joinAt<150)return;c.joinAt=now;join(c,m);return;}
 const r=rooms.get(c.room);if(!r||r.members.get(c.id)!==c)return;
 if(m.type==='leave'){detach(c,true);send(c,{type:'left'});return;}
 if(m.type==='sync'){sendState(c,r);return;}
 if(m.roomId!==r.id)return;
 if(m.type==='ready'){if(r.phase!=='LOBBY')return;c.ready=!!m.ready;r.revision++;publish(r,false);return;}
 if(m.type==='seat'){if(!api.seats.includes(m.seat))return;let occupied=[...r.members.values()].find(p=>p.id!==c.id&&p.seat===m.seat);if(occupied){error(c,'That position belongs to '+occupied.name+'. Choose a free position.');return;}c.seat=m.seat;let p=r.sim?.players.get(c.id);if(p)p.seat=c.seat;r.revision++;publish(r,true);return;}
 if(m.type==='mode'){if(c.id!==r.host||r.phase!=='LOBBY'){error(c,'Only the host can change the mode, in the lobby.');return;}if(!api.modes.includes(m.mode))return;r.mode=m.mode;r.connection=canonicalConnection(r.mode,m.connection);for(let p of r.members.values())p.ready=false;r.revision++;publish(r,false);return;}
 if(m.type==='start'){if(c.id!==r.host||!['LOBBY','RESULT'].includes(r.phase)){error(c,'The host starts a run from the lobby or results.');return;}if(r.phase==='LOBBY'&&[...r.members.values()].some(p=>p.connected&&p.id!==c.id&&!p.ready)){error(c,'Waiting for every connected teammate to press Ready.');return;}newRun(r);return;}
 if(m.type==='lobby'){if(c.id!==r.host){error(c,'Only the host can return the whole party. Use Leave room to leave alone.');return;}r.phase='LOBBY';r.run=null;r.sim=null;r.startAt=0;for(let p of r.members.values()){p.ready=false;clearCommand(p);}r.revision++;publish(r,false);return;}
 if(m.run!==r.run)return;
 if(m.type==='loaded'){c.loaded=true;r.revision++;maybeCountdown(r);publish(r,true);return;}
 if(m.type==='input'&&r.sim&&c.loaded&&['PLAY','COUNTDOWN'].includes(r.phase)){
  if(!Number.isSafeInteger(m.seq)||m.seq<=c.seq||m.seq>1e10)return;c.seq=m.seq;c.lastInput=performance.now();c.input=api.clean(m.input||{});c.input.actions=[];c.pending.push(...api.clean({actions:m.actions||[]}).actions);if(c.pending.length>24)c.pending=c.pending.slice(-24);return;
 }
}
const server=http.createServer((req,res)=>{let u;try{u=new URL(req.url,'http://localhost')}catch{res.writeHead(400);res.end();return;}
 if(u.pathname.startsWith('/assets/rocketbox/')){const allowed=new Set(['rescuer.tbchar','Fire_Male_01.fbx','m138_body_color.tga','m138_head_color.tga','m138_helmet_color.tga','m138_body_normal.tga','m138_head_normal.tga','m138_helmet_normal.tga']);const name=u.pathname.slice('/assets/rocketbox/'.length);if(!allowed.has(name)||!['GET','HEAD'].includes(req.method)){res.writeHead(404);res.end();return;}const file=path.join(__dirname,'assets','rocketbox',name);if(!fs.existsSync(file)){res.writeHead(404);res.end('Optional character not installed. Run INSTALL_RESCUER_WINDOWS.bat or use the local .tbchar import.');return;}res.writeHead(200,{'Content-Type':'application/octet-stream','Content-Length':fs.statSync(file).size,'X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=86400'});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);return;}
 if(u.pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({ok:true,protocol:PROTOCOL,hash:BUILD,serverId:instance,rooms:rooms.size,clients:clients.size,stepMs:lastStepMs,maxStepMs,overruns,serverTicks}));return;}
 if(!['/','/index.html'].includes(u.pathname)){res.writeHead(404);res.end('Not found');return;}
 let gz=String(req.headers['accept-encoding']||'').includes('gzip');res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Cache-Control':'no-store',...(gz?{'Content-Encoding':'gzip'}:{})});res.end(gz?gzip:html);
});
server.on('upgrade',(req,socket,head)=>{
 const ip=socket.remoteAddress;if((ipCounts.get(ip)||0)>=16||clients.size>=64){socket.end('HTTP/1.1 429 Too Many Requests\r\n\r\n');return;}
 const key=req.headers['sec-websocket-key'],origin=req.headers.origin,allowed=process.env.ALLOWED_ORIGINS?.split(',').map(x=>x.trim());
 if(req.url!=='/ws'||req.headers['sec-websocket-version']!=='13'||typeof key!=='string'||Buffer.from(key,'base64').length!==16||(allowed&&origin&&!allowed.includes(origin))){socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');return;}
 socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64')+'\r\n\r\n');socket.setNoDelay(true);
 let c={socket,id:uuid(),token:uuid(),room:null,name:'Explorer',slot:0,seat:'front',ready:false,loaded:false,connected:false,rateAt:Date.now(),rate:0,joinAt:0,alive:true};clearCommand(c);clients.add(c);ipCounts.set(ip,(ipCounts.get(ip)||0)+1);
 send(c,{type:'hello',protocol:PROTOCOL,hash:BUILD,serverId:instance,publicURL,lanURLs:ip.includes('127.0.0.1')||ip==='::1'?lanURLs:[]});
 let buffer=Buffer.alloc(0),frags=[],fragSize=0;function fail(){socket.destroy();}
 function parse(chunk){buffer=Buffer.concat([buffer,chunk]);if(buffer.length>MAX_FRAME*4){fail();return;}while(buffer.length>=2){let b0=buffer[0],b1=buffer[1],op=b0&15,fin=!!(b0&128),len=b1&127,off=2;if(b0&112||!(b1&128)){fail();return;}if(len===126){if(buffer.length<4)return;len=buffer.readUInt16BE(2);off=4;}else if(len===127){if(buffer.length<10)return;let l=buffer.readBigUInt64BE(2);if(l>BigInt(MAX_FRAME)){fail();return;}len=Number(l);off=10;}if(len>MAX_FRAME||((op&8)&&(!fin||len>125))){fail();return;}if(buffer.length<off+4+len)return;let mask=buffer.subarray(off,off+4),p=Buffer.from(buffer.subarray(off+4,off+4+len));for(let j=0;j<p.length;j++)p[j]^=mask[j%4];buffer=buffer.subarray(off+4+len);
 if(op===8){frame(socket,8,p);socket.end();return;}if(op===9){frame(socket,10,p);continue;}if(op===10){c.alive=true;continue;}
 if(op===1){if(frags.length){fail();return;}frags=[p];fragSize=p.length;}else if(op===0&&frags.length){frags.push(p);fragSize+=p.length;}else{fail();return;}if(fragSize>MAX_FRAME){fail();return;}
 if(fin){let raw=Buffer.concat(frags);frags=[];fragSize=0;try{handle(c,JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw)))}catch(e){console.warn('Rejected input:',e.message);error(c,'Invalid input message');}}
 }}
 socket.on('data',parse);socket.on('error',()=>{});socket.on('close',()=>{clients.delete(c);ipCounts.set(ip,Math.max(0,(ipCounts.get(ip)||1)-1));detach(c,false);});if(head.length)parse(head);
});
let previous=performance.now(),acc=0;
const timer=setInterval(()=>{let now=performance.now();let elapsed=(now-previous)/1000;previous=now;if(elapsed>.12)overruns++;acc+=Math.min(.12,elapsed);let n=0;while(acc>=1/60&&n++<7){acc-=1/60;serverTicks++;
 for(let r of rooms.values()){
  maybeCountdown(r);if(r.phase==='COUNTDOWN'&&performance.now()>=r.startAt){r.phase='PLAY';r.revision++;publish(r,true);}
  if(r.phase==='LOADING'||r.phase==='COUNTDOWN'){if(serverTicks%15===0)publish(r,true);continue;}
  if(r.phase!=='PLAY'||!r.sim)continue;
  let begin=performance.now(),inputs=new Map;for(let c of r.members.values()){let fresh=c.connected&&c.loaded&&performance.now()-c.lastInput<300,i=fresh?c.input:api.clean({yaw:c.input.yaw,pitch:c.input.pitch,active:false});let cmd={...i,actions:fresh?c.pending.splice(0,24):[]};if(!fresh)c.pending=[];inputs.set(c.id,cmd);c.ack=c.seq;let p=r.sim.players.get(c.id);if(p)p.active=c.connected;}
  r.sim.step(inputs);r.stepMs=performance.now()-begin;lastStepMs=r.stepMs;maxStepMs=Math.max(maxStepMs,r.stepMs);
  if(r.sim.events.length){let event={type:'events',roomId:r.id,run:r.run,events:r.sim.events};for(let c of r.members.values())if(c.connected)send(c,event);}
  if(r.sim.completed){r.phase='RESULT';r.revision++;publish(r,true);}else if(r.sim.tick%2===0)publish(r,true);
 }
 }},8);timer.unref();
setInterval(()=>{for(let r of rooms.values()){let changed=false;for(let c of [...r.members.values()])if(!c.connected&&Date.now()-c.disconnectedAt>12000){r.members.delete(c.id);r.sim?.remove(c.id);changed=true;}if(!r.members.size){rooms.delete(r.code);continue;}if(changed){r.revision++;publish(r,true);}}},1000).unref();
setInterval(()=>{for(let c of clients){if(!c.alive){c.socket.destroy();continue;}c.alive=false;frame(c.socket,9,Buffer.alloc(0));}for(let r of rooms.values())if(Date.now()-r.created>21600000){for(let c of r.members.values())c.socket.destroy();rooms.delete(r.code);}},15000).unref();
server.on('error',e=>{console.error(e.message);process.exit(1)});server.listen(PORT,HOST,()=>{console.log('\nTEAMBOUND 13 · Rescue Edition\nServer '+instance+' · build '+BUILD.slice(0,10));console.log('This computer: http://localhost:'+PORT);lanURLs.forEach(u=>console.log('Same network: '+u));if(publicURL)console.log('Public invite base: '+publicURL);console.log('\nEveryone must open the SAME server URL. Old builds are rejected.\nInternet friends require a reachable HTTPS/WSS deployment.\n');});
process.on('SIGINT',()=>{for(let c of clients)c.socket.destroy();server.close(()=>process.exit(0));});
