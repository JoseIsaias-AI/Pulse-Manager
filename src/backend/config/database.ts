import 'reflect-metadata';
import { DataSourceOptions } from 'typeorm';
import { env } from './env';
import { Aluno } from '../models/alunoModel';
import { AnotacaoQualitativa } from '../models/anotacaoQualitativaModel';
import { Atividade } from '../models/atividadeModel';
import { Participacao } from '../models/participacaoModel';
import { Psicologo, MembroEquipe } from '../models/usuarioModel';
import { HistoricoPsicologico } from '../models/SaudeMentalModel';
import { Label } from '../models/LabelModel';
import { Agenda } from '../models/AgendaModel';
import { Notificacao, Oportunidade } from '../models/NotificacaoModel';
import { SolicitacaoApoioPsicologico } from '../models/ApoioPsicologicoModel';

export const appEntities = [
  Aluno,
  Atividade,
  Participacao,
  AnotacaoQualitativa,
  Psicologo,
  MembroEquipe,
  HistoricoPsicologico,
  Label,
  Agenda,
  Notificacao,
  Oportunidade,
  SolicitacaoApoioPsicologico
];

export interface DatabaseConnectionInfo {
  type: string;
  provider: 'sqljs' | 'supabase' | 'postgres';
  usingConnectionString: boolean;
  ssl: boolean;
  host?: string;
  database?: string;
}

function sslOption(): false | { rejectUnauthorized: false } {
  return env.database.ssl ? { rejectUnauthorized: false } : false;
}

function isSupabaseUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes('supabase.co') || url.includes('pooler.supabase.com');
}

export function getDatabaseConnectionInfo(): DatabaseConnectionInfo {
  if (env.database.type === 'sqljs') {
    return {
      type: 'sqljs',
      provider: 'sqljs',
      usingConnectionString: false,
      ssl: false
    };
  }

  const provider = isSupabaseUrl(env.database.url) || Boolean(env.supabase.url) ? 'supabase' : 'postgres';

  return {
    type: 'postgres',
    provider,
    usingConnectionString: Boolean(env.database.url),
    ssl: env.database.ssl,
    host: env.database.url ? undefined : env.database.host,
    database: env.database.url ? undefined : env.database.database
  };
}

export function buildDataSourceOptions(): DataSourceOptions {
  if (env.database.type === 'sqljs') {
    return {
      type: 'sqljs',
      autoSave: false,
      entities: appEntities,
      synchronize: true,
      dropSchema: env.isTest,
      logging: false
    };
  }

  if (env.database.url) {
    return {
      type: 'postgres',
      url: env.database.url,
      ssl: sslOption(),
      entities: appEntities,
      synchronize: false,
      logging: false
    };
  }

  return {
    type: 'postgres',
    host: env.database.host,
    port: env.database.port,
    username: env.database.username,
    password: env.database.password,
    database: env.database.database,
    ssl: sslOption(),
    entities: appEntities,
    synchronize: false,
    logging: false
  };
}
