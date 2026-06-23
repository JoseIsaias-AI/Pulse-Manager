import { query } from '../database/connection';
import { AlunoRecord, AlunoRepository } from './alunoRepository';
import { AtualizarEmpregabilidadePayload, AtualizarEnsinoSuperiorPayload } from '../models/jornadaModel';

export interface AtividadeRecord {
  idAtividade: number;
  titulo: string;
  tipo: string;
  descricao: string | null;
  data: string | null;
  modalidade: string | null;
  cargaHoraria: number | null;
}

export interface ParticipacaoRecord {
  idPart: number;
  dataPart: string;
  statusPart: boolean;
  idAluno: number;
  idAtividade: number;
  nota: number | null;
  certificado: boolean | null;
  atividade?: AtividadeRecord;
}

export interface AnotacaoQualitativaRecord {
  idAnotacao: number;
  idAluno: number;
  titulo: string;
  descricao: string;
  autor: string;
  dataRegistro: string;
}

// Sem casts PG-específicos (::text, ::float) para compatibilidade com sqljs nos testes
const ATIVIDADE_SELECT = `
  SELECT id_atividade AS "idAtividade", titulo, tipo, descricao, data,
         modalidade, carga_horaria AS "cargaHoraria"
  FROM atividade
`;

function mapParticipacao(row: Record<string, unknown>): ParticipacaoRecord {
  const atividade = row.atividadeTitulo
    ? {
      idAtividade: row.idAtividade as number,
      titulo: row.atividadeTitulo as string,
      tipo: row.atividadeTipo as string,
      descricao: row.atividadeDescricao as string | null,
      data: row.atividadeData as string | null,
      modalidade: row.atividadeModalidade as string | null,
      cargaHoraria: row.atividadeCargaHoraria as number | null
    }
    : undefined;

  // SQLite retorna booleanos como 0/1; forçar conversão para compatibilidade entre envs
  return {
    idPart: row.idPart as number,
    dataPart: row.dataPart as string,
    statusPart: Boolean(row.statusPart),
    idAluno: row.idAluno as number,
    idAtividade: row.idAtividade as number,
    nota: row.nota === null ? null : Number(row.nota),
    certificado: row.certificado === null ? null : Boolean(row.certificado),
    atividade
  };
}

export class JornadaRepository {
  private readonly alunoRepository = new AlunoRepository();

  async findAlunoById(idAluno: number): Promise<AlunoRecord | null> {
    return this.alunoRepository.findById(idAluno);
  }

  async findAtividadeById(idAtividade: number): Promise<AtividadeRecord | null> {
    const result = await query<AtividadeRecord & Record<string, unknown>>(
      `${ATIVIDADE_SELECT} WHERE id_atividade = $1`,
      [idAtividade]
    );
    return result.rows[0] || null;
  }

  async listAtividades(tipo?: string): Promise<AtividadeRecord[]> {
    const where = tipo ? 'WHERE tipo = $1' : '';
    const params = tipo ? [tipo] : [];
    const result = await query<AtividadeRecord & Record<string, unknown>>(
      `${ATIVIDADE_SELECT} ${where} ORDER BY titulo ASC`,
      params
    );
    return result.rows;
  }

  async findParticipacaoByAlunoAtividade(
    idAluno: number,
    idAtividade: number
  ): Promise<ParticipacaoRecord | null> {
    const result = await query(
      `SELECT id_part AS "idPart", data_part AS "dataPart", status_part AS "statusPart",
              id_aluno AS "idAluno", id_atividade AS "idAtividade",
              CAST(nota AS REAL) AS nota, certificado
       FROM participacao
       WHERE id_aluno = $1 AND id_atividade = $2`,
      [idAluno, idAtividade]
    );
    return result.rows[0] ? mapParticipacao(result.rows[0] as Record<string, unknown>) : null;
  }

  async saveParticipacao(payload: Partial<ParticipacaoRecord>): Promise<ParticipacaoRecord> {
    if (payload.idPart) {
      const result = await query(
        `UPDATE participacao
         SET status_part = $1, nota = $2, data_part = $3, certificado = COALESCE($4, certificado)
         WHERE id_part = $5
         RETURNING id_part AS "idPart", data_part AS "dataPart", status_part AS "statusPart",
                   id_aluno AS "idAluno", id_atividade AS "idAtividade",
                   CAST(nota AS REAL) AS nota, certificado`,
        [payload.statusPart, payload.nota ?? null, payload.dataPart, payload.certificado ?? null, payload.idPart]
      );
      return mapParticipacao(result.rows[0] as Record<string, unknown>);
    }

    const result = await query(
      `INSERT INTO participacao (id_aluno, id_atividade, status_part, nota, data_part, certificado)
       VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE), COALESCE($6, false))
       RETURNING id_part AS "idPart", data_part AS "dataPart", status_part AS "statusPart",
                 id_aluno AS "idAluno", id_atividade AS "idAtividade",
                 CAST(nota AS REAL) AS nota, certificado`,
      [payload.idAluno, payload.idAtividade, payload.statusPart ?? false, payload.nota ?? null, payload.dataPart ?? null, payload.certificado ?? false]
    );
    return mapParticipacao(result.rows[0] as Record<string, unknown>);
  }

  async listParticipacoesByAluno(idAluno: number): Promise<ParticipacaoRecord[]> {
    const result = await query(
      `SELECT p.id_part AS "idPart", p.data_part AS "dataPart", p.status_part AS "statusPart",
              p.id_aluno AS "idAluno", p.id_atividade AS "idAtividade",
              CAST(p.nota AS REAL) AS nota, p.certificado,
              a.titulo AS "atividadeTitulo", a.tipo AS "atividadeTipo",
              a.descricao AS "atividadeDescricao",
              a.data AS "atividadeData", a.modalidade AS "atividadeModalidade",
              a.carga_horaria AS "atividadeCargaHoraria"
       FROM participacao p
       JOIN atividade a ON a.id_atividade = p.id_atividade
       WHERE p.id_aluno = $1
       ORDER BY p.data_part DESC, p.id_part DESC`,
      [idAluno]
    );
    return result.rows.map((r) => mapParticipacao(r as Record<string, unknown>));
  }

  async updateEmpregabilidade(
    idAluno: number,
    payload: AtualizarEmpregabilidadePayload
  ): Promise<AlunoRecord> {
    const aluno = await this.alunoRepository.updateEmpregabilidade(idAluno, payload);
    if (!aluno) throw new Error('Aluno nao encontrado apos atualizar empregabilidade.');
    return aluno;
  }

  async updateEnsinoSuperior(idAluno: number, payload: AtualizarEnsinoSuperiorPayload): Promise<AlunoRecord> {
    const aluno = await this.alunoRepository.updateEnsinoSuperior(idAluno, payload);
    if (!aluno) throw new Error('Aluno nao encontrado apos atualizar ensino superior.');
    return aluno;
  }

  async saveAnotacao(payload: Partial<AnotacaoQualitativaRecord>): Promise<AnotacaoQualitativaRecord> {
    const result = await query<AnotacaoQualitativaRecord & Record<string, unknown>>(
      `INSERT INTO anotacao_qualitativa (id_aluno, titulo, descricao, autor, data_registro)
       VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE))
       RETURNING id_anotacao AS "idAnotacao", id_aluno AS "idAluno", titulo, descricao, autor,
                 data_registro AS "dataRegistro"`,
      [payload.idAluno, payload.titulo, payload.descricao, payload.autor, payload.dataRegistro ?? null]
    );
    return result.rows[0];
  }

  async listAnotacoesByAluno(idAluno: number): Promise<AnotacaoQualitativaRecord[]> {
    const result = await query<AnotacaoQualitativaRecord & Record<string, unknown>>(
      `SELECT id_anotacao AS "idAnotacao", id_aluno AS "idAluno", titulo, descricao, autor,
              data_registro AS "dataRegistro"
       FROM anotacao_qualitativa
       WHERE id_aluno = $1
       ORDER BY data_registro DESC, id_anotacao DESC`,
      [idAluno]
    );
    return result.rows;
  }
}
