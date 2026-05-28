import dotenv from 'dotenv';
import { app } from './src/app';

dotenv.config();

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Servidor Pulse Mais rodando na porta ${port}`);
});
