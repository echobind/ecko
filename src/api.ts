import { addResponse, type MockResponse } from "./database.js";
import { ConfigManager } from "./config.js";
import { Logger } from "./log.js";

export type EckoApi = {
  register: (route: string, mockResponse: MockResponse) => Promise<void>;
};

export const EckoApi = (
  configManager: ConfigManager,
  logger: Logger
): EckoApi => {
  return {
    register: async (route: string, mockResponse: MockResponse) => {
      logger.info("Registering mock response for route:", route);

      const { database } = configManager.getConfig();

      addResponse(database, route, mockResponse);
    },
  };
};
