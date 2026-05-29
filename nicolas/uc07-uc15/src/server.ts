try {
  require('ts-node/register/transpile-only');
  require('./src/server.ts');
} catch (error) {
  console.error('Falha ao iniciar com TypeScript. Execute "npm install" e use "npm run dev".', error);
  process.exit(1);
}
