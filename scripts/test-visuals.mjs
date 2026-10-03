import fs from 'node:fs';
import assert from 'node:assert/strict';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {animatedDuck,animateDuck} from '../product-visuals.js';
const data=fs.readFileSync('assets/models/microduck.glb');const gltf=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
const a=animatedDuck(gltf,1.65),b=a.clone();animateDuck(a,0);animateDuck(b,0);const q=b.getObjectByName('left_hip_pitch').quaternion.clone();animateDuck(a,.2);assert.notDeepEqual(a.getObjectByName('left_hip_pitch').quaternion.toArray(),q.toArray());assert.deepEqual(b.getObjectByName('left_hip_pitch').quaternion.toArray(),q.toArray());assert.ok(a.userData.half.y>0);
const src=fs.readFileSync('game.js','utf8');assert.ok(src.includes('total=types.length*(level===1?3:6)'));assert.ok(src.includes('level===1?[0,1,4,3]'));assert.ok(src.includes('sourceColors?[]:g.groups'));console.log('PASS: independent animated hip joints, dimensions, easy first-level deck, preserved vertex colors');
