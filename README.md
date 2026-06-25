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

As instruções completas de pré-requisitos, variáveis de ambiente, banco de dados, execução do backend e frontend, testes e solução de problemas estão no [Guia de configuração, desenvolvimento e execução](./docs/others/setup-desenvolvimento.md).

Para uma execução local rápida, sem configurar PostgreSQL ou Supabase:

```sh
npm install
npm run dev:local
```

A API ficará disponível em `http://localhost:3000` e o healthcheck em `http://localhost:3000/api/health`.

## Histórico de lançamentos

- **0.5.0 -26/06/2026 (Sprint 5 - encerramento)**
  - Integração final entre frontend, backend e banco de dados.
  - Refinamento da autenticação, autorização por perfil, segurança e resiliência.
  - Consolidação dos testes automatizados, testes de desempenho e testes de ponta a ponta.
  - Realização dos testes de usabilidade e avaliação SUS.
  - Finalização do WAD, conclusões e definição dos trabalhos futuros.

- **0.4.0 -12/06/2026 (Sprint 4)**
  - Desenvolvimento das SPAs dos perfis de aluno, gestor e psicólogo.
  - Integração do backend com PostgreSQL e Supabase.
  - Implementação e documentação da suíte de testes unitários e de integração.
  - Atualização da modelagem de dados e da matriz de rastreabilidade.
  - Elaboração do estudo de mercado, Business Model Canvas e estratégia de marketing.

- **0.3.0 -29/05/2026 (Sprint 3)**
  - Implementação da primeira versão funcional da aplicação web e da WebAPI.
  - Estruturação do backend em rotas, controllers, services, repositories e models.
  - Definição da arquitetura e dos padrões de projeto.
  - Criação do guia de estilos e dos protótipos de alta fidelidade.
  - Documentação dos endpoints e dos principais fluxos da aplicação.

- **0.2.0 -15/05/2026 (Sprint 2)**
  - Criação dos wireframes e definição inicial da experiência de usuário.
  - Elaboração dos diagramas de classes e de sequência.
  - Construção do Modelo Entidade-Relacionamento e do Diagrama Entidade-Relacionamento.
  - Definição dos modelos relacional e físico do banco de dados.
  - Desenvolvimento das consultas SQL e da lógica proposicional.

- **0.1.0 -01/05/2026 (Sprint 1)**
  - Definição do escopo, problema, objetivos e solução proposta.
  - Análises das Cinco Forças de Porter e SWOT.
  - Construção das personas, histórias de usuário e casos de uso.
  - Levantamento dos requisitos funcionais e não funcionais.
  - Estruturação inicial do WAD e da arquitetura da solução.

## Licença/License

<a href="https://git.inteli.edu.br/graduacao/2026-1b/t29/g03.git">Pulse Manager</a> © 2026 by <a href="https://git.inteli.edu.br/graduacao/2026-1b/t29/g03.git">INTELI, ANA LUIZA LIMA DE CARVALHO, FELIPE SODRÉ PESSÔA, GABRIELI MARQUES BATTINI, JOSÉ ISAIAS MENEZES SANTOS, NÍCOLAS RIGOLIN CARRASCOSSA, RAFFAEL CABRAL BENSOUSSAN, VITOR MEDRADO LISBÔA</a> is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International</a><img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;"><img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;">
