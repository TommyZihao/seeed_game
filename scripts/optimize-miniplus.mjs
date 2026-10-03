import {NodeIO} from '@gltf-transform/core';
import {dedup,weld,simplify,normals} from '@gltf-transform/functions';
import {MeshoptSimplifier} from 'meshoptimizer';
await MeshoptSimplifier.ready;const io=new NodeIO(),p='assets/models/mini-pi-plus.glb',d=await io.read(p);
for(const mesh of d.getRoot().listMeshes())for(const primitive of mesh.listPrimitives())primitive.setAttribute('NORMAL',null);
await d.transform(dedup(),weld(),simplify({simplifier:MeshoptSimplifier,ratio:.025,error:.006}),normals());await io.write(p,d);
console.log('Mini Pi joint hierarchy retained:',d.getRoot().listNodes().length,'nodes');
