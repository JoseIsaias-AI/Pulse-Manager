# Setup de Desenvolvimento

## Requisitos

- Node.js 18+
- npm 9+
- PostgreSQL 14+ quando o modo `DB_MODE=postgres` for usado

## Instalar backend

```bash
npm run install:backend
```

Ou:

```bash
cd backend
npm install
```

## Rodar backend

```bash
npm run dev:backend
```

Healthcheck:

```text
http://localhost:3000/api/health
```

## Testar backend

```bash
npm run test:backend
```

## Banco PostgreSQL

Criar banco:

```sql
CREATE DATABASE pulse_mais;
```

Aplicar schema:

```bash
psql -U postgres -d pulse_mais -f database/schema.sql
psql -U postgres -d pulse_mais -f database/seeds/seed_alunos.sql
```

Configurar `backend/.env`:

```env
PORT=3000
DB_MODE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=pulse_mais
DB_SSL=false
```
