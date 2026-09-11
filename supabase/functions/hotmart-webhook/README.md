# Webhook Hotmart

Esta função recebe eventos de compra e assinatura da Hotmart e atualiza
`public.access_entitlements`. Ela nunca deve ser chamada diretamente pelo frontend.

Segredos necessários na função:

```text
HOTMART_HOTTOK
HOTMART_PRODUCT_ID
```

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são fornecidos pelo ambiente das
Edge Functions. O valor de `HOTMART_HOTTOK` deve ser igual ao token exibido na
configuração de Webhook da Hotmart. Não registre nenhum desses valores no Git.

Eventos recomendados na Hotmart:

- compra aprovada e completa;
- compra atrasada e expirada;
- cancelamento;
- reembolso;
- chargeback;
- reativação de assinatura.

Antes de ativar `billing_enforced`, envie eventos de teste, confira a tabela de
licenças e valide compra, renovação, cancelamento e reembolso.
