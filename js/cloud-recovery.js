/* AQSA7 Cloud Recovery — provider-neutral recovery orchestration.
 * Local IndexedDB remains authoritative. Cloud data is read only as disaster-recovery input.
 * No cloud artifact, password, token or provider credential is persisted here.
 */
(function(){
  'use strict';
  const CONTRACT=Object.freeze({
    contractId:'aqsa7-cloud-recovery',
    schemaVersion:1,
    providerIndependent:true,
    localFirst:true,
    persistence:'none',
    source:'backup-provider-adapter',
    restoreTarget:'repository-indexeddb'
  });

  function requireRuntime(){
    if(!window.aqsa7BackupProviderRuntime) throw new Error('AQSA7_BACKUP_PROVIDER_RUNTIME_UNAVAILABLE');
    return window.aqsa7BackupProviderRuntime;
  }

  function requireEngine(){
    if(!window.aqsa7BackupEngine) throw new Error('AQSA7_BACKUP_ENGINE_UNAVAILABLE');
    return window.aqsa7BackupEngine;
  }

  async function list(providerId,identity){
    const runtime=requireRuntime();
    const adapter=runtime.get(providerId);
    return window.aqsa7ExecuteBackupProvider(adapter,'list',identity);
  }

  async function recover(providerId,identity,backupId,password){
    if(!providerId || !backupId) throw new Error('AQSA7_CLOUD_RECOVERY_TARGET_REQUIRED');
    if(typeof password!=='string' || password.length<8) throw new Error('AQSA7_CLOUD_RECOVERY_PASSWORD_REQUIRED');
    const runtime=requireRuntime();
    const engine=requireEngine();
    const adapter=runtime.get(providerId);
    const fetched=await window.aqsa7ExecuteBackupProvider(adapter,'get',identity,{backupId});
    if(fetched.status!=='success') return fetched;
    const artifact=await engine.decryptAndValidate(fetched.artifact,password);
    return engine.restoreArtifact(artifact);
  }

  window.AQSA7_CLOUD_RECOVERY_CONTRACT=CONTRACT;
  window.aqsa7CloudRecovery=Object.freeze({list,recover});
})();
