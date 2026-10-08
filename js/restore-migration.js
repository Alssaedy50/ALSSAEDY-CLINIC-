/* AQSA7 Restore & Migration Engine — versioned, fail-closed restore preparation boundary. */
(function(){
  'use strict';

  const CONTRACT=Object.freeze({
    contractId:'aqsa7-restore-migration-engine',
    schemaVersion:1,
    artifactType:'AQSA7_BACKUP_ARTIFACT',
    artifactVersion:1,
    supportedSchemaVersions:Object.freeze([5]),
    currentSchemaVersion:5,
    migrationPolicy:'explicit-versioned-only',
    persistenceOwner:'repository-indexeddb',
    providerIndependent:true
  });

  const identity=()=>typeof window.aqsa7GetInstanceIdentity==='function'
    ? window.aqsa7GetInstanceIdentity()
    : null;

  function fail(code,message){
    const e=new Error(message||code); e.code=code; throw e;
  }

  function validateEnvelope(envelope){
    if(!envelope || typeof envelope!=='object') fail('AQSA7_RESTORE_ENVELOPE_INVALID');
    if(envelope.artifactType!==CONTRACT.artifactType) fail('AQSA7_RESTORE_ARTIFACT_TYPE_UNSUPPORTED');
    if(Number(envelope.artifactVersion)!==CONTRACT.artifactVersion) fail('AQSA7_RESTORE_ARTIFACT_VERSION_UNSUPPORTED');
    if(!envelope.crypto || typeof envelope.ciphertext!=='string' || !envelope.ciphertext) fail('AQSA7_RESTORE_ENCRYPTED_ARTIFACT_REQUIRED');
    return envelope;
  }

  function validateArtifact(artifact){
    if(!artifact || typeof artifact!=='object') fail('AQSA7_RESTORE_ARTIFACT_INVALID');
    if(artifact.artifactType!==CONTRACT.artifactType) fail('AQSA7_RESTORE_ARTIFACT_TYPE_UNSUPPORTED');
    if(Number(artifact.artifactVersion)!==CONTRACT.artifactVersion) fail('AQSA7_RESTORE_ARTIFACT_VERSION_UNSUPPORTED');
    if(artifact.schema!=='AQSA7_PRODUCT_BACKUP') fail('AQSA7_RESTORE_SCHEMA_UNSUPPORTED');
    const version=Number(artifact.schemaVersion);
    if(!Number.isInteger(version)) fail('AQSA7_RESTORE_SCHEMA_VERSION_INVALID');
    if(!CONTRACT.supportedSchemaVersions.includes(version)) fail('AQSA7_RESTORE_SCHEMA_VERSION_UNSUPPORTED');
    if(!artifact.exportedAt || Number.isNaN(Date.parse(artifact.exportedAt))) fail('AQSA7_RESTORE_TIMESTAMP_INVALID');
    if(!Array.isArray(artifact.receipts)||!Array.isArray(artifact.patients)||!artifact.settings||typeof artifact.settings!=='object') fail('AQSA7_RESTORE_PAYLOAD_INVALID');

    const expected=identity();
    if(!expected || !expected.productId || !expected.tenantId || !expected.instanceId) fail('AQSA7_RESTORE_TARGET_IDENTITY_UNAVAILABLE');
    const ownership=artifact.ownership;
    if(!ownership || ownership.scope!=='instance') fail('AQSA7_RESTORE_OWNERSHIP_INVALID');
    if(artifact.productId!==ownership.productId||artifact.tenantId!==ownership.tenantId||artifact.instanceId!==ownership.instanceId) fail('AQSA7_RESTORE_OWNERSHIP_INTERNAL_MISMATCH');
    if(artifact.productId!==expected.productId||artifact.tenantId!==expected.tenantId||artifact.instanceId!==expected.instanceId) fail('AQSA7_RESTORE_OWNERSHIP_TARGET_MISMATCH');

    if(typeof window.aqsa7ValidateBackupScope==='function') window.aqsa7ValidateBackupScope(artifact);
    return artifact;
  }

  const MIGRATIONS=Object.freeze({
    5: Object.freeze({
      from:5,to:5,
      id:'AQSA7_BACKUP_5_IDENTITY',
      transform:artifact=>artifact
    })
  });

  function plan(input){
    const artifact=input?.artifact||input;
    validateArtifact(artifact);
    const version=Number(artifact.schemaVersion);
    const migration=MIGRATIONS[version];
    if(!migration) fail('AQSA7_RESTORE_MIGRATION_UNAVAILABLE','No explicit migration exists for schemaVersion '+version+'.');
    return Object.freeze({
      contractId:CONTRACT.contractId,
      fromSchemaVersion:version,
      toSchemaVersion:CONTRACT.currentSchemaVersion,
      migrationId:migration.id,
      requiresTransform:migration.from!==migration.to
    });
  }

  function migrate(input){
    const artifact=input?.artifact||input;
    validateArtifact(artifact);
    const p=plan(artifact);
    const migration=MIGRATIONS[p.fromSchemaVersion];
    const result=migration.transform({...artifact});
    if(result===artifact && migration.from!==migration.to) fail('AQSA7_RESTORE_MIGRATION_MUTATION_FAILED');
    result.schemaVersion=CONTRACT.currentSchemaVersion;
    validateArtifact(result);
    return result;
  }

  function prepare(envelope, decryptedArtifact){
    validateEnvelope(envelope);
    const migrated=migrate(decryptedArtifact);
    return Object.freeze({
      artifact:migrated,
      plan:plan(migrated),
      validated:true
    });
  }

  window.AQSA7_RESTORE_MIGRATION_CONTRACT=CONTRACT;
  window.aqsa7ValidateRestoreEnvelope=validateEnvelope;
  window.aqsa7ValidateRestoreArtifact=validateArtifact;
  window.aqsa7PlanRestoreMigration=plan;
  window.aqsa7MigrateRestoreArtifact=migrate;
  window.aqsa7PrepareRestoreArtifact=prepare;
})();
