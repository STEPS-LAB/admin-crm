export type LogLevel = "debug" | "info" | "warn" | "error" | "critical";

export interface LogContext {
  readonly [key: string]: unknown;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  critical(message: string, context?: LogContext): void;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
};

function getMinLevel(): LogLevel {
  if (process.env.NODE_ENV === "production") {
    return "info";
  }

  return "debug";
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[getMinLevel()];
}

function writeLog(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldLog(level)) {
    return;
  }

  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  const serialized = JSON.stringify(entry);

  switch (level) {
    case "debug":
    case "info":
      process.stdout.write(`${serialized}\n`);
      break;
    case "warn":
    case "error":
    case "critical":
      process.stderr.write(`${serialized}\n`);
      break;
  }
}

export const logger: Logger = {
  debug: (message, context) => {
    writeLog("debug", message, context);
  },
  info: (message, context) => {
    writeLog("info", message, context);
  },
  warn: (message, context) => {
    writeLog("warn", message, context);
  },
  error: (message, context) => {
    writeLog("error", message, context);
  },
  critical: (message, context) => {
    writeLog("critical", message, context);
  },
};
