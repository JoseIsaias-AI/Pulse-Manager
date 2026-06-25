import { app } from './backend/app';
import { env } from './backend/config/env';
import { initializeDatabase } from './backend/database/connection';
import { seedLocalDevelopmentDatabase } from './backend/database/localSeed';
import { RiscoEvasaoRepository } from './backend/repositories/riscoEvasaoRepository';
import { RiscoEvasaoService } from './backend/services/riscoEvasaoService';

const port = env.port;

initializeDatabase()
  .then(async () => {
    if (env.database.type === 'sqljs' && env.isDevelopment) {
      await seedLocalDevelopmentDatabase();
    }

    await new RiscoEvasaoService(new RiscoEvasaoRepository()).recalcularTodos();

    app.listen(port, () => {
      console.log(`Servidor Pulse Mais rodando na porta ${port}`);
      console.log(`Aplicacao web: http://localhost:${port}/`);
      console.log(`Healthcheck: http://localhost:${port}/api/health`);
      console.log(`Supabase/db check: http://localhost:${port}/api/health/supabase`);
    });
  })
  .catch((err) => {
    console.error('Falha ao conectar ao banco de dados:', err);
    process.exit(1);
  });
