import { type Request } from "express";
import type { CallbackPayload } from "../database.js";

function normalizeHeaders(
  headers: Record<string, string | string[] | undefined>
): CallbackPayload["headers"] {
  const headerEntries = Object.entries(headers).map(([key, value]) => {
    return [key.toLowerCase(), value] as const;
  });

  return new Map(headerEntries);
}

export function getCallbackPayload(req: Request): CallbackPayload {
  return {
    headers: normalizeHeaders(req.headers),
    queryParams: req.query,
    body: req.body,
  };
}
