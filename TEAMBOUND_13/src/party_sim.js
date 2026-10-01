/* TEAMBOUND 10 · Shared-authority expeditions.
 * This exact module runs on the server and in offline play.
 * Online clients NEVER advance this world or its remote players.
 * All distances are metres; a server-owned room owns one simulation.
 */
const PARTY_PROTOCOL = 10;
const MODE_DEFS = Object.freeze({
 SUMMIT:{name:'Summit expedition',place:'NORTH RIDGE',icon:'mountain',text:'Reach the beacon. Walk, climb, rope or build.',goal:'Get the whole team to the summit.',theme:'alpine'},
 CHAINED:{name:'Chained ascent',place:'NORTH RIDGE',icon:'chain',text:'A real shared tether. Brace and rescue.',goal:'Keep the rope team together. Reach the summit.',theme:'alpine',link:'CHAINED'},
 BODY:{name:'One Body',place:'GIANT’S CAUSEWAY',icon:'body',text:'One avatar. Four positions. Ordinary WASD.',goal:'Move the shared body through all three stations.',theme:'alpine',link:'BODY'},
 ECHO:{name:'Echo Chamber',place:'THE LISTENING RUINS',icon:'echo',text:'Four spells. Shared magic. Timing matters.',goal:'Awaken four wards, then gather at the exit.',theme:'ruins'},
 RIVER:{name:'Downstream',place:'WHITEWATER PASS',icon:'river',text:'Paddle, bail, repair. One raft for the party.',goal:'Steer the team raft to the downstream dock.',theme:'river'},
 DIVE:{name:'Deep Dive',place:'THE SUNKEN GALLERY',icon:'dive',text:'Swim in 3D. Share air. Recover three relics.',goal:'Collect three relics and get everyone to the exit bell.',theme:'underwater'},
 DELIVERY:{name:'Summit delivery',place:'NORTH RIDGE',icon:'box',text:'One fragile case. Shared handling and impact.',goal:'Deliver the intact case; get the team to the beacon.',theme:'alpine'},
 TOWER:{name:'Tower of Babel',place:'THE SKY WORKSHOP',icon:'tower',text:'Build your own climb. Shared timber supply.',goal:'Build a supported way up to the sky beacon.',theme:'workshop'},
 SURVEY:{name:'Quarry survey',place:'NORTH QUARRY',icon:'survey',text:'Record three outcrops in any order.',goal:'Survey three outcrops, then meet at the station.',theme:'quarry'},
 FREIGHT:{name:'Quarry freight',place:'NORTH QUARRY',icon:'box',text:'Deliver the case. Invent your route.',goal:'Leave the case at the station; bring everyone.',theme:'quarry'},
 SANDBOX:{name:'Open workshop',place:'NORTH QUARRY',icon:'hand',text:'No finish line. Experiment with all equipment.',goal:'No objective. Build, carry, climb and experiment.',theme:'quarry'}
});
const PARTY_SEATS=['front','back','left','right'];
const PARTY_ACTIONS=new Set(['jump','grip','rope','use','throw','reset','resetProps','cast0','cast1','cast2','cast3','repair','pulse','build0','build1','build2','undo','rescue']);
const clone10=x=>JSON.parse(JSON.stringify(x));
function cleanInput10(i={}){const n=(v,a=-1,b=1)=>Number.isFinite(v)?clamp(v,a,b):0;return {...neutralLab(),x:n(i.x),z:n(i.z),forward:n(i.forward),side:n(i.side),yaw:n(i.yaw,-62832,62832),pitch:n(i.pitch,-1.42,1.27),turn:n(i.turn),tilt:n(i.tilt),reel:n(i.reel,-3,3),up:!!i.up,down:!!i.down,left:!!i.left,right:!!i.right,sprint:!!i.sprint,crouch:!!i.crouch,brace:!!i.brace,slow:!!i.slow,active:i.active!==false,actions:(Array.isArray(i.actions)?i.actions:[]).filter(a=>PARTY_ACTIONS.has(a)).slice(0,12)};}

function expeditionWorld10(mode){
 if(['SURVEY','FREIGHT','SANDBOX'].includes(mode)){let w=labWorld();return {...w,theme:'quarry',checkpoints:[w.spawn],camera:[16,14,25],bounds:[-72,72,-15,70,-65,66]};}
 let boxes=[],props=[],marks=[],anchors=[],tags=[],checkpoints=[],hazards=[];
 const B=(id,p,s,mat='stone',extra={})=>{let b=boxDef(id,p,s,mat,extra);boxes.push(b);return b};
 const A=(p,name)=>{anchors.push({id:anchors.length,p,name})};
 const mark=(p,name)=>marks.push({id:marks.length,p,name});
 const stair=(id,a,b,width=3.2)=>{let rise=b[1]-a[1],run=dist([a[0],0,a[2]],[b[0],0,b[2]]),N=Math.max(1,Math.ceil(Math.abs(rise)/.22)),yaw=Math.atan2(b[0]-a[0],b[2]-a[2]);for(let k=0;k<N;k++){let p=mix(a,b,(k+.5)/N);B(id+k,[p[0],p[1]-.13,p[2]],[width,.26,run/N+.18],'stone',{q:Qyaw(yaw)});}};
 const plank=(id,p,s,mass)=>props.push(dynamicDef(id,p,s,mass,'wood',{label:Math.round(s[0]*10)/10+' m timber'}));
 let spawn=[0,.04,12],goal=[0,10.8,-40],bounds=[-80,80,-18,65,-120,35],camera=[15,11,22];
 if(['SUMMIT','CHAINED','DELIVERY'].includes(mode)){
  B('basecamp',[0,-1,9],[32,2,22]);B('lower-basin',[0,-5,-20],[53,2,43]);
  B('first-massif',[0,-.6,-5],[12,6.8,8]); // 2.80 m top
  B('second-massif',[6,1,-19],[14,10,10]); // 6 m top
  B('summit-massif',[0,3,-36],[18,15,15]); // 10.50 m top
  stair('trail-one-',[-11,0,4],[-11,2.8,-8],3.2);
  B('shelf-one',[-6.5,2.64,-8],[7,.32,3.4],'wood');
  stair('trail-two-',[16,-4,-10],[16,6,-28],3.4);
  B('transfer-two',[12,5.84,-25],[7,.32,3.5],'wood');
  stair('trail-three-',[10,6,-27],[10,10.5,-40],3.2);
  B('beacon-transfer',[7.3,10.34,-40.45],[8.6,.32,1.6],'wood');
  // Two alternatives across the basin, with the same collision geometry as the planks.
  B('bridge-to-second',[3,4.305,-10.9],[3,.24,7.05],'wood',{q:Qaxis([1,0,0],.495)});
  B('bridge-west',[-8.2,7.2,-29],[2,.25,7],'wood',{q:Qaxis([1,0,0],.18)});
  for(let p of [[-3,3.9,-3],[6,7.2,-16],[0,11.6,-32]])A(p,'Belay ring');
  checkpoints=[[0,.04,12],[0,2.83,-6],[6,6.03,-20],[0,10.53,-36]];
  goal=[0,10.54,-39];mark([-3,2.85,-7],'First camp');mark([5,6.05,-22],'High camp');
  props.push(dynamicDef('case',[2.1,.5,11],[.65,.48,.44],8,'gold',{label:'Fragile summit case'}));
  plank('long-timber',[-5,.3,10],[5.8,.18,.85],20);props.push(dynamicDef('crate-a',[-3,.55,9],[.85,.85,.85],12,'wood',{label:'Equipment crate'}));
  tags.push({p:[0,3.3,-1],text:'FIRST FACE · 2.80 m'},{p:[-11,1.4,2],text:'WALKING TRAIL'},{p:[16,0,-13],text:'LOWER SWITCHBACK'},{p:[0,11.4,-39],text:'SUMMIT BEACON'});
 }else if(mode==='BODY'){
  B('body-yard',[0,-1,-8],[23,2,46]);spawn=[0,.04,12];goal=[0,2.44,-26];
  B('step-low',[0,.28,4],[6,.56,2.3],'wood');B('step-mid',[0,.62,-1],[6,1.24,3],'stone');B('step-high',[0,1.1,-7],[6,2.2,4],'stone');
  B('left-route',[-5,.30,-4],[3,.60,22],'wood');B('right-route',[5,.3,-4],[3,.6,22],'wood');
  B('final-platform',[0,1.15,-23],[15,2.3,8]);stair('body-side-',[-7,0,-8],[-7,2.3,-20],3.4);B('body-transfer',[-4,2.15,-20],[6,.3,3],'wood');
  mark([0,.65,4],'Footwork');mark([0,2.25,-7],'Balance');mark([0,2.36,-23],'Together');A([0,3.5,-7],'Reach ring');
  props.push(dynamicDef('crate-a',[3,.55,10],[.85,.85,.85],12,'wood',{label:'Shared practice crate'}));
  checkpoints=[spawn,[0,2.36,-23]];tags.push({p:[0,3.3,5],text:'ONE BODY · EVERY SEAT CAN MOVE'});
 }else if(mode==='ECHO'){
  B('ruins-floor',[0,-1,-12],[34,2,56]);spawn=[0,.04,12];goal=[0,.04,-36];
  // Freestanding ruined pillars; broad alternative walkways stay open.
  for(let z of [2,-10,-23])for(let x of [-11,11])B('pillar-'+x+'-'+z,[x,2.5,z],[2,5,2],'stone');
  B('ruin-wall',[-4,1,-12],[9,2,1.1],'stone');B('ruin-wall2',[8,1,-23],[9,2,1.1],'stone');
  [[[-7,.1,4],'SHIELD'],[[7,.1,-4],'PUSH'],[[-7,.1,-18],'LIGHT'],[[7,.1,-27],'ANCHOR']].forEach(([p,name])=>mark(p,name));
  props.push(dynamicDef('echo-crate',[4,.50,-4],[.8,.8,.8],10,'wood',{label:'Movable ward stone'}));
  A([-7,3,4],'Ruin ring');A([7,3,-27],'Last ring');checkpoints=[spawn,[0,.04,-16]];
  tags=marks.map(m=>({p:add(m.p,[0,1.8,0]),text:m.name+' · '+(m.id+1)}));
 }else if(mode==='RIVER'){
  spawn=[0,.65,9];goal=[0,.65,-94];camera=[12,12,23];
  B('riverbed',[0,-3,-42],[40,1,130]);B('west-bank',[-13,1,-44],[9,7,135]);B('east-bank',[13,1,-44],[9,7,135]);
  B('start-dock',[0,.30,15],[13,.6,6],'wood');B('finish-dock',[0,.30,-99],[15,.6,7],'wood');
  for(let k=0;k<11;k++){let z=-2-k*8,x=k%3===0?-4:k%3===1?3.7:-.6,r=k%3===2?1.35:1.7;B('river-rock-'+k,[x,.30,z],[r*2,2.2,r*2]);hazards.push({id:k,p:[x,0,z],r});}
  checkpoints=[[0,.65,9],[0,.65,-33],[0,.65,-66]];
  for(let p of [[5,1,-25],[-5,1,-56],[5,1,-80]])mark(p,'Salvage · E');
  tags=[{p:[0,3,11],text:'ONE SHARED RAFT · WASD / E BAIL / F REPAIR'},{p:[0,3,-96],text:'EXIT DOCK'}];
 }else if(mode==='DIVE'){
  spawn=[0,.2,10];goal=[0,.20,-64];camera=[10,5,22];
  B('cave-floor',[0,-10,-27],[30,2,94]);B('cave-left',[-13,0,-27],[3,22,94]);B('cave-right',[13,0,-27],[3,22,94]);
  // Gaps above/below alternating partitions create real 3D swim routes.
  B('upper-hanging',[-4,1,-6],[17,8,2.8]);B('bottom-ridge',[4,-7,-22],[17,6,2.8]);B('upper-hanging2',[-4,1,-39],[17,8,2.8]);
  mark([-6,-5.6,-12],'Relic 1');mark([6,-1.2,-30],'Relic 2');mark([-6,-5.5,-48],'Relic 3');
  checkpoints=[[0,.2,10],[7,.2,-17],[7,.2,-43],[0,.2,-64]];
  checkpoints.forEach((p,k)=>A(add(p,[0,1,0]),'Air bell '+(k+1)));
  tags=checkpoints.map((p,k)=>({p:add(p,[0,1.3,0]),text:'AIR BELL '+(k+1)}));
 }else if(mode==='TOWER'){
  spawn=[0,.04,10];goal=[0,8.64,-4];camera=[14,10,21];
  B('workshop',[0,-1,0],[32,2,38]);
  B('beacon-platform',[0,8.40,-4],[7,.4,7],'steel');
  for(let x of [-3.2,3.2])for(let z of [-7.2,-.8])B('beacon-pylon-'+x+'-'+z,[x,4.2,z],[.25,8.4,.25],'steel',{grip:false});
  A([0,9.9,-4],'Beacon ring'); // rope is an alternate route, construction goal still requires structures
  props.push(dynamicDef('crate-a',[-4,.5,10],[.85,.85,.85],12,'wood',{label:'Builder’s crate'}));plank('loose-timber',[4,.3,7],[4,.18,.9],14);
  checkpoints=[spawn];tags=[{p:[0,2,11],text:'B BUILD TOOL · 1 STEP / 2 BEAM / 3 POST'},{p:[0,10,-4],text:'BUILD 6 PIECES · REACH THE BEACON'}];
 }
 return {boxes,props,marks,anchors,tags,spawn,goal,checkpoints,hazards,bounds,camera,theme:MODE_DEFS[mode]?.theme||'alpine'};
}

class PartySimulation extends LabSimulation{
 constructor(mode='SUMMIT',connection='SOLO'){
  super('SANDBOX','SOLO');this.mode=MODE_DEFS[mode]?mode:'SUMMIT';this.connection=['RIVER','DIVE'].includes(this.mode)?(connection==='SOLO'?'SOLO':'COOP'):(MODE_DEFS[this.mode].link||connection);
  this.world=expeditionWorld10(this.mode);this.props=this.world.props;this._solids=null;this.players=new Map;this.shared=null;this.raft=null;
  this.mission={progress:0,total:this.mode==='ECHO'?4:3,stage:0,integrity:100,water:0,supplies:3,timber:32,builds:0,restarts:0,misfires:0,checkpoints:0,shieldUntil:0,spell:null,winAt:null};
  this.structures=[];this.lastCast=null;this.lastHazard=-9;this.lastCheckpoint=0;this.sessionTime=0;
  if(this.mode==='RIVER')this.raft={id:'team-raft',pos:[0,.38,9],vel:[0,0,0],yaw:0,water:0,integrity:100,supplies:3,checkpoint:0,hitAt:-100,burst:0,repairAt:-10,bailAt:-10};
 }
 solids(){if(!this._solids||this._solids.props!==this.props||this._solids.len!==this.world.boxes.length){let a=[...this.world.boxes,...this.props];a.props=this.props;a.len=this.world.boxes.length;this._solids=a;}return this._solids;}
 add(id='solo',seat='front',slot=0){
  if(this.players.has(id))return this.players.get(id);let p=super.add(id,seat);p.slot=slot;p.active=true;p.finished=false;p.oxygen=100;p.downTime=0;p.spellCD=[0,0,0,0];p.seals=[];p.motionEpoch=0;
  p.pos=add(this.world.spawn,[(slot-1.5)*.82,0,0]);p.checkpoint=p.pos.slice();
  if(this.connection==='BODY'){if(!this.shared){this.shared=clone10(p);this.shared.id='shared-body';this.shared.pos=this.world.spawn.slice();this.shared.checkpoint=this.world.spawn.slice();this.shared.agreement=1;}p.pos=this.shared.pos.slice();p.entityId='shared-body';}
  if(this.raft)this.mountRaft();return p;
 }
 remove(id){this.players.delete(id);if(this.raft)this.mountRaft();}
 effectivePlayers(){return this.connection==='BODY'&&this.shared?[this.shared]:[...this.players.values()];}
 playersHasCarry(id){return this.connection==='BODY'&&this.shared?this.shared.carry===id:super.playersHasCarry(id)}
 syncShared(){if(!this.shared)return;for(let p of this.players.values()){let keep={id:p.id,slot:p.slot,seat:p.seat,active:p.active,yaw:p.yaw,pitch:p.pitch};Object.assign(p,clone10(this.shared),keep);p.entityId='shared-body';}}
 combineBody(inputs){
  let merged=cleanInput10(),moves=[],any=false;let ps=[...this.players.values()].sort((a,b)=>a.slot-b.slot),steer=ps.find(p=>p.seat==='front'&&(inputs.get(p.id)?.active!==false))||ps[0];
  merged.yaw=inputs.get(steer?.id)?.yaw??this.shared.yaw;merged.pitch=inputs.get(steer?.id)?.pitch??0;
  for(let p of ps){let i=inputs.get(p.id)||cleanInput10({active:false});if(!i.active)continue;
   let amount=Math.hypot(i.x,i.z);if(amount>.06)moves.push([i.x,0,i.z]);
   if(Math.abs(i.forward)+Math.abs(i.side)>.05){merged.forward+=i.forward;merged.side+=i.side;any=true;}
   // Basic movement and jump are NEVER gated on an occupied-but-idle seat.
   merged.sprint||=i.sprint;merged.crouch||=i.crouch;merged.brace||=i.brace;merged.left||=i.left;merged.right||=i.right;
   merged.turn+=i.turn;merged.tilt+=i.tilt;merged.reel+=i.reel;merged.actions.push(...i.actions);
  }
  let d=moves.length?mul(moves.reduce((a,b)=>add(a,b),[0,0,0]),1/moves.length):[0,0,0];merged.x=d[0];merged.z=d[2];
  this.shared.agreement=moves.length?length(d):1;if(any){merged.forward=clamp(merged.forward,-1,1);merged.side=clamp(merged.side,-1,1);}merged.actions=[...new Set(merged.actions)];return merged;
 }
 actions(p,i){p.yaw=i.yaw;p.pitch=i.pitch;let normal=[];for(let a of i.actions||[]){
  if(a.startsWith('cast')){if(this.mode==='ECHO')this.cast(p,Number(a.slice(-1)));continue;}
  if(a.startsWith('build')){if(this.mode==='TOWER'||this.mode==='SANDBOX')this.build(p,Number(a.slice(-1)));continue;}
  if(a==='undo'){this.undo(p);continue;}
  if(a==='repair'){if(this.raft)this.raftRepair();else if(this.mode==='DIVE')this.shareAir(p);continue;}
  if(a==='pulse'){p.pulseUntil=this.time+4;continue;}
  if(a==='rescue'){this.rescue(p);continue;}
  if(a==='use'){this.interact(p);continue;}
  if(a==='resetProps'){if(this.mode==='SANDBOX')normal.push(a);else this.events.push({id:p.id,text:'Use camp recovery; equipment resets only in Open Workshop.'});continue;}
  normal.push(a);
 }super.actions(p,{...i,actions:normal});}
 interact(p){
  if(this.raft){this.bail();return;}
  if(this.mode==='DIVE'){
   let m=this.world.marks.find(m=>!this.collected.includes(m.id)&&dist(add(p.pos,[0,.8,0]),m.p)<2.0);
   if(m){this.collected.push(m.id);this.events.push({id:p.id,text:'Relic secured · '+this.collected.length+' / 3'});return;}
   this.shareAir(p);return;
  }
  if(this.mode==='BODY'){let m=this.world.marks.find(m=>!this.collected.includes(m.id)&&dist(p.pos,m.p)<1.6);if(m){this.collected.push(m.id);this.events.push({id:p.id,text:m.name+' station recorded'});return;}}
  if(['SURVEY','FREIGHT','SANDBOX'].includes(this.mode)){
   if(this.mode==='SURVEY'){let m=this.world.marks.find(m=>!this.collected.includes(m.id)&&dist(add(p.pos,[0,.3,0]),m.p)<1.4);if(m){this.collected.push(m.id);this.events.push({id:p.id,text:'Survey recorded · '+this.collected.length+' / 3'});return;}}
  }
  // Preserve free object handling, but the global objective may only complete below.
  let m=this.mode,done=this.completed;this.mode='SANDBOX';super.interact(p);this.mode=m;this.completed=done;
 }
 recover(p){if(this.connection==='CHAINED'){
   const active=this.effectivePlayers();for(let[k,v]of active.entries()){super.recover(v);v.pos=add(this.world.checkpoints[this.lastCheckpoint]||this.world.spawn,[(k-(active.length-1)/2)*.85,0,0]);v.motionEpoch=(v.motionEpoch||0)+1;}
  }else if(this.raft){this.resetRaft();return;}else {super.recover(p);p.motionEpoch=(p.motionEpoch||0)+1;p.oxygen=100;p.downTime=0;}
 }
 rescue(p){let q=[...this.players.values()].find(q=>q.id!==p.id&&dist(q.pos,p.pos)<1.8&&(q.pos[1]<p.pos[1]+.4));if(!q)return;let target=add(p.pos,mul(this.forward(p),-.8));if(this.clear(target,q.height,q.radius)){q.pos=target;q.vel=[0,1.5,0];q.hands=[null,null];q.motionEpoch++;this.events.push({id:p.id,text:'Teammate boosted to safety'});}}
 move(p,i,dt){if(this.mode==='DIVE'){this.swim(p,i,dt);return;}
  // The base motor is shared with the tested metre-scale lab. Mode rules never teleport a climb.
  super.move(p,i,dt);
  if(p.pos[1]<-13&&this.mode!=='DIVE')this.recover(p);
 }
 physicsProps(dt){let c=this.props.find(b=>b.id==='case'),vy=c?.v[1]||0,prev=c?.p.slice();super.physicsProps(dt);
  if(c&&this.mode==='DELIVERY'&&vy<-4.0&&c.v[1]>vy*.25&&dist(c.p,c.spawn.p)>.8){this.mission.integrity=clamp(this.mission.integrity-(Math.abs(vy)-3.5)*4,0,100);}
  if(this.mission.integrity<=0){this.mission.integrity=100;this.mission.restarts++;if(c){c.p=c.spawn.p.slice();c.q=c.spawn.q.slice();c.v=[0,0,0];c.w=[0,0,0];}for(let p of this.effectivePlayers())if(p.carry==='case')p.carry=null;this.events.push({id:'team',text:'Case damaged · replacement sent to base camp'});}
 }
 cast(p,k){if(k<0||k>3||p.spellCD[k]>this.time)return;p.spellCD[k]=this.time+1.1;
  let conflict=this.lastCast&&this.time-this.lastCast.at<.22&&this.lastCast.id!==p.id&&this.lastCast.kind!==k;
  this.mission.spell={kind:k,id:p.id,at:this.time,pos:p.pos.slice(),misfire:!!conflict};
  if(conflict){this.mission.misfires++;p.stamina=Math.max(0,p.stamina-9);p.vel[1]=Math.max(p.vel[1],1.3);this.events.push({id:'team',text:'Spell clash! Take turns casting.'});this.lastCast={id:p.id,kind:k,at:this.time};return;}
  this.lastCast={id:p.id,kind:k,at:this.time};
  if(k===0){p.shieldUntil=this.time+5;this.mission.shieldUntil=this.time+5;}
  if(k===1)for(let b of this.props)if(dist(b.p,p.pos)<5)impulse(b,mul(norm(sub(b.p,p.pos)),50),b.p);
  if(k===2)p.pulseUntil=this.time+8;
  if(k===3){p.stamina=Math.min(100,p.stamina+25);p.anchorUntil=this.time+3;}
  let ward=this.world.marks[k];if(ward&&dist(add(p.pos,[0,.5,0]),ward.p)<4.0&&!this.collected.includes(k)){
   let ray=this.ray(add(p.pos,[0,1,0]),norm(sub(add(ward.p,[0,.8,0]),add(p.pos,[0,1,0]))),dist(add(ward.p,[0,.8,0]),add(p.pos,[0,1,0]))-.06);
   if(!ray){this.collected.push(k);this.events.push({id:'team',text:['Shield','Push','Light','Anchor'][k]+' ward awakened'});}
  }
 }
 shareAir(p){let target=[...this.players.values()].filter(q=>q.id!==p.id&&dist(p.pos,q.pos)<2&&q.oxygen<70).sort((a,b)=>a.oxygen-b.oxygen)[0];if(!target||p.oxygen<32)return;let amount=Math.min(25,p.oxygen-20,100-target.oxygen);p.oxygen-=amount;target.oxygen+=amount;target.downTime=0;this.events.push({id:'team',text:'Air shared between divers'});}
 swim(p,i,dt){p.yaw=i.yaw;p.pitch=i.pitch;p.hands=[null,null];p.grounded=false;
  let forward=this.forward(p,true),right=[Math.cos(p.yaw),0,-Math.sin(p.yaw)];let d=add(add(mul(forward,i.forward),mul(right,i.side)),[0,(i.up?1:0)-(i.down||i.crouch?1:0),0]);if(length(d)>1)d=norm(d);
  p.vel=mix(p.vel,mul(d,i.sprint?3.2:2.4),1-Math.exp(-5*dt));let old=p.pos.slice();this.moveCapsule(p,mul(p.vel,dt),false);p.pos[1]=clamp(p.pos[1],-8.6,1.2);p.distance+=dist(old,p.pos);p.state='SWIM';p.stamina=100;
  let bell=this.world.checkpoints.find(a=>dist(p.pos,a)<2.5);if(bell){p.oxygen=Math.min(100,p.oxygen+30*dt);p.checkpoint=bell.slice();p.downTime=0;}else p.oxygen=Math.max(0,p.oxygen-dt*(i.sprint?2.5:1.65));
  if(p.oxygen<=0){p.downTime+=dt;p.vel=mul(p.vel,.45);if(p.downTime>7){this.recover(p);this.events.push({id:p.id,text:'Out of air · returned to last air bell'});}}
 }
 buildPreview(p,k=0){const sizes=[[2.0,.44,1.50],[4,.22,1.35],[1.0,1.0,1.0]],s=sizes[k]||sizes[0],eye=add(p.pos,[0,1.55,0]);
  let ray=this.ray(eye,this.forward(p,true),4.5,b=>b.id!==p.carry);if(!ray||ray.n[1]<.50)return {valid:false,reason:'Aim at a supporting top face within 4.5 m.'};
  let centre=[Math.round(ray.p[0]*4)/4,ray.p[1]+s[1]/2+.003,Math.round(ray.p[2]*4)/4],b=boxDef('preview',centre,s,'wood',{q:Qyaw(Math.round(p.yaw/(Math.PI/2))*Math.PI/2)});
  if(this.mission.timber<(k===1?2:1))return {valid:false,reason:'No timber left. Undo an unused piece.',b};
  // All corners need a supporting surface; beams need two independent ends.
  let axes=boxAxes(b),points=k===1?[add(centre,mul(axes[0],s[0]*.42)),sub(centre,mul(axes[0],s[0]*.42))]:[centre];
  let supported=points.every(a=>!!this.ray([a[0],centre[1]-s[1]/2+.06,a[2]],[0,-1,0],.20));
  if(!supported)return {valid:false,reason:'Needs support below (beams need both ends).',b};
  if(this.effectivePlayers().some(p=>capsuleBox(p.pos,p.height,p.radius,b)?.depth>.008))return {valid:false,reason:'A player is in the placement area.',b};
  if(this.solids().some(o=>{let c=satBoxes(b,o);return c&&c.depth>.012}))return {valid:false,reason:'The piece overlaps an existing solid.',b};
  return {valid:true,b,cost:k===1?2:1};
 }
 build(p,k){if(this.time-(p.buildAt||-10)<.25)return;p.buildAt=this.time;let v=this.buildPreview(p,k);if(!v.valid){this.events.push({id:p.id,text:v.reason});return;}
  let id='built-'+(++this.mission.builds),b={...v.b,id,owner:p.id,cost:v.cost};this.structures.push(b);this.world.boxes.push(b);this.mission.timber-=v.cost;this.events.push({id:p.id,text:'Timber fixed · '+this.mission.timber+' remaining'});}
 undo(p){let b=[...this.structures].reverse().find(b=>b.owner===p.id);if(!b)return;let occupied=this.effectivePlayers().some(q=>q.groundId===b.id||capsuleBox(q.pos,q.height,q.radius,{...b,h:add(b.h,[.08,.12,.08])}));
  let supporting=this.structures.some(q=>q.id!==b.id&&Math.abs(q.p[1]-q.h[1]-(b.p[1]+b.h[1]))<.025&&Math.abs(q.p[0]-b.p[0])<q.h[0]+b.h[0]&&Math.abs(q.p[2]-b.p[2])<q.h[2]+b.h[2]);
  if(occupied||supporting){this.events.push({id:p.id,text:'Cannot remove an occupied or supporting piece.'});return;}
  this.structures=this.structures.filter(q=>q.id!==b.id);this.world.boxes=this.world.boxes.filter(q=>q.id!==b.id);this.mission.timber+=b.cost;this._solids=null;}
 mountRaft(){if(!this.raft)return;let r=this.raft;for(let p of this.players.values()){let offsets=[[-.52,0,.55],[.52,0,.55],[-.52,0,-.55],[.52,0,-.55]],off=Qrot(Qyaw(r.yaw),offsets[p.slot%4]);p.pos=add(add(r.pos,off),[0,.30,0]);p.vel=r.vel.slice();p.grounded=true;p.state='PADDLE';p.poseYaw=r.yaw;p.hands=[null,null];}}
 bail(){let r=this.raft;if(this.time-r.bailAt<.4)return;r.bailAt=this.time;r.water=Math.max(0,r.water-10);let crate=this.world.marks.find(m=>!this.collected.includes(m.id)&&dist(m.p,r.pos)<5);if(crate){this.collected.push(crate.id);r.supplies++;r.integrity=Math.min(100,r.integrity+8);this.events.push({id:'team',text:'Salvage recovered · +1 repair kit'});}}
 raftRepair(){let r=this.raft;if(!r||r.supplies<=0||this.time-r.repairAt<1.5)return;r.repairAt=this.time;r.supplies--;r.integrity=Math.min(100,r.integrity+32);r.water=Math.max(0,r.water-12);this.events.push({id:'team',text:'Hull repaired'});}
 resetRaft(){let r=this.raft,cp=this.world.checkpoints[r.checkpoint]||this.world.spawn;r.pos=[cp[0],.38,cp[2]];r.vel=[0,0,0];r.yaw=0;r.water=0;r.integrity=100;r.supplies=Math.max(2,r.supplies);this.mission.restarts++;for(let p of this.players.values()){p.motionEpoch++;p.falls++;}this.mountRaft();this.events.push({id:'team',text:'Raft recovered at the last dock'});}
 raftStep(inputs){let r=this.raft,n=0,side=0,fw=0;for(let p of this.players.values()){let i=inputs.get(p.id)||cleanInput10();p.yaw=i.yaw;p.pitch=i.pitch;if(i.active&&(Math.abs(i.side)+Math.abs(i.forward))>.02){n++;side+=i.side;fw+=i.forward;}for(let a of i.actions){if(a==='use')this.bail();if(a==='repair')this.raftRepair();if(a==='reset')this.resetRaft();if(a==='jump'&&r.burst<=0)r.burst=1.2;}}
  if(n){side/=n;fw/=n;}let dt=1/60;r.burst=Math.max(0,r.burst-dt);
  let leak=(100-r.integrity)*.018+.16;r.water=clamp(r.water+dt*leak,0,100);let pace=clamp(1.8+fw*2.7+(r.burst>.8?1.1:0),-.9,5.6)*(1-r.water*.006);
  r.vel[0]=lerp(r.vel[0],side*3.7,1-Math.exp(-3*dt));r.vel[2]=lerp(r.vel[2],-pace,1-Math.exp(-2*dt));r.pos=add(r.pos,mul(r.vel,dt));r.yaw=lerp(r.yaw,-side*.23,dt*4);r.pos[1]=.38+Math.sin(this.time*2)*.03;
  r.pos[0]=clamp(r.pos[0],-8,8);
  for(let h of this.world.hazards){let d=[r.pos[0]-h.p[0],0,r.pos[2]-h.p[2]],l=length(d),radius=h.r+1.2;if(l<radius){let normal=l>.001?mul(d,1/l):[1,0,0];r.pos=add(r.pos,mul(normal,radius-l));let closing=dot(r.vel,normal);if(closing<0)r.vel=sub(r.vel,mul(normal,closing*1.3));if(this.time-r.hitAt>.8){r.integrity=Math.max(0,r.integrity-9-Math.abs(closing)*2);r.water+=6;r.hitAt=this.time;this.events.push({id:'team',text:'Rock impact · E bail / F repair'});}}}
  for(let k=1;k<this.world.checkpoints.length;k++)if(r.pos[2]<this.world.checkpoints[k][2]&&r.checkpoint<k){r.checkpoint=k;this.events.push({id:'team',text:'River checkpoint secured'});}
  if(r.integrity<=0||r.water>=100)this.resetRaft();if(r.pos[2]<-94)this.completed=true;this.mountRaft();this.mission={...this.mission,water:r.water,integrity:r.integrity,supplies:r.supplies,checkpoints:r.checkpoint};
 }
 chainStep(players,inputs){for(let k=1;k<players.length;k++){let a=players[k-1],b=players[k],d=dist(a.pos,b.pos);if(d>4.2){let dir=norm(sub(b.pos,a.pos)),amount=Math.min(.075,(d-4.2)*.30),ma=inputs.get(a.id)?.brace&&a.grounded?.10:1,mb=inputs.get(b.id)?.brace&&b.grounded?.10:1,sum=ma+mb;
   this.moveCapsule(a,mul(dir,amount*ma/sum),false);this.moveCapsule(b,mul(dir,-amount*mb/sum),false);a.vel=add(a.vel,mul(dir,amount*6*ma/sum));b.vel=sub(b.vel,mul(dir,amount*6*mb/sum));
  }} }
 missionStep(){let ps=this.effectivePlayers(),alive=ps.filter(p=>p.active!==false);if(!alive.length)return;
  if(['SUMMIT','CHAINED','DELIVERY'].includes(this.mode)){
   for(let k=this.lastCheckpoint+1;k<this.world.checkpoints.length;k++){let c=this.world.checkpoints[k];if(alive.every(p=>dist(p.pos,c)<6&&p.grounded)){this.lastCheckpoint=k;this.mission.checkpoints=k;for(let[j,p]of ps.entries())p.checkpoint=add(c,[j*.7,0,0]);this.events.push({id:'team',text:'Camp '+k+' secured by the whole team'});}}
  }
  if(this.mode==='ECHO'&&this.time-this.lastHazard>5){this.lastHazard=this.time;for(let p of ps)if((p.shieldUntil||0)<this.time&&this.collected.length<4){p.stamina=Math.max(0,p.stamina-8);this.mission.pulseAt=this.time;}}
  if(this.mode==='BODY')for(let m of this.world.marks)if(!this.collected.includes(m.id)&&dist(ps[0].pos,m.p)<1.6){this.collected.push(m.id);this.events.push({id:'team',text:m.name+' · '+this.collected.length+' / 3'});}
  this.mission.progress=this.collected.length;
  if(this.mode==='SANDBOX'||this.mode==='RIVER')return;
  let near=alive.every(p=>dist(p.pos,this.world.goal)<3.2&&(this.mode==='DIVE'||p.grounded));
  let requirement=true;if(['BODY','SURVEY','DIVE'].includes(this.mode))requirement=this.collected.length>=3;if(this.mode==='ECHO')requirement=this.collected.length>=4;
  if(['DELIVERY','FREIGHT'].includes(this.mode)){let c=this.props.find(b=>b.id==='case');requirement=!!c&&dist(c.p,add(this.world.goal,[0,.25,0]))<2.5&&!this.playersHasCarry('case')&&this.mission.integrity>0;this.cargoDelivered=requirement;}
  if(this.mode==='TOWER')requirement=this.structures.length>=6;
  if(near&&requirement){this.completed=true;this.mission.winAt=this.time;}
 }
 step(rawInputs=new Map){this.events=[];if(!this.players.size)return;let inputs=new Map;for(let p of this.players.values())inputs.set(p.id,cleanInput10(rawInputs.get(p.id)||{active:false,yaw:p.yaw,pitch:p.pitch}));
  if(this.raft){this.raftStep(inputs);this.tick++;this.time+=1/60;return;}
  let participants=this.players,physical=[...participants.values()].filter(p=>p.active!==false).sort((a,b)=>a.slot-b.slot);
  if(this.connection==='BODY'&&this.shared){let merged=this.combineBody(inputs);this.players=new Map([[this.shared.id,this.shared]]);inputs=new Map([[this.shared.id,merged]]);physical=[this.shared];}
  for(let p of physical){let i=inputs.get(p.id)||cleanInput10();this.actions(p,i);}
  for(let k=0;k<2;k++){this.physicsProps(1/120);for(let p of physical)this.move(p,inputs.get(p.id)||cleanInput10(),1/120);if(this.connection!=='BODY')this.playerContacts(physical);if(this.connection==='CHAINED')this.chainStep(physical,inputs);}
  this.players=participants;if(this.connection==='BODY')this.syncShared();this.tick++;this.time+=1/60;this.missionStep();
 }
 snapshot(){return clone10({tick:this.tick,time:this.time,mode:this.mode,connection:this.connection,players:[...this.players.values()].sort((a,b)=>a.slot-b.slot),shared:this.shared,raft:this.raft,props:this.props,collected:this.collected,structures:this.structures,mission:this.mission,completed:this.completed,cargoDelivered:this.cargoDelivered,lastCheckpoint:this.lastCheckpoint});}
 load(s){this.tick=s.tick;this.time=s.time;this.mode=s.mode;this.connection=s.connection;this.collected=s.collected.slice();this.completed=s.completed;this.cargoDelivered=s.cargoDelivered;this.mission=clone10(s.mission);this.shared=s.shared?clone10(s.shared):null;this.raft=s.raft?clone10(s.raft):null;this.lastCheckpoint=s.lastCheckpoint||0;
  this.props=clone10(s.props);let ids=new Set(s.players.map(p=>p.id));for(let id of this.players.keys())if(!ids.has(id))this.players.delete(id);for(let p of s.players){if(this.players.has(p.id))Object.assign(this.players.get(p.id),clone10(p));else this.players.set(p.id,clone10(p));}
  this.structures=clone10(s.structures||[]);this.world.boxes=this.world.boxes.filter(b=>!b.id.startsWith('built-')).concat(this.structures);this._solids=null;
 }
}
