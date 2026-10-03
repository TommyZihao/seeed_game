import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createPlayerStore} from '../player-store.mjs';
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'seeed-players-')),file=path.join(dir,'players.json');
try{
 const record=createPlayerStore(file);
 const results=await Promise.all(Array.from({length:20},(_,i)=>record('browser-'+i)));
 assert.equal(new Set(results.map(x=>x.playerNumber)).size,20);
 assert.equal((await record('browser-0')).playerNumber,1);
 await Promise.all(Array.from({length:8},()=>record('browser-0','same-click')));
 await record('browser-0','second-click');
 assert.equal((await createPlayerStore(file)('browser-0')).playerNumber,1);
 const state=JSON.parse(await fs.readFile(file));assert.equal(state.clicks,2);assert.equal(Object.values(state.players).filter(p=>p.clicks>0).length,1);assert.equal(Object.values(state.daily)[0],2);
 assert.equal((await fs.stat(file)).mode&0o777,0o600);
 console.log('Player registration, concurrent IDs, click deduplication and restart persistence passed');
}finally{await fs.rm(dir,{recursive:true,force:true});}
