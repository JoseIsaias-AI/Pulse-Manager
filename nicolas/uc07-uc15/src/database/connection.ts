import 'dotenv/config';
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { QueryResult, QueryResultRow } from 'pg';
import { Aluno } from '../models/alunoModel';
import { AnotacaoQualitativa } from '../models/anotacaoQualitativaModel';
import { Atividade } from '../models/atividadeModel';
import { Participacao } from '../models/participacaoModel';
import { Agenda } from '../models/AgendaModel';
import { Psicologo, MembroEquipe } from '../models/UsuarioModel';
import { Notificacao, Oportunidade } from '../models/NotificacaoModel';
import { HistoricoPsicologico } from '../models/SaudeMentalModel';
import { Label } from '../models/LabelModel';

const isTest = process.env.NODE_ENV === 'test';
// Usa sqljs somente quando explicitado OU quando está em modo de teste
const dbType = process.env.DB_TYPE || (isTest ? 'sqljs' : 'postgres');
const isSqlJs = dbType === 'sqljs';
const appEntities = [
  Aluno, Atividade, Participacao, AnotacaoQualitativa,
  Agenda, Psicologo, MembroEquipe, Notificacao, Oportunidade,
  HistoricoPsicologico, Label
];

function buildDataSourceOptions(): DataSourceOptions {
  if (isSqlJs) {
    return {
      type: 'sqljs',
      autoSave: false,
      entities: appEntities,
      synchronize: true,
      dropSchema: isTest,
      logging: false
    };
  }

  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (connectionString) {
    return {
      type: 'postgres',
      url: connectionString,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
      entities: appEntities,
      synchronize: false,
      logging: false
    };
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'pulse_uc13',
    entities: appEntities,
    synchronize: false,
    logging: false
  };
}

export const AppDataSource = new DataSource(buildDataSourceOptions());

export async function initializeDatabase(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
}

/**
 * Executa SQL raw usando AppDataSource (TypeORM).
 * Em testes usa sqljs (in-memory). Em produção usa PostgreSQL (Supabase).
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
