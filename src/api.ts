import {
  addResponse,
  normalizeRoutePath,
  type EckoResponse,
  type RequestMethod,
} from "./database.js";
import { ConfigManager } from "./config.js";
import { Logger } from "./log.js";

export type EckoApi = {
  register: (
    /**
     * If the route includes query parameters, then the route will only match
     * if the query parameters in the request are exactly the same.
     */
    route: string,
    method: RequestMethod,
    mockResponse: EckoResponse
  ) => Promise<void>;
};

export const EckoApi = (
  configManager: ConfigManager,
  logger: Logger
): EckoApi => {
  return {
    register: async (route, method, mockResponse) => {
      logger.info(
        `Registering mock response for: ${method.toUpperCase()} ${normalizeRoutePath(route)}`
      );

      const { database } = configManager.getConfig();

      addResponse(database, route, method, mockResponse);
    },
  };
};
