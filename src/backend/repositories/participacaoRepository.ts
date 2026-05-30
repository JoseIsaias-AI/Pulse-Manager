import { query } from '../database/connection';

export interface ParticipacaoDesempenho {
  idPart: number;
  dataPart: string;
  statusPart: boolean;
  nota: number | null;
  idAtividade: number;
  tituloAtividade: string;
  tipoAtividade: string;
}

export class ParticipacaoRepository {
  async findByAluno(idAluno: number): Promise<ParticipacaoDesempenho[]> {
    const result = await query<ParticipacaoDesempenho>(
      `SELECT p.id_part AS "idPart",
              p.data_part AS "dataPart",
              p.status_part AS "statusPart",
              CAST(p.nota AS REAL) AS nota,
              a.id_atividade AS "idAtividade",
              a.titulo AS "tituloAtividade",
              a.tipo AS "tipoAtividade"
       FROM participacao p
       JOIN atividade a ON a.id_atividade = p.id_atividade
       WHERE p.id_aluno = $1
       ORDER BY p.data_part DESC`,
      [idAluno]
    );
    return result.rows.map(row => ({ ...row, statusPart: !!row.statusPart }));
  }
}
