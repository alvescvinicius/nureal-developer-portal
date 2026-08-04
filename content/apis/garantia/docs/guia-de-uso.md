# Guia de uso — API Garantia

Este guia complementa o contrato OpenAPI com exemplos práticos de uso da API de Seguro Garantia.

## Fluxo típico

1. Emitir uma apólice com `POST /v1/apolices`.
2. Consultar o status com `GET /v1/apolices/{apoliceId}`.
3. Cancelar, se necessário, com `DELETE /v1/apolices/{apoliceId}`.

## Exemplo — emissão de apólice

```bash
curl -X POST "https://api.nureal.com.br/garantia/v1/apolices" \
  -H "X-API-Key: SEU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tomador": "Construtora Alfa Ltda",
    "segurado": "Prefeitura Municipal de Exemplo",
    "valorGarantido": 150000.00,
    "dataVigenciaFim": "2027-01-31"
  }'
```

## Boas práticas

- Sempre trate o erro `401` verificando se a `X-API-Key` está sendo enviada corretamente.
- Utilize paginação (`page`, `pageSize`) ao listar apólices para evitar respostas muito grandes.
