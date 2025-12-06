import {
  configureSync,
  getConsoleSink,
  getLogger,
  parseLogLevel,
  type LogLevel,
  type Logger,
} from "@logtape/logtape";

function resolveLogLevel(): LogLevel {
  const configured = process.env.LOG_LEVEL ?? "info";
  try {
    return parseLogLevel(configured);
  } catch {
    return "info";
  }
}

configureSync({
  reset: true,
  sinks: {
    console: getConsoleSink(),
  },
  loggers: [
    {
      category: ["riverly", "api"],
      sinks: ["console"],
      lowestLevel: resolveLogLevel(),
    },
    {
      category: "logtape",
      sinks: ["console"],
      lowestLevel: "error",
    },
    {
      category: ["logtape", "meta"],
      sinks: ["console"],
      lowestLevel: "error",
      parentSinks: "override",
    },
  ],
});

const baseLogger = getLogger(["riverly", "api"]);

export const logger = baseLogger;

export function getApiLogger(category: string | string[]): Logger {
  if (Array.isArray(category)) {
    return getLogger([...baseLogger.category, ...category]);
  }
  return getLogger([...baseLogger.category, category]);
}
