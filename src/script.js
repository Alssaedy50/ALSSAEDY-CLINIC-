const STORAGE_KEY='alssaedy_receipt_state_v7';
const THEME_SYNC_KEY='alssaedy_theme_cache_v1';
const THEME_API=(window.ALSSAEDY_THEME_API||'https://alssaedy-clinic.alssaedy500.workers.dev/api/theme');
let syncTimer=null;
let applyingRemoteTheme=false;
let isEditing=false;
let bootstrapDone=false;
const MAX_UPLOAD_BYTES=3*1024*1024;

function localISODate(){const now=new Date(),offset=now.getTimezoneOffset();return new Date(now.getTime()-offset*60000).toISOString().slice(0,10)}
function getState(){
 const inputs={};document.querySelectorAll('.live-input').forEach(el=>{if(el.id)inputs[el.id]=el.value});
 const checks=Array.from(document.querySelectorAll('.check-interactive')).map(el=>({name:el.name||'',value:el.value||'',checked:el.checked}));
 const texts={};document.querySelectorAll('.editable').forEach(el=>{if(el.dataset.key)texts[el.dataset.key]=el.textContent});
 return {version:6,orientation:document.body.dataset.orientation||'portrait',fontFamily:document.documentElement.dataset.fontFamily||'Cairo',fontScale:document.documentElement.dataset.fontScale||'1',textColor:document.documentElement.dataset.textColor||'#122033',mode:document.body.dataset.mode||'manual',size:document.body.dataset.size||'a5',theme:document.body.dataset.theme||'classic',inputs,checks,texts,logo:document.getElementById('clinicLogoImg')?.src||'',watermark:document.getElementById('watermarkLayer')?.style.backgroundImage||''}
}
function saveState(){
 try{
  const state=getState(),updatedAt=Date.now();
  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  localStorage.setItem(THEME_SYNC_KEY,JSON.stringify({updatedAt,state}));
  if(bootstrapDone){clearTimeout(syncTimer);syncTimer=setTimeout(()=>syncThemeToServer(),900)}
 }catch(e){console.error('Unable to save receipt state:',e)}
}
function setMode(mode,persist=true){document.body.dataset.mode=mode;document.getElementById('btnModeManual').classList.toggle('active',mode==='manual');document.getElementById('btnModeDigital').classList.toggle('active',mode==='digital');if(mode==='digital'){const d=document.getElementById('digitalDate');if(d&&!d.value)d.value=localISODate()}if(persist)saveState()}
function setSize(size,persist=true){document.body.dataset.size=size;const orientation=document.body.dataset.orientation||'portrait';document.body.style.page=size==='thermal'?'receipt-thermal':size+'-'+orientation;['a5','a4','thermal'].forEach(s=>document.getElementById('btnSize'+s[0].toUpperCase()+s.slice(1)).classList.toggle('active',s===size));if(persist)saveState()}
function setTheme(theme,persist=true){document.body.dataset.theme=theme;document.querySelectorAll('.theme-btn').forEach(b=>b.classList.toggle('active',b.dataset.theme===theme));if(persist)saveState()}
function toggleSettingsPanel(force){const p=document.getElementById('settingsPanel');const open=typeof force==='boolean'?force:!p.classList.contains('open');p.classList.toggle('open',open);p.setAttribute('aria-hidden',String(!open))}
function setOrientation(value,persist=true){const orientation=value==='landscape'?'landscape':'portrait';document.body.dataset.orientation=orientation;document.getElementById('btnPortrait')?.classList.toggle('active',orientation==='portrait');document.getElementById('btnLandscape')?.classList.toggle('active',orientation==='landscape');const size=document.body.dataset.size||'a5';document.body.style.page=size==='thermal'?'receipt-thermal':size+'-'+orientation;if(persist)saveState()}
function setFontFamily(font,persist=true){const allowed=['Cairo','Tajawal','IBM Plex Sans Arabic','Noto Kufi Arabic'];if(!allowed.includes(font))font='Cairo';document.documentElement.style.setProperty('--receipt-font',font+', sans-serif');document.documentElement.dataset.fontFamily=font;const c=document.getElementById('fontFamilyControl');if(c)c.value=font;if(persist)saveState()}
function setFontScale(scale,persist=true){const value=Math.min(1.2,Math.max(.85,Number(scale)||1));document.documentElement.style.setProperty('--font-scale',String(value));document.documentElement.dataset.fontScale=String(value);const c=document.getElementById('fontSizeControl');if(c)c.value=Math.round(value*100);if(persist)saveState()}
function adjustFontSize(step){setFontScale((Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale'))||1)+step*.05)}
function setTextColor(color,persist=true){if(!/^#[0-9a-f]{6}$/i.test(color))return;document.documentElement.style.setProperty('--custom-text',color);document.documentElement.dataset.textColor=color;const c=document.getElementById('textColorControl');if(c)c.value=color;if(persist)saveState()}
function toggleEditMode(){
 isEditing=!isEditing;document.body.classList.toggle('is-editing',isEditing);
 const btn=document.getElementById('btnEdit');btn.textContent=isEditing?'💾 حفظ التعديلات':'✏️ تعديل النصوص';btn.style.background=isEditing?'#059669':'#f59e0b';
 document.querySelectorAll('.editable').forEach(el=>{el.contentEditable=isEditing?'true':'false';el.spellcheck=false});
 if(!isEditing)saveState();
}
function triggerLogoUpload(){document.getElementById('logoUploader')?.click()}
async function uploadLogo(event){
 const file=event.target.files?.[0];
 if(!file||!file.type.startsWith('image/')){event.target.value='';return}
 if(file.size>MAX_UPLOAD_BYTES){alert('حجم الشعار يتجاوز 3 MB. اختر شعارًا بحجم 3 MB أو أقل.');event.target.value='';return}
 const reader=new FileReader();
 reader.onload=async e=>{
  const dataUrl=e.target.result,logo=document.getElementById('clinicLogoImg'),watermark=document.getElementById('watermarkLayer');
  if(logo)logo.src=dataUrl;if(watermark)watermark.style.backgroundImage='url("'+dataUrl+'")';saveState();
  try{
   const remoteUrl=await uploadThemeAsset(file,'logo');
   if(remoteUrl){if(logo)logo.src=remoteUrl;if(watermark)watermark.style.backgroundImage='url("'+remoteUrl+'")';saveState()}
  }catch(err){console.info('Remote logo sync unavailable; local logo retained')}
 };
 reader.readAsDataURL(file);
}
function uploadBackground(event){
 const file=event.target.files?.[0];
 if(!file||!file.type.startsWith('image/')){event.target.value='';return}
 if(file.size>MAX_UPLOAD_BYTES){alert('حجم الخلفية يتجاوز 3 MB. اختر صورة بحجم 3 MB أو أقل.');event.target.value='';return}
 const reader=new FileReader();
 reader.onload=async e=>{
  const dataUrl=e.target.result,watermark=document.getElementById('watermarkLayer');
  if(watermark)watermark.style.backgroundImage='url("'+dataUrl+'")';saveState();
  try{
   const remoteUrl=await uploadThemeAsset(file,'background');
   if(remoteUrl){if(watermark)watermark.style.backgroundImage='url("'+remoteUrl+'")';saveState()}
  }catch(err){console.info('Remote background sync unavailable; local background retained')}
 };
 reader.readAsDataURL(file);
}
async function uploadThemeAsset(file,type){
 const r=await fetch(THEME_API.replace('/api/theme','/api/asset?type='+encodeURIComponent(type)),{method:'PUT',headers:{'Content-Type':file.type||'application/octet-stream'},body:file});
 if(!r.ok)throw new Error('asset upload failed: '+r.status);
 const data=await r.json();return data?.url||'';
}
function setDefaultWatermark(){const layer=document.getElementById('watermarkLayer');if(!layer||layer.style.backgroundImage)return;layer.style.backgroundImage='url("../assets/Saedy_Dental_Logo.svg")'}
function calculateFinancials(persist=true){const paid=Number.parseFloat(document.getElementById('digitalPaidAmount').value)||0,total=Number.parseFloat(document.getElementById('digitalTotal').value)||0;document.getElementById('digitalPaidTable').value=paid;document.getElementById('digitalBalance').value=total-paid;if(persist)saveState()}
function getPaymentMethod(){return document.querySelector('input[name="paymentMethod"]:checked')?.value||''}
function receiptData(){
 const v=id=>document.getElementById(id)?.value||'';
 const method=getPaymentMethod();
 return {clientName:v('digitalClientName')||'العميل الكريم',clientPhone:v('digitalClientPhone')||'---',paid:v('digitalPaidAmount')||'0',total:v('digitalTotal')||'0',balance:v('digitalBalance')||'0',date:v('digitalDate')||localISODate(),receiptNo:v('digitalReceiptNo')||'---',paymentRef:v('digitalPayRef')||'---',method:method==='cash'?'نقداً':method==='wallet-bank'?'محفظة / تحويل بنكي':'غير محددة',tooth:v('digitalTooth')||'---',words:v('digitalTafqeet')||'---'}
}
function receiptText(){
 const d=receiptData();
 return '*سند قبض مالي - ALSSAEDY CLINIC FOR DENTISTRY*\nد/.صلاح الدين السعيدي\nرقم السند: '+d.receiptNo+'\nالتاريخ: '+d.date+'\nالمريض: '+d.clientName+'\nرقم العميل: '+d.clientPhone+'\n------------------------------\nالمبلغ المدفوع: '+d.paid+' ريال يمني\nإجمالي الحساب: '+d.total+' ريال يمني\nالمتبقي: '+d.balance+' ريال يمني\nطريقة الدفع: '+d.method+'\nمرجع الدفع: '+d.paymentRef+'\nرقم السن/الموضع: '+d.tooth+'\nالمبلغ كتابة: '+d.words+'\n------------------------------\nشكراً لثقتكم بنا، مع تمنياتنا لكم بدوام الصحة والعافية.\nريمة – كسمة – عزلة الضبارة\n+967 716 339 366 | +967 739 550 138 | +967 775 956 520'
}
function openShareMenu(){const m=document.getElementById('shareModal');m.classList.add('open');m.setAttribute('aria-hidden','false');document.getElementById('shareStatus').textContent=''}
function closeShareMenu(){const m=document.getElementById('shareModal');m.classList.remove('open');m.setAttribute('aria-hidden','true')}
function shareReceiptText(){
 const msg=receiptText();
 closeShareMenu();
 const waUrl='https://wa.me/?text='+encodeURIComponent(msg);
 if(/Android|iPhone|iPad/i.test(navigator.userAgent)){window.open(waUrl,'_blank','noopener,noreferrer')}
 else if(navigator.share){navigator.share({title:'سند قبض - عيادة السعيدي',text:msg}).catch(()=>{})}
 else{window.open(waUrl,'_blank','noopener,noreferrer')}
}
function setShareStatus(message){document.getElementById('shareStatus').textContent=message}
async function waitForImages(root){
 const imgs=[...root.querySelectorAll('img')];
 await Promise.all(imgs.map(img=>new Promise(resolve=>{
  if(img.complete&&img.naturalWidth>0){resolve();return}
  const done=()=>{img.removeEventListener('load',done);img.removeEventListener('error',done);resolve()};
  img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});
 })));
 if(document.fonts?.ready)await document.fonts.ready;
}
function cloneForExport(){
 const source=document.getElementById('receiptPrintArea'),clone=source.cloneNode(true);
 clone.querySelectorAll('.no-print').forEach(el=>el.remove());
 clone.querySelectorAll('input').forEach(input=>{
  const span=document.createElement('span');span.className=input.className;
  if(input.type==='checkbox'||input.type==='radio'){span.textContent=input.checked?'✓':'□';span.style.cssText='font-size:13px;font-weight:800;display:inline-block;width:18px'}
  else span.textContent=input.value||input.placeholder||'';
  input.replaceWith(span);
 });
 clone.querySelectorAll('[contenteditable]').forEach(el=>el.removeAttribute('contenteditable'));
 return clone;
}
function createExportMount(){
 const d=exportDimensions(),mount=document.createElement('div');
 mount.dataset.size=document.body.dataset.size||'a5';mount.dataset.orientation=document.body.dataset.orientation||'portrait';mount.dataset.mode=document.body.dataset.mode||'manual';mount.dataset.theme=document.body.dataset.theme||'classic';
 mount.style.cssText='position:fixed;left:-100000px;top:0;width:'+d.width+'mm;height:'+d.height+'mm;background:#fff;overflow:hidden;z-index:-1;direction:rtl';
 const node=cloneForExport();node.style.width=d.width+'mm';node.style.height=d.height+'mm';node.style.margin='0';node.style.boxShadow='none';node.style.border='0';
 mount.appendChild(node);document.body.appendChild(mount);return{mount,node,d};
}
async function receiptPNG(type='png'){
 const {mount,node}=createExportMount();
 try{
  await waitForImages(node);
  const r=node.getBoundingClientRect(),width=Math.max(1,Math.ceil(r.width)),height=Math.max(1,Math.ceil(r.height));
  const canvas=await html2canvas(node,{scale:4,useCORS:true,allowTaint:false,backgroundColor:'#fff',width,height,windowWidth:width,windowHeight:height,scrollX:0,scrollY:0});
  return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Canvas export failed')),type==='jpeg'?'image/jpeg':'image/png',1));
 }finally{mount.remove()}
}
async function buildPDFBlob(){
 if(typeof html2pdf==='undefined')throw new Error('html2pdf unavailable');
 const {mount,node,d}=createExportMount();
 try{
  await waitForImages(node);
  const opt={margin:0,filename:'ALSSAEDY-Receipt.pdf',image:{type:'png',quality:1},html2canvas:{scale:4,useCORS:true,allowTaint:false,backgroundColor:'#fff',scrollX:0,scrollY:0},jsPDF:{unit:'mm',format:[d.width,d.height],orientation:d.orientation,compress:true}};
  return await html2pdf().set(opt).from(node).toPdf().outputPdf('blob');
 }finally{mount.remove()}
}
function toggleActionPanel(id,force){document.querySelectorAll('.action-panel').forEach(x=>{if(x.id!==id)x.hidden=true});const p=document.getElementById(id);if(!p)return;p.hidden=typeof force==='boolean'?!force:!p.hidden}
function closeActionPanels(){document.querySelectorAll('.action-panel').forEach(x=>x.hidden=true)}
function printReceipt(){closeActionPanels();requestAnimationFrame(()=>window.print())}
function downloadPDF(){printReceipt()}
async function downloadImage(type='png'){closeActionPanels();try{const blob=await receiptPNG(type);const ext=type==='jpeg'?'jpg':'png';const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='ALSSAEDY-Receipt.'+ext;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)}catch(e){console.error(e);alert('تعذر إنشاء الصورة على هذا المتصفح.')}}
function exportDimensions(){const size=document.body.dataset.size||'a5',o=document.body.dataset.orientation==='landscape'?'landscape':'portrait';if(size==='thermal')return{width:80,height:190,orientation:'portrait'};const b=size==='a4'?{w:210,h:297}:{w:148,h:210};return o==='landscape'?{width:b.h,height:b.w,orientation:'landscape'}:{width:b.w,height:b.h,orientation:'portrait'}}
async function downloadPDFFile(){
 closeActionPanels();
 try{const blob=await buildPDFBlob(),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ALSSAEDY-Receipt.pdf';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
 catch(e){console.error(e);alert('تعذر إنشاء ملف PDF. استخدم خيار الطباعة ثم اختر حفظ كـ PDF.')}
}
async function shareReceiptPDF(){
 closeShareMenu();closeActionPanels();
 try{
  const blob=await buildPDFBlob(),file=new File([blob],'ALSSAEDY-Receipt.pdf',{type:'application/pdf'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'سند قبض - عيادة السعيدي'});return}
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  alert('تم إنشاء ملف PDF. اختره من قائمة مشاركة الجهاز لإرساله عبر WhatsApp.');
 }catch(e){console.error(e);alert('تعذر مشاركة ملف PDF.')}
}
window.addEventListener('keydown',e=>{if(e.key==='Escape')closeShareMenu()});
window.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.theme-btn').forEach(b=>b.addEventListener('click',()=>setTheme(b.dataset.theme)));
 document.getElementById('fontFamilyControl')?.addEventListener('change',e=>setFontFamily(e.target.value));
 document.getElementById('fontSizeControl')?.addEventListener('input',e=>setFontScale(Number(e.target.value)/100));
 const logo=document.getElementById('logoUploader'),bg=document.getElementById('bgUploader');logo?.addEventListener('change',uploadLogo);bg?.addEventListener('change',uploadBackground);
 applySavedState();setDefaultWatermark();if(!document.body.dataset.orientation)setOrientation('portrait',false);
 document.querySelectorAll('.live-input').forEach(el=>{el.addEventListener('input',()=>{if(el.id==='digitalPaidAmount'||el.id==='digitalTotal')calculateFinancials(false);saveState()});el.addEventListener('change',saveState)});
 document.querySelectorAll('.check-interactive').forEach(el=>el.addEventListener('change',saveState));
 document.querySelectorAll('.editable').forEach(el=>{
   el.addEventListener('input',()=>{if(isEditing)saveState()});
   el.addEventListener('paste',e=>{e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'))})
 });
 const date=document.getElementById('digitalDate');if(date&&!date.value)date.value=localISODate();
 setSize(document.body.dataset.size||'a5',false);setTheme(document.body.dataset.theme||'classic',false);calculateFinancials(false);bootTheme();
});

async function bootTheme(){try{await loadRemoteTheme()}finally{bootstrapDone=true}}
async function loadRemoteTheme(){
 try{
  const r=await fetch(THEME_API,{cache:'no-store'});if(!r.ok)return;
  const remote=await r.json(),local=JSON.parse(localStorage.getItem(THEME_SYNC_KEY)||'null');
  const remoteTime=Number(remote?.updatedAt||0),localTime=Number(local?.updatedAt||0);
  if(remote?.state&&remoteTime>=localTime){
   localStorage.setItem(STORAGE_KEY,JSON.stringify({...remote.state,version:7}));
   localStorage.setItem(THEME_SYNC_KEY,JSON.stringify({updatedAt:remoteTime,state:remote.state}));
   applyStateObject(remote.state);
  }else if(local?.state&&localTime>remoteTime)await syncThemeToServer();
 }catch(e){console.info('Remote theme unavailable; local state retained')}
}
function applyStateObject(s){
 applyingRemoteTheme=true;
 try{
  if(s.mode)setMode(s.mode,false);if(s.size)setSize(s.size,false);if(s.theme)setTheme(s.theme,false);if(s.orientation)setOrientation(s.orientation,false);
  if(s.fontFamily)setFontFamily(s.fontFamily,false);if(s.fontScale)setFontScale(Number(s.fontScale)||1,false);if(s.textColor)setTextColor(s.textColor,false);
  Object.entries(s.inputs||{}).forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.value=v});
  (s.checks||[]).forEach((x,i)=>{const e=document.querySelectorAll('.check-interactive')[i];if(e)e.checked=!!x.checked});
  Object.entries(s.texts||{}).forEach(([k,v])=>{const e=document.querySelector('.editable[data-key="'+CSS.escape(k)+'"]');if(e)e.textContent=v});
  const l=document.getElementById('clinicLogoImg'),w=document.getElementById('watermarkLayer');
  if(s.logo&&l)l.src=s.logo;if(s.watermark&&w)w.style.backgroundImage=s.watermark;
  calculateFinancials(false);
 }finally{applyingRemoteTheme=false}
}
async function syncThemeToServer(){
 if(applyingRemoteTheme)return;
 try{
  const state=getState();
  if(/^data:/i.test(state.logo||''))delete state.logo;
  if(/^data:/i.test(state.watermark||''))delete state.watermark;
  const updatedAt=Date.now(),r=await fetch(THEME_API,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({updatedAt,state})});
  if(!r.ok)throw new Error('sync failed: '+r.status);
  localStorage.setItem(THEME_SYNC_KEY,JSON.stringify({updatedAt,state:getState()}));
 }catch(e){console.info('Theme sync unavailable; saved locally')}
}
