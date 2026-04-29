CREATE TABLE programas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descricao TEXT
);

CREATE TABLE alunos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  programa_id INTEGER,
  mentor TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (programa_id) REFERENCES programas(id)
);

CREATE TABLE jornada (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aluno_id INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  data_evento DATETIME NOT NULL,
  FOREIGN KEY (aluno_id) REFERENCES alunos(id)
);

CREATE TABLE prontuario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aluno_id INTEGER NOT NULL,
  gravidade TEXT NOT NULL,
  registro TEXT NOT NULL,
  registrado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (aluno_id) REFERENCES alunos(id)
);

CREATE TABLE impacto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aluno_id INTEGER NOT NULL,
  empregabilidade_status TEXT,
  ensino_superior_status TEXT,
  renda_aproximada REAL,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (aluno_id) REFERENCES alunos(id)
);

CREATE TABLE comunicacao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  segmento TEXT NOT NULL,
  assunto TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  enviado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
