import { Client, Pool } from "pg";
import env from "./env";
import { Kysely, PostgresDialect } from "kysely";
import type { DB } from "./types";

let db: Kysely<DB> | null = null;

async function getDb() {
  if (db) return db;

  const initSql = await Bun.file(`${import.meta.dir}/init.sql`).text();

  {
    const client = new Client({
      connectionString: `${env.private.POSTGRES_CONNECTION_STRING}/postgres`,
    });
    await client.connect();

    const res = await client.query(
      "select 1 from pg_database where datname = $1",
      ["fossai"],
    );
    if (res.rowCount === 0) {
      console.log("Database 'fossai' does not exist. Creating...");
      await client.query("create database fossai");
    }

    await client.end();
  }

  {
    const client = new Client({
      connectionString: `${env.private.POSTGRES_CONNECTION_STRING}/fossai`,
    });
    await client.connect();

    console.log("Initializing database...");
    await client.query(initSql);

    await client.end();
  }

  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString: `${env.private.POSTGRES_CONNECTION_STRING}/fossai`,
    }),
  });

  db = new Kysely<DB>({ dialect });

  const anon = await db
    .selectFrom("person")
    .select("id")
    .where("email", "=", "anon")
    .executeTakeFirst();

  if (!anon) {
    console.log("User 'anon' does not exist. Creating...");
    await db
      .insertInto("person")
      .values({ email: "anon", first_name: "User" })
      .execute();
  }

  return db;
}

export default getDb;
