import {
  addResponse,
  normalizeRoute,
  type MockResponse,
  type RequestMethod,
} from "./database.js";
import { ConfigManager } from "./config.js";
import { Logger } from "./log.js";

export type EckoApi = {
  register: (
    route: string,
    method: RequestMethod,
    mockResponse: MockResponse
  ) => Promise<void>;
};

export const EckoApi = (
  configManager: ConfigManager,
  logger: Logger
): EckoApi => {
  return {
    register: async (route, method, mockResponse) => {
      logger.info(
        `Registering mock response for: ${method.toUpperCase()} ${normalizeRoute(route)}`
      );

      const { database } = configManager.getConfig();

      addResponse(database, route, method, mockResponse);
    },
  };
};
