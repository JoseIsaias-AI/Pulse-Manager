import { pool } from './pool';

async function seed() {
  const client = await pool.connect();

  try {
    console.log('Rodando seed...');

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

    const alunosResult = await client.query(`
      INSERT INTO aluno (
        nome,
        email,
        idade,
        genero,
        ocupacao,
        escolaridade,
        status,
        nivel_jornada,
        perfil_socioeconomico,
        curso,
        origem_participacao
      )
      VALUES
        (
          'Ana Souza',
          'ana.souza@email.com',
          22,
          'feminino',
          'Estudante',
          'Ensino médio completo',
          'ativo',
          'capacitado',
          'baixa_renda',
          'Programa Pulse Mais',
          'programa_pulse_mais'
        ),
        (
          'Lucas Lima',
          'lucas.lima@email.com',
          24,
          'masculino',
          'Estagiário',
          'Ensino superior incompleto',
          'em_acompanhamento',
          'conectado',
          'baixa_renda',
          'Programa de Mentoria',
          'programa_mentoria'
        ),
        (
          'Mariana Alves',
          'mariana.alves@email.com',
          21,
          'feminino',
          'Desempregada',
          'Ensino médio completo',
          'ativo',
          'transformado',
          'vulnerabilidade_social',
          'Curso de curta duração',
          'curso_curta_duracao'
        )
      RETURNING id_aluno;
    `);

    const idAluno1 = alunosResult.rows[0].id_aluno;
    const idAluno2 = alunosResult.rows[1].id_aluno;
    const idAluno3 = alunosResult.rows[2].id_aluno;

    const membrosResult = await client.query(`
      INSERT INTO membro_equipe (nome, cargo, email)
      VALUES
        ('Denise Ghattas', 'gestor', 'denise@pulsemais.org'),
        ('Rafael Santos', 'coordenador', 'rafael@pulsemais.org')
      RETURNING id_membro;
    `);

    const idMembro1 = membrosResult.rows[0].id_membro;
    const idMembro2 = membrosResult.rows[1].id_membro;

    const psicologosResult = await client.query(`
      INSERT INTO psicologo (nome_psi, cargo_psi)
      VALUES
        ('Beatriz Almeida', 'psicologo')
      RETURNING id_psi;
    `);

    const idPsi1 = psicologosResult.rows[0].id_psi;

    const atividadesResult = await client.query(`
      INSERT INTO atividade (
        titulo,
        tipo,
        descricao,
        data,
        modalidade,
        carga_horaria
      )
      VALUES
        (
          'Aula de lógica',
          'aula',
          'Atividade introdutória de lógica de programação.',
          '2026-05-20',
          'online',
          2
        ),
        (
          'Mentoria de carreira',
          'mentoria',
          'Encontro sobre mercado de trabalho e carreira em tecnologia.',
          '2026-05-22',
          'presencial',
          1
        ),
        (
          'Workshop de LinkedIn',
          'workshop',
          'Atividade para construção de perfil profissional no LinkedIn.',
          '2026-05-25',
          'hibrido',
          3
        )
      RETURNING id_atividade;
    `);

    const idAtividade1 = atividadesResult.rows[0].id_atividade;
    const idAtividade2 = atividadesResult.rows[1].id_atividade;
    const idAtividade3 = atividadesResult.rows[2].id_atividade;

    await client.query(
      `
      INSERT INTO participacao (
        id_aluno,
        id_atividade,
        status_part,
        nota,
        certificado
      )
      VALUES
        ($1, $2, true, 8.5, true),
        ($3, $2, true, 7.0, false),
        ($1, $4, false, NULL, false),
        ($5, $6, true, 9.0, true);
      `,
      [
        idAluno1,
        idAtividade1,
        idAluno2,
        idAtividade2,
        idAluno3,
        idAtividade3,
      ]
    );

    await client.query(
      `
      INSERT INTO oportunidade (
        titulo,
        descricao,
        tipo,
        data_publicacao,
        prazo_inscricao,
        id_membro
      )
      VALUES
        (
          'Vaga de estágio em tecnologia',
          'Oportunidade para jovens em início de carreira na área de tecnologia.',
          'estagio',
          CURRENT_DATE,
          '2026-06-30',
          $1
        ),
        (
          'Bolsa de estudos para graduação',
          'Bolsa de estudos em instituição parceira.',
          'bolsa',
          CURRENT_DATE,
          '2026-07-15',
          $2
        );
      `,
      [idMembro1, idMembro2]
    );

    await client.query(
      `
      INSERT INTO agenda (
        tipo_user,
        registro,
        data,
        hora_inicio,
        hora_fim,
        status,
        id_membro,
        id_aluno
      )
      VALUES
        (
          'aluno',
          'Conversa de acompanhamento com aluno.',
          '2026-05-28',
          '14:00',
          '15:00',
          1,
          $1,
          $2
        ),
        (
          'membro_equipe',
          'Reunião de orientação sobre oportunidade.',
          '2026-05-29',
          '10:00',
          '10:30',
          1,
          $3,
          $4
        );
      `,
      [idMembro1, idAluno1, idMembro2, idAluno2]
    );

    await client.query(
      `
      INSERT INTO notificacao (
        titulo,
        id_aluno,
        mensagem,
        tipo,
        id_remetente,
        tipo_remetente,
        nome_remetente
      )
      VALUES
        (
          'Nova oportunidade disponível',
          $1,
          'Há uma nova oportunidade de estágio disponível para seu perfil.',
          'informativo',
          $2,
          'membro_equipe',
          'Denise Ghattas'
        ),
        (
          'Acompanhamento psicológico',
          $3,
          'Foi registrado um novo acompanhamento para o aluno.',
          'alerta',
          $4,
          'psicologo',
          'Beatriz Almeida'
        );
      `,
      [idAluno1, idMembro1, idAluno2, idPsi1]
    );

    await client.query(
      `
      INSERT INTO "label" (
        descricao,
        tipo_label,
        id_aluno,
        id_psi
      )
      VALUES
        (
          'Aluno com necessidade de acompanhamento próximo.',
          'acompanhamento',
          $1,
          $2
        ),
        (
          'Aluno com alto interesse em tecnologia.',
          'interesse',
          $3,
          $2
        );
      `,
      [idAluno1, idPsi1, idAluno2]
    );

    await client.query(
      `
      INSERT INTO historico_psicologico (
        observacao,
        titulo,
        id_aluno,
        id_psi
      )
      VALUES
        (
          'Registro fictício de acompanhamento emocional para teste do sistema.',
          'Acompanhamento inicial',
          $1,
          $2
        );
      `,
      [idAluno2, idPsi1]
    );

    await client.query('COMMIT');

    console.log('Seed executado com sucesso!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();