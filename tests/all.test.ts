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

  await fetch(urlJoin(baseUrl, "/test"));

  expect(value).toBe(1);
});
