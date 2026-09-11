import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { DEMO_USER_ID, demoStorageKey, isDemoMode } from '@/lib/demo-data';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const isBillingRequired = import.meta.env.VITE_BILLING_REQUIRED === 'true';
export const hotmartCheckoutUrl = import.meta.env.VITE_HOTMART_CHECKOUT_URL || '';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);
const isLocalDev = !isSupabaseConfigured && import.meta.env.DEV;
export const isDemoSession = isDemoMode();

const getLocalUser = () => {
  if (isDemoSession) {
    return { id: DEMO_USER_ID, email: 'demo@neurosync.local', full_name: 'Visitante Demo', is_demo: true };
  }
  const params = new URLSearchParams(window.location.search);
  const id = params.get('test_user') || 'local-user';

  return {
    id,
    email: `${id}@neurosync.dev`,
    full_name: id === 'local-user' ? 'Local NeuroSync' : id
  };
};

const readCollection = (entityName) => {
  const raw = localStorage.getItem(isDemoSession ? demoStorageKey(entityName) : `neurosync:${entityName}`);
  return raw ? JSON.parse(raw) : [];
};

const writeCollection = (entityName, records) => {
  localStorage.setItem(isDemoSession ? demoStorageKey(entityName) : `neurosync:${entityName}`, JSON.stringify(records));
};

const createLocalEntity = (entityName) => ({
  async filter(filters = {}, orderBy, limit) {
    let records = readCollection(entityName).filter((record) =>
      Object.entries(filters).every(([key, value]) => record[key] === value)
    );

    if (orderBy) {
      const desc = orderBy.startsWith('-');
      const field = desc ? orderBy.slice(1) : orderBy;
      records = [...records].sort((a, b) => {
        const left = a[field] ?? '';
        const right = b[field] ?? '';
        return desc ? String(right).localeCompare(String(left)) : String(left).localeCompare(String(right));
      });
    }

    return typeof limit === 'number' ? records.slice(0, limit) : records;
  },
  async create(data) {
    const now = new Date().toISOString();
    const record = {
      id: crypto.randomUUID(),
      created_by_id: getLocalUser().id,
      created_date: now,
      updated_date: now,
      ...data
    };
    const records = readCollection(entityName);
    writeCollection(entityName, [...records, record]);
    return record;
  },
  async update(id, data) {
    let updatedRecord = null;
    const records = readCollection(entityName).map((record) => {
      if (record.id !== id) return record;
      updatedRecord = { ...record, ...data, updated_date: new Date().toISOString() };
      return updatedRecord;
    });
    writeCollection(entityName, records);
    return updatedRecord;
  },
  async delete(id) {
    writeCollection(entityName, readCollection(entityName).filter((record) => record.id !== id));
    return { id };
  }
});

const createLocalClient = () => ({
  auth: {
    async me() {
      return getLocalUser();
    },
    logout() {
      return undefined;
    },
    redirectToLogin() {
      return undefined;
    },
    async deleteAccount() {
      throw new Error('Ações de conta não estão disponíveis na demonstração.');
    }
  },
  entities: {
    Player: createLocalEntity('Player'),
    Daily: createLocalEntity('Daily'),
    Boss: createLocalEntity('Boss'),
    HistoryLog: createLocalEntity('HistoryLog'),
    ProfessionalWorkspace: createLocalEntity('ProfessionalWorkspace')
  },
  billing: {
    async getEntitlement() {
      return { status: 'active', is_active: true, source: isDemoSession ? 'demo' : 'local-development' };
    }
  }
});

const tableMap = {
  Player: 'players',
  Daily: 'dailies',
  Boss: 'bosses',
  HistoryLog: 'history_logs',
  ProfessionalWorkspace: 'professional_workspaces'
};

/** @param {any} error */
const throwIfSupabaseError = (error) => {
  if (error) throw error;
};

const supabase = isSupabaseConfigured
  ? createSupabaseClient(supabaseUrl, supabasePublishableKey)
  : null;

export { supabase };

const createSupabaseEntity = (entityName) => {
  const tableName = tableMap[entityName];

  return {
    async filter(filters = {}, orderBy, limit) {
      let query = supabase.from(tableName).select('*');

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      if (orderBy) {
        const desc = orderBy.startsWith('-');
        query = query.order(desc ? orderBy.slice(1) : orderBy, { ascending: !desc });
      }

      if (typeof limit === 'number') {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      throwIfSupabaseError(error);
      return data ?? [];
    },
    async create(data) {
      const { data: record, error } = await supabase.from(tableName).insert(data).select('*').single();
      throwIfSupabaseError(error);
      return record;
    },
    async update(id, data) {
      const { data: record, error } = await supabase.from(tableName).update(data).eq('id', id).select('*').single();
      throwIfSupabaseError(error);
      return record;
    },
    async delete(id) {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      throwIfSupabaseError(error);
      return { id };
    }
  };
};

const createSupabaseFacade = () => ({
  auth: {
    async me() {
      const { data, error } = await supabase.auth.getUser();
      throwIfSupabaseError(error);
      if (!data?.user) {
        const authError = Object.assign(new Error('Authentication required'), { status: 401 });
        throw authError;
      }

      return {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Operador'
      };
    },
    async signIn({ email, password }) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      throwIfSupabaseError(error);
      return data;
    },
    async signUp({ email, password, name }) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: window.location.origin
        }
      });
      throwIfSupabaseError(error);
      return data;
    },
    async resetPasswordForEmail({ email }) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      throwIfSupabaseError(error);
      return data;
    },
    async updatePassword({ password }) {
      const { data, error } = await supabase.auth.updateUser({ password });
      throwIfSupabaseError(error);
      return data;
    },
    async logout() {
      await supabase.auth.signOut();
    },
    async deleteAccount() {
      const { error } = await supabase.rpc('delete_own_account');
      throwIfSupabaseError(error);
      await supabase.auth.signOut({ scope: 'local' });
    },
    redirectToLogin() {
      return undefined;
    },
    onAuthStateChange(callback) {
      return supabase.auth.onAuthStateChange(callback);
    }
  },
  entities: {
    Player: createSupabaseEntity('Player'),
    Daily: createSupabaseEntity('Daily'),
    Boss: createSupabaseEntity('Boss'),
    HistoryLog: createSupabaseEntity('HistoryLog'),
    ProfessionalWorkspace: createSupabaseEntity('ProfessionalWorkspace')
  },
  billing: {
    async getEntitlement() {
      const { error: claimError } = await supabase.rpc('claim_own_entitlement');
      throwIfSupabaseError(claimError);

      const { data, error } = await supabase
        .from('access_entitlements')
        .select('id,status,plan_name,access_until,provider,updated_date')
        .order('updated_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      throwIfSupabaseError(error);

      if (!data) return null;
      const accessUntil = data.access_until ? new Date(data.access_until) : null;
      const isWithinAccessPeriod = !accessUntil || accessUntil.getTime() > Date.now();
      const isActiveStatus = data.status === 'active' || data.status === 'trialing';
      const isCancelledWithRemainingAccess = data.status === 'cancelled' && Boolean(accessUntil) && isWithinAccessPeriod;

      return {
        ...data,
        is_active: isWithinAccessPeriod && (isActiveStatus || isCancelledWithRemainingAccess)
      };
    }
  }
});

/** @type {any} */
export const neurosync = isDemoSession
  ? createLocalClient()
  : isSupabaseConfigured
    ? createSupabaseFacade()
    : isLocalDev
      ? createLocalClient()
      : createLocalClient();
