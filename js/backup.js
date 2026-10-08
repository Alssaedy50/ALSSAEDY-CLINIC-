/* AQSA7 Generic Backup Engine — orchestration only; persistence remains Repository/IndexedDB-owned. */
(function(){
  'use strict';

  const CONTRACT = Object.freeze({
    id: 'aqsa7-backup-engine',
    version: 1,
    artifactType: 'AQSA7_BACKUP_ARTIFACT',
    artifactVersion: 1,
    schema: 'AQSA7_PRODUCT_BACKUP',
    schemaVersion: 5,
    persistenceOwner: 'repository-indexeddb',
    providerIndependent: true
  });

  function requireFunction(name){
    if(typeof window[name] !== 'function') throw new Error('Backup Engine dependency unavailable: '+name);
    return window[name];
  }

  function assertArtifactShape(artifact){
    if(!artifact || typeof artifact !== 'object') throw new Error('Backup artifact is invalid.');
    if(artifact.artifactType !== CONTRACT.artifactType) throw new Error('Backup artifact identity is invalid.');
    if(Number(artifact.artifactVersion) !== CONTRACT.artifactVersion) throw new Error('Backup artifact version is unsupported.');
    if(artifact.schema !== CONTRACT.schema || Number(artifact.schemaVersion) !== CONTRACT.schemaVersion){
      throw new Error('Backup artifact schema is unsupported.');
    }
    if(!artifact.exportedAt || Number.isNaN(Date.parse(artifact.exportedAt))) throw new Error('Backup artifact timestamp is invalid.');
    const ownership=artifact.ownership;
    if(!ownership || ownership.scope!=='instance' || !ownership.productId || !ownership.tenantId || !ownership.instanceId){
      throw new Error('Backup artifact ownership is incomplete.');
    }
    if(artifact.productId!==ownership.productId || artifact.tenantId!==ownership.tenantId || artifact.instanceId!==ownership.instanceId){
      throw new Error('Backup artifact top-level ownership does not match its ownership envelope.');
    }
    if(!Array.isArray(artifact.receipts) || !Array.isArray(artifact.patients) || !artifact.settings || typeof artifact.settings!=='object'){
      throw new Error('Backup artifact payload is malformed.');
    }
    return artifact;
  }

  function assertCurrentOwnership(artifact){
    const validate=window.aqsa7ValidateBackupScope;
    if(typeof validate!=='function') throw new Error('Backup ownership validator is unavailable.');
    let result;
    try{ result=validate(artifact); }catch(e){ throw new Error(e?.message||'Backup ownership validation failed.'); }
    if(result && result.scoped===false) throw new Error('Backup is not scoped to a valid Instance.');
    return result;
  }

  async function createArtifact(){
    const build=requireFunction('aqsa7BuildFullBackup');
    const artifact=await build();
    artifact.artifactType=CONTRACT.artifactType;
    artifact.artifactVersion=CONTRACT.artifactVersion;
    assertArtifactShape(artifact);
    assertCurrentOwnership(artifact);
    return artifact;
  }

  async function exportFullBackup(){
    const artifact=await createArtifact();
    const requestPassword=requireFunction('aqsa7RequestBackupPassword');
    const encrypt=requireFunction('aqsa7EncryptBackupArtifact');
    const download=requireFunction('downloadTextFile');
    const password=requestPassword(true);
    const encrypted=await encrypt(artifact,password);
    const product=typeof window.aqsa7GetProductManifest==='function'
      ? window.aqsa7GetProductManifest()
      : {productName:'AQSA7_Product'};
    const safeName=(product.productName||'AQSA7_Product').replace(/[^A-Za-z0-9_-]+/g,'_');
    const date=typeof window.getLocalDateISO==='function' ? window.getLocalDateISO() : new Date().toISOString().slice(0,10);
    download(
      safeName+'_ENCRYPTED_BACKUP_'+date.replace(/-/g,'')+'.aqsa7.json',
      JSON.stringify(encrypted,null,2),
      'application/json'
    );
    alert('تم إنشاء النسخة الاحتياطية المشفرة. احتفظ بكلمة المرور؛ لا يتم تخزينها داخل AQSA7.');
    return encrypted;
  }

  function parseBackupFile(file){
    return file.text().then(text=>JSON.parse(text));
  }

  async function decryptAndValidate(envelope,password){
    const decrypt=requireFunction('aqsa7DecryptBackupArtifact');
    const artifact=await decrypt(envelope,password);
    assertArtifactShape(artifact);
    assertCurrentOwnership(artifact);
    return artifact;
  }

  async function restoreArtifact(artifact){
    assertArtifactShape(artifact);
    assertCurrentOwnership(artifact);

    const own=typeof window.aqsa7OwnRecord==='function'
      ? record=>window.aqsa7OwnRecord(record,{allowUnscoped:true})
      : record=>record;
    const incomingPatients=artifact.patients.map(own);
    const incomingReceipts=artifact.receipts.map(own);

    for(const record of [...incomingPatients,...incomingReceipts]){
      if(record.productId!==artifact.productId || record.tenantId!==artifact.tenantId || record.instanceId!==artifact.instanceId){
        throw new Error('Backup contains a record outside the current Instance scope.');
      }
    }

    const clear=window.clinicDBClear;
    const putPatient=window.clinicRepositoryPutPatient;
    const putReceipt=window.clinicRepositoryPutReceipt;
    const putSettings=window.clinicRepositoryPutSettings;
    if(typeof clear!=='function'||typeof putPatient!=='function'||typeof putReceipt!=='function'||typeof putSettings!=='function'){
      throw new Error('Repository restore dependencies are unavailable.');
    }

    const merge=confirm('هل تريد دمج البيانات مع البيانات الحالية؟ اضغط «إلغاء» للاستبدال الكامل.');
    if(!merge && !confirm('سيتم استبدال السجل الحالي. هل أنت متأكد؟')) return {status:'cancelled'};

    if(!merge){
      await clear('receipts');
      await clear('patients');
    }

    for(const patient of incomingPatients) await putPatient(patient);

    const existing=typeof window.clinicRepositoryReceipts==='function'
      ? window.clinicRepositoryReceipts().slice()
      : [];
    const fingerprint=typeof window.receiptFingerprint==='function'
      ? window.receiptFingerprint
      : item=>JSON.stringify(item);
    for(const receipt of incomingReceipts){
      const duplicate=existing.some(item=>fingerprint(item)===fingerprint(receipt));
      if(!duplicate){
        await putReceipt(receipt);
        existing.push(receipt);
      }
    }

    const incomingClinic=artifact.settings?.clinic || artifact.settings || {};
    await putSettings({
      ...(Object.prototype.hasOwnProperty.call(incomingClinic,'customLogo') ? {customLogo:incomingClinic.customLogo||''} : {}),
      ...(Object.prototype.hasOwnProperty.call(incomingClinic,'currency') ? {currency:incomingClinic.currency||'YER'} : {}),
      ...(Object.prototype.hasOwnProperty.call(incomingClinic,'size') ? {receiptSize:incomingClinic.size||'a5'} : {}),
      ...(Object.prototype.hasOwnProperty.call(incomingClinic,'texts') ? {receiptTexts:incomingClinic.texts||''} : {})
    });

    if(artifact.settings?.ui?.theme) localStorage.setItem('alssaedy_theme',artifact.settings.ui.theme);
    if(artifact.settings?.ui?.watermark) localStorage.setItem('alssaedy_watermark',artifact.settings.ui.watermark);

    if(typeof window.applyLogo==='function'){
      const setting=typeof window.clinicRepositoryGetSettingSync==='function'
        ? window.clinicRepositoryGetSettingSync('customLogo')
        : '';
      const fallback=typeof window.OFFICIAL_LOGO_URL==='string' ? window.OFFICIAL_LOGO_URL : '';
      window.applyLogo(setting||fallback);
    }
    if(typeof window.clinicRepositoryHydrate==='function') await window.clinicRepositoryHydrate();
    if(typeof window.updateHistoryCount==='function') window.updateHistoryCount();
    if(typeof window.renderHistory==='function') window.renderHistory();

    return {
      status:'restored',
      mode:merge?'merge':'replace',
      receipts:incomingReceipts.length,
      patients:incomingPatients.length
    };
  }

  async function importFullBackup(event){
    const file=event?.target?.files?.[0];
    if(!file) return {status:'cancelled'};
    try{
      const parsed=await parseBackupFile(file);
      if(parsed?.artifactType!==CONTRACT.artifactType || !parsed?.crypto){
        throw new Error('النسخة غير مشفرة أو غير متوافقة. استخدم نسخة AQSA7 المشفرة الجديدة.');
      }
      const requestPassword=requireFunction('aqsa7RequestBackupPassword');
      const password=requestPassword(false);
      const artifact=await decryptAndValidate(parsed,password);
      const result=await restoreArtifact(artifact);
      if(result.status==='cancelled') return result;
      alert('تمت استعادة النسخة المشفرة بنجاح مع التحقق من السلامة والملكية ومنع التكرارات.');
      return result;
    }catch(e){
      alert('تعذر استيراد النسخة: '+(e?.message||'خطأ غير معروف'));
      return {status:'error',error:e};
    }finally{
      if(event?.target) event.target.value='';
    }
  }

  const engine=Object.freeze({
    contract:CONTRACT,
    createArtifact,
    exportFullBackup,
    importFullBackup,
    decryptAndValidate,
    restoreArtifact
  });

  window.aqsa7BackupEngine=engine;
  window.AQSA7_BACKUP_ENGINE_CONTRACT=CONTRACT;
})();
