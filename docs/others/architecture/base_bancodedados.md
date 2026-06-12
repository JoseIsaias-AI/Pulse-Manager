# Documentação de Banco de Dados PulseManager

Este documento serve como base unificada para os três níveis de modelagem do banco de dados do sistema PulseManager: **conceitual** (entidades, relacionamentos e cardinalidades), **lógico** (tipos de dados, chaves e constraints) e **físico** (índices, observações de implementação e DDL).

---

## Sumário de Entidades

| Entidade | Tipo | Descrição resumida |
|---|---|---|
| `Aluno` | Usuário | Entidade central; armazena dados dos jovens acompanhados |
| `MembroEquipe` | Usuário | Colaboradores institucionais da Pulse Mais |
| `Psicologo` | Usuário | Profissionais de acompanhamento psicossocial |
| `Atividade` | Domínio | Cursos, eventos, mentorias e aulas |
| `Participacao` | Associativa | Vínculo entre Aluno e Atividade |
| `Nota` | Domínio | Avaliações dos alunos por atividade |
| `HistoricoPsicologico` | Domínio | Registros de acompanhamento psicológico |
| `Label` | Domínio | Marcadores de acompanhamento atribuídos aos alunos |
| `Agenda` | Domínio | Compromissos de alunos e membros da equipe |
| `Oportunidade` | Domínio | Vagas, bolsas e eventos publicados pela equipe |
| `Notificacao` | Domínio | Mensagens e alertas enviados no sistema |

---

## Entidade `Aluno`

### Nível Conceitual
Entidade central do sistema, representa os jovens acompanhados pela Pulse Mais. Concentra a maior parte dos relacionamentos e é ponto de origem do histórico completo de cada aluno.

### Nível Lógico - Atributos

| Atributo | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id_aluno` | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único do aluno |
| `nome` | VARCHAR(100) | NOT NULL | Nome completo |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE | E-mail institucional ou pessoal |
| `idade` | INT | NOT NULL | Idade do aluno |
| `genero` | ENUM | NOT NULL | Gênero declarado |
| `ocupacao` | VARCHAR(100) | NULL | Ocupação atual |
| `escolaridade` | VARCHAR(100) | NULL | Nível de escolaridade |
| `data_ingresso` | DATE | NOT NULL | Data de entrada na organização |
| `status` | ENUM | NOT NULL | Status atual: `ativo`, `inativo`, `ex-aluno` |

### Nível Lógico - Relacionamentos e Cardinalidades

| Entidade relacionada | Cardinalidade | Descrição |
|---|---|---|
| `Participacao` | 1:N | Um aluno pode ter zero ou muitas participações em atividades |
| `Nota` | 1:N | Um aluno pode possuir zero ou muitas notas |
| `Agenda` | 1:N | Um aluno pode ter zero ou muitos compromissos registrados |
| `Label` | 1:N | Um aluno pode receber zero ou muitos marcadores |
| `HistoricoPsicologico` | 1:N | Um aluno pode ter zero ou muitos registros psicológicos |
| `Notificacao` | 1:N | Um aluno pode receber zero ou muitas notificações |

### Nível Físico - Observações
- Índice recomendado em `email` (busca frequente por login e identificação).
- Índice recomendado em `status` (filtros de listagem por categoria de aluno).
- O campo `status` não pode ser deletado fisicamente; alunos inativos permanecem com registro preservado (soft delete via `status`).
- Valor padrão de `status`: `ativo`.

---

## Entidade `MembroEquipe`

### Nível Conceitual
Representa os colaboradores da Pulse Mais responsáveis pela gestão administrativa e pedagógica. Podem publicar oportunidades, gerenciar a agenda institucional e enviar notificações.

### Nível Lógico - Atributos

| Atributo | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id_membro` | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único do membro |
| `nome` | VARCHAR(100) | NOT NULL | Nome completo |
| `cargo` | ENUM | NOT NULL | Cargo na organização |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE | E-mail institucional |

### Nível Lógico - Relacionamentos e Cardinalidades

| Entidade relacionada | Cardinalidade | Descrição |
|---|---|---|
| `Agenda` | 1:N | Um membro pode registrar zero ou muitos compromissos |
| `Oportunidade` | 1:N | Um membro pode publicar zero ou muitas oportunidades |
| `Notificacao` | 1:N | Um membro pode enviar zero ou muitas notificações |

### Nível Físico - Observações
- Índice recomendado em `email`.
- O campo `cargo` deve ser validado via ENUM no banco para garantir consistência dos perfis de acesso.

---

## Entidade `Psicologo`

### Nível Conceitual
Representa os profissionais de acompanhamento psicossocial. Possuem acesso exclusivo a registros sensíveis de saúde mental e são os únicos autorizados a criar `HistoricoPsicologico` e `Label` de natureza qualitativa.

### Nível Lógico - Atributos

| Atributo | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id_psi` | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único do psicólogo |
| `nome_psi` | VARCHAR(100) | NOT NULL | Nome completo |
| `cargo_psi` | ENUM | NOT NULL | Especialização ou cargo na organização |

### Nível Lógico - Relacionamentos e Cardinalidades

| Entidade relacionada | Cardinalidade | Descrição |
|---|---|---|
| `HistoricoPsicologico` | 1:N | Um psicólogo pode registrar zero ou muitos históricos |
| `Label` | 1:N | Um psicólogo pode criar zero ou muitas labels qualitativas |
| `Notificacao` | 1:N | Um psicólogo pode enviar zero ou muitas notificações |

### Nível Físico - Observações
- Registros de `HistoricoPsicologico` devem ser acessíveis apenas por usuários com `id_psi` válido (controle de acesso por perfil no backend).

---

## Entidade `Atividade`

### Nível Conceitual
Abstração genérica que unifica cursos, eventos, mentorias e aulas em uma única estrutura, reduzindo redundância de dados. O atributo `tipo` diferencia a natureza de cada atividade.

### Nível Lógico - Atributos

| Atributo | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id_atividade` | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único da atividade |
| `titulo` | VARCHAR(150) | NOT NULL | Título da atividade |
| `tipo` | ENUM | NOT NULL | Tipo: `curso`, `evento`, `mentoria`, `aula` |
| `descricao` | VARCHAR(500) | NULL | Descrição detalhada |
| `data` | DATE | NOT NULL | Data de realização |
| `nota` | DECIMAL(5,2) | NULL | Nota máxima ou referência avaliativa da atividade |

### Nível Lógico - Relacionamentos e Cardinalidades

| Entidade relacionada | Cardinalidade | Descrição |
|---|---|---|
| `Participacao` | 1:N | Uma atividade pode ter zero ou muitas participações registradas |
| `Nota` | 1:N | Uma atividade pode gerar zero ou muitas notas individuais |

### Nível Físico - Observações
- Índice recomendado em `tipo` e `data` para filtros frequentes de listagem.
- O campo `nota` na entidade `Atividade` representa a nota de referência da atividade; as notas individuais dos alunos são armazenadas na entidade `Nota`.

---

## Entidade `Participacao`

### Nível Conceitual
Entidade associativa que implementa o relacionamento muitos-para-muitos entre `Aluno` e `Atividade`, registrando o envolvimento efetivo do aluno em cada atividade com atributos próprios de data e status.

### Nível Lógico - Atributos

| Atributo | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id_part` | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único da participação |
| `data_part` | DATE | NOT NULL | Data da participação |
| `status_part` | BOOLEAN | NOT NULL | Presença confirmada (`true`) ou ausência (`false`) |
| `id_aluno` | INT | FK → Aluno(id_aluno), NOT NULL | Aluno participante |
| `id_atividade` | INT | FK → Atividade(id_atividade), NOT NULL | Atividade referenciada |

### Nível Lógico - Relacionamentos e Cardinalidades

| Entidade relacionada | Cardinalidade | Descrição |
|---|---|---|
| `Aluno` | N:1 | Cada participação pertence a exatamente um aluno |
| `Atividade` | N:1 | Cada participação está associada a exatamente uma atividade |

### Nível Físico - Observações
- Índice composto recomendado em `(id_aluno, id_atividade)` para consultas de histórico de participação.
- A combinação `(id_aluno, id_atividade)` pode ser declarada como `UNIQUE` para evitar duplicidade de registros.

---

## Entidade `Nota`

### Nível Conceitual
Armazena os resultados e avaliações individuais dos alunos por atividade, desacoplando a nota do aluno da nota de referência da atividade.

### Nível Lógico - Atributos

| Atributo | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id_nota` | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único da nota |
| `valor` | DECIMAL(5,2) | NOT NULL | Valor numérico da nota do aluno |
| `id_aluno` | INT | FK → Aluno(id_aluno), NOT NULL | Aluno avaliado |
| `id_atividade` | INT | FK → Atividade(id_atividade), NOT NULL | Atividade avaliada |

### Nível Lógico - Relacionamentos e Cardinalidades

| Entidade relacionada | Cardinalidade | Descrição |
|---|---|---|
| `Aluno` | N:1 | Cada nota pertence a exatamente um aluno |
| `Atividade` | N:1 | Cada nota está associada a exatamente uma atividade |

### Nível Físico - Observações
- Índice recomendado em `id_aluno` para consultas de histórico de notas por aluno.
- Restrição `CHECK` recomendada: `valor >= 0 AND valor <= 10` (ou conforme escala adotada).

---

## Entidade `HistoricoPsicologico`

### Nível Conceitual
Armazena observações qualitativas e classificações registradas pelos psicólogos durante o acompanhamento individual dos alunos. Acesso restrito ao perfil `Psicologo`.

### Nível Lógico - Atributos

| Atributo | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id_historico` | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único do registro |
| `titulo` | VARCHAR(150) | NOT NULL | Título do registro de acompanhamento |
| `observacao` | VARCHAR(1000) | NULL | Observação qualitativa detalhada |
| `classificacao` | VARCHAR(100) | NULL | Classificação do estado psicológico do aluno |
| `id_aluno` | INT | FK → Aluno(id_aluno), NOT NULL | Aluno acompanhado |
| `id_psi` | INT | FK → Psicologo(id_psi), NOT NULL | Psicólogo responsável pelo registro |

### Nível Lógico - Relacionamentos e Cardinalidades

| Entidade relacionada | Cardinalidade | Descrição |
|---|---|---|
| `Aluno` | N:1 | Cada registro pertence a exatamente um aluno |
| `Psicologo` | N:1 | Cada registro é elaborado por exatamente um psicólogo |

### Nível Físico - Observações
- Índice recomendado em `id_aluno` para consultas de histórico individual.
- Acesso à tabela deve ser bloqueado no nível de rota/middleware para perfis que não sejam `Psicologo`.
- Dados desta tabela se enquadram como sensíveis sob a LGPD e não devem ser expostos em exportações gerais.

---

## Entidade `Label`

### Nível Conceitual
Representa marcadores de acompanhamento atribuídos aos alunos. Podem ser gerados automaticamente pelo sistema ou criados manualmente por psicólogos.

### Nível Lógico - Atributos

| Atributo | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id_lbl` | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único da label |
| `descricao` | VARCHAR(200) | NOT NULL | Descrição do marcador |
| `tipo_label` | ENUM | NOT NULL | Tipo: `academico`, `comportamental`, `psicossocial`, `automatico` |
| `id_aluno` | INT | FK → Aluno(id_aluno), NOT NULL | Aluno ao qual a label é atribuída |
| `id_psi` | INT | FK → Psicologo(id_psi), NULL | Psicólogo autor; nulo quando gerada automaticamente |

### Nível Lógico - Relacionamentos e Cardinalidades

| Entidade relacionada | Cardinalidade | Descrição |
|---|---|---|
| `Aluno` | N:1 | Cada label está associada a exatamente um aluno |
| `Psicologo` | N:1 | Labels qualitativas podem ser criadas por um psicólogo; nulo se automática |

### Nível Físico - Observações
- `id_psi` é nullable: quando `NULL`, indica que a label foi gerada automaticamente pelo sistema.
- Índice recomendado em `id_aluno` para listagem de labels por aluno.

---

## Entidade `Agenda`

### Nível Conceitual
Armazena compromissos pessoais e institucionais, permitindo o registro de eventos vinculados tanto a alunos quanto a membros da equipe.

### Nível Lógico - Atributos

| Atributo | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id_agenda` | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único do compromisso |
| `tipo_user` | ENUM | NOT NULL | Tipo de usuário dono do compromisso: `aluno`, `membro` |
| `registro` | VARCHAR(300) | NOT NULL | Descrição do compromisso |
| `data` | DATE | NOT NULL | Data do compromisso |
| `status` | ENUM | NOT NULL | Status: `pendente`, `realizado`, `cancelado` |
| `id_membro` | INT | FK → MembroEquipe(id_membro), NULL | Membro responsável pelo registro; nulo se for compromisso do aluno |
| `id_aluno` | INT | FK → Aluno(id_aluno), NULL | Aluno vinculado ao compromisso; nulo se for compromisso institucional |

### Nível Lógico - Relacionamentos e Cardinalidades

| Entidade relacionada | Cardinalidade | Descrição |
|---|---|---|
| `MembroEquipe` | N:1 | Cada compromisso institucional é registrado por um membro da equipe |
| `Aluno` | N:1 | Um compromisso pode estar vinculado a um aluno |

### Nível Físico - Observações
- Ambos `id_membro` e `id_aluno` são nullable, pois um compromisso pode ser exclusivo de um dos tipos de usuário.
- Índice recomendado em `data` para consultas de agenda por período.
- Restrição de negócio: ao menos um dos campos (`id_membro` ou `id_aluno`) deve ser não nulo; pode ser garantido via constraint `CHECK` ou validação no backend.

---

## Entidade `Oportunidade`

### Nível Conceitual
Representa conteúdos disponibilizados pela equipe, como vagas de emprego, bolsas de estudo, cursos e eventos externos, acessíveis pelos alunos.

### Nível Lógico - Atributos

| Atributo | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id_oportunidade` | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único da oportunidade |
| `titulo` | VARCHAR(150) | NOT NULL | Título da oportunidade |
| `descricao` | VARCHAR(500) | NULL | Descrição detalhada |
| `tipo` | ENUM | NOT NULL | Tipo: `vaga`, `bolsa`, `curso`, `evento` |
| `data_publicacao` | DATE | NOT NULL | Data de publicação |
| `id_membro` | INT | FK → MembroEquipe(id_membro), NOT NULL | Membro responsável pela publicação |

### Nível Lógico - Relacionamentos e Cardinalidades

| Entidade relacionada | Cardinalidade | Descrição |
|---|---|---|
| `MembroEquipe` | N:1 | Cada oportunidade é publicada por exatamente um membro da equipe |

### Nível Físico - Observações
- Índice recomendado em `tipo` e `data_publicacao` para filtros de listagem.

---

## Entidade `Notificacao`

### Nível Conceitual
Registra as comunicações enviadas pelos membros da equipe e psicólogos direcionadas a alunos específicos do sistema.

### Nível Lógico - Atributos

| Atributo | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id_notificacao` | INT | PK, NOT NULL, AUTO_INCREMENT | Identificador único da notificação |
| `titulo` | VARCHAR(150) | NOT NULL | Título da mensagem |
| `mensagem` | VARCHAR(500) | NOT NULL | Conteúdo da notificação |
| `data_envio` | DATE | NOT NULL | Data de envio |
| `tipo` | ENUM | NOT NULL | Tipo: `alerta`, `informativo`, `convite`, `urgente` |
| `id_aluno` | INT | FK → Aluno(id_aluno), NOT NULL | Aluno destinatário |
| `id_membro` | INT | FK → MembroEquipe(id_membro), NULL | Membro remetente; nulo se enviado por psicólogo |
| `id_psi` | INT | FK → Psicologo(id_psi), NULL | Psicólogo remetente; nulo se enviado por membro da equipe |

### Nível Lógico - Relacionamentos e Cardinalidades

| Entidade relacionada | Cardinalidade | Descrição |
|---|---|---|
| `Aluno` | N:1 | Cada notificação está direcionada a exatamente um aluno |
| `MembroEquipe` | N:1 | Notificações podem ser enviadas por membros da equipe |
| `Psicologo` | N:1 | Notificações também podem ser enviadas por psicólogos |

### Nível Físico - Observações
- `id_membro` e `id_psi` são mutuamente exclusivos: exatamente um deles deve ser não nulo, identificando o remetente.
- Restrição de negócio pode ser garantida via `CHECK` ou validação no backend.
- Índice recomendado em `id_aluno` para listagem de notificações recebidas.

---

## Resumo de Relacionamentos - Visão Geral

| Entidade A | Cardinalidade | Entidade B | FK localizada em |
|---|---|---|---|
| `Aluno` | 1:N | `Participacao` | `Participacao.id_aluno` |
| `Atividade` | 1:N | `Participacao` | `Participacao.id_atividade` |
| `Aluno` | 1:N | `Nota` | `Nota.id_aluno` |
| `Atividade` | 1:N | `Nota` | `Nota.id_atividade` |
| `Aluno` | 1:N | `Label` | `Label.id_aluno` |
| `Psicologo` | 1:N | `Label` | `Label.id_psi` |
| `Aluno` | 1:N | `Agenda` | `Agenda.id_aluno` |
| `MembroEquipe` | 1:N | `Agenda` | `Agenda.id_membro` |
| `Aluno` | 1:N | `HistoricoPsicologico` | `HistoricoPsicologico.id_aluno` |
| `Psicologo` | 1:N | `HistoricoPsicologico` | `HistoricoPsicologico.id_psi` |
| `MembroEquipe` | 1:N | `Oportunidade` | `Oportunidade.id_membro` |
| `Aluno` | 1:N | `Notificacao` | `Notificacao.id_aluno` |
| `MembroEquipe` | 1:N | `Notificacao` | `Notificacao.id_membro` |
| `Psicologo` | 1:N | `Notificacao` | `Notificacao.id_psi` |