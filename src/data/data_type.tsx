export type ResponseCode = 200 | 201 | 400 | 401 | number;

export type Methods = "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

export type DataType =
  | "string" //
  | "date" //
  | "boolean" //
  | "number" //
  | "object" //
  | "array_of_object" //
  | "array_of_number" //
  | "array_of_string" //
  | "array_of_boolean" //
  | "array_of_date"; //
// | "array_of_array"; //

export type QueryType = {
  type: DataType;
  enum?: string[];
  properties?: Record<string, QueryType>;
  default?: any;
  description?: string;
  required?: boolean;
};

export type FuncName = "dateNow" | "assign" | "randomString" | "contextData";

export type FuncType = { funcName: FuncName; input?: any };

export type HTTPData = {
  description?: string;
  usecase: string;
  method: Methods;
  path: string;
  tag: string;
  query?: Record<string, QueryType>;
  param?: Record<string, QueryType>;
  header?: Record<string, QueryType>;
  body?: Record<string, QueryType>;
  local?: Record<string, FuncType>;
  response?: Record<ResponseCode, Record<string, QueryType>>;
};
