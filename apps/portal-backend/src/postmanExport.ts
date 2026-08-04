import { convert } from 'openapi-to-postmanv2';
import { ApiDetail } from './types';

export function buildPostmanCollection(detail: ApiDetail): Promise<Record<string, unknown>> {
  const spec = JSON.parse(JSON.stringify(detail.openapi));
  // Troca a URL do server real por uma variável de coleção, para que o
  // arquivo .postman_environment.json gerado ao lado controle o host.
  spec.servers = [{ url: '{{baseUrl}}' }];

  return new Promise((resolve, reject) => {
    convert(
      { type: 'json', data: spec },
      { folderStrategy: 'Tags', requestParametersResolution: 'Example' },
      (err, result) => {
        if (err) return reject(new Error(err.message));
        if (!result || !result.result || !result.output || !result.output[0]) {
          return reject(new Error(result?.reason ?? 'Falha ao converter especificação para Postman.'));
        }
        resolve(result.output[0].data as Record<string, unknown>);
      },
    );
  });
}

function authVariable(auth: string): { key: string; type: 'default' | 'secret' } {
  switch (auth) {
    case 'apiKey':
      return { key: 'apiKey', type: 'secret' };
    case 'bearer':
      return { key: 'token', type: 'secret' };
    case 'oauth2':
      return { key: 'accessToken', type: 'secret' };
    default:
      return { key: 'credential', type: 'secret' };
  }
}

export function buildPostmanEnvironment(
  detail: ApiDetail,
  envName: string,
): Record<string, unknown> | null {
  const baseUrl = detail.environments[envName];
  if (!baseUrl) return null;

  const extra = authVariable(detail.meta.auth);

  return {
    id: `${detail.meta.slug}-${envName.toLowerCase()}`,
    name: `${detail.meta.name} - ${envName}`,
    values: [
      { key: 'baseUrl', value: baseUrl, type: 'default', enabled: true },
      { key: extra.key, value: '', type: extra.type, enabled: true },
    ],
    _postman_variable_scope: 'environment',
  };
}
