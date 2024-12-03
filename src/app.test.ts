import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import getPort from "get-port";

import { createApp } from "./app.js";
import { parsePostmanCollection } from "./postman/parser.js";

type Test = {
  method: HTTPMethods;
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};

type HTTPMethods =
  | "DELETE"
  | "GET"
  | "HEAD"
  | "PATCH"
  | "POST"
  | "PUT"
  | "OPTIONS";

const port = await getPort();

const collectionStr = readFileSync(
  "./fixtures/json/MOCK_DATA.postman_collection.json",
  "utf-8"
);
const responseMap = await parsePostmanCollection(collectionStr);
// Create app
const app = createApp(responseMap);

await new Promise<void>((resolve, reject) => {
  try {
    const server = app.listen(port, () => resolve());
    test.after(() => server.close());
  } catch (err) {
    reject(err);
  }
});

await test("JSON Responses with one folder in the collection", async (t) => {
  // /getPosts test cases
  const arr1: Test[] = [
    {
      method: "POST",
      url: "/getPosts",
      data: [{ title: "Post 1" }, { title: "Post 2" }],
    },
    {
      method: "GET",
      url: "/getPosts?try2=false",
      data: [
        {
          title: "Post 31",
        },
        {
          title: "Post 32",
        },
      ],
    },
    {
      method: "GET",
      url: "/getPosts",
      // both queries are disabled
      data: [
        {
          title: "Post 55",
        },
        {
          title: "Post 56",
        },
      ],
    },
    {
      method: "GET",
      url: "/getPosts",
      // both queries are disabled
      data: [
        {
          title: "Post 55",
        },
        {
          title: "Post 56",
        },
      ],
    },
  ];

  for (const tc of arr1) {
    await t.test(`${tc.method} ${tc.url}`, async () => {
      const options: RequestInit = {
        method: tc.method,
      };
      if (tc.body) {
        options.body = JSON.stringify(tc.body);
        options.headers = {
          "Content-Type": "application/json",
        };
      }

      const response = await fetch(`http://localhost:${port}${tc.url}`, {
        ...options,
      });
      const responseData = await response.json();
      assert.equal(
        responseData.data[0].title,
        tc.data[0].title,
        `${responseData.data[0].title} != ${tc.data[0].title} ${tc.method} ${tc.url} failed`
      );
    });
  }

  // /getUserDeta test cases
  const arr2: Test[] = [
    {
      method: "POST",
      url: "/getUserDetails",
      data: {
        name: "Mohit",
        occupation: "Engineer",
      },
    },
    {
      method: "POST",
      url: "/getUserDetails",
      body: {
        try: "123",
      },
      data: {
        name: "John",
        occupation: "Musician",
      },
    },
  ];

  for (const tc of arr2) {
    await t.test(`${tc.method} ${tc.url}`, async () => {
      const options: RequestInit = {
        method: tc.method,
      };
      if (tc.body) {
        options.body = JSON.stringify(tc.body);
        options.headers = {
          "Content-Type": "application/json",
        };
      }

      const response = await fetch(`http://localhost:${port}${tc.url}`, {
        ...options,
      });
      const responseData = await response.json();
      assert.equal(
        responseData.data.name,
        tc.data.name,
        `${responseData.data.name} != ${tc.data.name} ${tc.method} ${tc.url} failed`
      );
    });
  }
});
