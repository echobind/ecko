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

test("Should register an endpoint and respond.", async () => {
  ecko.register("/test", {
    frequency: "always",
    status: 200,
    payload: "Hello, world!",
  });

  const response = await fetch(urlJoin(baseUrl, "/test"));

  const body = await response.text();

  expect(body).toBe("Hello, world!");
});
