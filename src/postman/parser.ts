import {
  PostmanCollection,
  PostmanItem,
  PostmanQuery,
} from "./postman.types.js";
import { ResponseMap } from "../types.js";
import { removeComments } from "./postman.utils.js";
import { EMPTY_PAYLOAD, EMPTY_QUERY } from "../constants.js";

export const parsePostmanCollection = (str: string): Promise<ResponseMap> => {
  return new Promise((resolve, reject) => {
    try {
      const collection = JSON.parse(str);
      const schema = collection.info.schema;

      const v2Schemas = [
        "https://schema.getpostman.com/json/collection/v2.0.0/collection.json",
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      ];

      if (v2Schemas.includes(schema)) {
        return resolve(importPostmanV2Collection(collection));
      }

      throw new Error("Unknown postman schema");
    } catch (err) {
      console.error(err);

      return reject(
        new Error("Unable to parse the postman collection json file")
      );
    }
  });
};

export const importPostmanV2Collection = (collection: PostmanCollection) => {
  const routes: ResponseMap = {};

  // Recursively process items in the collection or folder.
  const processItems = (items: PostmanItem[]) => {
    items.forEach((item) => {
      // If the item is a folder, process its nested items
      if (item.item) {
        processItems(item.item);
      }

      // If the item is a request, process it
      if (item.request && item.response?.length) {
        // to check if the request is not empty in the postman collection
        if (item.request.url.path) {
          const path = item.request.url.path.join("/");
          //   Initialize route and method entry if not present
          if (!routes[path]) {
            routes[path] = {};
          }

          // Process each response for the given request
          item.response?.forEach((response) => {
            const method = response.originalRequest.method.toLowerCase();
            if (routes[path] && !routes[path][method.toUpperCase()]) {
              routes[path][method.toUpperCase()] = {};
            }
            const methodMap = routes[path]?.[method.toUpperCase()] ?? {};

            let requestBody = response.originalRequest.body?.raw ?? "{}";
            // Sanitize the raw JSON by removing comments
            requestBody = removeComments(requestBody);
            let hashedRequestBody = hashPayload(requestBody);
            const hashedQuery = hashQuery(response.originalRequest.url.query);
            if (hashedQuery) {
              hashedRequestBody = hashedQuery + hashedRequestBody;
            }

            methodMap[hashedRequestBody] = {
              status: response.code || 200,
              body:
                response.body || '{ "message": "No response body defined" }',
            };
          });
        }
      }
    });
  };
  if (collection.item) {
    processItems(collection.item);
  }

  return routes;
};

export const hashPayload = (payload: string) => {
  try {
    const requestBody = JSON.parse(payload);
    const keys = Object.keys(requestBody).sort((a, b) => a.localeCompare(b));
    const values = Object.values(requestBody)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((value: any): any => {
        if (typeof value === "object" && value !== null) {
          return hashPayload(JSON.stringify(value));
        } else {
          return value;
        }
      })
      .sort();

    const hash = [...keys, ...values].join("");
    if (hash.length === 0) {
      return EMPTY_PAYLOAD;
    }

    return hash;
  } catch {
    return EMPTY_PAYLOAD;
  }
};

export const hashQuery = (query?: PostmanQuery[]) => {
  const filteredQuery = query?.filter((q) => !q.disabled);

  // Handling case where we have keys but they are disabled
  if (filteredQuery?.length === 0) {
    return EMPTY_QUERY;
  }

  const hashedQuery = filteredQuery
    ? filteredQuery
        .map((q) => {
          return `${q.key}=${q.value}`;
        })
        .join("&")
    : EMPTY_QUERY;
  return hashedQuery;
};

export const hashAppQuery = (query: object) => {
  if (Object.keys(query).length === 0) {
    return EMPTY_QUERY;
  }

  const hashedQuery = query
    ? Object.entries(query)
        .map(([key, value]) => {
          return `${key}=${value}`;
        })
        .join("&")
    : EMPTY_QUERY;

  return hashedQuery;
};
