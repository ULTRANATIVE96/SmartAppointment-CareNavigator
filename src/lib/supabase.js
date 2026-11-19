import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const NOT_CONFIGURED_ERROR = {
  message: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
}

function createQueryStub() {
  const result = { data: null, error: NOT_CONFIGURED_ERROR }
  const builder = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') {
          return (resolve, reject) => Promise.resolve(result).then(resolve, reject)
        }
        return () => builder
      },
    }
  )
  return builder
}

function createChannelStub() {
  const channel = {
    on: () => channel,
    subscribe: () => channel,
    unsubscribe: async () => 'ok',
  }
  return channel
}

function createFallbackClient() {
  return {
    from: () => createQueryStub(),
    rpc: async () => ({ data: null, error: NOT_CONFIGURED_ERROR }),
    channel: () => createChannelStub(),
    removeChannel: async () => 'ok',
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: NOT_CONFIGURED_ERROR }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      setSession: async () => ({ data: { session: null, user: null }, error: NOT_CONFIGURED_ERROR }),
      signUp: async () => ({ data: { user: null, session: null }, error: NOT_CONFIGURED_ERROR }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: NOT_CONFIGURED_ERROR }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
  }
}

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase environment variables are missing. Running with fallback mock mode until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.')
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createFallbackClient()
