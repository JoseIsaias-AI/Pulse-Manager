# Integração com Supabase - Pulse Mais

## Contexto

O projeto utiliza **Node.js** no backend conectado diretamente ao banco **PostgreSQL hospedado no Supabase**, substituindo o SQLite originalmente previsto no TAPI. Toda a lógica de acesso a dados passa por esse banco centralizado, que serve como a fonte única de verdade (SSOT) da plataforma.

## Tipo de conexão utilizada

Para ambiente de **desenvolvimento local**, utilizamos a **Session Pooler**.

### Por que Session Pooler e não as outras opções?

| Tipo | Quando usar | Por quê não usamos |
|---|---|---|
| **Direct Connection** | Conexão direta sem pooler; ideal para migrações ou ferramentas admin | Não recomendada para aplicações com múltiplas conexões simultâneas; ocupa conexões do Postgres diretamente |
| **Transaction Pooler** | Apps serverless (Vercel, Netlify Functions, AWS Lambda) que abrem/fecham conexões a cada request | Não suporta prepared statements e sessões persistentes - incompatível com ORMs como Sequelize/Knex em Node.js tradicional |
| **Session Pooler** ✅ | Servidores Node.js rodando continuamente (local, VPS, Railway) | - É a escolha certa para o nosso caso |

O Session Pooler mantém uma conexão por sessão cliente, o que é compatível com o comportamento do Node.js rodando como servidor contínuo e com bibliotecas que usam connection pools internos (como `pg`, Sequelize, Knex, Prisma, etc).


## Como configurar

### 1. Obter a connection string no Supabase

1. Acesse o dashboard do projeto em [supabase.com](https://supabase.com)
2. Vá em **Project Settings -> Database -> Connection string**
3. Selecione a aba **Session pooler**
4. Copie a URI no formato:

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

> ⚠️ Não confunda com a porta **6543** (Transaction Pooler) - o Session Pooler usa a porta **5432**.

### 2. Criar o arquivo `.env`

Na raiz do projeto, crie (ou edite) o arquivo `.env` e adicione:

```env
DATABASE_URL=postgresql://postgres.[SEU-PROJECT-REF]:[SUA-SENHA]@aws-0-[REGIAO].pooler.supabase.com:5432/postgres
```

> O arquivo `.env` já está no `.gitignore`. Nunca suba credenciais para o repositório.

### 3. Usar a variável no código

O backend já está configurado para ler `process.env.DATABASE_URL`. Exemplo de como a conexão é feita:

```js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // necessário para conexão com Supabase
});
```

> A opção `ssl: { rejectUnauthorized: false }` é necessária pois o Supabase exige SSL por padrão.


## Estrutura do banco

As tabelas foram criadas no Supabase via `migration.sql` (em `src/database/` ou equivalente no projeto). As entidades implementadas são:

| Tabela | Descrição |
|---|---|
| `aluno` | Perfil completo do jovem |
| `membro_equipe` | Equipe interna da Pulse Mais |
| `psicologo` | Psicólogos da instituição |
| `atividade` | Aulas, mentorias, workshops e eventos |
| `participacao` | Vínculo entre aluno e atividade (nota, presença, certificado) |
| `oportunidade` | Vagas, bolsas e oportunidades publicadas |
| `agenda` | Compromissos de alunos e membros da equipe |
| `notificacao` | Notificações enviadas aos alunos |
| `label` | Marcações qualitativas feitas por psicólogos |
| `historico_psicologico` | Registros de acompanhamento psicológico (acesso restrito) |

O schema também define ENUMs para padronizar valores (status do aluno, tipo de atividade, cargo, etc.) e índices para otimizar as consultas mais frequentes.

Para visualizar ou alterar o schema, acesse o **Table Editor** ou o **SQL Editor** no dashboard do Supabase.


## Aplicar o schema (migration)

O arquivo `migration.sql` cria todas as tabelas, ENUMs e índices do zero. Ele usa `CREATE TABLE IF NOT EXISTS` e `CREATE TYPE ... EXCEPTION WHEN duplicate_object`, então é seguro rodar mesmo que parte do schema já exista - não vai quebrar nem duplicar nada.

### Como aplicar

1. Acesse o dashboard do Supabase
2. Vá em **SQL Editor**
3. Cole o conteúdo do `migration.sql`
4. Clique em **Run**
5. Na confirmação de RLS que aparecer, clique em **"Run without RLS"** - o projeto não usa autenticação de usuários, então RLS não se aplica

> ✅ Se o banco já tiver as tabelas criadas, não é necessário rodar o migration novamente.


## Popular o banco (seed)

O arquivo `src/database/seed.ts` insere dados de exemplo no Supabase para desenvolvimento e testes. Ele **não cria tabelas** - assume que o migration já foi aplicado.

O que ele faz ao rodar:
1. Limpa todas as tabelas principais com `TRUNCATE ... RESTART IDENTITY CASCADE`
2. Insere dados fake de alunos, membros de equipe, psicólogo, atividades, participações, oportunidades, agenda, notificações, labels e histórico psicológico

> ⚠️ Rodar o seed **apaga todos os dados existentes** nas tabelas listadas. Use apenas em ambiente de desenvolvimento.

### Como rodar

Com o `.env` configurado corretamente:

```bash
npx ts-node src/database/seed.ts
```

Se o projeto tiver um script definido no `package.json`:

```bash
npm run seed
```

## Checklist para novos membros

- [ ] Copiar a connection string (Session Pooler) em **Project Settings → Database → Connection string**
- [ ] Criar o arquivo `.env` na raiz com a variável `DATABASE_URL`
- [ ] Verificar se as tabelas já existem no Supabase (Table Editor no dashboard)
- [ ] Se não existirem: colar o `migration.sql` no SQL Editor do Supabase e clicar em **Run without RLS**
- [ ] Rodar o seed (`npx ts-node src/database/seed.ts`) para popular o banco com dados de exemplo
- [ ] Rodar o projeto localmente com `npm run dev` (ou equivalente) e verificar se a conexão está ativa


## Referências

- [Supabase Docs - Connecting to your database](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase Docs - Connection pooling](https://supabase.com/docs/guides/database/connection-pooling)
