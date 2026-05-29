import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('anotacao_qualitativa')
export class AnotacaoQualitativa {
  @PrimaryGeneratedColumn({ name: 'id_anotacao' })
  idAnotacao!: number;

  @Column({ name: 'id_aluno', type: 'integer' })
  idAluno!: number;

  @Column({ type: 'varchar', length: 150 })
  titulo!: string;

  @Column({ type: 'varchar', length: 1000 })
  descricao!: string;

  @Column({ type: 'varchar', length: 120 })
  autor!: string;

  @Column({ name: 'data_registro', type: 'date' })
  dataRegistro!: string;
}
