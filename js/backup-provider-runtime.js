(function(){
  'use strict';

  const CONTRACT = Object.freeze({
    contractId:'aqsa7-backup-provider-runtime',
    schemaVersion:1,
    providerIndependent:true,
    enabledByDefault:false,
    persistence:'memory-only',
    secretStorage:false
  });

  const registry = new Map();

  function assertAdapter(adapter){
    return window.aqsa7ValidateBackupProviderAdapter(adapter);
  }

  function register(adapter){
    const descriptor = assertAdapter(adapter);
    if(registry.has(descriptor.id)) throw new Error('AQSA7_BACKUP_PROVIDER_DUPLICATE:'+descriptor.id);
    registry.set(descriptor.id, adapter);
    return descriptor;
  }

  function unregister(providerId){
    return registry.delete(String(providerId));
  }

  function get(providerId){
    const adapter = registry.get(String(providerId));
    if(!adapter) throw new Error('AQSA7_BACKUP_PROVIDER_NOT_REGISTERED:'+providerId);
    return adapter;
  }

  function list(){
    return Object.freeze([...registry.values()].map(adapter => Object.freeze({...adapter.getDescriptor(),operations:Object.freeze([...adapter.getDescriptor().operations])})));
  }

  async function health(providerId, identity){
    const adapter = get(providerId);
    const descriptor = assertAdapter(adapter);
    const result = await window.aqsa7ExecuteBackupProvider(adapter,'health',identity);
    return Object.freeze({...result,providerId:descriptor.id});
  }

  function clear(){ registry.clear(); }

  window.AQSA7_BACKUP_PROVIDER_RUNTIME_CONTRACT = CONTRACT;
  window.aqsa7BackupProviderRuntime = Object.freeze({register,unregister,get,list,health,clear});
})();
