# Templates de email do Supabase

## Confirm signup

Use este template no Supabase para o email de confirmação de cadastro.

Assunto:

```text
Confirme seu e-mail no ArcMode
```

Corpo HTML:

```text
supabase/email-templates/confirm-signup.html
```

No painel do Supabase:

1. Abra `Authentication`.
2. Entre em `Email Templates`.
3. Selecione `Confirm signup`.
4. Troque o `Subject`.
5. Cole o HTML do arquivo `confirm-signup.html`.
6. Salve.

O template usa `{{ .ConfirmationURL }}` para o link de ativação e `{{ .SiteURL }}/IconArcMode-192.png` para carregar o logo. Quando o app estiver publicado, configure o `Site URL` em `Authentication > URL Configuration` com o domínio final para a imagem aparecer nos emails.

## Reset password

Assunto:

```text
Redefina sua senha do ArcMode
```

Corpo HTML:

```text
supabase/email-templates/reset-password.html
```

No painel do Supabase, selecione `Reset password`, troque o assunto, cole o HTML do arquivo e salve.
