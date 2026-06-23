import { pool } from './pool';

type AlunoRow = { id_aluno: number };
type MembroRow = { id_membro: number };
type PsicologoRow = { id_psi: number };
type AtividadeRow = { id_atividade: number };

async function seed() {
  const client = await pool.connect();

  try {
    console.log('Rodando seed completo...');

    await client.query('BEGIN');

    await client.query(`
      TRUNCATE TABLE
        participacao,
        notificacao,
        oportunidade,
        agenda,
        "label",
        historico_psicologico,
        atividade,
        aluno,
        psicologo,
        membro_equipe
      RESTART IDENTITY CASCADE;
    `);

    const alunosResult = await client.query<AlunoRow>(`
      INSERT INTO aluno (
        nome, email, idade, genero, ocupacao, escolaridade, status,
        nivel_jornada, perfil_socioeconomico, curso, origem_participacao
      )
      VALUES
        ('Ana Clara Ribeiro', 'ana.clara.ribeiro@aluno.pulsemais.org', 19, 'feminino', 'Estudante', 'Ensino médio completo', 'ativo', 'conectado', 'baixa_renda', 'Introdução à Tecnologia', 'palestra_em_escola_publica'),
        ('Bruno Henrique Costa', 'bruno.costa@aluno.pulsemais.org', 22, 'masculino', 'Jovem aprendiz', 'Ensino superior incompleto', 'em_acompanhamento', 'capacitado', 'baixa_renda', 'Mentoria de Carreira em Tecnologia', 'programa_de_mentoria'),
        ('Carolina Mendes Faria', 'carolina.faria@aluno.pulsemais.org', 21, 'feminino', 'Estagiária', 'Ensino superior incompleto', 'ativo', 'transformado', 'baixa_renda', 'Formação em Dados', 'indicacao_de_parceiro'),
        ('Diego Matheus Lima', 'diego.lima@aluno.pulsemais.org', 18, 'masculino', 'Estudante', 'Ensino médio em andamento', 'ativo', 'conectado', 'vulnerabilidade_social', 'Vivência em Empresas de Tecnologia', 'vivencia_empresa'),
        ('Elisa Vitória Campos', 'elisa.campos@aluno.pulsemais.org', 24, 'feminino', 'Desempregada', 'Ensino médio completo', 'em_acompanhamento', 'capacitado', 'baixa_renda', 'Curso de Programação Web', 'rede_social'),
        ('Felipe Augusto Rocha', 'felipe.rocha@aluno.pulsemais.org', 23, 'masculino', 'Assistente administrativo', 'Ensino superior incompleto', 'egresso', 'transformado', 'baixa_renda', 'Trilha de Empregabilidade Tech', 'programa_pulse_mais'),
        ('Gabriela Moreira Lima', 'gabriela.moreira@aluno.pulsemais.org', 20, 'feminino', 'Estudante', 'Ensino superior incompleto', 'ativo', 'capacitado', 'bolsista', 'Formação em Produto Digital', 'bolsa_institucional'),
        ('Henrique Bastos Ferreira', 'henrique.ferreira@aluno.pulsemais.org', 25, 'masculino', 'Analista júnior', 'Ensino superior completo', 'egresso', 'transformado', 'baixa_renda', 'Rede de Talentos', 'ex_aluno_indicacao'),
        ('Isabela Teixeira Moura', 'isabela.moura@aluno.pulsemais.org', 18, 'feminino', 'Estudante', 'Ensino médio completo', 'ativo', 'conectado', 'vulnerabilidade_social', 'Introdução à Tecnologia', 'palestra_em_escola_publica'),
        ('João Pedro Martins', 'joao.martins@aluno.pulsemais.org', 21, 'masculino', 'Estagiário', 'Ensino superior incompleto', 'ativo', 'capacitado', 'baixa_renda', 'Formação em Dados', 'processo_seletivo'),
        ('Larissa Barbosa Neves', 'larissa.neves@aluno.pulsemais.org', 22, 'feminino', 'Jovem aprendiz', 'Ensino superior incompleto', 'em_acompanhamento', 'capacitado', 'baixa_renda', 'Mentoria de Carreira em Tecnologia', 'programa_de_mentoria'),
        ('Lucas Gabriel Nascimento', 'lucas.nascimento@aluno.pulsemais.org', 20, 'masculino', 'Desempregado', 'Ensino médio completo', 'ativo', 'conectado', 'baixa_renda', 'Vivência em Empresas de Tecnologia', 'evento_aberto'),
        ('Mariana Lopes Araújo', 'mariana.araujo@aluno.pulsemais.org', 23, 'feminino', 'Estagiária de tecnologia', 'Ensino superior incompleto', 'egresso', 'transformado', 'bolsista', 'Trilha de Empregabilidade Tech', 'bolsa_institucional'),
        ('Nicolas Eduardo Prado', 'nicolas.prado@aluno.pulsemais.org', 19, 'masculino', 'Estudante', 'Ensino médio completo', 'ativo', 'conectado', 'vulnerabilidade_social', 'Curso de Programação Web', 'rede_social'),
        ('Olívia Fernandes Reis', 'olivia.reis@aluno.pulsemais.org', 26, 'feminino', 'Assistente de suporte', 'Ensino superior completo', 'egresso', 'transformado', 'baixa_renda', 'Rede de Talentos', 'programa_pulse_mais'),
        ('Pedro Henrique Valente', 'pedro.valente@aluno.pulsemais.org', 24, 'masculino', 'Estagiário', 'Ensino superior incompleto', 'ativo', 'capacitado', 'baixa_renda', 'Formação em Produto Digital', 'indicacao_de_parceiro'),
        ('Rafaela Andrade Melo', 'rafaela.melo@aluno.pulsemais.org', 21, 'feminino', 'Estudante', 'Ensino superior incompleto', 'em_acompanhamento', 'capacitado', 'baixa_renda', 'Mentoria de Carreira em Tecnologia', 'programa_de_mentoria'),
        ('Sofia Beatriz Tavares', 'sofia.tavares@aluno.pulsemais.org', 18, 'feminino', 'Estudante', 'Ensino médio em andamento', 'ativo', 'conectado', 'vulnerabilidade_social', 'Introdução à Tecnologia', 'palestra_em_escola_publica'),
        ('Thiago Moraes Cunha', 'thiago.cunha@aluno.pulsemais.org', 25, 'masculino', 'Analista de suporte', 'Ensino superior completo', 'egresso', 'transformado', 'baixa_renda', 'Rede de Talentos', 'ex_aluno_indicacao'),
        ('Yasmin Helena Castro', 'yasmin.castro@aluno.pulsemais.org', 20, 'feminino', 'Estagiária', 'Ensino superior incompleto', 'ativo', 'capacitado', 'bolsista', 'Formação em Dados', 'processo_seletivo')
      RETURNING id_aluno;
    `);

    const alunos = alunosResult.rows.map((row: AlunoRow) => row.id_aluno);

    await Promise.all(alunos.map((idAluno, index) => {
      const cpf = String(index + 1).padStart(11, String(index + 1).slice(-1));
      return client.query('UPDATE aluno SET cpf = $1 WHERE id_aluno = $2', [cpf, idAluno]);
    }));

    const membrosResult = await client.query<MembroRow>(`
      INSERT INTO membro_equipe (nome, cargo, email)
      VALUES
        ('Helena Duarte', 'gestor', 'helena.duarte@pulsemais.org'),
        ('Mateus Albuquerque', 'coordenador', 'mateus.albuquerque@pulsemais.org'),
        ('Bianca Nogueira', 'mentor', 'bianca.nogueira@pulsemais.org'),
        ('Rafael Siqueira', 'administrativo', 'rafael.siqueira@pulsemais.org'),
        ('Clara Monteiro', 'voluntario', 'clara.monteiro@pulsemais.org')
      RETURNING id_membro;
    `);

    const membros = membrosResult.rows.map((row: MembroRow) => row.id_membro);

    const psicologosResult = await client.query<PsicologoRow>(`
      INSERT INTO psicologo (nome_psi, email, cargo_psi)
      VALUES
        ('Isadora Valença', 'isadora.valenca@pulsemais.org', 'psicologo'),
        ('André Lacerda', 'andre.lacerda@pulsemais.org', 'coordenador_psicologico'),
        ('Lívia Marcondes', 'livia.marcondes@pulsemais.org', 'estagiario'),
        ('Camila Furtado', 'camila.furtado@pulsemais.org', 'psicologo'),
        ('Samuel Azevedo', 'samuel.azevedo@pulsemais.org', 'outro')
      RETURNING id_psi;
    `);

    const psicologos = psicologosResult.rows.map((row: PsicologoRow) => row.id_psi);

    const atividadesResult = await client.query<AtividadeRow>(`
      INSERT INTO atividade (titulo, tipo, descricao, data, modalidade, carga_horaria)
      VALUES
        ('Aula de Introdução à Tecnologia e Carreiras Digitais', 'aula', 'Primeiro contato com áreas de tecnologia, carreiras digitais e repertório profissional.', '2026-06-10', 'presencial', 3),
        ('Workshop de Currículo, LinkedIn e Entrevistas', 'workshop', 'Oficina prática para preparação de currículo, LinkedIn e entrevistas de emprego.', '2026-06-12', 'online', 2),
        ('Mentoria de Planejamento de Carreira em Tecnologia', 'mentoria', 'Sessão coletiva de mentoria sobre objetivos profissionais e próximos passos.', '2026-06-17', 'hibrido', 2),
        ('Vivência em Empresa Parceira de Tecnologia', 'evento', 'Visita a empresa parceira para aproximação com o mercado de tecnologia.', '2026-06-20', 'presencial', 4),
        ('Avaliação Final da Trilha de Empregabilidade', 'avaliacao', 'Avaliação final da trilha com entrega de plano individual de carreira.', '2026-06-24', 'online', 1),
        ('Encontro de Rede de Talentos Pulse Mais', 'evento', 'Encontro com ex-alunos, mentores e empresas parceiras.', '2026-06-28', 'presencial', 3)
      RETURNING id_atividade;
    `);

    const atividades = atividadesResult.rows.map((row: AtividadeRow) => row.id_atividade);

    // -------------------------------------------------------------------------
    // participacao — unnest para evitar mistura de $N com literais e NULL
    // Mapeamento original: $1–$20 = alunos[0–19], $21–$26 = atividades[0–5]
    // -------------------------------------------------------------------------
    await client.query(
      `INSERT INTO participacao (id_aluno, id_atividade, status_part, nota, certificado)
       SELECT * FROM unnest($1::int[], $2::int[], $3::bool[], $4::numeric[], $5::bool[])`,
      [
        // id_aluno (30 linhas)
        [
          alunos[0],  alunos[0],  alunos[1],  alunos[1],  alunos[2],  alunos[2],
          alunos[3],  alunos[3],  alunos[4],  alunos[4],  alunos[5],  alunos[5],
          alunos[6],  alunos[6],  alunos[7],  alunos[7],  alunos[8],
          alunos[9],  alunos[9],  alunos[10], alunos[11], alunos[11],
          alunos[12], alunos[12], alunos[13], alunos[14], alunos[15],
          alunos[16], alunos[17], alunos[19]
        ],
        // id_atividade (30 linhas)
        [
          atividades[0], atividades[1], atividades[0], atividades[2], atividades[4], atividades[3],
          atividades[0], atividades[3], atividades[1], atividades[2], atividades[4], atividades[5],
          atividades[1], atividades[4], atividades[5], atividades[3], atividades[0],
          atividades[1], atividades[2], atividades[2], atividades[0], atividades[3],
          atividades[4], atividades[5], atividades[1], atividades[5], atividades[1],
          atividades[2], atividades[0], atividades[4]
        ],
        // status_part (30 linhas)
        [
          true,  true,  true,  true,  true,  true,
          true,  false, true,  true,  true,  true,
          true,  true,  true,  true,  true,
          true,  true,  true,  true,  true,
          true,  true,  true,  true,  true,
          true,  true,  true
        ],
        // nota — null representa NULL no banco (30 linhas)
        [
          8.7,  9.1,  7.8,  8.5,  9.4,  9.0,
          7.2,  null, 8.0,  8.3,  9.7,  9.2,
          8.6,  8.9,  9.6,  9.1,  7.5,
          8.8,  8.4,  7.9,  7.0,  8.1,
          9.8,  9.3,  7.6,  9.5,  8.2,
          8.0,  7.4,  9.0
        ] as (number | null)[],
        // certificado (30 linhas)
        [
          true,  true,  true,  true,  true,  true,
          false, false, true,  true,  true,  true,
          true,  true,  true,  true,  false,
          true,  true,  true,  false, true,
          true,  true,  false, true,  true,
          true,  false, true
        ]
      ]
    );

    // -------------------------------------------------------------------------
    // oportunidade — unnest para evitar mistura de literais com $N não-sequenciais
    // -------------------------------------------------------------------------
    await client.query(
      `INSERT INTO oportunidade (titulo, descricao, tipo, data_publicacao, prazo_inscricao, id_membro)
       SELECT * FROM unnest($1::text[], $2::text[], $3::tipo_oportunidade_enum[], $4::date[], $5::date[], $6::int[])`,
      [
        [
          'Estágio em Dados na Parceira Aurora Tech',
          'Bolsa para Curso de Front-End',
          'Evento de Carreiras em Tecnologia',
          'Voluntariado em Mentoria de LinkedIn',
          'Curso de SQL para Iniciantes',
          'Vaga Júnior em Suporte Técnico'
        ],
        [
          'Vaga para jovens em formação inicial em dados e tecnologia.',
          'Bolsa integral para curso introdutório de HTML, CSS e JavaScript.',
          'Encontro com empresas parceiras e profissionais de tecnologia.',
          'Oportunidade para apoiar colegas na construção de perfis profissionais.',
          'Curso prático para introdução a bancos de dados e consultas SQL.',
          'Oportunidade de primeiro emprego na área de tecnologia.'
        ],
        ['estagio', 'bolsa', 'evento', 'voluntariado', 'curso', 'emprego'],
        [null, null, null, null, null, null] as (string | null)[],
        ['2026-06-30', '2026-07-10', '2026-06-25', '2026-07-15', '2026-07-20', '2026-07-05'],
        [membros[0], membros[1], membros[2], membros[4], membros[1], membros[0]]
      ]
    );

    // -------------------------------------------------------------------------
    // agenda — unnest para evitar mistura de $N com literais e o inteiro 1
    // Mapeamento original: $1–$20 = alunos[0–19], $21–$25 = membros[0–4]
    // -------------------------------------------------------------------------
    await client.query(
      `INSERT INTO agenda (tipo_user, registro, data, hora_inicio, hora_fim, status, id_membro, id_aluno)
       SELECT * FROM unnest($1::tipo_usuario_agenda_enum[], $2::text[], $3::date[], $4::time[], $5::time[], $6::int[], $7::int[], $8::int[])`,
      [
        // tipo_user (10 linhas)
        ['aluno', 'aluno', 'membro_equipe', 'aluno', 'aluno', 'aluno', 'membro_equipe', 'aluno', 'aluno', 'aluno'],
        // registro (10 linhas)
        [
          'Mentoria individual sobre próximos passos de carreira',
          'Acompanhamento de frequência e engajamento',
          'Reunião de revisão de indicadores do dashboard',
          'Sessão de orientação para processo seletivo',
          'Acompanhamento psicossocial preventivo',
          'Revisão de currículo e perfil profissional',
          'Planejamento de atividades do mês',
          'Check-in de jornada e atualização de status',
          'Preparação para entrevista técnica',
          'Reunião de acompanhamento de ex-aluno'
        ],
        // data (10 linhas)
        ['2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19', '2026-06-20', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26', '2026-06-27'],
        // hora_inicio (10 linhas)
        ['14:00', '10:00', '09:30', '16:00', '11:00', '15:00', '13:30', '10:30', '17:00', '09:00'],
        // hora_fim (10 linhas)
        ['15:00', '10:45', '10:30', '17:00', '11:50', '16:00', '14:30', '11:15', '18:00', '09:45'],
        // status (10 linhas) — sempre 1 (ativo)
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // id_membro (10 linhas)
        [membros[0], membros[1], membros[0], membros[2], membros[3], membros[4], membros[1], membros[0], membros[2], membros[0]],
        // id_aluno (10 linhas)
        [alunos[0], alunos[1], alunos[2], alunos[4], alunos[10], alunos[15], alunos[6], alunos[16], alunos[19], alunos[14]]
      ]
    );

    // -------------------------------------------------------------------------
    // notificacao — unnest para evitar mistura de $N com strings literais
    // Mapeamento original: $1–$20 = alunos[0–19], $21–$25 = membros[0–4],
    //                      $26–$30 = psicologos[0–4]
    // -------------------------------------------------------------------------
    await client.query(
      `INSERT INTO notificacao (titulo, id_aluno, mensagem, tipo, id_remetente, tipo_remetente, nome_remetente)
       SELECT * FROM unnest($1::text[], $2::int[], $3::text[], $4::tipo_notificacao_enum[], $5::int[], $6::tipo_remetente_enum[], $7::text[])`,
      [
        // titulo (10 linhas)
        [
          'Convite para mentoria individual',
          'Alerta de acompanhamento',
          'Oportunidade de estágio',
          'Sessão psicossocial agendada',
          'Prazo de inscrição próximo',
          'Check-in de bem-estar',
          'Convite para evento de carreiras',
          'Atualização de perfil pendente',
          'Feedback disponível',
          'Acompanhamento prioritário'
        ],
        // id_aluno (10 linhas)
        [alunos[0], alunos[1], alunos[2], alunos[4], alunos[6], alunos[10], alunos[11], alunos[13], alunos[15], alunos[16]],
        // mensagem (10 linhas)
        [
          'Você foi convidado para uma mentoria individual sobre planejamento de carreira.',
          'Foi identificado um ponto de atenção em sua frequência. Procure a equipe para apoio.',
          'Uma nova oportunidade de estágio em dados foi publicada para seu perfil.',
          'Sua sessão de acompanhamento foi agendada. Confira sua agenda.',
          'O prazo para inscrição na bolsa de front-end está próximo do encerramento.',
          'Gostaríamos de saber como você está se sentindo nesta etapa da jornada.',
          'Você foi selecionado para participar do evento de carreiras em tecnologia.',
          'Atualize seus dados para receber oportunidades mais aderentes ao seu momento.',
          'Seu feedback de participação no workshop já está disponível.',
          'Foi aberta uma prioridade de acompanhamento para apoiar sua permanência na jornada.'
        ],
        // tipo (10 linhas)
        ['convite', 'alerta', 'informativo', 'informativo', 'urgente', 'informativo', 'convite', 'alerta', 'informativo', 'urgente'],
        // id_remetente (10 linhas)
        [membros[2], membros[1], membros[0], psicologos[0], membros[1], psicologos[3], membros[2], membros[3], membros[4], psicologos[1]],
        // tipo_remetente (10 linhas)
        ['membro_equipe', 'membro_equipe', 'membro_equipe', 'psicologo', 'membro_equipe', 'psicologo', 'membro_equipe', 'membro_equipe', 'membro_equipe', 'psicologo'],
        // nome_remetente (10 linhas)
        ['Bianca Nogueira', 'Mateus Albuquerque', 'Helena Duarte', 'Isadora Valença', 'Mateus Albuquerque', 'Camila Furtado', 'Bianca Nogueira', 'Rafael Siqueira', 'Clara Monteiro', 'André Lacerda']
      ]
    );

    // -------------------------------------------------------------------------
    // label — unnest para evitar mistura de $N com strings literais
    // Mapeamento original: $1–$20 = alunos[0–19], $21–$25 = psicologos[0–4]
    // -------------------------------------------------------------------------
    await client.query(
      `INSERT INTO "label" (descricao, tipo_label, id_aluno, id_psi)
       SELECT * FROM unnest($1::text[], $2::tipo_label_enum[], $3::int[], $4::int[])`,
      [
        // descricao (10 linhas)
        [
          'Aluno com alto engajamento em atividades práticas',
          'Necessita acompanhamento por queda recente de frequência',
          'Interesse declarado em carreira de dados',
          'Acompanhamento preventivo de adaptação à jornada',
          'Prioridade para oportunidades de estágio',
          'Perfil indicado para mentoria de entrevistas',
          'Atenção ao equilíbrio entre trabalho e estudos',
          'Interesse em desenvolvimento front-end',
          'Acompanhamento de transição para egresso',
          'Prioridade para rede de talentos'
        ],
        // tipo_label (10 linhas)
        ['perfil', 'risco', 'interesse', 'acompanhamento', 'prioridade', 'perfil', 'risco', 'interesse', 'acompanhamento', 'prioridade'],
        // id_aluno (10 linhas)
        [alunos[0], alunos[1], alunos[2], alunos[4], alunos[6], alunos[9], alunos[10], alunos[13], alunos[14], alunos[19]],
        // id_psi (10 linhas)
        [psicologos[0], psicologos[1], psicologos[0], psicologos[3], psicologos[1], psicologos[2], psicologos[3], psicologos[0], psicologos[4], psicologos[1]]
      ]
    );

    // -------------------------------------------------------------------------
    // historico_psicologico — unnest para evitar mistura de $N com strings
    // Mapeamento original: $1–$20 = alunos[0–19], $21–$25 = psicologos[0–4]
    // -------------------------------------------------------------------------
    await client.query(
      `INSERT INTO historico_psicologico (observacao, titulo, id_aluno, id_psi)
       SELECT * FROM unnest($1::text[], $2::text[], $3::int[], $4::int[])`,
      [
        // observacao (8 linhas)
        [
          'Aluno relatou ansiedade antes de entrevistas, mas demonstrou boa abertura para estratégias de preparação.',
          'Aluna apresentou melhora na autoconfiança após participação em mentorias e oficinas.',
          'Registro de acompanhamento preventivo por sobrecarga entre estudos, estágio e atividades da Pulse Mais.',
          'Aluno demonstra necessidade de reforço na organização de prazos e tarefas da jornada.',
          'Aluna relatou maior segurança para interações profissionais após vivência em empresa parceira.',
          'Aluno egresso em fase de adaptação ao primeiro emprego em tecnologia.',
          'Registro de atenção por oscilação de frequência e participação nas últimas atividades.',
          'Aluna demonstrou boa evolução emocional durante o programa de mentoria.'
        ],
        // titulo (8 linhas)
        [
          'Ansiedade em processo seletivo',
          'Evolução de autoconfiança',
          'Sobrecarga de rotina',
          'Organização de rotina',
          'Segurança em ambiente profissional',
          'Adaptação ao primeiro emprego',
          'Oscilação de engajamento',
          'Evolução no programa de mentoria'
        ],
        // id_aluno (8 linhas)
        [alunos[1], alunos[4], alunos[6], alunos[10], alunos[12], alunos[14], alunos[16], alunos[19]],
        // id_psi (8 linhas)
        [psicologos[1], psicologos[0], psicologos[3], psicologos[2], psicologos[0], psicologos[4], psicologos[1], psicologos[3]]
      ]
    );

    await client.query('COMMIT');

    console.log('Seed completo executado com sucesso!');
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    console.error('Erro ao executar seed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error: unknown) => {
  console.error('Seed finalizado com erro:', error);
});
