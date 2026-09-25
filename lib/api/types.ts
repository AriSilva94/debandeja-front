export type RegisterResult = {
  status: "verification_pending";
  email: string;
};

export type DefaultScreen = "dashboard" | "products" | "stock";

export type MyTenant = {
  tenantId: string;
  name: string;
  role: "OWNER" | "ADMIN" | "MANAGER" | "SALES" | "STOCKIST";
  defaultScreen: DefaultScreen;
};

export type OnboardingCompanyResult = {
  tenantId: string;
  trialEndsAt: string | null;
};

export type OnboardingBranchResult = {
  branchId: string;
};

export type PostAuthResult =
  | { ok: true; destination: "onboarding" }
  | { ok: true; destination: "dashboard"; screen: DefaultScreen }
  | { ok: true; destination: "select-tenant"; tenants: MyTenant[] };

export type AcceptInviteResult = PostAuthResult | { status: "verification_required" };

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type Branch = {
  id: string;
  name: string;
  city: string | null;
  uf: string | null;
  responsibleName: string | null;
  isMain: boolean;
  active: boolean;
};

export type BranchInput = {
  name: string;
  city: string;
  uf: string;
  responsibleName?: string;
  active?: boolean;
};

export type StockLevel = "ok" | "low" | "out";

export type ProductUnit = "UN" | "CX" | "PCT" | "FD";

export type ProductTab = "all" | "active" | "inactive" | "alert";

export type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  category: string;
  barcode: string | null;
  unit: ProductUnit;
  price: string;
  minStock: number;
  active: boolean;
  stock: number;
  level: StockLevel;
};

export type ProductList = Paginated<Product> & { counts: Record<ProductTab, number> };

export type ProductInput = {
  sku: string;
  name: string;
  brand?: string;
  category: string;
  barcode?: string;
  unit: ProductUnit;
  price: number;
  minStock: number;
  active: boolean;
  initialStockByBranch?: Record<string, number>;
};

export type StockRow = {
  id: string;
  product: { id: string; name: string; sku: string; minStock: number };
  branch: { id: string; name: string };
  current: number;
  reserved: number;
  available: number;
  minStock: number;
  level: StockLevel;
};

export type StockList = Paginated<StockRow> & {
  kpis: { totalItems: number; lowCount: number; outCount: number; reserved: number };
};

export type MovementType = "ENTRADA" | "SAIDA" | "AJUSTE";

export type Movement = {
  id: string;
  type: MovementType;
  qty: number;
  balanceBefore: number;
  balanceAfter: number;
  note: string | null;
  createdAt: string;
  reversesMovementId: string | null;
  reversedBy: { id: string } | null;
  product: { id: string; name: string; sku: string };
  branch: { id: string; name: string };
  member: { user: { name: string } };
};

export type MovementInput = {
  productId: string;
  branchId: string;
  type: MovementType;
  qty?: number;
  newQuantity?: number;
  note?: string;
};

export type NotificationSettings = {
  dailySummary: boolean;
  inviteAlerts: boolean;
  productNews: boolean;
};

export type Me = {
  id: string;
  name: string;
  email: string;
  pendingEmail: string | null;
  avatarUrl: string | null;
  notificationSettings: NotificationSettings;
};

export type UserSession = {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastAccessAt: string;
  createdAt: string;
  isCurrent: boolean;
};

export type Preferences = {
  defaultBranchId: string | null;
  lowStockEmailAlert: boolean;
  confirmBeforeExit: boolean;
  density: "comfortable" | "compact";
  pageSize: 10 | 20 | 50;
  defaultScreen: DefaultScreen;
};

export type Company = {
  legalName: string;
  tradeName: string | null;
  cnpj: string | null;
  phone: string | null;
  contactEmail: string | null;
  address: string | null;
  city: string | null;
  uf: string | null;
  zip: string | null;
  stateRegistration: string | null;
  taxRegime: string | null;
};

export type BranchStock = {
  id: string;
  name: string;
  city: string | null;
  uf: string | null;
  active: boolean;
  items: number;
  skus: number;
  lowCount: number;
  outCount: number;
  entries: number;
  exits: number;
  adjustments: number;
};

export type RecentMovement = Omit<Movement, "reversedBy">;

export type DashboardSummary = {
  totalProducts: number;
  newProductsInPeriod: number;
  totalStockItems: number;
  stockItemsDeltaInPeriod: number;
  movementsInPeriod: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeBranchesCount: number;
  inactiveBranchesCount: number;
  reservedItems: number;
  byBranch: BranchStock[];
  recentMovements: RecentMovement[];
};

export type StockAlert = {
  product: { id: string; name: string; sku: string };
  branch: { id: string; name: string };
  current: number;
  min: number;
  level: Exclude<StockLevel, "ok">;
};

export type Role = MyTenant["role"];

export type PermissionModule = "branches" | "products" | "stock" | "movements" | "team" | "billing" | "company";

export type SessionContext = {
  tenant: { id: string; name: string };
  role: Role;
  allowedBranchIds: string[] | null;
  preferences: Preferences;
  permissions: Record<PermissionModule, number>;
  subscription: {
    status: SubscriptionStatus;
    readOnly: boolean;
    onTrial: boolean;
    dataPurgeAt: string | null;
    planCode: string;
    planName: string;
    limits: { users: number | null; branches: number | null; products: number | null };
    trialDays: number;
    trialDaysRemaining: number | null;
  } | null;
};

export type TeamMember = {
  id: string;
  role: Role;
  status: "ACTIVE" | "INVITED";
  lastAccessAt: string | null;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  branches: { id: string; name: string }[];
  inviteExpired: boolean;
};

export type RolesMatrix = Record<Role, Record<PermissionModule, number>>;

export type MemberInput = {
  role: Exclude<Role, "OWNER">;
  branchIds?: string[];
};

export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELED";

type PlanLimits = { maxUsers: number | null; maxBranches: number | null; maxProducts: number | null };

export type BillingPlan = PlanLimits & {
  code: string;
  name: string;
  price: string;
  features: string[];
  current: boolean;
};

type Usage = { used: number; limit: number | null };

export type BillingSubscription = {
  status: SubscriptionStatus;
  onTrial: boolean;
  plan: PlanLimits & { code: string; name: string; price: string };
  trialEndsAt: string | null;
  trialDays: number;
  trialDaysRemaining: number | null;
  currentPeriodEnd: string | null;
  dataPurgeAt: string | null;
  usage: { users: Usage; branches: Usage; products: Usage };
};

export type Invoice = {
  id: string;
  issuedAt: string;
  description: string;
  amount: string;
  status: "ISENTO" | "PAGO";
  pdfUrl: string | null;
};

export type BrazilState = { uf: string; name: string };
