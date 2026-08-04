# Guia de uso — API Clientes

## Fluxo típico

1. Cadastrar um cliente com `POST /v1/clientes`.
2. Consultar com `GET /v1/clientes/{clienteId}`.
3. Atualizar dados cadastrais com `PUT /v1/clientes/{clienteId}`.
4. Remover (inativar) com `DELETE /v1/clientes/{clienteId}`.

## Exemplo — cadastro de cliente

```bash
curl -X POST "https://api.nureal.com.br/clientes/v1/clientes" \
  -H "X-API-Key: SEU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Ana Lima",
    "tipoPessoa": "FISICA",
    "documento": "123.456.789-00",
    "email": "ana.lima@example.com"
  }'
```

## Boas práticas

- O campo `documento` deve estar sem máscara em integrações automatizadas quando possível.
- Utilize o filtro `documento` na listagem para localizar rapidamente um cliente específico.
