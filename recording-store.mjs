import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
export function recordingFilename(date=new Date()){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date);
 const p=Object.fromEntries(parts.map(({type,value})=>[type,value]));
 return `${p.year}-${p.month}-${p.day}_${p.hour}-${p.minute}-${p.second}_${randomUUID()}.wav`;
}
export async function saveRecording(directory,audio,date=new Date()){
 await fs.mkdir(directory,{recursive:true,mode:0o700});
 const filename=recordingFilename(date);
 await fs.writeFile(path.join(directory,filename),audio,{flag:'wx',mode:0o600});
 return filename;
}
