import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
export function createPlayerStore(filename){
 let queue=Promise.resolve();
 return (browserId,eventId)=>{
  const task=queue.then(async()=>{
   let state;try{state=JSON.parse(await fs.readFile(filename,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;state={players:{},events:{},clicks:0,daily:{}};}
   const id=createHash('sha256').update(browserId).digest('hex');
   const now=new Date(),day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
   const player=state.players[id]||(state.players[id]={number:Object.keys(state.players).length+1,registeredAt:now.toISOString(),clicks:0});
   if(eventId&&!state.events[eventId]){state.events[eventId]={player:id,at:now.toISOString()};state.clicks++;player.clicks++;state.daily[day]=(state.daily[day]||0)+1;}
   await fs.mkdir(path.dirname(filename),{recursive:true,mode:0o700});
   await fs.writeFile(filename+'.tmp',JSON.stringify(state),{mode:0o600});await fs.rename(filename+'.tmp',filename);
   return {playerNumber:player.number};
  });queue=task.catch(()=>{});return task;
 };
}
