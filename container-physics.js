import * as CANNON from 'cannon-es';
// All bounds describe the inside surface, shared by contact walls and visual containment.
export function containerBounds(shape='basket',depth=1.8){
 const round=['dish','octagon','hexagon','enamel','galvanized','rattan','stew'].includes(shape),sides=shape==='hexagon'?6:shape==='octagon'?8:24;
 const basin=['enamel','galvanized'].includes(shape),rawBottom=basin?-.78:-.71,top=basin?1.65:shape==='stew'?.78:1.35,bottom=top+(rawBottom-top)*depth;
 const sx=shape==='hexagon'?1.14:1,sz=1.18;
 const ring=r=>Array.from({length:sides},(_,i)=>{const a=i/sides*Math.PI*2;return [Math.sin(a)*r*sx,Math.cos(a)*r*sz];});
 const low=round?ring(basin?3.3:shape==='stew'?3.45:3.45):[[-3.62,-4.4],[3.62,-4.4],[3.62,4.4],[-3.62,4.4]];
 const high=round?ring(basin?4.35:4.45):[[-4.28,-5.05],[4.28,-5.05],[4.28,5.05],[-4.28,5.05]];
 if(shape==='widecrate')for(const ring of [low,high])for(const p of ring){p[0]*=1.04;p[1]*=1.02;}
 const planes=high.map((p,i)=>{const next=high[(i+1)%high.length],dx=next[0]-p[0],dz=next[1]-p[1],len=Math.hypot(dx,dz);let nx=dz/len,nz=-dx/len;if(nx*p[0]+nz*p[1]<0){nx=-nx;nz=-nz;}const hi=nx*p[0]+nz*p[1],lo=nx*low[i][0]+nz*low[i][1],slope=(hi-lo)/(top-bottom);return {nx,nz,hi,slope,offset:lo-slope*bottom};});
 return {planes,round,bottom,top,ground:top+((basin?-.72:-.63)-top)*depth,depth,restY:top*(1-depth)};
}
export function createContainerWalls(world,bounds){return bounds.planes.map(p=>{const normal=new CANNON.Vec3(-p.nx,p.slope,-p.nz);normal.normalize();const wall=new CANNON.Body({mass:0,shape:new CANNON.Plane()});wall.position.set(p.nx*p.offset,0,p.nz*p.offset);wall.quaternion.setFromVectors(new CANNON.Vec3(0,0,1),normal);world.addBody(wall);return wall;});}
export function containBody(body,half,bounds){
 const axes=[new CANNON.Vec3(1,0,0),new CANNON.Vec3(0,1,0),new CANNON.Vec3(0,0,1)].map(v=>body.quaternion.vmult(v));
 const support=(nx,ny,nz)=>Math.abs(nx*axes[0].x+ny*axes[0].y+nz*axes[0].z)*half.x+Math.abs(nx*axes[1].x+ny*axes[1].y+nz*axes[1].z)*half.y+Math.abs(nx*axes[2].x+ny*axes[2].y+nz*axes[2].z)*half.z;
 const floor=bounds.ground+support(0,1,0)+.035;if(body.position.y<floor){body.position.y=floor;if(body.velocity.y<0)body.velocity.y=0;}
 for(let pass=0;pass<4;pass++)for(const p of bounds.planes){const excess=Math.max(p.nx*body.position.x+p.nz*body.position.z-p.slope*body.position.y+support(p.nx,-p.slope,p.nz)-p.offset+.12,p.nx*body.position.x+p.nz*body.position.z+support(p.nx,0,p.nz)-p.hi+.12);if(excess>0){body.position.x-=p.nx*excess;body.position.z-=p.nz*excess;const outward=body.velocity.x*p.nx+body.velocity.z*p.nz;if(outward>0){body.velocity.x-=outward*p.nx;body.velocity.z-=outward*p.nz;}body.aabbNeedsUpdate=true;}}
}
export function randomDrop(bounds,half,random=Math.random,items=[]){
 const margin=Math.min(1.5,Math.hypot(half.x,half.z));
 const footprints=items.map(it=>{const h=it.mesh.userData.half,q=it.body.quaternion,axes=[new CANNON.Vec3(1,0,0),new CANNON.Vec3(0,1,0),new CANNON.Vec3(0,0,1)].map(v=>q.vmult(v));const extent=k=>Math.abs(axes[0][k])*h.x+Math.abs(axes[1][k])*h.y+Math.abs(axes[2][k])*h.z;return {x:it.body.position.x,z:it.body.position.z,hx:extent('x'),hz:extent('z'),top:it.body.position.y+extent('y')};});
 const candidates=Array.from({length:24},()=>{const angle=random()*Math.PI*2,r=Math.sqrt(random());const p=bounds.round?{x:Math.cos(angle)*r*(3.9-margin),z:Math.sin(angle)*r*(4.6-margin)}:{x:(random()*2-1)*(4.05-margin),z:(random()*2-1)*(4.85-margin)};let surface=bounds.ground,overlaps=0;for(const f of footprints){if(Math.abs(p.x-f.x)<margin+f.hx&&Math.abs(p.z-f.z)<margin+f.hz){surface=Math.max(surface,f.top);overlaps++;}}return {...p,surface,score:surface+overlaps*.18};});
 const lowest=Math.min(...candidates.map(p=>p.score)),open=candidates.filter(p=>p.score<lowest+.5);return open[Math.min(open.length-1,Math.floor(random()*open.length))];
}
