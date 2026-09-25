import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "@/app/(auth)/login/page";
import ProdutosPage from "@/app/(shell)/produtos/page";
import EstoquePage from "@/app/(shell)/estoque/page";
import EquipePage from "@/app/(shell)/equipe/page";
import AssinaturaPage from "@/app/(shell)/assinatura/page";
import DashboardPage from "@/app/(shell)/page";
import { Modal } from "@/components/ui/modal";
import { Drawer } from "@/components/ui/drawer";
import { FilterMenu } from "@/components/ui/filter-menu";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ToggleRow } from "@/components/settings/toggle-row";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { hardNavigate } from "@/lib/hard-navigate";
import { BranchSwitcher } from "@/components/layout/branch-switcher";
import { NewProductDrawer } from "@/components/products/new-product-drawer";
import { NewMovementDrawer } from "@/components/movements/new-movement-drawer";
import { BranchDrawer } from "@/components/branches/branch-drawer";
import { MemberFormModal } from "@/components/team/member-form-modal";
import { SubscriptionBanner } from "@/components/layout/subscription-banner";
import { NotificationsMenu } from "@/components/layout/notifications-menu";
import type { Branch, Preferences, Product, Role, SessionContext } from "@/lib/api/types";
import { BranchProvider } from "@/lib/branch-context";
import { CompanyTab } from "@/components/settings/company-tab";
import { SecurityTab } from "@/components/settings/security-tab";
import { PreferencesTab } from "@/components/settings/preferences-tab";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
const route = vi.hoisted(() => ({ search: "" }));

vi.mock("@/lib/hard-navigate", () => ({ hardNavigate: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => router,
  useSearchParams: () => new URLSearchParams(route.search),
}));

const BRANCHES: Branch[] = [
  { id: "b-1", name: "Matriz", city: "Araraquara", uf: "SP", responsibleName: "Ari Silva", isMain: true, active: true },
  { id: "b-2", name: "Filial Norte", city: "Ribeirão Preto", uf: "SP", responsibleName: null, isMain: false, active: true },
];
const INACTIVE_BRANCH: Branch = {
  id: "b-3",
  name: "CD Interior",
  city: "Bauru",
  uf: "SP",
  responsibleName: null,
  isMain: false,
  active: false,
};

const PRODUCTS: Product[] = [
  { id: "p-1", categoryId: "c-1", sku: "BEER-001", name: "Heineken Long Neck 330ml", brand: "Heineken", category: "Cervejas", barcode: null, unit: "UN", price: "6.90", minStock: 50, active: true, stock: 284, level: "ok" },
  { id: "p-2", categoryId: "c-1", sku: "BEER-002", name: "Corona Extra 330ml", brand: "Corona", category: "Cervejas", barcode: null, unit: "UN", price: "7.50", minStock: 40, active: true, stock: 31, level: "low" },
];

const PERMISSIONS: Record<Role, SessionContext["permissions"]> = {
  OWNER: { branches: 3, products: 3, stock: 3, movements: 3, team: 3, billing: 3, company: 3 },
  ADMIN: { branches: 3, products: 3, stock: 3, movements: 3, team: 3, billing: 2, company: 2 },
  MANAGER: { branches: 1, products: 2, stock: 2, movements: 2, team: 1, billing: 0, company: 1 },
  SALES: { branches: 0, products: 1, stock: 1, movements: 2, team: 0, billing: 0, company: 1 },
  STOCKIST: { branches: 0, products: 1, stock: 2, movements: 2, team: 0, billing: 0, company: 1 },
};

let sessionRole: Role = "OWNER";
type SubscriptionState = Pick<NonNullable<SessionContext["subscription"]>, "status" | "readOnly" | "onTrial" | "dataPurgeAt">;
const TRIAL_STATE: SubscriptionState = { status: "TRIAL", readOnly: false, onTrial: true, dataPurgeAt: null };
let subscriptionState = TRIAL_STATE;
const DEFAULT_PREFERENCES: Preferences = {
  defaultBranchId: null,
  lowStockEmailAlert: true,
  confirmBeforeExit: false,
  density: "comfortable",
  pageSize: 20,
  defaultScreen: "dashboard",
};
let preferencesState = DEFAULT_PREFERENCES;

function sessionContext(): SessionContext {
  return {
    tenant: { id: "t-1", name: "Distribuidora Teste" },
    role: sessionRole,
    allowedBranchIds: null,
    preferences: preferencesState,
    permissions: PERMISSIONS[sessionRole],
    subscription: {
      ...subscriptionState,
      planCode: "ESSENCIAL",
      planName: "Essencial",
      limits: { users: 3, branches: 1, products: 100 },
      trialDays: 14,
      trialDaysRemaining: 11,
    },
  };
}

const RESPONSES: Record<string, unknown> = {
  "/api/backend/branches": BRANCHES,
  "/api/backend/products": { items: PRODUCTS, total: 2, page: 1, pageSize: 8, counts: { all: 2, active: 2, inactive: 0, alert: 1 } },
  "/api/backend/products/categories": [{ id: "c-1", name: "Cervejas" }],
  "/api/backend/team": [
    { id: "m-1", role: "OWNER", status: "ACTIVE", lastAccessAt: null, name: "Ari Teste", email: "ari@example.com", avatarUrl: null, branches: [], inviteExpired: false },
    { id: "m-2", role: "STOCKIST", status: "ACTIVE", lastAccessAt: null, name: "Carla Nunes", email: "carla@example.com", avatarUrl: null, branches: [{ id: "b-1", name: "Matriz" }], inviteExpired: false },
    { id: "m-3", role: "SALES", status: "INVITED", lastAccessAt: null, name: null, email: "novo@example.com", avatarUrl: null, branches: [{ id: "b-2", name: "Filial Norte" }], inviteExpired: true },
  ],
  "/api/backend/team/roles-matrix": {
    OWNER: { branches: 3, products: 3, stock: 3, movements: 3, team: 3, billing: 3 },
    ADMIN: { branches: 3, products: 3, stock: 3, movements: 3, team: 3, billing: 2 },
    MANAGER: { branches: 1, products: 2, stock: 2, movements: 2, team: 1, billing: 0 },
    SALES: { branches: 0, products: 1, stock: 1, movements: 2, team: 0, billing: 0 },
    STOCKIST: { branches: 0, products: 1, stock: 2, movements: 2, team: 0, billing: 0 },
  },
  "/api/backend/me": {
    id: "u-1",
    name: "Ari Teste",
    email: "ari@example.com",
    pendingEmail: null,
    avatarUrl: null,
    notificationSettings: { dailySummary: true, inviteAlerts: true, productNews: false },
  },
  "/api/backend/me/sessions": [
    { id: "s-1", ipAddress: "189.10.0.1", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36", lastAccessAt: "2026-09-24T10:00:00.000Z", createdAt: "2026-09-24T10:00:00.000Z", isCurrent: true },
    { id: "s-2", ipAddress: "177.20.0.2", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1", lastAccessAt: "2026-09-20T10:00:00.000Z", createdAt: "2026-09-20T10:00:00.000Z", isCurrent: false },
  ],
  "/api/backend/company": {
    legalName: "Distribuidora Silva Bebidas LTDA",
    tradeName: "Distribuidora Silva",
    cnpj: "18402556000172",
    phone: null,
    contactEmail: null,
    address: null,
    city: "Araraquara",
    uf: "SP",
    zip: "14801300",
    stateRegistration: null,
    taxRegime: "Simples Nacional",
  },
  "/api/backend/alerts": [
    { product: { id: "p-2", name: "Corona Extra 330ml", sku: "BEER-002" }, branch: { id: "b-1", name: "Matriz" }, current: 31, min: 40, level: "low" },
  ],
  "/api/backend/dashboard/summary": {
    totalProducts: 2,
    newProductsInPeriod: 1,
    totalStockItems: 1234,
    stockItemsDeltaInPeriod: -20,
    movementsInPeriod: 7,
    lowStockCount: 1,
    outOfStockCount: 0,
    activeBranchesCount: 2,
    inactiveBranchesCount: 1,
    reservedItems: 0,
    byBranch: [
      { id: "b-1", name: "Matriz", city: "Araraquara", uf: "SP", items: 1000, skus: 2, lowCount: 1, outCount: 0 },
      { id: "b-2", name: "Filial Norte", city: "Ribeirão Preto", uf: "SP", items: 234, skus: 1, lowCount: 0, outCount: 0 },
    ],
    recentMovements: [],
  },
  "/api/backend/billing/subscription": {
    status: "TRIAL",
    onTrial: true,
    plan: { code: "ESSENCIAL", name: "Essencial", price: "99", maxUsers: 3, maxBranches: 1, maxProducts: 100 },
    trialEndsAt: "2026-10-08T12:00:00.000Z",
    trialDays: 14,
    trialDaysRemaining: 11,
    currentPeriodEnd: null,
    dataPurgeAt: null,
    usage: { users: { used: 2, limit: 3 }, branches: { used: 1, limit: 1 }, products: { used: 40, limit: null } },
  },
  "/api/backend/billing/plans": [
    { code: "ESSENCIAL", name: "Essencial", price: "99", maxUsers: 3, maxBranches: 1, maxProducts: 100, features: ["1 filial"], current: false },
    { code: "REDE", name: "Rede", price: "350", maxUsers: null, maxBranches: null, maxProducts: null, features: ["Filiais ilimitadas"], current: false },
  ],
  "/api/backend/billing/invoices": [
    { id: "a1b2c3d4-0000", issuedAt: "2026-09-12T12:00:00.000Z", description: "Plano Rede", amount: "349", status: "PAGO", pdfUrl: "https://example.com/f.pdf" },
    { id: "e5f6a7b8-0000", issuedAt: "2026-08-12T12:00:00.000Z", description: "Trial — sem cobrança", amount: "0", status: "ISENTO", pdfUrl: null },
  ],
  "/api/backend/stock": { items: [], total: 0, page: 1, pageSize: 10, kpis: { totalItems: 0, lowCount: 0, outCount: 0, reserved: 0 } },
};

let queryClient: QueryClient;

function stockFor(product: Product) {
  return {
    items: [
      {
        id: `s-${product.id}`,
        product: { id: product.id, name: product.name, sku: product.sku, minStock: product.minStock },
        branch: { id: BRANCHES[0].id, name: BRANCHES[0].name },
        current: 12,
        reserved: 0,
        available: 12,
        minStock: product.minStock,
        level: "low",
      },
    ],
    total: 1,
    page: 1,
    pageSize: 20,
    kpis: { totalItems: 12, lowCount: 1, outCount: 0, reserved: 0 },
  };
}

beforeEach(() => {
  sessionRole = "OWNER";
  subscriptionState = TRIAL_STATE;
  preferencesState = DEFAULT_PREFERENCES;
  router.push.mockClear();
  router.replace.mockClear();
  route.search = "";
  vi.mocked(hardNavigate).mockClear();
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string, init?: RequestInit) => {
      const [path, query] = input.split("?");
      const productId = new URLSearchParams(query).get("productId");
      const product = PRODUCTS.find((p) => p.id === productId);
      const body = product
        ? stockFor(product)
        : path === "/api/backend/products/categories" && init?.method === "POST"
          ? { id: "c-new", name: "Energéticos" }
        : path === "/api/backend/me/context"
          ? sessionContext()
          : RESPONSES[path];
      return new Response(JSON.stringify(body ?? {}), {
        status: body ? 200 : 404,
        headers: { "content-type": "application/json" },
      });
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function withProviders(ui: ReactNode) {
  return (
    <QueryClientProvider client={queryClient}>
      <BranchProvider>{ui}</BranchProvider>
    </QueryClientProvider>
  );
}

describe("superfícies sobrepostas", () => {
  it("expõe o modal como diálogo nomeado e fecha com Escape", () => {
    const onClose = vi.fn();

    render(
      <Modal open onClose={onClose} title="Confirmar operação">
        Conteúdo
      </Modal>,
    );

    const dialog = screen.getByRole("dialog", { name: "Confirmar operação" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("expõe o drawer como diálogo nomeado e fecha com Escape", () => {
    const onClose = vi.fn();

    render(
      <Drawer open onClose={onClose} title="Editar produto">
        Conteúdo
      </Drawer>,
    );

    const dialog = screen.getByRole("dialog", { name: "Editar produto" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe("reinicialização de formulários", () => {
  it("restaura o status do produto ao reabrir o drawer", () => {
    const props = { onClose: vi.fn(), product: PRODUCTS[0], categories: [{ id: "c-1", name: "Cervejas" }] };
    const { rerender } = render(withProviders(<NewProductDrawer open {...props} />));

    fireEvent.click(screen.getByRole("switch"));
    expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(false);

    rerender(withProviders(<NewProductDrawer open={false} {...props} />));
    rerender(withProviders(<NewProductDrawer open {...props} />));

    expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(true);
  });

  it("mostra estoque inicial por filial apenas quando solicitado no cadastro novo", async () => {
    render(withProviders(<NewProductDrawer open onClose={vi.fn()} product={null} categories={[{ id: "c-1", name: "Cervejas" }]} />));

    expect(screen.queryByRole("textbox", { name: "Estoque inicial da filial Matriz" })).toBeNull();

    fireEvent.click(await screen.findByRole("button", { name: "Adicionar estoque inicial" }));

    expect(await screen.findByRole("textbox", { name: "Estoque inicial da filial Matriz" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Estoque inicial da filial Filial Norte" })).toBeTruthy();
  });

  it("destaca e foca o primeiro campo inválido ao salvar", () => {
    render(withProviders(<NewProductDrawer open onClose={vi.fn()} product={null} categories={[{ id: "c-1", name: "Cervejas" }]} />));

    fireEvent.change(screen.getByLabelText("Nome do produto"), { target: { value: "Água" } });
    fireEvent.change(screen.getByLabelText("SKU"), { target: { value: "AGUA-001" } });
    fireEvent.click(screen.getByLabelText("Categoria"));
    fireEvent.click(screen.getByRole("button", { name: "Cervejas" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar produto" }));

    const price = screen.getByLabelText("Preço de venda");
    expect(price.getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(price);
  });

  it("permite criar e selecionar uma categoria que não está na busca", async () => {
    render(withProviders(<NewProductDrawer open onClose={vi.fn()} product={null} categories={[{ id: "c-1", name: "Cervejas" }]} />));

    const category = screen.getByLabelText("Categoria");
    fireEvent.change(category, { target: { value: "Energéticos" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar “Energéticos”" }));

    await waitFor(() => expect((category as HTMLInputElement).value).toBe("Energéticos"));
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      "/api/backend/products/categories",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("pede confirmação antes de descartar alterações", () => {
    render(withProviders(<NewProductDrawer open onClose={vi.fn()} product={null} categories={[{ id: "c-1", name: "Cervejas" }]} />));

    fireEvent.change(screen.getByLabelText("Nome do produto"), { target: { value: "Água" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.getByRole("dialog", { name: "Descartar alterações?" })).toBeTruthy();
  });

  it("confirma o produto salvo e permite cadastrar outro", async () => {
    render(withProviders(<NewProductDrawer open onClose={vi.fn()} product={null} categories={[{ id: "c-1", name: "Cervejas" }]} />));

    fireEvent.change(screen.getByLabelText("Nome do produto"), { target: { value: "Água" } });
    fireEvent.change(screen.getByLabelText("SKU"), { target: { value: "AGUA-001" } });
    fireEvent.click(screen.getByLabelText("Categoria"));
    fireEvent.click(screen.getByRole("button", { name: "Cervejas" }));
    fireEvent.change(screen.getByLabelText("Preço de venda"), { target: { value: "5,00" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar produto" }));

    await screen.findByText("Produto cadastrado");
    expect(screen.getByRole("button", { name: "Cadastrar outro" })).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole("button", { name: "Salvar produto" })).toBeNull());
  });

  it("restaura o status da filial ao reabrir o drawer", () => {
    const props = { onClose: vi.fn(), branch: INACTIVE_BRANCH };
    const { rerender } = render(withProviders(<BranchDrawer open {...props} />));

    fireEvent.click(screen.getByRole("switch"));
    expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(true);

    rerender(withProviders(<BranchDrawer open={false} {...props} />));
    rerender(withProviders(<BranchDrawer open {...props} />));

    expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(false);
  });

  it("impede desativar a filial principal e esconde o status ao criar", () => {
    const { rerender } = render(withProviders(<BranchDrawer open onClose={vi.fn()} branch={BRANCHES[0]} />));
    expect((screen.getByRole("switch") as HTMLInputElement).disabled).toBe(true);

    rerender(withProviders(<BranchDrawer open onClose={vi.fn()} branch={null} />));
    expect(screen.queryByRole("switch")).toBeNull();
  });

  it("restaura produto e filial da movimentação ao reabrir o drawer", async () => {
    const props = { onClose: vi.fn(), initialProductId: PRODUCTS[0].id, initialBranchId: BRANCHES[0].id };
    const { rerender } = render(withProviders(<NewMovementDrawer open {...props} />));
    const productInput = () => screen.getByRole("combobox", { name: "Produto" }) as HTMLInputElement;

    await vi.waitFor(() => expect(productInput().value).toBe("Heineken Long Neck 330ml — BEER-001"));

    fireEvent.focus(productInput());
    fireEvent.click(await screen.findByRole("option", { name: /Corona Extra/ }));
    expect(productInput().value).toBe("Corona Extra 330ml — BEER-002");
    fireEvent.change(screen.getByLabelText("Filial"), { target: { value: BRANCHES[1].id } });

    rerender(withProviders(<NewMovementDrawer open={false} {...props} />));
    rerender(withProviders(<NewMovementDrawer open {...props} />));

    await vi.waitFor(() => expect(productInput().value).toBe("Heineken Long Neck 330ml — BEER-001"));
    expect((screen.getByLabelText("Filial") as HTMLSelectElement).value).toBe(BRANCHES[0].id);
  });

  it("fecha só a lista de produtos com Escape, sem fechar o drawer", async () => {
    const onClose = vi.fn();
    render(withProviders(<NewMovementDrawer open onClose={onClose} />));
    const productInput = screen.getByRole("combobox", { name: "Produto" });

    fireEvent.focus(productInput);
    await screen.findByRole("option", { name: /Corona Extra/ });
    fireEvent.keyDown(productInput, { key: "Escape" });

    expect(productInput.getAttribute("aria-expanded")).toBe("false");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("seleciona produto pelo teclado na lista de busca", async () => {
    render(withProviders(<NewMovementDrawer open onClose={vi.fn()} />));
    const productInput = screen.getByRole("combobox", { name: "Produto" }) as HTMLInputElement;

    fireEvent.focus(productInput);
    await screen.findByRole("option", { name: /Corona Extra/ });
    fireEvent.keyDown(productInput, { key: "ArrowDown" });
    fireEvent.keyDown(productInput, { key: "Enter" });

    expect(productInput.value).toBe("Corona Extra 330ml — BEER-002");
  });

  it("restaura a função do membro ao reabrir o modal", () => {
    const props = { onClose: vi.fn(), member: null };
    const { rerender } = render(withProviders(<MemberFormModal open {...props} />));

    fireEvent.change(screen.getByLabelText("Função"), { target: { value: "SALES" } });

    rerender(withProviders(<MemberFormModal open={false} {...props} />));
    rerender(withProviders(<MemberFormModal open {...props} />));

    expect((screen.getByLabelText("Função") as HTMLSelectElement).value).toBe("STOCKIST");
  });

  it("administrador não escolhe filiais; demais papéis exigem ao menos uma", async () => {
    render(withProviders(<MemberFormModal open onClose={vi.fn()} member={null} />));

    const matriz = await screen.findByRole("button", { name: /Matriz/ });
    expect(matriz.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(matriz);
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "x@example.com" } });
    fireEvent.submit(screen.getByLabelText("E-mail").closest("form")!);
    expect(await screen.findByText("Selecione ao menos uma filial.")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Função"), { target: { value: "ADMIN" } });
    expect(screen.queryByRole("button", { name: /Matriz/ })).toBeNull();
    expect(screen.getByText("Administradores acessam todas as filiais.")).toBeTruthy();
  });
});

describe("menu do usuário", () => {
  it("abre com Meu perfil e Sair, este em vermelho", async () => {
    render(withProviders(<UserMenu variant="header" />));

    const trigger = await screen.findByRole("button", { name: "Menu do usuário Ari Teste" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("ari@example.com")).toBeTruthy();
    const profile = screen.getByRole("menuitem", { name: "Meu perfil" });
    expect(profile.getAttribute("href")).toBe("/configuracoes?aba=conta");
    expect(screen.getByRole("menuitem", { name: "Sair" }).className).toContain("text-error-text");
  });

  it("sair recarrega no login mesmo se o backend falhar, sem buscar dados depois", async () => {
    render(withProviders(<UserMenu variant="header" />));

    fireEvent.click(await screen.findByRole("button", { name: "Menu do usuário Ari Teste" }));
    const callsBeforeLogout = vi.mocked(fetch).mock.calls.length;
    fireEvent.click(screen.getByRole("menuitem", { name: "Sair" }));

    await vi.waitFor(() => expect(hardNavigate).toHaveBeenCalledWith("/login"));
    const afterLogout = vi.mocked(fetch).mock.calls.slice(callsBeforeLogout).map(([url]) => String(url));
    expect(afterLogout).toEqual(["/api/auth/logout"]);
  });

  it("abre o mesmo menu pelo usuário no rodapé da sidebar", async () => {
    render(withProviders(<Sidebar collapsed={false} tenantName="Distribuidora Teste" />));

    const trigger = await screen.findByRole("button", { name: "Menu do usuário Ari Teste" });
    await screen.findByText("Proprietário");
    fireEvent.click(trigger);

    expect(screen.getByRole("menuitem", { name: "Meu perfil" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Sair" })).toBeTruthy();
  });

  it("fecha com Escape", async () => {
    render(withProviders(<UserMenu variant="header" />));

    const trigger = await screen.findByRole("button", { name: "Menu do usuário Ari Teste" });
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });

    expect(screen.queryByRole("menu")).toBeNull();
  });
});

describe("equipe", () => {
  it("lista membros reais, assentos do plano e ações conforme o status", async () => {
    render(withProviders(<EquipePage />));

    expect(await screen.findByText("carla@example.com")).toBeTruthy();
    expect(screen.getByText("3 de 3 assentos usados")).toBeTruthy();
    expect(screen.getByText("Convite expirado")).toBeTruthy();
    expect(screen.getByText("Todas as filiais")).toBeTruthy();

    expect(screen.queryByRole("button", { name: "Ações de Ari Teste" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Ações de novo@example.com" }));
    expect(screen.getByText("Reenviar convite")).toBeTruthy();
    expect(screen.getByText("Cancelar convite")).toBeTruthy();
  });

  it("matriz de permissões vem da API, com a regra de saídas do vendedor", async () => {
    render(withProviders(<EquipePage />));

    const salesRow = (await screen.findAllByText("Vendedor")).map((el) => el.closest("tr")).find((row) => row?.textContent?.includes("Saídas"));
    expect(salesRow).toBeTruthy();
    const adminRow = screen.getAllByText("Administrador").map((el) => el.closest("tr")).find(Boolean);
    expect(adminRow?.textContent).toContain("Editar");
  });

  it("gerente vê a equipe mas não gerencia", async () => {
    sessionRole = "MANAGER";
    render(withProviders(<EquipePage />));

    await screen.findByText("carla@example.com");
    await vi.waitFor(() => expect(screen.queryByRole("button", { name: /Convidar membro/ })).toBeNull());
    expect(screen.queryByRole("button", { name: /^Ações de/ })).toBeNull();
  });
});

describe("assinatura", () => {
  it("mostra plano, trial, uso e cobranças reais", async () => {
    render(withProviders(<AssinaturaPage />));

    expect(await screen.findByText("Plano atual: Trial")).toBeTruthy();
    expect(screen.getByText("Restam 11 de 14 dias")).toBeTruthy();
    expect(screen.getByText("TRIAL · estado atual")).toBeTruthy();
    expect(await screen.findByText("1 filial e até 3 usuários")).toBeTruthy();
    expect(screen.getByText("Filiais ilimitadas e usuários ilimitados")).toBeTruthy();
    expect(screen.getByText(/R\$\s99,00/)).toBeTruthy();
    expect(screen.queryByText("Plano atual", { selector: "span" })).toBeNull();
    const hire = screen.getAllByRole("link", { name: /Contratar pelo WhatsApp/ });
    expect(hire).toHaveLength(2);
    expect(decodeURIComponent(hire[1].getAttribute("href") ?? "")).toBe(
      "https://wa.me/5516997351101?text=Olá! Quero contratar o plano Rede para a distribuidora Distribuidora Teste.",
    );

    expect(await screen.findByText("#A1B2C3D4")).toBeTruthy();
    const downloads = screen.getAllByRole("link", { name: "Baixar" });
    expect(downloads).toHaveLength(1);
    expect(downloads[0].getAttribute("href")).toBe("https://example.com/f.pdf");
  });
});

describe("aviso de assinatura", () => {
  it("trial em dia não mostra aviso", async () => {
    render(withProviders(<SubscriptionBanner />));
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("trial encerrado avisa que a conta está somente leitura", async () => {
    subscriptionState = { ...TRIAL_STATE, status: "SUSPENDED", readOnly: true };
    render(withProviders(<SubscriptionBanner />));
    expect(await screen.findByText(/Seu período de teste terminou/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ver assinatura" }).getAttribute("href")).toBe("/assinatura");
  });

  it("cancelada informa a data da exclusão dos dados", async () => {
    subscriptionState = {
      ...TRIAL_STATE,
      status: "CANCELED",
      readOnly: true,
      onTrial: false,
      dataPurgeAt: "2026-12-23T12:00:00.000Z",
    };
    render(withProviders(<SubscriptionBanner />));
    expect(await screen.findByText(/os dados serão excluídos em 23\/12\/2026/)).toBeTruthy();
  });

  it("pagamento pendente avisa sem bloquear", async () => {
    subscriptionState = { ...TRIAL_STATE, status: "PAST_DUE", onTrial: false };
    render(withProviders(<SubscriptionBanner />));
    expect(await screen.findByText(/Pagamento pendente/)).toBeTruthy();
  });
});

describe("notificações", () => {
  it("sino mostra a contagem e lista os alertas de estoque reais", async () => {
    render(withProviders(<NotificationsMenu />));

    const bell = await screen.findByRole("button", { name: "Notificações: 1 alerta de estoque" });
    fireEvent.click(bell);

    expect(screen.getByRole("dialog", { name: "Notificações" })).toBeTruthy();
    expect(screen.getByText("Corona Extra 330ml")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ver estoque" }).getAttribute("href")).toBe("/estoque");
  });
});

describe("configurações", () => {
  it("empresa mostra CNPJ e CEP formatados e salva para quem pode editar", async () => {
    render(withProviders(<CompanyTab />));

    expect(((await screen.findByLabelText("CNPJ")) as HTMLInputElement).value).toBe("18.402.556/0001-72");
    expect((screen.getByLabelText("CEP") as HTMLInputElement).value).toBe("14801-300");
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeTruthy();
  });

  it("gerente vê a empresa sem poder editar", async () => {
    sessionRole = "MANAGER";
    render(withProviders(<CompanyTab />));

    const legalName = (await screen.findByLabelText("Nome da empresa")) as HTMLInputElement;
    await vi.waitFor(() => expect(legalName.closest("fieldset")?.disabled).toBe(true));
    expect(screen.queryByRole("button", { name: "Salvar alterações" })).toBeNull();
  });

  it("sessões mostram dispositivo e IP; só as outras podem ser encerradas", async () => {
    render(withProviders(<SecurityTab />));

    expect(await screen.findByText("177.20.0.2")).toBeTruthy();
    expect(screen.getAllByText("Chrome · Windows").length).toBeGreaterThan(0);
    expect(screen.getByText("Safari · iPhone")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Encerrar" })).toHaveLength(1);
  });

  it("preferências não oferecem formato de data e refletem o salvo", async () => {
    preferencesState = { ...DEFAULT_PREFERENCES, pageSize: 50, density: "compact" };
    render(withProviders(<PreferencesTab />));

    expect(((await screen.findByLabelText("Itens por página")) as HTMLSelectElement).value).toBe("50");
    expect(screen.getByRole("button", { name: "Compacta" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.queryByLabelText("Formato de data")).toBeNull();
  });

  it("filial padrão das preferências vale até o usuário escolher outra", async () => {
    preferencesState = { ...DEFAULT_PREFERENCES, defaultBranchId: "b-2" };
    render(withProviders(<BranchSwitcher />));

    expect(await screen.findByRole("button", { name: "Selecionar filial. Atual: Filial Norte" })).toBeTruthy();
  });

  it("pede confirmação antes de registrar saída quando a preferência está ligada", async () => {
    preferencesState = { ...DEFAULT_PREFERENCES, confirmBeforeExit: true };
    render(withProviders(<NewMovementDrawer open onClose={vi.fn()} initialProductId="p-1" initialBranchId="b-1" />));

    fireEvent.click(await screen.findByRole("button", { name: "Saída" }));
    await vi.waitFor(() => expect(screen.getByRole("button", { name: "Confirmar movimentação" }).hasAttribute("disabled")).toBe(false));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar movimentação" }));

    expect(await screen.findByText("Confirmar saída?")).toBeTruthy();
    expect(vi.mocked(fetch).mock.calls.some(([, init]) => init?.method === "POST")).toBe(false);
  });
});

describe("interface conforme o papel", () => {
  it("mantém os links da navegação nomeados quando a sidebar está recolhida", async () => {
    render(withProviders(<Sidebar collapsed tenantName="Distribuidora Teste" />));

    expect(await screen.findByRole("link", { name: "Dashboard" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Estoque" })).toBeTruthy();
  });

  it("vendedor só registra saída e não vê estorno de alerta", async () => {
    sessionRole = "SALES";
    render(withProviders(<NewMovementDrawer open onClose={vi.fn()} />));

    await vi.waitFor(() => expect(screen.queryByRole("button", { name: "Entrada" })).toBeNull());
    expect(screen.getByRole("button", { name: "Saída" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.queryByRole("button", { name: "Ajuste" })).toBeNull();
  });

  it("estoquista não vê ações de cadastro de produtos", async () => {
    sessionRole = "STOCKIST";
    render(withProviders(<ProdutosPage />));

    await screen.findByText("Heineken Long Neck 330ml");
    expect(screen.queryByRole("button", { name: "Novo produto" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Ações de Heineken Long Neck 330ml" }));
    expect(screen.getByText("Movimentar estoque")).toBeTruthy();
    expect(screen.queryByText("Editar produto")).toBeNull();
  });

  it("menu mostra só os módulos que o papel pode acessar e dados reais do shell", async () => {
    sessionRole = "SALES";
    render(withProviders(<Sidebar collapsed={false} tenantName="Distribuidora Teste" />));

    await screen.findByText("Vendedor");
    expect(screen.getByText("Trial")).toBeTruthy();
    expect(screen.getByText("Trial · 11 dias")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Escolher plano" })).toBeNull();
    expect(screen.queryByRole("link", { name: /Filiais/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /Equipe/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /Assinatura/ })).toBeNull();
    expect(screen.getByRole("link", { name: /Estoque/ })).toBeTruthy();
  });
});

describe("dashboard", () => {
  it("mostra indicadores reais e abre entrada a partir do alerta", async () => {
    render(withProviders(<DashboardPage />));

    expect(await screen.findByText("1.234")).toBeTruthy();
    expect(screen.getByText("−20")).toBeTruthy();
    expect(screen.getByText("1 inativa")).toBeTruthy();
    expect(screen.getByRole("progressbar", { name: "Matriz: 81% do estoque total" })).toBeTruthy();
    expect(await screen.findByRole("heading", { name: /, Ari$/ })).toBeTruthy();

    fireEvent.click(await screen.findByRole("button", { name: "Criar entrada para Corona Extra 330ml em Matriz" }));
    const productInput = (await screen.findByRole("combobox", { name: "Produto" })) as HTMLInputElement;
    await vi.waitFor(() => expect(productInput.value).toBe("Corona Extra 330ml — BEER-002"));
  });
});

describe("nomes e estados acessíveis", () => {
  it("nomeia o controle de exibição da senha", () => {
    render(withProviders(<LoginPage />));

    const toggle = screen.getByRole("button", { name: "Mostrar senha" });
    fireEvent.click(toggle);

    expect(screen.getByRole("button", { name: "Ocultar senha" })).toBeTruthy();
  });

  it("associa o switch à configuração correspondente", () => {
    render(
      <ToggleRow
        title="Alertas de estoque"
        description="Receber alertas por e-mail."
        checked
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("switch", { name: "Alertas de estoque" })).toBeTruthy();
  });

  it("expõe o estado dos controles segmentados", () => {
    render(
      <SegmentedControl
        options={["Entrada", "Saída"] as const}
        value="Entrada"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Entrada" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(screen.getByRole("button", { name: "Saída" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
  });

  it("expõe o estado aberto dos menus de filtro e filial", () => {
    const { rerender } = render(
      <FilterMenu
        label="Status"
        active={false}
        options={[{ label: "Todos" }]}
        selected="Todos"
        onSelect={vi.fn()}
      />,
    );

    const filter = screen.getByRole("button", { name: "Status" });
    expect(filter.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(filter);
    expect(filter.getAttribute("aria-expanded")).toBe("true");

    rerender(withProviders(<BranchSwitcher />));
    expect(screen.getByRole("button", { name: /Selecionar filial/ }).getAttribute("aria-expanded")).toBe(
      "false",
    );
  });

  it("identifica opções pelo valor, não pelo rótulo", () => {
    const onSelect = vi.fn();
    render(
      <FilterMenu
        label="Filial"
        active={false}
        options={[
          { value: "b-1", label: "Centro" },
          { value: "b-2", label: "Centro" },
        ]}
        selected="b-2"
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Filial" }));
    const [first, second] = screen.getAllByRole("menuitemradio");
    expect(first.getAttribute("aria-checked")).toBe("false");
    expect(second.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(first);
    expect(onSelect).toHaveBeenCalledWith("b-1");
  });

  it("nomeia os controles somente com ícone no cabeçalho", () => {
    render(
      withProviders(
        <Header
          tenantName="Distribuidora Silva"
          showMenuButton
          showSearch={false}
          showCrumbTenant={false}
          label="Buscar"
          onToggleNav={vi.fn()}
        />,
      ),
    );

    expect(screen.getByRole("button", { name: "Abrir menu principal" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Notificações" })).toBeTruthy();
  });

  it("exibe o rótulo de busca recebido sem atalho visual", () => {
    const props = {
      tenantName: "Distribuidora Silva",
      showMenuButton: false,
      showSearch: true,
      showCrumbTenant: false,
      onToggleNav: vi.fn(),
      label: "Buscar produtos e movimentações",
    } as Parameters<typeof Header>[0];

    render(withProviders(<Header {...props} />));

    expect(
      screen.getByRole("combobox", { name: "Buscar produtos e movimentações" }),
    ).toBeTruthy();
    expect(screen.queryByText("⌘K")).toBeNull();
  });

  it("busca produtos e abre a listagem filtrada", async () => {
    render(
      withProviders(
        <Header
          tenantName="Distribuidora Silva"
          showMenuButton={false}
          showSearch
          showCrumbTenant={false}
          label="Buscar produtos, SKUs ou movimentações"
          onToggleNav={vi.fn()}
        />,
      ),
    );

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Buscar produtos, SKUs ou movimentações",
      }),
      { target: { value: "hei" } },
    );

    const result = await screen.findByRole("option", {
      name: /Heineken Long Neck 330ml/i,
    });
    fireEvent.click(result);

    expect(router.push).toHaveBeenCalledWith("/produtos?busca=hei");
  });

  it("abre o resultado ativo pelo teclado", async () => {
    render(
      withProviders(
        <Header
          tenantName="Distribuidora Silva"
          showMenuButton={false}
          showSearch
          showCrumbTenant={false}
          label="Buscar produtos, SKUs ou movimentações"
          onToggleNav={vi.fn()}
        />,
      ),
    );

    const input = screen.getByRole("combobox", {
      name: "Buscar produtos, SKUs ou movimentações",
    });
    fireEvent.change(input, { target: { value: "hei" } });
    await screen.findByRole("option", { name: /Heineken Long Neck 330ml/i });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(router.push).toHaveBeenCalledWith("/produtos?busca=hei");
  });

  it("nomeia os campos de busca das listagens", () => {
    const { rerender } = render(withProviders(<ProdutosPage />));
    expect(screen.getByRole("textbox", { name: "Buscar produtos" })).toBeTruthy();

    rerender(withProviders(<EstoquePage />));
    expect(screen.getByRole("textbox", { name: "Buscar estoque" })).toBeTruthy();

    rerender(withProviders(<EquipePage />));
    expect(screen.getByRole("textbox", { name: "Buscar membros" })).toBeTruthy();
  });

  it("inicializa as listagens com a busca recebida na URL", () => {
    route.search = "busca=heineken";
    const { rerender } = render(withProviders(<ProdutosPage />));
    expect((screen.getByRole("textbox", { name: "Buscar produtos" }) as HTMLInputElement).value).toBe("heineken");

    rerender(withProviders(<EstoquePage />));
    expect((screen.getByRole("textbox", { name: "Buscar estoque" }) as HTMLInputElement).value).toBe("heineken");
  });
});
