# Configuração, desenvolvimento e execução

Este guia reúne as instruções para preparar o ambiente, configurar o banco de dados, executar a aplicação e rodar os testes do Pulse Manager.

## Pré-requisitos

Antes de iniciar, instale:

- Node.js em versão LTS;
- npm, instalado com o Node.js;
- Git;
- PostgreSQL ou acesso a um projeto Supabase, caso não seja usado o banco local em memória;
- um editor de código, preferencialmente Visual Studio Code.

## 1. Clonar o repositório

```sh
git clone https://git.inteli.edu.br/graduacao/2026-1b/t29/g03.git
cd g03
```

## 2. Instalar as dependências

O projeto possui um único `package.json`, localizado na raiz:

```sh
npm install
```

## 3. Escolher o modo de banco de dados

A aplicação pode ser executada com banco em memória, PostgreSQL local ou PostgreSQL hospedado no Supabase.

### Banco em memória

É o modo mais simples para desenvolvimento e demonstração. Não requer arquivo `.env`, migration ou seed:

```sh
npm run dev:local
```

O banco é populado automaticamente com dados demonstrativos e recriado sempre que o servidor é reiniciado.

### PostgreSQL local

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_DATABASE=pulse_mais
DATABASE_SSL=false
```

Também são aceitos os nomes alternativos `DB_MODE`, `DB_USER`, `DB_NAME`.

Crie o banco antes de executar as migrations:

```sql
CREATE DATABASE pulse_mais;
```

### Supabase

Para conectar diretamente ao PostgreSQL do Supabase, configure:

```env
PORT=3000
DB_TYPE=postgres
DATABASE_URL=sua_url_de_conexao
DATABASE_SSL=true
```

`SUPABASE_DB_URL` pode ser usado no lugar de `DATABASE_URL`.

As variáveis abaixo são opcionais e necessárias apenas para integrações feitas pela API HTTP do Supabase:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_publica
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
```

Também são aceitos `SUPABASE_PUBLISHABLE_KEY` no lugar de `SUPABASE_ANON_KEY` e `SUPABASE_SECRET_KEY` no lugar de `SUPABASE_SERVICE_ROLE_KEY`. Quando ambas são informadas, a chave de serviço tem precedência.

## 4. Preparar o PostgreSQL ou Supabase

As etapas desta seção não são necessárias no modo de banco em memória.

Execute a migration:

```sh
npm run migrate
```

Depois, insira os dados fictícios de desenvolvimento:

```sh
npm run seed
```

O seed limpa e recria dados simulados de alunos, membros da equipe, psicólogos, atividades, participações, agendas, oportunidades, notificações, labels e históricos psicológicos. Por isso, deve ser executado apenas em ambientes de desenvolvimento ou teste.

Para verificar a conexão:

```sh
npm run db:test
```

O mesmo diagnóstico pode ser executado com:

```sh
npm run supabase:check
```

## 5. Executar o backend

### Desenvolvimento com PostgreSQL ou Supabase

```sh
npm run dev
```

### Desenvolvimento com banco em memória

```sh
npm run dev:local
```

### Build e execução da versão compilada

```sh
npm run build
npm start
```

Por padrão, os endereços são:

- API: `http://localhost:3000`;
- healthcheck: `http://localhost:3000/api/health`;
- diagnóstico do banco/Supabase: `http://localhost:3000/api/health/supabase`.

## 6. Configurar e executar o frontend

O frontend está em `src/frontend`. As páginas HTML ficam em `src/frontend/pages` e podem ser servidas por uma extensão como Live Server no Visual Studio Code.

Página inicial:

```text
src/frontend/pages/login.html
```

O arquivo `src/frontend/js/config.js` centraliza a URL base da API. Em desenvolvimento local, ele usa:

```text
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

Como alternativa, substitua `__PULSE_API_BASE_URL__` em `src/frontend/js/config.js` durante o build ou deploy.

## 7. Integrações opcionais

O serviço externo de auditoria pode ser configurado por meio das variáveis:

```env
AUDITORIA_URL=https://endereco-do-servico
AUDITORIA_URL_DASHBOARD=https://endereco-do-dashboard
```

Essas variáveis não são necessárias para a execução principal da aplicação.

## 8. Executar os testes

Suíte completa de testes Jest:

```sh
npm test
```

Testes unitários:

```sh
npm run test:unit
```

Testes de integração:

```sh
npm run test:integration
```

Testes de desempenho:

```sh
npm run test:performance
```

Testes Jest e de desempenho usados na integração contínua:

```sh
npm run test:ci
```

Testes de ponta a ponta com Playwright:

```sh
npx playwright install chromium
npm run test:e2e
```

Os testes de ponta a ponta iniciam automaticamente o backend com banco em memória na porta `3100` e o servidor estático do frontend na porta `4173`.

## 9. Fluxos recomendados

### Execução local rápida

```sh
npm install
npm run dev:local
```

### Execução com PostgreSQL ou Supabase

```sh
npm install
npm run migrate
npm run seed
npm run dev
```

## Solução de problemas

- Não envie o arquivo `.env` ao repositório, pois ele pode conter credenciais.
- Em erros de conexão, confira as variáveis do `.env`, a disponibilidade do banco e a configuração de SSL.
- Se a porta `3000` estiver ocupada, altere a variável `PORT`.
- Se houver erro relacionado ao `ts-node`, execute novamente `npm install`, pois ele já está declarado nas dependências de desenvolvimento.
- Fora de `localhost`, o frontend exige que a URL da API seja configurada por `window.PULSE_API_BASE` ou pelo placeholder de build.
