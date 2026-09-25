# Google OAuth Observability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar falhas do callback Google diagnosticáveis sem registrar credenciais ou tokens e redirecionar erros para a origem pública configurada.

**Architecture:** A URL configurada em `GOOGLE_REDIRECT_URI` continua sendo a fonte de verdade da origem pós-callback. O Route Handler registra somente o estágio e, quando aplicável, o status HTTP da dependência que falhou; dados OAuth e segredos permanecem fora dos logs.

**Tech Stack:** Next.js 16, TypeScript e Vitest.

---

### Task 1: Cobrir o redirecionamento de falha

**Files:**
- Modify: `lib/server/google-oauth.ts`
- Modify: `lib/server/__tests__/google-oauth.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("redireciona falhas para a origem configurada do callback", () => {
  vi.stubEnv("GOOGLE_REDIRECT_URI", "https://dev.debandeja.store/api/auth/google/callback");

  expect(googleLoginErrorRedirectUrl("https://0.0.0.0:3000/api/auth/google/callback")).toBe(
    "https://dev.debandeja.store/login?erro=google",
  );
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- lib/server/__tests__/google-oauth.test.ts`

Expected: FAIL because `googleLoginErrorRedirectUrl` does not exist.

- [ ] **Step 3: Write the minimal implementation**

```ts
export function googleLoginErrorRedirectUrl(requestUrl: string) {
  return new URL("/login?erro=google", googleCallbackUrl() ?? requestUrl).toString();
}
```

- [ ] **Step 4: Run the test and verify success**

Run: `npm test -- lib/server/__tests__/google-oauth.test.ts`

Expected: PASS.

### Task 2: Registrar a etapa do callback que falhou

**Files:**
- Modify: `app/api/auth/google/callback/route.ts`

- [ ] **Step 1: Classify each failure boundary**

Use the stages `invalid_callback`, `token_exchange`, `backend_login`, and `unexpected`.

- [ ] **Step 2: Log safe metadata only**

Emit `console.error` with the stage, optional HTTP status, and error name. Do not include authorization codes, ID tokens, request bodies, response bodies, client secrets, or internal tokens.

- [ ] **Step 3: Reuse the tested error redirect URL**

Build the `NextResponse.redirect` response from `googleLoginErrorRedirectUrl(request.url)`.

### Task 3: Validate and commit

**Files:**
- Modify: OAuth files and the pre-existing local changes authorized by the user

- [ ] **Step 1: Run quality checks**

Run: `npm run lint`, `npm run typecheck`, and `npm test`.

- [ ] **Step 2: Review the staged diff**

Run: `git diff --check` and `git diff --cached`.

- [ ] **Step 3: Commit and push develop**

Commit all authorized frontend changes with the Git identity already configured in the repository, then push `develop` to its configured upstream.
