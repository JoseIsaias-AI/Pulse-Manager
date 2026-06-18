import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { AppDataSource, initializeDatabase } from '../../backend/database/connection';

export async function setupIntegrationDatabase(): Promise<void> {
  await initializeDatabase();
}

export async function resetIntegrationDatabase(): Promise<void> {
  await AppDataSource.synchronize(true);
}

export async function teardownIntegrationDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
}

export function getIntegrationRepository<Entity extends ObjectLiteral>(
  entity: EntityTarget<Entity>
): Repository<Entity> {
  return AppDataSource.getRepository(entity);
}

export const NON_EXISTENT_ID = 9999;
