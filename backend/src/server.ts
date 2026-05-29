import dotenv from 'dotenv';
import { app } from './app';
import { initializeDatabase } from './database/connection';

dotenv.config();

const port = Number(process.env.PORT || 3002);

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`API Pulse Manager rodando em http://localhost:${port}`);
      console.log(`Healthcheck: http://localhost:${port}/api/health`);
      console.log(`Frequencias UC-08: http://localhost:${port}/api/frequencias`);
      console.log(`Participacoes UC-09: http://localhost:${port}/api/participacoes`);
    });
  })
  .catch((err) => {
    console.error('Falha ao conectar ao banco de dados:', err);
    process.exit(1);
  });
