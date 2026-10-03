import {NodeIO} from '@gltf-transform/core';
import {normals,prune} from '@gltf-transform/functions';
import {MeshoptSimplifier} from 'meshoptimizer';
await MeshoptSimplifier.ready;const io=new NodeIO();const d=await io.read('assets/models/mini-pi-plus.glb');let total=0;
for(const m of d.getRoot().listMeshes())for(const p of m.listPrimitives()){
const pos=p.getAttribute('POSITION').getArray();const src=p.getIndices()?.getArray() || Uint32Array.from({length:pos.length/3},(_,i)=>i);let ix=new Uint32Array(src);
if(ix.length>300) [ix]=MeshoptSimplifier.simplifySloppy(ix,pos,3,null,Math.max(90,Math.floor(ix.length*.07/3)*3),.05);
const old=[...new Set(ix)];const map=new Map(old.map((v,i)=>[v,i]));
for(const semantic of p.listSemantics()){if(semantic==='NORMAL'){p.setAttribute(semantic,null);continue;}const a=p.getAttribute(semantic);const src=a.getArray(),n=a.getElementSize(),arr=new src.constructor(old.length*n);old.forEach((v,i)=>{for(let j=0;j<n;j++)arr[i*n+j]=src[v*n+j]});p.setAttribute(semantic,a.clone().setArray(arr));}
p.setIndices(d.createAccessor().setType('SCALAR').setArray(new Uint32Array([...ix].map(v=>map.get(v)))));total+=ix.length/3;
}
await d.transform(normals(),prune());await io.write('assets/models/mini-pi-plus.glb',d);console.log({triangles:total});
