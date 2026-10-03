import * as T from 'three';
const gaitCache=new WeakMap();
export function prepareMaterials(root,key){let index=0;root.traverse(n=>{if(!n.isMesh)return;const mats=Array.isArray(n.material)?n.material:[n.material];for(const m of mats){if(key==='lekiwi'&&Math.max(m.color.r,m.color.g,m.color.b)>.13){m.color.set('#68c9f2');m.metalness=.2;m.roughness=.36;}if(key==='so101-black'&&m.color.g!==m.color.r)m.color.set('#ed5894');if(key==='so101-white'&&m.color.r>.5)m.color.set('#dfaa19');if(key==='xiao'){m.color.set(n.name==='SOLID'?'#17292c':n.name.includes('CUT')||n.name.includes('MIRROR')?'#1c2024':'#a8adb2');}if(key==='thor'){const c=m.color;if(c.b>c.r*1.4&&c.b>c.g*1.15)c.set('#343b40');else if(c.r>.12&&c.g>.07)c.set(c.r>.6?'#8b9090':'#343836');m.metalness=.7;m.roughness=.3;}if(key==='watcher'){m.color.set('#aeb8bc');m.roughness=.22;m.metalness=.28;}}
if(key==='lekiwi'&&n.geometry.attributes.color){const g=n.geometry,src=g.attributes.color,c=new Float32Array(src.count*3);for(let i=0;i<src.count;i++){const v=Math.max(src.getX(i),src.getY(i),src.getZ(i));new T.Color(v>.13?'#68c9f2':'#25272b').toArray(c,i*3);}g.setAttribute('color',new T.BufferAttribute(c,3));mats.forEach(m=>m.color.set('#ffffff'));}
if(key==='orin'&&n.geometry.attributes.color){const g=n.geometry,src=g.attributes.color,pos=g.attributes.position,colors=new Float32Array(pos.count*3);for(let i=0;i<pos.count;i++){const r=src.getX(i),b=src.getZ(i),green=src.getY(i),z=pos.getZ(i),x=pos.getX(i),y=pos.getY(i);let hex='#313738';if(z>.025&&x>-.64&&x<.56&&y>-.11&&y<.72)hex='#161a1b';else if(z<-.18&&r>.8&&green>.7&&b<.93)hex='#14181b';else if(green>r*1.2&&green>b*1.1)hex='#1a2023';else if(r>.55||b>.55)hex=(r>.6&&green<.3)?'#9da4aa':'#9ba2a6';else if(r>.25)hex='#3b4143';new T.Color(hex).toArray(colors,i*3)}g.setAttribute('color',new T.BufferAttribute(colors,3));mats.forEach(m=>m.color.set('#ffffff'));}
index++;});}
export function animatedDuck(gltf,size){const outer=new T.Group(),root=gltf.scene;outer.add(root);root.updateMatrixWorld(true);const box=new T.Box3().setFromObject(root),s=box.getSize(new T.Vector3());root.position.sub(box.getCenter(new T.Vector3()));const scale=size/Math.max(s.x,s.y,s.z);root.scale.multiplyScalar(scale);root.position.multiplyScalar(scale);outer.userData.half=s.multiplyScalar(scale*.5);outer.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;}});return outer;}
export function animateDuck(obj,time,phase=0){let joints=gaitCache.get(obj);if(!joints){joints={};for(const side of ['left','right'])for(const part of ['hip_pitch','knee','ankle']){const n=obj.getObjectByName(side+'_'+part);if(n)joints[side+'_'+part]={n,q:n.quaternion.clone()};}gaitCache.set(obj,joints);}const z=new T.Vector3(0,0,1);for(const side of ['left','right']){const p=time*7.6+phase+(side==='right'?Math.PI:0),swing=Math.sin(p),lift=Math.max(0,swing),mirror=side==='left'?1:-1;for(const [part,angle]of [['hip_pitch',.48*swing],['knee',-.68*lift],['ankle',-.28*swing+.42*lift]]){const joint=joints[side+'_'+part];if(joint)joint.n.quaternion.copy(joint.q).multiply(new T.Quaternion().setFromAxisAngle(z,angle*mirror));}}}
function canvasTexture(draw){const c=document.createElement('canvas');c.width=c.height=512;draw(c.getContext('2d'));const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;return map;}
export function decorateProduct(mesh,key){
if(key==='watcher'){
const map=canvasTexture(g=>{g.fillStyle='#030709';g.fillRect(0,0,512,512);const glow=g.createRadialGradient(240,205,15,256,256,320);glow.addColorStop(0,'#152b30');glow.addColorStop(1,'#020405');g.fillStyle=glow;g.fillRect(0,0,512,512);g.fillStyle='#65e2bb';for(const x of [177,335]){g.beginPath();g.ellipse(x,244,24,42,0,0,Math.PI*2);g.fill()}g.strokeStyle='#65e2bb';g.lineWidth=8;g.beginPath();g.arc(256,285,40,.15,Math.PI-.15);g.stroke();g.fillStyle='#6a8181';g.font='20px Arial';g.textAlign='center';g.fillText('SenseCAP',256,420);});const screen=new T.Mesh(new T.CircleGeometry(.485,64),new T.MeshPhysicalMaterial({map,roughness:.16,metalness:.15,clearcoat:1,emissive:0xffffff,emissiveMap:map,emissiveIntensity:.4}));screen.position.set(0,-.045,.195);mesh.add(screen);const lens=new T.Mesh(new T.CircleGeometry(.08,32),new T.MeshPhysicalMaterial({color:0x080d15,metalness:.65,roughness:.1,clearcoat:1}));lens.position.set(-.485,.536,.198);mesh.add(lens);const glint=new T.Mesh(new T.CircleGeometry(.022,20),new T.MeshBasicMaterial({color:0x426394}));glint.position.set(-.497,.553,.201);mesh.add(glint);mesh.material.roughness=.27;mesh.material.metalness=.3;
}
if(key==='xiao'){
const gold=new T.MeshStandardMaterial({color:0xc7a64d,metalness:.75,roughness:.3});for(const side of [-1,1])for(let i=0;i<7;i++){const pad=new T.Mesh(new T.BoxGeometry(.048,.005,.049),gold);pad.position.set(-.313+i*.082,-.033,side*.271);mesh.add(pad);}
const map=canvasTexture(g=>{g.fillStyle='#b4b9bf';g.fillRect(0,0,512,512);g.fillStyle='#454b4c';g.textAlign='center';g.font='bold 62px Arial';g.fillText('Seeed',256,146);g.font='bold 62px Arial';g.fillText('XIAO',256,240);g.font='30px Arial';g.fillText('ESP32-C3',256,304);g.font='38px Arial';g.fillText('CE  FCC',256,410)});const label=new T.Mesh(new T.PlaneGeometry(.30,.36),new T.MeshStandardMaterial({map,metalness:.65,roughness:.34}));label.rotation.x=-Math.PI/2;label.rotation.z=-Math.PI/2;label.position.set(-.074,.030,0);mesh.add(label);
}
if(key==='sts3215'){const map=canvasTexture(g=>{g.fillStyle='#ebebe3';g.fillRect(0,0,512,512);g.fillStyle='#171b1e';g.textAlign='center';g.font='bold 68px Arial';g.fillText('FEETECH',256,140);g.font='bold 58px Arial';g.fillText('STS3215',256,250);g.font='26px Arial';g.fillText('SERIAL BUS SERVO',256,335);g.fillText('7.4V · 30 kg·cm',256,395);});const label=new T.Mesh(new T.PlaneGeometry(.57,.33),new T.MeshStandardMaterial({map,roughness:.65}));label.position.set(0,-.03,.289);mesh.add(label);mesh.material.roughness=.32;}
if(key==='orin'){mesh.material.roughness=.38;mesh.material.metalness=.45;}
if(key==='thor'){mesh.material.roughness=.3;mesh.material.metalness=.62;}
return mesh;
}

let unoPhoto;
export async function loadProductTextures(){unoPhoto=await new T.TextureLoader().loadAsync(window.SEEED_TEXTURE_DATA?.['uno-q']||'assets/textures/uno-q.jpg');unoPhoto.colorSpace=T.SRGBColorSpace;unoPhoto.anisotropy=4;}
export function texturedUno(gltf,size){const source=gltf.scene;source.updateMatrixWorld(true);const root=new T.Group();let i=0;source.traverse(n=>{if(!n.isMesh)return;const g=n.geometry.index?n.geometry.toNonIndexed():n.geometry.clone();g.applyMatrix4(n.matrixWorld);const pos=g.attributes.position,normal=g.attributes.normal,uv=new Float32Array(pos.count*2);const box=new T.Box3().setFromBufferAttribute(pos),sz=box.getSize(new T.Vector3());for(let j=0;j<pos.count;j++){uv[j*2]=(84+(pos.getX(j)+.985)/1.985*838)/1000;uv[j*2+1]=1-(700-(pos.getY(j)+.772)/1.544*648)/750;}g.setAttribute('uv',new T.BufferAttribute(uv,2));g.clearGroups();for(let j=0;j<pos.count;j+=3){const top=(normal.getZ(j)+normal.getZ(j+1)+normal.getZ(j+2))/3>.6;g.addGroup(j,3,top?1:0);}const board=i===0,metal=!board&&sz.z>.07&&box.min.x<-.8;const side=new T.MeshStandardMaterial({color:board?0x074655:metal?0xb7bec0:0x25272c,roughness:metal?.3:.6,metalness:metal?.7:.08});const top=new T.MeshStandardMaterial({map:unoPhoto,roughness:.56,metalness:.08});const mesh=new T.Mesh(g,[side,top]);root.add(mesh);i++;});root.rotation.x=-Math.PI/2;return animatedDuck({scene:root},size);}

const reachyShaders=new WeakMap();
// Keep the head rigid; a smooth neck transition follows its lateral motion.
export function splitReachy(mesh){const root=new T.Group();root.userData.half=mesh.userData.half;const material=mesh.material.clone();material.onBeforeCompile=shader=>{shader.uniforms.headOffset={value:0};reachyShaders.set(material,shader);shader.vertexShader='uniform float headOffset;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.x += headOffset * smoothstep(-0.25, 0.12, position.y);');};material.customProgramCacheKey=()=> 'reachy-head-slide';mesh.material=material;mesh.name='reachyAnimated';root.add(mesh);return root;}
export function animateReachy(obj,time,phase=0){const mesh=obj.getObjectByName('reachyAnimated');if(!mesh)return;if(!mesh.userData.uniqueMotion){mesh.material=mesh.material.clone();mesh.material.userData={};mesh.material.onBeforeCompile=shader=>{shader.uniforms.headOffset={value:0};reachyShaders.set(mesh.material,shader);shader.vertexShader='uniform float headOffset;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.x += headOffset * smoothstep(-0.25, 0.12, position.y);');};mesh.material.customProgramCacheKey=()=> 'reachy-head-slide';mesh.userData.uniqueMotion=true;}const shader=reachyShaders.get(mesh.material);if(shader)shader.uniforms.headOffset.value=Math.sin(time*2.5+phase)*.16;}

const miniPiGaits=new WeakMap();
export function animateMiniPi(obj,time,phase=0){
 let joints=miniPiGaits.get(obj);
 if(!joints){joints={};for(const side of ['l','r'])for(const part of ['hip_pitch','calf','ankle_pitch']){const name=`${side}_${part}_link`,node=obj.getObjectByName(name);if(node)joints[name]={node,rest:node.quaternion.clone()};}miniPiGaits.set(obj,joints);}
 const axis=new T.Vector3(0,1,0);
 for(const side of ['l','r']){const cycle=time*5.5+phase+(side==='r'?Math.PI:0),swing=Math.sin(cycle),lift=Math.max(0,swing),hip=-.34*swing,knee=.6*lift;
  for(const [part,angle] of [['hip_pitch',hip],['calf',knee],['ankle_pitch',-hip-knee]]){const joint=joints[`${side}_${part}_link`];if(joint)joint.node.quaternion.copy(joint.rest).multiply(new T.Quaternion().setFromAxisAngle(axis,angle));}
 }
}

const productJoints=new WeakMap();
function rigJoints(obj){let cache=productJoints.get(obj);if(!cache){cache=new Map();obj.traverse(n=>{if(n.name&&!n.isMesh)cache.set(n.name,{node:n,rest:n.quaternion.clone(),position:n.position.clone(),axis:new T.Vector3(...(n.userData.jointAxis||[0,1,0])).normalize()});});productJoints.set(obj,cache);}return cache;}
function turnJoint(joints,name,angle,axis){const j=joints.get(name);if(j)j.node.quaternion.copy(j.rest).multiply(new T.Quaternion().setFromAxisAngle(axis||j.axis,angle));}
export function animateProduct(obj,key,time,phase=0){
 if(key==='milk-bottle'){const body=obj.getObjectByName('milkBottleDancer');if(body){const beat=time*4+phase;body.rotation.z=.12*Math.sin(beat);body.rotation.y=.16*Math.sin(beat*.5);body.position.y=.08*(1-Math.cos(beat*2));}return;}
 if(key==='microduck')return animateDuck(obj,time,phase);
 if(key==='reachy-mini')return animateReachy(obj,time,phase);
 if(key==='mini-pi'||key==='mini-pi-plus'){
  animateMiniPi(obj,time,phase);
  if(key==='mini-pi-plus'){const joints=rigJoints(obj);for(const side of ['l','r'])turnJoint(joints,`${side}_shoulder_pitch_link`,.24*Math.sin(time*5.5+phase+(side==='r'?Math.PI:0)));}
  return;
 }
 if(!['originbot','prime-q1','prime-t1','tonypi'].includes(key))return;
 const joints=rigJoints(obj);
 if(key==='tonypi'){
  const axis=new T.Vector3(1,0,0);
  for(const side of ['l','r']){const swing=Math.sin(time*5.1+phase+(side==='r'?Math.PI:0)),hip=-.3*swing,knee=.54*Math.max(0,swing);turnJoint(joints,`${side}_hip_pitch`,hip,axis);turnJoint(joints,`${side}_knee`,knee,axis);turnJoint(joints,`${side}_ankle_pitch`,-hip-knee,axis);turnJoint(joints,`${side}_shoulder_pitch`,.24*swing,axis);}
  return;
 }
 if(key==='originbot'){for(const name of ['left_wheel_link','right_wheel_link'])turnJoint(joints,name,-time*3.4-phase);return;}
 if(key==='prime-q1'){
  for(const side of ['left','right']){const swing=Math.sin(time*5.2+phase+(side==='right'?Math.PI:0)),hip=-.3*swing,knee=.52*Math.max(0,swing);
   turnJoint(joints,`${side}_hip_pitch_link`,hip);turnJoint(joints,`${side}_knee_link`,knee);turnJoint(joints,`${side}_ankle_pitch_link`,-hip-knee);turnJoint(joints,`${side}_shoulder_pitch_link`,.26*swing);turnJoint(joints,`${side}_elbow_link`,-.16-.1*Math.max(0,-swing));
  }
  return;
 }
 // T1's original URDF has front arms and rear wheeled legs. Ease between
 // quadruped and upright wheel-leg poses by rotating its real joints.
 const cycle=(time+phase)%10;const blend=cycle<2?0:cycle<4?(cycle-2)/2:cycle<7?1:cycle<9?1-(cycle-7)/2:0;const u=blend*blend*(3-2*blend);
 turnJoint(joints,'BASELINK',-1.24*u,new T.Vector3(0,1,0));const base=joints.get('BASELINK');if(base)base.node.position.z=base.position.z+.12*u;
 for(const leg of ['FL','FR','RL','RR']){const front=leg[0]==='F',swing=Math.sin(time*4.2+phase+(leg==='FR'||leg==='RL'?Math.PI:0))*(1-u)*.12;
  turnJoint(joints,leg+'_HIP_PITCH_Link',(front?.95:.86)*u+swing);
  turnJoint(joints,leg+'_KNEE_Link',(front?.22:.38)*u-Math.max(0,swing)*.5);
  if(!front)turnJoint(joints,leg+'_FOOT_Link',time*2.8+phase);
 }
}

export function finishRobotMaterials(root,key){
 const head=root.getObjectByName(key==='prime-q1'?'head_link':'BASELINK');if(!head)return;
 const eyes=new T.MeshStandardMaterial({color:key==='prime-q1'?0xdaf6ff:0x6edbff,emissive:key==='prime-q1'?0xdaf6ff:0x47c6ee,emissiveIntensity:.65,roughness:.18});
 for(const side of [-1,1]){const eye=new T.Mesh(new T.SphereGeometry(1,12,8),eyes);if(key==='prime-q1'){eye.scale.set(.004,.005,.012);eye.position.set(.062,side*.02,.019);}else{eye.scale.set(.004,.008,.014);eye.position.set(.287,side*.031,.025);}head.add(eye);}
}

// Animate inside the physics root so the rigid-body transform remains authoritative.
export function animatedMilkBottle(mesh){
 const root=new T.Group();root.userData.half=mesh.userData.half.clone();
 mesh.name='milkBottleDancer';root.add(mesh);return root;
}
