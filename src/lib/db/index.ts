import "server-only";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { mkdirSync } from "node:fs";
import { MIGRATION } from "./migration";
import * as schema from "./schema";

type Db = LibSQLDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __db?: { client: Client; db: Db; ready: Promise<void> } };

function databaseUrl() {
  const url = process.env.DATABASE_URL;
  if (url) return url;
  // Serverless hosts have a read-only, per-instance filesystem, so SQLite files don't persist.
  if (process.env.VERCEL) {
    throw new Error("DATABASE_URL is not set. Create a Turso database and add DATABASE_URL and DATABASE_AUTH_TOKEN to the project's environment variables.");
  }
  return "file:./data/techniance.db";
}

function init() {
  const url = databaseUrl();
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

/** Returns the database once its tables exist. Connects lazily on first use. */
export async function getDb(): Promise<Db> {
  const state = globalForDb.__db ?? (globalForDb.__db = init());
  try {
    await state.ready;
  } catch (e) {
    // Don't cache a failed connection; the next request retries.
    globalForDb.__db = undefined;
    throw e;
  }
  return state.db;
}

export { schema };
