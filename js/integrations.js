/* AQSA7 Platform Integration / Interoperability Contract — provider-neutral, local-first.
 * This file defines boundaries only. Provider transport, credentials, webhooks and
 * mapping implementations remain adapters; business/vertical modules never import them.
 */
(function(){
  const freeze = v => Object.freeze(v);
  const cloneFreeze = v => {
    if (Array.isArray(v)) return freeze(v.map(cloneFreeze));
    if (v && typeof v === 'object') return freeze(Object.fromEntries(Object.entries(v).map(([k,x])=>[k,cloneFreeze(x)])));
    return v;
  };

  const capabilities = {
    api: {id:'api', purpose:'request/response exchange with an external system'},
    import: {id:'import', purpose:'ingest externally represented records through validation and mapping'},
    export: {id:'export', purpose:'emit authorized records in an external representation'},
    webhook: {id:'webhook', purpose:'receive provider-originated events through authenticated validation'},
    event: {id:'event', purpose:'publish/consume normalized application events through an adapter boundary'},
    mapping: {id:'mapping', purpose:'translate between AQSA7 domain contracts and external schemas'}
  };

  const manifest = cloneFreeze({
    schemaVersion: 1,
    layer: 'platform-integration',
    contractId: 'aqsa7-integration-adapter-contract',
    providerIndependent: true,
    enabledByDefault: false,
    coreDependency: false,
    persistence: 'none',
    secrets: 'none',
    capabilities,
    adapterContract: {
      requiredMethods: ['getDescriptor','supports','execute'],
      optionalMethods: ['health','subscribe','unsubscribe','verifyWebhook','import','export','mapToExternal','mapFromExternal'],
      descriptor: ['id','name','kind','version','capabilities','local','platforms'],
      execute: 'execute(request, context) -> Promise<IntegrationResult>',
      ownership: 'adapter owns transport/protocol/provider mechanics only; business rules and durable writes remain in AQSA7'
    },
    requestContract: {
      required: ['capabilityId','operation'],
      optional: ['resource','payload','query','headers','mappingProfile','authRef','idempotencyKey','retryPolicy','timeoutMs','metadata'],
      ownership: ['productId','tenantId','instanceId'],
      response: ['status','providerId','operation','data?','error?','meta?']
    },
    authenticationBoundary: {
      modes: ['none','oauth','api-key','service-account','custom'],
      rule: 'credential material is resolved outside business modules and never stored in this contract or committed to source',
      clientSecretPolicy: 'deny-hardcoded'
    },
    authorizationBoundary: {
      rule: 'adapter execution is allowed only after normal AQSA7 product/tenant/instance and permission checks',
      providerScopes: 'least-privilege and instance-scoped where supported'
    },
    retry: {
      default: 'no automatic retry for unknown side effects',
      safeRetryMethods: ['GET','HEAD','OPTIONS','PUT','DELETE'],
      writeRule: 'non-idempotent writes require an explicit idempotencyKey before automatic retry',
      backoff: 'adapter-defined bounded exponential backoff with jitter'
    },
    webhook: {
      inbound: 'verify authenticity, event type, delivery id and freshness before normalization',
      replayProtection: 'deliveryId required when provider supplies one',
      processing: 'acknowledge only after validation; business processing remains application-owned',
      secretHandling: 'verification secrets remain platform/provider secure configuration, never payloads or source'
    },
    interoperability: {
      wireFormats: ['json','csv','xml','ndjson','text'],
      schemaValidation: 'external payloads are untrusted until validated',
      mapping: 'explicit versioned mapping profiles; no implicit field-name magic',
      healthcare: 'FHIR-compatible mapping may be added as a vertical/healthcare adapter; no FHIR dependency in generic core',
      generalApiDescription: 'OpenAPI-compatible contracts may describe HTTP integrations without coupling AQSA7 to one transport'
    },
    offline: {
      rule: 'integration unavailable must not make local core unavailable',
      fallback: 'queue/defer only when a future sync/event engine explicitly owns it; otherwise return unavailable without durable integration state',
      noSecondStore: true
    },
    errors: {
      normalized: ['UNAVAILABLE','TIMEOUT','AUTH_REQUIRED','FORBIDDEN','NOT_FOUND','RATE_LIMITED','CONFLICT','INVALID_REQUEST','INVALID_RESPONSE','NETWORK_ERROR','PROVIDER_ERROR'],
      preserveProviderCode: true,
      sensitivePayloadLogging: false
    },
    ownership: {
      source: 'AQSA7 instance identity',
      required: ['productId','tenantId','instanceId'],
      rule: 'adapter cannot widen or rewrite ownership'
    },
    observability: {
      events: ['request-start','request-success','request-error','webhook-received','webhook-rejected'],
      fields: ['integrationId','providerId','operation','durationMs','status','errorCode'],
      forbidden: ['credentials','tokens','rawSensitivePayloads']
    },
    crossPlatform: {
      sharedContract: true,
      platformAdapters: ['web','pwa','desktop','android'],
      rule: 'platform-specific code may implement transport/storage/OS mechanics only; business modules consume this contract'
    }
  });

  function getIdentity(){
    return typeof window.aqsa7GetInstanceIdentity === 'function'
      ? window.aqsa7GetInstanceIdentity()
      : null;
  }

  function getCapability(id){ return manifest.capabilities[id] || null; }

  function validateRequest(request){
    if (!request || typeof request !== 'object') throw new Error('AQSA7_INTEGRATION_REQUEST_INVALID');
    if (!getCapability(request.capabilityId)) throw new Error('AQSA7_INTEGRATION_CAPABILITY_UNKNOWN');
    if (!request.operation || typeof request.operation !== 'string') throw new Error('AQSA7_INTEGRATION_OPERATION_REQUIRED');
    const identity = getIdentity();
    if (!identity?.productId || !identity?.tenantId || !identity?.instanceId) throw new Error('AQSA7_INTEGRATION_INSTANCE_SCOPE_REQUIRED');
    const autoRetry = request.retryPolicy?.automatic === true;
    const method = String(request.method || 'GET').toUpperCase();
    if (autoRetry && !manifest.retry.safeRetryMethods.includes(method) && !request.idempotencyKey) {
      throw new Error('AQSA7_INTEGRATION_IDEMPOTENCY_REQUIRED');
    }
    return {identity, method};
  }

  function normalizeError(error, meta={}){
    const code = error?.code || error?.integrationCode || 'PROVIDER_ERROR';
    const allowed = manifest.errors.normalized.includes(code) ? code : 'PROVIDER_ERROR';
    return cloneFreeze({
      code: allowed,
      providerCode: error?.providerCode || null,
      message: String(error?.message || 'Integration request failed'),
      retryable: error?.retryable === true,
      integrationId: meta.integrationId || null,
      providerId: meta.providerId || null
    });
  }

  function createAdapterDescriptor(adapter){
    if (!adapter || typeof adapter.getDescriptor !== 'function') throw new Error('AQSA7_INTEGRATION_ADAPTER_INVALID');
    const d=adapter.getDescriptor();
    if(!d?.id || !d?.name || !d?.kind || !d?.version || !Array.isArray(d.capabilities)) throw new Error('AQSA7_INTEGRATION_DESCRIPTOR_INVALID');
    if(d.capabilities.some(id => !getCapability(id))) throw new Error('AQSA7_INTEGRATION_DESCRIPTOR_CAPABILITY_UNKNOWN');
    return cloneFreeze(d);
  }

  async function execute(request, context){
    const checked=validateRequest(request);
    const adapter=context?.adapter;
    if(!adapter || typeof adapter.execute !== 'function') throw new Error('AQSA7_INTEGRATION_ADAPTER_UNAVAILABLE');
    const descriptor=createAdapterDescriptor(adapter);
    if(typeof adapter.supports === 'function' && !adapter.supports(request.capabilityId, request.operation)) {
      throw new Error('AQSA7_INTEGRATION_OPERATION_UNSUPPORTED');
    }
    const scopedRequest={...request, ownership:{...checked.identity}};
    try{
      const data=await adapter.execute(scopedRequest, context);
      return {status:'success', providerId:descriptor.id, operation:request.operation, data};
    }catch(error){
      return {status:'error', providerId:descriptor.id, operation:request.operation, error:normalizeError(error,{integrationId:request.integrationId,providerId:descriptor.id})};
    }
  }

  function normalizeWebhook(adapter, event, context){
    if(!adapter || typeof adapter.verifyWebhook !== 'function') throw new Error('AQSA7_INTEGRATION_WEBHOOK_VERIFIER_UNAVAILABLE');
    const identity=getIdentity();
    if(!identity) throw new Error('AQSA7_INTEGRATION_INSTANCE_SCOPE_REQUIRED');
    const verified=adapter.verifyWebhook(event, context);
    if(!verified || verified.valid !== true) throw new Error('AQSA7_INTEGRATION_WEBHOOK_REJECTED');
    return cloneFreeze({
      status:'verified',
      providerId:createAdapterDescriptor(adapter).id,
      deliveryId:verified.deliveryId || null,
      eventType:verified.eventType || null,
      ownership:{...identity},
      payload:verified.payload
    });
  }

  function map(adapter, direction, payload, profile){
    const method=direction==='toExternal'?'mapToExternal':'mapFromExternal';
    if(!adapter || typeof adapter[method] !== 'function') throw new Error('AQSA7_INTEGRATION_MAPPING_UNAVAILABLE');
    if(!profile || !profile.id || !profile.version) throw new Error('AQSA7_INTEGRATION_MAPPING_PROFILE_INVALID');
    return adapter[method](payload, cloneFreeze(profile));
  }

  const localFallback=freeze({
    getDescriptor:()=>({id:'local-unavailable',name:'Local fallback / no provider',kind:'fallback',version:'1',capabilities:[],local:true,platforms:['web','pwa','desktop','android']}),
    supports:()=>false,
    async execute(){ throw Object.assign(new Error('Integration provider unavailable; local core remains authoritative'),{code:'UNAVAILABLE',retryable:false}); }
  });

  window.AQSA7_INTEGRATION_MANIFEST=manifest;
  window.aqsa7GetIntegrationManifest=()=>manifest;
  window.aqsa7GetIntegrationCapability=getCapability;
  window.aqsa7ValidateIntegrationRequest=validateRequest;
  window.aqsa7CreateIntegrationAdapterDescriptor=createAdapterDescriptor;
  window.aqsa7ExecuteIntegration=execute;
  window.aqsa7NormalizeIntegrationError=normalizeError;
  window.aqsa7VerifyIntegrationWebhook=normalizeWebhook;
  window.aqsa7MapIntegrationData=map;
  window.aqsa7GetDefaultIntegrationAdapter=()=>localFallback;
})();
