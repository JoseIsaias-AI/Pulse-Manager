import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique
} from 'typeorm';
import { Aluno } from './alunoModel';
import { Atividade } from './atividadeModel';

@Entity('participacao')
@Unique('uq_participacao_aluno_atividade', ['idAluno', 'idAtividade'])
export class Participacao {
  @PrimaryGeneratedColumn({ name: 'id_part' })
  idPart!: number;

  @Column({ name: 'data_part', type: 'date' })
  dataPart!: string;

  @Column({ name: 'status_part', type: 'boolean', default: false })
  statusPart!: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  nota!: number | null;

  @Column({ name: 'id_aluno', type: 'integer' })
  idAluno!: number;

  @Column({ name: 'id_atividade', type: 'integer' })
  idAtividade!: number;

  @Column({ type: 'boolean', default: false, nullable: true })
  certificado!: boolean | null;

  @ManyToOne(() => Aluno)
  @JoinColumn({ name: 'id_aluno' })
  aluno?: Aluno;

  @ManyToOne(() => Atividade)
  @JoinColumn({ name: 'id_atividade' })
  atividade?: Atividade;
}
