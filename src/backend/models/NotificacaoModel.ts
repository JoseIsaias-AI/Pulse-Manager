import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notificacao')
export class Notificacao {
  @PrimaryGeneratedColumn({ name: 'id_notificacao' })
  idNotificacao!: number;

  @Column({ type: 'varchar', length: 255 })
  titulo!: string;

  @Column({ name: 'id_aluno', type: 'integer' })
  idAluno!: number;

  @Column({ type: 'varchar', length: 500 })
  mensagem!: string;

  @Column({ name: 'data_envio', type: 'varchar', length: 10, nullable: true })
  dataEnvio!: string | null;

  @Column({ type: 'varchar', length: 30 })
  tipo!: string;

  @Column({ name: 'id_remetente', type: 'integer' })
  idRemetente!: number;

  @Column({ name: 'tipo_remetente', type: 'varchar', length: 30 })
  tipoRemetente!: string;

  @Column({ name: 'nome_remetente', type: 'varchar', length: 150 })
  nomeRemetente!: string;
}

@Entity('oportunidade')
export class Oportunidade {
  @PrimaryGeneratedColumn({ name: 'id_oportunidade' })
  idOportunidade!: number;

  @Column({ type: 'varchar', length: 255 })
  titulo!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  descricao!: string | null;

  @Column({ type: 'varchar', length: 30 })
  tipo!: string;

  @Column({ name: 'data_publicacao', type: 'varchar', length: 10, nullable: true })
  dataPublicacao!: string | null;

  @Column({ name: 'prazo_inscricao', type: 'varchar', length: 10, nullable: true })
  prazoInscricao!: string | null;

  @Column({ name: 'id_membro', type: 'integer' })
  idMembro!: number;
}
