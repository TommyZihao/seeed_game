// Pure detector: gravity removal, two-sample confirmation and cooldown.
export class ShakeDetector {
 constructor(){this.gravity=null;this.lastTrigger=-Infinity;this.previousPeak=-Infinity;}
 sample(event,now){
  const direct=event.acceleration;let a=direct&&[direct.x,direct.y,direct.z].every(Number.isFinite)?[direct.x,direct.y,direct.z]:null;
  if(!a){const g=event.accelerationIncludingGravity;if(!g||![g.x,g.y,g.z].every(Number.isFinite))return 0;const raw=[g.x,g.y,g.z];if(!this.gravity){this.gravity=raw;return 0;}a=raw.map((v,i)=>{this.gravity[i]=this.gravity[i]*.9+v*.1;return v-this.gravity[i];});}
  const magnitude=Math.hypot(...a),rotation=event.rotationRate||{},spin=Math.hypot(rotation.alpha||0,rotation.beta||0,rotation.gamma||0);
  if(now-this.lastTrigger<1100)return 0;
  if(magnitude>8.5||(magnitude>5.5&&spin>130)){const confirmed=now-this.previousPeak<200;this.previousPeak=now;if(confirmed){this.lastTrigger=now;this.previousPeak=-Infinity;return Math.min(1.5,Math.max(.7,magnitude/13));}}
  return 0;
 }
}
export async function enableMotion(onShake,onStatus){
 if(!window.isSecureContext){onStatus('手机体感需要 HTTPS 页面');return false;}
 if(!('DeviceMotionEvent' in window)){onStatus('此设备不支持体感');return false;}
 try{if(typeof DeviceMotionEvent.requestPermission==='function'){const result=await DeviceMotionEvent.requestPermission();if(result!=='granted'){onStatus('未开启运动权限');return false;}}const detector=new ShakeDetector();window.addEventListener('devicemotion',event=>{const strength=detector.sample(event,performance.now());if(strength)onShake(strength);},{passive:true});onStatus('体感已开启：轻颠手机即可颠锅');return true;}catch{onStatus('无法开启运动权限');return false;}
}
export function clampZoom(value){return Math.max(.55,Math.min(2.8,value));}
export function pinchRatio(points){if(points.length<2)return 0;return Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y);}
