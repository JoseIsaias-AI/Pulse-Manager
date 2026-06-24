import { AlunoRecord, AtualizarAlunoPayload, CriarAlunoPayload } from '../repositories/alunoRepository';
import { ImportacaoRepository } from '../repositories/importacaoRepository';
import { RiscoEvasao, StatusAluno } from '../models/alunoModel';
import { parseCsv, toCsv } from '../utils/csv';
import { PayloadValidationError } from '../utils/errors';

interface ImportacaoErro {
  linha: number;
  motivo: string;
}

interface ImportacaoResumo {
  totalLinhas: number;
  importados: number;
  atualizados: number;
  ignorados: number;
  erros: ImportacaoErro[];
}

type AlunoImportPayload = CriarAlunoPayload & AtualizarAlunoPayload;

const GENEROS = new Set(['feminino', 'masculino', 'nao_binario', 'outro', 'prefiro_nao_informar']);
const STATUS = new Set(['ativo', 'inativo', 'egresso', 'desligado', 'em_acompanhamento']);

const CSV_HEADERS = [
  'codigoPm',
  'cpf',
  'nome',
  'email',
  'telefone',
  'idade',
  'genero',
  'ocupacao',
  'tipoVinculoEmpregaticio',
  'rendaMensal',
  'escolaridade',
  'instituicaoEnsinoSuperior',
  'cursoEnsinoSuperior',
  'statusEnsinoSuperior',
  'dataIngressoEnsinoSuperior',
  'dataIngresso',
  'programa',
  'categoria',
  'riscoEvasao',
  'engajamento',
  'status',
  'nivelJornada',
  'perfilSocioeconomico',
  'curso',
  'origemParticipacao'
];

const NOME_KEYS = ['nome', 'name', 'column_17', 'nome_e_sobrenome', 'nome_e_sobrenome_aluno', 'aluno', 'estudante'];
const EMAIL_KEYS = ['email', 'e_mail'];
const CPF_KEYS = ['cpf', 'documento', 'numero_cpf'];
const TELEFONE_KEYS = ['telefone', 'phone', 'celular', 'whatsapp'];
const PROGRAMA_KEYS = ['programa', 'programa_capacitado'];
const CATEGORIA_KEYS = ['categoria'];
const DATA_INGRESSO_KEYS = ['data_ingresso', 'data_de_ingresso', 'dataingresso', 'conectado_mes', 'capacitado_mes', 'data_transformado'];
const ORIGEM_KEYS = ['origem_participacao', 'origemparticipacao', 'evento_conectado'];
const CURSO_KEYS = ['curso'];
const TRANSFORMADO_KEYS = ['transformados'];
const DEFAULT_PROGRAMA = 'nao_informado';
const DEFAULT_CATEGORIA = 'sem_categoria';
const MAX_LENGTHS = {
  nome: 150,
  email: 255,
  cpf: 11,
  telefone: 30,
  ocupacao: 150,
  tipoVinculoEmpregaticio: 50,
  escolaridade: 100,
  instituicaoEnsinoSuperior: 150,
  cursoEnsinoSuperior: 150,
  statusEnsinoSuperior: 50,
  programa: 120,
  categoria: 60,
  nivelJornada: 50,
  perfilSocioeconomico: 150,
  curso: 150,
  origemParticipacao: 100
};

function firstValue(row: Record<string, string>, keys: string[]): string | undefined {
  const key = keys.find(candidate => row[candidate] !== undefined && row[candidate].trim() !== '');
  return key ? row[key].trim() : undefined;
}

function hasAnyHeader(headers: string[], keys: string[]): boolean {
  return keys.some(key => headers.includes(key));
}

function joinDistinct(...values: Array<string | undefined>): string | undefined {
  const parts = values
    .flatMap(value => (value || '').split('|'))
    .map(value => value.trim())
    .filter(Boolean);
  const unique = Array.from(new Set(parts));
  return unique.length > 0 ? unique.join(' | ') : undefined;
}

function truncate(value: string | undefined, maxLength: number): string | undefined {
  if (!value) return undefined;
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function trimPayloadToSchema(payload: AlunoImportPayload, applyDefaults = false): AlunoImportPayload {
  return {
    ...payload,
    nome: truncate(payload.nome, MAX_LENGTHS.nome) || payload.nome,
    email: truncate(payload.email, MAX_LENGTHS.email) || payload.email,
    cpf: truncate(payload.cpf, MAX_LENGTHS.cpf),
    telefone: truncate(payload.telefone, MAX_LENGTHS.telefone),
    ocupacao: truncate(payload.ocupacao, MAX_LENGTHS.ocupacao),
    tipoVinculoEmpregaticio: truncate(payload.tipoVinculoEmpregaticio, MAX_LENGTHS.tipoVinculoEmpregaticio),
    escolaridade: truncate(payload.escolaridade, MAX_LENGTHS.escolaridade),
    instituicaoEnsinoSuperior: truncate(payload.instituicaoEnsinoSuperior, MAX_LENGTHS.instituicaoEnsinoSuperior),
    cursoEnsinoSuperior: truncate(payload.cursoEnsinoSuperior, MAX_LENGTHS.cursoEnsinoSuperior),
    statusEnsinoSuperior: truncate(payload.statusEnsinoSuperior, MAX_LENGTHS.statusEnsinoSuperior),
    programa: truncate(payload.programa || (applyDefaults ? DEFAULT_PROGRAMA : undefined), MAX_LENGTHS.programa),
    categoria: truncate(payload.categoria || (applyDefaults ? DEFAULT_CATEGORIA : undefined), MAX_LENGTHS.categoria),
    nivelJornada: truncate(payload.nivelJornada, MAX_LENGTHS.nivelJornada),
    perfilSocioeconomico: truncate(payload.perfilSocioeconomico, MAX_LENGTHS.perfilSocioeconomico),
    curso: truncate(payload.curso, MAX_LENGTHS.curso),
    origemParticipacao: truncate(payload.origemParticipacao, MAX_LENGTHS.origemParticipacao)
  };
}

function normalizeEnum(value: string | undefined): string | undefined {
  return value
    ?.trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeIdentifier(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildFallbackEmail(nome: string, telefone: string | undefined, lineNumber: number): string {
  const phoneDigits = telefone?.replace(/\D/g, '');
  const identifier = phoneDigits || `${normalizeIdentifier(nome)}-${lineNumber}`;
  return `sem-email+${identifier}@pulsemais.local`;
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const numeric = Number(value.replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : Number.NaN;
}

function parseOptionalCpf(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, '');
  return digits || undefined;
}

function parseOptionalDate(value: string | undefined): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }

  const monthYear = trimmed.match(/^(\d{1,2})\/(\d{4})$/);
  if (monthYear) {
    return `${monthYear[2]}-${monthYear[1].padStart(2, '0')}-01`;
  }

  if (/^\d{4}$/.test(trimmed)) {
    return `${trimmed}-01-01`;
  }

  return trimmed;
}

function buildAlunoPayload(row: Record<string, string>, lineNumber: number): AlunoImportPayload {
  const nome = firstValue(row, NOME_KEYS);
  const rawEmail = firstValue(row, EMAIL_KEYS);
  const cpf = parseOptionalCpf(firstValue(row, CPF_KEYS));
  const telefone = firstValue(row, TELEFONE_KEYS);
  const idade = parseOptionalNumber(firstValue(row, ['idade', 'age']));
  const rendaMensal = parseOptionalNumber(firstValue(row, ['renda_mensal', 'rendamensal', 'renda']));
  const engajamento = parseOptionalNumber(firstValue(row, ['engajamento']));
  const genero = normalizeEnum(firstValue(row, ['genero', 'gender']));
  const status = normalizeEnum(firstValue(row, ['status', 'situacao']));
  const riscoEvasao = normalizeEnum(firstValue(row, ['risco_evasao', 'riscoevasao', 'risco']));
  const eventoConectado = firstValue(row, ORIGEM_KEYS);
  const transformado = firstValue(row, TRANSFORMADO_KEYS);

  if (!nome) {
    throw new PayloadValidationError(`Linha ${lineNumber}: o campo nome é obrigatório.`);
  }

  if (rawEmail && !rawEmail.includes('@')) {
    throw new PayloadValidationError(`Linha ${lineNumber}: o campo e-mail deve ser válido.`);
  }

  const email = rawEmail || buildFallbackEmail(nome, telefone, lineNumber);

  if (idade !== undefined && (!Number.isInteger(idade) || idade < 0 || idade > 120)) {
    throw new PayloadValidationError(`Linha ${lineNumber}: a idade deve ser um número inteiro entre 0 e 120.`);
  }

  if (genero && !GENEROS.has(genero)) {
    throw new PayloadValidationError(`Linha ${lineNumber}: gênero inválido.`);
  }

  if (status && !STATUS.has(status)) {
    throw new PayloadValidationError(`Linha ${lineNumber}: status inválido.`);
  }

  if (cpf && cpf.length !== 11) {
    throw new PayloadValidationError(`Linha ${lineNumber}: o CPF deve conter 11 dígitos.`);
  }

  if (riscoEvasao && !['baixo', 'medio', 'alto'].includes(riscoEvasao)) {
    throw new PayloadValidationError(`Linha ${lineNumber}: risco de evasão inválido.`);
  }

  if (engajamento !== undefined && (!Number.isInteger(engajamento) || engajamento < 0 || engajamento > 100)) {
    throw new PayloadValidationError(`Linha ${lineNumber}: o engajamento deve ser um número inteiro entre 0 e 100.`);
  }

  const payload: AlunoImportPayload = {
    nome,
    email: email.toLowerCase(),
    cpf,
    telefone,
    idade,
    genero,
    ocupacao: firstValue(row, ['ocupacao', 'profissao']),
    tipoVinculoEmpregaticio: firstValue(row, ['tipo_vinculo_empregaticio', 'tipovinculoempregaticio']),
    rendaMensal,
    escolaridade: firstValue(row, ['escolaridade']),
    instituicaoEnsinoSuperior: firstValue(row, ['instituicao_ensino_superior', 'instituicaoensinosuperior']),
    cursoEnsinoSuperior: firstValue(row, ['curso_ensino_superior', 'cursoensinosuperior']),
    statusEnsinoSuperior: firstValue(row, ['status_ensino_superior', 'statusensinosuperior']),
    dataIngressoEnsinoSuperior: parseOptionalDate(
      firstValue(row, ['data_ingresso_ensino_superior', 'dataingressoensinosuperior'])
    ),
    dataIngresso: parseOptionalDate(firstValue(row, DATA_INGRESSO_KEYS)),
    programa: firstValue(row, PROGRAMA_KEYS),
    categoria: firstValue(row, CATEGORIA_KEYS),
    riscoEvasao: riscoEvasao as RiscoEvasao | undefined,
    engajamento,
    status: status as StatusAluno | undefined,
    nivelJornada: firstValue(row, ['nivel_jornada', 'niveljornada']),
    perfilSocioeconomico: firstValue(row, ['perfil_socioeconomico', 'perfilsocioeconomico']),
    curso: firstValue(row, CURSO_KEYS),
    origemParticipacao: joinDistinct(eventoConectado, transformado)
  };

  Object.keys(payload).forEach(key => {
    if (payload[key as keyof AlunoImportPayload] === undefined) {
      delete payload[key as keyof AlunoImportPayload];
    }
  });

  return trimPayloadToSchema(payload);
}

function mergePayload(current: AlunoImportPayload | undefined, next: AlunoImportPayload): AlunoImportPayload {
  if (!current) return { ...next };

  return trimPayloadToSchema({
    ...current,
    nome: current.nome || next.nome,
    email: current.email || next.email,
    cpf: current.cpf || next.cpf,
    telefone: current.telefone || next.telefone,
    idade: current.idade ?? next.idade,
    genero: current.genero || next.genero,
    ocupacao: current.ocupacao || next.ocupacao,
    tipoVinculoEmpregaticio: current.tipoVinculoEmpregaticio || next.tipoVinculoEmpregaticio,
    rendaMensal: current.rendaMensal ?? next.rendaMensal,
    escolaridade: current.escolaridade || next.escolaridade,
    instituicaoEnsinoSuperior: current.instituicaoEnsinoSuperior || next.instituicaoEnsinoSuperior,
    cursoEnsinoSuperior: current.cursoEnsinoSuperior || next.cursoEnsinoSuperior,
    statusEnsinoSuperior: current.statusEnsinoSuperior || next.statusEnsinoSuperior,
    dataIngressoEnsinoSuperior: current.dataIngressoEnsinoSuperior || next.dataIngressoEnsinoSuperior,
    dataIngresso: [current.dataIngresso, next.dataIngresso].filter(Boolean).sort()[0],
    programa: joinDistinct(current.programa, next.programa),
    categoria: joinDistinct(current.categoria, next.categoria),
    riscoEvasao: current.riscoEvasao || next.riscoEvasao,
    engajamento: current.engajamento ?? next.engajamento,
    status: current.status || next.status,
    nivelJornada: joinDistinct(current.nivelJornada, next.nivelJornada),
    perfilSocioeconomico: current.perfilSocioeconomico || next.perfilSocioeconomico,
    curso: joinDistinct(current.curso, next.curso),
    origemParticipacao: joinDistinct(current.origemParticipacao, next.origemParticipacao)
  });
}

function alunoToCsvRow(aluno: AlunoRecord): Record<string, unknown> {
  return {
    codigoPm: aluno.codigoPm,
    cpf: aluno.cpf,
    nome: aluno.nome,
    email: aluno.email,
    telefone: aluno.telefone,
    idade: aluno.idade,
    genero: aluno.genero,
    ocupacao: aluno.ocupacao,
    tipoVinculoEmpregaticio: aluno.tipoVinculoEmpregaticio,
    rendaMensal: aluno.rendaMensal,
    escolaridade: aluno.escolaridade,
    instituicaoEnsinoSuperior: aluno.instituicaoEnsinoSuperior,
    cursoEnsinoSuperior: aluno.cursoEnsinoSuperior,
    statusEnsinoSuperior: aluno.statusEnsinoSuperior,
    dataIngressoEnsinoSuperior: aluno.dataIngressoEnsinoSuperior,
    dataIngresso: aluno.dataIngresso,
    programa: aluno.programa,
    categoria: aluno.categoria,
    riscoEvasao: aluno.riscoEvasao,
    engajamento: aluno.engajamento,
    status: aluno.status,
    nivelJornada: aluno.nivelJornada,
    perfilSocioeconomico: aluno.perfilSocioeconomico,
    curso: aluno.curso,
    origemParticipacao: aluno.origemParticipacao
  };
}

export class ImportacaoService {
  constructor(private readonly repository = new ImportacaoRepository()) {}

  async importarAlunosCsv(csv: string): Promise<{ success: true; data: ImportacaoResumo }> {
    if (!csv || csv.trim().length === 0) {
      throw new PayloadValidationError('Arquivo CSV vazio.');
    }

    const parsed = parseCsv(csv);
    if (!hasAnyHeader(parsed.headers, NOME_KEYS) || !hasAnyHeader(parsed.headers, EMAIL_KEYS)) {
      throw new PayloadValidationError('O CSV deve conter colunas de nome e e-mail. O modelo do parceiro também é aceito.');
    }

    const resumo: ImportacaoResumo = {
      totalLinhas: parsed.rows.length,
      importados: 0,
      atualizados: 0,
      ignorados: 0,
      erros: []
    };
    const alunosPorEmail = new Map<string, AlunoImportPayload>();

    for (const [index, row] of parsed.rows.entries()) {
      const lineNumber = index + 2;

      try {
        const payload = buildAlunoPayload(row, lineNumber);
        alunosPorEmail.set(payload.email, mergePayload(alunosPorEmail.get(payload.email), payload));
      } catch (error) {
        resumo.ignorados += 1;
        resumo.erros.push({
          linha: lineNumber,
          motivo: error instanceof Error ? error.message : 'Erro inesperado ao importar a linha.'
        });
      }
    }

    for (const payloadImportado of alunosPorEmail.values()) {
      const payloadAtualizacao = trimPayloadToSchema(payloadImportado);
      const alunoPorEmail = await this.repository.buscarAlunoPorEmail(payloadAtualizacao.email);
      const alunoExistente = alunoPorEmail || (
        payloadAtualizacao.cpf
          ? await this.repository.buscarAlunoPorCpf(payloadAtualizacao.cpf)
          : null
      );

      if (alunoExistente) {
        await this.repository.atualizarAluno(alunoExistente.idAluno, payloadAtualizacao);
        resumo.atualizados += 1;
      } else {
        const payloadCriacao = trimPayloadToSchema(payloadImportado, true);
        await this.repository.criarAluno(payloadCriacao as CriarAlunoPayload);
        resumo.importados += 1;
      }
    }

    return { success: true, data: resumo };
  }

  async exportarAlunosCsv(): Promise<string> {
    const alunos = await this.repository.listarAlunos();
    return toCsv(CSV_HEADERS, alunos.map(alunoToCsvRow));
  }
}
