import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('agenda')
export class Agenda {
  @PrimaryGeneratedColumn({ name: 'id_agenda' })
  idAgenda!: number;

  @Column({ name: 'tipo_user', type: 'varchar', length: 20 })
  tipoUser!: string;

  @Column({ type: 'varchar', length: 500 })
  registro!: string;

  @Column({ type: 'varchar', length: 10 })
  data!: string;

  @Column({ name: 'hora_inicio', type: 'varchar', length: 8, nullable: true })
  horaInicio!: string | null;

  @Column({ name: 'hora_fim', type: 'varchar', length: 8, nullable: true })
  horaFim!: string | null;

  @Column({ type: 'integer', default: 1 })
  status!: number;

  @Column({ name: 'id_membro', type: 'integer' })
  idMembro!: number;

  @Column({ name: 'id_aluno', type: 'integer' })
  idAluno!: number;
}
