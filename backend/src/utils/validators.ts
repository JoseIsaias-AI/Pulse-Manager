import { PayloadValidationError } from './errors';

/**
 * Converte um valor de query string para string trimmed, ou retorna undefined se ausente/vazio.
 */
export function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  return s === '' ? undefined : s;
}

/**
 * Converte um valor de query string para number, ou retorna undefined se ausente.
 * Lança PayloadValidationError se o valor estiver presente mas não for numérico.
 */
export function optionalNumber(value: unknown, campo: string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new PayloadValidationError(`O campo ${campo} deve ser um numero valido.`);
  }
  return n;
}

/**
 * Valida e retorna a string (trimmed) com comprimento mínimo.
 * Lança PayloadValidationError se nula, vazia ou abaixo do mínimo.
 */
export function requiredString(value: unknown, campo: string, minLength = 1): string {
  const str = value !== undefined && value !== null ? String(value).trim() : '';
  if (str.length < minLength) {
    throw new PayloadValidationError(
      minLength > 1
        ? `O campo ${campo} deve ter pelo menos ${minLength} caracteres.`
        : `O campo ${campo} e obrigatorio.`
    );
  }
  return str;
}

/**
 * Converte um valor de route param para inteiro positivo.
 * Lança PayloadValidationError se inválido.
 */
export function positiveInteger(value: unknown, campo: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) {
    throw new PayloadValidationError(`O campo ${campo} deve ser um numero inteiro positivo.`);
  }
  return n;
}

/**
 * Normaliza um texto: converte para minúsculas e remove espaços extras.
 */
export function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}
