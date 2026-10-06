const STORAGE_KEY='alssaedy_receipt_state_v8';
let isEditing=false;
let bootstrapDone=false;
const ASSET_DB='alssaedy_receipt_assets_v1';
function assetDB(){return new Promise((resolve,reject)=>{if(!window.indexedDB)return reject(new Error('IndexedDB unavailable'));const r=indexedDB.open(ASSET_DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('assets');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function saveLocalAsset(key,value){try{const db=await assetDB();await new Promise((resolve,reject)=>{const tx=db.transaction('assets','readwrite');tx.objectStore('assets').put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close()}catch(e){console.info('Local asset storage unavailable')}}
async function loadLocalAsset(key){try{const db=await assetDB();const value=await new Promise((resolve,reject)=>{const tx=db.transaction('assets','readonly');const r=tx.objectStore('assets').get(key);r.onsuccess=()=>resolve(r.result||'');r.onerror=()=>reject(r.error)});db.close();return value}catch(e){return ''}}

function localISODate(){const now=new Date(),offset=now.getTimezoneOffset();return new Date(now.getTime()-offset*60000).toISOString().slice(0,10)}
function getState(){
 const inputs={};document.querySelectorAll('.live-input').forEach(el=>{if(el.id)inputs[el.id]=el.value});
 const checks=Array.from(document.querySelectorAll('.check-interactive')).map(el=>({name:el.name||'',value:el.value||'',checked:el.checked}));
 const texts={};document.querySelectorAll('.editable').forEach(el=>{if(el.dataset.key)texts[el.dataset.key]=el.textContent});
 return {version:8,orientation:document.body.dataset.orientation||'portrait',fontFamily:document.documentElement.dataset.fontFamily||'Cairo',fontScale:document.documentElement.dataset.fontScale||'1',textColor:document.documentElement.dataset.textColor||'#122033',mode:document.body.dataset.mode||'manual',size:document.body.dataset.size||'a5',theme:document.body.dataset.theme||'classic',inputs,checks,texts};
}
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(getState()))}catch(e){console.error('Unable to save receipt state:',e)}}
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
 const isImage=file&&(/^(image\/(png|jpeg|jpg|webp|gif|svg\+xml)|application\/svg\+xml)$/i.test(file.type)||/\.(png|jpe?g|webp|gif|svg)$/i.test(file.name||''));if(!isImage){event.target.value='';return}
 try{
  const url=URL.createObjectURL(file),logo=document.getElementById('clinicLogoImg'),watermark=document.getElementById('watermarkLayer');
  if(logo){logo.src=url;logo.dataset.objectUrl=url}
  if(watermark){if(watermark.dataset.objectUrl)URL.revokeObjectURL(watermark.dataset.objectUrl);watermark.style.backgroundImage='url("' + url + '")';watermark.dataset.objectUrl=url}
  await saveLocalAsset('logo',file);saveState();
 }catch(err){console.error(err);alert('تعذر حفظ الشعار محليًا.')}
 finally{event.target.value=''}
}
async function uploadBackground(event){
 const file=event.target.files?.[0];
 if(!file||!file.type.startsWith('image/')){event.target.value='';return}
 try{
  const url=URL.createObjectURL(file),watermark=document.getElementById('watermarkLayer');
  if(watermark){if(watermark.dataset.objectUrl)URL.revokeObjectURL(watermark.dataset.objectUrl);watermark.style.backgroundImage='url("' + url + '")';watermark.dataset.objectUrl=url}
  await saveLocalAsset('background',file);saveState();
 }catch(err){console.error(err);alert('تعذر حفظ الخلفية محليًا.')}
 finally{event.target.value=''}
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
async function shareReceiptImage(){
 closeShareMenu();closeActionPanels();
 try{
  const blob=await receiptPNG('png'),file=new File([blob],'ALSSAEDY-Receipt.png',{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'سند قبض - عيادة السعيدي'});return}
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  alert('تم إنشاء صورة السند. اخترها من قائمة مشاركة الجهاز لإرسالها عبر WhatsApp.');
 }catch(e){console.error(e);alert('تعذر إنشاء أو مشاركة صورة السند.')}
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
 restoreSavedState();setDefaultWatermark();if(!document.body.dataset.orientation)setOrientation('portrait',false);
 document.querySelectorAll('.live-input').forEach(el=>{el.addEventListener('input',()=>{if(el.id==='digitalPaidAmount'||el.id==='digitalTotal')calculateFinancials(false);saveState()});el.addEventListener('change',saveState)});
 document.querySelectorAll('.check-interactive').forEach(el=>el.addEventListener('change',saveState));
 document.querySelectorAll('.editable').forEach(el=>{
   el.addEventListener('input',()=>{if(isEditing)saveState()});
   el.addEventListener('paste',e=>{e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'))})
 });
 const date=document.getElementById('digitalDate');if(date&&!date.value)date.value=localISODate();
 setSize(document.body.dataset.size||'a5',false);setTheme(document.body.dataset.theme||'classic',false);calculateFinancials(false);bootTheme();
});

async function migrateLegacyAssets(){
 const logo=document.getElementById('clinicLogoImg'),watermark=document.getElementById('watermarkLayer');
 if(logo?.src&&/^data:/i.test(logo.src)){try{const blob=await (await fetch(logo.src)).blob();await saveLocalAsset('logo',blob)}catch(e){}}
 const bg=watermark?.style.backgroundImage||'',m=bg.match(/^url\(["']?(data:[^"')]+)["']?\)$/i);
 if(m){try{const blob=await (await fetch(m[1])).blob();await saveLocalAsset('background',blob)}catch(e){}}
}
async function assetToObjectURL(value){
 if(!value)return '';
 if(value instanceof Blob)return URL.createObjectURL(value);
 if(typeof value==='string'&&/^data:/i.test(value)){try{return URL.createObjectURL(await (await fetch(value)).blob())}catch(e){return ''}}
 if(typeof value==='string'&&/^blob:/i.test(value))return value;
 return '';
}
async function loadLocalAssets(){
 const logo=await loadLocalAsset('logo'),bg=await loadLocalAsset('background');
 const l=document.getElementById('clinicLogoImg'),w=document.getElementById('watermarkLayer');
 if(logo&&l){const u=await assetToObjectURL(logo);if(u){l.src=u;l.dataset.objectUrl=u}}
 if(bg&&w){const u=await assetToObjectURL(bg);if(u){w.style.backgroundImage='url("' + u + '")';w.dataset.objectUrl=u}}
}
async function bootTheme(){try{await migrateLegacyAssets();await loadLocalAssets()}catch(e){console.info('Local asset restore unavailable')}finally{bootstrapDone=true}}
function applyStateObject(s){
 if(!s)return;
 try{
  if(s.mode)setMode(s.mode,false);if(s.size)setSize(s.size,false);if(s.theme)setTheme(s.theme,false);if(s.orientation)setOrientation(s.orientation,false);
  if(s.fontFamily)setFontFamily(s.fontFamily,false);if(s.fontScale)setFontScale(Number(s.fontScale)||1,false);if(s.textColor)setTextColor(s.textColor,false);
  Object.entries(s.inputs||{}).forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.value=v});
  (s.checks||[]).forEach((x,i)=>{const e=document.querySelectorAll('.check-interactive')[i];if(e)e.checked=!!x.checked});
  Object.entries(s.texts||{}).forEach(([k,v])=>{const e=document.querySelector('.editable[data-key="'+CSS.escape(k)+'"]');if(e)e.textContent=v});
  calculateFinancials(false);
 }catch(e){console.error('State restore failed',e)}
}
function restoreSavedState(){
 try{
  const current=localStorage.getItem(STORAGE_KEY),legacy=localStorage.getItem('alssaedy_receipt_state_v7');
  const s=JSON.parse(current||legacy||'null');
  if(s)applyStateObject(s);
 }catch(e){console.error('Saved state restore failed',e)}
}catch(e){console.error('Saved state restore failed',e)}}
