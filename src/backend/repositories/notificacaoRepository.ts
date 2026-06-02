import { query } from '../database/connection';

export interface NotificacaoPayload {
  titulo: string;
  idAluno: number;
  mensagem: string;
  tipo: string;
  idRemetente: number;
  tipoRemetente: string;
  nomeRemetente: string;
  dataEnvio?: string;
}

export interface OportunidadePayload {
  titulo: string;
  descricao?: string;
  tipo: string;
  prazoInscricao?: string;
  idMembro: number;
}

export class NotificacaoRepository {
  async listar(idAluno?: number) {
    const params: unknown[] = [];
    const where = idAluno ? 'WHERE id_aluno = $1' : '';
    if (idAluno) params.push(idAluno);

    const result = await query(
      `SELECT id_notificacao AS "idNotificacao", titulo, id_aluno AS "idAluno", mensagem,
              data_envio AS "dataEnvio", tipo, id_remetente AS "idRemetente",
              tipo_remetente AS "tipoRemetente", nome_remetente AS "nomeRemetente"
       FROM notificacao
       ${where}
       ORDER BY data_envio DESC, id_notificacao DESC`,
      params
    );
    return result.rows;
  }

  async criar(payload: NotificacaoPayload) {
    const result = await query(
      `INSERT INTO notificacao (titulo, id_aluno, mensagem, data_envio, tipo, id_remetente, tipo_remetente, nome_remetente)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5, $6, $7, $8)
       RETURNING id_notificacao AS "idNotificacao", titulo, id_aluno AS "idAluno", mensagem,
                 data_envio AS "dataEnvio", tipo`,
      [payload.titulo, payload.idAluno, payload.mensagem, payload.dataEnvio ?? null, payload.tipo, payload.idRemetente, payload.tipoRemetente, payload.nomeRemetente]
    );
    return result.rows[0];
  }

  async listarOportunidades() {
    const result = await query(
      `SELECT id_oportunidade AS "idOportunidade", titulo, descricao, tipo,
              data_publicacao AS "dataPublicacao", prazo_inscricao AS "prazoInscricao",
              id_membro AS "idMembro"
       FROM oportunidade
       ORDER BY data_publicacao DESC, id_oportunidade DESC`
    );
    return result.rows;
  }

  async criarOportunidade(payload: OportunidadePayload) {
    const result = await query(
      `INSERT INTO oportunidade (titulo, descricao, tipo, prazo_inscricao, id_membro)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_oportunidade AS "idOportunidade", titulo, descricao, tipo,
                 data_publicacao AS "dataPublicacao", prazo_inscricao AS "prazoInscricao"`,
      [payload.titulo, payload.descricao ?? null, payload.tipo, payload.prazoInscricao ?? null, payload.idMembro]
    );
    return result.rows[0];
  }
}
