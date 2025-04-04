import { test, describe, expect, afterAll, beforeAll, afterEach } from "vitest";
import urlJoin from "url-join";
import { EckoServer } from "../src/index.js";
import { type EckoApi } from "../src/api.js";

const PORT = 3005;

let ecko: EckoApi;
let eckoServer: EckoServer;
let baseUrl: string;

beforeAll(() => {
  eckoServer = EckoServer();

  const startResult = eckoServer.start({ port: PORT, logLevel: "error" });

  ecko = startResult.ecko;
  baseUrl = startResult.baseUrl;
});

afterEach(() => {
  eckoServer.reset();
});

afterAll(() => {
  eckoServer.stop();
});

test("Should register a GET endpoint and respond.", async () => {
  ecko.register("/test/endpoint", "get", {
    frequency: "always",
    payload: "Response from request",
  });

  const response = await fetch(urlJoin(baseUrl, "/test/endpoint"));

  const body = await response.text();

  expect(response.status).toBe(200);
  expect(body).toBe("Response from request");
});

test("Should register a POST endpoint and respond.", async () => {
  ecko.register("/path/to/endpoint", "post", {
    frequency: "always",
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

describe("beforeResponse", () => {
  test("Should call beforeResponse", async () => {
    let value = 0;

    ecko.register("/some/path", "get", {
      frequency: "always",
      payload: "Response from request",
      beforeResponse: async () => {
        value++;
      },
    });

    const response = await fetch(urlJoin(baseUrl, "/some/path"));

    expect(response.status).toBe(200);
    expect(value).toBe(1);
  });

  test("Should include headers in beforeResponse", async () => {
    let foundHeader = false;

    ecko.register("/a/b/c", "get", {
      frequency: "always",
      payload: "Response from request",
      beforeResponse: async ({ headers }) => {
        foundHeader = headers.get("x-test-header") === "test-value";
      },
    });

    await fetch(urlJoin(baseUrl, "/a/b/c"), {
      headers: {
        "X-Test-Header": "test-value",
      },
    });

    expect(foundHeader).toBe(true);
  });

  test("Should include query params in beforeResponse", async () => {
    let foundPathParam = false;

    ecko.register("/asdf/qwerty/123", "get", {
      frequency: "always",
      payload: "Response from request",
      beforeResponse: async ({ queryParams }) => {
        foundPathParam = queryParams.value === "abcd";
      },
    });

    await fetch(urlJoin(baseUrl, "/asdf/qwerty/123?value=abcd"));

    expect(foundPathParam).toBe(true);
  });
});

describe("afterResponse", () => {
  test("Should call afterResponse", async () => {
    let value = 0;
    let valueAsExpected = false;

    ecko.register("/some/path", "get", {
      frequency: "always",
      payload: "Response from request",
      beforeResponse: async () => {
        // make sure afterResponse hasn't been called yet
        if (value === 0) {
          valueAsExpected = true;
        }
      },
      afterResponse: async () => {
        value++;
      },
    });

    const response = await fetch(urlJoin(baseUrl, "/some/path"));

    expect(response.status).toBe(200);
    expect(value).toBe(1);
    expect(valueAsExpected).toBe(true);
  });

  test("Should include headers in afterResponse", async () => {
    let foundHeader = false;

    ecko.register("/a/b/c", "get", {
      frequency: "always",
      payload: "Response from request",
      afterResponse: async ({ headers }) => {
        foundHeader = headers.get("x-test-header") === "test-value";
      },
    });

    await fetch(urlJoin(baseUrl, "/a/b/c"), {
      headers: {
        "X-Test-Header": "test-value",
      },
    });

    expect(foundHeader).toBe(true);
  });

  test("Should include query params in afterResponse", async () => {
    let foundPathParam = false;

    ecko.register("/asdf/qwerty/123", "get", {
      frequency: "always",
      payload: "Response from request",
      afterResponse: async ({ queryParams }) => {
        foundPathParam = queryParams.value === "abcd";
      },
    });

    await fetch(urlJoin(baseUrl, "/asdf/qwerty/123?value=abcd"));

    expect(foundPathParam).toBe(true);
  });
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

test("Should only respond once", async () => {
  ecko.register("/test", "get", {
    frequency: "once",
    payload: "Response from request",
  });

  const response1 = await fetch(urlJoin(baseUrl, "/test"));
  const body1 = await response1.text();

  expect(response1.status).toBe(200);
  expect(body1).toBe("Response from request");

  const response2 = await fetch(urlJoin(baseUrl, "/test"));
  const body2 = await response2.text();

  expect(response2.status).toBe(404);
  expect(body2).toBe("");
});

test("Should respond a limited number of times", async () => {
  ecko.register("/test", "get", {
    frequency: {
      type: "limit",
      limit: 5,
    },
    payload: "Response from request",
  });

  const responses: Response[] = [];

  for (let i = 0; i < 7; i++) {
    const response = await fetch(urlJoin(baseUrl, "/test"));
    responses.push(response);
  }

  expect(responses[0].status).toBe(200);
  expect(await responses[0].text()).toBe("Response from request");
  expect(responses[1].status).toBe(200);
  expect(await responses[1].text()).toBe("Response from request");
  expect(responses[2].status).toBe(200);
  expect(await responses[2].text()).toBe("Response from request");
  expect(responses[3].status).toBe(200);
  expect(await responses[3].text()).toBe("Response from request");
  expect(responses[4].status).toBe(200);
  expect(await responses[4].text()).toBe("Response from request");
  expect(responses[5].status).toBe(404);
  expect(await responses[5].text()).toBe("");
  expect(responses[6].status).toBe(404);
  expect(await responses[6].text()).toBe("");
});

test("Should send the correct headers.", async () => {
  ecko.register("/path/to/endpoint", "put", {
    frequency: "always",
    payload: JSON.stringify({ message: "Some message text" }),
    headers: {
      "X-Test-Header": "test-value",
    },
  });

  const response = await fetch(urlJoin(baseUrl, "/path/to/endpoint"), {
    method: "PUT",
    body: JSON.stringify({}),
  });

  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body).toEqual({ message: "Some message text" });
  expect(response.headers.get("X-Test-Header")).toBe("test-value");
});
