import { QueryResultRow } from 'pg';
import { query } from '../database/connection';

export type PerfilLogin = 'gestor' | 'psicologo' | 'aluno';

export interface UsuarioLoginRecord {
  id: number;
  cpf: string;
  nome: string;
  perfil: PerfilLogin;
  codigoPm: string | null;
}

export class UsuarioRepository {
  async findOneByCpfAndPerfil(cpf: string, perfil: PerfilLogin): Promise<UsuarioLoginRecord | null> {
    const consultas: Record<PerfilLogin, string> = {
      aluno: `
        SELECT id_aluno AS id, cpf, nome, 'aluno' AS perfil, codigo_pm AS "codigoPm"
        FROM aluno
        WHERE cpf = $1
      `,
      psicologo: `
        SELECT id_psi AS id, cpf, nome_psi AS nome, 'psicologo' AS perfil, NULL AS "codigoPm"
        FROM psicologo
        WHERE cpf = $1
      `,
      gestor: `
        SELECT id_membro AS id, cpf, nome, 'gestor' AS perfil, NULL AS "codigoPm"
        FROM membro_equipe
        WHERE cpf = $1 AND LOWER(CAST(cargo AS TEXT)) = 'gestor'
      `
    };

    const result = await query<UsuarioLoginRecord & QueryResultRow>(consultas[perfil], [cpf]);
    return result.rows[0] || null;
  }
}
