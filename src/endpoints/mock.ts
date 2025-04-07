import type { Request, Response } from "express";
import {
  getResponse,
  guardRequestMethod,
  type EckoResponse,
  type EckoResponseSimple,
} from "../database.js";
import { getRequestInfo, Logger } from "../log.js";
import type { ConfigManager } from "../config.js";
import { getCallbackPayload } from "../adapters/express.js";

async function getEckoResponseSimple(
  response: EckoResponse,
  req: Request
): Promise<EckoResponseSimple> {
  if ("getResponse" in response) {
    return await response.getResponse(getCallbackPayload(req));
  } else {
    return response;
  }
}

export const MockEndpoint =
  (configManager: ConfigManager, logger: Logger) =>
  async (req: Request, res: Response): Promise<void> => {
    const { database } = configManager.getConfig();

    logger.info(getRequestInfo(req), "Mock endpoint called.");

    const response = getResponse(
      database,
      { path: req.path, queryParams: req.query },
      guardRequestMethod(req.method)
    );

    if (!response) {
      logger.warn(getRequestInfo(req), "No response found.");

      res.status(404).send();
      return;
    } else {
      const mockResponse = await getEckoResponseSimple(response, req);

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

      if (mockResponse.afterResponse) {
        logger.info(getRequestInfo(req), "Calling afterResponse.");

        await mockResponse.afterResponse(getCallbackPayload(req));
      }

      return;
    }
  };
