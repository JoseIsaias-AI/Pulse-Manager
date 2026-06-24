import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { getIntegrationRepository, resetIntegrationDatabase, setupIntegrationDatabase, teardownIntegrationDatabase } from '../helpers/databaseTestHelper';
import { performanceIt } from '../helpers/performanceTest';
import { Aluno } from '../../backend/models/alunoModel';
import { expectErrorContract, expectSuccessContract } from '../helpers/responseContract';

describe('UC-03 a UC-06 - Gestao de Alunos', () => {
  let alunoRepository: Repository<Aluno>;
  let aluno: Aluno;

  beforeAll(async () => {
    await setupIntegrationDatabase();
    alunoRepository = getIntegrationRepository(Aluno);
  });

  beforeEach(async () => {
    await resetIntegrationDatabase();

    aluno = await alunoRepository.save({
      nome: 'Carlos Mendes',
      email: 'carlos.mendes@pulsemais.org',
      idade: 25,
      genero: 'masculino',
      ocupacao: 'estudante',
      escolaridade: 'ensino_medio',
      programa: 'Jornada de empregabilidade',
      categoria: 'capacitado',
      riscoEvasao: 'medio',
      engajamento: 60,
      dataIngresso: '2026-01-10',
      status: 'ativo'
    });
  });

  afterAll(teardownIntegrationDatabase);

  describe('UC-03 - Cadastrar aluno (RN001, RN002)', () => {
    it('CT01 - deve cadastrar aluno e gerar codigo PM automaticamente (RN001)', async () => {
      const response = await request(app).post('/api/alunos').send({
        nome: 'Julia Ferreira',
        email: 'julia.ferreira@pulsemais.org',
        dataIngresso: '2026-02-01',
        programa: 'Mentoria de permanencia',
        categoria: 'conectado',
        riscoEvasao: 'baixo'
      });

      expect(response.status).toBe(201);
      expectSuccessContract(response.body);
      expect(response.body.success).toBe(true);
      expect(response.body.data.codigoPm).toMatch(/^PM-\d{4}-\d{3}$/);
      expect(response.body.data.email).toBe('julia.ferreira@pulsemais.org');
    });

    it('CT02 - deve rejeitar email duplicado (RN002)', async () => {
      const response = await request(app).post('/api/alunos').send({
        nome: 'Carlos Outro',
        email: 'carlos.mendes@pulsemais.org',
        programa: 'Mentoria',
        categoria: 'conectado',
        riscoEvasao: 'baixo'
      });

      expect(response.status).toBe(409);
      expectErrorContract(response.body);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Ja existe aluno cadastrado com este e-mail.'
      });
    });

    it('CT03 - deve rejeitar email invalido', async () => {
      const response = await request(app).post('/api/alunos').send({
        nome: 'Aluno Invalido',
        email: 'emailsemarroba',
        programa: 'Mentoria',
        categoria: 'conectado',
        riscoEvasao: 'baixo'
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo email deve conter um endereco valido.'
      });
    });

    it('CT04 - deve rejeitar idade fora da faixa permitida', async () => {
      const response = await request(app).post('/api/alunos').send({
        nome: 'Aluno Idade',
        email: 'aluno.idade@pulsemais.org',
        idade: 150,
        programa: 'Mentoria',
        categoria: 'conectado',
        riscoEvasao: 'baixo'
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo idade deve estar entre 0 e 120.'
      });
    });

    it('CT05 - deve cadastrar todos os dados disponiveis do aluno', async () => {
      const response = await request(app).post('/api/alunos').send({
        nome: 'Marina Completa',
        email: 'marina.completa@pulsemais.org',
        telefone: '11999999999',
        idade: 24,
        genero: 'feminino',
        ocupacao: 'Analista de dados',
        tipoVinculoEmpregaticio: 'CLT',
        rendaMensal: 3500.5,
        escolaridade: 'ensino_superior',
        instituicaoEnsinoSuperior: 'Universidade Federal',
        cursoEnsinoSuperior: 'Sistemas de Informacao',
        statusEnsinoSuperior: 'cursando',
        dataIngressoEnsinoSuperior: '2024-02-01',
        dataIngresso: '2026-03-10',
        programa: 'Jornada de empregabilidade',
        categoria: 'transformado',
        riscoEvasao: 'medio',
        engajamento: 82,
        status: 'em_acompanhamento',
        nivelJornada: 'avancado',
        perfilSocioeconomico: 'renda familiar ate 3 salarios',
        curso: 'Formacao em Dados',
        origemParticipacao: 'indicacao'
      });

      expect(response.status).toBe(201);
      expect(response.body.data).toMatchObject({
        nome: 'Marina Completa',
        empregabilidade: 'empregado',
        tipoVinculoEmpregaticio: 'CLT',
        rendaMensal: 3500.5,
        instituicaoEnsinoSuperior: 'Universidade Federal',
        cursoEnsinoSuperior: 'Sistemas de Informacao',
        dataIngressoEnsinoSuperior: '2024-02-01',
        riscoEvasao: 'medio',
        engajamento: 82,
        status: 'em_acompanhamento',
        curso: 'Formacao em Dados'
      });
    });

    it('CT06 - deve rejeitar renda negativa e engajamento fora da faixa', async () => {
      const renda = await request(app).post('/api/alunos').send({
        nome: 'Aluno Renda',
        email: 'aluno.renda@pulsemais.org',
        rendaMensal: -1
      });
      const engajamento = await request(app).post('/api/alunos').send({
        nome: 'Aluno Engajamento',
        email: 'aluno.engajamento@pulsemais.org',
        engajamento: 101
      });

      expect(renda.status).toBe(400);
      expect(renda.body.message).toBe('O campo rendaMensal deve ser um numero maior ou igual a zero.');
      expect(engajamento.status).toBe(400);
      expect(engajamento.body.message).toBe('O campo engajamento deve ser um numero inteiro entre 0 e 100.');
    });

    it('CT07 - deve rejeitar nome com numeros', async () => {
      const response = await request(app).post('/api/alunos').send({
        nome: 'Aluno 123',
        email: 'aluno.nome.numero@pulsemais.org'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('O campo nome nao pode conter numeros.');
    });
  });

  describe('UC-04 - Listar e consultar alunos', () => {
    it('CT00 - deve listar enums e valores variaveis para o cadastro', async () => {
      const response = await request(app).get('/api/alunos/opcoes-cadastro');

      expect(response.status).toBe(200);
      expectSuccessContract(response.body);
      expect(response.body.success).toBe(true);
      expect(response.body.data.genero).toEqual(expect.arrayContaining([
        'feminino',
        'masculino',
        'nao_binario',
        'outro',
        'prefiro_nao_informar'
      ]));
      expect(response.body.data.status).toEqual(expect.arrayContaining([
        'ativo',
        'inativo',
        'egresso',
        'desligado',
        'em_acompanhamento'
      ]));
      expect(response.body.data.riscoEvasao).toEqual(expect.arrayContaining(['baixo', 'medio', 'alto']));
      expect(response.body.data.escolaridade).toContain('ensino_medio');
      expect(response.body.data.programa).toEqual([
        'Mentoria',
        'nao_informado',
        'Programa Pulse Mais'
      ]);
      expect(response.body.data.ocupacao).toEqual([]);
    });

    it('CT01 - deve listar alunos cadastrados', async () => {
      const response = await request(app).get('/api/alunos');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.alunos)).toBe(true);
      expect(response.body.data.alunos).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            idAluno: aluno.idAluno,
            nome: 'Carlos Mendes',
            email: 'carlos.mendes@pulsemais.org'
          })
        ])
      );
    });

    it('CT02 - deve obter perfil de aluno pelo id', async () => {
      const response = await request(app).get(`/api/alunos/${aluno.idAluno}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nome).toBe('Carlos Mendes');
    });

    it('CT03 - deve retornar 404 quando aluno nao existe', async () => {
      const response = await request(app).get('/api/alunos/9999');

      expect(response.status).toBe(404);
      expectErrorContract(response.body);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Aluno nao encontrado.'
      });
    });

    it('CT04 - deve filtrar alunos por status', async () => {
      const response = await request(app).get('/api/alunos?status=ativo');

      expect(response.status).toBe(200);
      expect(response.body.data.alunos).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            idAluno: aluno.idAluno,
            status: 'ativo'
          })
        ])
      );
      response.body.data.alunos.forEach((a: { status: string }) => {
        expect(a.status).toBe('ativo');
      });
    });

    it('CT05 - deve retornar 400 para idAluno invalido', async () => {
      const response = await request(app).get('/api/alunos/nao-e-numero');

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo idAluno deve ser um numero inteiro positivo.'
      });
    });

    it('CT06 - deve combinar filtros de empregabilidade, escolaridade, curso e ano de ingresso', async () => {
      await alunoRepository.save([
        {
          nome: 'Ana Empregada',
          email: 'ana.empregada@pulsemais.org',
          idade: 23,
          genero: 'feminino',
          ocupacao: 'Analista de dados',
          escolaridade: 'ensino_superior',
          curso: 'Formacao em Dados',
          programa: 'Jornada de empregabilidade',
          categoria: 'transformado',
          riscoEvasao: 'baixo',
          engajamento: 90,
          dataIngresso: '2025-03-10',
          status: 'egresso'
        },
        {
          nome: 'Bruno Empregado',
          email: 'bruno.empregado@pulsemais.org',
          idade: 22,
          genero: 'masculino',
          ocupacao: 'Desenvolvedor junior',
          escolaridade: 'ensino_superior',
          curso: 'Desenvolvimento Web',
          programa: 'Jornada de empregabilidade',
          categoria: 'transformado',
          riscoEvasao: 'baixo',
          engajamento: 85,
          dataIngresso: '2025-04-10',
          status: 'egresso'
        },
        {
          nome: 'Carla Desempregada',
          email: 'carla.desempregada@pulsemais.org',
          idade: 21,
          genero: 'feminino',
          ocupacao: 'buscando_emprego',
          escolaridade: 'ensino_superior',
          curso: 'Formacao em Dados',
          programa: 'Jornada de empregabilidade',
          categoria: 'capacitado',
          riscoEvasao: 'baixo',
          engajamento: 75,
          dataIngresso: '2025-05-10',
          status: 'ativo'
        }
      ]);

      const response = await request(app).get('/api/alunos').query({
        empregabilidade: 'empregado',
        escolaridade: 'ensino_superior',
        curso: 'Formacao em Dados',
        anoIngresso: '2025'
      });

      expect(response.status).toBe(200);
      expect(response.body.data.alunos).toHaveLength(1);
      expect(response.body.data.alunos[0]).toMatchObject({
        nome: 'Ana Empregada',
        empregabilidade: 'empregado',
        escolaridade: 'ensino_superior',
        curso: 'Formacao em Dados',
        dataIngresso: '2025-03-10'
      });
    });

    it('CT07 - deve filtrar estudantes, desempregados e dados nao informados por empregabilidade', async () => {
      await alunoRepository.save([
        {
          nome: 'Estudante Teste',
          email: 'estudante.teste@pulsemais.org',
          ocupacao: 'estudante',
          programa: 'Pulse',
          categoria: 'conectado',
          riscoEvasao: 'baixo',
          engajamento: 60,
          dataIngresso: '2026-01-01',
          status: 'ativo'
        },
        {
          nome: 'Sem Ocupacao',
          email: 'sem.ocupacao@pulsemais.org',
          programa: 'Pulse',
          categoria: 'conectado',
          riscoEvasao: 'baixo',
          engajamento: 60,
          dataIngresso: '2026-01-01',
          status: 'ativo'
        },
        {
          nome: 'Vinculo Prevalece',
          email: 'vinculo.prevalece@pulsemais.org',
          ocupacao: 'desempregado',
          tipoVinculoEmpregaticio: 'CLT',
          programa: 'Pulse',
          categoria: 'transformado',
          riscoEvasao: 'baixo',
          engajamento: 80,
          dataIngresso: '2026-01-01',
          status: 'egresso'
        }
      ]);

      const estudante = await request(app).get('/api/alunos?empregabilidade=estudante');
      const desempregado = await request(app).get('/api/alunos?empregabilidade=desempregado');
      const naoInformado = await request(app).get('/api/alunos?empregabilidade=nao_informado');
      const empregado = await request(app).get('/api/alunos?empregabilidade=empregado');

      expect(estudante.body.data.alunos.map((item: { nome: string }) => item.nome)).toContain('Estudante Teste');
      expect(desempregado.body.data.alunos.map((item: { nome: string }) => item.nome)).not.toContain('Estudante Teste');
      expect(desempregado.body.data.alunos.map((item: { nome: string }) => item.nome)).not.toContain('Vinculo Prevalece');
      expect(naoInformado.body.data.alunos.map((item: { nome: string }) => item.nome)).toContain('Sem Ocupacao');
      expect(empregado.body.data.alunos.map((item: { nome: string }) => item.nome)).toContain('Vinculo Prevalece');
    });

    it('CT08 - deve rejeitar empregabilidade e ano de ingresso invalidos', async () => {
      const empregabilidade = await request(app).get('/api/alunos?empregabilidade=talvez');
      const anoIngresso = await request(app).get('/api/alunos?anoIngresso=22');

      expect(empregabilidade.status).toBe(400);
      expect(empregabilidade.body.message).toBe('Empregabilidade invalida.');
      expect(anoIngresso.status).toBe(400);
      expect(anoIngresso.body.message).toBe('O campo anoIngresso deve ser um ano valido.');
    });
  });

  describe('UC-05 - Atualizar dados do aluno', () => {
    it('CT01 - deve atualizar dados do aluno', async () => {
      const response = await request(app)
        .patch(`/api/alunos/${aluno.idAluno}`)
        .send({ nome: 'Carlos Mendes Atualizado', riscoEvasao: 'alto' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nome).toBe('Carlos Mendes Atualizado');
    });

    it('CT01b - deve atualizar dados cadastrais exibidos no perfil do gestor', async () => {
      const response = await request(app)
        .patch(`/api/alunos/${aluno.idAluno}`)
        .send({
          nome: 'Carlos Mendes Perfil',
          email: 'carlos.perfil@pulsemais.org',
          telefone: '11911112222',
          idade: 26,
          genero: 'masculino',
          ocupacao: 'Analista junior',
          tipoVinculoEmpregaticio: 'CLT',
          rendaMensal: 2400.75,
          escolaridade: 'ensino_superior',
          programa: 'Jornada atualizada',
          categoria: 'transformado',
          riscoEvasao: 'baixo',
          engajamento: 88,
          status: 'em_acompanhamento',
          nivelJornada: 'avancado',
          perfilSocioeconomico: 'renda familiar ate 3 salarios',
          curso: 'Formacao em Dados',
          origemParticipacao: 'indicacao',
          dataIngresso: '2026-02-15'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        nome: 'Carlos Mendes Perfil',
        email: 'carlos.perfil@pulsemais.org',
        telefone: '11911112222',
        idade: 26,
        empregabilidade: 'empregado',
        tipoVinculoEmpregaticio: 'CLT',
        rendaMensal: 2400.75,
        escolaridade: 'ensino_superior',
        programa: 'Jornada atualizada',
        categoria: 'transformado',
        riscoEvasao: 'baixo',
        engajamento: 88,
        status: 'em_acompanhamento',
        nivelJornada: 'avancado',
        perfilSocioeconomico: 'renda familiar ate 3 salarios',
        curso: 'Formacao em Dados',
        origemParticipacao: 'indicacao',
        dataIngresso: '2026-02-15'
      });
    });

    it('CT02 - deve rejeitar riscoEvasao invalido', async () => {
      const response = await request(app)
        .patch(`/api/alunos/${aluno.idAluno}`)
        .send({ riscoEvasao: 'invalido' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Risco de evasao invalido.'
      });
    });

    it('CT03 - deve retornar 404 ao atualizar aluno inexistente', async () => {
      const response = await request(app)
        .patch('/api/alunos/9999')
        .send({ nome: 'Qualquer Nome' });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Aluno nao encontrado.'
      });
    });

    it('CT04 - deve rejeitar atualizacao com numeros no nome', async () => {
      const response = await request(app)
        .patch(`/api/alunos/${aluno.idAluno}`)
        .send({ nome: 'Carlos 2' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('O campo nome nao pode conter numeros.');
    });
  });

  describe('UC-06 - Inativar aluno (RN010)', () => {
    it('CT01 - deve inativar aluno sem remover do banco (RN010)', async () => {
      const response = await request(app).delete(`/api/alunos/${aluno.idAluno}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('inativo');
    });

    it('CT02 - deve retornar 404 ao inativar aluno inexistente', async () => {
      const response = await request(app).delete('/api/alunos/9999');

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Aluno nao encontrado.'
      });
    });

    it('CT03 - aluno inativado deve permanecer acessivel no banco (RN010)', async () => {
      await request(app).delete(`/api/alunos/${aluno.idAluno}`);

      const response = await request(app).get(`/api/alunos/${aluno.idAluno}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('inativo');
    });
  });

  describe('Importacao e exportacao CSV do gestor', () => {
    it('deve restringir a funcionalidade ao perfil gestor', async () => {
      const response = await request(app)
        .post('/api/gestor/importacoes/alunos')
        .set('x-user-role', 'psicologo')
        .send({ csv: 'nome,email\nPessoa Teste,pessoa.teste@pulsemais.org' });

      expect(response.status).toBe(403);
      expectErrorContract(response.body);
    });

    it('deve importar um aluno e disponibiliza-lo na listagem integrada', async () => {
      const response = await request(app)
        .post('/api/gestor/importacoes/alunos')
        .set('x-user-role', 'gestor')
        .send({
          csv: [
            'nome,email,cpf,programa,categoria,engajamento',
            'Pessoa Importada,pessoa.importada@pulsemais.org,12345678901,Mentoria,capacitado,72'
          ].join('\n')
        });

      expect(response.status).toBe(200);
      expectSuccessContract(response.body);
      expect(response.body.data).toMatchObject({
        importados: 1,
        atualizados: 0,
        ignorados: 0
      });

      const listagem = await request(app).get('/api/alunos').query({ busca: 'Pessoa Importada' });
      expect(listagem.status).toBe(200);
      expect(listagem.body.data.alunos).toEqual([
        expect.objectContaining({
          nome: 'Pessoa Importada',
          email: 'pessoa.importada@pulsemais.org',
          cpf: '12345678901',
          programa: 'Mentoria',
          categoria: 'capacitado',
          engajamento: 72
        })
      ]);
    });

    it('deve preservar programa e categoria em atualizacao parcial por CSV', async () => {
      const response = await request(app)
        .post('/api/gestor/importacoes/alunos')
        .set('x-user-role', 'gestor')
        .send({
          csv: 'nome,email,status\nCarlos Atualizado,carlos.mendes@pulsemais.org,ativo'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.atualizados).toBe(1);

      const alunoAtualizado = await alunoRepository.findOneByOrFail({ email: 'carlos.mendes@pulsemais.org' });
      expect(alunoAtualizado.nome).toBe('Carlos Atualizado');
      expect(alunoAtualizado.programa).toBe('Jornada de empregabilidade');
      expect(alunoAtualizado.categoria).toBe('capacitado');
    });

    it('deve exportar os alunos em CSV com os campos atuais do cadastro', async () => {
      const response = await request(app)
        .get('/api/gestor/exportacoes/alunos')
        .set('x-user-role', 'gestor');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('alunos.csv');
      expect(response.text).toContain('codigoPm,cpf,nome,email');
      expect(response.text).toContain('Carlos Mendes');
      expect(response.text).toContain('carlos.mendes@pulsemais.org');
    });
  });

  describe('RNF - Qualidade para UC-03 a UC-06', () => {
    performanceIt('RNF-DES-UC04 - deve responder listagem de alunos em ate 1500ms', async () => {
      const inicio = Date.now();
      const response = await request(app).get('/api/alunos');
      const duracaoMs = Date.now() - inicio;

      expect(response.status).toBe(200);
      expect(duracaoMs).toBeLessThan(1500);
    });

    it('RNF-SEG-UC06 - deve padronizar erro sem expor stack trace', async () => {
      const response = await request(app).delete('/api/alunos/9999');

      expect(response.status).toBe(404);
      expect(response.body.stack).toBeUndefined();
    });
  });
});
