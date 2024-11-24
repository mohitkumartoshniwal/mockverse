#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util";

import chalk from "chalk";
import getPort from "get-port";

import { createApp } from "./app.js";
import { parsePostmanCollection } from "./postman/parser.js";
import { ResponseMap } from "./types.js";

function help() {
  console.log(`Usage: mockverse [options] <file>
  
  Options:
    -p, --port <port>  Port (default: 3010)
    -h, --host <host>  Host (default: localhost)
    --help             Show this message
  `);
}

// Parse args
function args(): {
  file: string;
  port: number;
  host: string;
} {
  try {
    const { values, positionals } = parseArgs({
      options: {
        port: {
          type: "string",
          short: "p",
          default: process.env["PORT"] ?? "3010",
        },
        host: {
          type: "string",
          short: "h",
          default: process.env["HOST"] ?? "localhost",
        },
        help: {
          type: "boolean",
        },
      },
      allowPositionals: true,
    });

    if (values.help || positionals.length === 0) {
      help();
      process.exit();
    }

    // App args and options
    return {
      file: positionals[0] ?? "",
      port: parseInt(values.port as string),
      host: values.host as string,
    };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ERR_PARSE_ARGS_UNKNOWN_OPTION") {
      console.log(
        chalk.red((e as NodeJS.ErrnoException).message.split(".")[0])
      );
      help();
      process.exit(1);
    } else {
      throw e;
    }
  }
}

const { file, port, host = "localhost" } = args();
const availablePort = await getPort({ port });

if (!existsSync(file)) {
  console.log(chalk.red(`File ${file} not found`));
  process.exit(1);
}

if (readFileSync(file, "utf-8").trim() === "") {
  console.log(chalk.red(`File ${file} is empty`));
  process.exit(1);
}

const collectionStr = readFileSync(file, "utf-8");
try {
  const responseMap = await parsePostmanCollection(collectionStr);
  const app = createApp(responseMap);

  app.listen(availablePort, () => {
    console.log(
      [
        chalk.bold(`Server started on PORT :${availablePort}`),
        chalk.gray("Press CTRL-C to stop"),
        //   chalk.gray(`Watching ${file}...`),
        //   "",
        chalk.magenta(randomItem(kaomojis)),
        "",
      ].join("\n")
    );
    logRoutes(responseMap, host, availablePort);
  });
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log(chalk.red(error.message));
  } else {
    console.log(chalk.red("An unknown error occurred"));
  }
  process.exit(1);
}

export function logRoutes(
  responseMap: ResponseMap,
  host: string,
  port: number
): void {
  console.log(chalk.bold("Endpoints:"));

  if (Object.keys(responseMap).length === 0) {
    console.log(chalk.gray("No endpoints found."));
    return;
  }

  Object.keys(responseMap).forEach((path) => {
    console.log(chalk.green(`Path: /${path}`));

    const methods = responseMap[path];
    const supportedMethods = methods ? Object.keys(methods).join(", ") : "";

    console.log(chalk.yellow(`Methods: ${supportedMethods}`));
    console.log(); // Add spacing between routes
  });

  console.log(
    chalk.bold(`Server is running at: ${chalk.gray(`http://${host}:${port}/`)}`)
  );
}

const kaomojis = ["♡⸜(˶˃ ᵕ ˂˶)⸝♡", "♡( ◡‿◡ )", "( ˶ˆ ᗜ ˆ˵ )", "(˶ᵔ ᵕ ᵔ˶)"];

function randomItem(items: string[]): string {
  const index = Math.floor(Math.random() * items.length);
  return items.at(index) ?? "";
}
