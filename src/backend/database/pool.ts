import { Pool } from 'pg';
import { env } from '../config/env';

function sslOption(): false | { rejectUnauthorized: false } {
  return env.database.ssl ? { rejectUnauthorized: false } : false;
}

function buildPool(): Pool {
  if (env.database.type === 'sqljs') {
    throw new Error('pool.ts usa pg/PostgreSQL e nao suporta DB_TYPE=sqljs.');
  }

  if (env.database.url) {
    return new Pool({
      connectionString: env.database.url,
      ssl: sslOption()
    });
  }

  return new Pool({
    host: env.database.host,
    port: env.database.port,
    user: env.database.username,
    password: env.database.password,
    database: env.database.database,
    ssl: sslOption()
  });
}

export const pool = buildPool();
