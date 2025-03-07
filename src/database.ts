import type { Request } from "express";
import { assertNever } from "./type-witchcraft.js";

export type ResponseFrequency =
  | {
      type: "always" | "once";
    }
  | {
      type: "limit";
      limit: number;
    };

export type MockResponseSimple = {
  headers?: Record<string, string>;
  /** Assumed to default to 200. */
  statusCode?: number;
  payload?: any;
  /** Called before the response is sent. */
  beforeResponse?: (req: Request) => Promise<void>;
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

export function createDatabase(): Database {
  return {
    responses: new Map(),
  };
}

function getRouteResponses(database: Database, route: string) {
  return database.responses.get(normalizeRoute(route)) ?? [];
}

function setRouteResponses(
  database: Database,
  route: string,
  responses: MockResponse[]
) {
  database.responses.set(normalizeRoute(route), responses);
}

export function clearResponses(database: Database, route: string) {
  database.responses.delete(normalizeRoute(route));
}

export function addResponse(
  database: Database,
  route: string,
  response: MockResponse
) {
  let routeResponses = [...getRouteResponses(database, route)];

  // it doesn't make sense to have more than one "always" response
  if (response.frequency.type === "always") {
    // remove all other "always" responses
    routeResponses = routeResponses.filter(
      (x) => x.frequency.type !== "always"
    );
  }

  routeResponses.push(response);

  setRouteResponses(database, route, routeResponses);
}

function normalizeRoute(route: string) {
  // make sure the route starts with a slash
  return route.startsWith("/") ? route : `/${route}`;
}

export function getResponse(database: Database, route: string) {
  const routeResponses = getRouteResponses(database, route);

  const response = routeResponses[routeResponses.length - 1];

  if (!response) {
    return undefined;
  }

  const responseType = response.frequency.type;

  if (responseType === "always") {
    return response;
  } else if (responseType === "once") {
    // remove the response from the route responses
    routeResponses.pop();
    setRouteResponses(database, route, routeResponses);

    return response;
  } else if (responseType === "limit") {
    response.frequency.limit--;

    if (response.frequency.limit <= 0) {
      // no responses left for this one, remove it from the route responses
      routeResponses.pop();
      setRouteResponses(database, route, routeResponses);
    }

    return response;
  } else {
    assertNever(responseType);
  }
}
