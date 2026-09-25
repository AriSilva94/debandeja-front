# Deploy do frontend / BFF (dev / prd)

O Next.js serve a interface **e** faz o papel de BFF: o browser nunca fala com a
API direto. Tokens de sessão ficam em cookies httpOnly e as rotas `/api/*`
repassam as chamadas ao backend. O backend tem o próprio guia em
`../backend/docs/deploy.md`: os dois precisam ser configurados juntos.

## 1. Variáveis de ambiente

Referência em `.env.example`. Em dev/prd, os valores vêm do gerenciador de
segredos da plataforma.

| Variável | Obrigatória | Observação |
|---|---|---|
| `BACKEND_URL` | sim | URL da API como o **servidor** Next a alcança (de preferência rede interna, não pública). |
| `INTERNAL_API_TOKEN` | sim | **Mesmo valor** do backend. Ver a seção 2. |
| `TRUST_PROXY_HEADERS` | sim | `true` só com proxy confiável na frente. Ver a seção 2. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | sim | Credenciais OAuth Web do Google. O secret fica somente no BFF. |
| `GOOGLE_REDIRECT_URI` | sim | URI de callback exata cadastrada no Google. Dev: `https://dev.debandeja.store/api/auth/google/callback`; prd: `https://debandeja.store/api/auth/google/callback`. |
| `NODE_ENV` | — | `next build`/`next start` já definem `production`; **não sobrescrever**. É o que liga o `secure` dos cookies de sessão. |

## 2. Rate limit e IP do visitante

Para o backend limitar as rotas públicas (login, cadastro, recuperação de senha)
pelo IP real do visitante, o BFF envia esse IP em `X-Client-IP` junto com
`X-Internal-Token` (`lib/server/backend-fetch.ts`). O IP sai de
`lib/server/client-meta.ts`. Requisições autenticadas são limitadas por usuário
e não dependem disso.

O que configurar:

1. **`INTERNAL_API_TOKEN`**: o mesmo valor configurado no backend, um por
   ambiente. Sem ele o backend ignora o IP enviado e todas as rotas públicas
   passam a dividir a cota do IP do servidor Next.
2. **`TRUST_PROXY_HEADERS`**:
   - `true` **apenas** se houver um proxy confiável na frente do Next (Vercel,
     nginx, Cloudflare, load balancer) que **sobrescreve** `X-Forwarded-For` com
     o IP da conexão. O BFF usa a entrada mais à direita.
     - nginx correto: `proxy_set_header X-Forwarded-For $remote_addr;`
     - nginx **errado**: `$proxy_add_x_forwarded_for`, que anexa ao valor enviado
       pelo cliente e o preserva forjado.
   - `false` (padrão) quando o Next recebe a conexão direto, como em local. O
     próprio Next só preenche `X-Forwarded-For` se o header não vier, então sem
     proxy qualquer cliente o forja. Nesse modo nenhum IP é repassado e o backend
     usa o da conexão.
   - Na dúvida, deixar `false`. Ligar indevidamente permite burlar o rate limit
     de login forjando o header.

## 3. Imagem Docker e Dokploy

A imagem é o `Dockerfile` deste repositório, montada pelo GitHub Actions
(`.github/workflows/docker-build.yml`: lint, typecheck e testes antes; `develop`
→ `:dev`, `main` → `:latest`) e publicada no GHCR. Usa a
saída `standalone` do Next (`next.config.ts`) e sobe com `node server.js` na
porta 3000, em modo `production` (cookies de sessão com `secure`). As variáveis
da seção 1 são lidas em tempo de execução: **a mesma imagem serve dev e prd**,
não precisa de variável no build.

No Dokploy (o backend tem o passo a passo completo em
`../backend/docs/deploy.md`, seção 7):

- Application com fonte **Docker image** `ghcr.io/<owner>/<repo-frontend>:dev`
  (prd: `:latest`). A Webhook URL de cada app vai para os secrets
  `DOKPLOY_DEV_WEBHOOK_URL` / `DOKPLOY_PROD_WEBHOOK_URL` do repositório.
- Variáveis de referência: `.env.dev.example` e `.env.prd.example`.
- Domínio público com HTTPS (Let's Encrypt) apontando para a porta 3000. Sem
  HTTPS o browser descarta os cookies `secure` e ninguém consegue entrar.
- `BACKEND_URL=http://<nome-interno-do-serviço-backend>:3000` (rede interna).
- `GOOGLE_REDIRECT_URI=https://dev.debandeja.store/api/auth/google/callback` (prd: `https://debandeja.store/api/auth/google/callback`). O valor deve ser idêntico à URI de redirecionamento autorizada no Google Cloud.
- `TRUST_PROXY_HEADERS=true` com o Traefik do Dokploy na frente: por padrão ele
  descarta o `X-Forwarded-For` vindo do cliente e grava o IP real da conexão.
  **Exceção:** se houver Cloudflare com proxy ligado (nuvem laranja) na frente, o
  IP gravado passa a ser o da Cloudflare; nesse caso deixar `false`.
- Health check: a imagem já declara `HEALTHCHECK` (`GET /login`). Usar o mesmo
  update config com `start-first` e rollback descrito no guia do backend.
- A URL pública deste frontend é o `APP_URL` do backend (CORS e links dos
  e-mails): os dois precisam bater.

A proteção CSRF do BFF (`lib/server/same-origin.ts`) compara a origem do browser
com o cabeçalho `Host`. O Traefik preserva o `Host` por padrão; um proxy que o
reescreva faria todo login e toda gravação responderem 403.

Local, fora de container: `npm run build && npm run start` (nunca `next dev` em
ambiente compartilhado: fora de `production` os cookies saem sem `secure`).

### Renovação de sessão e múltiplas instâncias

O refresh token é de uso único: se o backend recebe o mesmo token duas vezes,
entende como roubo e encerra **todas** as sessões do usuário. Quando o token de
acesso expira, a tela dispara várias chamadas ao mesmo tempo; o BFF junta essas
renovações numa só, mas essa coordenação vive **na memória de cada instância**
(`lib/server/backend-fetch.ts`).

- Uma instância do frontend: nada a configurar.
- Várias instâncias: usar **sticky session** (afinidade por cookie/IP) no
  balanceador. Sem isso, duas instâncias podem renovar o mesmo token ao mesmo
  tempo e derrubar a sessão do usuário.

## 4. Checklist rápido

- [ ] `BACKEND_URL` apontando para a API (rede interna, se possível)
- [ ] `INTERNAL_API_TOKEN` idêntico ao do backend e exclusivo do ambiente
- [ ] `TRUST_PROXY_HEADERS` conferido contra a infraestrutura real (proxy sobrescreve `X-Forwarded-For`?)
- [ ] `GOOGLE_REDIRECT_URI` idêntica à URI autorizada no Google Cloud
- [ ] Imagem do GHCR (`:dev` / `:latest`), domínio com HTTPS e health check *healthy*
- [ ] Secrets de webhook do Dokploy no repositório
- [ ] Proxy preserva o cabeçalho `Host` (padrão do Traefik)
- [ ] URL pública igual ao `APP_URL` do backend
- [ ] Mais de uma instância? Sticky session no balanceador
