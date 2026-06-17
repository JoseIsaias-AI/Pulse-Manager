import { AppDataSource } from './connection';
import { Aluno } from '../models/alunoModel';

const ALUNOS_LOCAIS: Array<Partial<Aluno>> = [
  {
    codigoPm: 'PM-2024-001',
    nome: 'Mariana Costa',
    email: 'mariana.costa@local.pulsemais.org',
    idade: 20,
    ocupacao: 'Estudante',
    escolaridade: 'Ensino superior incompleto',
    curso: 'Engenharia de Software',
    programa: 'Desenvolvimento AI-First',
    categoria: 'capacitado',
    nivelJornada: 'Modulo 5',
    riscoEvasao: 'baixo',
    engajamento: 84,
    dataIngresso: '2024-02-10',
    status: 'ativo'
  },
  {
    codigoPm: 'PM-2024-002',
    nome: 'Tiago Ribeiro',
    email: 'tiago.ribeiro@local.pulsemais.org',
    idade: 21,
    ocupacao: 'Desempregado',
    escolaridade: 'Ensino medio completo',
    curso: 'Analise e Desenvolvimento de Sistemas',
    programa: 'Letramento Digital',
    categoria: 'conectado',
    nivelJornada: 'Modulo 4',
    riscoEvasao: 'alto',
    engajamento: 62,
    dataIngresso: '2024-03-15',
    status: 'em_acompanhamento'
  },
  {
    codigoPm: 'PM-2024-003',
    nome: 'Leticia Pires',
    email: 'leticia.pires@local.pulsemais.org',
    idade: 22,
    ocupacao: 'Analista de suporte',
    tipoVinculoEmpregaticio: 'CLT',
    escolaridade: 'Ensino superior completo',
    curso: 'Sistemas de Informacao',
    programa: 'Autogestao no Mundo do Trabalho',
    categoria: 'transformado',
    nivelJornada: 'Concluido',
    riscoEvasao: 'baixo',
    engajamento: 100,
    dataIngresso: '2024-01-20',
    status: 'egresso'
  },
  {
    codigoPm: 'PM-2025-001',
    nome: 'Bruno Ferraz',
    email: 'bruno.ferraz@local.pulsemais.org',
    idade: 19,
    escolaridade: 'Ensino medio completo',
    curso: 'Letramento Digital',
    programa: 'Letramento Digital',
    categoria: 'conectado',
    nivelJornada: 'Modulo 3',
    riscoEvasao: 'medio',
    engajamento: 48,
    dataIngresso: '2025-02-05',
    status: 'ativo'
  },
  {
    codigoPm: 'PM-2025-002',
    nome: 'Julia Alves',
    email: 'julia.alves@local.pulsemais.org',
    idade: 20,
    ocupacao: 'Estagiaria',
    tipoVinculoEmpregaticio: 'Estagio',
    escolaridade: 'Ensino superior incompleto',
    curso: 'Design Digital',
    programa: 'Fortalecimento Emocional para Jovens',
    categoria: 'capacitado',
    nivelJornada: 'Modulo 5',
    riscoEvasao: 'baixo',
    engajamento: 85,
    dataIngresso: '2025-04-12',
    status: 'ativo'
  },
  {
    codigoPm: 'PM-2025-003',
    nome: 'Renato Dias',
    email: 'renato.dias@local.pulsemais.org',
    idade: 23,
    ocupacao: 'buscando_emprego',
    escolaridade: 'Ensino superior incompleto',
    curso: 'Tecnologia em Redes',
    programa: 'Mercado de Trabalho',
    categoria: 'capacitado',
    nivelJornada: 'Modulo 4',
    riscoEvasao: 'medio',
    engajamento: 65,
    dataIngresso: '2025-05-18',
    status: 'em_acompanhamento'
  },
  {
    codigoPm: 'PM-2026-001',
    nome: 'Karen Souza',
    email: 'karen.souza@local.pulsemais.org',
    idade: 20,
    ocupacao: 'Estudante',
    escolaridade: 'Ensino superior incompleto',
    curso: 'Desenvolvimento Web',
    programa: 'Ferramentas de Produtividade',
    categoria: 'conectado',
    nivelJornada: 'Modulo 2',
    riscoEvasao: 'baixo',
    engajamento: 82,
    dataIngresso: '2026-01-15',
    status: 'ativo'
  },
  {
    codigoPm: 'PM-2026-002',
    nome: 'Pedro Lima',
    email: 'pedro.lima@local.pulsemais.org',
    idade: 22,
    ocupacao: 'Desempregado',
    escolaridade: 'Ensino medio completo',
    curso: 'Laboratorio de Mentoria',
    programa: 'Laboratorio de Mentoria',
    categoria: 'conectado',
    nivelJornada: 'Modulo 1',
    riscoEvasao: 'alto',
    engajamento: 42,
    dataIngresso: '2026-02-20',
    status: 'em_acompanhamento'
  },
  {
    codigoPm: 'PM-2026-003',
    nome: 'Ana Martins',
    email: 'ana.martins@local.pulsemais.org',
    idade: 19,
    ocupacao: 'Desenvolvedora junior',
    tipoVinculoEmpregaticio: 'CLT',
    escolaridade: 'Ensino superior incompleto',
    curso: 'Engenharia de Software',
    programa: 'Autogestao no Mundo do Trabalho',
    categoria: 'transformado',
    nivelJornada: 'Concluido',
    riscoEvasao: 'baixo',
    engajamento: 91,
    dataIngresso: '2026-03-03',
    status: 'egresso'
  }
];

export async function seedLocalDevelopmentDatabase(): Promise<void> {
  const repository = AppDataSource.getRepository(Aluno);
  if (await repository.count()) return;

  await repository.save(ALUNOS_LOCAIS);
  console.log(`Base local carregada com ${ALUNOS_LOCAIS.length} alunos.`);
}
