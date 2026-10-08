/* AQSA7 Platform AI Capability Layer — provider-neutral, optional, local-first.
 * Business/vertical modules depend on these stable capability contracts only.
 * No vendor SDK, API key, secret, persistence, repository, or business state lives here.
 */
(function(){
  const freeze = value => Object.freeze(value);
  const cloneFreeze = value => {
    if (Array.isArray(value)) return freeze(value.map(cloneFreeze));
    if (value && typeof value === 'object') {
      return freeze(Object.fromEntries(Object.entries(value).map(([k,v]) => [k, cloneFreeze(v)])));
    }
    return value;
  };

  const capabilityDefinitions = {
    summarize: {
      id: 'summarize',
      purpose: 'Produce a concise or detailed summary from authorized context.',
      input: ['context', 'instruction', 'outputSchema?'],
      output: ['text', 'structured?'],
      mutatesData: false,
      defaultHumanReview: false
    },
    extract: {
      id: 'extract',
      purpose: 'Extract structured fields from authorized text or media.',
      input: ['content', 'schema', 'instruction?'],
      output: ['structured'],
      mutatesData: false,
      defaultHumanReview: true
    },
    classify: {
      id: 'classify',
      purpose: 'Classify authorized content against an explicit label contract.',
      input: ['content', 'labels', 'instruction?'],
      output: ['label', 'confidence?'],
      mutatesData: false,
      defaultHumanReview: true
    },
    search: {
      id: 'search',
      purpose: 'Answer a query using only authorized application context or retrieval sources.',
      input: ['query', 'context?'],
      output: ['answer', 'sources?'],
      mutatesData: false,
      defaultHumanReview: false
    },
    generate: {
      id: 'generate',
      purpose: 'Generate user-requested text or structured content from authorized context.',
      input: ['instruction', 'context?', 'outputSchema?'],
      output: ['text', 'structured?'],
      mutatesData: false,
      defaultHumanReview: true
    },
    recommend: {
      id: 'recommend',
      purpose: 'Produce assistive recommendations from authorized context.',
      input: ['context', 'instruction', 'constraints?'],
      output: ['recommendations'],
      mutatesData: false,
      defaultHumanReview: true
    }
  };

  const promptTemplates = {
    summarize: {version:1, template:'Summarize only the supplied authorized context. Do not invent facts. Return the requested format.'},
    extract: {version:1, template:'Extract only fields supported by the supplied content and schema. Use null/empty values when evidence is absent.'},
    classify: {version:1, template:'Classify only against the supplied labels and evidence. Do not infer unsupported facts.'},
    search: {version:1, template:'Answer only from authorized retrieved context. Distinguish missing evidence from known facts.'},
    generate: {version:1, template:'Generate content from the supplied instruction and authorized context. Do not invent sensitive facts or permissions.'},
    recommend: {version:1, template:'Provide assistive recommendations from authorized context and state uncertainty. Human review remains authoritative.'}
  };

  const manifest = cloneFreeze({
    schemaVersion: 1,
    layer: 'platform-ai',
    contractId: 'aqsa7-ai-capability-layer',
    providerIndependent: true,
    enabledByDefault: false,
    coreDependency: false,
    persistence: 'none',
    secrets: 'none',
    capabilities: capabilityDefinitions,
    promptTemplates,
    requestContract: {
      required: ['capabilityId', 'input'],
      optional: ['context', 'outputSchema', 'tools', 'retrieval', 'stream', 'policy', 'metadata'],
      output: ['status', 'capabilityId', 'providerId', 'result', 'usage?', 'error?']
    },
    providerAdapterContract: {
      requiredMethods: ['getDescriptor', 'supports', 'execute'],
      optionalMethods: ['stream', 'listModels', 'health'],
      descriptor: ['id', 'name', 'kind', 'local', 'capabilities'],
      execute: 'execute(request, context) -> Promise<AIResult>',
      stream: 'stream(request, context) -> AsyncIterable<AIEvent>',
      ownership: 'provider adapter owns transport/auth/model invocation only; never business logic or persistence'
    },
    toolBoundary: {
      principle: 'model may request a declared tool; AQSA7 executes it only after normal authorization and validation',
      toolShape: ['name', 'description', 'inputSchema', 'permission'],
      executionOwner: 'application'
    },
    retrievalBoundary: {
      principle: 'retrieval supplies authorized context; AI layer never becomes a second database',
      sourceOfTruth: 'existing AQSA7 repositories/capability modules'
    },
    safety: {
      externalTransmissionRequiresExplicitPolicy: true,
      sensitiveDataDefault: 'deny-external',
      secretsInClientCode: false,
      autonomousBusinessMutation: false,
      humanReviewForHighImpact: true,
      unavailableMode: 'fail-soft'
    },
    usage: {
      controls: ['requestLimit?', 'tokenBudget?', 'timeLimitMs?'],
      costTracking: 'adapter-reported metadata only; no mandatory paid service'
    },
    observability: {
      hooks: ['request-start', 'request-success', 'request-error', 'request-unavailable'],
      noSensitivePayloadLogging: true
    }
  });

  const unavailableAdapter = {
    getDescriptor(){
      return {id:'unconfigured', name:'No AI provider configured', kind:'none', local:false, capabilities:[]};
    },
    supports(){ return false; },
    async execute(){ throw new Error('AQSA7_AI_PROVIDER_UNAVAILABLE'); }
  };

  function getCapability(id){
    return manifest.capabilities[id] || null;
  }

  function normalizePolicy(policy){
    return {
      enabled: policy?.enabled === true,
      allowExternalTransmission: policy?.allowExternalTransmission === true,
      allowSensitiveData: policy?.allowSensitiveData === true,
      requireHumanReview: policy?.requireHumanReview !== false
    };
  }

  function validateRequest(request){
    if (!request || typeof request !== 'object') throw new Error('AQSA7_AI_REQUEST_INVALID');
    const capability = getCapability(request.capabilityId);
    if (!capability) throw new Error('AQSA7_AI_CAPABILITY_UNKNOWN');
    const policy = normalizePolicy(request.policy);
    if (!policy.enabled) throw new Error('AQSA7_AI_DISABLED');
    if (request.external === true && !policy.allowExternalTransmission) throw new Error('AQSA7_AI_EXTERNAL_TRANSMISSION_DENIED');
    if (request.sensitive === true && !policy.allowSensitiveData) throw new Error('AQSA7_AI_SENSITIVE_DATA_DENIED');
    return {capability, policy};
  }

  async function execute(request, context){
    const validation = validateRequest(request);
    const adapter = context?.adapter || unavailableAdapter;
    if (!adapter || typeof adapter.execute !== 'function') throw new Error('AQSA7_AI_ADAPTER_INVALID');
    if (typeof adapter.supports === 'function' && !adapter.supports(request.capabilityId)) {
      throw new Error('AQSA7_AI_CAPABILITY_UNSUPPORTED');
    }
    const result = await adapter.execute({...request, capabilityId:validation.capability.id}, context);
    return {
      status:'success',
      capabilityId:validation.capability.id,
      providerId: adapter.getDescriptor?.().id || 'unknown',
      result,
      humanReviewRequired: validation.capability.defaultHumanReview || validation.policy.requireHumanReview
    };
  }

  function createProviderDescriptor(adapter){
    if (!adapter || typeof adapter.getDescriptor !== 'function') throw new Error('AQSA7_AI_ADAPTER_INVALID');
    const descriptor = adapter.getDescriptor();
    if (!descriptor?.id || !descriptor?.kind || !Array.isArray(descriptor.capabilities)) {
      throw new Error('AQSA7_AI_ADAPTER_DESCRIPTOR_INVALID');
    }
    return cloneFreeze(descriptor);
  }

  window.AQSA7_AI_MANIFEST = manifest;
  window.aqsa7GetAICapabilityManifest = () => manifest;
  window.aqsa7GetAICapability = getCapability;
  window.aqsa7GetAIPromptTemplate = id => manifest.promptTemplates[id] || null;
  window.aqsa7ValidateAIRequest = validateRequest;
  window.aqsa7ExecuteAI = execute;
  window.aqsa7CreateAIProviderDescriptor = createProviderDescriptor;
  window.aqsa7GetDefaultAIAdapter = () => unavailableAdapter;
})();
