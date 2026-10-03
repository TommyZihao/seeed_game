// Synthesized effects plus the user-provided rap track, embedded in the offline build.
export class GameAudio {
 constructor(){this.context=null;this.master=null;this.last=new Map();this.musicStep=0;this.nextBeat=0;this.nextDrop=0;this.track=null;this.trackPending=false;this.musicWanted=false;this.musicBlocked=false;this.playAttempt=0;}
 async unlock(){this.musicBlocked=false;if(this.musicWanted)this.music(true,true);try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;if(!this.track&&window.Audio){this.track=new window.Audio(window.SEEED_AUDIO_DATA||'assets/audio/glue-rap.m4a');this.track.loop=true;this.track.volume=.18;this.track.preload='auto';}if(this.track&&!this.musicWanted){this.track.muted=true;this.track.play().then(()=>{if(!this.musicWanted)this.track.pause();this.track.muted=false;}).catch(()=>{this.track.muted=false;});}if(!this.context){this.context=new Audio();this.master=this.context.createGain();this.master.gain.value=.38;this.master.connect(this.context.destination);}if(this.context.state==='suspended')await this.context.resume().catch(()=>{});}catch{}}
 tone(freq,offset,duration,type='sine',volume=.4,end=freq){const c=this.context,t=c.currentTime+offset,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(25,end),t+duration);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.008);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+duration+.015);o.onended=()=>{o.disconnect();g.disconnect();};}
 music(active,fromGesture=false){this.musicWanted=active;if(active&&!this.track&&window.Audio){this.track=new window.Audio(window.SEEED_AUDIO_DATA||'assets/audio/glue-rap.m4a');this.track.loop=true;this.track.volume=.18;this.track.preload='auto';}if(!this.track)return;if(!active){if(!this.track.paused)this.track.pause();return;}if(fromGesture||(this.track.paused&&!this.trackPending&&!this.musicBlocked)){const attempt=++this.playAttempt;this.track.muted=false;this.trackPending=true;this.track.play().then(()=>{if(attempt===this.playAttempt)this.musicBlocked=false;}).catch(()=>{if(attempt===this.playAttempt)this.musicBlocked=true;}).finally(()=>{if(attempt!==this.playAttempt)return;this.trackPending=false;if(!this.musicWanted)this.track.pause();});}}


 play(name,product=0){if(!this.context||this.context.state!=='running')return;const t=this.context.currentTime;if(name!=='drop'&&t-(this.last.get(name)??-10)<.065)return;this.last.set(name,t);const tone=(...args)=>this.tone(...args);switch(name){
 case 'revive':[523,659,784,1047].forEach((f,i)=>tone(f,i*.085,.3,'sine',.48));tone(262,0,.45,'triangle',.22);break;
 case 'select':tone(740,0,.09,'sine',.5,1050);break;
 case 'drop':{const at=Math.max(t,this.nextDrop);this.nextDrop=at+.045;tone(300+(product%9)*38,at-t,.08,'sine',.3,180+(product%9)*25);break;}
 case 'clear':{const base=440*2**((product%24)/12),patterns=[[0,4,7,12],[0,7,12,16],[12,7,4,12],[0,5,9,17],[0,3,7,15],[7,12,19,24]],pattern=patterns[product%6];pattern.forEach((n,i)=>tone(base*2**(n/12),i*(.045+(product%3)*.012),.18,['sine','triangle'][product%2],.38));break;}
 case 'full':[240,200,150].forEach((f,i)=>tone(f,i*.13,.2,'triangle',.5));break;
 case 'timeout':[880,660,880,440].forEach((f,i)=>tone(f,i*.16,.12,'triangle',.4));break;
 case 'toss':tone(140,0,.16,'triangle',.5,620);tone(520,.12,.2,'sine',.35,180);break;
 case 'remove':tone(680,0,.19,'sine',.5,260);break;
 case 'gather':[392,523,784].forEach((f,i)=>tone(f,i*.06,.14,'triangle',.35));break;
 case 'shuffle':[300,590,410,820,530].forEach((f,i)=>tone(f,i*.045,.08,'triangle',.32));break;
 }}
}
