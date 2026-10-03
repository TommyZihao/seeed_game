import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export const sceneThemes={
 garden:{name:'绿色工作台 · 镂空篮子',shape:'basket',color:0x284c39,base:'#287655',line:'#8abf96',pattern:'grid'},
 assembly:{name:'机械臂装配台 · 橙色零件筐',shape:'tray',color:0xe99a47,base:'#d3b990',line:'#a68c69',pattern:'wood'},
 laboratory:{name:'机器人实验室 · 蓝色深圆篮',shape:'dish',color:0x77b9d5,base:'#e5eef0',line:'#b5ccd4',pattern:'tile'},
 warehouse:{name:'算力仓库 · 铁灰运输箱',shape:'crate',color:0x343e48,base:'#555e75',line:'#818aa0',pattern:'stripe'},
 nvidia:{name:'算力机房 · 八角科技托盘',shape:'octagon',color:0x88bc35,base:'#233632',line:'#496657',pattern:'circuit'},
 hightorque:{name:'动力车间 · 红色机械运输箱',shape:'case',color:0xa84845,base:'#7e8b96',line:'#aebbc2',pattern:'stripe'},
 seeed:{name:'创客工坊 · 木质收纳筐',shape:'wood',color:0xb48148,base:'#ecdfbd',line:'#c7b58d',pattern:'wood'},
 lerobot:{name:'机器人装配室 · 紫色六角装配盒',shape:'hexagon',color:0x9981c8,base:'#dde4f2',line:'#b7b4d5',pattern:'grid'}
};
function surfaceTexture(theme){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle=theme.base;g.fillRect(0,0,512,512);g.strokeStyle=theme.line;g.globalAlpha=.4;g.lineWidth=2;
 for(let i=0;i<=512;i+=theme.pattern==='tile'?128:32){g.beginPath();if(theme.pattern==='wood'){g.moveTo(0,i);g.bezierCurveTo(180,i-7,350,i+7,512,i);}else if(theme.pattern==='stripe'){g.moveTo(i-512,0);g.lineTo(i,512);g.moveTo(i,0);g.lineTo(i+512,512);}else{g.moveTo(i,0);g.lineTo(i,512);g.moveTo(0,i);g.lineTo(512,i);}g.stroke();}
 if(theme.pattern==='circuit'){g.globalAlpha=.7;for(let i=32;i<512;i+=64){g.beginPath();g.moveTo(i,64);g.lineTo(i,160);g.lineTo(i+32,192);g.lineTo(i+32,400);g.stroke();g.beginPath();g.arc(i+32,400,5,0,Math.PI*2);g.stroke();}}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(6,6);return t;}
export function createThemedScenes(parent){
 const scenes=new Map();
 for(const [key,theme]of Object.entries(sceneThemes)){
  const group=new THREE.Group();group.visible=false;parent.add(group);
  const mat=new THREE.MeshStandardMaterial({color:theme.color,roughness:theme.shape==='wood'?.85:.62,metalness:['crate','case','octagon'].includes(theme.shape)?.22:.03});
  const edgeMat=mat.clone();edgeMat.color.multiplyScalar(.72);
  const parts=[],edgeParts=[];
  function bar(a,b,w=.16,d=.16,target=parts){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from);const g=new THREE.BoxGeometry(w,delta.length(),d);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));g.translate(...from.add(to).multiplyScalar(.5).toArray());target.push(g);}
  const bottom=-.71,top=1.35,round=['dish','octagon','hexagon'].includes(theme.shape);
  const ring=(points,radius=.16)=>{const path=new THREE.CurvePath();for(let i=0;i<points.length;i++)path.add(new THREE.LineCurve3(points[i],points[(i+1)%points.length]));const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,points.length*4,radius,8,true),edgeMat);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);};
  if(round){
   const sides=theme.shape==='dish'?64:theme.shape==='octagon'?8:6;
   const perimeter=(r,y)=>Array.from({length:sides},(_,i)=>{const a=i/sides*Math.PI*2;return new THREE.Vector3(Math.sin(a)*r,y,Math.cos(a)*r*1.18);});
   const low=perimeter(3.45,bottom),high=perimeter(4.45,top);
   for(let i=0;i<sides;i++){const j=(i+1)%sides,sub=sides===64?1:6;for(let k=0;k<sub;k++){bar(low[i].clone().lerp(low[j],k/sub).toArray(),high[i].clone().lerp(high[j],k/sub).toArray(),.16,.18);}}
   for(const t of [0,.25,.5,.75])ring(perimeter(3.45+t, bottom+(top-bottom)*t),.085);
   ring(high,.2);ring(perimeter(4.43,top-.2),.11);
   // Open ribs across the base let the work surface and its shadows show through.
   for(let x=-3.2;x<=3.2;x+=.42){const z=Math.sqrt(3.45*3.45-x*x)*1.18;bar([x,bottom,-z],[x,bottom,z],.15,.14);}
   for(let z=-3.7;z<=3.7;z+=.6){const x=Math.sqrt(3.45*3.45-(z/1.18)**2);bar([-x,bottom-.03,z],[x,bottom-.03,z],.13,.15);}
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
   if(['crate','case'].includes(theme.shape))for(const x of [-1,1])for(const z of [-1,1])bar([x*3.62,bottom,z*4.4],[x*4.28,top,z*5.05],.32,.32,edgeParts);
  }
  for(const [geometries,material]of [[parts,mat],[edgeParts,edgeMat]])if(geometries.length){const mesh=new THREE.Mesh(mergeGeometries(geometries),material);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);geometries.forEach(g=>g.dispose());}
  scenes.set(key,{group,round,material:new THREE.MeshStandardMaterial({map:surfaceTexture(theme),roughness:.88}),theme});
 }
 return scenes;
}
