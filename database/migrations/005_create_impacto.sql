CREATE TABLE IF NOT EXISTS impacto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aluno_id INTEGER NOT NULL,
  empregabilidade_status TEXT,
  ensino_superior_status TEXT,
  renda_aproximada REAL,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (aluno_id) REFERENCES alunos(id)
);
