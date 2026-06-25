import { app } from './app';
import { env } from './config/env';
import { initializeDatabase } from './database/connection';
import { seedLocalDevelopmentDatabase } from './database/localSeed';
import { RiscoEvasaoRepository } from './repositories/riscoEvasaoRepository';
import { RiscoEvasaoService } from './services/riscoEvasaoService';

const port = env.port;

initializeDatabase()
  .then(async () => {
    if (env.database.type === 'sqljs' && env.isDevelopment) {
      await seedLocalDevelopmentDatabase();
    }

    await new RiscoEvasaoService(new RiscoEvasaoRepository()).recalcularTodos();

    app.listen(port, () => {
      console.log(`API Pulse Manager rodando em http://localhost:${port}`);
      console.log(`Healthcheck: http://localhost:${port}/api/health`);
      console.log(`Supabase/db check: http://localhost:${port}/api/health/supabase`);
      console.log(`Frequencias UC-08: http://localhost:${port}/api/frequencias`);
      console.log(`Participacoes UC-09: http://localhost:${port}/api/participacoes`);
    });
  })
  .catch((err) => {
    console.error('Falha ao conectar ao banco de dados:', err);
    process.exit(1);
  });
