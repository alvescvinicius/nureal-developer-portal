import { Router, Request, Response } from 'express';
import {
  apiExists,
  getApiDetail,
  getApiDocContent,
  listApis,
} from '../apiRegistry';
import { TryRequestBody } from '../types';

const router = Router();

// GET /api/apis - list all registered APIs
router.get('/', (_req: Request, res: Response) => {
  res.json(listApis());
});

// GET /api/apis/:slug - details + parsed OpenAPI spec + environments
router.get('/:slug', (req: Request, res: Response) => {
  const detail = getApiDetail(req.params.slug);
  if (!detail) {
    return res.status(404).json({ error: `API '${req.params.slug}' não encontrada.` });
  }
  res.json(detail);
});

// GET /api/apis/:slug/docs - list of extra markdown docs
router.get('/:slug/docs', (req: Request, res: Response) => {
  if (!apiExists(req.params.slug)) {
    return res.status(404).json({ error: `API '${req.params.slug}' não encontrada.` });
  }
  const detail = getApiDetail(req.params.slug);
  res.json(detail?.docs ?? []);
});

// GET /api/apis/:slug/docs/:fileName - content of a specific markdown doc
router.get('/:slug/docs/:fileName', (req: Request, res: Response) => {
  const { slug, fileName } = req.params;
  if (!apiExists(slug)) {
    return res.status(404).json({ error: `API '${slug}' não encontrada.` });
  }
  const content = getApiDocContent(slug, fileName);
  if (content === null) {
    return res.status(404).json({ error: `Documento '${fileName}' não encontrado.` });
  }
  res.type('text/markdown').send(content);
});

// POST /api/apis/:slug/try - proxy a request to the real API
router.post('/:slug/try', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const detail = getApiDetail(slug);
  if (!detail) {
    return res.status(404).json({ error: `API '${slug}' não encontrada.` });
  }

  const { environment, path: reqPath, method, headers, query, body } =
    req.body as TryRequestBody;

  if (!environment || !reqPath || !method) {
    return res
      .status(400)
      .json({ error: "Campos 'environment', 'path' e 'method' são obrigatórios." });
  }

  const baseUrl = detail.environments[environment];
  if (!baseUrl) {
    return res
      .status(400)
      .json({ error: `Ambiente '${environment}' não configurado para a API '${slug}'.` });
  }

  const url = new URL(baseUrl.replace(/\/$/, '') + reqPath);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const upperMethod = method.toUpperCase();
  const hasBody = !['GET', 'HEAD'].includes(upperMethod) && body !== undefined;

  const start = Date.now();
  try {
    const upstreamResponse = await fetch(url.toString(), {
      method: upperMethod,
      headers: {
        'Content-Type': 'application/json',
        ...(headers ?? {}),
      },
      body: hasBody ? JSON.stringify(body) : undefined,
    });

    const durationMs = Date.now() - start;
    const responseHeaders: Record<string, string> = {};
    upstreamResponse.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const contentType = upstreamResponse.headers.get('content-type') ?? '';
    let responseBody: unknown;
    const rawText = await upstreamResponse.text();
    if (contentType.includes('application/json') && rawText) {
      try {
        responseBody = JSON.parse(rawText);
      } catch {
        responseBody = rawText;
      }
    } else {
      responseBody = rawText;
    }

    res.json({
      requestUrl: url.toString(),
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
      body: responseBody,
      durationMs,
    });
  } catch (err) {
    const durationMs = Date.now() - start;
    res.status(502).json({
      error: 'Falha ao encaminhar a requisição para a API real.',
      details: err instanceof Error ? err.message : String(err),
      requestUrl: url.toString(),
      durationMs,
    });
  }
});

export default router;
