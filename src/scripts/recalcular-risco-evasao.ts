import { AppDataSource, initializeDatabase } from '../backend/database/connection';
import { RiscoEvasaoRepository } from '../backend/repositories/riscoEvasaoRepository';
import { RiscoEvasaoService } from '../backend/services/riscoEvasaoService';

async function main(): Promise<void> {
  await initializeDatabase();

  const service = new RiscoEvasaoService(new RiscoEvasaoRepository());
  const resumo = await service.recalcularTodos();

  console.log(
    `Risco de evasao recalculado: ${resumo.atualizados}/${resumo.processados} alunos atualizados; ` +
    `${resumo.semDadosSuficientes} mantidos sem alteracao por falta de dados.`
  );
}

main()
  .catch((error) => {
    console.error('Falha ao recalcular o risco de evasao:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  });
