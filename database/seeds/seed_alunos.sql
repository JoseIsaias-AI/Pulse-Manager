INSERT INTO programas (nome, descricao)
VALUES
  ('Mentoria de permanencia', 'Acompanhamento de alunos em maior vulnerabilidade'),
  ('Jornada de empregabilidade', 'Preparacao para transicao ao mercado');

INSERT INTO alunos (nome, cpf, email, telefone, status, programa_id, mentor)
VALUES
  ('Maria Silva', '12345678901', 'maria.silva@pulsemais.org', '11987654321', 'atencao', 1, 'Juliana Rocha'),
  ('Joao Pereira', '98765432100', 'joao.pereira@pulsemais.org', '11999887766', 'ativo', 2, 'Lucas Mendonca');
