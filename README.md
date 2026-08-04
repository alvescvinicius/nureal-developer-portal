# Nureal Developer Portal

Portal interno de desenvolvedor da Nureal: documentação, contratos (OpenAPI),
autenticação, ambientes, exemplos, SDKs e uma tela de "Testar API" (try-it-out)
para todas as APIs internas da empresa (Garantia, Capitalização, Cobrança,
Clientes, e qualquer nova API que venha a ser cadastrada).

## Arquitetura

```
nureal-developer-portal/
├── apps/
│   ├── portal-frontend/   # Angular (standalone components) + Angular Material
│   └── portal-backend/    # Express + TypeScript
├── content/
│   └── apis/
│       ├── garantia/
│       ├── capitalizacao/
│       ├── cobranca/
│       └── clientes/
├── package.json           # raiz, workspaces npm + scripts utilitários
└── README.md
```

O modelo de conteúdo é **OpenAPI-driven**: cada API cadastrada é uma pasta em
`content/apis/<slug>/`, e o backend simplesmente escaneia essa pasta — não há
banco de dados.

### `content/apis/<slug>/`

- `meta.json` — metadados da API: `{ "name", "slug", "description", "auth" }`
- `openapi.yaml` — spec OpenAPI 3.0 (fonte de verdade para Contratos,
  Request/Response, Erros e para gerar a tela "Testar API")
- `environments.json` — URLs base por ambiente:
  `{ "DEV": "...", "HML": "...", "PRD": "..." }`
- `docs/` (opcional) — markdown extra com guias e exemplos de uso

### Backend (`apps/portal-backend`)

Express + TypeScript. Ao receber uma requisição, lê os arquivos em
`content/apis/*` sob demanda (sem cache/banco). Principais rotas:

- `GET /api/apis` — lista todas as APIs cadastradas (meta.json de cada uma)
- `GET /api/apis/:slug` — detalhes + spec OpenAPI parseada (JSON) + environments
- `GET /api/apis/:slug/docs` — lista dos markdowns extras
- `GET /api/apis/:slug/docs/:fileName` — conteúdo de um markdown específico
- `POST /api/apis/:slug/try` — proxy: recebe
  `{ environment, path, method, headers, query, body }`, resolve a URL real
  usando `environments.json` e encaminha a requisição para a API real,
  devolvendo status/headers/body. Isso resolve CORS e permite testar a API
  real a partir do portal.

### Frontend (`apps/portal-frontend`)

Angular standalone + Angular Material. Layout com sidebar fixa à esquerda
(seção "APIs" expansível, buscando a lista via `GET /api/apis`) e um seletor
global de ambiente (DEV/HML/PRD) no header, guardado em `EnvironmentService`
(baseado em `signal`, persistido em `localStorage`) e consumido pelas telas
de Exemplos, Ambientes e Testar API.

Rotas por API:

```
/apis/:slug/contratos
/apis/:slug/autenticacao
/apis/:slug/ambientes
/apis/:slug/exemplos
/apis/:slug/testar
/apis/:slug/sdks
```

Em desenvolvimento, o Angular CLI usa `proxy.conf.json` para encaminhar
chamadas `/api/*` para o backend Express (porta 3000).

## Como rodar em desenvolvimento

Pré-requisito: Node 24 / npm 11 (via nvm).

```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# na raiz do repositório
npm install
npm run dev
```

Isso sobe backend (`http://localhost:3000`) e frontend (`http://localhost:4200`)
simultaneamente via `concurrently`. Acesse `http://localhost:4200`.

Também é possível rodar cada app separadamente:

```bash
# backend
cd apps/portal-backend && npm install && npm run dev

# frontend (em outro terminal)
cd apps/portal-frontend && npm install && npm start
```

### Build de produção

```bash
npm run build            # builda backend (tsc) e frontend (ng build) na raiz
npm run start:backend    # roda o backend compilado (dist/server.js)
```

O build de produção do frontend gera arquivos estáticos em
`apps/portal-frontend/dist/portal-frontend` — sirva-os com o servidor
estático de sua preferência (nginx, etc.), apontando as chamadas `/api/*`
para o backend Express.

## Como cadastrar uma NOVA API no portal

Não é necessário mexer em código do frontend/backend. Basta criar uma nova
pasta em `content/apis/<slug>/` com:

1. **`meta.json`**

   ```json
   {
     "name": "Nome da API",
     "slug": "nome-da-api",
     "description": "Descrição curta da API.",
     "auth": "apiKey"
   }
   ```

   `auth` aceita `apiKey`, `bearer` ou `oauth2` (usado apenas para gerar
   instruções e headers padrão nas telas de Autenticação/Exemplos/Testar API).

2. **`openapi.yaml`** — spec OpenAPI 3.0 da API, com `paths`, `components.schemas`
   e respostas de erro (`400`/`401`/`404`/`500`, etc). É a fonte de verdade
   para as telas de Contratos e Testar API.

3. **`environments.json`**

   ```json
   {
     "DEV": "https://dev.api.nureal.com.br/nome-da-api",
     "HML": "https://hml.api.nureal.com.br/nome-da-api",
     "PRD": "https://api.nureal.com.br/nome-da-api"
   }
   ```

4. **`docs/`** (opcional) — arquivos `.md` com guias de uso adicionais.

Reinicie (ou apenas aguarde, já que a leitura é sob demanda) o backend — a
nova API aparecerá automaticamente na home, no menu lateral e em todas as
telas do portal.

## Decisões e simplificações assumidas

- **Sem banco de dados**: todo o conteúdo vem de arquivos em `content/apis/`,
  lidos sob demanda pelo backend (sem cache/watch — reiniciar o backend após
  editar specs garante que a mudança seja refletida).
- **Autenticação no "Testar API"**: o portal não gerencia credenciais reais;
  o usuário preenche manualmente o header de autenticação (API Key, Bearer
  token etc.) no formulário de teste.
- **Markdown**: os arquivos em `docs/` são exibidos como texto pré-formatado
  (sem renderização rica de Markdown) para manter o escopo simples — pode ser
  trocado por uma lib de renderização (ex: `marked`) no futuro.
- **SDKs**: a tela de SDKs é estática/placeholder — mostra instruções
  fictícias de instalação (npm/pip/Maven) geradas a partir do slug da API,
  não pacotes publicados de fato.
- **4 APIs de exemplo** (Garantia, Capitalização, Cobrança, Clientes) foram
  criadas com dados fictícios, mas coerentes com um sistema de seguros/
  financeiro, incluindo endpoints CRUD-like, schemas de request/response e
  respostas de erro documentadas.
