/* AQSA7 Shared Business Capability Registry
 * One authoritative contract for reusable business capabilities.
 * No persistence implementation, DOM, provider, or vertical-domain ownership lives here. dataCollections are logical data contracts only; the repository owns the physical IndexedDB stores.
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
      dataCollections: ['people'],
      api: ['list', 'get', 'create', 'update', 'search']
    },
    appointments: {
      id: 'appointments',
      kind: 'shared-business-capability',
      purpose: 'Schedule appointments and queue/availability workflows.',
      owns: ['appointment lifecycle', 'queue state', 'appointment scheduling'],
      excludes: ['clinical diagnosis', 'treatment rules', 'restaurant kitchen workflow'],
      entities: ['appointment', 'queue-entry'],
      dataCollections: ['appointments'],
      api: ['list', 'get', 'create', 'update', 'cancel', 'search']
    },
    catalog: {
      id: 'catalog',
      kind: 'shared-business-capability',
      purpose: 'Represent sellable or deliverable products/services and their base definitions.',
      owns: ['catalog identity', 'service/product definition', 'base pricing metadata'],
      excludes: ['dental treatment rules', 'inventory quantities', 'clinical outcomes'],
      entities: ['catalog-item', 'service'],
      dataCollections: ['catalog'],
      api: ['list', 'get', 'create', 'update', 'search']
    },
    inventory: {
      id: 'inventory',
      kind: 'shared-business-capability',
      purpose: 'Track stock quantities and stock movements for products that require inventory.',
      owns: ['stock levels', 'stock movements', 'inventory availability'],
      excludes: ['supplier contracts', 'sales order lifecycle', 'clinical treatment'],
      entities: ['stock-item', 'stock-movement'],
      dataCollections: ['inventory'],
      api: ['getBalance', 'recordMovement', 'listMovements']
    },
    purchasing: {
      id: 'purchasing',
      kind: 'shared-business-capability',
      purpose: 'Manage supplier-side purchasing workflows.',
      owns: ['purchase lifecycle', 'supplier references', 'purchase lines'],
      excludes: ['sales orders', 'clinical procurement rules'],
      entities: ['supplier', 'purchase', 'purchase-line'],
      dataCollections: ['purchasing'],
      api: ['list', 'get', 'create', 'update', 'receive']
    },
    sales: {
      id: 'sales',
      kind: 'shared-business-capability',
      purpose: 'Manage customer-facing orders/sales independently of industry-specific fulfillment.',
      owns: ['order lifecycle', 'order lines', 'sales totals'],
      excludes: ['restaurant kitchen workflow', 'dental treatment plans'],
      entities: ['order', 'order-line'],
      dataCollections: ['sales'],
      api: ['list', 'get', 'create', 'update', 'cancel']
    },
    billing: {
      id: 'billing',
      kind: 'shared-business-capability',
      purpose: 'Provide reusable monetary calculations and receivable semantics.',
      owns: ['amount normalization', 'balance calculation', 'change calculation', 'financial summary'],
      excludes: ['payment-provider integration', 'clinical pricing rules', 'tax policy unless configured by product/instance'],
      entities: ['charge', 'payment', 'receivable'],
      dataCollections: ['billing'],
      api: ['normalizeAmount', 'calculateBalance', 'calculateChange', 'summarizeReceivables']
    },
    receipts: {
      id: 'receipts',
      kind: 'shared-business-capability',
      purpose: 'Represent receipt/invoice issuance records and lifecycle independent of industry.',
      owns: ['document numbering contract', 'receipt/invoice record lifecycle', 'receipt status', 'void/cancel semantics'],
      excludes: ['print rendering', 'clinical content', 'provider/cloud storage'],
      entities: ['receipt', 'invoice'],
      dataCollections: ['receipts'],
      api: ['create', 'get', 'update', 'delete', 'list', 'transitionStatus'],
      statusValues: ['issued', 'voided']
    },
    staff: {
      id: 'staff',
      kind: 'shared-business-capability',
      purpose: 'Represent staff membership, roles, and operational permissions.',
      owns: ['staff identity', 'role assignment', 'staff status'],
      excludes: ['platform authentication implementation', 'clinical authorization decisions'],
      entities: ['staff-member', 'role-assignment'],
      dataCollections: ['staff'],
      api: ['list', 'get', 'create', 'update', 'assignRole']
    },
    branches: {
      id: 'branches',
      kind: 'shared-business-capability',
      purpose: 'Represent operational branches/locations within one tenant.',
      owns: ['branch identity', 'branch status', 'operational location metadata'],
      excludes: ['tenant identity/security boundary'],
      entities: ['branch'],
      dataCollections: ['branches'],
      api: ['list', 'get', 'create', 'update']
    },
    reporting: {
      id: 'reporting',
      kind: 'shared-business-capability',
      purpose: 'Provide reusable reporting/analytics contracts over authorized business data.',
      owns: ['report definitions', 'report query contracts', 'aggregated business views'],
      excludes: ['new source-of-truth data', 'vertical clinical interpretation'],
      entities: ['report-definition', 'report-view'],
      dataCollections: [],
      api: ['define', 'run', 'export']
    },
    documents: {
      id: 'documents',
      kind: 'shared-business-capability',
      purpose: 'Manage business documents and attachments without owning vertical meaning.',
      owns: ['document metadata', 'attachment references', 'document lifecycle'],
      excludes: ['receipt rendering engine', 'clinical interpretation'],
      entities: ['document', 'attachment'],
      dataCollections: ['documents'],
      api: ['list', 'get', 'create', 'delete']
    },
    messaging: {
      id: 'messaging',
      kind: 'shared-business-capability',
      purpose: 'Provide generic outbound/in-app messaging contracts.',
      owns: ['message intent', 'delivery status', 'notification preference contract'],
      excludes: ['provider credentials', 'clinical advice content'],
      entities: ['message', 'notification'],
      dataCollections: ['messages'],
      api: ['compose', 'send', 'schedule', 'status']
    },
    workflow: {
      id: 'workflow',
      kind: 'shared-business-capability',
      purpose: 'Represent generic business tasks and workflow state where a product needs it.',
      owns: ['task lifecycle', 'workflow state', 'assignment'],
      excludes: ['vertical-specific clinical or kitchen state machines'],
      entities: ['task', 'workflow-item'],
      dataCollections: ['workflow'],
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
        dataCollections: freeze([...definition.dataCollections]),
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

  function normalizeReceiptStatus(value){
    return value === 'voided' ? 'voided' : 'issued';
  }

  function transitionReceiptStatus(record, targetStatus, metadata = {}){
    const current = normalizeReceiptStatus(record?.status);
    const target = normalizeReceiptStatus(targetStatus);
    if (current === target) return {...(record || {}), status: current};
    if (current === 'voided') throw new Error('AQSA7_RECEIPT_ALREADY_VOIDED');
    if (target !== 'voided') throw new Error('AQSA7_RECEIPT_INVALID_STATUS_TRANSITION');
    const reason = String(metadata.reason || '').trim();
    if (!reason) throw new Error('AQSA7_RECEIPT_VOID_REASON_REQUIRED');
    return {...(record || {}), status:'voided', voidedAt:metadata.at || new Date().toISOString(), voidReason:reason};
  }

  const receiptLifecycleContract = freeze({
    statusValues: freeze(['issued', 'voided']),
    normalizeStatus: normalizeReceiptStatus,
    transitionStatus: transitionReceiptStatus
  });

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
  window.aqsa7ReceiptLifecycleContract = receiptLifecycleContract;
  window.aqsa7BillingContract = billingContract;
})();
