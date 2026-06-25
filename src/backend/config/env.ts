import dotenv from 'dotenv';

dotenv.config();

export type DatabaseType = 'postgres' | 'sqljs';

function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined) return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function firstEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = optionalEnv(name);
    if (value) return value;
  }

  return undefined;
}

function numberEnv(name: string, fallback: number): number {
  const value = optionalEnv(name);
  if (!value) return fallback;

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`A variavel ${name} deve ser numerica.`);
  }

  return parsed;
}

function booleanEnv(name: string, fallback: boolean): boolean {
  const value = optionalEnv(name);
  if (!value) return fallback;

  return ['true', '1', 'yes', 'y', 'sim'].includes(value.toLowerCase());
}

function databaseTypeEnv(nodeEnv: string): DatabaseType {
  const configuredType = firstEnv('DB_TYPE', 'DB_MODE');
  const hasPostgresConfig = Boolean(
    firstEnv(
      'DATABASE_URL',
      'SUPABASE_DB_URL',
      'DB_HOST',
      'DB_USERNAME',
      'DB_USER',
      'DB_PASSWORD',
      'DB_DATABASE',
      'DB_NAME'
    )
  );
  const value = (
    configuredType ||
    (nodeEnv === 'test' || !hasPostgresConfig ? 'sqljs' : 'postgres')
  ).toLowerCase();

  if (value !== 'postgres' && value !== 'sqljs') {
    throw new Error('DB_TYPE deve ser "postgres" ou "sqljs".');
  }

  return value;
}

const nodeEnv = optionalEnv('NODE_ENV') || 'development';
const databaseUrl = firstEnv('DATABASE_URL', 'SUPABASE_DB_URL');

export const env = {
  nodeEnv,
  isTest: nodeEnv === 'test',
  isDevelopment: nodeEnv === 'development',
  port: numberEnv('PORT', 3000),
  database: {
    type: databaseTypeEnv(nodeEnv),
    url: databaseUrl,
    ssl: booleanEnv('DATABASE_SSL', Boolean(databaseUrl)),
    host: firstEnv('DB_HOST') || 'localhost',
    port: numberEnv('DB_PORT', 5432),
    username: firstEnv('DB_USERNAME', 'DB_USER') || 'postgres',
    password: firstEnv('DB_PASSWORD') || 'postgres',
    database: firstEnv('DB_DATABASE', 'DB_NAME') || 'pulse_uc13'
  },
  supabase: {
    url: optionalEnv('SUPABASE_URL'),
    anonKey: firstEnv('SUPABASE_ANON_KEY', 'SUPABASE_PUBLISHABLE_KEY'),
    serviceRoleKey: firstEnv('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY'),
    dbUrl: databaseUrl
  },
  auditoria: {
    url: optionalEnv('AUDITORIA_URL'),
    dashboardUrl: optionalEnv('AUDITORIA_URL_DASHBOARD')
  }
};

export function hasSupabaseHttpConfig(): boolean {
  return Boolean(env.supabase.url && (env.supabase.serviceRoleKey || env.supabase.anonKey));
}

export function getMissingSupabaseHttpConfig(): string[] {
  const missing: string[] = [];

  if (!env.supabase.url) missing.push('SUPABASE_URL');
  if (!env.supabase.serviceRoleKey && !env.supabase.anonKey) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY');
  }

  return missing;
}
