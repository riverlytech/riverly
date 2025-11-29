import { env } from "@riverly/config";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  type PgQueryResultHKT,
  type PgTransaction,
  type PgTransactionConfig,
} from "drizzle-orm/pg-core";
import { AsyncLocalStorage } from "node:async_hooks";
import { Pool } from "pg";

/* -----------------------------------------------------
 * Utility: Lazy memoization with optional async cleanup
 * --------------------------------------------------- */
function memo<T>(fn: () => T, cleanup?: (value: T) => Promise<void>) {
  let value: T | undefined;
  let loaded = false;

  const getter = (): T => {
    if (loaded) return value as T;
    value = fn();
    loaded = true;
    return value as T;
  };

  getter.reset = async () => {
    if (cleanup && value) await cleanup(value);
    loaded = false;
    value = undefined;
  };

  return getter;
}

/* -----------------------------------------------------
 * Context store for transaction scope isolation
 * --------------------------------------------------- */
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

/* -----------------------------------------------------
 * Database module (optimized for persistent servers)
 * --------------------------------------------------- */
export namespace Database {
  export type Transaction = PgTransaction<
    PgQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >;

  const connectionString = env.DATABASE_URL;

  /* ---------------------------------------------
   * Pool configuration (env-driven, safe defaults)
   * ------------------------------------------- */
  const poolMax = Number.parseInt(process.env.PGPOOL_MAX ?? "5");
  const idleTimeoutMillis = Number.parseInt(process.env.PGPOOL_IDLE_TIMEOUT ?? "30000");
  const connectionTimeoutMillis = Number.parseInt(process.env.PGPOOL_CONNECT_TIMEOUT ?? "5000");
  const useSSL = Number.parseInt(process.env.PGPOOL_SSL ?? "0") === 1;

  /* ---------------------------------------------
   * Singleton client (memoized)
   * ------------------------------------------- */
  const client = memo(
    () => {
      const pool = new Pool({
        connectionString,
        max: poolMax,
        idleTimeoutMillis,
        connectionTimeoutMillis,
        ssl: useSSL ? { rejectUnauthorized: false } : undefined,
      });

      // ---- Observability hooks ----
      pool.on("connect", () => {
        // console.log(`[DB] Connected — total: ${pool.totalCount}`)
      });

      pool.on("acquire", () => {
        // console.log(
        //   `[DB] Connection acquired — idle: ${pool.idleCount}, total: ${pool.totalCount}`
        // );
      });

      pool.on("release", () => {
        // console.log(
        //   `[DB] Connection released — idle: ${pool.idleCount}, total: ${pool.totalCount}`
        // );
      });

      pool.on("error", (err) => {
        console.error("[DB] Unexpected pool error:", err);
      });

      return drizzle({ client: pool, casing: "snake_case" });
    },
    async (db) => {
      // graceful cleanup handler
      const pool = (db as any)?.client as Pool;
      if (pool && typeof pool.end === "function") {
        console.log("[DB] Closing connection pool...");
        await pool.end();
      }
    },
  );

  export type TxOrDb = Transaction | ReturnType<typeof client>;

  const TransactionContext = Context.create<{
    tx: TxOrDb;
    effects: (() => void | Promise<void>)[];
  }>();

  /* ---------------------------------------------
   * Public API
   * ------------------------------------------- */
  export function db() {
    try {
      const { tx } = TransactionContext.use();
      return tx;
    } catch (err) {
      if (err instanceof Context.NotFound) {
        const effects: (() => void | Promise<void>)[] = [];
        return TransactionContext.provide({ effects, tx: client() }, () => client());
      }
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
        const result = await TransactionContext.provide({ effects, tx: client() }, () =>
          callback(client()),
        );
        await Promise.all(effects.map((x) => x()));
        return result;
      }
      throw err;
    }
  }

  export async function fn<Input, T>(callback: (input: Input, trx: TxOrDb) => Promise<T>) {
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
    config?: PgTransactionConfig,
  ) {
    try {
      const { tx } = TransactionContext.use();
      return callback(tx);
    } catch (err) {
      if (err instanceof Context.NotFound) {
        const effects: (() => void | Promise<void>)[] = [];
        const result = await client().transaction(async (tx) => {
          return TransactionContext.provide({ tx, effects }, () => callback(tx));
        }, config);
        await Promise.all(effects.map((x) => x()));
        return result;
      }
      throw err;
    }
  }

  /* ---------------------------------------------
   * Graceful shutdown hook for long-lived processes
   * ------------------------------------------- */
  process.on("SIGTERM", async () => {
    console.log("[DB] SIGTERM received — shutting down pool...");
    await client.reset();
    process.exit(0);
  });
}
