import "dotenv/config";
import { AsyncLocalStorage } from "node:async_hooks";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  type PgTransaction,
  type PgTransactionConfig,
  PgQueryResultHKT,
} from "drizzle-orm/pg-core";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import { env } from "../env";

const poolMax = Number.parseInt(process.env.PGPOOL_MAX ?? "1");
const idleTimeoutMillis = Number.parseInt(
  process.env.PGPOOL_IDLE_TIMEOUT ?? "30000"
);
const connectionTimeoutMillis = Number.parseInt(
  process.env.PGPOOL_CONNECT_TIMEOUT ?? "5000"
);

const useSSL = Number.parseInt(process.env.PGPOOL_SSL ?? "0") === 1;

namespace Context {
  export class NotFound extends Error {}

  export function create<T>() {
    const storage = new AsyncLocalStorage<T>();
    return {
      use() {
        const result = storage.getStore();
        if (!result) throw new NotFound();
        return result;
      },
      provide<R>(value: T, fn: () => R) {
        return storage.run<R>(value, fn);
      },
    };
  }
}

export namespace Database {
  export type Transaction = PgTransaction<
    PgQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >;

  const connectionString = env.DATABASE_URL;

  // Keep a global singleton pool across invocations (Cloud Run, Neon).
  let globalPool: Pool | null = null;

  function getPool() {
    if (!globalPool) {
      globalPool = new Pool({
        connectionString,
        max: poolMax,
        idleTimeoutMillis,
        connectionTimeoutMillis,
        ssl: useSSL ? { rejectUnauthorized: false } : undefined,
      });

      globalPool.on("error", (err) => {
        console.error("Unexpected PostgreSQL pool error:", err);
        globalPool = null; // force recreation next time
      });
    }

    return globalPool;
  }

  function createScopedDb() {
    const pool = getPool();
    const db = drizzle(pool, { casing: "snake_case" });
    return {
      db,
      close: async () => {}, // no-op; reuse pool between requests
    };
  }

  async function finalizeScope(
    effects: (() => void | Promise<void>)[],
    close: () => Promise<void>,
    errored: boolean
  ) {
    const effectResults = await Promise.allSettled(
      effects.map((e) => Promise.resolve().then(e))
    );

    const failed = effectResults.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected"
    );

    if (failed.length > 0) {
      if (errored) {
        failed.forEach((r) =>
          console.error("DB cleanup failed after request error:", r.reason)
        );
      } else {
        throw new AggregateError(
          failed.map((r) => r.reason),
          "Cleanup failed"
        );
      }
    }

    await close();
  }

  type DrizzleDb = ReturnType<typeof createScopedDb>["db"];
  export type TxOrDb = Transaction | DrizzleDb;

  const TransactionContext = Context.create<{
    tx: TxOrDb;
    effects: (() => void | Promise<void>)[];
  }>();

  export function db() {
    try {
      const { tx } = TransactionContext.use();
      return tx;
    } catch (err) {
      if (err instanceof Context.NotFound)
        throw new Error("Database.db() used outside a request scope");
      throw err;
    }
  }

  export async function use<T>(callback: (trx: TxOrDb) => Promise<T>) {
    try {
      const { tx } = TransactionContext.use();
      return tx.transaction(callback);
    } catch (err) {
      if (err instanceof Context.NotFound) {
        const effects: (() => void | Promise<void>)[] = [];
        const scope = createScopedDb();
        let caught: unknown;
        try {
          return await TransactionContext.provide(
            { effects, tx: scope.db },
            () => callback(scope.db)
          );
        } catch (error) {
          caught = error;
          throw error;
        } finally {
          await finalizeScope(effects, scope.close, caught !== undefined);
        }
      }
      throw err;
    }
  }

  export async function fn<Input, T>(
    callback: (input: Input, trx: TxOrDb) => Promise<T>
  ) {
    return (input: Input) => use(async (tx) => callback(input, tx));
  }

  export async function effect(effect: () => any | Promise<any>) {
    try {
      const { effects } = TransactionContext.use();
      effects.push(effect);
    } catch {
      await effect();
    }
  }

  export async function transaction<T>(
    callback: (tx: TxOrDb) => Promise<T>,
    config?: PgTransactionConfig
  ) {
    try {
      const { tx } = TransactionContext.use();
      return callback(tx);
    } catch (err) {
      if (err instanceof Context.NotFound) {
        const effects: (() => void | Promise<void>)[] = [];
        const scope = createScopedDb();
        let caught: unknown;
        try {
          return await scope.db.transaction(async (tx) => {
            return TransactionContext.provide({ tx, effects }, () =>
              callback(tx)
            );
          }, config);
        } catch (error) {
          caught = error;
          throw error;
        } finally {
          await finalizeScope(effects, scope.close, caught !== undefined);
        }
      }
      throw err;
    }
  }
}
