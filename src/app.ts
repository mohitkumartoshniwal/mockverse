import Express, { Request, Response } from "express";
import cors from "cors";

import { ResponseMap } from "./types.js";
import { removeComments } from "./postman/postman.utils.js";
import { hashAppQuery, hashPayload } from "./postman/parser.js";

export function createApp(responseMap: ResponseMap) {
  const app = Express();

  app.use((req, res, next) => {
    cors({
      allowedHeaders: req.headers["access-control-request-headers"]
        ?.split(",")
        .map((h) => h.trim()),
    })(req, res, next);
  });
  app.options("*", cors());

  app.use(Express.json());

  // Register routes based on precomputed responseMap
  Object.keys(responseMap).forEach((path) => {
    const methods = responseMap[path];

    if (!methods) return;

    Object.keys(methods).forEach((method) => {
      const responses = methods[method];

      if (!responses) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (app as any)[method.toLowerCase()](
        `/${path}`,
        (req: Request, res: Response) => {
          // Remove comments from the incoming request body
          const stringifiedBody = removeComments(
            JSON.stringify(req.body ?? {})
          );
          let hashedPayload = hashPayload(stringifiedBody);

          const hashedQuery = hashAppQuery(req.query);
          if (hashedQuery) {
            hashedPayload = hashedQuery + hashedPayload;
          }
          const matchingResponse = responses[hashedPayload];

          // Match the incoming request payload with predefined responses
          if (matchingResponse) {
            res
              .status(matchingResponse.status)
              .send(JSON.parse(matchingResponse.body));
          } else {
            res
              .status(404)
              .send({ message: "No matching mock response found" });
          }
        }
      );
    });
  });

  return app;
}
