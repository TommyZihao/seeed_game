import urllib.request,re,pathlib,concurrent.futures,json
pi=open('/tmp/pi-page.html').read();piurl=re.search(r'href="([^"]+No%20Graphics[^" ]+\.zip)"',pi)[1]
urls={'uno-q.zip':'https://docs.arduino.cc/resources/models/ABX00162-step.zip','pi5.zip':piurl,'rdk-x5.stp':'https://archive.d-robotics.cc/downloads/hardware/rdk_x5/RDK_X5_LPDDR4_4266MHz_V1P0_pcb.stp'}
def f(kv):
 name,url=kv
 try:
  data=urllib.request.urlopen(url,timeout=70).read();pathlib.Path('assets/cad/'+name).write_bytes(data);print(name,len(data),flush=True)
 except Exception as e:print(name,e,flush=True)
with concurrent.futures.ThreadPoolExecutor() as ex:list(ex.map(f,urls.items()))
pathlib.Path('assets/model-sources/new-downloads.json').write_text(json.dumps(urls,indent=2))
