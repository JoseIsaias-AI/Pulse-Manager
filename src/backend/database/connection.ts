import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { QueryResult, QueryResultRow } from 'pg';
import { buildDataSourceOptions } from '../config/database';

export const AppDataSource = new DataSource(buildDataSourceOptions());

export async function initializeDatabase(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  return AppDataSource;
}

/**
 * Executa SQL raw usando AppDataSource (TypeORM).
 * Em testes usa sqljs (in-memory). Em producao usa PostgreSQL/Supabase.
 * Retorna no mesmo formato de pg.Pool.query() para compatibilidade com os repositories.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const rows = (await AppDataSource.query(text, params)) as T[];
  return {
    rows,
    rowCount: rows.length,
    command: '',
    oid: 0,
    fields: []
  } as unknown as QueryResult<T>;
}

export async function pingDatabase(): Promise<void> {
  await query('SELECT 1 AS ok');
}
