export type Environment = 'DEV' | 'HML' | 'PRD';

export interface ApiMeta {
  name: string;
  slug: string;
  description: string;
  auth: 'apiKey' | 'oauth2' | 'bearer' | string;
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

export interface ApiDetail extends ApiSummary {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openapi: any;
}

export interface TryRequestBody {
  environment: Environment;
  path: string;
  method: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
}
