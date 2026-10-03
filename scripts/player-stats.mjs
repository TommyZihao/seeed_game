import fs from 'node:fs/promises';
const file=process.argv[2]||'/var/lib/seeed-game/analytics/players.json';
let state;try{state=JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;state={players:{},clicks:0,daily:{}};}
console.log(JSON.stringify({注册浏览器:Object.keys(state.players).length,点击进入的浏览器:Object.values(state.players).filter(p=>p.clicks>0).length,进入游戏点击次数:state.clicks,每日点击次数:state.daily},null,2));
