const fs=require('fs');
(async()=>{
const T=await import('three');const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');
global.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(b=>{this.result=b;this.onloadend?.()})}readAsDataURL(blob){blob.arrayBuffer().then(b=>{this.result='data:application/octet-stream;base64,'+Buffer.from(b).toString('base64');this.onloadend?.()})}};
const occt=await require('occt-import-js')();
const file=process.argv[2],name=process.argv[3];console.log('Converting',name);
const result=file.endsWith('.json')?JSON.parse(fs.readFileSync(file)):occt.ReadStepFile(fs.readFileSync(file),{linearUnit:'millimeter',linearDeflectionType:'absolute_value',linearDeflection:0.15,angularDeflection:0.5});if(!result.success)throw Error('CAD import failed');
const group=new T.Group();let tris=0;for(const [meshIndex,m] of result.meshes.entries()){let geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(m.attributes.position.array,3));if(m.attributes.normal)geo.setAttribute('normal',new T.Float32BufferAttribute(m.attributes.normal.array,3));geo.setIndex(m.index.array);if(!m.attributes.normal)geo.computeVertexNormals();tris+=m.index.array.length/3;
let color=m.color||[.58,.61,.63];if(name==='xiao')color=[[.62,.64,.65],[.72,.74,.75],[.06,.34,.21],[.06,.07,.07],[.62,.66,.67]][meshIndex]||color;if(name==='rdk-x5'){const n=m.name||'';color=new T.Color(n==='BOARD_OUTLINE'?'#171b21':n.includes('排针')?'#ed742d':/RJ45|USB|SD卡|105450|105017|HDMI|IPEX|金属/i.test(n)?'#b7b9b9':/JST|FPC|座子/.test(n)?'#d8d4c2':/^C[0-9]|TAN/.test(n)?'#a59674':n===''?'#999e9f':'#202329').toArray();}let mat=new T.MeshStandardMaterial({color:new T.Color(...color),roughness:.48,metalness:.24});const mesh=new T.Mesh(geo,mat);mesh.name=m.name||'';group.add(mesh)}
if(!tris)throw Error('No triangles generated');let box=new T.Box3().setFromObject(group),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());group.position.sub(center);let parent=new T.Group();parent.add(group);parent.scale.setScalar(2/Math.max(size.x,size.y,size.z));parent.updateMatrixWorld(true);
const glb=await new GLTFExporter().parseAsync(parent,{binary:true});fs.writeFileSync('assets/models/'+name+'.glb',Buffer.from(glb));console.log(JSON.stringify({name,meshes:result.meshes.length,tris,bytes:glb.byteLength,size:size.toArray()}));
})();
