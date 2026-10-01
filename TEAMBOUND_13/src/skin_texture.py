from pathlib import Path
import numpy as np
from PIL import Image
P=Path(__file__).parent.parent/'assets';P.mkdir(exist_ok=True)
N=1024;y,x=np.mgrid[0:N,0:N];u=(x+.5)/N;v=(y+.5)/N
# Original digital albedo painting: pores and facial colour zones, NOT photo scan.
rng=np.random.default_rng(2012)
a=u*2*np.pi;yy=1.512+v*.282;xx=np.sin(a)*.097;front=np.maximum(0,-np.cos(a))**10
G=lambda x,s:np.exp(-(x/s)**2)
base=np.zeros((N,N,3))+[187,144,115]
noise=rng.normal(0,1.65,(N,N,1));base+=noise
blush=G(np.abs(xx)-.064,.03)*G(yy-1.623,.029)*front
base+=blush[...,None]*np.array([10,-1,1])
nose=G(xx,.022)*G(yy-1.635,.026)*front;base+=nose[...,None]*[8,-1,1]
lips=G(xx,.025)*G(yy-1.593,.0045)*front;base+=lips[...,None]*[-10,-29,-16]
under=G(np.abs(xx)-.040,.025)*G(yy-1.662,.010)*front;base+=under[...,None]*[-7,-9,-8]
stubble=(G(yy-1.573,.035)*G(xx,.07)+G(np.abs(xx)-.076,.017)*G(yy-1.601,.029))*front
base-=stubble[...,None]*np.array([11,7,4])
pores=rng.random((N,N));base-=(pores<.08)[...,None]*rng.uniform(1,7,(N,N,1))
base+=2*np.sin(u*135+np.sin(v*57))[...,None]
Image.fromarray(np.uint8(np.clip(base,0,255))).save(P/'skin_albedo.jpg',quality=93)
