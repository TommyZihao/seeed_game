import trimesh,numpy as np,sys
for name in sys.argv[1:]:
 p='assets/models/'+name+'.glb';m=trimesh.load(p,force='scene').to_geometry();colors=m.visual.vertex_colors[m.faces[:,0]];unique,idx=np.unique(colors,axis=0,return_inverse=True);scene=trimesh.Scene()
 for i,c in enumerate(unique):
  sub=trimesh.Trimesh(vertices=m.vertices.copy(),faces=m.faces[idx==i],process=False);sub.remove_unreferenced_vertices();sub.visual=trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(baseColorFactor=c,metallicFactor=.2,roughnessFactor=.45));scene.add_geometry(sub)
 scene.export(p);print(name,len(unique),'material groups',flush=True)
