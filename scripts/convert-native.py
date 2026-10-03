import sys,numpy as np,trimesh
from OCP.STEPCAFControl import STEPCAFControl_Reader
from OCP.TDF import TDF_ChildIterator
from OCP.TDocStd import TDocStd_Document
from OCP.TCollection import TCollection_ExtendedString
from OCP.XCAFDoc import XCAFDoc_DocumentTool,XCAFDoc_ColorType
from OCP.OCP.collections import Sequence_TDF_Label as TDF_LabelSequence
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_FACE,TopAbs_REVERSED
from OCP.TopoDS import TopoDS
from OCP.TopLoc import TopLoc_Location
from OCP.BRep import BRep_Tool
from OCP.Quantity import Quantity_Color
file,name=sys.argv[1:3];doc=TDocStd_Document(TCollection_ExtendedString('models'));reader=STEPCAFControl_Reader();reader.SetColorMode(True);reader.ReadFile(file);reader.Transfer(doc)
st=XCAFDoc_DocumentTool.ShapeTool_s(doc.Main());ct=XCAFDoc_DocumentTool.ColorTool_s(doc.Main());labs=TDF_LabelSequence();st.GetFreeShapes(labs);V=[];F=[];C=[]

if len(sys.argv)>3:
 chosen=st.BaseLabel().FindChild(int(sys.argv[3]),False);labs.Clear();labs.Append(chosen)
print('STEP loaded',name,flush=True)
color_map={};it=TDF_ChildIterator(doc.Main(),True)
while it.More():
 lab=it.Value();c=Quantity_Color();found=False
 for typ in [XCAFDoc_ColorType.XCAFDoc_ColorSurf,XCAFDoc_ColorType.XCAFDoc_ColorGen]:
  if ct.GetColor_s(lab,typ,c):found=True;break
 if found:
  sh=st.GetShape_s(lab)
  if not sh.IsNull():
   col=[c.Red(),c.Green(),c.Blue(),1];color_map[hash(sh.Located(TopLoc_Location()))]=col;ex=TopExp_Explorer(sh,TopAbs_FACE)
   while ex.More():color_map[hash(ex.Current().Located(TopLoc_Location()))]=col;ex.Next()
 it.Next()
print('Colors indexed',len(color_map),flush=True)
def color(shape,default):return color_map.get(hash(shape.Located(TopLoc_Location())),default)
for n in range(1,labs.Length()+1):
 shape=st.GetShape_s(labs.Value(n));BRepMesh_IncrementalMesh(shape,.24,False,.45,True).Perform();print('Meshed',n,flush=True);base=color(shape,[.75,.76,.74,1]);exp=TopExp_Explorer(shape,TopAbs_FACE)
 while exp.More():
  face=TopoDS.Face(exp.Current());loc=TopLoc_Location();tri=BRep_Tool.Triangulation_s(face,loc)
  if tri and tri.NbTriangles():
   col=color(face,base);offset=len(V);tr=loc.Transformation()
   for j in range(1,tri.NbNodes()+1):
    p=tri.Node(j).Transformed(tr);V.append([p.X(),p.Y(),p.Z()]);C.append(col)
   for j in range(1,tri.NbTriangles()+1):
    a,b,c=tri.Triangle(j).Get();f=[offset+a-1,offset+b-1,offset+c-1];F.append(f[::-1] if face.Orientation()==TopAbs_REVERSED else f)
  exp.Next()
print(name,'vertices',len(V),'faces',len(F),flush=True)
if not F:raise Exception('No faces')
v=np.asarray(V);v-= (v.max(0)+v.min(0))/2;v*=2/(v.max(0)-v.min(0)).max();mesh=trimesh.Trimesh(vertices=v,faces=F,vertex_colors=(np.asarray(C)*255).astype(np.uint8),process=False);mesh.export('assets/models/'+name+'.glb')
