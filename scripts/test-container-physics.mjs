import assert from 'node:assert/strict';import * as C from 'cannon-es';import {containerBounds,createContainerWalls,containBody,randomDrop} from '../container-physics.js';
let seed=7;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
for(const shape of ['basket','enamel','galvanized','hexagon','widecrate','stew']){
 const bounds=containerBounds(shape),world=new C.World({gravity:new C.Vec3(0,-12,0)}),walls=createContainerWalls(world,bounds);assert.equal(walls.length,bounds.planes.length);
 for(let i=0;i<100;i++){const half={x:.5+random()*.9,y:.2+random()*.7,z:.4+random()*.7},body=new C.Body({mass:1,shape:new C.Box(new C.Vec3(half.x,half.y,half.z))});body.position.set((random()-.5)*12,-2+random()*5,(random()-.5)*14);body.quaternion.setFromEuler(random()*6,random()*6,random()*6);containBody(body,half,bounds);
 for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1]){const v=body.quaternion.vmult(new C.Vec3(x*half.x,y*half.y,z*half.z));v.vadd(body.position,v);assert.ok(v.y>=bounds.ground-.001);for(const p of bounds.planes){assert.ok(p.nx*v.x+p.nz*v.z-p.slope*v.y<=p.offset+.002,shape+' sloped wall');assert.ok(p.nx*v.x+p.nz*v.z<=p.hi+.002,shape+' rim');}}
 }
 const drops=Array.from({length:20},()=>randomDrop(bounds,{x:.5,y:.5,z:.5},random));assert.equal(new Set(drops.map(p=>p.x)).size,20);assert.equal(new Set(drops.map(p=>p.z)).size,20);
 // Actual wall normal faces into the container.
 for(const w of walls){const normal=w.quaternion.vmult(new C.Vec3(0,0,1));assert.ok(normal.dot(w.position)<0);}
}
assert.ok(Math.max(...containerBounds('hexagon').planes.map(p=>p.hi))>4.3);
console.log('PASS: random drops, tilted product corners inside six container types, floor clearance and inward collision normals');
const bounds=containerBounds('basket'),pile=Array.from({length:9},(_,i)=>({body:{position:new C.Vec3((i%3-1)*1.2,3,-2-Math.floor(i/3)*.5),quaternion:new C.Quaternion()},mesh:{userData:{half:{x:.7,y:.7,z:.7}}}}));
const drops=Array.from({length:80},()=>randomDrop(bounds,{x:.5,y:.5,z:.5},random,pile));assert.ok(drops.reduce((sum,p)=>sum+p.z,0)/drops.length>.5,'prefer available front space over tall rear pile');assert.ok(drops.every(p=>p.surface<0),'spawn height follows local free surface');console.log('PASS: random placement favors empty front area over an existing tall rear pile');
