import type { Request } from "express";
import { assertNever } from "./type-witchcraft.js";

export type ResponseFrequency =
  | "always"
  | "once"
  | {
      type: "limit";
      limit: number;
    };

export type CallbackPayload = {
  /** They header key will always be lowercase. */
  headers: Map<string, string | string[] | undefined>;
  pathParams: Record<string, string>;
  queryParams: Record<string, unknown>;
  body: Record<string, unknown>;
};

const requestMethods = [
  "GET",
  "get",
  "POST",
  "post",
  "PUT",
  "put",
  "PATCH",
  "patch",
  "DELETE",
  "delete",
  "HEAD",
  "head",
  "OPTIONS",
  "options",
  "TRACE",
  "trace",
  "CONNECT",
  "connect",
] as const;

export type RequestMethod = (typeof requestMethods)[number];

export type MockResponseSimple = {
  method?: RequestMethod;
  headers?: Record<string, string>;
  /** Assumed to default to 200. */
  status?: number;
  payload?: any;
  /** Called before the response is sent. */
  beforeResponse?: (args: CallbackPayload) => Promise<void>;
};

export type MockResponse =
  | ({
      frequency: ResponseFrequency;
    } & MockResponseSimple)
  | {
      frequency: ResponseFrequency;
      /** Dynamically generate the response. */
      getResponse: (req: Request) => Promise<MockResponseSimple>;
    };

export type Database = {
  responses: Map<
    string,
    /**
     * Responses are a stack. The latest will be used. If it's a "once" or a
     * "limit" where the limit has been reached, it will be removed from the stack and
     * the next response will be used on the next call. In this way, you can build up
     * responses for a route and they will be used in order.
     */
    MockResponse[]
  >;
};

function getDatabaseKey(route: string, method: RequestMethod) {
  return `${normalizeRoute(route)}:${method.toLowerCase()}`;
}

export function guardRequestMethod(method: string): RequestMethod {
  if (requestMethods.includes(method as RequestMethod)) {
    return method as RequestMethod;
  } else {
    throw new Error(`Invalid request method: ${method}`);
  }
}

export function createDatabase(): Database {
  return {
    responses: new Map(),
  };
}

function getRouteResponses(
  database: Database,
  route: string,
  method: RequestMethod
) {
  return database.responses.get(getDatabaseKey(route, method)) ?? [];
}

function setRouteResponses(
  database: Database,
  route: string,
  method: RequestMethod,
  responses: MockResponse[]
) {
  database.responses.set(getDatabaseKey(route, method), responses);
}

export function clearResponses(
  database: Database,
  route: string,
  method: RequestMethod
) {
  database.responses.delete(getDatabaseKey(route, method));
}

function getIsAlways(frequency: ResponseFrequency): frequency is "always" {
  return typeof frequency === "string" && frequency === "always";
}

function getIsOnce(frequency: ResponseFrequency): frequency is "once" {
  return typeof frequency === "string" && frequency === "once";
}

function getIsLimit(frequency: ResponseFrequency): frequency is {
  type: "limit";
  limit: number;
} {
  return typeof frequency === "object" && frequency.type === "limit";
}

export function addResponse(
  database: Database,
  route: string,
  method: RequestMethod,
  response: MockResponse
) {
  let routeResponses = [...getRouteResponses(database, route, method)];

  // it doesn't make sense to have more than one "always" response
  if (getIsAlways(response.frequency)) {
    // remove all other "always" responses
    routeResponses = routeResponses.filter((x) => !getIsAlways(x.frequency));
  }

  routeResponses.push(response);

  setRouteResponses(database, route, method, routeResponses);
}

export function normalizeRoute(route: string) {
  // make sure the route starts with a slash
  return route.startsWith("/") ? route : `/${route}`;
}

export function getResponse(
  database: Database,
  route: string,
  method: RequestMethod
) {
  const routeResponses = getRouteResponses(database, route, method);

  const response = routeResponses[routeResponses.length - 1];

  if (!response) {
    return undefined;
  }

  if (getIsAlways(response.frequency)) {
    return response;
  } else if (getIsOnce(response.frequency)) {
    // remove the response from the route responses
    routeResponses.pop();
    setRouteResponses(database, route, method, routeResponses);

    return response;
  } else if (getIsLimit(response.frequency)) {
    response.frequency.limit--;

    if (response.frequency.limit <= 0) {
      // no responses left for this one, remove it from the route responses
      routeResponses.pop();
      setRouteResponses(database, route, method, routeResponses);
    }

    return response;
  } else {
    assertNever(response.frequency);
  }
}
