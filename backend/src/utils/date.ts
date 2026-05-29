import { PayloadValidationError } from './errors';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Valida que um valor está no formato ISO 8601 (YYYY-MM-DD).
 * Se o valor for undefined/null/vazio, não faz nada.
 * Lança PayloadValidationError (400) se o formato for inválido.
 */
export function assertIsoDate(value: string | null | undefined, campo: string): void {
  if (value === undefined || value === null || value === '') return;
  if (!ISO_DATE_RE.test(value)) {
    throw new PayloadValidationError(`O campo ${campo} deve estar no formato YYYY-MM-DD.`);
  }
}
