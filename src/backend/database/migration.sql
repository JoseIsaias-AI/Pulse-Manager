-- Schema PostgreSQL/Supabase alinhado aos models, repositories e testes de endpoints.

DO $$
BEGIN
  CREATE TYPE genero_aluno_enum AS ENUM (
    'feminino',
    'masculino',
    'nao_binario',
    'outro',
    'prefiro_nao_informar'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE status_aluno_enum AS ENUM (
    'ativo',
    'inativo',
    'egresso',
    'desligado',
    'em_acompanhamento'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE cargo_membro_enum AS ENUM (
    'gestor',
    'coordenador',
    'mentor',
    'voluntario',
    'administrativo',
    'outro'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE cargo_psicologo_enum AS ENUM (
    'psicologo',
    'coordenador_psicologico',
    'estagiario',
    'outro'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE tipo_notificacao_enum AS ENUM (
    'alerta',
    'informativo',
    'convite',
    'urgente',
    'outro'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE tipo_remetente_enum AS ENUM (
    'membro_equipe',
    'psicologo'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE tipo_oportunidade_enum AS ENUM (
    'emprego',
    'estagio',
    'curso',
    'evento',
    'bolsa',
    'voluntariado',
    'outro'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE tipo_usuario_agenda_enum AS ENUM (
    'aluno',
    'membro_equipe'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE tipo_label_enum AS ENUM (
    'risco',
    'interesse',
    'perfil',
    'acompanhamento',
    'prioridade',
    'outro'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE tipo_atividade_enum AS ENUM (
    'aula',
    'mentoria',
    'workshop',
    'evento',
    'avaliacao',
    'curso',
    'outro'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE tipo_atividade_enum ADD VALUE IF NOT EXISTS 'curso';

CREATE TABLE IF NOT EXISTS aluno (
  id_aluno INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  codigo_pm VARCHAR(20) UNIQUE,
  cpf VARCHAR(11) UNIQUE,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefone VARCHAR(30),
  idade INTEGER CHECK (idade IS NULL OR (idade >= 0 AND idade <= 120)),
  genero genero_aluno_enum,
  ocupacao VARCHAR(150),
  tipo_vinculo_empregaticio VARCHAR(50),
  renda_mensal DECIMAL(10,2) CHECK (renda_mensal IS NULL OR renda_mensal >= 0),
  escolaridade VARCHAR(100),
  instituicao_ensino_superior VARCHAR(150),
  curso_ensino_superior VARCHAR(150),
  status_ensino_superior VARCHAR(50),
  data_ingresso_ensino_superior DATE,
  programa VARCHAR(120) NOT NULL DEFAULT 'nao_informado',
  categoria VARCHAR(60) NOT NULL DEFAULT 'sem_categoria',
  risco_evasao VARCHAR(20) NOT NULL DEFAULT 'baixo' CHECK (risco_evasao IN ('baixo', 'medio', 'alto')),
  probabilidade_evasao DECIMAL(5,2) CHECK (probabilidade_evasao IS NULL OR (probabilidade_evasao >= 0 AND probabilidade_evasao <= 100)),
  engajamento INTEGER NOT NULL DEFAULT 0 CHECK (engajamento >= 0 AND engajamento <= 100),
  data_ingresso DATE NOT NULL DEFAULT CURRENT_DATE,
  status status_aluno_enum NOT NULL DEFAULT 'ativo',
  nivel_jornada VARCHAR(50),
  perfil_socioeconomico VARCHAR(150),
  curso VARCHAR(150),
  origem_participacao VARCHAR(100)
);

ALTER TABLE public.aluno
ADD COLUMN IF NOT EXISTS cpf VARCHAR(11);

ALTER TABLE public.aluno DROP CONSTRAINT IF EXISTS aluno_cpf_key;
ALTER TABLE public.aluno ADD CONSTRAINT aluno_cpf_key UNIQUE (cpf);

CREATE TABLE IF NOT EXISTS membro_equipe (
  id_membro INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cpf VARCHAR(11) UNIQUE,
  nome VARCHAR(150) NOT NULL,
  cargo cargo_membro_enum NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE
);

ALTER TABLE public.membro_equipe
ADD COLUMN IF NOT EXISTS cpf VARCHAR(11) UNIQUE;

CREATE TABLE IF NOT EXISTS psicologo (
  id_psi INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cpf VARCHAR(11) UNIQUE,
  email VARCHAR(255) UNIQUE,
  nome_psi VARCHAR(150) NOT NULL,
  cargo_psi cargo_psicologo_enum NOT NULL
);

ALTER TABLE public.psicologo
ADD COLUMN IF NOT EXISTS cpf VARCHAR(11) UNIQUE;

ALTER TABLE public.psicologo
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

CREATE TABLE IF NOT EXISTS atividade (
  id_atividade INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  tipo tipo_atividade_enum NOT NULL,
  descricao VARCHAR(500),
  data DATE,
  modalidade VARCHAR(50),
  carga_horaria INTEGER
);

CREATE TABLE IF NOT EXISTS notificacao (
  id_notificacao INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  id_aluno INTEGER NOT NULL,
  mensagem VARCHAR(500) NOT NULL,
  data_envio DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo tipo_notificacao_enum NOT NULL,
  id_remetente INTEGER NOT NULL,
  tipo_remetente tipo_remetente_enum NOT NULL,
  nome_remetente VARCHAR(150) NOT NULL,

  FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno)
);

CREATE TABLE IF NOT EXISTS oportunidade (
  id_oportunidade INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao VARCHAR(500),
  tipo tipo_oportunidade_enum NOT NULL,
  data_publicacao DATE DEFAULT CURRENT_DATE,
  prazo_inscricao DATE,
  id_membro INTEGER NOT NULL,

  FOREIGN KEY (id_membro) REFERENCES membro_equipe(id_membro)
);

CREATE TABLE IF NOT EXISTS agenda (
  id_agenda INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tipo_user tipo_usuario_agenda_enum NOT NULL,
  registro VARCHAR(500) NOT NULL,
  data DATE NOT NULL,
  hora_inicio TIME,
  hora_fim TIME,
  status INTEGER NOT NULL DEFAULT 1,
  id_membro INTEGER NOT NULL,
  id_aluno INTEGER NOT NULL,

  FOREIGN KEY (id_membro) REFERENCES membro_equipe(id_membro),
  FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno)
);

CREATE TABLE IF NOT EXISTS label (
  id_lbl INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  descricao VARCHAR(500) NOT NULL,
  tipo_label tipo_label_enum NOT NULL,
  id_aluno INTEGER NOT NULL,
  id_psi INTEGER NOT NULL,

  FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno),
  FOREIGN KEY (id_psi) REFERENCES psicologo(id_psi)
);

CREATE TABLE IF NOT EXISTS historico_psicologico (
  id_historico INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  observacao VARCHAR(500) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  id_aluno INTEGER NOT NULL,
  id_psi INTEGER NOT NULL,

  FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno),
  FOREIGN KEY (id_psi) REFERENCES psicologo(id_psi)
);

CREATE TABLE IF NOT EXISTS solicitacao_apoio_psicologico (
  id_solicitacao INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_aluno INTEGER NOT NULL,
  id_psicologo INTEGER NOT NULL,
  mensagem VARCHAR(500) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pendente',
  data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno),
  FOREIGN KEY (id_psicologo) REFERENCES psicologo(id_psi)
);

CREATE TABLE IF NOT EXISTS participacao (
  id_part INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  data_part DATE DEFAULT CURRENT_DATE,
  status_part BOOLEAN NOT NULL DEFAULT FALSE,
  id_aluno INTEGER NOT NULL,
  id_atividade INTEGER NOT NULL,
  nota DECIMAL(3,1) CHECK (nota IS NULL OR (nota >= 0 AND nota <= 10)),
  certificado BOOLEAN DEFAULT FALSE,

  FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno),
  FOREIGN KEY (id_atividade) REFERENCES atividade(id_atividade),

  UNIQUE (id_aluno, id_atividade)
);

CREATE TABLE IF NOT EXISTS anotacao_qualitativa (
  id_anotacao INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_aluno INTEGER NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descricao VARCHAR(1000) NOT NULL,
  autor VARCHAR(120) NOT NULL,
  data_registro DATE NOT NULL DEFAULT CURRENT_DATE,

  FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno)
);

ALTER TABLE public.aluno
ADD COLUMN IF NOT EXISTS codigo_pm VARCHAR(20),
ADD COLUMN IF NOT EXISTS telefone VARCHAR(30),
ADD COLUMN IF NOT EXISTS tipo_vinculo_empregaticio VARCHAR(50),
ADD COLUMN IF NOT EXISTS renda_mensal DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS instituicao_ensino_superior VARCHAR(150),
ADD COLUMN IF NOT EXISTS curso_ensino_superior VARCHAR(150),
ADD COLUMN IF NOT EXISTS status_ensino_superior VARCHAR(50),
ADD COLUMN IF NOT EXISTS data_ingresso_ensino_superior DATE,
ADD COLUMN IF NOT EXISTS programa VARCHAR(120) DEFAULT 'nao_informado',
ADD COLUMN IF NOT EXISTS categoria VARCHAR(60) DEFAULT 'sem_categoria',
ADD COLUMN IF NOT EXISTS risco_evasao VARCHAR(20) DEFAULT 'baixo',
ADD COLUMN IF NOT EXISTS probabilidade_evasao DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS engajamento INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS nivel_jornada VARCHAR(50),
ADD COLUMN IF NOT EXISTS perfil_socioeconomico VARCHAR(150),
ADD COLUMN IF NOT EXISTS curso VARCHAR(150),
ADD COLUMN IF NOT EXISTS origem_participacao VARCHAR(100);

ALTER TABLE public.atividade
ADD COLUMN IF NOT EXISTS modalidade VARCHAR(50),
ADD COLUMN IF NOT EXISTS carga_horaria INTEGER;

ALTER TABLE public.participacao
ADD COLUMN IF NOT EXISTS certificado BOOLEAN DEFAULT FALSE;

ALTER TABLE public.oportunidade
ADD COLUMN IF NOT EXISTS prazo_inscricao DATE;

ALTER TABLE public.agenda
ADD COLUMN IF NOT EXISTS hora_inicio TIME,
ADD COLUMN IF NOT EXISTS hora_fim TIME;

UPDATE public.aluno
SET programa = COALESCE(programa, curso, origem_participacao, 'nao_informado')
WHERE programa IS NULL;

UPDATE public.aluno
SET categoria = COALESCE(categoria, nivel_jornada, status::text, 'sem_categoria')
WHERE categoria IS NULL;

UPDATE public.aluno SET risco_evasao = 'baixo' WHERE risco_evasao IS NULL;
UPDATE public.aluno SET engajamento = 0 WHERE engajamento IS NULL;
UPDATE public.aluno SET data_ingresso = CURRENT_DATE WHERE data_ingresso IS NULL;

ALTER TABLE public.aluno
ALTER COLUMN programa SET DEFAULT 'nao_informado',
ALTER COLUMN programa SET NOT NULL,
ALTER COLUMN categoria SET DEFAULT 'sem_categoria',
ALTER COLUMN categoria SET NOT NULL,
ALTER COLUMN risco_evasao SET DEFAULT 'baixo',
ALTER COLUMN risco_evasao SET NOT NULL,
ALTER COLUMN engajamento SET DEFAULT 0,
ALTER COLUMN engajamento SET NOT NULL,
ALTER COLUMN data_ingresso SET DEFAULT CURRENT_DATE,
ALTER COLUMN data_ingresso SET NOT NULL;

ALTER TABLE public.aluno DROP CONSTRAINT IF EXISTS aluno_codigo_pm_key;
ALTER TABLE public.aluno ADD CONSTRAINT aluno_codigo_pm_key UNIQUE (codigo_pm);

ALTER TABLE public.aluno DROP CONSTRAINT IF EXISTS aluno_idade_check;
ALTER TABLE public.aluno
ADD CONSTRAINT aluno_idade_check CHECK (idade IS NULL OR (idade >= 0 AND idade <= 120));

ALTER TABLE public.aluno DROP CONSTRAINT IF EXISTS aluno_renda_mensal_check;
ALTER TABLE public.aluno
ADD CONSTRAINT aluno_renda_mensal_check CHECK (renda_mensal IS NULL OR renda_mensal >= 0);

ALTER TABLE public.aluno DROP CONSTRAINT IF EXISTS aluno_risco_evasao_check;
ALTER TABLE public.aluno
ADD CONSTRAINT aluno_risco_evasao_check CHECK (risco_evasao IN ('baixo', 'medio', 'alto'));

ALTER TABLE public.aluno DROP CONSTRAINT IF EXISTS aluno_probabilidade_evasao_check;
ALTER TABLE public.aluno
ADD CONSTRAINT aluno_probabilidade_evasao_check
CHECK (probabilidade_evasao IS NULL OR (probabilidade_evasao >= 0 AND probabilidade_evasao <= 100));

ALTER TABLE public.aluno DROP CONSTRAINT IF EXISTS aluno_engajamento_check;
ALTER TABLE public.aluno
ADD CONSTRAINT aluno_engajamento_check CHECK (engajamento >= 0 AND engajamento <= 100);

ALTER TABLE public.aluno
ADD COLUMN IF NOT EXISTS frequencia DECIMAL(5,2) DEFAULT 0;

ALTER TABLE public.aluno DROP CONSTRAINT IF EXISTS aluno_frequencia_check;
ALTER TABLE public.aluno
ADD CONSTRAINT aluno_frequencia_check
CHECK (frequencia IS NULL OR (frequencia >= 0 AND frequencia <= 100));

CREATE INDEX IF NOT EXISTS idx_aluno_codigo_pm
ON aluno(codigo_pm);

CREATE INDEX IF NOT EXISTS idx_aluno_status
ON aluno(status);

CREATE INDEX IF NOT EXISTS idx_aluno_programa
ON aluno(programa);

CREATE INDEX IF NOT EXISTS idx_aluno_categoria
ON aluno(categoria);

CREATE INDEX IF NOT EXISTS idx_aluno_risco_evasao
ON aluno(risco_evasao);

CREATE INDEX IF NOT EXISTS idx_aluno_nivel_jornada
ON aluno(nivel_jornada);

CREATE INDEX IF NOT EXISTS idx_aluno_curso
ON aluno(curso);

CREATE INDEX IF NOT EXISTS idx_aluno_escolaridade
ON aluno(escolaridade);

CREATE INDEX IF NOT EXISTS idx_aluno_ocupacao
ON aluno(ocupacao);

CREATE INDEX IF NOT EXISTS idx_aluno_data_ingresso
ON aluno(data_ingresso);

CREATE INDEX IF NOT EXISTS idx_atividade_tipo
ON atividade(tipo);

CREATE INDEX IF NOT EXISTS idx_participacao_aluno
ON participacao(id_aluno);

CREATE INDEX IF NOT EXISTS idx_participacao_atividade
ON participacao(id_atividade);

CREATE INDEX IF NOT EXISTS idx_notificacao_aluno
ON notificacao(id_aluno);

CREATE INDEX IF NOT EXISTS idx_oportunidade_membro
ON oportunidade(id_membro);

CREATE INDEX IF NOT EXISTS idx_agenda_aluno
ON agenda(id_aluno);

CREATE INDEX IF NOT EXISTS idx_agenda_membro
ON agenda(id_membro);

CREATE INDEX IF NOT EXISTS idx_label_aluno
ON label(id_aluno);

CREATE INDEX IF NOT EXISTS idx_historico_psicologico_aluno
ON historico_psicologico(id_aluno);

CREATE INDEX IF NOT EXISTS idx_anotacao_qualitativa_aluno
ON anotacao_qualitativa(id_aluno);
