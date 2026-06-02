# Camadas do Backend

Este documento explica a separacao de responsabilidades planejada para o backend do Pulse Mais. A organizacao segue a arquitetura em camadas usada nos diagramas de sequencia do WAD: Tela, Controller, Service, Repository e Banco.

Nesta etapa, os arquivos do backend ainda nao possuem codigo funcional. Cada arquivo existe apenas como placeholder comentado para orientar a implementacao futura.

## Fluxo padrao

```text
Requisicao HTTP
  -> route
  -> middleware
  -> controller
  -> service
  -> repository
  -> database
  -> resposta HTTP
```

## routes

Pasta:

```text
backend/src/routes
```

Responsabilidade:

- declarar os endpoints da API;
- conectar cada rota ao controller correto;
- aplicar middlewares especificos de autenticacao, permissao ou validacao;
- manter a navegacao HTTP separada da regra de negocio.

Exemplos planejados:

| Arquivo | Caso de uso relacionado |
|---|---|
| `alunoRoutes.js` | UC-03 e UC-06 |
| `portalAlunoRoutes.js` | UC-01 e UC-02 |
| `jornadaRoutes.js` | UC-07 |
| `frequenciaRoutes.js` | UC-08 |
| `participacaoRoutes.js` | UC-09 |
| `empregabilidadeRoutes.js` | UC-10 |
| `ensinoSuperiorRoutes.js` | UC-11 |
| `anotacaoQualitativaRoutes.js` | UC-12 |
| `segmentacaoRoutes.js` | UC-13 |
| `dashboardRoutes.js` | UC-14 a UC-19 |
| `saudeMentalRoutes.js` | UC-20 |
| `agendaRoutes.js` | Agenda |
| `notificacaoRoutes.js` | Notificacoes |

## controllers

Pasta:

```text
backend/src/controllers
```

Responsabilidade:

- receber parametros de `request`;
- chamar o service correto;
- devolver resposta HTTP com status code adequado;
- nao conter regra de negocio complexa;
- nao acessar diretamente o banco de dados.

Exemplo de responsabilidade futura:

```text
AlunoController
  recebe POST /api/alunos
  chama AlunoService
  retorna 201 em caso de sucesso
  retorna 400 quando o payload for invalido
```

## services

Pasta:

```text
backend/src/services
```

Responsabilidade:

- concentrar regras de negocio;
- validar condicoes do dominio;
- coordenar chamadas a repositories;
- disparar integracoes externas quando necessario;
- manter os controllers simples.

Regras do WAD que devem ficar nos services:

| Regra | Service mais provavel |
|---|---|
| RN001 - gerar codigo PM-AAAA-NNN | `codigoPmService.js` |
| RN002 - campos minimos do cadastro | `alunoService.js` |
| RN003 - evitar duplicidade de cadastro | `alunoService.js` |
| RN007 - calcular risco de evasao | `riscoEvasaoService.js` |
| RN008 - aluno empregado | `empregabilidadeService.js` |
| RN012 - acesso restrito a saude mental | `saudeMentalService.js` e middlewares |
| RN013 - aluno so altera contato | `portalAlunoService.js` |
| RN014 - rastrear origem da atualizacao | `portalAlunoService.js` e `auditoriaRepository.js` |
| RN018/RN019 - regras de agenda | `agendaService.js` |
| RN020 - psicologo acessa apenas alunos monitorados | `saudeMentalService.js` e `permissionMiddleware.js` |

## repositories

Pasta:

```text
backend/src/repositories
```

Responsabilidade:

- centralizar acesso ao PostgreSQL;
- conter queries SQL ou chamadas ao ORM, caso um ORM seja adotado;
- nao conter regra de negocio;
- retornar dados para os services.

Exemplo de responsabilidade futura:

```text
AlunoRepository
  findById
  findByEmail
  create
  update
  listWithFilters
```

## models

Pasta:

```text
backend/src/models
```

Responsabilidade:

- representar contratos das entidades;
- documentar campos esperados;
- servir como base para tipagem futura, caso o backend migre para TypeScript;
- evitar espalhar nomes de campos pelo projeto.

Entidades planejadas:

| Model | Origem no WAD |
|---|---|
| `AlunoModel.js` | cadastro, perfil e historico |
| `UsuarioModel.js` | perfis e controle de acesso |
| `ProgramaModel.js` | vinculos do aluno |
| `AtividadeModel.js` | aulas e eventos |
| `FrequenciaModel.js` | frequencia em aulas |
| `ParticipacaoModel.js` | participacao em eventos |
| `EmpregabilidadeModel.js` | dados de trabalho |
| `EnsinoSuperiorModel.js` | acesso ao ensino superior |
| `SaudeMentalModel.js` | registros psicologicos |
| `LabelModel.js` | segmentacao |
| `AgendaModel.js` | agenda |
| `NotificacaoModel.js` | comunicacao |
| `AuditoriaModel.js` | rastreabilidade e LGPD |

## middlewares

Pasta:

```text
backend/src/middlewares
```

Responsabilidade:

- autenticar usuario;
- validar permissao por perfil;
- validar payloads;
- tratar erros;
- proteger dados sensiveis.

Middlewares planejados:

| Arquivo | Responsabilidade |
|---|---|
| `authMiddleware.js` | verificar sessao ou token |
| `permissionMiddleware.js` | restringir acesso por perfil |
| `validationMiddleware.js` | validar payloads |
| `errorMiddleware.js` | padronizar erros |
| `lgpdMiddleware.js` | evitar exposicao indevida de dados sensiveis |

## database

Pasta:

```text
backend/src/database
```

Responsabilidade:

- configurar conexao com PostgreSQL;
- executar migrations e seeds quando necessario;
- preparar banco de teste no futuro.

Os arquivos SQL principais ficam fora do backend, em:

```text
database/
```

## integrations

Pasta:

```text
backend/src/integrations
```

Responsabilidade:

- isolar servicos externos;
- facilitar mocks nos testes;
- evitar chamadas externas espalhadas pelos services.

Integracoes planejadas:

| Arquivo | Uso futuro |
|---|---|
| `emailProvider.js` | envio de e-mails |
| `notificationProvider.js` | notificacoes externas |

## tests

Pasta:

```text
backend/tests
```

Responsabilidade:

- armazenar suites de teste;
- separar fixtures e helpers;
- cobrir os fluxos principais de ponta a ponta.

Estrutura planejada:

```text
backend/tests/
|-- setup.js
|-- fixtures/
|-- helpers/
`-- integration/
```

Suites planejadas:

| Suite | Fluxo |
|---|---|
| `alunos.integration.test.js` | UC-03 e UC-06 |
| `portal-aluno.integration.test.js` | UC-01 e UC-02 |
| `jornada.integration.test.js` | UC-07 a UC-12 |
| `segmentacao.integration.test.js` | UC-13 |
| `dashboard.integration.test.js` | UC-14 a UC-19 |
| `saude-mental.integration.test.js` | UC-20 |
| `agenda.integration.test.js` | Agenda |
| `notificacoes.integration.test.js` | Notificacoes |

## Regra para implementar um novo fluxo

Ao implementar um caso de uso, a equipe deve criar ou preencher os arquivos nesta ordem:

1. `routes`: endpoint do fluxo.
2. `middlewares`: validacoes, autenticacao e permissoes.
3. `controllers`: entrada HTTP.
4. `services`: regra de negocio.
5. `repositories`: acesso ao banco.
6. `database/migrations`: estrutura SQL necessaria.
7. `tests/integration`: testes do fluxo.
8. `frontend/pages`, `frontend/css/pages` e `frontend/js/pages`: tela correspondente.

Essa separacao evita que regras de negocio fiquem misturadas com rotas, banco ou interface.
