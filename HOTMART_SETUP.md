# Preparação comercial com a Hotmart

O ArcMode continua hospedado no Cloudflare Pages. A Hotmart cuida da oferta,
checkout e cobrança; o Supabase recebe os eventos e decide se a conta pode abrir
o workspace.

## Estado seguro inicial

- `VITE_BILLING_REQUIRED=false` mantém o app funcionando como hoje;
- `public.app_settings.billing_enforced=false` mantém as políticas RLS atuais;
- a tela de assinatura e o bloqueio só entram em vigor depois dos testes.

Não ative apenas um dos dois controles. O frontend melhora a experiência, mas a
proteção real dos dados é feita pelo banco.

## 1. Banco e função

1. Execute `supabase/commerce-migration.sql` no projeto Supabase.
2. Publique a função `supabase/functions/hotmart-webhook` sem validação JWT, pois
   a autenticação da chamada é feita pelo cabeçalho `X-HOTMART-HOTTOK`.
3. Cadastre os segredos `HOTMART_HOTTOK` e `HOTMART_PRODUCT_ID` na função.
4. Não exponha a chave `service_role`; o Supabase a fornece somente à função.

URL esperada do webhook:

```text
https://SEU-PROJETO.supabase.co/functions/v1/hotmart-webhook
```

## 2. Produto e oferta

Crie um produto de assinatura na Hotmart e configure, inicialmente:

- plano mensal;
- plano anual com desconto;
- e-mail de suporte `contato.neurosyncapp@gmail.com`;
- página externa apontando para a apresentação do ArcMode;
- checkout oficial da Hotmart.

Depois, copie apenas a URL pública do checkout para
`VITE_HOTMART_CHECKOUT_URL`. Credenciais e tokens nunca usam o prefixo `VITE_`.

## 3. Webhook

Na Hotmart, crie uma configuração de Webhook v2 para o produto e envie pelo
menos estes eventos:

- compra aprovada/completa;
- compra atrasada/expirada;
- reembolso e chargeback;
- cancelamento e reativação da assinatura.

Use o mesmo HOTTOK cadastrado como segredo na Edge Function. A função valida o
token, restringe o produto, normaliza o e-mail e processa eventos repetidos sem
criar licenças duplicadas.

## 4. Teste antes da venda

Use primeiro o ambiente de testes da Hotmart e uma conta de teste separada.
Confirme no Supabase:

1. compra aprovada cria uma licença `active`;
2. o e-mail da compra é o mesmo da conta ArcMode;
3. a conta consegue abrir o workspace;
4. reembolso e chargeback revogam o acesso;
5. cancelamento preserva o acesso apenas até `access_until`, quando informado;
6. evento repetido não duplica a licença;
7. falha de webhook não libera acesso.

## 5. Ativação coordenada

Somente após os testes:

1. configure `VITE_HOTMART_CHECKOUT_URL` com o checkout real;
2. altere `VITE_BILLING_REQUIRED=true` e gere uma nova versão do frontend;
3. conceda uma licença manual à conta administrativa;
4. altere `public.app_settings.billing_enforced` para `true`;
5. publique e faça uma compra real de baixo valor;
6. mantenha o último deploy estável disponível para rollback.

Para interromper a cobrança sem retirar o app do ar, volte
`public.app_settings.billing_enforced` para `false` e publique o frontend com
`VITE_BILLING_REQUIRED=false`.

## 6. Domínio e e-mail

O domínio pode ser conectado depois dos testes. O Gmail criado não é descartado:
ele continua como caixa de recuperação e pode receber mensagens encaminhadas de
`contato@neurosyncapp.com.br`. Quando houver domínio, configure também SMTP no
Supabase e atualize as URLs de redirecionamento.
