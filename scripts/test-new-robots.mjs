import fs from 'node:fs';import assert from 'node:assert/strict';import * as T from 'three';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';import {animatedDuck,animateProduct} from '../product-visuals.js';
for(const [key,joint,period]of [['originbot','left_wheel_link',2*Math.PI/3.4],['mini-pi-plus','l_hip_pitch_link',2*Math.PI/5.5],['prime-q1','left_hip_pitch_link',2*Math.PI/5.2],['prime-t1','BASELINK',10],['tonypi','l_hip_pitch',2*Math.PI/5.1]]){
 const data=fs.readFileSync(`assets/models/${key}.glb`),g=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');const a=animatedDuck(g,2.4),b=a.clone();animateProduct(a,key,0);animateProduct(b,key,0);const node=a.getObjectByName(joint),rest=node.quaternion.clone(),other=b.getObjectByName(joint).quaternion.clone();animateProduct(a,key,key==='prime-t1'?5:.2);assert.ok(node.quaternion.angleTo(rest)>.03,key+' must move');assert.equal(b.getObjectByName(joint).quaternion.angleTo(other),0,key+' clones independent');animateProduct(a,key,period);assert.ok(node.quaternion.angleTo(rest)<1e-6,key+' loop no drift');if(key==='prime-t1'){const base=node.position.clone();animateProduct(a,key,5);assert.ok(node.position.z>base.z,'T1 rises while transforming');}
 console.log('PASS:',key,'real-joint motion, loop, independent clones');
}

// Observe actual distal joint displacement, so mirrored coordinate systems cannot hide a same-side gait.
for(const [key,hand,foot]of [['mini-pi-plus','l_wrist_link','l_ankle_roll_link'],['tonypi','l_gripper','l_ankle_roll']]){
 const d=fs.readFileSync(`assets/models/${key}.glb`),g=await new GLTFLoader().parseAsync(d.buffer.slice(d.byteOffset,d.byteOffset+d.byteLength),'');const obj=animatedDuck(g,2.4);animateProduct(obj,key,0);obj.updateMatrixWorld(true);
 const h=obj.getObjectByName(hand),f=obj.getObjectByName(foot),h0=h.getWorldPosition(new T.Vector3()),f0=f.getWorldPosition(new T.Vector3());
 animateProduct(obj,key,.2);obj.updateMatrixWorld(true);const dh=h.getWorldPosition(new T.Vector3()).sub(h0),df=f.getWorldPosition(new T.Vector3()).sub(f0);dh.y=0;df.y=0;
 assert.ok(dh.length()>.001&&df.length()>.001,key+' arms and legs must both move');assert.ok(dh.dot(df)<0,key+' same-side arm and foot must swing in opposite directions');console.log('PASS:',key,'opposite arm/leg world-space swing');
}
