import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { QueryResult, QueryResultRow } from 'pg';
import { buildDataSourceOptions } from '../config/database';

export const AppDataSource = new DataSource(buildDataSourceOptions());

async function ensureRuntimeSchema(dataSource: DataSource): Promise<void> {
  if (dataSource.options.type !== 'postgres') {
    return;
  }

  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS solicitacao_apoio_psicologico (
      id_solicitacao INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      id_aluno INTEGER NOT NULL,
      id_psicologo INTEGER NOT NULL,
      mensagem VARCHAR(500) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'pendente',
      data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno),
      FOREIGN KEY (id_psicologo) REFERENCES psicologo(id_psi)
    )
  `);
}

export async function initializeDatabase(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    await ensureRuntimeSchema(AppDataSource);
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
    await initializeDatabase();
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
