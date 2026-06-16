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

## Descrição

_Descreva seu projeto (até 600 palavras)_

## Link de demonstração

_Coloque aqui o link para o vídeo de demonstração do projeto_
_A inserção do video sera feita na Sprint 05 com o projeto finalizado_

## Estrutura de pastas

Dentre os arquivos e pastas presentes na raiz do projeto, definem-se:

- <b>docs</b>: reúne a documentação do projeto, incluindo setup, decisões técnicas, API e WAD.

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


## Instalação, Configuração de Ambiente

### 1. Pré-requisitos

Antes de iniciar a execução do projeto, é necessário ter instalado:
Node.js 20.x (LTS);

npm, instalado junto ao Node.js;

Git, para clonar o repositório;

PostgreSQL ou acesso a um banco PostgreSQL/Supabase 
configurado;

Editor de código, preferencialmente Visual Studio Code.

### 2. Instalação e execução

```sh
# 1. Clonar o repositório e entrar na pasta
git clone <url-do-repositorio>
cd g03

# 2. Instalar as dependências
npm install

# 3. Criar o arquivo de variáveis de ambiente (ver seção 3)
cp .env.example .env   # se existir; caso contrário, crie manualmente

# 4. Testar a conexão com o banco
npm run db:test

# 5. Executar as migrations (cria as tabelas)
npm run migrate

# 6. (Opcional) Popular o banco com dados iniciais
npm run seed
```

Comandos de execução disponíveis:

| Modo | Comando | Descrição |
|---|---|---|
| Desenvolvimento | npm run dev | ts-node-dev com hot-reload. |
| Build | npm run build | Compila TypeScript para dist/. |
| Produção | npm start | Executa dist/backend/server.js. |
| Testes | npm test | Jest em modo serial (--runInBand). |

### 3. Configuração de ambiente

O projeto usa dotenv. Crie um arquivo `.env` na raiz do repositório.

A conexão com o banco aceita dois modos mutuamente exclusivos:

- **Modo A — connection string:** defina `DATABASE_URL` (recomendado para Supabase ou Postgres remoto).
- **Modo B — variáveis individuais:** defina `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` e `DB_DATABASE` (Postgres local).

#### Exemplo de .env

```env
# ── Aplicação ──────────────────────────────────────────────
NODE_ENV=development
PORT=3000

# ── Banco de dados — MODO A (connection string) ────────────
DATABASE_URL=postgresql://postgres.txkehvgltibkitjngsye:<sua-senha>@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
DATABASE_SSL=true

# ── Banco de dados — MODO B (variáveis individuais) ────────
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=postgres
# DB_DATABASE=pulse_uc13
# DATABASE_SSL=false

# ── Tipo de banco (postgres | sqljs) ───────────────────────
# DB_TYPE=postgres   # padrão: postgres em dev, sqljs em test

# ── Supabase (apenas para chamadas à API HTTP do Supabase) ─
# SUPABASE_URL=https://txkehvgltibkitjngsye.supabase.co
# SUPABASE_ANON_KEY=<anon-key>
# SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# ── Integrações externas (opcionais) ───────────────────────
# AUDITORIA_URL=http://localhost:4000/auditoria
# AUDITORIA_URL_DASHBOARD=http://localhost:4000/dashboard
```

#### Variáveis — aplicação

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| NODE_ENV | Não | development | Ambiente de execução. Em test, o banco muda automaticamente para sqljs. |
| PORT | Não | 3000 | Porta HTTP do servidor Express. |

#### Variáveis — banco de dados

| Variável | Alternativa aceita | Obrigatória | Padrão | Descrição |
|---|---|---|---|---|
| DATABASE_URL | SUPABASE_DB_URL | Não* | — | Connection string completa do PostgreSQL. Se definida, as variáveis DB_* são ignoradas. |
| DATABASE_SSL | — | Não | true se DATABASE_URL definida, senão false | Habilita SSL na conexão. |
| DB_TYPE | DB_MODE | Não | postgres | Tipo do banco: postgres ou sqljs (in-memory, usado nos testes). |
| DB_HOST | — | Não* | localhost | Host do PostgreSQL (Modo B). |
| DB_PORT | — | Não* | 5432 | Porta do PostgreSQL (Modo B). |
| DB_USERNAME | DB_USER | Não* | postgres | Usuário do banco (Modo B). |
| DB_PASSWORD | — | Não* | postgres | Senha do banco (Modo B). |
| DB_DATABASE | DB_NAME | Não* | pulse_uc13 | Nome do banco (Modo B). |

> \* É obrigatório configurar pelo menos um dos dois modos (A ou B) para o servidor funcionar com PostgreSQL.

#### Variáveis — Supabase (opcionais)

Necessárias apenas para operações via API HTTP do Supabase.

| Variável | Alternativa aceita | Obrigatória | Descrição |
|---|---|---|---|
| SUPABASE_URL | — | Não | URL do projeto Supabase (ex.: https://xyz.supabase.co). |
| SUPABASE_ANON_KEY | SUPABASE_PUBLISHABLE_KEY | Não | Chave pública. Usada se a service role key não estiver definida. |
| SUPABASE_SERVICE_ROLE_KEY | SUPABASE_SECRET_KEY | Não | Chave de serviço (acesso irrestrito). Tem precedência sobre a anon key. |

#### Variáveis — integrações externas (opcionais)

| Variável | Obrigatória | Descrição |
|---|---|---|
| AUDITORIA_URL | Não | URL base do serviço de auditoria externo. |
| AUDITORIA_URL_DASHBOARD | Não | URL do dashboard de auditoria externo. |

### 5. Frontend

O frontend está localizado na pasta `frontend` e contém as páginas HTML, arquivos CSS, scripts JavaScript e assets da interface.

As páginas estáticas podem ser abertas diretamente no navegador a partir da pasta `frontend/pages`, ou servidas com a extensão Live Server do Visual Studio Code.

Exemplo de acesso:

```sh
frontend/pages/login.html
```

### 6. Observações importantes

- O arquivo `.env` não deve ser enviado ao repositório, pois contém informações sensíveis. Garanta que ele esteja listado no `.gitignore`.
- O comando `npm run seed` deve ser usado apenas em ambiente de desenvolvimento ou teste, pois pode limpar e recriar os dados simulados.
- Caso ocorra erro relacionado ao `ts-node`, reinstale as dependências de desenvolvimento:

```sh
npm install --save-dev ts-node typescript @types/node
```

- Caso ocorra erro de conexão com o banco, verifique se as variáveis do `.env` estão corretas e se o PostgreSQL/Supabase está ativo.


## Histórico de lançamentos

* 0.5.0 - 25/06/2026
    
* 0.4.0 - 12/06/2026
     
* 0.3.0 - 29/05/2026
     
* 0.2.0 - 15/05/2026
     
* 0.1.0 - 30/04/2026
    

## Licença/License

<a href="https://git.inteli.edu.br/graduacao/2026-1b/t29/g03.git">Pulse Manager</a> © 2026 by <a href="https://git.inteli.edu.br/graduacao/2026-1b/t29/g03.git">INTELI, ANA LUIZA LIMA DE CARVALHO, FELIPE SODRÉ PESSÔA, GABRIELI MARQUES BATTINI, JOSÉ ISAIAS MENEZES SANTOS, NÍCOLAS RIGOLIN CARRASCOSSA, RAFFAEL CABRAL BENSOUSSAN, VITOR MEDRADO LISBÔA</a> is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International</a><img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;"><img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;">