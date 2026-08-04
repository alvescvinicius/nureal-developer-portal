export type EnvironmentName = 'DEV' | 'HML' | 'PRD';

export interface ApiMeta {
  name: string;
  slug: string;
  description: string;
  auth: string;
}

export type EnvironmentMap = Record<string, string>;

export interface ApiDocFile {
  fileName: string;
  title: string;
}

export interface ApiSummary {
  meta: ApiMeta;
  environments: EnvironmentMap;
  docs: ApiDocFile[];
}

export interface OpenApiParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema?: Record<string, unknown>;
}

export interface OpenApiOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: {
    required?: boolean;
    content?: Record<string, { schema?: unknown }>;
  };
  responses?: Record<
    string,
    {
      description?: string;
      content?: Record<string, { schema?: unknown }>;
    }
  >;
  security?: Record<string, string[]>[];
}

export type OpenApiPathItem = Record<string, OpenApiOperation>;

export interface OpenApiSpec {
  openapi: string;
  info: {
    title: string;
    description?: string;
    version: string;
  };
  servers?: { url: string }[];
  paths: Record<string, OpenApiPathItem>;
  components?: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
    responses?: Record<string, unknown>;
  };
}

export interface ApiDetail extends ApiSummary {
  openapi: OpenApiSpec;
}

export interface EndpointSummary {
  path: string;
  method: string;
  operation: OpenApiOperation;
}

export interface TryApiRequestPayload {
  environment: EnvironmentName;
  path: string;
  method: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
}

export interface TryApiResponsePayload {
  requestUrl: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  durationMs: number;
}
