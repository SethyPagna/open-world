/* Compact presentation snapshots. Never accept client positions or world edits. */
function wireSnapshot10(sim){let s=sim.snapshot();const pick=(o,keys)=>{let n={};for(let k of keys)if(o[k]!==undefined)n[k]=o[k];return n;};
 const pk=['id','entityId','slot','seat','pos','vel','height','radius','yaw','pitch','poseYaw','grounded','groundId','stamina','oxygen','downTime','state','hands','handAssist','carry','carryLocal','rope','falls','distance','landImpact','motionEpoch','active','agreement','spellCD','pulseUntil','shieldUntil'];
 s.players=s.players.map(p=>pick(p,pk));if(s.shared)s.shared=pick(s.shared,pk);
 s.props=s.props.map(p=>pick(p,['id','p','q','h','mat','mass','v','w','label','sleeping']));return s;}
function stringifyWire10(m){return JSON.stringify(m,(k,v)=>typeof v==='number'?(Number.isFinite(v)?Math.round(v*100000)/100000:0):v);}
