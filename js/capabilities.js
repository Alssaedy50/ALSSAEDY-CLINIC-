/* AQSA7 Shared Business Capability Registry
 * One authoritative contract for reusable business capabilities.
 * No persistence, DOM, provider, or vertical-domain ownership lives here.
 */
(function(){
  const freeze = value => Object.freeze(value);

  const definitions = {
    people: {
      id: 'people',
      kind: 'shared-business-capability',
      purpose: 'Manage people/parties that may act as customers, patients, contacts, or other business persons.',
      owns: ['party identity', 'contact details', 'party status'],
      excludes: ['clinical history', 'dental findings', 'retail pricing', 'restaurant workflow'],
      entities: ['party', 'contact'],
      repositoryStores: ['people'],
      api: ['list', 'get', 'create', 'update', 'search']
    },
    appointments: {
      id: 'appointments',
      kind: 'shared-business-capability',
      purpose: 'Schedule appointments and queue/availability workflows.',
      owns: ['appointment lifecycle', 'queue state', 'appointment scheduling'],
      excludes: ['clinical diagnosis', 'treatment rules', 'restaurant kitchen workflow'],
      entities: ['appointment', 'queue-entry'],
      repositoryStores: ['appointments'],
      api: ['list', 'get', 'create', 'update', 'cancel', 'search']
    },
    catalog: {
      id: 'catalog',
      kind: 'shared-business-capability',
      purpose: 'Represent sellable or deliverable products/services and their base definitions.',
      owns: ['catalog identity', 'service/product definition', 'base pricing metadata'],
      excludes: ['dental treatment rules', 'inventory quantities', 'clinical outcomes'],
      entities: ['catalog-item', 'service'],
      repositoryStores: ['catalog'],
      api: ['list', 'get', 'create', 'update', 'search']
    },
    inventory: {
      id: 'inventory',
      kind: 'shared-business-capability',
      purpose: 'Track stock quantities and stock movements for products that require inventory.',
      owns: ['stock levels', 'stock movements', 'inventory availability'],
      excludes: ['supplier contracts', 'sales order lifecycle', 'clinical treatment'],
      entities: ['stock-item', 'stock-movement'],
      repositoryStores: ['inventory'],
      api: ['getBalance', 'recordMovement', 'listMovements']
    },
    purchasing: {
      id: 'purchasing',
      kind: 'shared-business-capability',
      purpose: 'Manage supplier-side purchasing workflows.',
      owns: ['purchase lifecycle', 'supplier references', 'purchase lines'],
      excludes: ['sales orders', 'clinical procurement rules'],
      entities: ['supplier', 'purchase', 'purchase-line'],
      repositoryStores: ['purchasing'],
      api: ['list', 'get', 'create', 'update', 'receive']
    },
    sales: {
      id: 'sales',
      kind: 'shared-business-capability',
      purpose: 'Manage customer-facing orders/sales independently of industry-specific fulfillment.',
      owns: ['order lifecycle', 'order lines', 'sales totals'],
      excludes: ['restaurant kitchen workflow', 'dental treatment plans'],
      entities: ['order', 'order-line'],
      repositoryStores: ['sales'],
      api: ['list', 'get', 'create', 'update', 'cancel']
    },
    billing: {
      id: 'billing',
      kind: 'shared-business-capability',
      purpose: 'Provide reusable monetary calculations and receivable semantics.',
      owns: ['amount normalization', 'balance calculation', 'change calculation', 'financial summary'],
      excludes: ['payment-provider integration', 'clinical pricing rules', 'tax policy unless configured by product/instance'],
      entities: ['charge', 'payment', 'receivable'],
      repositoryStores: ['billing'],
      api: ['normalizeAmount', 'calculateBalance', 'calculateChange', 'summarizeReceivables']
    },
    receipts: {
      id: 'receipts',
      kind: 'shared-business-capability',
      purpose: 'Represent receipt/invoice issuance records and lifecycle independent of industry.',
      owns: ['document numbering contract', 'receipt/invoice record lifecycle', 'receipt status'],
      excludes: ['print rendering', 'clinical content', 'provider/cloud storage'],
      entities: ['receipt', 'invoice'],
      repositoryStores: ['receipts'],
      api: ['create', 'get', 'update', 'delete', 'list']
    },
    staff: {
      id: 'staff',
      kind: 'shared-business-capability',
      purpose: 'Represent staff membership, roles, and operational permissions.',
      owns: ['staff identity', 'role assignment', 'staff status'],
      excludes: ['platform authentication implementation', 'clinical authorization decisions'],
      entities: ['staff-member', 'role-assignment'],
      repositoryStores: ['staff'],
      api: ['list', 'get', 'create', 'update', 'assignRole']
    },
    branches: {
      id: 'branches',
      kind: 'shared-business-capability',
      purpose: 'Represent operational branches/locations within one tenant.',
      owns: ['branch identity', 'branch status', 'operational location metadata'],
      excludes: ['tenant identity/security boundary'],
      entities: ['branch'],
      repositoryStores: ['branches'],
      api: ['list', 'get', 'create', 'update']
    },
    reporting: {
      id: 'reporting',
      kind: 'shared-business-capability',
      purpose: 'Provide reusable reporting/analytics contracts over authorized business data.',
      owns: ['report definitions', 'report query contracts', 'aggregated business views'],
      excludes: ['new source-of-truth data', 'vertical clinical interpretation'],
      entities: ['report-definition', 'report-view'],
      repositoryStores: [],
      api: ['define', 'run', 'export']
    },
    documents: {
      id: 'documents',
      kind: 'shared-business-capability',
      purpose: 'Manage business documents and attachments without owning vertical meaning.',
      owns: ['document metadata', 'attachment references', 'document lifecycle'],
      excludes: ['receipt rendering engine', 'clinical interpretation'],
      entities: ['document', 'attachment'],
      repositoryStores: ['documents'],
      api: ['list', 'get', 'create', 'delete']
    },
    messaging: {
      id: 'messaging',
      kind: 'shared-business-capability',
      purpose: 'Provide generic outbound/in-app messaging contracts.',
      owns: ['message intent', 'delivery status', 'notification preference contract'],
      excludes: ['provider credentials', 'clinical advice content'],
      entities: ['message', 'notification'],
      repositoryStores: ['messages'],
      api: ['compose', 'send', 'schedule', 'status']
    },
    workflow: {
      id: 'workflow',
      kind: 'shared-business-capability',
      purpose: 'Represent generic business tasks and workflow state where a product needs it.',
      owns: ['task lifecycle', 'workflow state', 'assignment'],
      excludes: ['vertical-specific clinical or kitchen state machines'],
      entities: ['task', 'workflow-item'],
      repositoryStores: ['workflow'],
      api: ['create', 'transition', 'assign', 'list']
    }
  };

  const registry = Object.fromEntries(
    Object.entries(definitions).map(([id, definition]) => [
      id,
      freeze({
        ...definition,
        owns: freeze([...definition.owns]),
        excludes: freeze([...definition.excludes]),
        entities: freeze([...definition.entities]),
        repositoryStores: freeze([...definition.repositoryStores]),
        api: freeze([...definition.api])
      })
    ])
  );

  const manifest = freeze({
    schemaVersion: 1,
    layer: 'shared-business-capabilities',
    capabilities: freeze(registry)
  });

  function aqsa7GetSharedCapabilityManifest(){ return manifest; }
  function aqsa7GetSharedCapability(id){ return registry[id] || null; }
  function aqsa7ListSharedCapabilityIds(){ return Object.keys(registry); }

  function normalizeAmount(value){
    const amount = Number.parseFloat(value);
    return Number.isFinite(amount) && amount > 0 ? amount : 0;
  }

  function calculateBalance(total, paid){
    return Math.max(0, normalizeAmount(total) - normalizeAmount(paid));
  }

  function calculateChange(total, paid){
    return Math.max(0, normalizeAmount(paid) - normalizeAmount(total));
  }

  function summarizeReceivables(records){
    const items = Array.isArray(records) ? records : [];
    return items.reduce((summary, item) => {
      summary.count += 1;
      summary.total += normalizeAmount(item?.total);
      summary.paid += normalizeAmount(item?.paid);
      summary.balance += normalizeAmount(item?.balance ?? calculateBalance(item?.total, item?.paid));
      return summary;
    }, {count:0,total:0,paid:0,balance:0});
  }

  const billingContract = freeze({
    normalizeAmount,
    calculateBalance,
    calculateChange,
    summarizeReceivables
  });

  window.AQSA7_SHARED_CAPABILITY_MANIFEST = manifest;
  window.aqsa7GetSharedCapabilityManifest = aqsa7GetSharedCapabilityManifest;
  window.aqsa7GetSharedCapability = aqsa7GetSharedCapability;
  window.aqsa7ListSharedCapabilityIds = aqsa7ListSharedCapabilityIds;
  window.aqsa7BillingContract = billingContract;
})();
