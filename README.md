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


## Configuração para Desenvolvimento e Execução do Código

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

### 4. Frontend

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


### Credenciais de acesso após `npm run seed`

O login na interface web exige a seleção do perfil (Gestor, Psicólogo ou Aluno), o e-mail cadastrado e o nome completo exatamente como registrado no banco. Todos os campos são obrigatórios.

*Logins*

| Perfil | Nome | E-mail |
|--------|------|--------|
| Gestor | Helena Duarte | helena.duarte@pulsemais.org |
| Psicólogo | Isadora Valença | isadora.valenca@pulsemais.org |
| Aluno | Ana Clara Ribeiro | ana.clara.ribeiro@aluno.pulsemais.org |


## Histórico de lançamentos


* 0.5.0 - 25/06/2026 - Desenvolvimento final da aplicação.
    
* 0.4.0 - 12/06/2026 - Segunda versão do sistema web, relatório de testes, estudo de mercado e plano de marketing 
     
* 0.3.0 - 29/05/2026 - Protótipo de alta, guia de estilos, arquitetura de solução, lógica proposicional e WebAPI.
     
* 0.2.0 - 15/05/2026 -  Wireframes, modelagem de banco de dados.
     
* 0.1.0 - 30/04/2026  - Idealização da proposta, modelagem feita em grupo da proposta, criação de personas e entendimento do usuário.
    

## Licença/License

<a href="https://git.inteli.edu.br/graduacao/2026-1b/t29/g03.git">Pulse Manager</a> © 2026 by <a href="https://www.inteli.edu.br/">INTELI</a>, <a href="https://www.linkedin.com/in/ana-carvalho-27268634b/">ANA LUIZA LIMA DE CARVALHO</a>, <a href="http://www.linkedin.com/in/felipe-sodr%C3%A9-pess%C3%B4a">FELIPE SODRÉ PESSÔA</a>, <a href="https://www.linkedin.com/in/gabrielibattini/">GABRIELI MARQUES BATTINI</a>, <a href="https://www.linkedin.com/in/joseisaias/">JOSÉ ISAIAS MENEZES SANTOS</a>, <a href="https://www.linkedin.com/in/nicolas-rigolin-carrascossa-4492b2261/">NÍCOLAS RIGOLIN CARRASCOSSA</a>, <a href="https://www.linkedin.com/in/raffael-bensoussan-98331b187/">RAFFAEL CABRAL BENSOUSSAN</a>, <a href="https://www.linkedin.com/in/lisboavitor/">VITOR MEDRADO LISBÔA</a> is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International</a><img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;"><img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;">
