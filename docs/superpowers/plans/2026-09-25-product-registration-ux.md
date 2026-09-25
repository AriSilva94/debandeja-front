# Product Registration UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplificar o cadastro de produto sem perder dados necessários e tornar validações, descarte e sucesso claros.

**Architecture:** O drawer continuará sendo o ponto de entrada. Estado local controlará divulgação progressiva, erros por campo e alteração não salva; os dados enviados ao hook existente permanecem `ProductInput`, preservando a validação do backend.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Vitest e Testing Library.

---

### Task 1: Cobrir o fluxo essencial e a divulgação progressiva

**Files:**
- Modify: `components/products/new-product-drawer.tsx`
- Create: `components/__tests__/new-product-drawer.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it("keeps initial stock hidden until the user chooses to add it", () => {
  render(<NewProductDrawer open onClose={vi.fn()} categories={[]} />);
  expect(screen.queryByLabelText(/Estoque inicial da filial/i)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Adicionar estoque inicial/i }));
  expect(screen.getByLabelText(/Estoque inicial da filial/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/__tests__/new-product-drawer.test.tsx`

- [ ] **Step 3: Write minimal implementation**

Renderizar apenas campos essenciais; mover marca e código de barras para detalhes recolhidos e estoque inicial para uma ação explícita.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/__tests__/new-product-drawer.test.tsx`

### Task 2: Cobrir validação contextual e descarte seguro

**Files:**
- Modify: `components/products/new-product-drawer.tsx`
- Modify: `components/__tests__/new-product-drawer.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
it("marks the invalid price and moves focus to it on submit", () => {
  render(<NewProductDrawer open onClose={vi.fn()} categories={[]} />);
  fireEvent.click(screen.getByRole("button", { name: /Salvar produto/i }));
  expect(screen.getByLabelText(/Preço de venda/i)).toHaveAttribute("aria-invalid", "true");
});

it("confirms before discarding changed data", () => {
  render(<NewProductDrawer open onClose={vi.fn()} categories={[]} />);
  fireEvent.change(screen.getByLabelText(/Nome do produto/i), { target: { value: "Água" } });
  fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));
  expect(screen.getByText(/Descartar alterações/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- components/__tests__/new-product-drawer.test.tsx`

- [ ] **Step 3: Write minimal implementation**

Adicionar estado de erro por campo, `aria-describedby`, foco no primeiro erro e confirmação de descarte para ações de fechamento.

- [ ] **Step 4: Run tests to verify pass**

Run: `npm test -- components/__tests__/new-product-drawer.test.tsx`

### Task 3: Esclarecer termos e confirmar o resultado

**Files:**
- Modify: `components/products/new-product-drawer.tsx`
- Modify: `components/__tests__/new-product-drawer.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
it("explains the global minimum stock rule", () => {
  render(<NewProductDrawer open onClose={vi.fn()} categories={[]} />);
  expect(screen.getByText(/alerta quando o saldo total/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- components/__tests__/new-product-drawer.test.tsx`

- [ ] **Step 3: Write minimal implementation**

Expandir siglas de unidade, corrigir a descrição, adicionar ajuda contextual e mostrar confirmação pós-salvamento com ação para cadastrar outro.

- [ ] **Step 4: Run test to verify pass**

Run: `npm test -- components/__tests__/new-product-drawer.test.tsx`

### Task 4: Verificação final

**Files:**
- Modify: arquivos estritamente necessários identificados nas tarefas anteriores

- [ ] **Step 1: Run quality checks**

Run: `npm run lint && npm run typecheck && npm test`

- [ ] **Step 2: Run detector**

Run: `node C:/Users/ariov/.agents/skills/impeccable/scripts/detect.mjs --json components/products/new-product-drawer.tsx`

- [ ] **Step 3: Review diff**

Run: `git diff --check && git diff -- components/products/new-product-drawer.tsx components/__tests__/new-product-drawer.test.tsx`
