# Debandeja

Frontend do Debandeja, SaaS de controle de estoque e operação para
distribuidoras de bebidas. Next.js com App Router, que também faz o papel de
BFF: o browser só fala com as rotas `/api/*` deste app, que repassam as chamadas
à API NestJS (`../backend`) com a sessão em cookies httpOnly.

## Executar localmente

Pré-requisito: backend rodando (ver `../backend/README.md`).

```bash
cp .env.example .env.local   # BACKEND_URL e INTERNAL_API_TOKEN
npm install
npm run dev
```

A aplicação fica disponível em [http://localhost:3000](http://localhost:3000).

## Validação

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deploy

Imagem Docker montada pelo GitHub Actions e executada no Dokploy. Variáveis,
proxy, cookies e checklist em [`docs/deploy.md`](docs/deploy.md).
