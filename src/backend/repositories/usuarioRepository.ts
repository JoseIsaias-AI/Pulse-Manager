import { QueryResultRow } from 'pg';
import { query } from '../database/connection';

export type PerfilLogin = 'gestor' | 'psicologo' | 'aluno';

export interface UsuarioLoginRecord {
  id: number;
  email: string;
  nome: string;
  perfil: PerfilLogin;
}

export class UsuarioRepository {
  async findOneByEmailNomeAndPerfil(
    email: string,
    nome: string,
    perfil: PerfilLogin
  ): Promise<UsuarioLoginRecord | null> {
    const consultas: Record<PerfilLogin, string> = {
      aluno: `
        SELECT id_aluno AS id, email, nome, 'aluno' AS perfil
        FROM aluno
        WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
          AND LOWER(TRIM(nome)) = LOWER(TRIM($2))
      `,
      psicologo: `
        SELECT id_psi AS id, email, nome_psi AS nome, 'psicologo' AS perfil
        FROM psicologo
        WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
          AND LOWER(TRIM(nome_psi)) = LOWER(TRIM($2))
      `,
      gestor: `
        SELECT id_membro AS id, email, nome, 'gestor' AS perfil
        FROM membro_equipe
        WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
          AND LOWER(TRIM(nome)) = LOWER(TRIM($2))
          AND LOWER(CAST(cargo AS TEXT)) = 'gestor'
      `
    };

    const result = await query<UsuarioLoginRecord & QueryResultRow>(consultas[perfil], [email, nome]);
    return result.rows[0] || null;
  }
}
