# Estrutura do Repositorio

Este documento descreve a organizacao de pastas definida para o repositorio do projeto Pulse Mais. A estrutura foi criada com base no WAD, nos requisitos funcionais RF001 a RF022 e no diagrama atualizado de casos de uso.

O objetivo desta organizacao e deixar o repositorio pronto para a equipe implementar o sistema do zero, com separacao clara entre backend, banco de dados, frontend, configuracoes gerais e documentacao.

## Visao geral

```text
g03/
|-- backend/
|-- database/
|-- frontend/
|-- docs/
|-- config/
|-- README.md
|-- package.json
|-- .gitignore
|-- .gitlab-ci.yml
`-- .editorconfig
```

## backend/

Pasta destinada ao servidor da aplicacao, APIs, regras de negocio, integracoes e testes.

```text
backend/
|-- package.json
|-- server.js
|-- README.md
|-- .env.example
|-- scripts/
|-- tests/
`-- src/
    |-- app.js
    |-- config/
    |-- controllers/
    |-- services/
    |-- repositories/
    |-- routes/
    |-- models/
    |-- middlewares/
    |-- database/
    |-- integrations/
    `-- utils/
```

Responsabilidades principais:

| Pasta | Responsabilidade |
|---|---|
| `src/config` | Configuracoes de ambiente, CORS, banco e permissoes. |
| `src/routes` | Declaracao das rotas HTTP da API. |
| `src/controllers` | Entrada das requisicoes e montagem das respostas HTTP. |
| `src/services` | Regras de negocio dos casos de uso. |
| `src/repositories` | Acesso ao banco de dados. |
| `src/models` | Contratos ou modelos das entidades do dominio. |
| `src/middlewares` | Autenticacao, permissao, validacao, LGPD e tratamento de erros. |
| `src/database` | Conexao, migrations e seeds executados pelo backend. |
| `src/integrations` | E-mail, notificacoes e outras integracoes externas. |
| `src/utils` | Funcoes auxiliares sem regra de negocio. |
| `tests` | Testes automatizados, principalmente testes de integracao. |
| `scripts` | Scripts auxiliares de banco, seed e automacao. |

## database/

Pasta destinada aos arquivos SQL do projeto.

```text
database/
|-- schema.sql
|-- README.md
|-- migrations/
|-- seeds/
`-- docs/
```

Responsabilidades principais:

| Pasta ou arquivo | Responsabilidade |
|---|---|
| `schema.sql` | Schema consolidado futuro do banco. |
| `migrations` | Scripts versionados de criacao e alteracao das tabelas. |
| `seeds` | Dados iniciais para desenvolvimento e testes. |
| `docs` | Dicionario de dados e documentacao do modelo fisico. |

As migrations foram planejadas a partir dos requisitos e casos de uso:

| Arquivo | Modulo relacionado |
|---|---|
| `001_create_perfis.sql` | Perfis de acesso. |
| `002_create_usuarios.sql` | Usuarios do sistema. |
| `003_create_alunos.sql` | Alunos e ex-alunos. |
| `004_create_programas.sql` | Programas da Pulse Mais. |
| `005_create_vinculos_programas.sql` | Historico de vinculos entre alunos e programas. |
| `006_create_atividades.sql` | Aulas, eventos e atividades. |
| `007_create_frequencias_aulas.sql` | UC-08, frequencia em aulas. |
| `008_create_participacoes_eventos.sql` | UC-09, participacao em eventos. |
| `009_create_empregabilidade.sql` | UC-10, empregabilidade. |
| `010_create_ensino_superior.sql` | UC-11, ensino superior. |
| `011_create_anotacoes_qualitativas.sql` | UC-12, anotacoes qualitativas. |
| `012_create_registros_saude_mental.sql` | UC-20, registros de saude mental. |
| `013_create_labels.sql` | Segmentacao e classificacao de alunos. |
| `014_create_notificacoes.sql` | Comunicacao e notificacoes. |
| `015_create_agenda.sql` | Agenda. |
| `016_create_auditoria.sql` | Rastreabilidade e LGPD. |
| `017_create_importacoes.sql` | Importacao de dados. |

## frontend/

Pasta destinada as telas, estilos, scripts e assets da interface.

```text
frontend/
|-- README.md
|-- pages/
|-- css/
|   |-- pages/
|   `-- themes/
|-- js/
|   |-- pages/
|   |-- services/
|   |-- components/
|   `-- utils/
`-- assets/
    |-- images/
    `-- icons/
```

Responsabilidades principais:

| Pasta | Responsabilidade |
|---|---|
| `pages` | Arquivos HTML das telas. |
| `css` | Estilos globais, componentes, temas e estilos por pagina. |
| `js/pages` | Logica especifica de cada tela. |
| `js/services` | Comunicacao com a API e controle de sessao. |
| `js/components` | Componentes reutilizaveis de interface. |
| `js/utils` | Formatadores e validadores de formulario. |
| `assets/images` | Imagens usadas pela aplicacao. |
| `assets/icons` | Icones futuros do sistema. |

As telas foram planejadas a partir dos casos de uso do diagrama:

| Tela | Caso de uso relacionado |
|---|---|
| `login.html` | Acesso inicial por perfil. |
| `portal-aluno.html` | UC-01 e UC-02. |
| `alunos.html` | Listagem e consulta de alunos. |
| `cadastro-aluno.html` | UC-03 e UC-04. |
| `perfil-aluno.html` | UC-06. |
| `jornada-aluno.html` | UC-07 a UC-12. |
| `segmentacao.html` | UC-13. |
| `dashboard.html` | UC-14 a UC-19. |
| `saude-mental.html` | UC-20. |
| `notificacoes.html` | Notificacoes e comunicacao. |
| `agenda.html` | Agenda institucional e pessoal. |
| `configuracoes.html` | Configuracoes futuras do sistema. |

## docs/

Pasta destinada a documentacao do projeto.

```text
docs/
|-- wad.md
|-- assets/
|-- architecture/
|-- api/
|-- testing/
|-- planning/
`-- others/
```

Responsabilidades principais:

| Pasta | Responsabilidade |
|---|---|
| `wad.md` | Documento principal do projeto. |
| `assets` | Imagens, diagramas, wireframes e materiais visuais. |
| `architecture` | Decisoes tecnicas e organizacao do repositorio. |
| `api` | Planejamento futuro das rotas. |
| `testing` | Estrategia futura de testes. |
| `planning` | Backlog tecnico e proximas tarefas. |
| `others` | Materiais complementares e apresentacoes. |

## config/

Pasta destinada a configuracoes compartilhadas do projeto.

```text
config/
|-- README.md
|-- env/
|-- docker/
`-- ci/
```

Responsabilidades principais:

| Pasta | Responsabilidade |
|---|---|
| `env` | Exemplos de variaveis por ambiente. |
| `docker` | Estrutura futura de Docker e Docker Compose. |
| `ci` | Modelos futuros de pipeline CI/CD. |

## Regra definida para esta etapa

Nesta etapa, os arquivos de programacao, banco e frontend nao possuem implementacao funcional. Eles foram mantidos apenas com comentarios de placeholder para que:

- a estrutura possa ser versionada no GitHub;
- a equipe saiba onde implementar cada parte;
- o repositorio fique preparado para desenvolvimento paralelo;
- os arquivos vazios nao sejam ignorados pelo Git.

Os documentos de arquitetura e o README geral nao devem ficar vazios, pois explicam a organizacao do projeto para a equipe.
