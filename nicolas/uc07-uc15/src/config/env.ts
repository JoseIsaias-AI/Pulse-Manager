export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3002),
  databaseUrl: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
};
