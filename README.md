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


## Configuração para desenvolvimento e execução do código

Esta seção apresenta as instruções necessárias para configurar o ambiente de desenvolvimento e executar a primeira versão funcional do sistema web da Pulse Mais em máquina local.

### Pré-requisitos

Antes de iniciar a execução do projeto, é necessário ter instalado:

* **Node.js** em versão LTS;
* **npm**, instalado junto ao Node.js;
* **Git**, para clonar o repositório;
* **PostgreSQL** ou acesso a um banco PostgreSQL/Supabase configurado;
* Editor de código, preferencialmente **Visual Studio Code**.

### 1. Clonar o repositório

No terminal, execute:

```sh
git clone <link-do-repositorio>
```

Em seguida, acesse a pasta do projeto:

```sh
cd g03
```

### 2. Instalar as dependências

Na raiz do projeto, instale as dependências necessárias:

```sh
npm install
```

Caso o projeto esteja organizado com um `package.json` específico dentro da pasta `backend`, acesse a pasta antes de instalar:

```sh
cd backend
npm install
```

### 3. Configurar as variáveis de ambiente

Crie um arquivo `.env` na pasta em que o backend é executado. Esse arquivo deve conter as informações de conexão com o banco de dados.

Exemplo:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=pulse_mais
PORT=3000
```

Caso o banco utilizado seja Supabase, as informações devem ser preenchidas conforme os dados de conexão do projeto no painel do Supabase.

### 4. Executar as migrations

As migrations são responsáveis por criar ou atualizar a estrutura do banco de dados. Para executá-las, utilize:

```sh
npm run migrate
```

Esse comando deve ser executado antes do seed, para garantir que as tabelas e colunas necessárias já existam no banco.

### 5. Popular o banco com dados simulados

Após executar as migrations, rode o seed para inserir dados fictícios no banco de desenvolvimento:

```sh
npm run seed
```

O seed inclui dados simulados para alunos, membros da equipe, psicólogos, atividades, participações, agendas, oportunidades, notificações, labels e históricos psicológicos. Esses dados são utilizados para testar consultas, endpoints, telas e indicadores do sistema.

### 6. Executar o backend

Para iniciar o servidor backend em ambiente de desenvolvimento, execute:

```sh
npm run dev
```

Para executar localmente sem PostgreSQL ou Supabase configurado, usando o banco em memória:

```sh
npm run dev:local
```

Esse modo carrega automaticamente uma massa demonstrativa de alunos. Os dados são recriados sempre que o servidor local é reiniciado.

Caso o projeto utilize apenas o modo de produção/local simples, utilize:

```sh
npm start
```

Após a inicialização, a API estará disponível em:

```sh
http://localhost:3000
```

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

Caso as páginas sejam estáticas, elas podem ser abertas diretamente no navegador a partir da pasta `frontend/pages`.

Também é possível utilizar uma extensão como **Live Server** no Visual Studio Code para visualizar as páginas localmente.

Exemplo de acesso:

```sh
frontend/pages/login.html
```

### 8. Executar os testes

Para executar os testes automatizados do projeto, utilize:

```sh
npm test
```

Os testes contemplam validações unitárias e de integração relacionadas aos principais módulos do sistema, como alunos, agenda, portal do aluno, notificações, saúde mental, dashboard, jornada, frequência, participação e segmentação.

### 9. Fluxo recomendado de execução

Para configurar o projeto do zero, recomenda-se seguir a ordem abaixo:

```sh
npm install
npm run migrate
npm run seed
npm run dev
```

Em seguida, acesse a API em:

```sh
http://localhost:3000
```

E visualize o frontend pela pasta `frontend/pages` ou por meio do Live Server.

### Observações importantes

O arquivo `.env` não deve ser enviado ao repositório, pois contém informações sensíveis de conexão com o banco de dados.

O comando `npm run seed` deve ser utilizado apenas em ambiente de desenvolvimento ou teste, pois ele pode limpar e recriar dados simulados no banco.

Caso ocorra erro relacionado ao `ts-node`, instale as dependências de desenvolvimento com:

```sh
npm install --save-dev ts-node typescript @types/node
```

Caso ocorra erro de conexão com o banco, verifique se as variáveis do `.env` estão corretas e se o banco PostgreSQL/Supabase está ativo.


## Histórico de lançamentos

* 0.5.0 - XX/XX/2024
    * 
* 0.4.0 - XX/XX/2024
    * 
* 0.3.0 - XX/XX/2024
    * 
* 0.2.0 - XX/XX/2024
    * 
* 0.1.0 - XX/XX/2024
    *

## Licença/License

<a href="https://git.inteli.edu.br/graduacao/2026-1b/t29/g03.git">Pulse Manager</a> © 2026 by <a href="https://git.inteli.edu.br/graduacao/2026-1b/t29/g03.git">INTELI, ANA LUIZA LIMA DE CARVALHO, FELIPE SODRÉ PESSÔA, GABRIELI MARQUES BATTINI, JOSÉ ISAIAS MENEZES SANTOS, NÍCOLAS RIGOLIN CARRASCOSSA, RAFFAEL CABRAL BENSOUSSAN, VITOR MEDRADO LISBÔA</a> is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International</a><img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;"><img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;">
