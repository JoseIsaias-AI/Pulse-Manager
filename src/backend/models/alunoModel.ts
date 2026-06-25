import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type StatusAluno = 'ativo' | 'inativo' | 'egresso' | 'desligado' | 'em_acompanhamento';
export type RiscoEvasao = 'baixo' | 'medio' | 'alto';
export type EmpregabilidadeAluno = 'empregado' | 'desempregado' | 'estudante' | 'nao_informado';

export interface SegmentacaoAlunoQuery {
  programa?: string;
  status?: StatusAluno;
  risco?: RiscoEvasao;
  categoria?: string;
  ocupacao?: string;
  empregabilidade?: EmpregabilidadeAluno;
  escolaridade?: string;
  curso?: string;
  anoIngresso?: number;
  busca?: string;
  limite?: number;
}

export interface SegmentacaoAlunoResponse {
  success: true;
  data: {
    total: number;
    filtrosAplicados: SegmentacaoAlunoQuery;
    alunos: unknown[];
  };
}

export const STATUS_ALUNO: StatusAluno[] = [
  'ativo',
  'inativo',
  'egresso',
  'desligado',
  'em_acompanhamento'
];

export const RISCOS_EVASAO: RiscoEvasao[] = ['baixo', 'medio', 'alto'];
export const GENEROS_ALUNO = [
  'feminino',
  'masculino',
  'nao_binario',
  'outro',
  'prefiro_nao_informar'
] as const;
export const EMPREGABILIDADES_ALUNO: EmpregabilidadeAluno[] = [
  'empregado',
  'desempregado',
  'estudante',
  'nao_informado'
];

export const CRITERIOS_SEGMENTACAO: Array<keyof SegmentacaoAlunoQuery> = [
  'programa',
  'status',
  'risco',
  'categoria',
  'ocupacao',
  'empregabilidade',
  'escolaridade',
  'curso',
  'anoIngresso',
  'busca'
];

@Entity('aluno')
@Index(['programa'])
@Index(['categoria'])
@Index(['riscoEvasao'])
@Index(['status'])
@Index(['ocupacao'])
@Index(['escolaridade'])
export class Aluno {
  @PrimaryGeneratedColumn({ name: 'id_aluno' })
  idAluno!: number;

  @Column({ type: 'varchar', length: 11, nullable: true, unique: true })
  cpf!: string | null;

  @Column({ type: 'varchar', length: 150 })
  nome!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'integer', nullable: true })
  idade!: number | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  genero!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  ocupacao!: string | null;

  @Column({ name: 'tipo_vinculo_empregaticio', type: 'varchar', length: 50, nullable: true })
  tipoVinculoEmpregaticio!: string | null;

  @Column({ name: 'renda_mensal', type: 'decimal', precision: 10, scale: 2, nullable: true })
  rendaMensal!: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  escolaridade!: string | null;

  @Column({
    name: 'instituicao_ensino_superior',
    type: 'varchar',
    length: 150,
    nullable: true
  })
  instituicaoEnsinoSuperior!: string | null;

  @Column({ name: 'curso_ensino_superior', type: 'varchar', length: 150, nullable: true })
  cursoEnsinoSuperior!: string | null;

  @Column({ name: 'status_ensino_superior', type: 'varchar', length: 50, nullable: true })
  statusEnsinoSuperior!: string | null;

  @Column({ name: 'data_ingresso_ensino_superior', type: 'date', nullable: true })
  dataIngressoEnsinoSuperior!: string | null;

  @Column({ type: 'varchar', length: 120 })
  programa!: string;

  @Column({ type: 'varchar', length: 60 })
  categoria!: string;

  @Column({ name: 'risco_evasao', type: 'varchar', length: 20, default: 'baixo' })
  riscoEvasao!: RiscoEvasao;

  @Column({ name: 'probabilidade_evasao', type: 'decimal', precision: 5, scale: 2, nullable: true })
  probabilidadeEvasao!: number | null;

  @Column({ type: 'integer', default: 0 })
  engajamento!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
  frequencia!: number;

  @Column({ name: 'data_ingresso', type: 'date' })
  dataIngresso!: string;

  @Column({ type: 'varchar', length: 30, default: 'ativo' })
  status!: StatusAluno;

  @Column({ name: 'codigo_pm', type: 'varchar', length: 20, nullable: true, unique: true })
  codigoPm!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefone!: string | null;

  @Column({ name: 'nivel_jornada', type: 'varchar', length: 50, nullable: true })
  nivelJornada!: string | null;

  @Column({ name: 'perfil_socioeconomico', type: 'varchar', length: 150, nullable: true })
  perfilSocioeconomico!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  curso!: string | null;

  @Column({ name: 'origem_participacao', type: 'varchar', length: 100, nullable: true })
  origemParticipacao!: string | null;
}
