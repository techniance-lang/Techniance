import "server-only";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { mkdirSync } from "node:fs";
import { MIGRATION } from "./migration";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "file:./data/techniance.db";


type Db = LibSQLDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __db?: { client: Client; db: Db; ready: Promise<void> } };

function init() {
  if (url.startsWith("file:")) {
    const path = url.slice("file:".length);
    const dir = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : ".";
    mkdirSync(dir, { recursive: true });
  }
  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  const db = drizzle(client, { schema });
  const ready = client
    .executeMultiple(`PRAGMA foreign_keys = ON;${url.startsWith("file:") ? "PRAGMA journal_mode = WAL;" : ""}${MIGRATION}`)
    .then(() => undefined);
  return { client, db, ready };
}

const state = globalForDb.__db ?? (globalForDb.__db = init());

/** Returns the database once its tables exist. */
export async function getDb(): Promise<Db> {
  await state.ready;
  return state.db;
}

export { schema };
