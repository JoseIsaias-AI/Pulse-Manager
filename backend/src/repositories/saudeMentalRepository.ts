import { pool } from '../database/pool';
import type { Prontuario, ProntuarioComAluno } from '../models/SaudeMentalModel';

export async function alunoExiste(idAluno: number): Promise<boolean> {
  const result = await pool.query('SELECT 1 FROM aluno WHERE id_aluno = $1', [idAluno]);
  return (result.rowCount ?? 0) > 0;
}

export async function psicologoExiste(idPsi: number): Promise<boolean> {
  const result = await pool.query('SELECT 1 FROM psicologo WHERE id_psi = $1', [idPsi]);
  return (result.rowCount ?? 0) > 0;
}

export async function criarProntuario(dados: {
  observacao: string;
  titulo: string;
  id_aluno: number;
  id_psi: number;
}): Promise<Prontuario> {
  const result = await pool.query<Prontuario>(
    `INSERT INTO historico_psicologico (observacao, titulo, id_aluno, id_psi)
     VALUES ($1, $2, $3, $4)
     RETURNING id_historico, observacao, titulo, id_aluno, id_psi`,
    [dados.observacao, dados.titulo, dados.id_aluno, dados.id_psi]
  );

  return result.rows[0];
}

export async function listarPorPsicologo(idPsi: number): Promise<ProntuarioComAluno[]> {
  const result = await pool.query<ProntuarioComAluno>(
    `SELECT
       hp.id_historico,
       hp.observacao,
       hp.titulo,
       hp.id_aluno,
       hp.id_psi,
       a.nome AS aluno_nome,
       a.email AS aluno_email
     FROM historico_psicologico hp
     INNER JOIN aluno a ON a.id_aluno = hp.id_aluno
     WHERE hp.id_psi = $1
     ORDER BY hp.id_historico DESC`,
    [idPsi]
  );

  return result.rows;
}
