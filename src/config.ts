import type { Server } from "node:http";
import type { LogLevel } from "./log.js";
import type { Database } from "./database.js";

export type Config = {
  port: number;
  logLevel: LogLevel;
  database: Database;
  server: Server;
};

const noConfigErrorMessage =
  "Server must be started before config can be accessed.";

export type ConfigManager = ReturnType<typeof ConfigManager>;

export function ConfigManager() {
  let _config: Config | undefined = undefined;

  function getConfig(): Config {
    if (!_config) {
      throw new Error(noConfigErrorMessage);
    }

    return _config;
  }

  function setConfig(config: Config) {
    _config = config;
  }

  function setDatabase(database: Database) {
    if (!_config) {
      throw new Error(noConfigErrorMessage);
    }

    _config.database = database;
  }

  function getIsConfigured(): boolean {
    return _config !== undefined;
  }

  function reset() {
    if (!_config) {
      return;
    }

    _config.server.close();
    _config = undefined;
  }

  return {
    getIsConfigured,
    setConfig,
    getConfig,
    setDatabase,
    reset,
  };
}
