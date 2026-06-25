import { QueryResultRow } from 'pg';
import { query } from '../database/connection';
import {
  EmpregabilidadeAluno,
  RiscoEvasao,
  SegmentacaoAlunoQuery,
  StatusAluno
} from '../models/alunoModel';
import { formatarCodigoPm, extrairSequencial } from '../services/codigoPmService';

export interface AlunoRecord {
  idAluno: number;
  codigoPm: string | null;
  cpf: string | null;
  nome: string;
  email: string;
  telefone: string | null;
  idade: number | null;
  genero: string | null;
  ocupacao: string | null;
  empregabilidade: EmpregabilidadeAluno;
  tipoVinculoEmpregaticio: string | null;
  rendaMensal: number | null;
  escolaridade: string | null;
  instituicaoEnsinoSuperior: string | null;
  cursoEnsinoSuperior: string | null;
  statusEnsinoSuperior: string | null;
  dataIngressoEnsinoSuperior: string | null;
  programa: string | null;
  categoria: string | null;
  riscoEvasao: string;
  probabilidadeEvasao: number | null;
  engajamento: number;
  frequencia: number;
  dataIngresso: string;
  status: string;
  nivelJornada: string | null;
  perfilSocioeconomico: string | null;
  curso: string | null;
  origemParticipacao: string | null;
}

export interface CriarAlunoPayload {
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  idade?: number;
  genero?: string;
  ocupacao?: string;
  tipoVinculoEmpregaticio?: string;
  rendaMensal?: number;
  escolaridade?: string;
  instituicaoEnsinoSuperior?: string;
  cursoEnsinoSuperior?: string;
  statusEnsinoSuperior?: string;
  dataIngressoEnsinoSuperior?: string;
  dataIngresso?: string;
  programa?: string;
  categoria?: string;
  riscoEvasao?: RiscoEvasao;
  engajamento?: number;
  frequencia?: number;
  status?: StatusAluno;
  nivelJornada?: string;
  perfilSocioeconomico?: string;
  curso?: string;
  origemParticipacao?: string;
}

export interface AtualizarAlunoPayload extends Partial<CriarAlunoPayload> {
  status?: StatusAluno;
  riscoEvasao?: RiscoEvasao;
}

export interface CadastroAlunoOptions {
  genero: string[];
  ocupacao: string[];
  tipoVinculoEmpregaticio: string[];
  escolaridade: string[];
  instituicaoEnsinoSuperior: string[];
  cursoEnsinoSuperior: string[];
  statusEnsinoSuperior: string[];
  programa: string[];
  categoria: string[];
  riscoEvasao: string[];
  status: string[];
  nivelJornada: string[];
  perfilSocioeconomico: string[];
  curso: string[];
  origemParticipacao: string[];
}

const CADASTRO_OPTION_COLUMNS: Record<keyof CadastroAlunoOptions, string> = {
  genero: 'genero',
  ocupacao: 'ocupacao',
  tipoVinculoEmpregaticio: 'tipo_vinculo_empregaticio',
  escolaridade: 'escolaridade',
  instituicaoEnsinoSuperior: 'instituicao_ensino_superior',
  cursoEnsinoSuperior: 'curso_ensino_superior',
  statusEnsinoSuperior: 'status_ensino_superior',
  programa: 'programa',
  categoria: 'categoria',
  riscoEvasao: 'risco_evasao',
  status: 'status',
  nivelJornada: 'nivel_jornada',
  perfilSocioeconomico: 'perfil_socioeconomico',
  curso: 'curso',
  origemParticipacao: 'origem_participacao'
};

// Sem casts PostgreSQL-específicos (::text, ::float) para compatibilidade com sqljs nos testes.
// PostgreSQL faz conversão implícita; sqljs não suporta sintaxe de cast do PG.
const EMPREGABILIDADE_SQL = `
  CASE
    WHEN TRIM(COALESCE(tipo_vinculo_empregaticio, '')) <> '' THEN 'empregado'
    WHEN LOWER(COALESCE(ocupacao, '')) LIKE '%desempreg%' OR LOWER(COALESCE(ocupacao, '')) LIKE '%buscando_emprego%' OR LOWER(COALESCE(ocupacao, '')) LIKE '%procurando%' THEN 'desempregado'
    WHEN LOWER(COALESCE(ocupacao, '')) LIKE '%estudante%' THEN 'estudante'
    WHEN TRIM(COALESCE(ocupacao, '')) = '' THEN 'nao_informado'
    ELSE 'empregado'
  END
`;

const ALUNO_SELECT = `
  SELECT
    id_aluno AS "idAluno",
    codigo_pm AS "codigoPm",
    cpf,
    nome,
    email,
    telefone,
    idade,
    genero,
    ocupacao,
    ${EMPREGABILIDADE_SQL} AS empregabilidade,
    tipo_vinculo_empregaticio AS "tipoVinculoEmpregaticio",
    CAST(renda_mensal AS REAL) AS "rendaMensal",
    escolaridade,
    instituicao_ensino_superior AS "instituicaoEnsinoSuperior",
    curso_ensino_superior AS "cursoEnsinoSuperior",
    status_ensino_superior AS "statusEnsinoSuperior",
    data_ingresso_ensino_superior AS "dataIngressoEnsinoSuperior",
    COALESCE(programa, curso, origem_participacao) AS programa,
    COALESCE(categoria, nivel_jornada, CAST(status AS TEXT)) AS categoria,
    COALESCE(risco_evasao, 'baixo') AS "riscoEvasao",
    CAST(probabilidade_evasao AS REAL) AS "probabilidadeEvasao",
    COALESCE(engajamento, 0) AS engajamento,
    COALESCE(frequencia, 0) AS frequencia,
    data_ingresso AS "dataIngresso",
    status,
    nivel_jornada AS "nivelJornada",
    perfil_socioeconomico AS "perfilSocioeconomico",
    curso,
    origem_participacao AS "origemParticipacao"
  FROM aluno
`;

function definedEntries(payload: Record<string, unknown>): Array<[string, unknown]> {
  return Object.entries(payload).filter(([, value]) => value !== undefined);
}

export class AlunoRepository {
  async getCadastroOptions(): Promise<CadastroAlunoOptions> {
    const entries = await Promise.all(
      Object.entries(CADASTRO_OPTION_COLUMNS).map(async ([field, column]) => {
        const result = await query<{ value: string } & QueryResultRow>(
          `SELECT DISTINCT ${column} AS value
           FROM aluno
           WHERE ${column} IS NOT NULL AND TRIM(CAST(${column} AS TEXT)) <> ''
           ORDER BY value`
        );
        return [field, result.rows.map((row) => String(row.value))] as const;
      })
    );

    return Object.fromEntries(entries) as unknown as CadastroAlunoOptions;
  }

  async list(filters: SegmentacaoAlunoQuery = {}): Promise<AlunoRecord[]> {
    const { where, params } = this.buildFilters(filters, false);
    const limit = filters.limite || 100;
    const sql = `${ALUNO_SELECT} ${where} ORDER BY nome ASC LIMIT $${params.length + 1}`;
    const result = await query<AlunoRecord & QueryResultRow>(sql, [...params, limit]);
    return result.rows;
  }

  async findSegmentados(filters: SegmentacaoAlunoQuery): Promise<AlunoRecord[]> {
    return this.list(filters);
  }

  async findById(idAluno: number): Promise<AlunoRecord | null> {
    const result = await query<AlunoRecord & QueryResultRow>(
      `${ALUNO_SELECT} WHERE id_aluno = $1`,
      [idAluno]
    );
    return result.rows[0] || null;
  }

  async findOneByEmail(email: string): Promise<AlunoRecord | null> {
    const result = await query<AlunoRecord & QueryResultRow>(
      `${ALUNO_SELECT} WHERE LOWER(email) = LOWER($1)`,
      [email]
    );
    return result.rows[0] || null;
  }

  async findOneByCpf(cpf: string): Promise<AlunoRecord | null> {
    const result = await query<AlunoRecord & QueryResultRow>(
      `${ALUNO_SELECT} WHERE cpf = $1`,
      [cpf]
    );
    return result.rows[0] || null;
  }

  async create(payload: CriarAlunoPayload): Promise<AlunoRecord> {
    // Sem cast ::genero_aluno_enum — PostgreSQL aceita string implicitamente para colunas enum
    const result = await query<{ idAluno: number } & QueryResultRow>(
      `INSERT INTO aluno (
        nome, email, cpf, telefone, idade, genero, ocupacao, tipo_vinculo_empregaticio,
        renda_mensal, escolaridade, instituicao_ensino_superior, curso_ensino_superior,
        status_ensino_superior, data_ingresso_ensino_superior, data_ingresso, programa,
        categoria, risco_evasao, engajamento, frequencia, status, nivel_jornada, perfil_socioeconomico,
        curso, origem_participacao
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        COALESCE($15, CURRENT_DATE), $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
      )
      RETURNING id_aluno AS "idAluno"`,
      [
        payload.nome,
        payload.email,
        payload.cpf ?? null,
        payload.telefone ?? null,
        payload.idade ?? null,
        payload.genero ?? null,
        payload.ocupacao ?? null,
        payload.tipoVinculoEmpregaticio ?? null,
        payload.rendaMensal ?? null,
        payload.escolaridade ?? null,
        payload.instituicaoEnsinoSuperior ?? null,
        payload.cursoEnsinoSuperior ?? null,
        payload.statusEnsinoSuperior ?? null,
        payload.dataIngressoEnsinoSuperior ?? null,
        payload.dataIngresso ?? null,
        payload.programa ?? payload.curso ?? 'nao_informado',
        payload.categoria ?? payload.nivelJornada ?? 'sem_categoria',
        payload.riscoEvasao ?? 'baixo',
        payload.engajamento ?? 0,
        payload.frequencia ?? 0,
        payload.status ?? 'ativo',
        payload.nivelJornada ?? null,
        payload.perfilSocioeconomico ?? null,
        payload.curso ?? null,
        payload.origemParticipacao ?? null
      ]
    );

    const idAluno = result.rows[0].idAluno;
    const ano = (payload.dataIngresso || new Date().toISOString()).slice(0, 4);

    const ultimoResult = await query<{ codigoPm: string }>(
      `SELECT codigo_pm AS "codigoPm" FROM aluno WHERE codigo_pm LIKE $1 ORDER BY codigo_pm DESC LIMIT 1`,
      [`PM-${ano}-%`]
    );
    const ultimoSeq = ultimoResult.rows[0] ? extrairSequencial(ultimoResult.rows[0].codigoPm) : 0;
    const codigoPm = formatarCodigoPm(ano, ultimoSeq + 1);

    await query('UPDATE aluno SET codigo_pm = $1 WHERE id_aluno = $2', [codigoPm, idAluno]);
    const aluno = await this.findById(idAluno);
    if (!aluno) {
      throw new Error('Aluno criado, mas nao encontrado apos persistencia.');
    }
    return aluno;
  }

  async update(idAluno: number, payload: AtualizarAlunoPayload): Promise<AlunoRecord | null> {
    const columnMap: Record<string, string> = {
      nome: 'nome',
      email: 'email',
      cpf: 'cpf',
      telefone: 'telefone',
      idade: 'idade',
      genero: 'genero',
      ocupacao: 'ocupacao',
      tipoVinculoEmpregaticio: 'tipo_vinculo_empregaticio',
      rendaMensal: 'renda_mensal',
      escolaridade: 'escolaridade',
      instituicaoEnsinoSuperior: 'instituicao_ensino_superior',
      cursoEnsinoSuperior: 'curso_ensino_superior',
      statusEnsinoSuperior: 'status_ensino_superior',
      dataIngressoEnsinoSuperior: 'data_ingresso_ensino_superior',
      dataIngresso: 'data_ingresso',
      programa: 'programa',
      categoria: 'categoria',
      nivelJornada: 'nivel_jornada',
      perfilSocioeconomico: 'perfil_socioeconomico',
      curso: 'curso',
      origemParticipacao: 'origem_participacao',
      status: 'status',
      riscoEvasao: 'risco_evasao',
      engajamento: 'engajamento',
      frequencia: 'frequencia'
    };

    const entries = definedEntries(payload as Record<string, unknown>);
    if (entries.length === 0) {
      return this.findById(idAluno);
    }

    const sets = entries.map(([key], index) => `${columnMap[key]} = $${index + 1}`);
    const values = entries.map(([, value]) => value);
    await query(
      `UPDATE aluno SET ${sets.join(', ')} WHERE id_aluno = $${values.length + 1}`,
      [...values, idAluno]
    );

    return this.findById(idAluno);
  }

  async updateContato(idAluno: number, email?: string, telefone?: string): Promise<AlunoRecord | null> {
    const sets: string[] = [];
    const params: unknown[] = [];

    if (email !== undefined) {
      params.push(email);
      sets.push(`email = $${params.length}`);
    }

    if (telefone !== undefined) {
      params.push(telefone);
      sets.push(`telefone = $${params.length}`);
    }

    if (sets.length === 0) {
      return this.findById(idAluno);
    }

    params.push(idAluno);
    await query(
      `UPDATE aluno SET ${sets.join(', ')} WHERE id_aluno = $${params.length}`,
      params
    );
    return this.findById(idAluno);
  }

  async updateEmpregabilidade(
    idAluno: number,
    payload: { ocupacao: string; tipoVinculoEmpregaticio?: string; rendaMensal?: number }
  ): Promise<AlunoRecord | null> {
    await query(
      `UPDATE aluno
       SET ocupacao = $1, tipo_vinculo_empregaticio = $2, renda_mensal = $3
       WHERE id_aluno = $4`,
      [payload.ocupacao, payload.tipoVinculoEmpregaticio ?? null, payload.rendaMensal ?? null, idAluno]
    );
    return this.findById(idAluno);
  }

  async updateEnsinoSuperior(
    idAluno: number,
    payload: {
      escolaridade: string;
      instituicaoEnsinoSuperior?: string;
      cursoEnsinoSuperior?: string;
      statusEnsinoSuperior?: string;
      dataIngressoEnsinoSuperior?: string;
    }
  ): Promise<AlunoRecord | null> {
    await query(
      `UPDATE aluno
       SET escolaridade = $1,
           instituicao_ensino_superior = $2,
           curso_ensino_superior = $3,
           status_ensino_superior = $4,
           data_ingresso_ensino_superior = $5
       WHERE id_aluno = $6`,
      [
        payload.escolaridade,
        payload.instituicaoEnsinoSuperior ?? null,
        payload.cursoEnsinoSuperior ?? null,
        payload.statusEnsinoSuperior ?? null,
        payload.dataIngressoEnsinoSuperior ?? null,
        idAluno
      ]
    );
    return this.findById(idAluno);
  }

  async softDeactivate(idAluno: number): Promise<AlunoRecord | null> {
    await query("UPDATE aluno SET status = 'inativo' WHERE id_aluno = $1", [idAluno]);
    return this.findById(idAluno);
  }

  private buildFilters(
    filters: SegmentacaoAlunoQuery,
    requireAny = false
  ): { where: string; params: unknown[] } {
    const clauses: string[] = [];
    const params: unknown[] = [];

    const push = (clause: string, value: unknown) => {
      params.push(value);
      clauses.push(clause.replace('?', `$${params.length}`));
    };

    if (filters.programa) push("LOWER(COALESCE(programa, curso, origem_participacao, '')) = LOWER(?)", filters.programa);
    if (filters.status) push('status = ?', filters.status);
    if (filters.risco) push("COALESCE(risco_evasao, 'baixo') = ?", filters.risco);
    if (filters.categoria) push("LOWER(COALESCE(categoria, nivel_jornada, '')) = LOWER(?)", filters.categoria);
    if (filters.ocupacao) push("LOWER(COALESCE(ocupacao, '')) = LOWER(?)", filters.ocupacao);
    if (filters.empregabilidade) push(`(${EMPREGABILIDADE_SQL}) = ?`, filters.empregabilidade);
    if (filters.escolaridade) push("LOWER(COALESCE(escolaridade, '')) = LOWER(?)", filters.escolaridade);
    if (filters.curso) push("LOWER(COALESCE(curso, '')) = LOWER(?)", filters.curso);
    if (filters.anoIngresso !== undefined) {
      push('data_ingresso >= ?', `${filters.anoIngresso}-01-01`);
      push('data_ingresso < ?', `${filters.anoIngresso + 1}-01-01`);
    }
    if (filters.busca) {
      push('(LOWER(nome) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?))', `%${filters.busca}%`);
      params.push(`%${filters.busca}%`);
      clauses[clauses.length - 1] = clauses[clauses.length - 1].replace('?', `$${params.length}`);
    }

    if (requireAny && clauses.length === 0) {
      return { where: 'WHERE false', params };
    }

    return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
  }
}
