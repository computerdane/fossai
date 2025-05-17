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
