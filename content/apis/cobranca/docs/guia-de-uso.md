# Guia de uso — API Cobrança

## Fluxo típico

1. Criar uma cobrança com `POST /v1/cobrancas`.
2. Consultar o status com `GET /v1/cobrancas/{cobrancaId}`.
3. Dar baixa manual (quando aplicável) com `POST /v1/cobrancas/{cobrancaId}/baixa`.

## Autenticação OAuth2 (client credentials)

```bash
curl -X POST "https://auth.nureal.com.br/oauth2/token" \
  -d "grant_type=client_credentials" \
  -d "client_id=SEU_CLIENT_ID" \
  -d "client_secret=SEU_CLIENT_SECRET" \
  -d "scope=cobranca.read cobranca.write"
```

## Exemplo — criação de cobrança

```bash
curl -X POST "https://api.nureal.com.br/cobranca/v1/cobrancas" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pagador": "João Pereira",
    "valor": 259.90,
    "vencimento": "2026-09-10"
  }'
```
