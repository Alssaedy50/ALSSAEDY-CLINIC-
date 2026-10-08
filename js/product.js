/* AQSA7 Product Definition — one reusable contract for products + configured instances. */
(function(){
  const freeze = value => Object.freeze(value);

  /*
   * Product definition is the platform contract. It describes reusable business
   * behavior; organization-specific identity/defaults live in the instance config.
   */
  const sharedCapabilityIds = typeof window.aqsa7ListSharedCapabilityIds === 'function' ? window.aqsa7ListSharedCapabilityIds() : [];
  const manifest = {
    schemaVersion: 2,
    productId: 'dental-clinic',
    productName: 'AQSA7 Dental Clinic',
    platformId: 'AQSA7',
    productVersion: '1.0',
    category: 'healthcare',
    vertical: 'dental',
    sharedCapabilities: freeze(['people', 'appointments', 'catalog', 'billing', 'receipts']),
    modules: freeze(['people', 'appointments', 'catalog', 'billing', 'receipts']),
    capabilities: freeze([
      'receipts', 'patients', 'patient-accounts', 'history', 'settings',
      'local-backup', 'print-pdf', 'image-export', 'sharing'
    ]),
    optionalCapabilities: freeze(['ai', 'cloud-backup', 'integrations', 'sync']),
    domain: freeze({
      entities: freeze([
        'patient', 'patient-account', 'clinical-visit', 'dental-service',
        'treatment', 'receipt'
      ]),
      relationships: freeze([
        'patient -> patient-account',
        'patient -> clinical-visit',
        'clinical-visit -> treatment',
        'receipt -> patient'
      ])
    }),
    navigation: freeze([
      {id:'receipt', labelKey:'receipt'},
      {id:'patients', labelKey:'patients'},
      {id:'history', labelKey:'history'},
      {id:'settings', labelKey:'settings'}
    ]),
    defaults: freeze({
      currency: 'YER',
      receiptSize: 'a5',
      theme: 'classic',
      watermark: 'on'
    }),
    documentTemplates: freeze({
      receipt: freeze({sizes: freeze(['a5','a4','80mm']), engine:'native-print'})
    }),
    roles: freeze([
      {id:'owner', permissions: freeze(['*'])},
      {id:'staff', permissions: freeze(['patients.read','patients.write','receipts.read','receipts.write','history.read'])}
    ]),
    integrations: freeze([]),
    ai: freeze({
      enabledByDefault: false,
      capabilities: freeze(['search','summarize','extract','generate']),
      requiresExplicitPolicy: true,
      coreDependency: false
    }),
    storage: freeze({
      primary: 'indexeddb',
      scope: 'instance',
      backupFormat: 'encrypted-json'
    }),
    migrations: freeze({schemaVersion: 2, strategy: 'versioned-product-contract'})
  };

  /*
   * Concrete organization/tenant configuration. Nothing here changes the
   * reusable product semantics; it selects identity, defaults, modules and
   * policies for one installation.
   */
  const instance = {
    schemaVersion: 2,
    instanceId: 'alssaedy-clinic-sana-a',
    tenantId: 'alssaedy-clinic',
    productId: 'dental-clinic',
    productVersion: manifest.productVersion,
    organization: freeze({
      nameAr: 'عيادة د/ صلاح الدين السعيدي',
      nameEn: 'ALSSAEDY CLINIC FOR DENTISTRY',
      type: 'clinic'
    }),
    identity: freeze({
      doctorNameAr: 'د. صلاح الدين السعيدي',
      doctorNameEn: 'Dr. Salahaldeen Alssaedy',
      specialtyAr: 'طب وجراحة الفم والأسنان',
      specialtyEn: 'Dentistry',
      logo: 'assets/Saedy_Dental_Logo.svg'
    }),
    locale: freeze({
      language: 'ar',
      direction: 'rtl',
      country: 'YE',
      timezone: 'Asia/Aden'
    }),
    defaults: freeze({...manifest.defaults}),
    enabledModules: freeze([...manifest.modules]),
    enabledCapabilities: freeze([...manifest.sharedCapabilities]),
    featureFlags: freeze({
      ai: false,
      cloudBackup: false,
      integrations: false,
      sync: false
    }),
    permissions: freeze({
      defaultRole: 'owner',
      roles: freeze(manifest.roles)
    }),
    documentTemplates: freeze({
      receipt: freeze({defaultSize:'a5', allowedSizes: freeze(['a5','a4','80mm'])})
    }),
    integrations: freeze({}),
    aiPolicy: freeze({
      enabled: false,
      externalDataTransmission: false,
      humanReviewRequired: true
    }),
    storage: freeze({
      databaseName: 'ALSSAEDY_CLINIC_DB'
    })
  };

  function validate(){
    const errors = [];
    if(!manifest.productId || !manifest.productVersion) errors.push('manifest identity');
    if(!manifest.modules.length) errors.push('manifest modules');
    if(!manifest.modules.every(id => sharedCapabilityIds.includes(id))) errors.push('manifest module is not a registered shared capability');
    if(!manifest.sharedCapabilities.every(id => sharedCapabilityIds.includes(id))) errors.push('manifest shared capability is not registered');
    if(!manifest.capabilities.length) errors.push('manifest capabilities');
    if(instance.productId !== manifest.productId) errors.push('instance/product mismatch');
    if(!instance.productVersion || instance.productVersion !== manifest.productVersion) errors.push('instance/product version mismatch');
    if(!instance.tenantId || !instance.instanceId) errors.push('tenant/instance identity');
    if(!instance.enabledModules.every(id => manifest.modules.includes(id))) errors.push('instance enabled module outside product manifest');
    if(!manifest.documentTemplates.receipt.sizes.includes(instance.documentTemplates.receipt.defaultSize)) errors.push('receipt default outside product template contract');
    if(!manifest.storage.primary || manifest.storage.scope !== 'instance') errors.push('storage contract');
    return freeze({valid: errors.length === 0, errors: freeze(errors)});
  }

  function aqsa7GetProductManifest(){ return manifest; }
  function aqsa7GetProductCapabilities(){ return manifest.sharedCapabilities.map(id => window.aqsa7GetSharedCapability(id)).filter(Boolean); }
  function aqsa7GetClinicConfig(){ return instance; }
  function aqsa7GetInstanceStorageConfig(){ return instance.storage; }
  function aqsa7ValidateProductDefinition(){ return validate(); }
  function aqsa7StampRecord(record){
    return {
      ...record,
      productId: record?.productId || manifest.productId,
      tenantId: record?.tenantId || instance.tenantId,
      instanceId: record?.instanceId || instance.instanceId
    };
  }
  function aqsa7ApplyClinicIdentity(){
    const i=instance.identity, locale=instance.locale;
    document.documentElement.lang=locale.language;
    document.documentElement.dir=locale.direction;
    const brand=document.querySelector('.brand-title'); if(brand) brand.textContent=instance.organization.nameAr;
    const badge=document.querySelector('.brand-badge:not(.count-badge)'); if(badge) badge.textContent='Dental Clinic';
    const logo=document.getElementById('clinicLogoImg'); if(logo){logo.src=i.logo;logo.alt='شعار '+instance.organization.nameAr;}
    const values={clinic_en:instance.organization.nameEn,doc_en:i.doctorNameEn,doc_name:i.doctorNameAr,doc_spec:i.specialtyAr};
    Object.entries(values).forEach(([key,value])=>{const el=document.querySelector('[data-key="'+key+'"]');if(el)el.textContent=value;});
  }

  window.AQSA7_PRODUCT_MANIFEST=freeze(manifest);
  window.AQSA7_CLINIC_CONFIG=freeze(instance);
  window.aqsa7GetProductManifest=aqsa7GetProductManifest;
  window.aqsa7GetProductCapabilities=aqsa7GetProductCapabilities;
  window.aqsa7GetClinicConfig=aqsa7GetClinicConfig;
  window.aqsa7GetInstanceStorageConfig=aqsa7GetInstanceStorageConfig;
  window.aqsa7ValidateProductDefinition=aqsa7ValidateProductDefinition;
  window.aqsa7StampRecord=aqsa7StampRecord;
  if(validate().valid===false) console.error('AQSA7 product definition validation failed', validate().errors);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',aqsa7ApplyClinicIdentity,{once:true}); else aqsa7ApplyClinicIdentity();
})();
