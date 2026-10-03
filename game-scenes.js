import * as THREE from 'three';
import {containerBounds} from './container-physics.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export const sceneThemes={
 garden:{name:'绿色工作台 · 镂空篮子',shape:'basket',color:0x284c39,base:'#287655',line:'#8abf96',pattern:'grid'},
 assembly:{name:'机械臂装配台 · 橙色零件筐',shape:'tray',color:0xe99a47,base:'#d3b990',line:'#a68c69',pattern:'wood'},
 laboratory:{name:'机器人实验室 · 蓝色深圆篮',shape:'dish',color:0x77b9d5,base:'#e5eef0',line:'#b5ccd4',pattern:'tile'},
 warehouse:{name:'算力仓库 · 铁灰运输箱',shape:'crate',color:0x343e48,base:'#555e75',line:'#818aa0',pattern:'stripe'},
 nvidia:{name:'英伟达绿工作台 · 加宽深箱',shape:'widecrate',color:0x76b900,base:'#416a12',line:'#9fd448',pattern:'circuit'},
 hightorque:{name:'动力车间 · 红色机械运输箱',shape:'case',color:0xa84845,base:'#7e8b96',line:'#aebbc2',pattern:'stripe'},
 seeed:{name:'创客工坊 · 木质收纳筐',shape:'wood',color:0xb48148,base:'#ecdfbd',line:'#c7b58d',pattern:'wood'},
 timber:{name:'木纹长桌 · 原木板条箱',shape:'timber',color:0xb47c41,base:'#bfa481',line:'#76583d',pattern:'planks'},
 toolbox:{name:'蓝图工作台 · 铆钉工具箱',shape:'toolbox',color:0x315b78,base:'#28455e',line:'#90b7d3',pattern:'blueprint'},
 enamel:{name:'复古花砖 · 奶油搪瓷盆',shape:'enamel',color:0xf0e6bf,base:'#ede6cd',line:'#6c9797',pattern:'flower'},
 galvanized:{name:'水泥地面 · 镀锌金属盆',shape:'galvanized',color:0x9eaeb5,base:'#989b96',line:'#5c6964',pattern:'concrete'},
 rattan:{name:'野餐格布 · 蜜糖藤编筐',shape:'rattan',color:0xb88241,base:'#eee1bc',line:'#bd655b',pattern:'gingham'},
 fabric:{name:'软木桌面 · 帆布收纳箱',shape:'fabric',color:0x6e8174,base:'#b89a72',line:'#765c3e',pattern:'cork'},
 lerobot:{name:'机器人装配室 · 加宽蓝绿深箱',shape:'widecrate',color:0x58a8ad,base:'#dce8ec',line:'#9db9c7',pattern:'blueprint'}
};
function surfaceTexture(theme){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle=theme.base;g.fillRect(0,0,512,512);g.strokeStyle=theme.line;g.globalAlpha=.4;g.lineWidth=2;
 for(let i=0;i<=512;i+=theme.pattern==='tile'?128:32){g.beginPath();if(theme.pattern==='wood'){g.moveTo(0,i);g.bezierCurveTo(180,i-7,350,i+7,512,i);}else if(theme.pattern==='stripe'){g.moveTo(i-512,0);g.lineTo(i,512);g.moveTo(i,0);g.lineTo(i+512,512);}else{g.moveTo(i,0);g.lineTo(i,512);g.moveTo(0,i);g.lineTo(512,i);}g.stroke();}
 if(theme.pattern==='circuit'){g.globalAlpha=.7;for(let i=32;i<512;i+=64){g.beginPath();g.moveTo(i,64);g.lineTo(i,160);g.lineTo(i+32,192);g.lineTo(i+32,400);g.stroke();g.beginPath();g.arc(i+32,400,5,0,Math.PI*2);g.stroke();}}
 if(theme.pattern==='planks'){g.globalAlpha=.6;for(let y=0;y<512;y+=85){g.fillStyle=y%170?'#836146':'#c1a27c';g.fillRect(0,y,512,82);g.strokeStyle='#624830';for(let j=0;j<6;j++){g.beginPath();g.moveTo(0,y+j*13);g.bezierCurveTo(140,y+j*13+9,370,y+j*13-8,512,y+j*13);g.stroke();}}}
 if(theme.pattern==='gingham'){g.globalAlpha=.32;g.fillStyle=theme.line;for(let i=0;i<512;i+=128){g.fillRect(i,0,64,512);g.fillRect(0,i,512,64);}}
 if(theme.pattern==='flower'){g.globalAlpha=.7;g.fillStyle=theme.line;for(let x=32;x<512;x+=64)for(let y=32;y<512;y+=64){for(let j=0;j<4;j++){const a=j*Math.PI/2;g.beginPath();g.ellipse(x+Math.cos(a)*8,y+Math.sin(a)*8,8,4,a,0,Math.PI*2);g.fill();}}}
 if(['concrete','cork'].includes(theme.pattern)){g.globalAlpha=.18;for(let i=0;i<7000;i++){g.fillStyle=i%2?theme.line:'#fff7e4';const x=(i*97.13)%512,y=(i*43.87)%512;g.fillRect(x,y,theme.pattern==='cork'?4:2,2);}}
 if(theme.pattern==='blueprint'){g.globalAlpha=.65;g.strokeStyle=theme.line;for(let x=64;x<512;x+=128){g.beginPath();g.arc(x,256,40,0,Math.PI*2);g.moveTo(x-54,256);g.lineTo(x+54,256);g.moveTo(x,202);g.lineTo(x,310);g.stroke();}}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(6,6);return t;}
export function createThemedScenes(parent){
 const scenes=new Map();
 for(const [key,theme]of Object.entries(sceneThemes)){
  const group=new THREE.Group();group.visible=false;parent.add(group);
  const mat=new THREE.MeshStandardMaterial({color:theme.color,roughness:theme.shape==='wood'?.85:.62,metalness:['crate','case','octagon'].includes(theme.shape)?.22:.03});
  const edgeMat=mat.clone();edgeMat.color.multiplyScalar(.72);
  const parts=[],edgeParts=[];
  function bar(a,b,w=.16,d=.16,target=parts){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from);const g=new THREE.BoxGeometry(w,delta.length(),d);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));g.translate(...from.add(to).multiplyScalar(.5).toArray());target.push(g);}
  const bottom=-.71,top=1.35,round=['dish','octagon','hexagon','enamel','galvanized','rattan'].includes(theme.shape);
  const ring=(points,radius=.16)=>{const path=new THREE.CurvePath();for(let i=0;i<points.length;i++)path.add(new THREE.LineCurve3(points[i],points[(i+1)%points.length]));const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,points.length*4,radius,8,true),edgeMat);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);};
  const mesh=(geometry,material=mat)=>{const m=new THREE.Mesh(geometry,material);m.castShadow=m.receiveShadow=true;group.add(m);return m;};
  if(['enamel','galvanized'].includes(theme.shape)){
   mat.metalness=theme.shape==='galvanized'?.65:.18;mat.roughness=theme.shape==='galvanized'?.38:.3;
   const profile=[[0,-.78],[3.3,-.78],[4.35,1.65],[4.48,1.7],[4.55,1.52],[3.48,-.97],[0,-.97]].map(([r,y])=>new THREE.Vector2(r,y));
   const basin=mesh(new THREE.LatheGeometry(profile,96));basin.scale.z=1.18;
   edgeMat.color.set(theme.shape==='enamel'?0x315d6b:0x627680);
   const lip=mesh(new THREE.TorusGeometry(4.43,.16,12,96),edgeMat);lip.rotation.x=Math.PI/2;lip.scale.y=1.18;lip.position.y=1.65;
   if(theme.shape==='galvanized')for(const y of [-.25,.3,.85]){const r=3.72+(y+.25)*.43,bead=mesh(new THREE.TorusGeometry(r,.045,6,96),edgeMat);bead.rotation.x=Math.PI/2;bead.scale.y=1.18;bead.position.y=y;}
  }else if(theme.shape==='rattan'){
   const spokes=64,levels=18;for(let i=0;i<spokes;i++){const a=i/spokes*Math.PI*2;bar([Math.sin(a)*3.45,bottom,Math.cos(a)*4.07],[Math.sin(a)*4.45,top,Math.cos(a)*5.25],.10,.12);}
   for(let j=0;j<levels;j++){const t=j/(levels-1),points=Array.from({length:128},(_,i)=>{const a=i/128*Math.PI*2,r=3.45+t+Math.sin(a*32+j*Math.PI)*.055;return new THREE.Vector3(Math.sin(a)*r,bottom+t*(top-bottom),Math.cos(a)*r*1.18);});ring(points,j===levels-1?.18:.065);}
   for(let x=-3.25;x<=3.26;x+=.18){const z=Math.sqrt(3.45**2-x*x)*1.18;bar([x,bottom,-z],[x,bottom,z],.12,.11);}
   for(let z=-3.9;z<=3.91;z+=.22){const x=Math.sqrt(3.45**2-(z/1.18)**2);bar([-x,bottom+.04,z],[x,bottom+.04,z],.1,.1);}
  }else if(['timber','toolbox','fabric'].includes(theme.shape)){
   // Broad sloped panels show all four inner faces, with a smaller recessed base.
   const panel=(a,b,c,d,material=mat)=>{const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));geometry.computeVertexNormals();const m=material.clone();m.side=THREE.DoubleSide;mesh(geometry,m);};
   const wood=theme.shape==='timber';const bands=wood?5:1;
   for(let j=0;j<bands;j++){const t0=j/bands,t1=(j+1)/bands-(wood?.018:0),y0=bottom+2.06*t0,y1=bottom+2.06*t1,x0=3.62+.66*t0,x1=3.62+.66*t1,z0=4.4+.65*t0,z1=4.4+.65*t1;
    const plank=mat.clone();plank.color.multiplyScalar(wood?(j%2?.88:1.07):1);
    for(const sign of [-1,1]){panel([sign*x0,y0,-z0],[sign*x0,y0,z0],[sign*x1,y1,z1],[sign*x1,y1,-z1],plank);panel([-x0,y0,sign*z0],[x0,y0,sign*z0],[x1,y1,sign*z1],[-x1,y1,sign*z1],plank);}
   }
   const base=mesh(new THREE.BoxGeometry(7.3,.18,8.85));base.position.y=-.84;
   ring([[-4.28,top,-5.05],[4.28,top,-5.05],[4.28,top,5.05],[-4.28,top,5.05]].map(p=>new THREE.Vector3(...p)),.18);
   for(const x of [-1,1])for(const z of [-1,1])bar([x*3.62,bottom,z*4.4],[x*4.28,top,z*5.05],wood?.32:.2,wood?.32:.2,edgeParts);
   if(theme.shape==='toolbox'){
    edgeMat.color.set(0xb8c7cf);for(const x of [-2.6,2.6]){const latch=mesh(new THREE.BoxGeometry(.48,.6,.16),edgeMat);latch.position.set(x,.86,4.94);}for(const z of [-1,1]){const handle=mesh(new THREE.TorusGeometry(.55,.09,8,24),edgeMat);handle.position.set(0,.55,z*4.96);handle.scale.set(1,.55,1);}
    for(const x of [-1,1])for(const z of [-1,1])for(const t of [.15,.45,.8]){const rivet=mesh(new THREE.SphereGeometry(.085,8,6),edgeMat);rivet.position.set(x*(3.62+.66*t),bottom+2.06*t,z*(4.4+.65*t));}
   }
   if(theme.shape==='fabric'){edgeMat.color.set(0xcbbd96);for(const side of [-1,1]){bar([-1,.85,side*4.99],[1,.85,side*4.99],.14,.2,edgeParts);for(let x=-3.8;x<3.8;x+=.22)bar([x,1.17,side*5],[x+.09,1.17,side*5],.025,.025,edgeParts);}}
  }else if(round){
   const sides=theme.shape==='dish'?64:theme.shape==='octagon'?8:6;
   const perimeter=(r,y)=>Array.from({length:sides},(_,i)=>{const a=i/sides*Math.PI*2;return new THREE.Vector3(Math.sin(a)*r,y,Math.cos(a)*r*1.18);});
   const low=perimeter(3.45,bottom),high=perimeter(4.45,top);
   for(let i=0;i<sides;i++){const j=(i+1)%sides,sub=sides===64?1:6;for(let k=0;k<sub;k++){bar(low[i].clone().lerp(low[j],k/sub).toArray(),high[i].clone().lerp(high[j],k/sub).toArray(),.16,.18);}}
   for(const t of [0,.25,.5,.75])ring(perimeter(3.45+t, bottom+(top-bottom)*t),.085);
   ring(high,.2);ring(perimeter(4.43,top-.2),.11);
   // Open ribs across the base let the work surface and its shadows show through.
   const baseBounds=containerBounds(theme.shape,1);const extent=(fixed,axis)=>{let low=-10,high=10;for(const p of baseBounds.planes){const nx=theme.shape==='hexagon'?p.nx*1.14:p.nx,nz=p.nz,coef=axis==='z'?nz:nx,other=axis==='z'?nx:nz,limit=p.offset+p.slope*bottom-.1-other*fixed;if(Math.abs(coef)<1e-8){if(limit<0)return 0;}else if(coef>0)high=Math.min(high,limit/coef);else low=Math.max(low,limit/coef);}return Math.max(0,Math.min(high,-low));};
   for(let x=-3.2;x<=3.2;x+=.42){const z=extent(x,'z');if(z)bar([x,bottom,-z],[x,bottom,z],.15,.14);}
   for(let z=-3.7;z<=3.7;z+=.6){const x=extent(z,'x');if(x)bar([-x,bottom-.03,z],[x,bottom-.03,z],.13,.15);}
  }else{
   const step=theme.shape==='wood'?.7:.52;
   for(const side of [-1,1]){
    for(let z=-4.35;z<=4.36;z+=step)bar([side*3.62,bottom,z],[side*4.28,top,z*5.05/4.4],theme.shape==='wood'?.25:.16,.18);
    for(let x=-3.55;x<=3.56;x+=step)bar([x,bottom,side*4.4],[x*4.28/3.62,top,side*5.05],.18,theme.shape==='wood'?.25:.16);
    for(const t of [0,.25,.5,.75]){const y=bottom+(top-bottom)*t,x=3.62+.66*t,z=4.4+.65*t;bar([side*x,y,-z],[side*x,y,z],.17,.18);bar([-x,y,side*z],[x,y,side*z],.17,.18);}
   }
   for(let x=-3.5;x<=3.51;x+=.4)bar([x,bottom,-4.4],[x,bottom,4.4],.16,.16);
   for(let z=-4.3;z<=4.31;z+=.65)bar([-3.62,bottom-.03,z],[3.62,bottom-.03,z],.13,.16);
   const shape=new THREE.Shape(),w=4.28,d=5.05,r=.38;shape.moveTo(-w+r,-d);shape.lineTo(w-r,-d);shape.quadraticCurveTo(w,-d,w,-d+r);shape.lineTo(w,d-r);shape.quadraticCurveTo(w,d,w-r,d);shape.lineTo(-w+r,d);shape.quadraticCurveTo(-w,d,-w,d-r);shape.lineTo(-w,-d+r);shape.quadraticCurveTo(-w,-d,-w+r,-d);
   ring(shape.getPoints(12).map(p=>new THREE.Vector3(p.x,top,p.y)),.2);
   for(const side of [-1,1])bar([-.8,top+.02,side*5.05],[.8,top+.02,side*5.05],.25,.35,edgeParts);
   if(['crate','case','widecrate'].includes(theme.shape))for(const x of [-1,1])for(const z of [-1,1])bar([x*3.62,bottom,z*4.4],[x*4.28,top,z*5.05],.32,.32,edgeParts);
  }
  for(const [geometries,material]of [[parts,mat],[edgeParts,edgeMat]])if(geometries.length){const mesh=new THREE.Mesh(mergeGeometries(geometries),material);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);geometries.forEach(g=>g.dispose());}
  if(theme.shape==='hexagon')group.scale.x=1.14;
  if(theme.shape==='widecrate'){group.scale.x=1.04;group.scale.z=1.02;}
  scenes.set(key,{group,round,material:new THREE.MeshStandardMaterial({map:surfaceTexture(theme),roughness:.88}),theme});
 }
 return scenes;
}
