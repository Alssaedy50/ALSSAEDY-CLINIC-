import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../js/sync.js', import.meta.url), 'utf8');
const store = new Map();
const window = {
  aqsa7GetInstanceIdentity: () => ({productId:'dental-clinic',tenantId:'alssaedy-clinic',instanceId:'alssaedy-clinic-sana-a'}),
  addEventListener: () => {},
  crypto: {randomUUID: () => 'test-client'}
};
const sandbox = {
  window,
  document: {getElementById: () => null, activeElement: null},
  localStorage: {
    getItem: key => store.has(key) ? store.get(key) : null,
    setItem: (key,value) => store.set(key,String(value)),
    removeItem: key => store.delete(key)
  },
  location: {origin:'https://clinic.example.test'},
  AbortController,
  setTimeout,
  clearTimeout,
  Date,
  Math,
  JSON,
  Map,
  Set,
  Array,
  Object,
  String,
  Number,
  Error,
  Promise,
  fetch: async () => { throw new Error('Network must not be called by merge tests'); }
};
vm.runInNewContext(source, sandbox, {filename:'js/sync.js'});
const engine = window.AQSA7_SYNC_ENGINE;
assert.equal(engine.version, 3, 'sync contract version must be exposed');

const local = {
  app:'ALSSAEDY_CLINIC',
  patients:[
    {id:'p-keep',name:'Local edit',updatedAt:'2026-10-10T10:00:00.000Z'},
    {id:'p-delete',name:'Old patient',updatedAt:'2026-10-10T09:00:00.000Z'}
  ],
  receipts:[{id:'r-local',amount:100,updatedAt:'2026-10-10T10:00:00.000Z'}],
  tombstones:[{store:'patients',id:'p-delete',deletedAt:'2026-10-10T11:00:00.000Z'}],
  settingsRecords:[{id:'currency',value:'YER',updatedAt:'2026-10-10T10:00:00.000Z'}]
};
const remote = {
  app:'ALSSAEDY_CLINIC',
  patients:[
    {id:'p-keep',name:'Older cloud copy',updatedAt:'2026-10-10T08:00:00.000Z'},
    {id:'p-cloud',name:'Cloud patient',updatedAt:'2026-10-10T10:30:00.000Z'},
    {id:'p-delete',name:'Stale cloud patient',updatedAt:'2026-10-10T09:00:00.000Z'}
  ],
  receipts:[{id:'r-cloud',amount:250,updatedAt:'2026-10-10T10:20:00.000Z'}],
  tombstones:[],
  settingsRecords:[{id:'currency',value:'USD',updatedAt:'2026-10-10T09:00:00.000Z'}]
};
const merged = engine.mergeSnapshots(local, remote);
assert.deepEqual(merged.patients.map(x=>x.id).sort(), ['p-cloud','p-keep'], 'adds remote-only records and respects deletion tombstones');
assert.equal(merged.patients.find(x=>x.id==='p-keep').name, 'Local edit', 'newer local edits win');
assert.deepEqual(merged.receipts.map(x=>x.id).sort(), ['r-cloud','r-local'], 'receipt records merge without duplicates');
assert.equal(merged.settingsRecords.find(x=>x.id==='currency').value, 'YER', 'newer setting wins');

const revived = engine.mergeSnapshots(
  {app:'ALSSAEDY_CLINIC',patients:[],receipts:[],tombstones:[{store:'patients',id:'p-revive',deletedAt:'2026-10-10T09:00:00.000Z'}]},
  {app:'ALSSAEDY_CLINIC',patients:[{id:'p-revive',name:'Newer record',updatedAt:'2026-10-10T10:00:00.000Z'}],receipts:[],tombstones:[]}
);
assert.equal(revived.patients.length, 1, 'a record newer than its tombstone must remain');

const a={id:'tie',value:'alpha',updatedAt:'2026-10-10T10:00:00.000Z'};
const b={id:'tie',value:'beta',updatedAt:'2026-10-10T10:00:00.000Z'};
const ab=engine.mergeRecords([a],[b])[0];
const ba=engine.mergeRecords([b],[a])[0];
assert.equal(JSON.stringify(ab),JSON.stringify(ba),'equal-time conflicts resolve deterministically');

assert.throws(
  () => engine.mergeSnapshots({app:'OTHER_APP',patients:[],receipts:[]},{app:'ALSSAEDY_CLINIC',patients:[],receipts:[]}),
  /لا تخص تطبيق العيادة/,
  'foreign application snapshots must be rejected'
);
console.log('AQSA7 bidirectional sync merge tests passed');
