import { query } from '../database/connection';

export interface AgendaPayload {
  tipoUser: string;
  registro: string;
  data: string;
  horaInicio?: string;
  horaFim?: string;
  status?: number;
  idMembro: number;
  idAluno: number;
}

export class AgendaRepository {
  async listar(filtros: { idAluno?: number; idMembro?: number; dataInicio?: string; dataFim?: string }) {
    const clauses: string[] = [];
    const params: unknown[] = [];
    const push = (clause: string, value: unknown) => {
      params.push(value);
      clauses.push(clause.replace('?', `$${params.length}`));
    };

    if (filtros.idAluno) push('id_aluno = ?', filtros.idAluno);
    if (filtros.idMembro) push('id_membro = ?', filtros.idMembro);
    if (filtros.dataInicio) push('data >= ?', filtros.dataInicio);
    if (filtros.dataFim) push('data <= ?', filtros.dataFim);

    const result = await query(
      `SELECT id_agenda AS "idAgenda", tipo_user AS "tipoUser", registro, data,
              hora_inicio AS "horaInicio", hora_fim AS "horaFim", status,
              id_membro AS "idMembro", id_aluno AS "idAluno"
       FROM agenda
       ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''}
       ORDER BY data ASC, hora_inicio ASC NULLS LAST, id_agenda ASC`,
      params
    );
    return result.rows;
  }

  async criar(payload: AgendaPayload) {
    const result = await query(
      `INSERT INTO agenda (tipo_user, registro, data, hora_inicio, hora_fim, status, id_membro, id_aluno)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 1), $7, $8)
       RETURNING id_agenda AS "idAgenda", tipo_user AS "tipoUser", registro, data,
                 hora_inicio AS "horaInicio", hora_fim AS "horaFim", status,
                 id_membro AS "idMembro", id_aluno AS "idAluno"`,
      [payload.tipoUser, payload.registro, payload.data, payload.horaInicio ?? null, payload.horaFim ?? null, payload.status ?? 1, payload.idMembro, payload.idAluno]
    );
    return result.rows[0];
  }

  async atualizar(idAgenda: number, payload: Partial<AgendaPayload>) {
    const entries = Object.entries({
      tipo_user: payload.tipoUser,
      registro: payload.registro,
      data: payload.data,
      hora_inicio: payload.horaInicio,
      hora_fim: payload.horaFim,
      status: payload.status,
      id_membro: payload.idMembro,
      id_aluno: payload.idAluno
    }).filter(([, value]) => value !== undefined);

    if (entries.length === 0) {
      return this.obter(idAgenda);
    }

    const sets = entries.map(([column], index) => `${column} = $${index + 1}`);
    const params = entries.map(([, value]) => value);
    params.push(idAgenda);

    const result = await query(
      `UPDATE agenda SET ${sets.join(', ')} WHERE id_agenda = $${params.length}
       RETURNING id_agenda AS "idAgenda", tipo_user AS "tipoUser", registro, data,
                 hora_inicio AS "horaInicio", hora_fim AS "horaFim", status,
                 id_membro AS "idMembro", id_aluno AS "idAluno"`,
      params
    );
    return result.rows[0] || null;
  }

  async cancelar(idAgenda: number) {
    const result = await query(
      `UPDATE agenda SET status = 0 WHERE id_agenda = $1
       RETURNING id_agenda AS "idAgenda", tipo_user AS "tipoUser", registro, data,
                 hora_inicio AS "horaInicio", hora_fim AS "horaFim", status,
                 id_membro AS "idMembro", id_aluno AS "idAluno"`,
      [idAgenda]
    );
    return result.rows[0] || null;
  }

  async obter(idAgenda: number) {
    const result = await query(
      `SELECT id_agenda AS "idAgenda", tipo_user AS "tipoUser", registro, data,
              hora_inicio AS "horaInicio", hora_fim AS "horaFim", status,
              id_membro AS "idMembro", id_aluno AS "idAluno"
       FROM agenda WHERE id_agenda = $1`,
      [idAgenda]
    );
    return result.rows[0] || null;
  }
}
