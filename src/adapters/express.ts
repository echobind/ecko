import { type Request } from "express";
import type { CallbackPayload } from "../database.js";

export function getCallbackPayload(req: Request): CallbackPayload {
  return {
    headers: req.headers,
    pathParams: req.params,
    queryParams: req.query,
    body: req.body,
  };
}
