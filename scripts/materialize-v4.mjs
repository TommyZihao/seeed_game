import {NodeIO} from '@gltf-transform/core';import {simplify,weld,normals,prune} from '@gltf-transform/functions';import {MeshoptSimplifier} from 'meshoptimizer';import * as T from 'three';
await MeshoptSimplifier.ready;const io=new NodeIO();
for(const name of ['milk-bottle','prime-q1','prime-t1']){
 const file=`assets/models/${name}.glb`,d=await io.read(file),buffer=d.getRoot().listBuffers()[0];
 if(name==='milk-bottle')await d.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.34,error:.001,lockBorder:false}),prune());
 for(const n of d.getRoot().listNodes()){
  const mesh=n.getMesh();if(!mesh)continue;const link=d.getRoot().listNodes().find(p=>p.listChildren().includes(n))?.getName();
  for(const p of mesh.listPrimitives()){
   const pos=p.getAttribute('POSITION');if(!pos)continue;
   if(name!=='milk-bottle'&&!(name==='prime-q1'&&link==='head_link')&&!(name==='prime-t1'&&link==='BASELINK'))continue;
   const colors=new Float32Array(pos.getCount()*3),v=[0,0,0];
   for(let i=0;i<pos.getCount();i++){pos.getElement(i,v);const [x,y,z]=v;let color;
    if(name==='milk-bottle'){
     color='#24242a';
     if(z>.5){if(y<-.12&&Math.hypot(x,z-.713)<.154)color='#e92338';}
     else if(Math.abs(x)>.30&&z>-.47)color=z<-.27?'#303039':'#e92742';
     else if(z<-.2&&z>-.79)color=z<-.63?'#b7b9be':'#e5273e';
     if(z>.46&&z<.55)color='#b7b9bd';
     if(Math.abs(x)>.29&&z>-.29&&z<-.21)color='#b6bbc1';
    }else if(name==='prime-q1')color=x>.037&&z>-.039&&z<.063&&Math.abs(y)<.044?'#353b40':'#e9e6df';
    else color=x>.25?'#26272c':'#ed8eaf';
    new T.Color(color).toArray(colors,i*3);
   }
   const acc=d.createAccessor().setType('VEC3').setArray(colors).setBuffer(buffer);p.setAttribute('COLOR_0',acc);
   const mat=d.createMaterial().setBaseColorFactor([1,1,1,1]).setMetallicFactor(.2).setRoughnessFactor(.38);p.setMaterial(mat);
  }
 }
 await d.transform(prune({keepLeaves:true}));await io.write(file,d);console.log('colored',name);
}
