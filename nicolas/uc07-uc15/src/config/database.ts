export const databaseConfig = {
  provider: 'supabase-postgres',
  ssl: process.env.DATABASE_SSL !== 'false'
};
