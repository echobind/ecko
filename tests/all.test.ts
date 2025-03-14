import { test, expect, beforeEach, afterEach } from "vitest";
import urlJoin from "url-join";
import { EckoServer } from "../src/index.js";
import { type EckoApi } from "../src/api.js";

const PORT = 3005;

let ecko: EckoApi;
let eckoServer: EckoServer;
let baseUrl: string;

beforeEach(() => {
  eckoServer = EckoServer();

  const startResult = eckoServer.start({ port: PORT });

  ecko = startResult.ecko;
  baseUrl = startResult.baseUrl;
});

afterEach(() => {
  eckoServer.stop();
});

test("Should register a GET endpoint and respond.", async () => {
  ecko.register("/test", "get", {
    frequency: "always",
    status: 200,
    payload: "Response from request",
  });

  const response = await fetch(urlJoin(baseUrl, "/test"));

  const body = await response.text();

  expect(response.status).toBe(200);
  expect(body).toBe("Response from request");
});

test("Should register a POST endpoint and respond.", async () => {
  ecko.register("/path/to/endpoint", "post", {
    frequency: "always",
    status: 200,
    payload: JSON.stringify({ message: "Some message text" }),
  });

  const response = await fetch(urlJoin(baseUrl, "/path/to/endpoint"), {
    method: "POST",
    body: JSON.stringify({}),
  });

  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body).toEqual({ message: "Some message text" });
});

test("Should call beforeResponse", async () => {
  let value = 0;

  ecko.register("/test", "get", {
    frequency: "always",
    status: 200,
    payload: "Response from request",
    beforeResponse: async () => {
      value++;
    },
  });

  const response = await fetch(urlJoin(baseUrl, "/test"));

  expect(response.status).toBe(200);
  expect(value).toBe(1);
});

test("Should send back correct status code", async () => {
  ecko.register("/test", "get", {
    frequency: "always",
    status: 510,
    payload: "Response from request",
  });

  const response = await fetch(urlJoin(baseUrl, "/test"));

  const body = await response.text();

  expect(response.status).toBe(510);
  expect(body).toBe("Response from request");
});
