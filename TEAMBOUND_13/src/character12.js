/* Articulated alpine expedition models. All meshes generated locally. */
const M={stone:material('#777975'),rock:material('#5b6268'),darkRock:material('#414951'),snow:material('#edf3f7',4),wood:material('#7f5737',2),woodLight:material('#a48660',2),metal:material('#a5b0b8',3,.28,{metal:.8}),black:material('#18232b',1),pants:material('#2b3238',1),rubber:material('#151b21',1),red:material('#814b39',1),blue:material('#375f7d',1),gold:material('#bd8c42',1),green:material('#557867',1),skin:material('#b08a6f',6,.7),leather:material('#423c35',1),strap:material('#202c32',1),white:material('#e9e3d6',1),rope:material('#c87846',1),glow:material('#95ebfc',7,.5,{emission:1.7,shadow:false}),flag:material('#af3e33',1),water:material('#286d7b',5,.18),underwater:material('#185870',5,.2),leaf:material('#344f49'),leaf2:material('#4f6860'),mountain:material('#71828c',8)};
const cube=(mat,p,s,r=V())=>new Node(G.box,mat,p,s,r),sph=(mat,p,s,low=false)=>new Node(low?G.sphereLow:G.sphere,mat,p,s);
function linkMatrix(a,b){let y=norm(sub(a,b)),x=norm(cross(y,Math.abs(y[2])>.9?[0,1,0]:[0,0,1])),z=cross(x,y);return new Float32Array([x[0],x[1],x[2],0,y[0],y[1],y[2],0,z[0],z[1],z[2],0,...a,1])}
function segment(mat,a,b,r=.025){let n=new Node(G.cylinder,mat,mul(add(a,b),.5),[r,dist(a,b),r]);let m=linkMatrix(mul(add(a,b),.5),add(mul(add(a,b),.5),norm(sub(b,a))));for(let i=0;i<3;i++){m[i]*=r;m[4+i]*=dist(a,b);m[8+i]*=r}n.local=m;return n}
function ik(a,t,l1,l2,pole){let dir=norm(sub(t,a)),d=clamp(dist(a,t),.03,l1+l2-.003),end=add(a,mul(dir,d)),along=(l1*l1-l2*l2+d*d)/(2*d),bend=norm(sub(pole,mul(dir,dot(pole,dir)))),joint=add(add(a,mul(dir,along)),mul(bend,Math.sqrt(Math.max(0,l1*l1-along*along))));return [joint,end]}
function handMesh(side=1){let n=new Node;n.add(sph(M.rubber,[0,-.035,0],[.055,.077,.033]));n.add(cube(M.leather,[0,-.034,-.03],[.09,.05,.015]));for(let j=0;j<4;j++){let x=(j-1.5)*.026,len=[.066,.085,.079,.058][j];n.add(sph(M.rubber,[x,-.094-len*.25,-.005],[.016,len*.62,.018],true));n.add(sph(M.rubber,[x,-.097-len*.73,-.025],[.015,.029,.017],true));}n.add(sph(M.rubber,[side*.061,-.035,-.011],[.023,.04,.021],true));n.add(sph(M.rubber,[side*.067,-.068,-.032],[.019,.03,.018],true));n.add(cube(M.black,[0,.015,0],[.13,.043,.082]));return flatten(n)}
const hands=[handMesh(-1),handMesh(1)];
function copyStatic(n){let q=new Node;for(let c of n.children)q.add(new Node(c.geo,c.mat,c.p.slice(),c.s.slice(),c.r.slice()));return q}
function headMesh(jacket,skin=M.skin){let h=new Node;h.add(sph(skin,[0,.015,0],[.128,.181,.117]));h.add(sph(skin,[0,-.055,-.028],[.103,.117,.104]));h.add(sph(skin,[0,.006,-.12],[.024,.035,.027]));h.add(sph(skin,[0,-.011,-.129],[.033,.018,.018]));for(let s of [-1,1]){h.add(sph(skin,[s*.123,.008,.008],[.023,.042,.025]));h.add(sph(M.black,[s*.048,.027,-.107],[.022,.007,.008]));h.add(sph(M.white,[s*.052,.03,-.116],[.005,.005,.003],true));h.add(cube(M.leather,[s*.048,.05,-.11],[.055,.009,.014],[0,0,-s*.06]));}h.add(cube(M.leather,[0,-.064,-.11],[.063,.008,.008]));h.add(sph(M.pants,[0,.115,.017],[.137,.116,.125]));h.add(cube(M.pants,[0,.101,-.119],[.25,.025,.09]));h.add(cube(M.black,[0,.098,0],[.27,.039,.239]));h.add(cube(M.metal,[0,.10,-.138],[.098,.047,.022]));h.add(cube(M.glow,[0,.102,-.153],[.055,.023,.009]));let g=flatten(h);g.p=[0,1.661,0];g.s=[.85,.85,.85];return g}

/* 12 / FIELD ANATOMY
 * Original authored parametric mesh; 48-joint linear-blend skinning.
 * Clothing is weight-skinned, with bounded joint-compression corrective folds.
 * It is NOT a cloth simulation, scan, or motion-capture asset.
 */
const B12={ROOT:0,PELVIS:1,SPINE:2,CHEST:3,NECK:4,HEAD:5,LU:6,LF:7,LH:8,RU:9,RF:10,RH:11,LT:12,LS:13,LFOOT:14,RT:15,RS:16,RFOOT:17};
const skinMaterials12={
 shell:material('#a65b40',10,.81),pants:material('#3f4548',11,.91),skin:material('#bd977e',12,.61),
 glove:material('#383634',13,.79),hair:material('#39332e',14,.89),eye:material('#e0d7c8',15,.24),
 metal:material('#969d9e',3,.26,{metal:.78}),sole:material('#272928',13,.9),pack:material('#575a4d',10,.88),
 webbing:material('#272d2a',11,.96),lip:material('#98695d',12,.62),glass:material('#665b48',3,.26,{metal:.15})};
function rigidInverse12(m){const t=[m[12],m[13],m[14]];return new Float32Array([m[0],m[4],m[8],0,m[1],m[5],m[9],0,m[2],m[6],m[10],0,-dot([m[0],m[1],m[2]],t),-dot([m[4],m[5],m[6]],t),-dot([m[8],m[9],m[10]],t),1])}
function frame12(p,y,z=[0,0,1]){y=norm(y);let x=norm(cross(y,z));if(length(x)<.01)x=[1,0,0];z=norm(cross(x,y));return new Float32Array([...x,0,...y,0,...z,0,...p,1])}
const skel12=(()=>{let a=Array.from({length:48},(_,i)=>({name:'joint_'+i,parent:0,bind:identity()}));function put(i,n,p,parent=0){a[i]={name:n,parent,bind:transform(p)}}
 put(0,'Root',[0,0,0],-1);put(1,'Pelvis',[0,.91,0]);put(2,'Spine',[0,1.09,0],1);put(3,'Chest',[0,1.34,0],2);put(4,'Neck',[0,1.51,0],3);put(5,'Head',[0,1.661,0],4);
 for(let k=0;k<2;k++){let s=k?1:-1,u=k?9:6,leg=k?15:12;put(u,(k?'R':'L')+'_UpperArm',[s*.255,1.46,0],3);put(u+1,(k?'R':'L')+'_Forearm',[s*.255,1.14,0],u);put(u+2,(k?'R':'L')+'_Hand',[s*.255,.84,0],u+1);put(leg,(k?'R':'L')+'_Thigh',[s*.125,.91,0],1);put(leg+1,(k?'R':'L')+'_Shin',[s*.125,.48,0],leg);put(leg+2,(k?'R':'L')+'_Foot',[s*.125,.078,0],leg+1);
 for(let f=0;f<5;f++){let id=18+k*15+f*3,base=f===4?[s*.049,-.036,-.005]:[(f-1.5)*.024,-.085,0];let lens=f===4?[.033,.028,.026]:[.035,.026,[.021,.028,.025,.017][f]];let yy=0;for(let j=0;j<3;j++){put(id+j,(k?'R':'L')+'_'+['Index','Middle','Ring','Little','Thumb'][f]+'_'+j,[s*.255+base[0],.84+base[1]-yy,base[2]],j?id+j-1:u+2);yy+=lens[j];a[id+j].finger={base,lens,f,j,side:s}}}}
 for(let b of a)b.inv=rigidInverse12(b.bind);return a})();
class Mesh12{
 constructor(mat){this.mat=mat;this.p=[];this.uv=[];this.i=[];this.j=[];this.w=[];this.fold=[]}
 vert(p,uv,ws,fold=[0,0,0,0]){this.p.push(...p);this.uv.push(...uv);let jj=[0,0,0,0],ww=[0,0,0,0],sum=0;ws=ws.filter(t=>t[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,4);for(let k=0;k<ws.length;k++){jj[k]=ws[k][0];ww[k]=ws[k][1];sum+=ww[k]}if(!sum){jj[0]=0;ww[0]=sum=1}this.j.push(...jj);this.w.push(...ww.map(x=>x/sum));this.fold.push(...fold)}
 surface(nu,nv,fn,weights,flip=false){nu=Math.max(6,Math.round(nu*anatomyResolution12));nv=Math.max(4,Math.round(nv*anatomyResolution12));let start=this.p.length/3;for(let v=0;v<=nv;v++)for(let u=0;u<=nu;u++){let a=u/nu,b=v/nv,q=fn(a,b);this.vert(q.p||q,[a,b],typeof weights==='function'?weights(a,b,q):[[weights,1]],q.fold||[0,0,0,0])}for(let v=0;v<nv;v++)for(let u=0;u<nu;u++){let a=start+v*(nu+1)+u,b=a+nu+1;if(!flip)this.i.push(a,a+1,b,a+1,b+1,b);else this.i.push(a,b,a+1,a+1,b,b+1)}}
 ellipsoid(p,r,bone,nu=24,nv=16){this.surface(nu,nv,(u,v)=>{let t=Math.PI*v,a=u*Math.PI*2;return [p[0]+r[0]*Math.sin(t)*Math.sin(a),p[1]-r[1]*Math.cos(t),p[2]+r[2]*Math.sin(t)*Math.cos(a)]},bone)}
 tube(points,radii,bone,seg=24){let n=points.length-1;this.surface(seg,n,(u,v)=>{let j=Math.round(v*n),P=points[j],D=norm(sub(points[Math.min(n,j+1)],points[Math.max(0,j-1)])),X=norm(cross(D,Math.abs(D[2])>.92?[0,1,0]:[0,0,1])),Z=norm(cross(X,D)),a=u*Math.PI*2,rr=radii[j];return add(P,add(mul(X,Math.sin(a)*(Array.isArray(rr)?rr[0]:rr)),mul(Z,Math.cos(a)*(Array.isArray(rr)?rr[1]:rr))))},bone,true)}
 append(g,m,bone){let base=this.p.length/3;for(let k=0;k<g.p.length/3;k++)this.vert(mpoint(m,Array.from(g.p.slice(k*3,k*3+3))),Array.from(g.uv.slice(k*2,k*2+2)),[[bone,1]]);this.i.push(...Array.from(g.i,x=>x+base))}
 finish(){let g=geometry(this.p,this.i,null,this.uv);g.joints=new Float32Array(this.j);g.weights=new Float32Array(this.w);g.fold=new Float32Array(this.fold);return g}
}
const gauss12=(x,s)=>Math.exp(-x*x/(s*s));
const garmentWeights12=(y,b0,b1,pivot,width=.085)=>{let t=smooth(clamp((pivot+width-y)/(2*width),0,1));return [[b0,1-t],[b1,t]]};
function profile12(y,pts){for(let i=1;i<pts.length;i++)if(y<=pts[i][0]){let a=pts[i-1],b=pts[i],prev=pts[Math.max(0,i-2)],next=pts[Math.min(pts.length-1,i+1)],h=b[0]-a[0],t=clamp((y-a[0])/h,0,1);return b.slice(1).map((_,j)=>{j++;let m0=(b[j]-prev[j])/(b[0]-prev[0]),m1=(next[j]-a[j])/(next[0]-a[0]);return (2*t*t*t-3*t*t+1)*a[j]+(t*t*t-2*t*t+t)*h*m0+(-2*t*t*t+3*t*t)*b[j]+(t*t*t-t*t)*h*m1})}return pts.at(-1).slice(1)}

let anatomyResolution12=1;
function makeAnatomy12(resolution=1){anatomyResolution12=resolution;let mb={};for(let key of Object.keys(skinMaterials12))mb[key]=new Mesh12(skinMaterials12[key]);let shell=mb.shell,pants=mb.pants,skin=mb.skin,hair=mb.hair;
 // Fitted shell: continuous panels and articulated sleeves, real model-space folds.
 shell.surface(64,42,(u,v)=>{let y=.915+v*.61,a=u*Math.PI*2,[rx,rz]=profile12(y,[[.915,.19,.135],[.965,.208,.145],[1.10,.21,.146],[1.28,.249,.156],[1.405,.252,.142],[1.465,.212,.123],[1.515,.086,.082],[1.525,.076,.074]]);let folds=.0024*Math.sin(y*89+Math.sin(a*3))*Math.sin(a*5)+.004*gauss12(y-.98,.055)*Math.sin(a*11);return [(rx+folds)*Math.sin(a),y,(rz+folds)*Math.cos(a)+.008]},(u,v)=>{let y=.915+v*.61;if(y<1.14)return garmentWeights12(-y,1,2,-1.035,.11);return garmentWeights12(-y,2,3,-1.26,.13)});
 // High collar around the neck. Inset zip and a folded weather flap.
 shell.surface(56,12,(u,v)=>{let a=u*6.283,y=1.475+v*.095,r=.082+.018*Math.sin(v*Math.PI);return [Math.sin(a)*r,y,Math.cos(a)*r*.91]},4);
 const addBox=(m,p,s,r,b)=>mb[m].append(G.box,transform(p,r||[0,0,0],s),b);
 addBox('webbing',[0,1.221,-.149],[.011,.474,.009],null,2);addBox('metal',[.002,1.40,-.155],[.018,.038,.012],null,3);
 // Central hips, trouser legs deform continuously across knees.
 pants.surface(48,20,(u,v)=>{let y=.805+v*.167,a=u*6.283,r=.204+Math.sin(v*Math.PI)*.007;return [Math.sin(a)*r,y,Math.cos(a)*.143]},1);
 for(let k=0;k<2;k++){let s=k?1:-1,uBone=k?9:6,lBone=k?15:12;
 shell.surface(40,44,(u,v)=>{let y=1.507-v*.672,a=u*Math.PI*2,[rx,rz]=profile12(-y,[[-1.507,.008,.008],[-1.485,.052,.050],[-1.46,.080,.073],[-1.415,.088,.080],[-1.31,.083,.076],[-1.18,.077,.07],[-1.14,.075,.071],[-1.06,.079,.069],[-.94,.069,.058],[-.835,.050,.044]]);let fold=.0009*Math.sin(v*82+Math.sin(a*2))*Math.pow(Math.sin(v*Math.PI),2)+.0018*gauss12(y-1.14,.08)*Math.cos(v*135+a*.5);return {p:[s*(.255-.024*smooth(clamp((y-1.39)/.11,0,1)))+(rx+fold)*Math.sin(a),y,(rz+fold)*Math.cos(a)],fold:[k+1,gauss12(y-1.14,.105),-Math.cos(a),0]}},(u,v)=>{let y=1.507-v*.672,c=.70*smooth(clamp((y-1.38)/.11,0,1));return [...garmentWeights12(y,uBone,uBone+1,1.14,.075).map(([j,w])=>[j,w*(1-c)]),[3,c]]},true);
 mb.webbing.tube([[s*.255,.865,0],[s*.255,.839,0]],[[.054,.048],[.052,.047]],uBone+1,32);
 pants.surface(44,52,(u,v)=>{let y=.925-v*.833,a=u*6.283,[rx,rz]=profile12(-y,[[-.925,.108,.127],[-.84,.114,.115],[-.69,.109,.09],[-.53,.080,.073],[-.48,.077,.078],[-.37,.083,.076],[-.22,.065,.061],[-.092,.053,.053]]),fold=.0010*Math.sin(y*118+a*2.2)*Math.sin(v*Math.PI)+.002*gauss12(y-.48,.085)*Math.sin(y*161+a);return {p:[s*.125+(rx+fold)*Math.sin(a),y,(rz+fold)*Math.cos(a)],fold:[k+3,gauss12(y-.48,.12),Math.cos(a),0]}},(u,v)=>garmentWeights12(.925-v*.833,lBone,lBone+1,.48,.075),true);
 // Kneepad as a thin, subdivided shell, not a floating sphere.
 mb.glove.surface(20,16,(u,v)=>{let a=(u-.5)*1.8,y=.445+v*.085;return [s*.125+Math.sin(a)*.078,y,-Math.cos(a)*.086]},(u,v)=>garmentWeights12(.445+v*.085,lBone,lBone+1,.48,.09),true);
 // Boots: shaped upper, outsole and toe reinforcement.
 mb.glove.ellipsoid([s*.125,.106,-.05],[.077,.090,.146],lBone+2,36,20);
 mb.sole.ellipsoid([s*.125,.024,-.054],[.081,.022,.158],lBone+2,36,12);
 mb.glove.surface(28,12,(u,v)=>{let a=(u-.5)*2.1,y=.047+v*.042;return [s*.125+Math.sin(a)*.073,y,-.191+v*.007+(1-Math.cos(a))*.055]},lBone+2,true);
 for(let r=0;r<5;r++){let z=-.02-r*.020;addBox('webbing',[s*.125,.172-r*.006,z],[.096,.005,.006],[0,0,(r%2?1:-1)*.07],lBone+2)}
 for(let r=0;r<6;r++){let z=.050-r*.043;addBox('sole',[s*.125,.010,z],[.140,.015,.023],[0,0,0],lBone+2)}
 // Hand: a skinned palm and 15 independent finger joints, with a reinforced dorsal panel.
 let hp=[s*.255,.84,0];mb.glove.ellipsoid(add(hp,[0,-.044,0]),[.054,.057,.026],uBone+2,36,24);
 mb.webbing.ellipsoid(add(hp,[0,-.037,.022]),[.044,.042,.006],uBone+2,26,18);
 for(let f=0;f<5;f++){let id=18+k*15+f*3,b=skel12[id],lens=b.finger.lens,total=lens.reduce((x,y)=>x+y),start=[b.bind[12],b.bind[13],b.bind[14]],r=f===4?.017:[.012,.0125,.012,.010][f];
 mb.glove.surface(16,24,(u,v)=>{let a=u*Math.PI*2,rad=r*(.92-.2*v)*Math.min(1,Math.sin(Math.min(1,(1-v)*8)*Math.PI/2)+.02);return [start[0]+Math.sin(a)*rad,start[1]-v*total,start[2]+Math.cos(a)*rad*.85]},(u,v)=>{let t=v*total;if(t<lens[0])return garmentWeights12(-t,id,id+1,-lens[0],.009);return garmentWeights12(-t,id+1,id+2,-(lens[0]+lens[1]),.009)},true);
 }
 // Shoulder stitching, cargo pockets and harness are weighted to the relevant segment.
 addBox('shell',[s*.172,1.135,-.149],[.090,.113,.019],[0,0,-s*.10],2);
 addBox('webbing',[s*.172,1.188,-.163],[.080,.006,.009],[0,0,-s*.10],2);
 addBox('pack',[s*.205,.728,.017],[.04,.15,.125],[0,0,0],lBone);
 addBox('webbing',[s*.152,1.268,-.151],[.030,.325,.017],[0,0,s*.16],3);
 addBox('webbing',[s*.134,1.023,-.143],[.028,.180,.015],[0,0,-s*.15],1);
 addBox('metal',[s*.149,1.176,-.168],[.042,.042,.012],null,2);
 }
 // Anatomically shaped head; socket, brow, nose, philtrum, mouth and chin are sculpted into one mesh.
 skin.surface(112,80,(u,v)=>{let y=1.512+v*.282,a=u*6.283,[rx,rz,cz]=profile12(y,[[1.512,.046,.055,-.013],[1.54,.064,.074,-.018],[1.58,.078,.087,-.006],[1.63,.097,.092,.005],[1.69,.099,.095,.005],[1.745,.094,.090,.006],[1.785,.045,.05,.006],[1.794,.001,.001,.006]]),x=Math.sin(a)*rx,z=Math.cos(a)*rz+cz,F=Math.pow(Math.max(0,-Math.cos(a)),8);
 let eye=gauss12(Math.abs(x)-.040,.026)*gauss12(y-1.674,.013),brow=gauss12(Math.abs(x)-.042,.03)*gauss12(y-1.693,.007),cheek=gauss12(Math.abs(x)-.062,.025)*gauss12(y-1.635,.026),nose=.022*gauss12(x,.012)*gauss12(y-1.657,.031)+.036*gauss12(x,.017)*gauss12(y-1.633,.011)+.009*gauss12(Math.abs(x)-.017,.009)*gauss12(y-1.626,.008),mouth=.010*gauss12(x,.028)*gauss12(y-1.593,.004)-.004*gauss12(x,.032)*gauss12(y-1.596,.0016)+.005*gauss12(x,.025)*gauss12(y-1.586,.005),chin=.009*gauss12(x,.040)*gauss12(y-1.557,.016);z-=F*(nose+mouth+chin+.010*cheek+.008*brow-.009*eye);return [x,y,z]},5);
 // Ear pinnae with an inset bowl and visible helix.
 for(let s of [-1,1]){skin.surface(56,20,(u,v)=>{let a=u*6.283,r=.35+.65*v;return [s*(.096+.011*Math.sin(v*Math.PI)),1.644+Math.cos(a)*.035*r,.011+Math.sin(a)*.021*r]},5,s<0);
 skin.tube(Array.from({length:41},(_,j)=>{let a=j/40*6.283;return[s*.105,1.644+Math.cos(a)*.033,.011+Math.sin(a)*.020]}),Array(41).fill(.0033),5,10);
 // Eye openings, iris/pupil inset; eyelids physically cover the eyeballs.
 mb.eye.ellipsoid([s*.04,1.674,-.086],[.0168,.0052,.0082],5,36,16);
 mb.hair.ellipsoid([s*.04,1.674,-.0937],[.0045,.0044,.0012],5,28,12);
 mb.glass.ellipsoid([s*.04,1.674,-.0947],[.0021,.0021,.0005],5,18,10);
 skin.tube(Array.from({length:25},(_,j)=>{let a=j/24*Math.PI;return[s*.04+Math.cos(a)*.017,1.674+Math.sin(a)*.0052,-.088-Math.sin(a)*.004]}),Array(25).fill(.0017),5,8);
 skin.tube(Array.from({length:25},(_,j)=>{let a=j/24*Math.PI;return[s*.04+Math.cos(a)*.017,1.674-Math.sin(a)*.0038,-.088-Math.sin(a)*.003]}),Array(25).fill(.0015),5,8);
 // Discrete short brow strokes, restrained lashes.
 for(let j=0;j<16;j++){let x=s*(.023+j*.0024),yy=1.694-Math.pow((j-7)/8,2)*.003;mb.hair.tube([[x,yy,-.097],[x+s*.0015,yy+.003,-.0975]],[.0007,.00025],5,5)}
 mb.hair.ellipsoid([s*.009,1.622,-.116],[.004,.0015,.0015],5,16,8);
 }
 // Close-cropped scalp, with a hairline (no toy hat hiding the face).
 hair.surface(96,36,(u,v)=>{let a=u*6.283,front=Math.max(0,-Math.cos(a)),base=1.662+.056*front,t=v*Math.PI*.5,y=base+(1.795-base)*Math.sin(t),r=Math.cos(t),rr=profile12(y,[[1.66,.100,.100],[1.72,.101,.095],[1.76,.084,.081],[1.795,.002,.002]]);return [Math.sin(a)*rr[0],y,Math.cos(a)*rr[1]+.007]},5);
 skin.ellipsoid([0,1.503,.0],[.066,.078,.064],4,36,22);
 // Expedition equipment, with rounded sewn volumes and straps.
 mb.pack.ellipsoid([0,1.222,.231],[.207,.286,.113],3,44,34);mb.pack.ellipsoid([0,1.452,.23],[.208,.085,.107],3,36,20);
 mb.pack.ellipsoid([0,1.185,.319],[.148,.196,.036],3,32,24);
 for(let s of [-1,1]){addBox('webbing',[s*.11,1.245,.337],[.022,.43,.013],null,3);addBox('metal',[s*.11,1.405,.32],[.034,.036,.014],null,3);mb.pack.ellipsoid([s*.2,1.193,.204],[.053,.125,.064],3,26,18)}
 addBox('webbing',[0,1.353,-.151],[.301,.020,.019],null,3);addBox('metal',[.045,1.352,-.164],[.042,.03,.012],null,3);
 mb.webbing.append(torusGeo(.195,.013,48,8),transform([0,.961,0],[0,0,0],[1,1,.78]),1);
 mb.metal.append(torusGeo(.036,.006,28,8),transform([.232,.97,-.054],[Math.PI/2,.2,0],[.7,1,1.3]),1);
 let out=[];for(let key of Object.keys(mb))if(mb[key].p.length){let g=mb[key].finish();out.push({key,geo:g,mat:mb[key].mat,headOnly:['skin','hair','eye','lip','glass'].includes(key)})}return out;
}
const anatomy12=makeAnatomy12(),anatomyLow12=makeAnatomy12(.5);anatomyResolution12=1;
function selectCharacterLOD12(root,distance,quality=1){let low=quality===0||distance>13;for(let k=0;k<root.skinMeshes.length;k++)root.skinMeshes[k].geo=(low?anatomyLow12:anatomy12)[k].geo;root.lod=low?1:0;}
function character(jacket=M.red,skin=M.skin){let root=new Node,body=new Node,head=new Node(null,null,[0,1.661,0]),arms=[],legs=[];root.add(body);let palette=new Float32Array(48*16),poses=skel12.map(b=>b.bind.slice()),skinState={palette,bends:[0,0,0,0],poses};for(let k=0;k<48;k++)palette.set(identity(),k*16);
 for(let k=0;k<2;k++){let side=k?1:-1,upper=new Node,lower=new Node,hand=new Node,thigh=new Node,shin=new Node;arms.push({side,upper,lower,hand});legs.push({side,thigh,shin});}
 let meshes=[];for(let a of anatomy12){let mat=a.mat;if(a.key==='shell'){mat={...mat,id:++matID,color:jacket.color.map((v,i)=>v*1.23+.013)}}let n=new Node(a.geo,mat);n.skin=skinState;n._headOnly=a.headOnly;body.add(n);meshes.push(n)}
 root.rig={body,head,arms,legs};root.skinState=skinState;root.skinMeshes=meshes;root.motion12={feet:[null,null],swing:null,next:0,oldPos:null,crouch:0,landing:0,lastGrounded:true,gripCurl:[0,0],soleError:[0,0],handError:[null,null]};poseCharacter(root,0,0,false);return root;
}
// Proxies retain the interface used by the game. They drive ONE deformable mesh, not visible limb primitives.
function poseCharacter(root,t,speed,climbing,lean=0,jumping=false){let {body,head,arms,legs}=root.rig,stride=Math.sin(t*8),a=Math.min(1,speed/4.8);body.r=[0,0,lean];head.r=[climbing?-.10:0,0,0];for(let limb of arms){let s=limb.side,A=[s*.255,1.46,0],T=climbing?[s*.24,1.80,-.30]:[s*.265,.87,-stride*s*.17*a-(jumping?.17:0)],[J,E]=ik(A,T,.32,.30,[s*.45,0,-1]);limb.upper.local=linkMatrix(A,J);limb.lower.local=linkMatrix(J,E);limb.hand.local=linkMatrix(E,add(E,norm(sub(E,J))));}for(let limb of legs){let s=limb.side,A=[s*.125,.91,0],T=[s*.13,.078+(jumping?.18:0),stride*s*.20*a],[J,E]=ik(A,T,.43,.402,[0,0,-1]);limb.thigh.local=linkMatrix(A,J);limb.shin.local=linkMatrix(J,E);limb.ankle=E;}updateSkin12(root,0)}
function updateSkin12(root,dt){if(!root.skinState)return;let r=root.rig,ms=root.motion12,pose=root.skinState.poses,crouch=(ms.crouch||0)+(ms.bodyDrop||0);pose[0]=identity();pose[1]=transform([0,.91-crouch,0]);pose[2]=transform([0,1.09-crouch,-crouch*.14],[crouch*.13,0,0]);pose[3]=transform([0,1.34-crouch,-crouch*.18],[crouch*.19,0,0]);pose[4]=transform([0,1.51-crouch,-crouch*.18]);pose[5]=transform([0,1.661-crouch,-crouch*.18],r.head.r||[0,0,0]);
 for(let k=0;k<2;k++){let a=r.arms[k],l=r.legs[k],u=k?9:6,leg=k?15:12;pose[u]=a.upper.local||skel12[u].bind;pose[u+1]=a.lower.local||skel12[u+1].bind;let E=mpoint(pose[u+1],[0,-.30,0]);pose[u+2]=a.handBasis||frame12(E,[pose[u+1][4],pose[u+1][5],pose[u+1][6]],[pose[u+1][8],pose[u+1][9],pose[u+1][10]]);
 pose[leg]=l.thigh.local||skel12[leg].bind;pose[leg+1]=l.shin.local||skel12[leg+1].bind;let ankle=l.ankle||mpoint(pose[leg+1],[0,-.402,0]);pose[leg+2]=l.footBasis||transform(ankle);
 let armAngle=Math.acos(clamp(dot([pose[u][4],pose[u][5],pose[u][6]],[pose[u+1][4],pose[u+1][5],pose[u+1][6]]),-1,1)),legAngle=Math.acos(clamp(dot([pose[leg][4],pose[leg][5],pose[leg][6]],[pose[leg+1][4],pose[leg+1][5],pose[leg+1][6]]),-1,1));root.skinState.bends[k]=armAngle/Math.PI;root.skinState.bends[k+2]=legAngle/Math.PI;
 let curl=ms.gripCurl[k]??.18;for(let f=0;f<5;f++){let id=18+k*15+f*3,fd=skel12[id].finger,base=fd.base,pm=pose[u+2];for(let j=0;j<3;j++){let tr=j?[0,-fd.lens[j-1],0]:base,ang=(f===4?.40:.1)+(curl*(j===0?.92:1.22));let rot=[ang,0,f===4?-fd.side*.47:0];pose[id+j]=mm(pm,transform(tr,rot));pm=pose[id+j]}}
 }
 for(let k=0;k<48;k++)root.skinState.palette.set(mm(pose[k],skel12[k].inv),k*16);for(let m of root.skinMeshes)m.visible=!m._headOnly||r.head.visible;
}
function firstPersonRig(){return new Node}
function poseFPS(){}
