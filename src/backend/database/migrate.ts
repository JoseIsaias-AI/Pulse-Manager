import fs from 'fs';
import path from 'path';
import { pool } from './pool';

async function migrate() {
  try {
    const migrationPath = path.join(__dirname, 'migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Rodando migration...');
    await pool.query(sql);

    console.log('Migration executada com sucesso');
  } catch (error) {
    console.error('Erro ao executar migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();