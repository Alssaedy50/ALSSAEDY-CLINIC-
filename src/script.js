const STORAGE_KEY='alssaedy_receipt_state_v5';
let isEditing=false;

function localISODate(){const now=new Date(),offset=now.getTimezoneOffset();return new Date(now.getTime()-offset*60000).toISOString().slice(0,10)}
function getState(){
 const inputs={};document.querySelectorAll('.live-input').forEach(el=>{if(el.id)inputs[el.id]=el.value});
 const checks=Array.from(document.querySelectorAll('.check-interactive')).map(el=>({name:el.name||'',value:el.value||'',checked:el.checked}));
 const texts={};document.querySelectorAll('.editable').forEach(el=>{if(el.dataset.key)texts[el.dataset.key]=el.textContent});
 return {version:5,mode:document.body.dataset.mode||'manual',size:document.body.dataset.size||'a5',theme:document.body.dataset.theme||'classic',inputs,checks,texts,logo:document.getElementById('clinicLogoImg')?.src||'',watermark:document.getElementById('watermarkLayer')?.style.backgroundImage||''}
}
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(getState()))}catch(e){console.error('Unable to save receipt state:',e)}}
function applySavedState(){
 let state;try{state=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')}catch(e){return}
 if(!state||![4,5].includes(state.version))return;
 if(state.mode)setMode(state.mode,false);if(state.size)setSize(state.size,false);if(state.theme)setTheme(state.theme,false);
 Object.entries(state.inputs||{}).forEach(([id,value])=>{const el=document.getElementById(id);if(el)el.value=value});
 const checks=document.querySelectorAll('.check-interactive');(state.checks||[]).forEach((saved,i)=>{if(checks[i])checks[i].checked=!!saved.checked});
 Object.entries(state.texts||{}).forEach(([key,value])=>{const el=document.querySelector('.editable[data-key="'+CSS.escape(key)+'"]');if(el)el.textContent=value});
 const logo=document.getElementById('clinicLogoImg'),watermark=document.getElementById('watermarkLayer');
 if(state.logo&&logo)logo.src=state.logo;
 if(state.watermark&&watermark)watermark.style.backgroundImage=state.watermark;
 setDefaultWatermark();
 calculateFinancials(false);
}
function setMode(mode,persist=true){document.body.dataset.mode=mode;document.getElementById('btnModeManual').classList.toggle('active',mode==='manual');document.getElementById('btnModeDigital').classList.toggle('active',mode==='digital');if(mode==='digital'){const d=document.getElementById('digitalDate');if(d&&!d.value)d.value=localISODate()}if(persist)saveState()}
function setSize(size,persist=true){document.body.dataset.size=size;document.body.style.page=size==='a5'?'receipt-a5':size==='a4'?'receipt-a4':'receipt-thermal';['a5','a4','thermal'].forEach(s=>document.getElementById('btnSize'+s[0].toUpperCase()+s.slice(1)).classList.toggle('active',s===size));if(persist)saveState()}
function setTheme(theme,persist=true){document.body.dataset.theme=theme;document.querySelectorAll('.theme-btn').forEach(b=>b.classList.toggle('active',b.dataset.theme===theme));if(persist)saveState()}
function toggleEditMode(){
 isEditing=!isEditing;document.body.classList.toggle('is-editing',isEditing);
 const btn=document.getElementById('btnEdit');btn.textContent=isEditing?'💾 حفظ التعديلات':'✏️ تعديل النصوص';btn.style.background=isEditing?'#059669':'#f59e0b';
 document.querySelectorAll('.editable').forEach(el=>{el.contentEditable=isEditing?'true':'false';el.spellcheck=false});
 if(!isEditing)saveState();
}
function triggerLogoUpload(){document.getElementById('logoUploader')?.click()}
function uploadLogo(event){const file=event.target.files?.[0];if(!file||!file.type.startsWith('image/'))return;const reader=new FileReader();reader.onload=e=>{document.getElementById('clinicLogoImg').src=e.target.result;setDefaultWatermark();saveState()};reader.readAsDataURL(file)}
function uploadBackground(event){const file=event.target.files?.[0];if(!file||!file.type.startsWith('image/'))return;const reader=new FileReader();reader.onload=e=>{document.getElementById('watermarkLayer').style.backgroundImage='url("'+e.target.result+'")';saveState()};reader.readAsDataURL(file)}
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
function cloneForExport(){
 const clone=document.getElementById('receiptPrintArea').cloneNode(true);
 clone.querySelectorAll('.no-print').forEach(el=>el.remove());
 clone.querySelectorAll('input').forEach(input=>{
   const span=document.createElement('span');span.className=input.className;
   if(input.type==='checkbox'||input.type==='radio'){span.textContent=input.checked?'✓':'□';span.style.cssText='font-size:13px;font-weight:800;display:inline-block;width:18px'}
   else{span.textContent=input.value||input.placeholder||''}
   input.replaceWith(span);
 });
 clone.querySelectorAll('[contenteditable]').forEach(el=>el.removeAttribute('contenteditable'));
 return clone;
}
async function receiptPNG(){
 const node=cloneForExport(),rect=document.getElementById('receiptPrintArea').getBoundingClientRect();
 const width=Math.max(1,Math.round(rect.width)),height=Math.max(1,Math.round(rect.height)),scale=2;
 node.style.width=width+'px';node.style.height=height+'px';node.style.margin='0';node.style.boxShadow='none';node.style.border='0';
 const css=[...document.styleSheets].map(sheet=>{try{return [...sheet.cssRules].map(r=>r.cssText).join('\n')}catch(e){return''}}).join('\n');
 const html=node.outerHTML.replace(/<img([^>]+)src="\.\.\/assets\/([^"]+)"/g,(m,a,f)=>'<img'+a+'src="'+new URL('../assets/'+f,location.href).href+'"');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+(width*scale)+'" height="'+(height*scale)+'" viewBox="0 0 '+width+' '+height+'"><foreignObject width="100%" height="100%"><style>'+css.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</style><div xmlns="http://www.w3.org/1999/xhtml">'+html+'</div></foreignObject></svg>';
 const blob=new Blob([svg],{type:'image/svg+xml'}),url=URL.createObjectURL(blob);
 try{
   const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=url});
   const canvas=document.createElement('canvas');canvas.width=width*scale;canvas.height=height*scale;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
   return await new Promise(resolve=>canvas.toBlob(resolve,'image/png',1));
 }finally{URL.revokeObjectURL(url)}
}
async function shareReceiptImage(){
 closeShareMenu();
 try{
   setTimeout(async()=>{
    try{
     const blob=await receiptPNG();const file=new File([blob],'ALSSAEDY-Receipt.png',{type:'image/png'});
     if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'سند قبض - عيادة السعيدي'});return}
     const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ALSSAEDY-Receipt.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch(e){alert('تعذر إنشاء/مشاركة صورة السند على هذا المتصفح. يمكنك استخدام الطباعة ثم حفظ PDF.')}
   },0);
 }catch(e){alert('تعذر إنشاء صورة السند.')}
}
function printReceipt(){window.print()}
function shareReceiptPDF(){closeShareMenu();setTimeout(()=>window.print(),120)}
window.addEventListener('keydown',e=>{if(e.key==='Escape')closeShareMenu()});
window.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.theme-btn').forEach(b=>b.addEventListener('click',()=>setTheme(b.dataset.theme)));
 const logo=document.getElementById('logoUploader'),bg=document.getElementById('bgUploader');logo?.addEventListener('change',uploadLogo);bg?.addEventListener('change',uploadBackground);
 applySavedState();setDefaultWatermark();
 document.querySelectorAll('.live-input').forEach(el=>{el.addEventListener('input',()=>{if(el.id==='digitalPaidAmount'||el.id==='digitalTotal')calculateFinancials(false);saveState()});el.addEventListener('change',saveState)});
 document.querySelectorAll('.check-interactive').forEach(el=>el.addEventListener('change',saveState));
 document.querySelectorAll('.editable').forEach(el=>{
   el.addEventListener('input',()=>{if(isEditing)saveState()});
   el.addEventListener('paste',e=>{e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'))})
 });
 const date=document.getElementById('digitalDate');if(date&&!date.value)date.value=localISODate();
 setSize(document.body.dataset.size||'a5',false);setTheme(document.body.dataset.theme||'classic',false);calculateFinancials(false);saveState();
});