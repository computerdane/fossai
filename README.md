# fossai

Free AI. No [weird license changes](https://web.archive.org/web/20250517194947/https://docs.openwebui.com/license/#open-webui-license-explained) or [vendor lock-in](https://web.archive.org/web/20250517195343/https://www.librechat.ai/docs/features/code_interpreter#why-a-paid-api).

## Useful documentation

- Hono [RPC](https://hono.dev/docs/guides/rpc), [Validation](https://hono.dev/docs/guides/validation), and [JWT Middleware](https://hono.dev/docs/middleware/builtin/jwt)
- Kysely [query example](https://kysely.dev/docs/getting-started#summary)
- Bun [workspaces](https://bun.sh/docs/install/workspaces)
- OpenAI's [API reference](https://platform.openai.com/docs/api-reference/introduction)
- React Router [declarative routing](https://reactrouter.com/start/declarative/routing)
- Radix UI [themes](https://www.radix-ui.com/themes/docs/overview/getting-started), [primitives](https://www.radix-ui.com/primitives/docs/overview/introduction), and [icons](https://www.radix-ui.com/icons)
- TanStack Query [docs](https://tanstack.com/query/latest/docs/framework/react/overview)

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
