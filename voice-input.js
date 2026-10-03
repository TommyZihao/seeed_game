let recording=null,request=null,session=0,busy=false,notify=()=>{};
export function cancelVoice(){session++;busy=false;request?.abort();request=null;const r=recording;recording=null;if(r){clearTimeout(r.timer);if(r.recorder.state==='recording')r.recorder.stop();r.stream.getTracks().forEach(t=>t.stop());}notify('idle');}
export function releaseVoice(){if(recording){if(recording.recorder.state==='recording')recording.recorder.stop();}else if(busy&&!request){cancelVoice();}}
export function encodeWav(buffer){const samples=buffer.length,channels=buffer.numberOfChannels,out=new ArrayBuffer(44+samples*2),v=new DataView(out);const text=(at,s)=>{for(let i=0;i<s.length;i++)v.setUint8(at+i,s.charCodeAt(i));};text(0,'RIFF');v.setUint32(4,36+samples*2,true);text(8,'WAVE');text(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,buffer.sampleRate,true);v.setUint32(28,buffer.sampleRate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);text(36,'data');v.setUint32(40,samples*2,true);for(let i=0;i<samples;i++){let x=0;for(let c=0;c<channels;c++)x+=buffer.getChannelData(c)[i]/channels;x=Math.max(-1,Math.min(1,x));v.setInt16(44+i*2,x*(x<0?32768:32767),true);}return out;}
export async function voiceInput(onStatus,onText,onState){
 if(busy)return;
 notify=onState;
 if(location.protocol==='file:'){onStatus('请通过本地服务或 HTTPS 网页使用语音续玩。');return;}
 const token=++session;busy=true;onState('preparing');onStatus('正在准备麦克风，请保持按住…');let stream;
 try{
 const check=await fetch('/api/asr/status');if(!check.ok)throw Error('语音服务未启动');const config=await check.json();if(!config.configured)throw Error('尚未配置阿里云语音密钥');if(token!==session)return;
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw Error('当前浏览器无法录音，请使用 HTTPS 或 localhost');
 stream=await navigator.mediaDevices.getUserMedia({audio:true});if(token!==session){stream.getTracks().forEach(t=>t.stop());return;}
 const recorder=new MediaRecorder(stream),chunks=[],current={recorder,stream};recording=current;
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
 recorder.onerror=()=>{if(token!==session)return;cancelVoice();onStatus('录音失败，请重新按住麦克风。');};
 recorder.onstop=async()=>{clearTimeout(current.timer);stream.getTracks().forEach(t=>t.stop());if(token!==session)return;recording=null;onState('processing');onStatus('正在识别…');request=new AbortController();let ctx;
 try{ctx=new (window.AudioContext||window.webkitAudioContext)();const decoded=await ctx.decodeAudioData(await new Blob(chunks).arrayBuffer());const wav=encodeWav(decoded);await ctx.close();ctx=null;if(token!==session)return;const response=await fetch('/api/asr',{method:'POST',headers:{'Content-Type':'audio/wav'},body:wav,signal:request.signal});const result=await response.json();if(!response.ok)throw Error(result.error||'识别失败');if(token===session){onState('idle');onText(result.text);}}
 catch(e){if(token===session){onState('idle');onStatus(e.message||'没有听清，请再试一次。');}}
 finally{if(ctx)await ctx.close();if(token===session){request=null;busy=false;}}};
 recorder.start();onState('recording');onStatus('正在聆听，松手自动识别…');current.timer=setTimeout(()=>{if(recorder.state==='recording')recorder.stop();},6000);
 }catch(e){stream?.getTracks().forEach(t=>t.stop());if(token===session){busy=false;onState('idle');onStatus(e.name==='NotAllowedError'?'请允许麦克风权限后重试。':e.message);}}
}
