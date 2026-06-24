import { QueryResultRow } from 'pg';
import { query } from '../database/connection';

export type PerfilLogin = 'gestor' | 'psicologo' | 'aluno';

export interface UsuarioLoginRecord {
  id: number;
  email: string;
  nome: string;
  perfil: PerfilLogin;
  codigoPm: string | null;
}

export class UsuarioRepository {
  async findByEmail(email: string): Promise<UsuarioLoginRecord[]> {
    const result = await query<UsuarioLoginRecord & QueryResultRow>(
      `
        SELECT id_aluno AS id, email, nome, 'aluno' AS perfil, codigo_pm AS "codigoPm"
        FROM aluno
        WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))

        UNION ALL

        SELECT id_psi AS id, email, nome_psi AS nome, 'psicologo' AS perfil, NULL AS "codigoPm"
        FROM psicologo
        WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))

        UNION ALL

        SELECT id_membro AS id, email, nome, 'gestor' AS perfil, NULL AS "codigoPm"
        FROM membro_equipe
        WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
          AND LOWER(CAST(cargo AS TEXT)) = 'gestor'
      `,
      [email]
    );

    return result.rows;
  }
}
