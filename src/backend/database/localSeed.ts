import { AppDataSource } from './connection';
import { Aluno } from '../models/alunoModel';
import { Atividade } from '../models/atividadeModel';
import { Agenda } from '../models/AgendaModel';
import { SolicitacaoApoioPsicologico } from '../models/ApoioPsicologicoModel';
import { Label } from '../models/LabelModel';
import { Participacao } from '../models/participacaoModel';
import { HistoricoPsicologico } from '../models/SaudeMentalModel';
import { MembroEquipe, Psicologo } from '../models/usuarioModel';

const ALUNOS_LOCAIS: Array<Partial<Aluno>> = [
  {
    codigoPm: 'PM-2024-001',
    cpf: '11111111111',
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
    cpf: '22222222222',
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
    cpf: '33333333333',
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
    cpf: '44444444444',
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
    cpf: '55555555555',
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
    cpf: '66666666666',
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
    cpf: '77777777777',
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
    cpf: '88888888888',
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
    cpf: '99999999999',
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

const ATIVIDADES_LOCAIS: Array<Partial<Atividade>> = [
  {
    titulo: 'Aula de Introdução à Tecnologia',
    tipo: 'aula',
    descricao: 'Primeiro contato com áreas de tecnologia e carreiras digitais.',
    data: '2026-06-10',
    modalidade: 'presencial',
    cargaHoraria: 3
  },
  {
    titulo: 'Aula de Lógica de Programação',
    tipo: 'aula',
    descricao: 'Fundamentos de lógica de programação.',
    data: '2026-06-17',
    modalidade: 'online',
    cargaHoraria: 4
  },
  {
    titulo: 'Workshop de Currículo e Entrevistas',
    tipo: 'workshop',
    descricao: 'Oficina prática para preparação de currículo e entrevistas de emprego.',
    data: '2026-06-12',
    modalidade: 'online',
    cargaHoraria: 2
  },
  {
    titulo: 'Vivência em Empresa Parceira',
    tipo: 'evento',
    descricao: 'Visita a empresa parceira para aproximação com o mercado de tecnologia.',
    data: '2026-06-20',
    modalidade: 'presencial',
    cargaHoraria: 4
  },
  {
    titulo: 'Avaliação Final da Trilha',
    tipo: 'avaliacao',
    descricao: 'Avaliação final da trilha com entrega de plano individual de carreira.',
    data: '2026-06-24',
    modalidade: 'online',
    cargaHoraria: 1
  }
];

export async function seedLocalDevelopmentDatabase(): Promise<void> {
  const alunoRepository = AppDataSource.getRepository(Aluno);
  if (!(await alunoRepository.count())) {
    await alunoRepository.save(ALUNOS_LOCAIS);
    console.log(`Base local carregada com ${ALUNOS_LOCAIS.length} alunos.`);
  }

  const atividadeRepository = AppDataSource.getRepository(Atividade);
  if (!(await atividadeRepository.count())) {
    await atividadeRepository.save(ATIVIDADES_LOCAIS);
    console.log(`Base local carregada com ${ATIVIDADES_LOCAIS.length} atividades.`);
  }

  const membroRepository = AppDataSource.getRepository(MembroEquipe);
  if (!(await membroRepository.count())) {
    await membroRepository.save({
      nome: 'Helena Duarte',
      cargo: 'gestor',
      email: 'helena.duarte@pulsemais.org',
      cpf: '12345678901'
    });
    console.log('Base local carregada com gestor de desenvolvimento.');
  }

  const psicologoRepository = AppDataSource.getRepository(Psicologo);
  if (!(await psicologoRepository.count())) {
    await psicologoRepository.save({
      nomePsi: 'Isadora Valença',
      cargoPsi: 'psicologo',
      email: 'isadora.valenca@pulsemais.org',
      cpf: '23456789012'
    });
    console.log('Base local carregada com psicologo de desenvolvimento.');
  }

  const [aluno] = await alunoRepository.find({ take: 1, order: { idAluno: 'ASC' } });
  const [psicologo] = await psicologoRepository.find({ take: 1, order: { idPsi: 'ASC' } });
  const [membro] = await membroRepository.find({ take: 1, order: { idMembro: 'ASC' } });
  const atividades = await atividadeRepository.find({ take: 3, order: { idAtividade: 'ASC' } });

  if (!aluno || !psicologo || !membro) return;

  const participacaoRepository = AppDataSource.getRepository(Participacao);
  if (!(await participacaoRepository.count())) {
    await participacaoRepository.save(atividades.map((atividade, index) => ({
      idAluno: aluno.idAluno,
      idAtividade: atividade.idAtividade,
      dataPart: atividade.data || `2026-06-${10 + index}`,
      statusPart: true,
      nota: 8.4 - index * 0.3,
      certificado: index > 0
    })));
    console.log('Base local carregada com participacoes da jornada.');
  }

  const agendaRepository = AppDataSource.getRepository(Agenda);
  if (!(await agendaRepository.count())) {
    await agendaRepository.save([
      {
        tipoUser: 'aluno',
        registro: 'Mentoria de carreira',
        data: '2026-06-24',
        horaInicio: '10:00',
        horaFim: '11:00',
        status: 1,
        idMembro: membro.idMembro,
        idAluno: aluno.idAluno
      },
      {
        tipoUser: 'aluno',
        registro: 'Atendimento psicologico cancelado',
        data: '2026-06-25',
        horaInicio: '14:00',
        horaFim: '15:00',
        status: 0,
        idMembro: membro.idMembro,
        idAluno: aluno.idAluno
      }
    ]);
    console.log('Base local carregada com agenda do aluno.');
  }

  const historicoRepository = AppDataSource.getRepository(HistoricoPsicologico);
  if (!(await historicoRepository.count())) {
    await historicoRepository.save({
      titulo: 'Atendimento inicial',
      observacao: 'Aluno relata ansiedade antes de entrevistas.',
      idAluno: aluno.idAluno,
      idPsi: psicologo.idPsi
    });
    console.log('Base local carregada com historico psicologico.');
  }

  const labelRepository = AppDataSource.getRepository(Label);
  if (!(await labelRepository.count())) {
    await labelRepository.save([
      {
        descricao: 'Risco moderado de evasao',
        tipoLabel: 'risco',
        idAluno: aluno.idAluno,
        idPsi: psicologo.idPsi
      },
      {
        descricao: 'Boa adesao aos encontros',
        tipoLabel: 'engajamento',
        idAluno: aluno.idAluno,
        idPsi: psicologo.idPsi
      }
    ]);
    console.log('Base local carregada com labels psicologicas.');
  }

  const apoioRepository = AppDataSource.getRepository(SolicitacaoApoioPsicologico);
  if (!(await apoioRepository.count())) {
    await apoioRepository.save({
      idAluno: aluno.idAluno,
      idPsicologo: psicologo.idPsi,
      mensagem: 'Gostaria de conversar sobre ansiedade antes das entrevistas.',
      status: 'pendente',
      dataCriacao: new Date().toISOString()
    });
    console.log('Base local carregada com solicitacao de apoio.');
  }
}
