# Guia de uso — API Capitalização

## Fluxo típico

1. Contratar um título com `POST /v1/titulos`.
2. Consultar com `GET /v1/titulos/{tituloId}`.
3. Solicitar resgate com `POST /v1/titulos/{tituloId}/resgate`.

## Exemplo — contratação de título

```bash
curl -X POST "https://api.nureal.com.br/capitalizacao/v1/titulos" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titular": "Maria Souza",
    "cpfCnpj": "123.456.789-00",
    "valorContribuicao": 100.00
  }'
```

## Boas práticas

- O token JWT deve ser renovado periodicamente conforme política do provedor de identidade da Nureal.
- Valores de contribuição devem respeitar o mínimo vigente da tabela comercial.
