export function formatarCodigoPm(ano: string, sequencial: number): string {
  return `PM-${ano}-${String(sequencial).padStart(3, '0')}`;
}

export function extrairSequencial(codigoPm: string): number {
  return parseInt(codigoPm.split('-')[2], 10) || 0;
}
