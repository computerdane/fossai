# fossai

Free AI.

## Development

Install dependencies:

```sh
  bun i
```

Start postgres database:

```sh
  pg_ctl -D /tmp/fossai init
  pg_ctl -D /tmp/fossai start
```

Start live backend dev server:

```sh
  cd backend
  OPENAI_API_KEY={key} DISABLE_AUTH=1 bun dev
```

Start live frontend dev server:


```sh
  cd frontend
  bun dev
```

Start editing code and both the backend / frontend will update automatically!

## Editing the database schema

This project uses [Kysely](https://kysely.dev/) to build safe SQL queries. It
uses a codegen tool that connects to the database and generates TypeScript
types using introspection.

Things get tricky when you're adding new tables. While normally, the backend
services will automatically run the `init.sql` script and all is well, if the
schema has changed, the types won't be there.

In the `backend` folder, you can use the following command to generate types
from your local postgres database:

```sh
  DATABASE_URL=postgres://localhost/fossai bun kysely-codegen
```

If the backend server fails to start because of your schema changes, you will
need to manually run the `init.sql` script, run `bun kysely-codegen` again, and
then try starting the backend server. For example:

```sh
  dropdb fossai
  createdb fossai
  psql -d fossai -f src/init.sql
  DATABASE_URL=postgres://localhost/fossai bun kysely-codegen
```

Then you should be able to start the backend server again.
