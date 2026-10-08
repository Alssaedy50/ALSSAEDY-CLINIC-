/* AQSA7 Data Repository — single durable source for clinic records. */
const CLINIC_DB_NAME = typeof window.aqsa7GetInstanceStorageConfig === 'function'
  ? window.aqsa7GetInstanceStorageConfig().databaseName
  : 'ALSSAEDY_CLINIC_DB';
const CLINIC_DB_VERSION = 3;
const CLINIC_DB_STORES = ['receipts','patients','settings'];
const TENANT_SCOPED_STORES = new Set(['receipts','patients']);

function assertOwnedRecord(item, options){
  if (!TENANT_SCOPED_STORES.has(options?.store || '')) return item;
  if (typeof window.aqsa7OwnRecord !== 'function') return item;
  return window.aqsa7OwnRecord(item, {allowUnscoped: options?.allowUnscoped !== false});
}

function isOwnedRecord(item){
  try {
    assertOwnedRecord(item, {store:'receipts', allowUnscoped:false});
    return true;
  } catch (_) {
    return false;
  }
}

function clinicDBOpen(){
  if(window.__clinicDBPromise) return window.__clinicDBPromise;
  window.__clinicDBPromise = new Promise((resolve,reject)=>{
    const req = indexedDB.open(CLINIC_DB_NAME, CLINIC_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      CLINIC_DB_STORES.forEach(store => {
        if(!db.objectStoreNames.contains(store)) db.createObjectStore(store,{keyPath:'id'});
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return window.__clinicDBPromise;
}

async function clinicDBAll(store){
  const db=await clinicDBOpen();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readonly'), req=tx.objectStore(store).getAll();
    req.onsuccess=()=>resolve(req.result||[]);
    req.onerror=()=>reject(req.error);
  });
}
async function clinicDBPut(store,item){
  item = assertOwnedRecord(item, {store, allowUnscoped:true});
  const db=await clinicDBOpen();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readwrite');
    tx.objectStore(store).put(item);
    tx.oncomplete=()=>resolve(item);
    tx.onerror=()=>reject(tx.error);
  });
}
async function clinicDBDelete(store,id){
  const db=await clinicDBOpen();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readwrite');
    tx.objectStore(store).delete(id);
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error);
  });
}
async function clinicDBClear(store){
  const db=await clinicDBOpen();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readwrite');
    tx.objectStore(store).clear();
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error);
  });
}

/* In-memory read cache: a projection of IndexedDB, never a second persistence store. */
window.__clinicRepository = window.__clinicRepository || {
  receipts: [],
  patients: [],
  settings: {},
  hydrated: false
};

async function clinicRepositoryHydrate(){
  const repo=window.__clinicRepository;
  const stamp = item => (typeof window.aqsa7StampRecord === 'function' ? window.aqsa7StampRecord(item) : item);
  const receipts=await clinicDBAll('receipts');
  const patients=await clinicDBAll('patients');
  const legacyReceipts=readLegacyArray('alssaedy_receipts_history');
  const legacyPatients=readLegacyArray('alssaedy_patients');
  const rejected=[];
  const normalizeExisting=(items,store)=>{
    const accepted=[];
    for(const item of items){
      try{
        const owned=assertOwnedRecord(item,{store,allowUnscoped:true});
        accepted.push(owned);
      }catch(error){
        rejected.push({store,id:item?.id||'',reason:error.message});
      }
    }
    return accepted;
  };
  const ownedReceipts=normalizeExisting(receipts,'receipts');
  const ownedPatients=normalizeExisting(patients,'patients');
  const receiptIds=new Set(ownedReceipts.map(item=>String(item.id)));
  for(const item of legacyReceipts){
    if(item?.id && !receiptIds.has(String(item.id))){
      try{ await clinicDBPut('receipts',item); receiptIds.add(String(item.id)); }
      catch(error){ rejected.push({store:'receipts',id:item.id,reason:error.message}); }
    }
  }
  const patientIds=new Set(ownedPatients.map(item=>String(item.id)));
  for(const item of legacyPatients){
    if(item?.id && !patientIds.has(String(item.id))){
      try{ await clinicDBPut('patients',item); patientIds.add(String(item.id)); }
      catch(error){ rejected.push({store:'patients',id:item.id,reason:error.message}); }
    }
  }
  repo.receipts=[];
  for(const item of await clinicDBAll('receipts')){
    try{ repo.receipts.push(assertOwnedRecord(item,{store:'receipts',allowUnscoped:true})); }
    catch(_){ /* already recorded in rejected list above */ }
  }
  repo.patients=[];
  for(const item of await clinicDBAll('patients')){
    try{ repo.patients.push(assertOwnedRecord(item,{store:'patients',allowUnscoped:true})); }
    catch(_){ /* already recorded in rejected list above */ }
  }
  for (const item of repo.receipts) await clinicDBPut('receipts', item);
  for (const item of repo.patients) await clinicDBPut('patients', item);
  repo.isolation = {
    productId: typeof window.aqsa7GetInstanceIdentity==='function' ? window.aqsa7GetInstanceIdentity().productId : '',
    tenantId: typeof window.aqsa7GetInstanceIdentity==='function' ? window.aqsa7GetInstanceIdentity().tenantId : '',
    instanceId: typeof window.aqsa7GetInstanceIdentity==='function' ? window.aqsa7GetInstanceIdentity().instanceId : '',
    rejectedRecords: rejected
  };
  const durableSettings=await clinicDBAll('settings');
  const settingsById=Object.fromEntries(durableSettings.filter(x=>x?.id).map(x=>[x.id,x.value]));
  const legacySettings = {
    customLogo: localStorage.getItem('alssaedy_custom_logo') || '',
    currency: localStorage.getItem('alssaedy_currency') || '',
    receiptSize: localStorage.getItem('alssaedy_receipt_size') || '',
    receiptTexts: localStorage.getItem('alssaedy_texts') || ''
  };
  for (const [id, value] of Object.entries(legacySettings)) {
    if (!value || settingsById[id]) continue;
    await clinicDBPut('settings',{id,value,updatedAt:new Date().toISOString()});
    settingsById[id]=value;
  }
  repo.settings=settingsById;
  repo.hydrated=true;
  /* Legacy mirrors are migration inputs only; durable data now lives in IndexedDB. */
  if(repo.receipts.length) localStorage.removeItem('alssaedy_receipts_history');
  if(repo.patients.length) localStorage.removeItem('alssaedy_patients');
  if(repo.settings.customLogo) localStorage.removeItem('alssaedy_custom_logo');
  if(repo.settings.currency) localStorage.removeItem('alssaedy_currency');
  if(repo.settings.receiptSize) localStorage.removeItem('alssaedy_receipt_size');
  if(repo.settings.receiptTexts) localStorage.removeItem('alssaedy_texts');
  return repo;
}
function readLegacyArray(key){
  try{
    const value=JSON.parse(localStorage.getItem(key)||'[]');
    return Array.isArray(value)?value:[];
  }catch(_){return [];}
}
function clinicRepositoryReceipts(){
  return window.__clinicRepository.receipts.slice();
}
function clinicRepositoryPatients(){
  return window.__clinicRepository.patients.slice();
}
async function clinicRepositoryPutReceipt(item){
  item = assertOwnedRecord(item, {store:'receipts', allowUnscoped:true});
  await clinicDBPut('receipts',item);
  const repo=window.__clinicRepository;
  const index=repo.receipts.findIndex(x=>x.id===item.id);
  if(index>=0) repo.receipts[index]=item; else repo.receipts.push(item);
  return item;
}
async function clinicRepositoryDeleteReceipt(id){
  await clinicDBDelete('receipts',id);
  window.__clinicRepository.receipts=window.__clinicRepository.receipts.filter(x=>String(x.id)!==String(id));
}
async function clinicRepositoryClearReceipts(){
  await clinicDBClear('receipts');
  window.__clinicRepository.receipts=[];
}
async function clinicRepositoryPutPatient(item){
  item = assertOwnedRecord(item, {store:'patients', allowUnscoped:true});
  await clinicDBPut('patients',item);
  const repo=window.__clinicRepository;
  const index=repo.patients.findIndex(x=>x.id===item.id);
  if(index>=0) repo.patients[index]=item; else repo.patients.push(item);
  return item;
}

async function hydrateDurableReceipts(){ return clinicRepositoryHydrate(); }

function clinicRepositoryGetSettingSync(id){ return window.__clinicRepository.settings?.[id] ?? ''; }
async function clinicRepositoryPutSetting(id,value){
  const item={id:String(id),value:String(value??''),updatedAt:new Date().toISOString()};
  await clinicDBPut('settings',item);
  window.__clinicRepository.settings[item.id]=item.value;
  return item.value;
}
async function clinicRepositoryDeleteSetting(id){
  await clinicDBDelete('settings',String(id));
  delete window.__clinicRepository.settings[String(id)];
}

function clinicRepositoryGetSettingsSync(){
  return {...(window.__clinicRepository.settings || {})};
}
async function clinicRepositoryPutSettings(values){
  const entries=Object.entries(values||{});
  for(const [id,value] of entries) await clinicRepositoryPutSetting(id,value);
  return clinicRepositoryGetSettingsSync();
}
