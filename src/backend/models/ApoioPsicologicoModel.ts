import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type StatusSolicitacaoApoio = 'pendente' | 'em_atendimento' | 'cancelada' | 'concluida';

@Entity('solicitacao_apoio_psicologico')
export class SolicitacaoApoioPsicologico {
  @PrimaryGeneratedColumn({ name: 'id_solicitacao' })
  idSolicitacao!: number;

  @Column({ name: 'id_aluno', type: 'integer' })
  idAluno!: number;

  @Column({ name: 'id_psicologo', type: 'integer' })
  idPsicologo!: number;

  @Column({ type: 'varchar', length: 500 })
  mensagem!: string;

  @Column({ type: 'varchar', length: 30, default: 'pendente' })
  status!: StatusSolicitacaoApoio;

  @Column({ name: 'data_criacao', type: 'varchar', length: 30, default: () => 'CURRENT_TIMESTAMP' })
  dataCriacao!: string;
}
