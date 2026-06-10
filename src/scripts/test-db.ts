import { AppDataSource, initializeDatabase, pingDatabase } from '../backend/database/connection';
import { getDatabaseConnectionInfo } from '../backend/config/database';
import { isSupabaseClientConfigured } from '../backend/integrations/supabaseClient';

async function main() {
  const connection = getDatabaseConnectionInfo();

  try {
    await initializeDatabase();
    await pingDatabase();

    console.log(JSON.stringify({
      status: 'ok',
      database: {
        connected: true,
        ...connection
      },
      supabase: {
        httpClientConfigured: isSupabaseClientConfigured()
      }
    }, null, 2));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido ao testar banco.';

    console.error(JSON.stringify({
      status: 'error',
      database: {
        connected: false,
        ...connection,
        message
      },
      supabase: {
        httpClientConfigured: isSupabaseClientConfigured()
      }
    }, null, 2));

    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

main();
