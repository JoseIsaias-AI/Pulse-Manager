import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('label')
export class Label {
  @PrimaryGeneratedColumn({ name: 'id_lbl' })
  idLbl!: number;

  @Column({ type: 'varchar', length: 500 })
  descricao!: string;

  @Column({ name: 'tipo_label', type: 'varchar', length: 30 })
  tipoLabel!: string;

  @Column({ name: 'id_aluno', type: 'integer' })
  idAluno!: number;

  @Column({ name: 'id_psi', type: 'integer' })
  idPsi!: number;
}
