/* AQSA7 Product Definition — one reusable contract for products + configured instances. */
/* CI verification marker: final Task 3.4 export gate; no runtime behavior change. */
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
    defaults: freeze({currency: 'YER', receiptSize: 'a5', theme: 'classic', watermark: 'on'}),
    documentTemplates: freeze({receipt: freeze({sizes: freeze(['a5','a4','80mm']), engine:'native-print'})}),
    roles: freeze([{id:'owner', permissions: freeze(['*'])},{id:'staff', permissions: freeze(['patients.read','patients.write','receipts.read','receipts.write','history.read'])}]),
    integrations: freeze([]),
    ai: freeze({enabledByDefault: false, capabilities: freeze(['search','summarize','extract','generate']), requiresExplicitPolicy: true, coreDependency: false}),
    storage: freeze({primary: 'indexeddb', scope: 'instance', backupFormat: 'encrypted-json'}),
    migrations: freeze({schemaVersion: 2, strategy: 'versioned-product-contract'})
  };
  const instance = {
    schemaVersion: 2, instanceId: 'alssaedy-clinic-sana-a', tenantId: 'alssaedy-clinic', productId: 'dental-clinic', productVersion: manifest.productVersion,
    organization: freeze({nameAr: 'عيادة د/ صلاح الدين السعيدي', nameEn: 'ALSSAEDY CLINIC FOR DENTISTRY', type: 'clinic'}),
    identity: freeze({doctorNameAr: 'د. صلاح الدين السعيدي', doctorNameEn: 'Dr. Salahaldeen Alssaedy', specialtyAr: 'طب وجراحة الفم والأسنان', specialtyEn: 'Dentistry', logo: 'assets/Saedy_Dental_Logo.svg'}),
    locale: freeze({language: 'ar', direction: 'rtl', country: 'YE', timezone: 'Asia/Aden'}),
    defaults: freeze({...manifest.defaults}), enabledModules: freeze([...manifest.modules]), enabledCapabilities: freeze([...manifest.sharedCapabilities]),
    featureFlags: freeze({ai: false, cloudBackup: false, integrations: false, sync: false}),
    permissions: freeze({defaultRole: 'owner', roles: freeze(manifest.roles)}),
    documentTemplates: freeze({receipt: freeze({defaultSize:'a5', allowedSizes: freeze(['a5','a4','80mm'])})}), integrations: freeze({}),
    aiPolicy: freeze({enabled: false, externalDataTransmission: false, humanReviewRequired: true}), storage: freeze({databaseName: 'ALSSAEDY_CLINIC_DB'})
  };
  function validate(){const errors=[];if(!manifest.productId||!manifest.productVersion)errors.push('manifest identity');if(!manifest.modules.length)errors.push('manifest modules');if(!manifest.modules.every(id=>sharedCapabilityIds.includes(id)))errors.push('manifest module is not a registered shared capability');if(!manifest.sharedCapabilities.every(id=>sharedCapabilityIds.includes(id)))errors.push('manifest shared capability is not registered');if(!manifest.capabilities.length)errors.push('manifest capabilities');if(instance.productId!==manifest.productId)errors.push('instance/product mismatch');if(!instance.productVersion||instance.productVersion!==manifest.productVersion)errors.push('instance/product version mismatch');if(!instance.tenantId||!instance.instanceId)errors.push('tenant/instance identity');if(!instance.enabledModules.every(id=>manifest.modules.includes(id)))errors.push('instance enabled module outside product manifest');if(!manifest.documentTemplates.receipt.sizes.includes(instance.documentTemplates.receipt.defaultSize))errors.push('receipt default outside product template contract');if(!manifest.storage.primary||manifest.storage.scope!=='instance')errors.push('storage contract');if(!instance.storage.databaseName||!instance.storage.databaseName.trim())errors.push('instance database name');if(!/^[A-Za-z0-9_-]+$/.test(instance.storage.databaseName))errors.push('instance database name contains unsafe characters');return freeze({valid:errors.length===0,errors:freeze(errors)});}
  const instanceIdentity=freeze({productId:manifest.productId,tenantId:instance.tenantId,instanceId:instance.instanceId});
  function identityMatches(value,expected){return String(value||'')===String(expected||'');}
  function aqsa7OwnRecord(record,options){const source=record&&typeof record==='object'?record:{};const allowUnscoped=options?.allowUnscoped!==false;const keys=['productId','tenantId','instanceId'];const present=keys.filter(key=>source[key]!==undefined&&source[key]!==null&&String(source[key])!=='');if(present.length>0&&present.length!==keys.length)throw new Error('AQSA7_RECORD_OWNERSHIP_INCOMPLETE');if(present.length===keys.length){if(!identityMatches(source.productId,instanceIdentity.productId)||!identityMatches(source.tenantId,instanceIdentity.tenantId)||!identityMatches(source.instanceId,instanceIdentity.instanceId))throw new Error('AQSA7_RECORD_OWNERSHIP_MISMATCH');return {...source};}if(!allowUnscoped)throw new Error('AQSA7_RECORD_OWNERSHIP_REQUIRED');return {...source,...instanceIdentity};}
  function aqsa7ValidateBackupScope(payload){if(!payload||typeof payload!=='object')throw new Error('AQSA7_BACKUP_INVALID');const keys=['productId','tenantId','instanceId'];const present=keys.filter(key=>payload[key]!==undefined&&payload[key]!==null&&String(payload[key])!=='');if(present.length>0&&present.length!==keys.length)throw new Error('AQSA7_BACKUP_OWNERSHIP_INCOMPLETE');if(present.length===0)return {scoped:false,...instanceIdentity};if(!keys.every(key=>identityMatches(payload[key],instanceIdentity[key])))throw new Error('AQSA7_BACKUP_OWNERSHIP_MISMATCH');return {scoped:true,...instanceIdentity};}
  function aqsa7GetProductManifest(){return manifest;}function aqsa7GetProductCapabilities(){return manifest.sharedCapabilities.map(id=>window.aqsa7GetSharedCapability(id)).filter(Boolean);}function aqsa7GetClinicConfig(){return instance;}function aqsa7GetInstanceStorageConfig(){return instance.storage;}function aqsa7GetInstanceIdentity(){return instanceIdentity;}function aqsa7ValidateProductDefinition(){return validate();}function aqsa7StampRecord(record){return aqsa7OwnRecord(record,{allowUnscoped:true});}
  function aqsa7ApplyClinicIdentity(){const i=instance.identity,locale=instance.locale;document.documentElement.lang=locale.language;document.documentElement.dir=locale.direction;const brand=document.querySelector('.brand-title');if(brand)brand.textContent=instance.organization.nameAr;const badge=document.querySelector('.brand-badge:not(.count-badge)');if(badge)badge.textContent='Dental Clinic';const logo=document.getElementById('clinicLogoImg');if(logo){logo.src=i.logo;logo.alt='شعار '+instance.organization.nameAr;}const values={clinic_en:instance.organization.nameEn,doc_en:i.doctorNameEn,doc_name:i.doctorNameAr,doc_spec:i.specialtyAr};Object.entries(values).forEach(([key,value])=>{const el=document.querySelector('[data-key="'+key+'"]');if(el)el.textContent=value;});}
  window.AQSA7_PRODUCT_MANIFEST=freeze(manifest);window.AQSA7_CLINIC_CONFIG=freeze(instance);window.aqsa7GetProductManifest=aqsa7GetProductManifest;window.aqsa7GetProductCapabilities=aqsa7GetProductCapabilities;window.aqsa7GetClinicConfig=aqsa7GetClinicConfig;window.aqsa7GetInstanceStorageConfig=aqsa7GetInstanceStorageConfig;window.aqsa7GetInstanceIdentity=aqsa7GetInstanceIdentity;window.aqsa7ValidateProductDefinition=aqsa7ValidateProductDefinition;window.aqsa7StampRecord=aqsa7StampRecord;window.aqsa7OwnRecord=aqsa7OwnRecord;window.aqsa7ValidateBackupScope=aqsa7ValidateBackupScope;if(validate().valid===false)console.error('AQSA7 product definition validation failed',validate().errors);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',aqsa7ApplyClinicIdentity,{once:true});else aqsa7ApplyClinicIdentity();
})();
