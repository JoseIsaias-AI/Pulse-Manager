import { PayloadValidationError } from './errors';

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function assertIsoDate(value: string | undefined, field: string): string | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  if (!isIsoDate(value)) {
    throw new PayloadValidationError(`O campo ${field} deve estar no formato YYYY-MM-DD.`);
  }

  return value;
}
