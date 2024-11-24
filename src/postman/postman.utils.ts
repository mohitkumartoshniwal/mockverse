import { PostmanItem } from "./postman.types.js";

export const isItemAFolder = (item: PostmanItem) => {
  return !item.request;
};

/**
 * Removes comments from a JSON-like string.
 * Supports both single-line (`//`) and multi-line comments.
 * @param {string} raw - The raw string to sanitize.
 * @returns {string} - Sanitized JSON string without comments.
 */
export function removeComments(raw: string): string {
  return raw.replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, "").trim();
}

// export const constructUrlFromParts = async (url: PostmanUrl) => {
//   const { protocol = "http", host, path, port, query } = url || {};
//   const hostStr = Array.isArray(host)
//     ? host.filter(Boolean).join(".")
//     : host || "";
//   const pathStr = Array.isArray(path)
//     ? path.filter(Boolean).join("/")
//     : path || "";
//   const portStr = port ? `:${port}` : await getPort({ port: 3010 });
//   const queryStr =
//     query && Array.isArray(query) && query.length > 0
//       ? `?${query
//           .filter((q) => q.key)
//           .map((q) => `${q.key}=${q.value || ""}`)
//           .join("&")}`
//       : "";
//   const urlStr = `${protocol}://${hostStr}${portStr}${
//     pathStr ? `/${pathStr}` : ""
//   }${queryStr}`;
//   return urlStr;
// };

// export const constructUrl = (url: PostmanUrl) => {
//   if (!url) return "";

//   if (typeof url === "string") {
//     return url;
//   }

//   if (typeof url === "object") {
//     const { raw } = url;

//     if (raw && typeof raw === "string") {
//       // If the raw URL contains url-fragments remove it
//       if (raw.includes("#")) {
//         return raw.split("#")[0]; // Returns the part of raw URL without the url-fragment part.
//       }
//       return raw;
//     }

//     // If no raw value exists, construct the URL from parts
//     return constructUrlFromParts(url);
//   }

//   return "";
// };

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export const convertV21Auth = (array: any[]) => {
//   return array.reduce((accumulator, currentValue) => {
//     accumulator[currentValue.key] = currentValue.value;
//     return accumulator;
//   }, {});
// };

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export const searchLanguageByHeader = (headers: any) => {
//   let contentType;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   headers.forEach((header: any) => {
//     if (header.key.toLowerCase() === "content-type" && !header.disabled) {
//       if (
//         typeof header.value == "string" &&
//         // eslint-disable-next-line no-useless-escape
//         /^[\w\-]+\/([\w\-]+\+)?json/.test(header.value)
//       ) {
//         contentType = "json";
//       } else if (
//         typeof header.value == "string" &&
//         // eslint-disable-next-line no-useless-escape
//         /^[\w\-]+\/([\w\-]+\+)?xml/.test(header.value)
//       ) {
//         contentType = "xml";
//       }
//     }
//   });
//   return contentType;
// };
