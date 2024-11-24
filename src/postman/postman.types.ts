/**
 * Root type for the Postman collection
 */
export interface PostmanCollection {
  info: PostmanInfo;
  item: PostmanItem[];
}

/**
 * Metadata about the Postman collection
 */
export interface PostmanInfo {
  name: string;
  schema: string;
}

/**
 * Represents an individual API endpoint or folder in the Postman collection
 */
export interface PostmanItem {
  name: string;
  request?: PostmanRequest;
  response?: PostmanResponse[];
  item?: PostmanItem[]; // Nested items for folders
}

/**
 * Represents a single request
 */
export interface PostmanRequest {
  method: string;
  url: PostmanUrl;
  header?: PostmanHeader[];
  body?: PostmanBody;
}

/**
 * Details of the request URL
 */
export interface PostmanUrl {
  raw: string;
  host: string[];
  path: string[];
  query?: PostmanQuery[];
}

/**
 * Represents a request header
 */
export interface PostmanHeader {
  key: string;
  value: string;
  description?: string;
}

/**
 * Represents the body of a request
 */
export interface PostmanBody {
  mode: "raw" | "urlencoded" | "formdata" | "file";
  raw?: string;
  formdata?: PostmanFormData[];
  urlencoded?: PostmanFormData[];
}

/**
 * Represents form data or URL-encoded data
 */
export interface PostmanFormData {
  key: string;
  value?: string;
  type?: string;
  description?: string;
}

/**
 * Represents a query parameter in the URL
 */
export interface PostmanQuery {
  key: string;
  value?: string;
  disabled?: boolean;
}

/**
 * Represents a response to a request
 */
export interface PostmanResponse {
  name: string;
  originalRequest: PostmanRequest;
  status: string;
  code: number;
  body: string;
  header?: PostmanHeader[];
}
