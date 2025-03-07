import type { Request } from "express";
import { ConfigManager } from "./config.js";

export type LogLevel = "error" | "warn" | "info";

const logLevelToHierarchy: Record<LogLevel, number> = {
  error: 1,
  warn: 2,
  info: 3,
};

function doAtLogLevel(
  configLogLevel: LogLevel,
  myLogLevel: LogLevel,
  action: () => void
) {
  const myLogLevelNumber = logLevelToHierarchy[myLogLevel];
  const configLogLevelNumber = logLevelToHierarchy[configLogLevel];

  if (myLogLevelNumber <= configLogLevelNumber) {
    action();
  }
}

const getInfo =
  (configManager: ConfigManager) =>
  (...args: any[]) => {
    doAtLogLevel(configManager.getConfig().logLevel, "info", () => {
      console.info("[MOCK]", ...args);
    });
  };

const getWarn =
  (configManager: ConfigManager) =>
  (...args: any[]) => {
    doAtLogLevel(configManager.getConfig().logLevel, "warn", () => {
      console.warn("[MOCK]", ...args);
    });
  };

const getError =
  (configManager: ConfigManager) =>
  (...args: any[]) => {
    doAtLogLevel(configManager.getConfig().logLevel, "error", () => {
      console.error("[MOCK]", ...args);
    });
  };

export type Logger = ReturnType<typeof Logger>;

export const Logger = (configManager: ConfigManager) => ({
  info: getInfo(configManager),
  warn: getWarn(configManager),
  error: getError(configManager),
});

export function getRequestInfo(req: Request) {
  return `[${req.method} ${req.originalUrl}]`;
}
