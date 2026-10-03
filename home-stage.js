import * as T from 'three';
import {animateDuck,animateMiniPi} from './product-visuals.js';

// The home display shares the game's renderer; models keep their real geometry.
export class HomeStage {
 constructor(renderer,element,templates,products,onSelect){
  this.renderer=renderer;this.element=element;this.scene=new T.Scene();this.camera=new T.OrthographicCamera(-4.7,4.7,4,-4,.1,40);
  this.camera.position.set(0,8,12);this.camera.lookAt(0,1,0);this.pointers=new Map();this.selected=null;this.active=true;
  this.scene.add(new T.HemisphereLight(0xffffff,0x7286a1,1.8));const light=new T.DirectionalLight(0xfff4d8,2.5);light.position.set(-4,8,5);this.scene.add(light);const fill=new T.DirectionalLight(0xc6e9ff,1.1);fill.position.set(5,3,-2);this.scene.add(fill);
  const table=new T.Mesh(new T.CylinderGeometry(4.2,4.05,.35,80),new T.MeshStandardMaterial({color:0xffcf70,roughness:.58}));table.scale.z=.76;table.position.y=-.2;this.scene.add(table);
  const edge=new T.Mesh(new T.TorusGeometry(4.15,.075,10,96),new T.MeshStandardMaterial({color:0xffe9aa}));edge.rotation.x=Math.PI/2;edge.scale.y=.76;edge.position.y=-.005;this.scene.add(edge);
  this.models=[['so101-black',-1.5,-1.8,1.2],['rebot',2.0,-1.6,1.08],['microduck',-2.05,1.3,1.6],['mini-pi',.85,1.5,1.3]].map(([key,x,z,scale],i)=>{
   const index=products.findIndex(p=>p.key===key),model=templates[index].clone();model.scale.setScalar(scale);const half=model.userData.half.y*scale;const lift=i<2?.65:0;model.position.set(x,half+.08+lift,z);model.rotation.y=[.35,-.65,.2,-.15][i];this.scene.add(model);
   const pad=new T.Mesh(new T.CylinderGeometry(1.25,1.32,.09+lift,48),new T.MeshStandardMaterial({color:[0xf8a4be,0x83cdd8,0x83cf89,0xb5a1e7][i],roughness:.8}));pad.position.set(x,.025+lift/2,z);this.scene.add(pad);
   const entry={key,model,index,scale,y:half+.08+lift,lift,kick:0};model.userData.homeEntry=entry;return entry;
  });
  const ring=new T.Mesh(new T.TorusGeometry(1.3,.035,8,64),new T.MeshBasicMaterial({color:0xfff086}));ring.rotation.x=-Math.PI/2;ring.visible=false;this.scene.add(ring);this.ring=ring;
  const ray=new T.Raycaster();this.hit=e=>{const r=element.getBoundingClientRect();if(!r.width||!r.height||e.clientX<r.left||e.clientX>r.left+r.width||e.clientY<r.top||e.clientY>r.top+r.height)return null;this.updateCamera(r);this.scene.updateMatrixWorld(true);ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),this.camera);let o=ray.intersectObjects(this.models.map(m=>m.model),true)[0]?.object;while(o&&!o.userData.homeEntry)o=o.parent;return o?.userData.homeEntry||null;};
  this.distance=()=>{const [a,b]=[...this.pointers.values()];return b?Math.hypot(a.x-b.x,a.y-b.y):0;};
  this.down=e=>{if(!this.active)return;e.preventDefault();element.setPointerCapture(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(this.pointers.size===1){this.selected=this.hit(e);const target=this.selected;element.dataset.selectedModel=target?.key||'';if(target){target.kick=.6;onSelect(target.index);}}if(this.pointers.size===2){this.pinchDistance=this.distance();this.pinchScale=this.selected?.model.scale.x||1;}};
  this.move=e=>{const old=this.pointers.get(e.pointerId);if(!old||!this.active)return;this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(!this.selected)return;if(this.pointers.size===2&&this.pinchDistance>0)this.zoom(this.pinchScale*this.distance()/this.pinchDistance);else if(this.pointers.size===1){this.selected.model.rotation.y+=(e.clientX-old.x)*.014;this.selected.model.rotation.x=T.MathUtils.clamp(this.selected.model.rotation.x+(e.clientY-old.y)*.008,-.6,.6);}};
  this.up=e=>this.pointers.delete(e.pointerId);
  this.wheel=e=>{if(!this.active)return;e.preventDefault();this.selected=this.hit(e);element.dataset.selectedModel=this.selected?.key||'';if(this.selected)this.zoom(this.selected.model.scale.x*Math.exp(-e.deltaY*.0015));};
  for(const [type,fn]of [['pointerdown',this.down],['pointermove',this.move],['pointerup',this.up],['pointercancel',this.up],['lostpointercapture',this.up],['wheel',this.wheel]])element.addEventListener(type,fn,{passive:false});
 }
 updateCamera(r){this.camera.top=4.7*r.height/r.width;this.camera.bottom=-this.camera.top;this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld(true);}
 zoom(scale){if(!this.selected)return;const m=this.selected;m.model.scale.setScalar(T.MathUtils.clamp(scale,m.scale*.65,m.scale*1.55));m.y=m.model.userData.half.y*m.model.scale.x+.08+m.lift;}
 render(t,dt){
  for(const entry of this.models){const {key,model}=entry;entry.kick=Math.max(0,entry.kick-dt);model.position.y=entry.y+Math.sin(entry.kick/.6*Math.PI)*.4;if(key==='microduck')animateDuck(model,t);if(key==='mini-pi')animateMiniPi(model,t);if(!this.pointers.size&&entry!==this.selected&&['rebot','so101-black'].includes(key))model.rotation.y+=Math.sin(t*.8+entry.index)*dt*.12;}
  this.ring.visible=!!this.selected;if(this.selected)this.ring.position.set(this.selected.model.position.x,.09+this.selected.lift,this.selected.model.position.z);
  const r=this.element.getBoundingClientRect(),canvas=this.renderer.domElement.getBoundingClientRect(),size=this.renderer.getSize(new T.Vector2());const sx=size.x/canvas.width,sy=size.y/canvas.height;
  this.updateCamera(r);
  this.renderer.setScissorTest(false);this.renderer.setViewport(0,0,size.x,size.y);this.renderer.setClearColor(0,0);this.renderer.clear();this.renderer.setViewport((r.left-canvas.left)*sx,(canvas.bottom-r.bottom)*sy,r.width*sx,r.height*sy);this.renderer.setScissor((r.left-canvas.left)*sx,(canvas.bottom-r.bottom)*sy,r.width*sx,r.height*sy);this.renderer.setScissorTest(true);this.renderer.render(this.scene,this.camera);this.renderer.setScissorTest(false);this.renderer.setViewport(0,0,size.x,size.y);
 }
 dispose(){this.active=false;for(const [type,fn]of [['pointerdown',this.down],['pointermove',this.move],['pointerup',this.up],['pointercancel',this.up],['lostpointercapture',this.up],['wheel',this.wheel]])this.element.removeEventListener(type,fn);this.scene.traverse(n=>{if(n.isMesh&&!this.models.some(m=>{let p=n;while(p){if(p===m.model)return true;p=p.parent;}return false;})){n.geometry.dispose();n.material.dispose();}});}
}
