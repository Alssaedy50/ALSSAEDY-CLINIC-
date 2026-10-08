/* AQSA7 Product Boundary — reusable product manifest + configured instance. */
window.AQSA7_PRODUCT_MANIFEST = Object.freeze({
  schemaVersion: 1, productId: 'dental-clinic', productName: 'AQSA7 Dental Clinic',
  platformId: 'AQSA7', productVersion: '1.0', category: 'healthcare', vertical: 'dental',
  capabilities: Object.freeze(['receipts','patients','patient-accounts','history','settings','local-backup','print-pdf','image-export','sharing']),
  optionalCapabilities: Object.freeze(['ai','cloud-backup','integrations','sync']),
  storage: Object.freeze({primary:'indexeddb', backup:'encrypted-json', databaseName:'ALSSAEDY_CLINIC_DB'})
});
window.AQSA7_CLINIC_CONFIG = Object.freeze({
  schemaVersion: 1, instanceId: 'alssaedy-clinic-sana-a', tenantId: 'alssaedy-clinic', productId: 'dental-clinic',
  identity: Object.freeze({
    nameAr:'عيادة د/ صلاح الدين السعيدي', nameEn:'ALSSAEDY CLINIC FOR DENTISTRY',
    doctorNameAr:'د. صلاح الدين السعيدي', doctorNameEn:'Dr. Salahaldeen Alssaedy',
    specialtyAr:'طب وجراحة الفم والأسنان', specialtyEn:'Dentistry', logo:'assets/Saedy_Dental_Logo.svg'
  }),
  locale: Object.freeze({language:'ar', direction:'rtl', country:'YE', timezone:'Asia/Aden'}),
  defaults: Object.freeze({currency:'YER', receiptSize:'a5', theme:'classic', watermark:'on'})
});
function aqsa7GetProductManifest(){ return window.AQSA7_PRODUCT_MANIFEST; }
function aqsa7GetClinicConfig(){ return window.AQSA7_CLINIC_CONFIG; }
function aqsa7StampRecord(record){
  const product=aqsa7GetProductManifest(), clinic=aqsa7GetClinicConfig();
  return {...record, productId:record?.productId||product.productId, tenantId:record?.tenantId||clinic.tenantId, instanceId:record?.instanceId||clinic.instanceId};
}
function aqsa7ApplyClinicIdentity(){
  const c=aqsa7GetClinicConfig(), i=c.identity;
  document.documentElement.lang=c.locale.language; document.documentElement.dir=c.locale.direction;
  const brand=document.querySelector('.brand-title'); if(brand) brand.textContent=i.nameAr;
  const badge=document.querySelector('.brand-badge:not(.count-badge)'); if(badge) badge.textContent='Dental Clinic';
  const logo=document.getElementById('clinicLogoImg'); if(logo){logo.src=i.logo;logo.alt='شعار '+i.nameAr;}
  const values={clinic_en:i.nameEn,doc_en:i.doctorNameEn,doc_name:i.doctorNameAr,doc_spec:i.specialtyAr};
  Object.entries(values).forEach(([key,value])=>{const el=document.querySelector('[data-key="'+key+'"]');if(el)el.textContent=value;});
}
window.aqsa7StampRecord=aqsa7StampRecord; window.aqsa7GetProductManifest=aqsa7GetProductManifest; window.aqsa7GetClinicConfig=aqsa7GetClinicConfig;
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',aqsa7ApplyClinicIdentity,{once:true}); else aqsa7ApplyClinicIdentity();
