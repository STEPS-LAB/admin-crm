export type OpenApiPrimitiveSchema = {
  readonly type: "string" | "number" | "integer" | "boolean" | "object" | "array";
  readonly format?: string;
  readonly enum?: readonly string[];
  readonly items?: OpenApiSchema;
  readonly properties?: Record<string, OpenApiSchema>;
  readonly required?: readonly string[];
  readonly nullable?: boolean;
  readonly description?: string;
  readonly additionalProperties?: boolean;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly minimum?: number;
  readonly maximum?: number;
  readonly default?: string | number | boolean;
};

export type OpenApiSchema =
  | OpenApiPrimitiveSchema
  | { readonly $ref: string }
  | { readonly allOf: readonly OpenApiSchema[] };

export interface OpenApiParameter {
  readonly name: string;
  readonly in: "query" | "path" | "header";
  readonly required?: boolean;
  readonly description?: string;
  readonly schema: OpenApiSchema;
}

export interface OpenApiResponse {
  readonly description: string;
  readonly headers?: Record<
    string,
    {
      readonly description: string;
      readonly schema: OpenApiSchema;
    }
  >;
  readonly content?: {
    readonly "application/json": {
      readonly schema: OpenApiSchema;
    };
  };
}

export interface OpenApiOperation {
  readonly tags: readonly string[];
  readonly summary: string;
  readonly description?: string;
  readonly operationId: string;
  readonly security?: readonly Record<string, readonly string[]>[];
  readonly parameters?: readonly OpenApiParameter[];
  readonly responses: Record<string, OpenApiResponse>;
}

export interface OpenApiDocument {
  readonly openapi: "3.1.0";
  readonly info: {
    readonly title: string;
    readonly version: string;
    readonly description: string;
    readonly contact?: {
      readonly name: string;
      readonly url: string;
    };
  };
  readonly servers: readonly { readonly url: string; readonly description?: string }[];
  readonly tags: readonly { readonly name: string; readonly description: string }[];
  readonly paths: Record<string, Partial<Record<"get" | "post" | "put" | "delete", OpenApiOperation>>>;
  readonly components: {
    readonly securitySchemes: Record<string, Record<string, string>>;
    readonly schemas: Record<string, OpenApiSchema>;
    readonly responses: Record<string, OpenApiResponse>;
    readonly parameters: Record<string, OpenApiParameter>;
  };
}
