# Inteli - Instituto de Tecnologia e Liderança 

<p align="center">
<a href= "https://www.inteli.edu.br/"><img src="./docs/assets/inteli.png" alt="Inteli - Instituto de Tecnologia e Liderança" border="0"></a>
</p>

# Pulse Manager

## Grupo 03

## :student: Integrantes: 
- <a href="https://www.linkedin.com/in/ana-carvalho-27268634b/">Ana Luiza Lima de Carvalho</a>
- <a href="http://www.linkedin.com/in/felipe-sodr%C3%A9-pess%C3%B4a">Felipe Sodré Pessôa</a> 
- <a href="https://www.linkedin.com/in/gabrielibattini/">Gabrieli Marques Battini</a> 
- <a href="https://www.linkedin.com/in/joseisaias/">José Isaias Menezes Santos</a>
- <a href="https://www.linkedin.com/in/nicolas-rigolin-carrascossa-4492b2261/">Nicolas Rigolin Carrascossa</a> 
- <a href="https://www.linkedin.com/in/raffael-bensoussan-98331b187/">Raffael Cabral Bensoussan</a>
- <a href="https://www.linkedin.com/in/lisboavitor/">Vitor Medrado Lisboa</a>

## :teacher: Professores:
### Orientador(a) 
- <a href="https://www.linkedin.com/in/juliastateri/?locale=pt">Julia Stateri</a>
### Instrutores
- <a href="https://www.linkedin.com/in/anacristinadossantos/">Ana Cristina dos Santos</a>
- <a href="https://www.linkedin.com/in/zotovici/">Andrea Zotovici</a> 
- <a href="https://www.linkedin.com/in/fabiocassiosouza/">Fabio Cassio Souza</a> 
- <a href="https://www.linkedin.com/in/fernando-pizzo-208b526a/">Fernando Pizzo</a>
- <a href="https://www.linkedin.com/in/vanunes/">Vanessa Nunes</a>

## Descrição:

 **Pulse Manager** é um sistema web de gestão de alunos desenvolvido para a ONG Pulse Mais. Ele centraliza o acompanhamento da jornada formativa dos alunos,  desde frequência e participação em atividades até indicadores de empregabilidade e acesso ao ensino superior, e disponibiliza módulos especializados para cada perfil de usuário.

O sistema atende três perfis de acesso: o **Gestor**, responsável por administrar cadastros, agenda e monitorar indicadores de impacto; o **Psicólogo**, que registra prontuários, acompanha a saúde mental dos alunos e visualiza o desempenho individual dos alunos; e o **Aluno**, que consulta seu perfil, cursos e oportunidades dísponiveis 

Entre as funcionalidades principais estão: cadastro e segmentação de alunos por critérios de risco e programa; agenda para os gestores; registro de frequências, participações e anotações qualitativas; gerenciamento de agenda com criação e cancelamento de eventos; sistema de notificações e oportunidades; módulo de saúde mental com prontuários e labels psicológicas; e um dashboard de impacto com métricas consolidadas, integrado a um serviço externo de auditoria.

A aplicação é composta por um backend em **Node.js + TypeScript** para persistência em PostgreSQL, e um frontend em HTML, CSS e JavaScript.

## Link de demonstração

_Coloque aqui o link para o vídeo de demonstração do projeto_
_A inserção do video sera feita na Sprint 05 com o projeto finalizado_

## Estrutura de pastas

Dentre os arquivos e pastas presentes na raiz do projeto, definem-se:

- <b>documentos</b>: reúne a documentação do projeto, incluindo setup, decisões técnicas, API e WAD.

- <b>src</b>: contém o código-fonte principal da aplicação.

- <b>.gitattributes</b>: define configurações de atributos específicos do repositório Git.

- <b>.gitignore</b>: especifica arquivos e pastas que o Git deve ignorar no versionamento.

- <b>README.md</b>: arquivo introdutório com visão geral do projeto e instruções de uso.

- <b>jest.config.ts</b>: arquivo de configuração do framework de testes automatizados Jest.

- <b>package-lock.json</b>: arquivo gerado automaticamente que mapeia a árvore exata de dependências instaladas.

- <b>package.json</b>: manifesto do projeto Node.js que lista metadados, scripts de execução e dependências.

- <b>tsconfig.json</b>: arquivo de configuração do compilador do TypeScript.


Além das pastas na raiz do projeto, também estão presentes as pastas secundárias, definidas por:


No diretório <b>docs</b>:


- <b>assets</b>: concentra as imagens utilizadas na documentação.

- <b>others</b>: armazena arquivos complementares e apresentações de entregas (sprints) do projeto.

- <b>wad.md</b>: documento contendo as definições de arquitetura da aplicação (Web Architecture Document).


No diretório <b>src</b>:


- <b>backend</b>: reúne a API da aplicação, integrando rotas, controladores, modelos e banco de dados.

- <b>frontend</b>: concentra os arquivos relacionados à interface de usuário e interação do lado do cliente.

- <b>scripts</b>: armazena scripts auxiliares de automação ou integração do projeto.

- <b>tests</b>: centraliza os arquivos e padronizações dedicados à realização de testes na aplicação.

- <b>server.ts</b>: arquivo principal responsável por inicializar a execução do servidor.


## Instalação e Configuração de Ambiente

Esta seção apresenta as instruções necessárias para configurar o ambiente de desenvolvimento e executar a primeira versão funcional do sistema web em uma máquina local.

### 1. Pré-requisitos

Antes de iniciar a execução do projeto, é necessário ter instalado:

* **Node.js** em versão LTS;
* **npm**, instalado junto ao Node.js;
* **Git**, para clonar o repositório;
* **PostgreSQL** ou acesso a um banco PostgreSQL/Supabase configurado;
* Editor de código, **Visual Studio Code**.

### 2. Instalação e execução

```sh
# 1. Clonar o repositório e entrar na pasta
git clone https://git.inteli.edu.br/graduacao/2026-1b/t29/g03.git
cd g03

# 2. Instalar as dependências
npm install

# 3. Testar a conexão com o banco
npm run db:test

# 4. Executar as migrations (cria as tabelas)
npm run migrate

# 5. (Opcional) Popular o banco com dados iniciais
npm run seed
```

Comandos de execução disponíveis:

| Modo | Comando | Descrição |
|---|---|---|
| Desenvolvimento | `npm run dev` | ts-node-dev com hot-reload. |
| Build | `npm run build` | Compila TypeScript para `dist/`. |
| Produção | `npm start` | Executa `dist/backend/server.js`. |
| Testes | `npm test` | Jest em modo serial (`--runInBand`). |

### 3. Configuração de ambiente

A conexão com o banco aceita dois modos mutuamente exclusivos:

- **Modo A — connection string:** defina `DATABASE_URL` (recomendado para Supabase ou Postgres remoto).
- **Modo B — variáveis individuais:** defina `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` e `DB_DATABASE` (Postgres local).

#### Exemplo de `.env`

```env
# Aplicação 
NODE_ENV=development
PORT=3000

#  Banco de dados — MODO A (connection string) 
DATABASE_URL=postgresql://postgres.<seu-projeto>:<sua-senha>@<seu-host>.pooler.supabase.com:5432/postgres
DATABASE_SSL=true

# Banco de dados — MODO B (variáveis individuais)
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=postgres
# DB_DATABASE=pulse_uc13
# DATABASE_SSL=false

# Tipo de banco (postgres | sqljs)
# DB_TYPE=postgres   # padrão: postgres em dev, sqljs em test
```

Para executar localmente sem PostgreSQL ou Supabase configurado, usando o banco em memória:

```sh
npm run dev:local
```

Esse modo carrega automaticamente uma massa demonstrativa de alunos. Os dados são recriados sempre que o servidor local é reiniciado.

Caso o projeto utilize apenas o modo de produção/local simples, utilize:

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `NODE_ENV` | Não | development | Ambiente de execução. Em `test`, o banco muda automaticamente para `sqljs`. |
| `PORT` | Não | 3000 | Porta HTTP do servidor Express. |

#### Variáveis — banco de dados

| Variável | Alternativa aceita | Obrigatória | Padrão | Descrição |
|---|---|---|---|---|
| `DATABASE_URL` | `SUPABASE_DB_URL` | Não* | — | Connection string completa do PostgreSQL. Se definida, as variáveis `DB_*` são ignoradas. |
| `DATABASE_SSL` | — | Não | `true` se `DATABASE_URL` definida, senão `false` | Habilita SSL na conexão. |
| `DB_TYPE` | `DB_MODE` | Não | postgres | Tipo do banco: `postgres` ou `sqljs` (in-memory, usado nos testes). |
| `DB_HOST` | — | Não* | localhost | Host do PostgreSQL (Modo B). |
| `DB_PORT` | — | Não* | 5432 | Porta do PostgreSQL (Modo B). |
| `DB_USERNAME` | `DB_USER` | Não* | postgres | Usuário do banco (Modo B). |
| `DB_PASSWORD` | — | Não* | postgres | Senha do banco (Modo B). |
| `DB_DATABASE` | `DB_NAME` | Não* | pulse_uc13 | Nome do banco (Modo B). |

#### Variáveis opcionais

Não são necessárias para instalar e executar o sistema; configure apenas se for usar os recursos correspondentes.

- **Supabase via API HTTP:** `SUPABASE_URL`, `SUPABASE_ANON_KEY` (ou `SUPABASE_PUBLISHABLE_KEY`) e `SUPABASE_SERVICE_ROLE_KEY` (ou `SUPABASE_SECRET_KEY`). A service role key tem precedência sobre a anon key.
- **Serviço de auditoria externo:** `AUDITORIA_URL` e `AUDITORIA_URL_DASHBOARD`.

### URL da API no Frontend

O Frontend usa um único arquivo para resolver a URL base da API:

```text
src/frontend/js/config.js
```

Em desenvolvimento local, a configuração padrão aponta para:

```js
http://localhost:3000/api
```

Em produção, defina a URL antes de carregar `src/frontend/js/services/api.js`:

```html
<script>
  window.PULSE_API_BASE = 'https://seu-dominio/api';
</script>
<script src="../js/config.js"></script>
<script src="../js/services/api.js"></script>
```

Alternativamente, substitua o placeholder `__PULSE_API_BASE_URL__` em `src/frontend/js/config.js` durante o build/deploy. Se nenhuma URL estiver configurada fora de localhost, o console exibirá um erro claro informando que a URL da API está ausente.

### 7. Executar o frontend

O frontend está localizado na pasta `frontend` e contém as páginas HTML, arquivos CSS, scripts JavaScript e assets da interface.

As páginas estáticas podem ser abertas diretamente no navegador a partir da pasta `frontend/pages`, ou servidas com a extensão Live Server do Visual Studio Code.

Exemplo de acesso:

```sh
frontend/pages/login.html
```

### 5. Observações importantes

- O arquivo `.env` não deve ser enviado ao repositório, pois contém informações sensíveis. Garanta que ele esteja listado no `.gitignore`.
- O comando `npm run seed` deve ser usado apenas em ambiente de desenvolvimento ou teste, pois pode limpar e recriar os dados simulados.
- Caso ocorra erro relacionado ao `ts-node`, reinstale as dependências de desenvolvimento:

```sh
npm install --save-dev ts-node typescript @types/node
```

- Caso ocorra erro de conexão com o banco, verifique se as variáveis do `.env` estão corretas e se o PostgreSQL/Supabase está ativo.

## Validação dos fluxos autenticados de ponta a ponta

Esta seção orienta um avaliador externo a subir a aplicação, autenticar-se nos três perfis e percorrer os principais fluxos sem contato com o grupo. Ela complementa as seções de configuração e execução já documentadas acima.

### Credenciais de acesso após `npm run seed`

O login na interface web é feito automaticamente com qualquer numero, mais a frente adicionaremos os comandos correspondentes. 

### Cobertura da suite de testes

A suite é executada com `npm test` em banco **in-memory** (`sqljs`), sem necessidade de PostgreSQL ativo. São **20 arquivos no total**: 12 de integração e 8 unitários.

#### Testes de integração (`src/tests/integration/`)

| Arquivo | O que valida |
|---------|-------------|
| `alunos.integration.test.ts` | CRUD de alunos, geração automática de código PM, validação de email duplicado e inválido |
| `portal-aluno.integration.test.ts` | Visualização de perfil no portal, retorno 404 para aluno inexistente |
| `jornada.integration.test.ts` | Registro de frequência, participação em eventos, atualização de empregabilidade e ensino superior, anotações qualitativas |
| `dashboard.integration.test.ts` | Resumos de impacto e jornada, consultas de alunos empregados, conclusão de programas, risco de evasão, integração com auditoria |
| `agenda.integration.test.ts` | Listagem, criação, atualização e cancelamento de eventos |
| `notificacoes.integration.test.ts` | Criação e listagem de notificações e oportunidades |
| `portal-aluno-notificacoes.integration.test.ts` | Notificações filtradas por aluno no portal, listagem de oportunidades |
| `saude-mental.integration.test.ts` | Criação e listagem de prontuários e labels psicológicas |
| `segmentacao.integration.test.ts` | Segmentação de alunos por critérios e agrupamento por categoria de risco |
| `desempenho-psicologo.integration.test.ts` | Acesso ao desempenho do aluno com validação de permissão por perfil |
| `notificacao-psicologo.integration.test.ts` | Notificações direcionadas ao perfil psicólogo |
| `codigo-pm.integration.test.ts` | Geração e unicidade do código PM |

#### Testes unitários (`src/tests/unit/services/`)

Cobrem a lógica de negócio isolada dos serviços: `AlunoService` (listagem com filtros, normalização, geração de código PM), `DashboardService`, `JornadaService`, `NotificacaoService`, `AgendaService`, `PortalAlunoService`, `SaudeMentalService` e `SegmentacaoService`.

---

## Histórico de lançamentos


* 0.5.0 - 25/06/2026 - Desenvolvimento final da aplicação.
    
* 0.4.0 - 12/06/2026 - Segunda versão do sistema web, relatório de testes, estudo de mercado e plano de marketing 
     
* 0.3.0 - 29/05/2026 - Protótipo de alta, guia de estilos, arquitetura de solução, lógica proposicional e WebAPI.
     
* 0.2.0 - 15/05/2026 -  Wireframes, modelagem de banco de dados.
     
* 0.1.0 - 30/04/2026  - Idealização da proposta, modelagem feita em grupo da proposta, criação de personas e entendimento do usuário.
    

## Licença/License

<a href="https://git.inteli.edu.br/graduacao/2026-1b/t29/g03.git">Pulse Manager</a> © 2026 by <a href="https://git.inteli.edu.br/graduacao/2026-1b/t29/g03.git">INTELI, ANA LUIZA LIMA DE CARVALHO, FELIPE SODRÉ PESSÔA, GABRIELI MARQUES BATTINI, JOSÉ ISAIAS MENEZES SANTOS, NÍCOLAS RIGOLIN CARRASCOSSA, RAFFAEL CABRAL BENSOUSSAN, VITOR MEDRADO LISBÔA</a> is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International</a><img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;"><img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;">
