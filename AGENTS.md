<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Deploy

Ao responder sobre deploy em dev/prd (o que configurar, variáveis, ordem do
pipeline), leia primeiro `docs/deploy.md` deste projeto e `../backend/docs/deploy.md`.
Mantenha esses guias atualizados sempre que uma mudança criar requisito de
deploy novo (variável de ambiente, proxy, cookies, integração com o backend).
