function fingerContactLocal12(side,curl){let id=18+side*15+3,fd=skel12[id].finger,pm=identity();for(let j=0;j<3;j++){let tr=j?[0,-fd.lens[j-1],0]:fd.base,angle=.1+curl*(j===0?.92:1.22);pm=mm(pm,transform(tr,[angle,0,0]));}return mpoint(pm,[0,-fd.lens[2],0]);}
/* Contact-led visual pose. The server is still the sole physical authority.
 * Foot stance anchors are stored in the support object's local coordinates.
 * Render motion never mutates networked positions, hands, props or stamina.
 */
function contactPose(root,p,sim,dt,phase,firstPerson=false){
 let speed=Math.hypot(p.vel[0],p.vel[2]),climbing=p.hands.some(Boolean),m=root.motion12,r=root.rig;dt=clamp(dt,0,.06);
 let supported=p.grounded||(!climbing&&p.vel[1]<=.15&&p.vel[1]>-.6&&!!sim.ground(p));
 root.p=p.pos.slice();root.r=[0,p.poseYaw,0];let teleported=m.oldPos&&dist(m.oldPos,p.pos)>1.2;if(teleported){m.feet=[null,null];m.swing=null}m.oldPos=p.pos.slice();
 let targetCrouch=p.height<1.4?.54:0;m.crouch=lerp(m.crouch,targetCrouch,1-Math.exp(-18*dt));
 if(supported&&!m.lastGrounded)m.landing=Math.min(.06,Math.max(.025,Math.abs(m.lastVy||0)*.008));m.lastGrounded=supported;m.lastVy=p.vel[1];m.landing*=Math.exp(-10*dt);m.bodyDrop=.027+Math.min(1,speed/4)*.10+m.landing;let hip=.91-m.crouch-m.bodyDrop,shoulder=1.46-m.crouch-m.bodyDrop;
 r.body.r=[0,0,0];headFace(root,p,climbing);let right=[Math.cos(p.poseYaw),0,-Math.sin(p.poseYaw)],forward=sim.forward({...p,yaw:p.poseYaw}),veldir=speed>.05?norm([p.vel[0],0,p.vel[2]]):forward,solids=sim.solids();
 function sample(point){let h=sim.ray(add(point,[0,.5,0]),[0,-1,0],1.10,b=>b.id!==p.carry);if(!h||h.n[1]<.55)return null;return{body:h.b.id,local:boxLocal(h.b,h.p),p:h.p.slice(),n:h.n.slice()}}
 function point(foot){let b=solids.find(b=>b.id===foot.body);if(b){foot.p=boxWorld(b,foot.local);foot.n=Qrot(b.q,foot.normalLocal||Qrot(Qconj(b.q),foot.n))}return foot.p}
 function prepare(foot){if(foot){let b=solids.find(b=>b.id===foot.body);foot.normalLocal=b?Qrot(Qconj(b.q),foot.n):foot.n.slice()}return foot}
 let desired=[-1,1].map(s=>add(add(p.pos,mul(right,s*.13)),mul(forward,-.035-m.crouch*.07)));
 if(supported&&!climbing&&p.state!=='SWIM'){
  for(let k=0;k<2;k++)if(!m.feet[k])m.feet[k]=prepare(sample(desired[k]));
  if(m.swing){let sw=m.swing;let other=m.feet[1-sw.k],behind=other?dot(sub(p.pos,point(other)),veldir):0;
   // During acceleration a flight target may be replanned; a planted contact never slides.
   if(sw.t<.65&&speed>.12){let adjusted=prepare(sample(add(desired[sw.k],mul(veldir,speed*(sw.duration*(1-sw.t)+.065)))));if(adjusted)sw.end=adjusted;}
   let urgency=speed>.12?clamp((behind-.25)/.22,0,1):0;sw.t+=Math.max(dt/sw.duration,urgency*dt*12);let end=sw.end,tt=clamp(sw.t,0,1),f=tt*tt*tt*(10+tt*(-15+6*tt));let e=point(end);sw.at=add(mix(sw.from,e,f),[0,Math.sin(Math.PI*tt)*sw.lift,0]);if(tt>=1){m.feet[sw.k]=end;m.next=1-sw.k;m.swing=null}}
  if(!m.swing){let candidates=[m.next,1-m.next],chosen=-1,maxgap=0;for(let k of candidates){let ft=m.feet[k];if(!ft)continue;let gap=speed>.12?dot(sub(desired[k],point(ft)),veldir):dist(point(ft),desired[k]);if(gap>(speed>.12?.065:.19)&&gap>maxgap){maxgap=gap;chosen=k}}if(chosen>=0){let duration=clamp(.28-speed*.017,.17,.26),lead=speed*(duration+.065),destination=add(desired[chosen],mul(veldir,lead)),end=prepare(sample(destination));if(end){m.swing={k:chosen,from:point(m.feet[chosen]).slice(),end,t:0,duration,lift:.095+Math.max(0,end.p[1]-m.feet[chosen].p[1])*.38,at:point(m.feet[chosen]).slice()}}}
 }
 }else{m.feet=[null,null];m.swing=null}
 for(let k=0;k<2;k++){let limb=r.legs[k],s=limb.side,A=[s*.125,hip,0],T,N=[0,1,0],stance=false,roll=0;
  if(climbing){let g=sim.ground(p);if(g){T=[s*.13,.078,0];N=worldToAvatar({...p,pos:[0,0,0]},g.n)}else{let goal=add(add(p.pos,mul(right,s*.18)),[0,.30+(k?.08:0),0]),f=sim.forward({...p,yaw:p.poseYaw}),hit=sim.ray(goal,f,.62,b=>b.id!==p.carry);T=hit?worldToAvatar(p,add(hit.p,mul(hit.n,.085))):[s*.18,.26,-.17];} }
  else if(!supported){T=[s*.13,.24,.10];}
  else{let ft=m.feet[k],wp;if(m.swing?.k===k){wp=m.swing.at;N=m.swing.end.n}else if(ft){wp=point(ft);N=ft.n;stance=true}else{wp=desired[k]}if(stance&&speed>.12){let behind=dot(sub(p.pos,wp),veldir);roll=clamp((behind-.20)/.32,0,1)*.75;}
   let toe=add(wp,mul(forward,.17)),ankle=roll>0?add(toe,add(mul(forward,-(.17*Math.cos(roll)-.078*Math.sin(roll))),[0,.078*Math.cos(roll)+.17*Math.sin(roll),0])):add(wp,[0,.078,0]);T=worldToAvatar(p,ankle);N=Qrot(Qconj(Qyaw(p.poseYaw)),N)}
  // Solver does not pretend unreachable targets were achieved: residuals remain observable.
  let [J,E]=ik(A,T,.43,.402,[0,0,-1]);limb.thigh.local=linkMatrix(A,J);limb.shin.local=linkMatrix(J,E);limb.ankle=E;
  let z=[0,0,1];if(!supported||climbing)N=[0,1,0];limb.footBasis=mm(frame12(E,N,z),transform([0,0,0],[-roll,0,0]));m.soleError[k]=stance?dist(E,T):null;
 }
 m.handError=[null,null];
 for(let k=0;k<2;k++){let limb=r.arms[k],s=limb.side,A=[s*.255,shoulder,-m.crouch*.18],target=null,tip=[0,-1,0],normal=[0,0,1],curl=.17;
  if(p.hands[k]){target=worldToAvatar(p,sim.handWorld(p.hands[k]));normal=Qrot(Qconj(Qyaw(p.poseYaw)),p.hands[k].normal);tip=norm(sub([0,1,0],mul(normal,normal[1])));if(length(tip)<.1)tip=[0,0,-1];curl=.93;}
  else if(p.carry){let b=sim.props.find(b=>b.id===p.carry);if(b){let handle=boxWorld(b,p.carryLocal);target=worldToAvatar(p,add(handle,mul(right,s*.105)));tip=[0,-.8,-.6];curl=.73}}
  else if(firstPerson){let eye=add(p.pos,[0,p.height<1.4?1.01:LAB_CONFIG.eye,0]);target=worldToAvatar(p,add(add(add(eye,mul(sim.forward(p,true),.55)),mul(right,s*.22)),[0,-.26,0]));tip=norm([s*.11,-.38,-.90]);curl=.27;}
  if(!target){let stride=Math.sin(phase*8)*Math.min(1,speed/3.2),reach=[s*.268,.72-m.crouch,-stride*s*.16];target=reach;tip=norm([0,-1,-stride*s*.15]);normal=[0,0,1];}
  tip=norm(tip);m.gripCurl[k]=lerp(m.gripCurl[k],curl,1-Math.exp(-18*dt));let basis=frame12([0,0,0],mul(tip,-1),normal),contact=fingerContactLocal12(k,m.gripCurl[k]),offset=p.hands[k]?mpoint(basis,contact):mul(tip,.10),wrist=sub(target,offset),reach=dist(A,wrist);if(p.hands[k]&&reach>.605)A=add(A,mul(norm(sub(wrist,A)),Math.min(.045,reach-.605)));let [J,E]=ik(A,wrist,.32,.30,[s*.38,-.20,-1]);limb.upper.local=linkMatrix(A,J);limb.lower.local=linkMatrix(J,E);limb.handBasis=frame12(E,mul(tip,-1),normal);if(p.hands[k])m.handError[k]=dist(add(E,offset),target);
 }
 m.state=p.state;updateSkin12(root,dt);
}
function modePose10(root,p,dt){
 let r=root.rig,m=root.motion12;
 if(p.state==='SWIM'){
  r.body.r=[-.38,0,Math.sin(root.phase*3)*.02];m.crouch=0;for(let a of r.arms){let s=a.side,A=[s*.255,1.46,0],t=root.phase*3,T=[s*(.32+.10*Math.sin(t)),1.13,-.38-.12*Math.cos(t)],[J,E]=ik(A,T,.32,.30,[s*.5,-.3,-1]);a.upper.local=linkMatrix(A,J);a.lower.local=linkMatrix(J,E);a.handBasis=null;}
  for(let l of r.legs){let s=l.side,A=[s*.125,.91,0],T=[s*.14,.16,.14+Math.sin(root.phase*6+s)*.12],[J,E]=ik(A,T,.43,.402,[0,0,-1]);l.thigh.local=linkMatrix(A,J);l.shin.local=linkMatrix(J,E);l.ankle=E;l.footBasis=transform(E,[.2,0,0]);}
 }
 if(p.state==='PADDLE'){for(let a of r.arms){let s=a.side,A=[s*.255,1.46,0],T=[s*.33,1.03,-.35+Math.sin(sim.time*3.7)*.10],[J,E]=ik(A,T,.32,.30,[s*.5,-1,-.2]);a.upper.local=linkMatrix(A,J);a.lower.local=linkMatrix(J,E);a.handBasis=null;}}
 if(typeof sim!=='undefined'&&sim.connection==='BODY'){let moving=Math.min(1,Math.hypot(p.vel[0],p.vel[2])/3.2),disagreement=1-(sim.shared?.agreement??1);r.body.r[2]=Math.sin(sim.time*3)*(.01+disagreement*.035)*moving;}
 updateSkin12(root,dt);
}
