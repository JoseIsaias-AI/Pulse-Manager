import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('psicologo')
export class Psicologo {
  @PrimaryGeneratedColumn({ name: 'id_psi' })
  idPsi!: number;

  @Column({ type: 'varchar', length: 11, nullable: true, unique: true })
  cpf!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  email!: string | null;

  @Column({ name: 'nome_psi', type: 'varchar', length: 150 })
  nomePsi!: string;

  @Column({ name: 'cargo_psi', type: 'varchar', length: 30 })
  cargoPsi!: string;
}

@Entity('membro_equipe')
export class MembroEquipe {
  @PrimaryGeneratedColumn({ name: 'id_membro' })
  idMembro!: number;

  @Column({ type: 'varchar', length: 11, nullable: true, unique: true })
  cpf!: string | null;

  @Column({ type: 'varchar', length: 150 })
  nome!: string;

  @Column({ type: 'varchar', length: 30 })
  cargo!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;
}
