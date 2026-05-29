import dotenv from 'dotenv';
import { Pool, QueryResult, QueryResultRow } from 'pg';

dotenv.config();

let poolInstance: Pool | null = null;

function hasDiscreteConnectionConfig(): boolean {
  return Boolean(process.env.DB_HOST && process.env.DB_DATABASE && process.env.DB_USERNAME);
}

function isPlaceholderConnectionString(connectionString: string): boolean {
  return (
    connectionString.includes('SEUPROJETO') ||
    connectionString.includes('[YOUR-PASSWORD]') ||
    connectionString.includes('SUA-SENHA')
  );
}

export function getPool(): Pool {
  if (poolInstance) {
    return poolInstance;
  }

  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

  if (connectionString) {
    if (isPlaceholderConnectionString(connectionString)) {
      throw new Error(
        'DATABASE_URL ainda esta com valor de exemplo. Substitua db.SEUPROJETO.supabase.co e [YOUR-PASSWORD] pelos dados reais do Supabase.'
      );
    }

    poolInstance = new Pool({
      connectionString,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
    });
    return poolInstance;
  }

  if (hasDiscreteConnectionConfig()) {
    poolInstance = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
    });
    return poolInstance;
  }

  throw new Error(
    'Configure DATABASE_URL/SUPABASE_DB_URL ou DB_HOST, DB_DATABASE e DB_USERNAME para acessar o Supabase.'
  );
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params);
}

export async function closePool(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
  }
}

export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    return Reflect.get(getPool(), prop);
  }
});
