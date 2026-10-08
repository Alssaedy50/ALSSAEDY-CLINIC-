/* AQSA7 Generic Backup Provider Adapter Contract — boundary only.
 * No provider SDK, OAuth flow, cloud storage, scheduling or sync implementation belongs here.
 * The Backup Engine owns artifact creation/validation; adapters own provider transport mechanics only.
 */
(function(){
  'use strict';

  const freeze = value => Object.freeze(value);
  const CONTRACT = freeze({
    contractId: 'aqsa7-backup-provider-adapter-contract',
    schemaVersion: 1,
    artifactType: 'AQSA7_BACKUP_ARTIFACT',
    artifactVersion: 1,
    providerIndependent: true,
    enabledByDefault: false,
    coreDependency: false,
    persistenceOwner: 'provider-adapter-external-storage',
    supportedOperations: freeze([
      'getDescriptor',
      'health',
      'list',
      'put',
      'get',
      'delete'
    ]),
    artifactRule: 'adapter transports opaque encrypted Backup Artifacts and must not rewrite plaintext/domain payloads',
    ownershipRule: 'provider objects must remain scoped to the supplied productId/tenantId/instanceId ownership',
    secretRule: 'credentials/tokens are resolved by a secure platform/provider boundary and never stored in this contract or source',
    localFirstRule: 'provider unavailable must never make Repository/IndexedDB unavailable'
  });

  const ERRORS = freeze([
    'UNAVAILABLE',
    'AUTH_REQUIRED',
    'FORBIDDEN',
    'NOT_FOUND',
    'RATE_LIMITED',
    'QUOTA_EXCEEDED',
    'CONFLICT',
    'INVALID_ARTIFACT',
    'NETWORK_ERROR',
    'PROVIDER_ERROR'
  ]);

  function assertIdentity(identity){
    if(!identity || !identity.productId || !identity.tenantId || !identity.instanceId){
      throw new Error('AQSA7_BACKUP_PROVIDER_INSTANCE_SCOPE_REQUIRED');
    }
    return freeze({
      productId:String(identity.productId),
      tenantId:String(identity.tenantId),
      instanceId:String(identity.instanceId)
    });
  }

  function assertArtifactEnvelope(envelope){
    if(!envelope || typeof envelope!=='object') throw new Error('AQSA7_BACKUP_PROVIDER_ARTIFACT_INVALID');
    if(envelope.artifactType!==CONTRACT.artifactType) throw new Error('AQSA7_BACKUP_PROVIDER_ARTIFACT_TYPE_UNSUPPORTED');
    if(Number(envelope.artifactVersion)!==CONTRACT.artifactVersion) throw new Error('AQSA7_BACKUP_PROVIDER_ARTIFACT_VERSION_UNSUPPORTED');
    if(Number(envelope.schemaVersion)!==5) throw new Error('AQSA7_BACKUP_PROVIDER_SCHEMA_UNSUPPORTED');
    if(!envelope.crypto || typeof envelope.ciphertext!=='string' || !envelope.ciphertext){
      throw new Error('AQSA7_BACKUP_PROVIDER_ARTIFACT_MUST_BE_ENCRYPTED');
    }
    return envelope;
  }

  function assertDescriptor(descriptor){
    if(!descriptor || typeof descriptor!=='object') throw new Error('AQSA7_BACKUP_PROVIDER_DESCRIPTOR_INVALID');
    if(!descriptor.id || !descriptor.name || !descriptor.version) throw new Error('AQSA7_BACKUP_PROVIDER_DESCRIPTOR_INVALID');
    if(!Array.isArray(descriptor.operations) || descriptor.operations.length===0){
      throw new Error('AQSA7_BACKUP_PROVIDER_OPERATIONS_REQUIRED');
    }
    if(descriptor.operations.some(op=>!CONTRACT.supportedOperations.includes(op))){
      throw new Error('AQSA7_BACKUP_PROVIDER_OPERATION_UNSUPPORTED');
    }
    return freeze({...descriptor,operations:freeze([...descriptor.operations])});
  }

  function validateAdapter(adapter){
    if(!adapter || typeof adapter!=='object') throw new Error('AQSA7_BACKUP_PROVIDER_ADAPTER_INVALID');
    for(const method of CONTRACT.supportedOperations){
      if(typeof adapter[method]!=='function') throw new Error('AQSA7_BACKUP_PROVIDER_METHOD_MISSING:'+method);
    }
    return assertDescriptor(adapter.getDescriptor());
  }

  function normalizeError(error, providerId=null){
    const raw=String(error?.code || 'PROVIDER_ERROR');
    return freeze({
      code:ERRORS.includes(raw)?raw:'PROVIDER_ERROR',
      providerCode:error?.providerCode || null,
      message:String(error?.message || 'Backup provider operation failed'),
      retryable:error?.retryable===true,
      providerId
    });
  }

  function createRequest(operation, identity, artifact, options={}){
    if(!CONTRACT.supportedOperations.includes(operation)){
      throw new Error('AQSA7_BACKUP_PROVIDER_OPERATION_UNSUPPORTED');
    }
    const scoped=assertIdentity(identity);
    const request={
      operation,
      ownership:scoped,
      artifact:artifact ? assertArtifactEnvelope(artifact) : null,
      backupId:options.backupId || null,
      cursor:options.cursor || null,
      ifMatch:options.ifMatch || null,
      idempotencyKey:options.idempotencyKey || null,
      metadata:options.metadata || null
    };
    if((operation==='put' || operation==='get' || operation==='delete') && !request.backupId && operation!=='put'){
      throw new Error('AQSA7_BACKUP_PROVIDER_BACKUP_ID_REQUIRED');
    }
    if(operation==='put' && !request.artifact) throw new Error('AQSA7_BACKUP_PROVIDER_ARTIFACT_REQUIRED');
    return freeze(request);
  }

  function validateResult(result, operation){
    if(!result || typeof result!=='object') throw new Error('AQSA7_BACKUP_PROVIDER_RESULT_INVALID');
    if(result.status!=='success' && result.status!=='error'){
      throw new Error('AQSA7_BACKUP_PROVIDER_RESULT_STATUS_INVALID');
    }
    if(result.status==='error'){
      return freeze({...result,error:normalizeError(result.error,result.providerId)});
    }
    if(result.operation && result.operation!==operation) throw new Error('AQSA7_BACKUP_PROVIDER_RESULT_OPERATION_MISMATCH');
    return result;
  }

  async function execute(adapter, operation, identity, options={}){
    const descriptor=validateAdapter(adapter);
    if(!descriptor.operations.includes(operation)) throw new Error('AQSA7_BACKUP_PROVIDER_OPERATION_UNSUPPORTED');
    const request=createRequest(operation,identity,options.artifact,options);
    try{
      const result=await adapter[operation](request);
      return validateResult({...result,providerId:descriptor.id,operation},operation);
    }catch(error){
      return {
        status:'error',
        providerId:descriptor.id,
        operation,
        error:normalizeError(error,descriptor.id)
      };
    }
  }

  const localUnavailableAdapter=freeze({
    getDescriptor:()=>({
      id:'local-unavailable',
      name:'No remote backup provider',
      kind:'fallback',
      version:'1',
      operations:[],
      platforms:['web','pwa','desktop','android']
    }),
    health:async()=>({status:'error',error:{code:'UNAVAILABLE'}}),
    list:async()=>({status:'error',error:{code:'UNAVAILABLE'}}),
    put:async()=>({status:'error',error:{code:'UNAVAILABLE'}}),
    get:async()=>({status:'error',error:{code:'UNAVAILABLE'}}),
    delete:async()=>({status:'error',error:{code:'UNAVAILABLE'}})
  });

  window.AQSA7_BACKUP_PROVIDER_CONTRACT=CONTRACT;
  window.AQSA7_BACKUP_PROVIDER_ERRORS=ERRORS;
  window.aqsa7ValidateBackupProviderAdapter=validateAdapter;
  window.aqsa7ValidateBackupProviderArtifact=assertArtifactEnvelope;
  window.aqsa7CreateBackupProviderRequest=createRequest;
  window.aqsa7NormalizeBackupProviderError=normalizeError;
  window.aqsa7ExecuteBackupProvider=execute;
  window.aqsa7GetDefaultBackupProvider=()=>localUnavailableAdapter;
})();
