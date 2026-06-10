import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env, getMissingSupabaseHttpConfig, hasSupabaseHttpConfig } from '../config/env';

let client: SupabaseClient | null = null;

export function isSupabaseClientConfigured(): boolean {
  return hasSupabaseHttpConfig();
}

export function getSupabaseClient(): SupabaseClient {
  if (!hasSupabaseHttpConfig()) {
    throw new Error(
      `Supabase HTTP client nao configurado. Defina ${getMissingSupabaseHttpConfig().join(', ')}.`
    );
  }

  if (!client) {
    const key = env.supabase.serviceRoleKey || env.supabase.anonKey;

    client = createClient(env.supabase.url as string, key as string, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return client;
}
