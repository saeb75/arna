import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env.js";
import * as schema from "./schema.js";

// Supavisor transaction-mode pooler prepared statement desteklemez → prepare: false
const sql = postgres(env.DATABASE_URL, { prepare: false, max: 10 });

export const db = drizzle(sql, { schema });
export type Db = typeof db;
export { sql };
