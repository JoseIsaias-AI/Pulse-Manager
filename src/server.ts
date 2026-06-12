import { app } from './backend/app';
import { env } from './backend/config/env';
import { initializeDatabase } from './backend/database/connection';

const port = env.port;

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor Pulse Mais rodando na porta ${port}`);
      console.log(`Healthcheck: http://localhost:${port}/api/health`);
      console.log(`Supabase/db check: http://localhost:${port}/api/health/supabase`);
    });
  })
  .catch((err) => {
    console.error('Falha ao conectar ao banco de dados:', err);
    process.exit(1);
  });
