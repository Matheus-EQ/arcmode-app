import { createClient } from 'npm:@supabase/supabase-js@2';

const ACTIVE_EVENTS = new Set([
  'PURCHASE_APPROVED',
  'PURCHASE_COMPLETE',
  'SUBSCRIPTION_REACTIVATION',
  'SUBSCRIPTION_REACTIVATED'
]);

const EVENT_STATUS: Record<string, string> = {
  PURCHASE_DELAYED: 'past_due',
  PURCHASE_EXPIRED: 'expired',
  PURCHASE_REFUNDED: 'refunded',
  PURCHASE_CHARGEBACK: 'chargeback',
  PURCHASE_CANCELED: 'cancelled',
  PURCHASE_CANCELLED: 'cancelled',
  SUBSCRIPTION_CANCELLATION: 'cancelled',
  SUBSCRIPTION_CANCELLED: 'cancelled'
};

const jsonResponse = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' }
});

const secureEqual = (left: string, right: string) => {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
};

const firstValue = (...values: unknown[]) => values.find((value) => value !== undefined && value !== null && value !== '');

const toIso = (value: unknown) => {
  if (!value) return null;
  const numeric = typeof value === 'number' ? value : Number(value);
  const date = Number.isFinite(numeric)
    ? new Date(numeric < 10_000_000_000 ? numeric * 1000 : numeric)
    : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

Deno.serve(async (request) => {
  if (request.method !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' });

  const expectedHottok = Deno.env.get('HOTMART_HOTTOK') ?? '';
  const receivedHottok = request.headers.get('x-hotmart-hottok') ?? '';
  if (!expectedHottok || !secureEqual(receivedHottok, expectedHottok)) {
    return jsonResponse(401, { error: 'invalid_webhook_token' });
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }

  const event = String(payload?.event ?? '').toUpperCase();
  const mappedStatus = ACTIVE_EVENTS.has(event) ? 'active' : EVENT_STATUS[event];
  if (!mappedStatus) return jsonResponse(202, { accepted: true, ignored: true });

  const data = payload?.data ?? payload;
  const email = String(firstValue(
    data?.buyer?.email,
    data?.subscriber?.email,
    data?.subscription?.subscriber?.email
  ) ?? '').trim().toLowerCase();
  const transactionId = String(firstValue(data?.purchase?.transaction, data?.transaction) ?? '');
  const subscriptionId = String(firstValue(
    data?.subscription?.subscriber?.code,
    data?.subscription?.id,
    data?.subscriber?.code,
    data?.subscription_id
  ) ?? '');
  const externalKey = subscriptionId || transactionId;
  const productId = String(firstValue(data?.product?.id, data?.product?.ucode, data?.product_id) ?? '');
  const configuredProductId = Deno.env.get('HOTMART_PRODUCT_ID') ?? '';

  if (!email || !externalKey) return jsonResponse(400, { error: 'missing_buyer_or_purchase' });
  if (configuredProductId && productId !== configuredProductId) {
    return jsonResponse(202, { accepted: true, ignored: true });
  }

  const eventId = String(firstValue(payload?.id, data?.id) ?? `${event}:${transactionId || externalKey}`);
  const eventDate = toIso(firstValue(payload?.creation_date, data?.purchase?.approved_date, Date.now()));
  const accessUntil = toIso(firstValue(
    data?.subscription?.date_next_charge,
    data?.subscription?.end_accession_date
  ));

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse(500, { error: 'server_not_configured' });
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: existing, error: existingError } = await supabase
    .from('access_entitlements')
    .select('event_id,event_date')
    .eq('provider', 'hotmart')
    .eq('external_key', externalKey)
    .maybeSingle();
  if (existingError) return jsonResponse(500, { error: 'entitlement_lookup_failed' });

  if (existing?.event_id === eventId || (existing?.event_date && eventDate && existing.event_date > eventDate)) {
    return jsonResponse(200, { accepted: true, duplicate: true });
  }

  const record = {
    provider: 'hotmart',
    external_key: externalKey,
    buyer_email: email,
    product_id: productId || null,
    plan_name: String(firstValue(data?.subscription?.plan?.name, data?.plan?.name, data?.purchase?.offer?.code) ?? '') || null,
    transaction_id: transactionId || null,
    event_id: eventId,
    event_date: eventDate,
    status: mappedStatus,
    access_until: mappedStatus === 'cancelled' ? accessUntil : null,
    last_event: event
  };

  const { error: upsertError } = await supabase
    .from('access_entitlements')
    .upsert(record, { onConflict: 'provider,external_key' });
  if (upsertError) return jsonResponse(500, { error: 'entitlement_update_failed' });

  return jsonResponse(200, { accepted: true });
});
