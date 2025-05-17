import type { Context } from "hono";

type StatusCode = 401 | 404 | 500;

function message(code: StatusCode) {
  switch (code) {
    case 401:
      return "unauthorized";
    case 404:
      return "not found";
    case 500:
      return "internal server error";
  }
}

function error(c: Context, code: StatusCode) {
  return c.json({ error: message(code) }, code);
}

export default error;
