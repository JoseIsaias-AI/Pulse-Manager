import { query } from '../database/connection';

export interface SolicitacaoApoioRecord {
  idSolicitacao: number;
  idAluno: number;
  idPsicologo: number;
  mensagem: string;
  status: string;
  dataCriacao: string;
}

export interface SolicitacaoApoioDetalhadaRecord extends SolicitacaoApoioRecord {
  nomeAluno: string;
  emailAluno: string;
}

export class ApoioPsicologicoRepository {
  async existeAluno(idAluno: number): Promise<boolean> {
    const result = await query('SELECT 1 FROM aluno WHERE id_aluno = $1 LIMIT 1', [idAluno]);
    return result.rows.length > 0;
  }

  async escolherPsicologoDisponivel(): Promise<number | null> {
    const result = await query<{ idPsicologo: number }>(
      `SELECT p.id_psi AS "idPsicologo"
       FROM psicologo p
       LEFT JOIN solicitacao_apoio_psicologico s
         ON s.id_psicologo = p.id_psi AND s.status = 'pendente'
       GROUP BY p.id_psi
       ORDER BY COUNT(s.id_solicitacao) ASC, p.id_psi ASC
       LIMIT 1`
    );

    return result.rows[0]?.idPsicologo ?? null;
  }

  async criar(idAluno: number, idPsicologo: number, mensagem: string): Promise<SolicitacaoApoioRecord> {
    const result = await query<SolicitacaoApoioRecord>(
      `INSERT INTO solicitacao_apoio_psicologico
         (id_aluno, id_psicologo, mensagem, status, data_criacao)
       VALUES ($1, $2, $3, 'pendente', CURRENT_TIMESTAMP)
       RETURNING
         id_solicitacao AS "idSolicitacao",
         id_aluno AS "idAluno",
         id_psicologo AS "idPsicologo",
         mensagem,
         status,
         data_criacao AS "dataCriacao"`,
      [idAluno, idPsicologo, mensagem]
    );

    return result.rows[0];
  }

  async listarPendentesPorPsicologo(idPsicologo: number): Promise<SolicitacaoApoioDetalhadaRecord[]> {
    const result = await query<SolicitacaoApoioDetalhadaRecord>(
      `SELECT
         s.id_solicitacao AS "idSolicitacao",
         s.id_aluno AS "idAluno",
         s.id_psicologo AS "idPsicologo",
         s.mensagem,
         s.status,
         s.data_criacao AS "dataCriacao",
         a.nome AS "nomeAluno",
         a.email AS "emailAluno"
       FROM solicitacao_apoio_psicologico s
       JOIN aluno a ON a.id_aluno = s.id_aluno
       WHERE s.id_psicologo = $1
         AND s.status = 'pendente'
       ORDER BY s.id_solicitacao DESC`,
      [idPsicologo]
    );

    return result.rows;
  }
}
