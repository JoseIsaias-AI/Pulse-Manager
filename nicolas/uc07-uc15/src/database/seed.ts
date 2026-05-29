import { AppDataSource } from './connection';
import { Aluno } from '../models/alunoModel';
import { Atividade } from '../models/atividadeModel';

export async function seedDemoAlunos(): Promise<void> {
  if (process.env.NODE_ENV === 'test' || process.env.SEED_DEMO === 'false') {
    return;
  }

  const alunoRepository = AppDataSource.getRepository(Aluno);
  const atividadeRepository = AppDataSource.getRepository(Atividade);

  const totalAlunos = await alunoRepository.count();

  if (totalAlunos === 0) {
    await alunoRepository.save([
      {
        nome: 'Maria Silva',
        email: 'maria.silva@pulsemais.org',
        idade: 19,
        genero: 'feminino',
        ocupacao: 'estudante',
        escolaridade: 'ensino_medio',
        programa: 'Mentoria de permanencia',
        categoria: 'conectado',
        riscoEvasao: 'alto',
        engajamento: 42,
        dataIngresso: '2026-02-10',
        status: 'em_acompanhamento'
      },
      {
        nome: 'Joao Pereira',
        email: 'joao.pereira@pulsemais.org',
        idade: 21,
        genero: 'masculino',
        ocupacao: 'buscando_emprego',
        escolaridade: 'ensino_medio',
        programa: 'Jornada de empregabilidade',
        categoria: 'capacitado',
        riscoEvasao: 'baixo',
        engajamento: 88,
        dataIngresso: '2026-02-12',
        status: 'ativo'
      },
      {
        nome: 'Ana Costa',
        email: 'ana.costa@pulsemais.org',
        idade: 23,
        genero: 'feminino',
        ocupacao: 'empregada',
        escolaridade: 'ensino_superior',
        programa: 'Portal de acompanhamento',
        categoria: 'egresso',
        riscoEvasao: 'medio',
        engajamento: 71,
        dataIngresso: '2025-11-05',
        status: 'egresso',
        tipoVinculoEmpregaticio: 'formal',
        rendaMensal: 2500,
        instituicaoEnsinoSuperior: 'Universidade Comunitaria',
        cursoEnsinoSuperior: 'Analise e Desenvolvimento de Sistemas',
        statusEnsinoSuperior: 'cursando',
        dataIngressoEnsinoSuperior: '2024-02-01'
      },
      {
        nome: 'Luana Santos',
        email: 'luana.santos@pulsemais.org',
        idade: 18,
        genero: 'feminino',
        ocupacao: 'estudante',
        escolaridade: 'ensino_medio',
        programa: 'Mentoria de permanencia',
        categoria: 'conectado',
        riscoEvasao: 'baixo',
        engajamento: 79,
        dataIngresso: '2026-03-01',
        status: 'ativo'
      },
      {
        nome: 'Carlos Henrique',
        email: 'carlos.henrique@pulsemais.org',
        idade: 22,
        genero: 'masculino',
        ocupacao: 'buscando_emprego',
        escolaridade: 'ensino_medio',
        programa: 'Jornada de empregabilidade',
        categoria: 'capacitado',
        riscoEvasao: 'alto',
        engajamento: 38,
        dataIngresso: '2026-01-20',
        status: 'ativo'
      }
    ]);
  }

  const totalAtividades = await atividadeRepository.count();

  if (totalAtividades === 0) {
    await atividadeRepository.save([
      {
        titulo: 'Aula inaugural de logica',
        tipo: 'aula',
        descricao: 'Aula de abertura da trilha tecnica',
        data: '2026-03-10'
      },
      {
        titulo: 'Workshop de carreira',
        tipo: 'evento',
        descricao: 'Evento com empresas parceiras',
        data: '2026-03-15'
      },
      {
        titulo: 'Aula de projeto integrado',
        tipo: 'aula',
        descricao: 'Aula pratica com mentoria',
        data: '2026-03-20'
      },
      {
        titulo: 'Demo Day Pulse Mais',
        tipo: 'evento',
        descricao: 'Apresentacao final dos projetos',
        data: '2026-03-25'
      }
    ]);
  }
}
