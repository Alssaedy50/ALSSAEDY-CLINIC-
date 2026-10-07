/* AQSA7 Data Repository — single durable source for clinic records. */
const CLINIC_DB_NAME = 'ALSSAEDY_CLINIC_DB';
const CLINIC_DB_VERSION = 3;
const CLINIC_DB_STORES = ['receipts','patients','settings'];

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
  hydrated: false
};

async function clinicRepositoryHydrate(){
  const repo=window.__clinicRepository;
  const receipts=await clinicDBAll('receipts');
  const patients=await clinicDBAll('patients');
  if(!receipts.length){
    const legacy=readLegacyArray('alssaedy_receipts_history');
    for(const item of legacy) await clinicDBPut('receipts',item);
  }
  if(!patients.length){
    const legacy=readLegacyArray('alssaedy_patients');
    for(const item of legacy) await clinicDBPut('patients',item);
  }
  repo.receipts=await clinicDBAll('receipts');
  repo.patients=await clinicDBAll('patients');
  repo.hydrated=true;
  /* Legacy mirrors are migration inputs only; durable data now lives in IndexedDB. */
  if(receipts.length || repo.receipts.length) localStorage.removeItem('alssaedy_receipts_history');
  if(patients.length || repo.patients.length) localStorage.removeItem('alssaedy_patients');
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
  await clinicDBPut('patients',item);
  const repo=window.__clinicRepository;
  const index=repo.patients.findIndex(x=>x.id===item.id);
  if(index>=0) repo.patients[index]=item; else repo.patients.push(item);
  return item;
}
async function clinicRepositoryHydratePatients(){
  window.__clinicRepository.patients=await clinicDBAll('patients');
  return clinicRepositoryPatients();
}

async function hydrateDurableReceipts(){ return clinicRepositoryHydrate(); }
