import fs from 'fs';
import path from 'path';
import { query } from './pool';

async function runMigration(): Promise<void> {
  const migrationPath = path.join(__dirname, 'migration.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('Rodando migration no Supabase/Postgres...');
  await query(sql);
  console.log('Migration executada com sucesso.');
}

runMigration().catch((error) => {
  console.error('Erro ao executar migration:', error);
  process.exit(1);
});
