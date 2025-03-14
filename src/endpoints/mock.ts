import type { Request, Response } from "express";
import {
  getResponse,
  type MockResponse,
  type MockResponseSimple,
} from "../database.js";
import { getRequestInfo, Logger } from "../log.js";
import type { ConfigManager } from "../config.js";
import { getCallbackPayload } from "../adapters/express.js";

async function getMockResponseSimple(
  response: MockResponse,
  req: Request
): Promise<MockResponseSimple> {
  if ("getResponse" in response) {
    return await response.getResponse(req);
  } else {
    return response;
  }
}

export const MockEndpoint =
  (configManager: ConfigManager, logger: Logger) =>
  async (req: Request, res: Response): Promise<void> => {
    const { database } = configManager.getConfig();

    logger.info(getRequestInfo(req), "Mock endpoint called.");

    const response = getResponse(database, req.path);

    if (!response) {
      logger.warn(`No response found for ${req.path}`);

      res.status(404).send();
      return;
    } else {
      const mockResponse = await getMockResponseSimple(response, req);

      res.status(mockResponse.status ?? 200);

      if (mockResponse.headers) {
        Object.entries(mockResponse.headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
      }

      if (mockResponse.beforeResponse) {
        logger.info(getRequestInfo(req), "Calling beforeResponse.");

        await mockResponse.beforeResponse(getCallbackPayload(req));
      }

      res.send(mockResponse.payload);
      return;
    }
  };
