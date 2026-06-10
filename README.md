# Inteli - Instituto de Tecnologia e Liderança 

<p align="center">
<a href= "https://www.inteli.edu.br/"><img src="./docs/assets/inteli.png" alt="Inteli - Instituto de Tecnologia e Liderança" border="0"></a>
</p>

# Nome do projeto

## Nome do grupo

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

## Estrutura de pastas

Dentre os arquivos e pastas presentes na raiz do projeto, definem-se:

- <b>backend</b>: reúne a API em Node.js/Express, com rotas, controladores, modelos e utilitários.

- <b>database</b>: contém migrations, seeds e o schema do banco de dados.

- <b>docs</b>: reúne a documentação do projeto, incluindo setup, decisões técnicas, API e WAD.

- <b>frontend</b>: concentra as páginas HTML, estilos CSS, scripts JavaScript e assets de interface.

- <b>README.md</b>: arquivo introdutório com visão geral do projeto e instruções de uso.


Além das pastas na raiz do projeto, também estão presentes as pastas secundárias, definidas por:

No diretório <b>backend</b>:

- <b>src</b>: contém o código-fonte principal da aplicação.


No diretório <b>database</b>:

- <b>migrations</b>: reúne os scripts SQL responsáveis por criar e alterar a estrutura das tabelas do banco de dados de forma versionada.

- <b>seeds</b>: armazena scripts destinados ao povoamento inicial do banco de dados com dados de teste ou pré-definidos.


No diretório <b>docs</b>:

- <b>assets</b>: concetra as imagens utilizadas na documentação.

- <b>others</b>: armazena arquivos complementares e apresentações de entregas (sprints) do projeto.


No diretório <b>frontend</b>:

- <b>assets</b>: concentra as imagens utilizadas na parte visível do projeto.

- <b>css</b>: concetra a página referente à estilização da plataforma.

- <b>js</b>: centraliza a lógica de comportamento, organizada por funcionalidades como navegação, integração com serviços e funções auxiliares.

- <b>pages</b>: armazena os documentos HTML que compõem as diferentes telas e interfaces da aplicação.

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

Caso o projeto utilize apenas o modo de produção/local simples, utilize:

```sh
npm start
```

Após a inicialização, a API estará disponível em:

```sh
http://localhost:3000
```

A porta pode variar de acordo com a configuração definida no arquivo `.env`.

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