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
      INSERT INTO psicologo (nome_psi, cargo_psi)
      VALUES
        ('Isadora Valença', 'psicologo'),
        ('André Lacerda', 'coordenador_psicologico'),
        ('Lívia Marcondes', 'estagiario'),
        ('Camila Furtado', 'psicologo'),
        ('Samuel Azevedo', 'outro')
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

    await client.query(
      `
      INSERT INTO participacao (id_aluno, id_atividade, status_part, nota, certificado)
      VALUES
        ($1, $21, true, 8.7, true),
        ($1, $22, true, 9.1, true),
        ($2, $21, true, 7.8, true),
        ($2, $23, true, 8.5, true),
        ($3, $25, true, 9.4, true),
        ($3, $24, true, 9.0, true),
        ($4, $21, true, 7.2, false),
        ($4, $24, false, NULL, false),
        ($5, $22, true, 8.0, true),
        ($5, $23, true, 8.3, true),
        ($6, $25, true, 9.7, true),
        ($6, $26, true, 9.2, true),
        ($7, $22, true, 8.6, true),
        ($7, $25, true, 8.9, true),
        ($8, $26, true, 9.6, true),
        ($8, $24, true, 9.1, true),
        ($9, $21, true, 7.5, false),
        ($10, $22, true, 8.8, true),
        ($10, $23, true, 8.4, true),
        ($11, $23, true, 7.9, true),
        ($12, $21, true, 7.0, false),
        ($12, $24, true, 8.1, true),
        ($13, $25, true, 9.8, true),
        ($13, $26, true, 9.3, true),
        ($14, $22, true, 7.6, false),
        ($15, $26, true, 9.5, true),
        ($16, $22, true, 8.2, true),
        ($17, $23, true, 8.0, true),
        ($18, $21, true, 7.4, false),
        ($20, $25, true, 9.0, true);
      `,
      [...alunos, ...atividades]
    );

    await client.query(
      `
      INSERT INTO oportunidade (titulo, descricao, tipo, data_publicacao, prazo_inscricao, id_membro)
      VALUES
        ('Estágio em Dados na Parceira Aurora Tech', 'Vaga para jovens em formação inicial em dados e tecnologia.', 'estagio', CURRENT_DATE, '2026-06-30', $1),
        ('Bolsa para Curso de Front-End', 'Bolsa integral para curso introdutório de HTML, CSS e JavaScript.', 'bolsa', CURRENT_DATE, '2026-07-10', $2),
        ('Evento de Carreiras em Tecnologia', 'Encontro com empresas parceiras e profissionais de tecnologia.', 'evento', CURRENT_DATE, '2026-06-25', $3),
        ('Voluntariado em Mentoria de LinkedIn', 'Oportunidade para apoiar colegas na construção de perfis profissionais.', 'voluntariado', CURRENT_DATE, '2026-07-15', $5),
        ('Curso de SQL para Iniciantes', 'Curso prático para introdução a bancos de dados e consultas SQL.', 'curso', CURRENT_DATE, '2026-07-20', $2),
        ('Vaga Júnior em Suporte Técnico', 'Oportunidade de primeiro emprego na área de tecnologia.', 'emprego', CURRENT_DATE, '2026-07-05', $1);
      `,
      membros
    );

    await client.query(
      `
      INSERT INTO agenda (tipo_user, registro, data, hora_inicio, hora_fim, status, id_membro, id_aluno)
      VALUES
        ('aluno', 'Mentoria individual sobre próximos passos de carreira', '2026-06-16', '14:00', '15:00', 1, $21, $1),
        ('aluno', 'Acompanhamento de frequência e engajamento', '2026-06-17', '10:00', '10:45', 1, $22, $2),
        ('membro_equipe', 'Reunião de revisão de indicadores do dashboard', '2026-06-18', '09:30', '10:30', 1, $21, $3),
        ('aluno', 'Sessão de orientação para processo seletivo', '2026-06-19', '16:00', '17:00', 1, $23, $5),
        ('aluno', 'Acompanhamento psicossocial preventivo', '2026-06-20', '11:00', '11:50', 1, $24, $11),
        ('aluno', 'Revisão de currículo e perfil profissional', '2026-06-23', '15:00', '16:00', 1, $25, $16),
        ('membro_equipe', 'Planejamento de atividades do mês', '2026-06-24', '13:30', '14:30', 1, $22, $7),
        ('aluno', 'Check-in de jornada e atualização de status', '2026-06-25', '10:30', '11:15', 1, $21, $17),
        ('aluno', 'Preparação para entrevista técnica', '2026-06-26', '17:00', '18:00', 1, $23, $20),
        ('aluno', 'Reunião de acompanhamento de ex-aluno', '2026-06-27', '09:00', '09:45', 1, $21, $15);
      `,
      [...alunos, ...membros]
    );

    await client.query(
      `
      INSERT INTO notificacao (titulo, id_aluno, mensagem, tipo, id_remetente, tipo_remetente, nome_remetente)
      VALUES
        ('Convite para mentoria individual', $1, 'Você foi convidado para uma mentoria individual sobre planejamento de carreira.', 'convite', $23, 'membro_equipe', 'Bianca Nogueira'),
        ('Alerta de acompanhamento', $2, 'Foi identificado um ponto de atenção em sua frequência. Procure a equipe para apoio.', 'alerta', $22, 'membro_equipe', 'Mateus Albuquerque'),
        ('Oportunidade de estágio', $3, 'Uma nova oportunidade de estágio em dados foi publicada para seu perfil.', 'informativo', $21, 'membro_equipe', 'Helena Duarte'),
        ('Sessão psicossocial agendada', $5, 'Sua sessão de acompanhamento foi agendada. Confira sua agenda.', 'informativo', $26, 'psicologo', 'Isadora Valença'),
        ('Prazo de inscrição próximo', $7, 'O prazo para inscrição na bolsa de front-end está próximo do encerramento.', 'urgente', $22, 'membro_equipe', 'Mateus Albuquerque'),
        ('Check-in de bem-estar', $11, 'Gostaríamos de saber como você está se sentindo nesta etapa da jornada.', 'informativo', $29, 'psicologo', 'Camila Furtado'),
        ('Convite para evento de carreiras', $12, 'Você foi selecionado para participar do evento de carreiras em tecnologia.', 'convite', $23, 'membro_equipe', 'Bianca Nogueira'),
        ('Atualização de perfil pendente', $14, 'Atualize seus dados para receber oportunidades mais aderentes ao seu momento.', 'alerta', $24, 'membro_equipe', 'Rafael Siqueira'),
        ('Feedback disponível', $16, 'Seu feedback de participação no workshop já está disponível.', 'informativo', $25, 'membro_equipe', 'Clara Monteiro'),
        ('Acompanhamento prioritário', $17, 'Foi aberta uma prioridade de acompanhamento para apoiar sua permanência na jornada.', 'urgente', $27, 'psicologo', 'André Lacerda');
      `,
      [...alunos, ...membros, ...psicologos]
    );

    await client.query(
      `
      INSERT INTO "label" (descricao, tipo_label, id_aluno, id_psi)
      VALUES
        ('Aluno com alto engajamento em atividades práticas', 'perfil', $1, $21),
        ('Necessita acompanhamento por queda recente de frequência', 'risco', $2, $22),
        ('Interesse declarado em carreira de dados', 'interesse', $3, $21),
        ('Acompanhamento preventivo de adaptação à jornada', 'acompanhamento', $5, $24),
        ('Prioridade para oportunidades de estágio', 'prioridade', $7, $22),
        ('Perfil indicado para mentoria de entrevistas', 'perfil', $10, $23),
        ('Atenção ao equilíbrio entre trabalho e estudos', 'risco', $11, $24),
        ('Interesse em desenvolvimento front-end', 'interesse', $14, $21),
        ('Acompanhamento de transição para egresso', 'acompanhamento', $15, $25),
        ('Prioridade para rede de talentos', 'prioridade', $20, $22);
      `,
      [...alunos, ...psicologos]
    );

    await client.query(
      `
      INSERT INTO historico_psicologico (observacao, titulo, id_aluno, id_psi)
      VALUES
        ('Aluno relatou ansiedade antes de entrevistas, mas demonstrou boa abertura para estratégias de preparação.', 'Ansiedade em processo seletivo', $2, $22),
        ('Aluna apresentou melhora na autoconfiança após participação em mentorias e oficinas.', 'Evolução de autoconfiança', $5, $21),
        ('Registro de acompanhamento preventivo por sobrecarga entre estudos, estágio e atividades da Pulse Mais.', 'Sobrecarga de rotina', $7, $24),
        ('Aluno demonstra necessidade de reforço na organização de prazos e tarefas da jornada.', 'Organização de rotina', $11, $23),
        ('Aluna relatou maior segurança para interações profissionais após vivência em empresa parceira.', 'Segurança em ambiente profissional', $13, $21),
        ('Aluno egresso em fase de adaptação ao primeiro emprego em tecnologia.', 'Adaptação ao primeiro emprego', $15, $25),
        ('Registro de atenção por oscilação de frequência e participação nas últimas atividades.', 'Oscilação de engajamento', $17, $22),
        ('Aluna demonstrou boa evolução emocional durante o programa de mentoria.', 'Evolução no programa de mentoria', $20, $24);
      `,
      [...alunos, ...psicologos]
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
