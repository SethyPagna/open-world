/* TEAMBOUND v9 · Physics & Freedom Lab.
 * Original bounded educational solver, not Rapier, not equipment engineering.
 * Metres / kilograms / seconds. Feet origins for players; COM origins for props.
 * Simulation: one 1/60 s tick containing two 1/120 s substeps, offline AND online.
 * Static and dynamic solids use the exact same oriented boxes as rendering.
 */
const LAB_CONFIG=Object.freeze({version:'9.0.0',gravity:9.81,height:1.80,radius:.28,skin:.015,eye:1.66,shoulder:1.46,reach:.75,mass:83,step:.25,walk:1.6,jog:3.2,sprint:5.6,jump:4,acceleration:10,braking:14,coyote:.10,buffer:.12,tick:1/60,substeps:2});
const Qid=()=>[0,0,0,1], Qnorm=q=>{let d=Math.hypot(...q)||1;return q.map(v=>v/d)},Qconj=q=>[-q[0],-q[1],-q[2],q[3]];
function Qmul(a,b){return [a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]]}
function Qrot(q,v){let u=q.slice(0,3),t=mul(cross(u,v),2);return add(v,add(mul(t,q[3]),cross(u,t)))}
function Qaxis(a,t){return [...mul(norm(a),Math.sin(t/2)),Math.cos(t/2)]}
const Qyaw=t=>Qaxis([0,1,0],t);
function boxLocal(b,p){return Qrot(Qconj(b.q),sub(p,b.p))}function boxWorld(b,p){return add(b.p,Qrot(b.q,p))}
function boxAxes(b){return [Qrot(b.q,[1,0,0]),Qrot(b.q,[0,1,0]),Qrot(b.q,[0,0,1])]}
function boxVertices(b){let v=[];for(let x of [-1,1])for(let y of [-1,1])for(let z of [-1,1])v.push(boxWorld(b,[x*b.h[0],y*b.h[1],z*b.h[2]]));return v}
function pointInBox(b,p,e=0){let l=boxLocal(b,p);return l.every((v,i)=>Math.abs(v)<=b.h[i]+e)}
function rayBox(a,d,b,max=100,inflate=0){let p=boxLocal(b,a),v=Qrot(Qconj(b.q),d),near=-Infinity,far=Infinity,axis=0,sign=1;for(let k=0;k<3;k++){let h=b.h[k]+inflate;if(Math.abs(v[k])<1e-9){if(Math.abs(p[k])>h)return null;continue}let t1=(-h-p[k])/v[k],t2=(h-p[k])/v[k],s=-1;if(t1>t2){[t1,t2]=[t2,t1];s=1}if(t1>near){near=t1;axis=k;sign=s}far=Math.min(far,t2);if(near>far)return null}if(far<.001||near>max)return null;let t=Math.max(0,near),n=[0,0,0];n[axis]=sign;return {t,p:add(a,mul(d,t)),n:Qrot(b.q,n),b}}
// Closest points of a vertical capsule centre segment and an oriented box.
// Convex squared distance along the segment is minimised, not a feet-centre radius check.
function capsuleBox(pos,height,radius,b,margin=LAB_CONFIG.skin){
 if(dist(add(pos,[0,height*.5,0]),b.p)>height*.5+radius+length(b.h)+margin)return null;
 let a=boxLocal(b,add(pos,[0,radius,0])),d=Qrot(Qconj(b.q),[0,Math.max(0,height-2*radius),0]);
 function at(t){let p=add(a,mul(d,t)),q=p.map((v,i)=>clamp(v,-b.h[i],b.h[i]));return {p,q,ds:dot(sub(p,q),sub(p,q))}}
 let best;
 if(Math.abs(d[0])+Math.abs(d[2])<1e-8){best=at(clamp(-a[1]/(d[1]||1),0,1))}
 else{let cuts=[0,1];for(let k=0;k<3;k++)if(Math.abs(d[k])>1e-8)for(let side of [-1,1]){let t=(side*b.h[k]-a[k])/d[k];if(t>0&&t<1)cuts.push(t)}cuts.sort((x,y)=>x-y);best=at(0);for(let j=0;j<cuts.length-1;j++){let lo=cuts[j],hi=cuts[j+1],mid=(lo+hi)*.5,A=0,B=0;for(let k=0;k<3;k++){let value=a[k]+d[k]*mid;if(Math.abs(value)>b.h[k]){let off=a[k]-Math.sign(value)*b.h[k];A+=d[k]*d[k];B+=d[k]*off}}for(let t of [lo,hi,A>1e-12?clamp(-B/A,lo,hi):mid]){let v=at(t);if(v.ds<best.ds)best=v}}}
 let v=best,R=radius+margin;if(v.ds>R*R)return null;
 let len=Math.sqrt(v.ds),n,depth;if(len>1e-8){n=mul(sub(v.p,v.q),1/len);depth=R-len}else{let e=v.p.map((x,i)=>b.h[i]-Math.abs(x)),k=e.indexOf(Math.min(...e));n=[0,0,0];n[k]=v.p[k]<0?-1:1;depth=R+e[k];v.q[k]=n[k]*b.h[k]}
 return {n:Qrot(b.q,n),depth,p:boxWorld(b,v.q),b};
}
function invInertia(b,v){if(!b.mass)return [0,0,0];let l=Qrot(Qconj(b.q),v);return Qrot(b.q,l.map((x,i)=>x*b.invI[i]))}
function impulse(b,j,at=b.p){if(!b.mass)return;if(length(j)>.03){b.sleeping=false;}b.v=add(b.v,mul(j,1/b.mass));b.w=add(b.w,invInertia(b,cross(sub(at,b.p),j)))}
function velocityAt(b,p){return add(b.v,cross(b.w,sub(p,b.p)))}
function satBoxes(a,b){let aa=boxAxes(a),bb=boxAxes(b),axes=[...aa,...bb];for(let x of aa)for(let y of bb){let n=cross(x,y);if(length(n)>.0001)axes.push(norm(n))}let cd=sub(a.p,b.p),best=Infinity,normBest=null;for(let n of axes){let ra=aa.reduce((s,x,i)=>s+Math.abs(dot(n,x))*a.h[i],0),rb=bb.reduce((s,x,i)=>s+Math.abs(dot(n,x))*b.h[i],0),pen=ra+rb-Math.abs(dot(n,cd));if(pen<0)return null;if(pen<best){best=pen;normBest=dot(n,cd)>=0?n:mul(n,-1)}}let points=boxVertices(a).filter(p=>pointInBox(b,p,.005));points.push(...boxVertices(b).filter(p=>pointInBox(a,p,.005)));let cp=points.length?mul(points.reduce((p,q)=>add(p,q),[0,0,0]),1/points.length):mul(add(a.p,b.p),.5);return {n:normBest,depth:best,p:cp};}
function resolveBoxes(a,b){let c=satBoxes(a,b);if(!c)return;let ia=a.mass?1/a.mass:0,ib=b.mass?1/b.mass:0,sum=ia+ib;if(!sum)return;let correction=Math.max(0,c.depth-.001)*.65/sum;a.p=add(a.p,mul(c.n,correction*ia));b.p=sub(b.p,mul(c.n,correction*ib));let ra=sub(c.p,a.p),rb=sub(c.p,b.p),rv=sub(velocityAt(a,c.p),velocityAt(b,c.p)),vn=dot(rv,c.n);if(vn>=0)return;let denom=sum+dot(c.n,add(cross(invInertia(a,cross(ra,c.n)),ra),cross(invInertia(b,cross(rb,c.n)),rb)));let j=-(1.025)*vn/Math.max(denom,1e-6),J=mul(c.n,j);impulse(a,J,c.p);impulse(b,mul(J,-1),c.p);rv=sub(velocityAt(a,c.p),velocityAt(b,c.p));let tv=sub(rv,mul(c.n,dot(rv,c.n))),tl=length(tv);if(tl>.00001){let t=mul(tv,1/tl),den=sum+dot(t,add(cross(invInertia(a,cross(ra,t)),ra),cross(invInertia(b,cross(rb,t)),rb))),f=Math.min(tl/Math.max(den,.0001),j*.65);impulse(a,mul(t,-f),c.p);impulse(b,mul(t,f),c.p)}}
function boxDef(id,p,size,mat='stone',extra={}){return {id,p:p.slice(),q:Qid(),h:size.map(x=>x/2),mat,mass:0,v:[0,0,0],w:[0,0,0],grip:mat==='stone'||mat==='wood',...extra}}
function dynamicDef(id,p,size,mass,mat='wood',extra={}){let b=boxDef(id,p,size,mat,{mass,...extra});b.invI=size.map((s,i)=>12/(mass*(size[(i+1)%3]**2+size[(i+2)%3]**2)));b.spawn={p:p.slice(),q:b.q.slice()};return b}
function labWorld(){const boxes=[],props=[],marks=[],anchors=[],tags=[];const B=(...x)=>{let b=boxDef(...x);boxes.push(b);return b};
 // Entire playable terrain is authored with matching render and collision solids.
 B('yard',[0,-1,9],[42,2,24],'stone');B('basin',[0,-5,-13],[58,2,26],'stone');
 B('west-block',[-17,.5,-11],[7,9,14],'stone');B('east-block',[16,-.2,-12],[10,7.6,14],'stone');
 B('north-block',[0,-.5,-28],[45,7,6],'stone');B('station-block',[14,4.5,-25],[12,3,10],'stone');
 B('middle-face',[-3,-.5,-7],[7,7,4],'stone',{q:Qyaw(.52)});B('middle-ledge',[-3,3.2,-8],[5,.4,3],'wood',{q:Qyaw(.52)});
 // Multi-level, connected side ascent: steps are genuinely walkable, not waypoint triggers.
 for(let i=0;i<44;i++)B('east-step-'+i,[23,-4+i*.22,-1-i*.52],[4,.4,.84],'stone');
 for(let i=0;i<28;i++)B('west-step-'+i,[-24,-4+i*.22,-2-i*.55],[3.8,.4,.88],'stone');for(let i=1;i<=15;i++)B('west-turn-'+i,[-24+i*.43,1.94+i*.22,-16.85],[.85,.4,3.0],'stone');
 B('west-transfer',[-21,1.5,-14],[5,1,4],'stone');B('station-step1',[21.8,5.64,-23.4],[1.6,.4,3]);B('station-step2',[20.6,5.82,-23.4],[1.6,.4,3]);
 // A measured direct crossing, one stair ramp and one low tunnel in the starting yard.
 B('vault-block',[6,.36,6],[2,.72,1.3],'wood');B('small-step',[8,.125,5],[1.4,.25,1.4],'wood');
 B('ramp',[-10,.62,6],[3,.35,6],'wood',{q:Qaxis([1,0,0],.23)});
 B('arch-left',[-14.65,.65,10],[.5,1.3,2],'stone');B('arch-right',[-12.85,.65,10],[.5,1.3,2],'stone');B('arch-top',[-13.75,1.32,10],[2.3,.34,2],'stone');
 // Reach/corner lab: valid grippable face at 0°, 45° and 90°.
 B('grip-face',[0,1.6,2],[4,3.2,1.1],'stone');B('grip-turn',[2.05,1.6,.7],[2.4,3.2,1.1],'stone',{q:Qyaw(Math.PI/4)});B('grip-side',[3,1.6,-.5],[1.1,3.2,2.4],'stone');
 // Physical edges, marked walkout limits, no invisible containment colliders.
 B('fence-back',[0,.48,20.8],[42,.95,.22],'wood');B('fence-east',[28,.4,-12],[.24,1.0,29],'wood');B('fence-west',[-28,.4,-12],[.24,1,29],'wood');
 props.push(dynamicDef('case',[2.4,.40,9],[.65,.48,.44],8,'gold',{label:'Survey case'}));
 props.push(dynamicDef('crate-a',[-3,.55,9],[.85,.85,.85],12,'wood',{label:'12 kg crate'}));props.push(dynamicDef('crate-b',[-4.1,.60,9.4],[.95,1.0,.95],18,'wood',{label:'18 kg crate'}));
 props.push(dynamicDef('plank-a',[-7,.35,6],[5.8,.16,.80],20,'wood',{label:'5.8 m timber'}));props.push(dynamicDef('plank-b',[-7,.52,8],[3.4,.18,.9],13,'wood',{label:'3.4 m plank',q:Qyaw(.35)}));
 props.push(dynamicDef('block',[4,.35,11],[.48,.48,.48],4,'red',{label:'4 kg block'}));props.push(dynamicDef('crate-c',[8,-3.4,-8],[1.0,1.0,1.0],18,'wood',{label:'Quarry crate'}));
 anchors.push({id:0,p:[.8,3.85,1.45],name:'Practice ring'},{id:1,p:[-15,6,-7],name:'West spur'},{id:2,p:[12,4.65,-7],name:'East spur'},{id:3,p:[13,7.1,-21],name:'Survey station'},{id:4,p:[-3,4.5,-8],name:'Turning face'});
 marks.push({id:0,p:[-16.8,5,-11],name:'West survey'},{id:1,p:[16,3.65,-10],name:'East survey'},{id:2,p:[-3,3.48,-8],name:'Central survey'});
 tags.push({p:[-.1,3.8,2],text:'CONTACT WALL · 3.20 m'},{p:[-13.75,1.7,10],text:'1.15 m CLEARANCE'},{p:[-7,.35,6],text:'TIMBER · 5.80 m'},{p:[5,1.1,6],text:'VAULT · 0.72 m'},{p:[23,-2,-3],text:'LOWER QUARRY'},{p:[14,6.5,-24],text:'SURVEY STATION'});
 return {boxes,props,marks,anchors,tags,spawn:[0,.04,11.5],goal:[14,6.02,-24]};}
function neutralLab(){return {x:0,z:0,forward:0,side:0,yaw:0,pitch:0,left:false,right:false,sprint:false,slow:false,crouch:false,brace:false,turn:0,tilt:0,reel:0,actions:[]}}
class LabSimulation{
 constructor(mode='SURVEY',connection='SOLO'){this.mode=mode;this.connection=connection;this.world=labWorld();this.props=this.world.props;this.players=new Map;this.tick=0;this.time=0;this.collected=[];this.events=[];this.completed=false;this.cargoDelivered=false;this.contacts=0;}
 add(id='solo',seat='front'){let p={id,seat,pos:this.world.spawn.slice(),vel:[0,0,0],height:LAB_CONFIG.height,radius:LAB_CONFIG.radius,yaw:0,pitch:-.07,grounded:false,groundId:null,coyote:0,jumpBuffer:0,stamina:100,hands:[null,null],gripClock:0,gripSide:0,carry:null,carryYaw:0,carryTilt:0,rope:null,mantle:null,falls:0,checkpoint:this.world.spawn.slice(),distance:0,state:'AIR',poseYaw:0,gripIntents:[false,false],handAssist:false,fatigue:0,landImpact:0,mantles:0,jumps:0,grabs:0};p.pos[0]+=(this.players.size)*.85;this.players.set(id,p);return p;}
 solids(){return [...this.world.boxes,...this.props]}
 ray(a,d,max=100,filter=()=>true,inflate=0){let best=null;for(let b of this.solids()){if(!filter(b))continue;let h=rayBox(a,d,b,max,inflate);if(h&&(!best||h.t<best.t))best=h}return best;}
 forward(p,vertical=false){return [-Math.sin(p.yaw)*(vertical?Math.cos(p.pitch):1),vertical?Math.sin(p.pitch):0,-Math.cos(p.yaw)*(vertical?Math.cos(p.pitch):1)]}
 shoulder(p,s){let right=[Math.cos(p.poseYaw),0,-Math.sin(p.poseYaw)];return add(add(p.pos,[0,p.height<1.4?.92:LAB_CONFIG.shoulder,0]),mul(right,s*.255))}
 handWorld(h){let b=this.solids().find(b=>b.id===h.body);return b?boxWorld(b,h.local):h.point}
 candidate(p,s,direction=null){let origin=this.shoulder(p,s),f=direction||this.forward(p),best=null;for(let up of [.34,.16,-.04,-.42,-.72,-1.1,-1.6])for(let side of [0,.13,-.13]){let dir=norm(add(f,[side,up,0])),h=this.ray(origin,dir,LAB_CONFIG.reach,b=>b.id!==p.carry);if(h&&h.b.grip&&Math.abs(h.n[1])<.78&&dot(f,mul(h.n,-1))>.35&&dist(origin,h.p)<=LAB_CONFIG.reach){let score=h.t+Math.abs(side)*.2;if(!best||score<best.score)best={...h,score}}}return best;}
 attach(p,s){let h=this.candidate(p,s),i=s<0?0:1;if(!h)return false;p.hands[i]={body:h.b.id,local:boxLocal(h.b,h.p),normal:h.n,point:h.p,age:0};p.grabs++;return true;}
 overlaps(pos,height,r=LAB_CONFIG.radius){return this.solids().filter(b=>{let c=capsuleBox(pos,height,r,b);return c&&c.depth>.008})}
 clear(pos,height,r=LAB_CONFIG.radius,ignore=null){return !this.solids().some(b=>b.id!==ignore&&capsuleBox(pos,height,r,b)?.depth>.006)}
 moveCapsule(p,d,allowStep=true){let previous=p.pos.slice(),parts=Math.max(1,Math.ceil(length(d)/.07)),dd=mul(d,1/parts),supported=false,mayStep=allowStep&&(p.grounded||p.coyote>0)&&p.vel[1]<=.2;for(let k=0;k<parts;k++){let beforePart=p.pos.slice();p.pos=add(p.pos,dd);for(let iter=0;iter<6;iter++){let hit=false;for(let b of (this.nearSolids?this.nearSolids(p.pos,p.height,p.radius):this.solids())){if(b.id===p.carry)continue;let c=capsuleBox(p.pos,p.height,p.radius,b);if(!c||c.depth<=1e-7)continue;
  if(mayStep&&c.n[1]<.90&&c.n[1]>-.25&&iter===0){let ahead=mul(norm([d[0],0,d[2]]),p.radius+.06),elevated=add(add(p.pos,ahead),[0,LAB_CONFIG.step+.025,0]),floor=this.ray(add(elevated,[0,.04,0]),[0,-1,0],.36,b=>b.id!==p.carry);if(floor&&floor.p[1]-previous[1]<=LAB_CONFIG.step+.025&&floor.p[1]>previous[1]+.020){let dst=[p.pos[0],floor.p[1]+LAB_CONFIG.skin+.003,p.pos[2]];if(this.clear(dst,p.height,p.radius,p.carry)){p.pos=dst;supported=true;p.groundId=floor.b.id;p.coyote=LAB_CONFIG.coyote;p.stepSupport={id:floor.b.id,offset:ahead,ttl:.32};continue}}}
  let share=b.mass?b.mass/(b.mass+LAB_CONFIG.mass):1;p.pos=add(p.pos,mul(c.n,c.depth*share));if(b.mass){b.p=sub(b.p,mul(c.n,c.depth*(1-share)));b.sleeping=false;}let rel=sub(p.vel,b.mass?velocityAt(b,c.p):[0,0,0]),vn=dot(rel,c.n);if(vn<0){if(b.mass){let amount=Math.min(-vn/(1/LAB_CONFIG.mass+1/b.mass),80);impulse(b,mul(c.n,-amount),c.p);p.vel=add(p.vel,mul(c.n,amount/LAB_CONFIG.mass));}else p.vel=sub(p.vel,mul(c.n,vn));}if(c.n[1]>.63){supported=true;p.groundId=b.id}hit=true;}if(!hit)break;}
 // Reject an unresolved squeeze rather than letting alternating projections leak through.
 if((this.nearSolids?this.nearSolids(p.pos,p.height,p.radius):this.solids()).some(b=>b.id!==p.carry&&capsuleBox(p.pos,p.height,p.radius,b)?.depth>.0025)){p.pos=beforePart;if(Math.abs(dd[0])>.00001)p.vel[0]=0;if(Math.abs(dd[2])>.00001)p.vel[2]=0;}
 }
 if(d[1]<=0&&supported){p.grounded=true;p.coyote=LAB_CONFIG.coyote}return sub(p.pos,previous);}
 ground(p){let h=this.ray(add(p.pos,[0,.06,0]),[0,-1,0],.115,b=>b.id!==p.carry);return h&&h.n[1]>.63?h:null;}
 recover(p){p.pos=p.checkpoint.slice();p.vel=[0,0,0];p.hands=[null,null];p.rope=p.mantle=p.stepSupport=null;p.carry=null;p.handAssist=false;p.stamina=100;p.grounded=false;p.falls++;this.events.push({id:p.id,text:'Back at camp · equipment stays where it fell'});}
 mantle(p){let h=p.hands.find(Boolean);if(!h)return false;let b=this.solids().find(b=>b.id===h.body),n=h.normal,at=this.handWorld(h);let high=add(add(at,mul(n,-.65)),[0,1.3,0]),top=this.ray(high,[0,-1,0],1.7,ob=>ob.id===b.id);if(!top||top.n[1]<.7||top.p[1]-p.pos[1]>1.62)return false;let dst=add(top.p,[0,.025,0]),rise=[p.pos[0],dst[1]+.08,p.pos[2]];if(!this.clear(dst,p.height,p.radius,p.carry))return false;let from=p.pos.slice();for(let k=1;k<=24;k++){let t=k/24,v=t<.55?mix(from,rise,t/.55):mix(rise,dst,(t-.55)/.45);if(!this.clear(v,p.height,p.radius,p.carry))return false}p.mantle={from,rise,to:dst,t:0,duration:.72};p.hands=[null,null];p.handAssist=false;p.vel=[0,0,0];p.mantles++;return true;}
 interact(p){if(p.carry){p.carry=null;p.carryStrain=0;return}
 let eye=add(p.pos,[0,p.height<1.4?1.01:LAB_CONFIG.eye,0]),f=this.forward(p,true),aim=this.ray(eye,f,2),choices=[];
 for(let body of this.props){if(this.playersHasCarry(body.id))continue;for(let side of [-1,1]){let sh=this.shoulder(p,side),local=boxLocal(body,sh).map((v,i)=>clamp(v,-body.h[i],body.h[i])),point=boxWorld(body,local),d=dist(sh,point);
 if(d>LAB_CONFIG.reach||dot(norm(sub(point,sh)),this.forward(p))<-.12)continue;let hit=this.ray(sh,norm(sub(point,sh)),d+.015);if(hit&&hit.b.id===body.id)choices.push({body,local,d,score:d-(aim?.b.id===body.id?.5:0)});}}
 choices.sort((a,b)=>a.score-b.score);if(choices.length){let q=choices[0];p.carry=q.body.id;p.carryLocal=q.local;p.carryYaw=p.yaw;p.carryTilt=0;p.carryStrain=0;p.hands=[null,null];p.handAssist=false;return}
 if(aim?.b.mass)this.events.push({id:p.id,text:'Move closer or crouch · handle outside 0.75 m reach'});
 for(let m of this.world.marks){if(dist(add(p.pos,[0,.3,0]),m.p)<1.25&&!this.collected.includes(m.id)){this.collected.push(m.id);this.events.push({id:p.id,text:'Survey recorded · '+this.collected.length+' / 3'});return}}
 if(dist(p.pos,this.world.goal)<2.4){if(this.mode==='SANDBOX')return;if(this.mode==='FREIGHT'&&!this.cargoDelivered){this.events.push({id:p.id,text:'Bring the orange survey case to this station'});return}if(this.mode==='SURVEY'&&this.collected.length<3){this.events.push({id:p.id,text:'Survey the three outcrops in any order'});return}this.completed=true;}
 }
 playersHasCarry(id){return [...this.players.values()].some(p=>p.carry===id)}
 ropeAction(p){if(p.rope){p.rope=null;return}let eye=add(p.pos,[0,1.35,0]),f=this.forward(p,true),candidates=this.world.anchors.map(a=>({a,d:dist(eye,a.p),alignment:dot(f,norm(sub(a.p,eye)))})).filter(c=>c.d<15&&c.alignment>.7).sort((a,b)=>b.alignment-a.alignment);for(let {a,d}of candidates){let hit=this.ray(eye,norm(sub(a.p,eye)),d-.12);if(!hit){p.rope={anchor:a.id,length:Math.max(1.4,d+.12),path:[],tension:0};return}}this.events.push({id:p.id,text:'Aim at a visible brass ring · within 15 m'});}
 actions(p,input){for(let a of input.actions||[]){if(a==='jump'){if(p.hands.some(Boolean)){if(!this.mantle(p)){let h=p.hands.find(Boolean);p.vel=add(mul(h.normal,2.2),[0,2.7,0]);p.hands=[null,null];p.handAssist=false;p.gripClock=-.35}}else p.jumpBuffer=LAB_CONFIG.buffer}else if(a==='use')this.interact(p);else if(a==='grip'){p.handAssist=!p.handAssist;if(!p.handAssist)p.hands=[null,null]}else if(a==='rope')this.ropeAction(p);else if(a==='throw'&&p.carry){let b=this.props.find(b=>b.id===p.carry);if(b)impulse(b,mul(this.forward(p,true),90),boxWorld(b,p.carryLocal));p.carry=null}else if(a==='reset')this.recover(p);else if(a==='resetProps'){this.props.forEach(b=>{if(!this.playersHasCarry(b.id)){b.p=b.spawn.p.slice();b.q=b.spawn.q.slice();b.v=[0,0,0];b.w=[0,0,0];b.sleeping=false;b.sleepTime=0;}})}else if(a==='seatNext'){let ar=['front','back','left','right'];p.seat=ar[(ar.indexOf(p.seat)+1)%4]}}}
 carryStep(p,i,dt){let b=this.props.find(b=>b.id===p.carry);if(!b){p.carry=null;return}p.carryYaw+=(i.turn||0)*dt*1.7;p.carryTilt=clamp(p.carryTilt+(i.tilt||0)*dt,-1.45,1.45);let f=this.forward(p),target=add(add(p.pos,[0,p.height<1.4?.72:1.23,0]),mul(f,.55)),at=boxWorld(b,p.carryLocal),error=sub(target,at),rel=sub(p.vel,velocityAt(b,at));let force=add(mul(error,340),mul(rel,36));if(length(force)>480)force=mul(norm(force),480);impulse(b,mul(force,dt),at);
 let desired=Qmul(Qyaw(p.carryYaw),Qaxis([0,0,1],p.carryTilt)),dq=Qmul(desired,Qconj(b.q));if(dq[3]<0)dq=mul(dq,-1);let torque=sub(mul(dq.slice(0,3),110),mul(b.w,16));if(length(torque)>100)torque=mul(norm(torque),100);b.w=add(b.w,mul(invInertia(b,torque),dt));p.carryStrain=dist(at,target)>1.10?(p.carryStrain||0)+dt:0;if(p.carryStrain>.35){p.carry=null;this.events.push({id:p.id,text:'Grip lost · object obstructed'})}}
 ropePath(p){let a=this.world.anchors.find(a=>a.id===p.rope.anchor).p,harness=add(p.pos,[0,1.05,0]),path=[a,...(p.rope.path||[])];
 // Collision-aware bends around static oriented boxes; NOT a simulated fibre rope.
 // Unwrap only if the preceding bend can see the harness.
 while(path.length>1&&!this.ray(path[path.length-2],norm(sub(harness,path[path.length-2])),dist(harness,path[path.length-2])-.04,b=>!b.mass))path.pop();
 for(let tries=0;tries<3;tries++){let last=path.at(-1),d=dist(last,harness),hit=this.ray(last,norm(sub(harness,last)),d-.045,b=>!b.mass);if(!hit)break;let b=hit.b,corners=boxVertices({...b,h:b.h.map(v=>v+.07)}),best=null;for(let v of corners){if(this.ray(last,norm(sub(v,last)),dist(v,last)-.035,o=>!o.mass))continue;let obstruction=this.ray(v,norm(sub(harness,v)),dist(v,harness)-.035,o=>!o.mass);let cost=dist(v,last)+dist(v,harness)+(obstruction?15:0);if(!best||cost<best.cost)best={v,cost}}if(!best)break;path.push(best.v);if(path.length>6)break}p.rope.path=path.slice(1);return [...path,harness];}
 ropeStep(p,i,dt){let r=p.rope;if(!r)return;r.length=clamp(r.length+(i.reel||0)*dt*1.05,1.3,18);let path=this.ropePath(p),used=0;for(let k=0;k<path.length-2;k++)used+=dist(path[k],path[k+1]);let fixed=path.at(-2),end=path.at(-1),allowed=Math.max(.30,r.length-used),d=dist(fixed,end),n=norm(sub(end,fixed)),error=d-allowed;r.tension=0;if(error>0){let v=dot(p.vel,n),imp=Math.max(0,error*320+v*32)*dt;imp=Math.min(imp,28);p.vel=sub(p.vel,mul(n,imp));this.moveCapsule(p,mul(n,-Math.min(error,.06)),false);r.tension=Math.min(3000,(error*320+v*32)*LAB_CONFIG.mass);}}
 move(p,i,dt){const C=LAB_CONFIG;p.yaw=Number.isFinite(i.yaw)?i.yaw:p.yaw;p.pitch=clamp(Number.isFinite(i.pitch)?i.pitch:p.pitch,-1.42,1.3);p.gripClock+=dt;p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);p.coyote=Math.max(0,p.coyote-dt);let prev=p.pos.slice(),velBefore=p.vel.slice(),g=this.ground(p),stepAssist=false;if(p.stepSupport){p.stepSupport.ttl-=dt;if(!g&&p.stepSupport.ttl>0){let foot=this.ray(add(add(p.pos,p.stepSupport.offset),[0,.06,0]),[0,-1,0],.115,b=>b.id===p.stepSupport.id);if(foot&&foot.n[1]>.63){g=foot;stepAssist=true}}if(p.stepSupport.ttl<=0||(g&&!stepAssist))p.stepSupport=null;}p.grounded=!!g&&p.vel[1]<.3;if(p.grounded&&p.vel[1]<0)p.vel[1]=0;if(g){p.groundId=g.b.id;p.coyote=C.coyote}let desiredH=i.crouch?1.10:C.height;if(desiredH<p.height||this.clear(p.pos,desiredH,p.radius,p.carry))p.height=desiredH;
 let wants=[!!i.left||p.handAssist,!!i.right||p.handAssist];if(p.carry)wants=[false,false];if(p.gripClock<0)wants=[false,false];
 let active=p.hands.filter(Boolean);if(!active.length)p.poseYaw=p.yaw;for(let k=0;k<2;k++){if(!wants[k])p.hands[k]=null;else if(!p.hands[k]&&p.stamina>1)this.attach(p,k?1:-1);if(p.hands[k])p.hands[k].age+=dt}
 if(p.mantle){let m=p.mantle;m.t+=dt;let t=clamp(m.t/m.duration,0,1),target=t<.55?mix(m.from,m.rise,smooth(t/.55)):mix(m.rise,m.to,smooth((t-.55)/.45));if(!this.clear(target,p.height,p.radius,p.carry)){p.mantle=null;p.vel=[0,-.3,0]}else{this.moveCapsule(p,sub(target,p.pos),false);p.vel=[0,0,0];if(t>=1)p.mantle=null}p.state='MANTLE';return}
 active=p.hands.filter(Boolean);let d=[i.x||0,0,i.z||0];if(length(d)>1)d=norm(d);
 if(active.length){let avg=norm(active.reduce((s,h)=>add(s,h.normal),[0,0,0])),inward=mul(avg,-1),side=norm(cross([0,1,0],avg));p.poseYaw=Math.atan2(-inward[0],-inward[2]);let movement=add(mul(side,i.side||0),[0,i.forward||0,0]);if(length(movement)>1)movement=norm(movement);let target=mul(movement,active.length===2?.88:.42);p.vel=mix(p.vel,target,1-Math.exp(-18*dt));
 // Resting only recovers while supported by feet; unsupported hands continue to fatigue.
 p.stamina=clamp(p.stamina+(p.grounded&&length(movement)<.1?12:-(active.length===2?4.5:10.5))*dt,0,100);
 if(active.length===2&&length(movement)>.12&&p.gripClock>.32){let k=p.gripSide;p.gripSide=1-k;p.gripClock=0;let old=p.hands[k];let candidate=this.candidate(p,k?1:-1,norm(add(inward,mul(movement,.60))));if(candidate&&dist(candidate.p,this.handWorld(old))>.06)p.hands[k]={body:candidate.b.id,local:boxLocal(candidate.b,candidate.p),point:candidate.p,normal:candidate.n,age:0};}
 this.moveCapsule(p,mul(p.vel,dt),false);
 for(let k=0;k<2;k++){let h=p.hands[k];if(!h)continue;let at=this.handWorld(h),shoulder=this.shoulder(p,k?1:-1),len=dist(at,shoulder);if(len>C.reach){let correction=mul(norm(sub(at,shoulder)),Math.min(.07,len-C.reach));this.moveCapsule(p,correction,false);p.vel=mul(p.vel,.82)}if(dist(at,this.shoulder(p,k?1:-1))>C.reach+.06)p.hands[k]=null}
 if(p.stamina<=0){p.hands=[null,null];p.handAssist=false;p.vel=[0,-1,0];p.gripClock=-.6}p.state=p.hands.filter(Boolean).length===1?'ONE HAND':'CLIMB';
 }else{
 let carrying=this.props.find(b=>b.id===p.carry),load=carrying?Math.sqrt(1+carrying.mass/C.mass):1,speed=(i.crouch?1.15:i.slow?C.walk:i.sprint&&p.stamina>0?C.sprint:C.jog)/load,desired=mul(d,speed),cur=[p.vel[0],0,p.vel[2]],diff=sub(desired,cur),acc=p.grounded?(length(d)>.1?C.acceleration:C.braking):2.2;
 if(i.brace&&p.grounded)acc=C.braking*1.8;let dv=mul(norm(diff),Math.min(length(diff),acc*dt));p.vel=add(p.vel,dv);if(i.brace&&p.grounded){p.vel[0]*=.9;p.vel[2]*=.9}if(p.jumpBuffer>0&&(p.grounded||p.coyote>0)){p.vel[1]=C.jump/load;p.stepSupport=null;stepAssist=false;p.jumpBuffer=0;p.coyote=0;p.grounded=false;p.jumps++}
 p.vel[1]-=C.gravity*dt;if(stepAssist&&p.vel[1]<0)p.vel[1]=0;p.grounded=false;this.moveCapsule(p,mul(p.vel,dt));if(stepAssist){p.grounded=true;p.coyote=C.coyote}p.state=p.grounded?(i.crouch?'CROUCH':length(cur)>.15?'MOVE':'STAND'):'AIR';p.stamina=clamp(p.stamina+(i.sprint&&length(d)>.1?-10:15)*dt,0,100);
 }
 if(p.carry)this.carryStep(p,i,dt);if(p.rope)this.ropeStep(p,i,dt);p.distance+=Math.hypot(p.pos[0]-prev[0],p.pos[2]-prev[2]);if(p.grounded&&velBefore[1]<-2.5)p.landImpact=-velBefore[1];p.landImpact=Math.max(0,p.landImpact-dt*6);
 if(p.pos[1]<-14||Math.abs(p.pos[0])>70||p.pos[2]<-60||p.pos[2]>60)this.recover(p);
 if(dist(p.pos,this.world.goal)<2&&p.grounded)p.checkpoint=add(this.world.goal,[0,.03,0]);
 }
 physicsProps(dt){for(let b of this.props){if(b.sleeping&&!this.playersHasCarry(b.id))continue;b.v[1]-=LAB_CONFIG.gravity*dt;b.v=mul(b.v,Math.exp(-.13*dt));b.w=mul(b.w,Math.exp(-1.5*dt));if(length(b.v)>18)b.v=mul(norm(b.v),18);if(length(b.w)>9)b.w=mul(norm(b.w),9);b.p=add(b.p,mul(b.v,dt));let dq=Qmul([...b.w,0],b.q);b.q=Qnorm(b.q.map((v,i)=>v+dq[i]*dt*.5));if(b.p[1]<-13){b.p=b.spawn.p.slice();b.q=b.spawn.q.slice();b.v=[0,0,0];b.w=[0,0,0]}}
 for(let k=0;k<5;k++){for(let a of this.props){if(a.sleeping)continue;for(let b of (this.querySolids?this.querySolids(sub(a.p,[length(a.h)+.04,length(a.h)+.04,length(a.h)+.04]),add(a.p,[length(a.h)+.04,length(a.h)+.04,length(a.h)+.04])).filter(b=>!b.mass):this.world.boxes)){if(dist(a.p,b.p)>length(a.h)+length(b.h)+.04)continue;resolveBoxes(a,b)}}for(let i=0;i<this.props.length;i++)for(let j=i+1;j<this.props.length;j++){let a=this.props[i],b=this.props[j];if(a.sleeping&&b.sleeping)continue;if(dist(a.p,b.p)<length(a.h)+length(b.h)+.02)resolveBoxes(a,b)}}
 for(let b of this.props){if(!this.playersHasCarry(b.id)&&length(b.v)<.015&&length(b.w)<.015){b.sleepTime=(b.sleepTime||0)+dt;if(b.sleepTime>.7){b.sleeping=true;b.v=[0,0,0];b.w=[0,0,0]}}else b.sleepTime=0;}
 let c=this.props.find(b=>b.id==='case');this.cargoDelivered=!!c&&dist(c.p,add(this.world.goal,[0,.3,0]))<2.1&&!this.playersHasCarry('case');
 }
 playerContacts(players){for(let iter=0;iter<3;iter++)for(let i=0;i<players.length;i++)for(let j=i+1;j<players.length;j++){
 let a=players[i],b=players[j],alo=a.pos[1]+a.radius,ahi=a.pos[1]+a.height-a.radius,blo=b.pos[1]+b.radius,bhi=b.pos[1]+b.height-b.radius;
 let ay=clamp((blo+bhi)*.5,alo,ahi),by=clamp(ay,blo,bhi);ay=clamp(by,alo,ahi);let delta=[b.pos[0]-a.pos[0],by-ay,b.pos[2]-a.pos[2]],d=length(delta),target=a.radius+b.radius+LAB_CONFIG.skin*2;if(d>=target)continue;
 let n=d>1e-6?mul(delta,1/d):[1,0,0],amount=Math.min(.06,(target-d)*.51);this.moveCapsule(a,mul(n,-amount),false);this.moveCapsule(b,mul(n,amount),false);
 let closing=dot(sub(b.vel,a.vel),n);if(closing<0){a.vel=add(a.vel,mul(n,closing*.5));b.vel=sub(b.vel,mul(n,closing*.5))}
 if(n[1]>.63){b.grounded=true;b.coyote=LAB_CONFIG.coyote}else if(n[1]<-.63){a.grounded=true;a.coyote=LAB_CONFIG.coyote}
 }}
 step(inputs=new Map){this.events=[];let allPlayers=[...this.players.values()],players=allPlayers;
 if(this.connection==='BODY'&&allPlayers.length>1){
  let main=allPlayers[0],front=allPlayers.find(p=>p.seat==='front')||main,base=inputs.get(front.id)||neutralLab(),merged={...base,actions:[],forward:0,side:0,left:false,right:false},wf=0,ws=0;
  for(let p of allPlayers){let i=inputs.get(p.id)||neutralLab(),f=p.seat==='back'?.7:p.seat==='front'?.4:.15,t=['left','right'].includes(p.seat)?.55:.15;merged.forward+=(i.forward||0)*f;merged.side+=(i.side||0)*t;wf+=f;ws+=t;
   if(p.seat==='left')merged.left=!!i.left;if(p.seat==='right')merged.right=!!i.right;
   for(let a of i.actions||[])if(a!=='jump'||p.seat==='back'||!allPlayers.some(p=>p.seat==='back'))merged.actions.push(a);
  }merged.forward/=wf;merged.side/=ws;merged.actions=[...new Set(merged.actions)];
  if(!allPlayers.some(p=>p.seat==='left'))merged.left=!!base.left;if(!allPlayers.some(p=>p.seat==='right'))merged.right=!!base.right;
  let f=this.forward({...main,yaw:base.yaw}),r=[Math.cos(base.yaw),0,-Math.sin(base.yaw)],d=add(mul(f,merged.forward),mul(r,merged.side));merged.x=d[0];merged.z=d[2];inputs=new Map([[main.id,merged]]);players=[main];
 }
 for(let p of players)this.actions(p,inputs.get(p.id)||neutralLab());for(let substep=0;substep<2;substep++){let dt=1/120;this.physicsProps(dt);for(let p of players)this.move(p,inputs.get(p.id)||neutralLab(),dt);this.playerContacts(players);
 if(this.connection==='CHAINED'){for(let k=1;k<players.length;k++){let a=players[k-1],b=players[k],d=dist(a.pos,b.pos);if(d>4.2){let n=norm(sub(b.pos,a.pos)),amount=Math.min(.07,(d-4.2)*.4);this.moveCapsule(a,mul(n,amount),false);this.moveCapsule(b,mul(n,-amount),false);a.vel=add(a.vel,mul(n,amount*4));b.vel=sub(b.vel,mul(n,amount*4))}}}
 }if(this.connection==='BODY'&&allPlayers.length>1){let main=allPlayers[0];for(let p of allPlayers.slice(1)){let keep={id:p.id,seat:p.seat,yaw:p.yaw,pitch:p.pitch};Object.assign(p,JSON.parse(JSON.stringify(main)),keep)}}this.tick++;this.time+=1/60;}
 snapshot(){return JSON.parse(JSON.stringify({tick:this.tick,time:this.time,mode:this.mode,connection:this.connection,players:[...this.players.values()],props:this.props,collected:this.collected,completed:this.completed,cargoDelivered:this.cargoDelivered,events:this.events}))}
 load(s){this.tick=s.tick;this.time=s.time;this.collected=s.collected.slice();this.completed=s.completed;this.cargoDelivered=s.cargoDelivered;this.events=s.events||[];this.props=JSON.parse(JSON.stringify(s.props));for(let p of s.players){if(this.players.has(p.id))Object.assign(this.players.get(p.id),JSON.parse(JSON.stringify(p)));else this.players.set(p.id,JSON.parse(JSON.stringify(p)))}for(let id of this.players.keys())if(!s.players.find(p=>p.id===id))this.players.delete(id)}
}
