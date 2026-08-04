import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { ApiDetail, ApiMeta, ApiSummary, EnvironmentMap } from './types';

// content/apis lives at the repo root, two levels above apps/portal-backend
export const CONTENT_APIS_DIR = path.resolve(__dirname, '..', '..', '..', 'content', 'apis');

function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function readYaml<T = unknown>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return yaml.load(raw) as T;
}

function listApiSlugs(): string[] {
  if (!fs.existsSync(CONTENT_APIS_DIR)) return [];
  return fs
    .readdirSync(CONTENT_APIS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function docTitleFromFileName(fileName: string): string {
  const withoutExt = fileName.replace(/\.mdx?$/i, '');
  return withoutExt
    .split(/[-_]/g)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function loadDocs(slug: string): { fileName: string; title: string }[] {
  const docsDir = path.join(CONTENT_APIS_DIR, slug, 'docs');
  if (!fs.existsSync(docsDir)) return [];
  return fs
    .readdirSync(docsDir)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .sort()
    .map((fileName) => ({ fileName, title: docTitleFromFileName(fileName) }));
}

export function getApiSummary(slug: string): ApiSummary | null {
  const apiDir = path.join(CONTENT_APIS_DIR, slug);
  const metaPath = path.join(apiDir, 'meta.json');
  const envPath = path.join(apiDir, 'environments.json');
  if (!fs.existsSync(metaPath)) return null;

  const meta = readJson<ApiMeta>(metaPath);
  const environments = fs.existsSync(envPath) ? readJson<EnvironmentMap>(envPath) : {};
  const docs = loadDocs(slug);

  return { meta, environments, docs };
}

export function listApis(): ApiSummary[] {
  return listApiSlugs()
    .map((slug) => getApiSummary(slug))
    .filter((api): api is ApiSummary => api !== null);
}

export function getApiDetail(slug: string): ApiDetail | null {
  const summary = getApiSummary(slug);
  if (!summary) return null;

  const openapiPath = path.join(CONTENT_APIS_DIR, slug, 'openapi.yaml');
  if (!fs.existsSync(openapiPath)) return null;

  const openapi = readYaml(openapiPath);
  return { ...summary, openapi };
}

export function getApiDocContent(slug: string, fileName: string): string | null {
  // Guard against path traversal - only allow simple file names within the docs dir.
  const safeFileName = path.basename(fileName);
  const docPath = path.join(CONTENT_APIS_DIR, slug, 'docs', safeFileName);
  const docsDir = path.join(CONTENT_APIS_DIR, slug, 'docs');
  if (!docPath.startsWith(docsDir)) return null;
  if (!fs.existsSync(docPath)) return null;
  return fs.readFileSync(docPath, 'utf-8');
}

export function apiExists(slug: string): boolean {
  return fs.existsSync(path.join(CONTENT_APIS_DIR, slug, 'meta.json'));
}
