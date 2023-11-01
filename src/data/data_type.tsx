// import { InputType } from "../components/DynamicForm";

export type ResponseCode = 200 | 201 | 400 | 401 | number;

export type Methods = "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

// export type DataType =
//   | "string" //
//   | "date" //
//   | "boolean" //
//   | "number" //
//   | "object" //
//   | "array_of_object" //
//   | "array_of_number" //
//   | "array_of_string" //
//   | "array_of_boolean" //
//   | "array_of_date"; //
// // | "array_of_array"; //

// export type QueryType = {
//   type: DataType;
//   enum?: string[];
//   properties?: Record<string, QueryType>;
//   default?: any;
//   description?: string;
//   required?: boolean;
// };

// export type FuncName = "dateNow" | "assign" | "randomString" | "contextData";

export type FuncType = { funcName: string; input?: any };

export type HeaderType = {
  location: string;
};

export type ResponseType = {
  description?: string;
  summary?: string;
  headers?: HeaderType;
  content: InputType;
};

export type HTTPData = {
  description?: string;
  usecase: string;
  method: Methods;
  path: string;
  tag: string;
  cookie?: InputType;
  query?: InputType;
  param?: InputType;
  header?: InputType;
  body?: InputType;
  local?: Record<string, FuncType>;
  response?: Record<ResponseCode, ResponseType>;
};

//================================================================

type GeneralInfoType = {
  default?: any;
  summary?: string;
  description?: string;
  required?: boolean;
};

export type EnumerableField = GeneralInfoType & {
  type: "string" | "number" | "boolean" | "date";
  enum?: (string | boolean | number)[];
  textAreaLine?: number;
  maxLength?: number;
  isPassword?: boolean;
};

export type ObjectField = GeneralInfoType & {
  type: "object";
  properties: Record<string, EnumerableField | ObjectField | ArrayField>;
};

export type ArrayField = GeneralInfoType & {
  type: "array";
  items: EnumerableField | ObjectField | ArrayField;
};

export type InputType = Record<string, EnumerableField | ObjectField | ArrayField>;

//================================================================
