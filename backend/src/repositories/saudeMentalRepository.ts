import { query } from '../database/connection';

export interface SaudeMentalPayload {
  idAluno: number;
  idPsi: number;
  titulo: string;
  observacao: string;
}

export interface LabelPayload {
  idAluno: number;
  idPsi: number;
  descricao: string;
  tipoLabel: string;
}

export class SaudeMentalRepository {
  async listar(filtros: { idAluno?: number; idPsi?: number }) {
    const clauses: string[] = [];
    const params: unknown[] = [];
    const push = (clause: string, value: unknown) => {
      params.push(value);
      clauses.push(clause.replace('?', `$${params.length}`));
    };

    if (filtros.idAluno) push('h.id_aluno = ?', filtros.idAluno);
    if (filtros.idPsi) push('h.id_psi = ?', filtros.idPsi);

    const result = await query(
      `SELECT h.id_historico AS "idHistorico", h.titulo, h.observacao,
              h.id_aluno AS "idAluno", a.nome AS "nomeAluno",
              h.id_psi AS "idPsi", p.nome_psi AS "nomePsicologo"
       FROM historico_psicologico h
       JOIN aluno a ON a.id_aluno = h.id_aluno
       JOIN psicologo p ON p.id_psi = h.id_psi
       ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''}
       ORDER BY h.id_historico DESC`,
      params
    );
    return result.rows;
  }

  async criar(payload: SaudeMentalPayload) {
    const result = await query(
      `INSERT INTO historico_psicologico (titulo, observacao, id_aluno, id_psi)
       VALUES ($1, $2, $3, $4)
       RETURNING id_historico AS "idHistorico", titulo, observacao,
                 id_aluno AS "idAluno", id_psi AS "idPsi"`,
      [payload.titulo, payload.observacao, payload.idAluno, payload.idPsi]
    );
    return result.rows[0];
  }

  async listarLabels(filtros: { idAluno?: number; idPsi?: number }) {
    const clauses: string[] = [];
    const params: unknown[] = [];
    const push = (clause: string, value: unknown) => {
      params.push(value);
      clauses.push(clause.replace('?', `$${params.length}`));
    };

    if (filtros.idAluno) push('id_aluno = ?', filtros.idAluno);
    if (filtros.idPsi) push('id_psi = ?', filtros.idPsi);

    const result = await query(
      `SELECT id_lbl AS "idLabel", descricao, tipo_label AS "tipoLabel",
              id_aluno AS "idAluno", id_psi AS "idPsi"
       FROM label
       ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''}
       ORDER BY id_lbl DESC`,
      params
    );
    return result.rows;
  }

  async existeVinculo(idPsi: number, idAluno: number): Promise<boolean> {
    const result = await query(
      `SELECT 1 FROM historico_psicologico WHERE id_psi = $1 AND id_aluno = $2 LIMIT 1`,
      [idPsi, idAluno]
    );
    return result.rows.length > 0;
  }

  async criarLabel(payload: LabelPayload) {
    const result = await query(
      `INSERT INTO label (descricao, tipo_label, id_aluno, id_psi)
       VALUES ($1, $2, $3, $4)
       RETURNING id_lbl AS "idLabel", descricao, tipo_label AS "tipoLabel",
                 id_aluno AS "idAluno", id_psi AS "idPsi"`,
      [payload.descricao, payload.tipoLabel, payload.idAluno, payload.idPsi]
    );
    return result.rows[0];
  }
}
