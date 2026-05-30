import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TipoAtividade = 'aula' | 'mentoria' | 'workshop' | 'evento' | 'avaliacao' | 'outro' | 'curso';

@Entity('atividade')
export class Atividade {
  @PrimaryGeneratedColumn({ name: 'id_atividade' })
  idAtividade!: number;

  @Column({ type: 'varchar', length: 150 })
  titulo!: string;

  @Column({ type: 'varchar', length: 30 })
  tipo!: TipoAtividade;

  @Column({ type: 'varchar', length: 500, nullable: true })
  descricao!: string | null;

  @Column({ type: 'date', nullable: true })
  data!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  modalidade!: string | null;

  @Column({ name: 'carga_horaria', type: 'integer', nullable: true })
  cargaHoraria!: number | null;
}
