import urllib.request,urllib.parse,json,pathlib,concurrent.futures
root=pathlib.Path('assets/cad')
files={
'recomputer.stp':'https://files.seeedstudio.com/products/NVIDIA/Industrial/reComputer-Industrial.stp',
'respeaker.step':'https://files.seeedstudio.com/wiki/respeakerv3/ReSpeakerLitev1.1.step',
'watcher.stp':'https://raw.githubusercontent.com/Seeed-Studio/OSHW-SenseCAP-Watcher/main/Hardware/SenseCAP_Watcher-3D-Shell_v1.stp',
'so101.step':'https://raw.githubusercontent.com/TheRobotStudio/SO-ARM100/main/STEP/SO101/SO101%20Assembly.step',
'xiao.zip':'https://files.seeedstudio.com/wiki/XIAO_WiFi/Resources/XIAO_ESP32C3_v1.3_KiCad_260116.zip',
'orin.zip':'https://developer.nvidia.com/downloads/assets/embedded/secure/jetson/orin_nano/docs/jetson_orin_nano_devkit_3d_step_model.zip/'}
def f(kv):
 name,url=kv
 try:
  data=urllib.request.urlopen(url,timeout=60).read();(root/name).write_bytes(data);return name,len(data),data[:25].decode(errors='replace')
 except Exception as e:return name,str(e)
for x in concurrent.futures.ThreadPoolExecutor().map(f,files.items()):print(x,flush=True)
(root/'sources.json').write_text(json.dumps(files,indent=2))
