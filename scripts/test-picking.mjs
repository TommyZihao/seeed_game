import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as THREE from 'three';
const source=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8');
const camera=new THREE.OrthographicCamera(-5,5,5,-5,.1,100);camera.position.set(0,18,0);camera.up.set(0,0,-1);camera.lookAt(0,0,0);camera.updateMatrixWorld();
const items=[];for(let i=0;i<100;i++){const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial());mesh.position.set(i<2?0:10+i,i===0?3:0,0);mesh.userData.half=new THREE.Vector3(.5,.5,.5);mesh.updateMatrixWorld();items.push({mesh});}
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let calls=0;const original=ray.intersectObject.bind(ray);ray.intersectObject=(...args)=>{calls++;return original(...args);};
const c={THREE,camera,items,ray,pointer,renderer:{domElement:{getBoundingClientRect:()=>({left:0,top:0,width:100,height:100})}}};vm.createContext(c);vm.runInContext(source.slice(source.indexOf('function getHit('),source.indexOf('let selectedItem')),c);
assert.equal(c.getHit({clientX:50,clientY:50}),items[0]);assert.equal(calls,1);
items[0].mesh.position.x=2;items[0].mesh.updateMatrixWorld();calls=0;assert.equal(c.getHit({clientX:50,clientY:50}),items[1]);assert.equal(calls,1);
assert.equal(c.getHit({clientX:0,clientY:0}),undefined);
assert.match(source,/if\(touchEffects\)return/);assert.match(fs.readFileSync(new URL('../style.css',import.meta.url),'utf8'),/\.catalog-open #hoverName\{display:none!important\}/);
console.log('PASS: nearest exact hit preserved; only one of 100 products needs detailed raycast; empty clicks and catalog stale label covered');
