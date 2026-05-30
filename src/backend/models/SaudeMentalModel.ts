import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('historico_psicologico')
export class HistoricoPsicologico {
  @PrimaryGeneratedColumn({ name: 'id_historico' })
  idHistorico!: number;

  @Column({ type: 'varchar', length: 255 })
  titulo!: string;

  @Column({ type: 'varchar', length: 500 })
  observacao!: string;

  @Column({ name: 'id_aluno', type: 'integer' })
  idAluno!: number;

  @Column({ name: 'id_psi', type: 'integer' })
  idPsi!: number;
}
