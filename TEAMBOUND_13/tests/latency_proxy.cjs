// Test-only ordered TCP delay: 60–90 ms each direction, no dropped or reordered TCP bytes.
const net=require('net');let seed=421;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
function forward(src,dst){let last=0,queue=[];src.on('data',buf=>{let at=Math.max(Date.now()+60+rng()*30,last+1);last=at;let h=setTimeout(()=>{if(!dst.destroyed)dst.write(buf)},at-Date.now());queue.push(h)});src.on('error',()=>{});src.on('close',()=>{queue.forEach(clearTimeout);dst.destroy()})}
net.createServer(a=>{let b=net.connect(8140,'127.0.0.1');a.setNoDelay(true);b.setNoDelay(true);forward(a,b);forward(b,a)}).listen(8141,'127.0.0.1',()=>console.log('Ordered 60–90 ms each way on 8141 -> 8140'));
