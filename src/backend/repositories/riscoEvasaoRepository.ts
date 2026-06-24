import { RiscoEvasao } from '../models/alunoModel';
import { query } from '../database/connection';

export interface IndicadoresRiscoEvasao {
  idAluno: number;
  engajamento: number;
  totalAulas: number;
  faltasAulas: number;
  totalAtividades: number;
  ausenciasAtividades: number;
  quantidadeNotas: number;
  mediaNotas: number | null;
}

export interface AtualizacaoRiscoEvasao {
  idAluno: number;
  probabilidade: number;
  classificacao: RiscoEvasao;
}

interface IndicadoresRow {
  idAluno: number | string;
  engajamento: number | string;
  totalAulas: number | string;
  faltasAulas: number | string;
  totalAtividades: number | string;
  ausenciasAtividades: number | string;
  quantidadeNotas: number | string;
  mediaNotas: number | string | null;
}

export class RiscoEvasaoRepository {
  async listarIndicadores(idAluno?: number): Promise<IndicadoresRiscoEvasao[]> {
    const filtroAluno = idAluno === undefined ? '' : 'WHERE al.id_aluno = $1';
    const params = idAluno === undefined ? [] : [idAluno];
    const result = await query<IndicadoresRow>(
      `SELECT al.id_aluno AS "idAluno",
              COALESCE(al.engajamento, 0) AS engajamento,
              SUM(CASE WHEN a.tipo = 'aula' THEN 1 ELSE 0 END) AS "totalAulas",
              SUM(CASE WHEN a.tipo = 'aula' AND p.status_part = false THEN 1 ELSE 0 END) AS "faltasAulas",
              SUM(CASE WHEN a.tipo IS NOT NULL AND a.tipo <> 'aula' THEN 1 ELSE 0 END) AS "totalAtividades",
              SUM(CASE WHEN a.tipo IS NOT NULL AND a.tipo <> 'aula' AND p.status_part = false THEN 1 ELSE 0 END) AS "ausenciasAtividades",
              SUM(CASE WHEN p.nota IS NOT NULL THEN 1 ELSE 0 END) AS "quantidadeNotas",
              AVG(CASE WHEN p.nota IS NOT NULL THEN CAST(p.nota AS REAL) ELSE NULL END) AS "mediaNotas"
       FROM aluno al
       LEFT JOIN participacao p ON p.id_aluno = al.id_aluno
       LEFT JOIN atividade a ON a.id_atividade = p.id_atividade
       ${filtroAluno}
       GROUP BY al.id_aluno, al.engajamento
       ORDER BY al.id_aluno`,
      params
    );

    return result.rows.map((row) => ({
      idAluno: Number(row.idAluno),
      engajamento: Number(row.engajamento),
      totalAulas: Number(row.totalAulas),
      faltasAulas: Number(row.faltasAulas),
      totalAtividades: Number(row.totalAtividades),
      ausenciasAtividades: Number(row.ausenciasAtividades),
      quantidadeNotas: Number(row.quantidadeNotas),
      mediaNotas: row.mediaNotas === null ? null : Number(row.mediaNotas)
    }));
  }

  async atualizarResultado(resultado: AtualizacaoRiscoEvasao): Promise<void> {
    await query(
      `UPDATE aluno
       SET risco_evasao = $1, probabilidade_evasao = $2
       WHERE id_aluno = $3`,
      [resultado.classificacao, resultado.probabilidade, resultado.idAluno]
    );
  }

  async atualizarResultados(resultados: AtualizacaoRiscoEvasao[]): Promise<void> {
    // Atualizacoes sequenciais mantem compatibilidade com PostgreSQL e sql.js.
    for (const resultado of resultados) {
      await this.atualizarResultado(resultado);
    }
  }
}
