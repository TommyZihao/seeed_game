import assert from 'node:assert/strict';
import {campaignLevels,zoneThemes} from '../game-levels.js';
import {sceneThemes,createThemedScenes} from '../game-scenes.js';
import * as T from 'three';
assert.deepEqual(campaignLevels.map(l=>l.keys.length*l.copies),[12,30,54,84]);
assert.deepEqual(campaignLevels[0].keys,['dgx-spark','pi5','lekiwi','milk-bottle']);
assert.deepEqual(campaignLevels[0].scales,{pi5:2,'milk-bottle':1.2});
const all=campaignLevels.flatMap(l=>l.keys);assert.equal(new Set(all).size,all.length);
for(const l of campaignLevels)assert.equal(l.copies%3,0);
assert.equal(new Set([...campaignLevels.map(l=>l.theme),...Object.values(zoneThemes)]).size,8);
const ctx=new Proxy({}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
globalThis.document={createElement:()=>({getContext:()=>ctx})};
const root=new T.Group(),scenes=createThemedScenes(root);assert.equal(scenes.size,8);
for(const [key,s]of scenes){assert.equal(s.theme,sceneThemes[key]);assert.ok(s.group.children.length);const bounds=new T.Box3().setFromObject(s.group);assert.ok(bounds.max.y-bounds.min.y>2,"deep container: "+key);s.group.traverse(n=>{if(n.isMesh){n.geometry.computeBoundingBox();assert.ok(Number.isFinite(n.geometry.boundingBox.max.x));}});}
console.log('PASS: counts, triples, unique products/themes, first-level scales and all container geometries');
