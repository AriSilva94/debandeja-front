"use client";

import { useCallback, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { FieldError, FieldHint, Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormError } from "@/components/ui/form-error";
import { cn } from "@/lib/cn";
import { errorMessage } from "@/lib/api/client";
import { useCreateProductCategory, useSaveProduct } from "@/lib/api/hooks/use-products";
import type { Product, ProductCategory, ProductInput, ProductUnit } from "@/lib/api/types";
import { useBranch } from "@/lib/branch-context";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CategoryCombobox } from "@/components/products/category-combobox";

const UNITS: Array<{ value: ProductUnit; label: string }> = [
  { value: "UN", label: "Unidade (UN)" },
  { value: "CX", label: "Caixa (CX)" },
  { value: "PCT", label: "Pacote (PCT)" },
  { value: "FD", label: "Fardo (FD)" },
];

type FieldErrors = Partial<
  Record<"productName" | "sku" | "category" | "price" | "minStock", string>
>;

type NewProductDrawerProps = {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  categories: ProductCategory[];
  categoriesLoading?: boolean;
};

export function NewProductDrawer({
  open,
  onClose,
  product,
  categories,
  categoriesLoading,
}: NewProductDrawerProps) {
  if (!open) return null;

  return (
    <NewProductDrawerContent
      key={product?.id ?? "new"}
      onClose={onClose}
      product={product}
      categories={categories}
      categoriesLoading={categoriesLoading}
    />
  );
}

function parsePrice(raw: string) {
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  return Number(normalized);
}

function parseNonNegativeInt(raw: string) {
  const value = Number(raw || 0);
  return Number.isInteger(value) && value >= 0 ? value : null;
}

function formatPriceInput(price: string) {
  return Number(price).toFixed(2).replace(".", ",");
}

function NewProductDrawerContent({
  onClose,
  product,
  categories,
  categoriesLoading,
}: Omit<NewProductDrawerProps, "open">) {
  const isEditing = Boolean(product);
  const branches = useBranch().branches.filter((branch) => branch.active);
  const [active, setActive] = useState(product?.active ?? true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showDetails, setShowDetails] = useState(
    Boolean(product?.brand || product?.barcode),
  );
  const [showInitialStock, setShowInitialStock] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [saved, setSaved] = useState(false);
  const [initialStockError, setInitialStockError] = useState<string | null>(
    null,
  );
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(
    () => categories.find((category) => category.id === product?.categoryId) ?? null,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const save = useSaveProduct();
  const createCategory = useCreateProductCategory();

  const category =
    selectedCategory ??
    categories.find((item) => item.id === product?.categoryId) ??
    null;

  function fieldErrorId(name: keyof FieldErrors) {
    return `${name}-error`;
  }

  const requestClose = useCallback(() => {
    if (hasChanges && !save.isPending) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  }, [hasChanges, onClose, save.isPending, setConfirmDiscard]);

  function validate(data: FormData) {
    const field = (name: string) => String(data.get(name) ?? "").trim();
    const errors: FieldErrors = {};
    if (field("productName").length < 2)
      errors.productName = "Informe um nome com pelo menos 2 caracteres.";
    if (!field("sku")) errors.sku = "Informe o SKU do produto.";
    if (!category) errors.category = "Selecione ou adicione uma categoria.";
    const price = parsePrice(field("price"));
    if (!Number.isFinite(price) || price <= 0)
      errors.price = "Informe um preço de venda maior que zero.";
    const minStock = parseNonNegativeInt(field("minStock"));
    if (minStock === null)
      errors.minStock = "Informe um número inteiro, zero ou maior.";
    return { errors, price, minStock, field };
  }

  function focusFirstError(errors: FieldErrors) {
    const name = Object.keys(errors)[0];
    const field = name ? formRef.current?.elements.namedItem(name) : null;
    if (field instanceof HTMLElement) field.focus();
  }

  function validateField(name: keyof FieldErrors) {
    if (!formRef.current) return;
    const { errors } = validate(new FormData(formRef.current));
    setFieldErrors((current) => {
      const next = { ...current };
      if (errors[name]) next[name] = errors[name];
      else delete next[name];
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const { errors, price, minStock, field } = validate(data);
    setFieldErrors(errors);
    setInitialStockError(null);
    if (Object.keys(errors).length > 0 || minStock === null) {
      focusFirstError(errors);
      return;
    }

    const input: ProductInput = {
      sku: field("sku"),
      name: field("productName"),
      brand: field("brand") || undefined,
      categoryId: category!.id,
      barcode: field("barcode") || undefined,
      unit: UNITS.find((unit) => unit.value === field("unit"))?.value ?? "UN",
      price,
      minStock,
      active,
    };

    if (!isEditing) {
      const initialStockByBranch: Record<string, number> = {};
      for (const branch of branches) {
        const quantity = parseNonNegativeInt(field(`stock-${branch.id}`));
        if (quantity === null) {
          setShowInitialStock(true);
          setInitialStockError(
            `O estoque inicial da filial ${branch.name} deve ser um número inteiro, zero ou maior.`,
          );
          const stockField = formRef.current?.elements.namedItem(
            `stock-${branch.id}`,
          );
          if (stockField instanceof HTMLElement) stockField.focus();
          return;
        }
        if (quantity > 0) initialStockByBranch[branch.id] = quantity;
      }
      input.initialStockByBranch = initialStockByBranch;
    }

    save.mutate(
      { id: product?.id, data: input },
      { onSuccess: () => setSaved(true) },
    );
  }

  const error = save.error
    ? errorMessage(
        save.error,
        "Não foi possível salvar o produto. Tente novamente.",
      )
    : null;

  function resetForNextProduct() {
    formRef.current?.reset();
    setActive(true);
    setFieldErrors({});
    setInitialStockError(null);
    setShowDetails(false);
    setShowInitialStock(false);
    setHasChanges(false);
    setSaved(false);
    setSelectedCategory(null);
    setCategoryError(null);
  }

  function handleCategoryChange(category: ProductCategory) {
    setSelectedCategory(category);
    setCategoryError(null);
    setFieldErrors((current) => ({ ...current, category: undefined }));
    setHasChanges(true);
  }

  function handleCreateCategory(name: string) {
    setCategoryError(null);
    createCategory.mutate(name, {
      onSuccess: handleCategoryChange,
      onError: (createError) =>
        setCategoryError(errorMessage(createError, "Não foi possível adicionar a categoria. Tente novamente.")),
    });
  }

  return (
    <Drawer
      open
      onClose={requestClose}
      title={isEditing ? "Editar produto" : "Novo produto"}
      description={
        isEditing
          ? "Atualize os dados do item."
          : "Cadastre o item e defina o estoque mínimo padrão."
      }
      widthClassName="w-140"
      footer={
        saved ? undefined : (
          <>
            <span className="text-[12.5px] text-gray-400">
              Você poderá editar tudo depois.
            </span>
            <div className="flex gap-2.5">
              <Button variant="secondary" onClick={requestClose}>
                Cancelar
              </Button>
              <Button
                form="new-product-form"
                type="submit"
                loading={save.isPending}
              >
                {isEditing ? "Salvar alterações" : "Salvar produto"}
              </Button>
            </div>
          </>
        )
      }
    >
      {saved ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <CheckCircle2 size={32} className="text-success" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-gray-900">
            {isEditing ? "Alterações salvas" : "Produto cadastrado"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isEditing
              ? "Os dados do produto foram atualizados."
              : "O item já está disponível no catálogo."}
          </p>
          <div className="mt-5 flex gap-2.5">
            {!isEditing ? (
              <Button variant="secondary" onClick={resetForNextProduct}>
                Cadastrar outro
              </Button>
            ) : null}
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </div>
      ) : (
        <form
          ref={formRef}
          id="new-product-form"
          noValidate
          onSubmit={handleSubmit}
          onChange={() => setHasChanges(true)}
          onBlur={(event) => {
            const name = event.target.getAttribute("name");
            if (
              name === "productName" ||
              name === "sku" ||
              name === "category" ||
              name === "price" ||
              name === "minStock"
            )
              validateField(name);
          }}
          className="flex flex-col gap-5"
        >
          {error ? <FormError>{error}</FormError> : null}

          <div>
            <div className="mb-3.5 text-[11.5px] font-semibold tracking-wide text-gray-400">
              IDENTIFICAÇÃO
            </div>
            <Label htmlFor="productName">Nome do produto</Label>
            <Input
              id="productName"
              name="productName"
              required
              error={Boolean(fieldErrors.productName)}
              aria-invalid={Boolean(fieldErrors.productName)}
              aria-describedby={
                fieldErrors.productName
                  ? fieldErrorId("productName")
                  : undefined
              }
              defaultValue={product?.name}
              placeholder="Heineken Long Neck 330ml"
            />
            {fieldErrors.productName ? (
              <FieldError>
                <span id={fieldErrorId("productName")}>
                  {fieldErrors.productName}
                </span>
              </FieldError>
            ) : null}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  required
                  error={Boolean(fieldErrors.sku)}
                  aria-invalid={Boolean(fieldErrors.sku)}
                  aria-describedby={
                    fieldErrors.sku ? fieldErrorId("sku") : undefined
                  }
                  className="tabular-nums"
                  defaultValue={product?.sku}
                  placeholder="BEER-001"
                />
                {fieldErrors.sku ? (
                  <FieldError>
                    <span id={fieldErrorId("sku")}>{fieldErrors.sku}</span>
                  </FieldError>
                ) : null}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-5">
            <div className="mb-3.5 text-[11.5px] font-semibold tracking-wide text-gray-400">
              CLASSIFICAÇÃO
            </div>
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <CategoryCombobox
                  id="category"
                  categories={categories}
                  value={category}
                  loading={categoriesLoading}
                  creating={createCategory.isPending}
                  error={Boolean(fieldErrors.category)}
                  describedBy={
                    fieldErrors.category ? fieldErrorId("category") : undefined
                  }
                  onChange={handleCategoryChange}
                  onCreate={handleCreateCategory}
                />
                {fieldErrors.category ? (
                  <FieldError>
                    <span id={fieldErrorId("category")}>
                      {fieldErrors.category}
                    </span>
                  </FieldError>
                ) : null}
                {categoryError ? <FieldError>{categoryError}</FieldError> : null}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="unit">Unidade</Label>
                <Select
                  id="unit"
                  name="unit"
                  defaultValue={product?.unit ?? "UN"}
                >
                  {UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="price">Preço de venda</Label>
                <Input
                  id="price"
                  name="price"
                  required
                  error={Boolean(fieldErrors.price)}
                  aria-invalid={Boolean(fieldErrors.price)}
                  aria-describedby={
                    fieldErrors.price ? fieldErrorId("price") : undefined
                  }
                  inputMode="decimal"
                  defaultValue={
                    product ? formatPriceInput(product.price) : undefined
                  }
                  placeholder="0,00"
                />
                {fieldErrors.price ? (
                  <FieldError>
                    <span id={fieldErrorId("price")}>{fieldErrors.price}</span>
                  </FieldError>
                ) : null}
              </div>
              <div>
                <Label htmlFor="minStock">Estoque mínimo</Label>
                <Input
                  id="minStock"
                  name="minStock"
                  error={Boolean(fieldErrors.minStock)}
                  aria-invalid={Boolean(fieldErrors.minStock)}
                  aria-describedby={
                    fieldErrors.minStock ? fieldErrorId("minStock") : undefined
                  }
                  inputMode="numeric"
                  className="tabular-nums"
                  defaultValue={product?.minStock}
                  placeholder="50"
                />
                {fieldErrors.minStock ? (
                  <FieldError>
                    <span id={fieldErrorId("minStock")}>
                      {fieldErrors.minStock}
                    </span>
                  </FieldError>
                ) : (
                  <FieldHint>
                    Gera alerta quando o saldo total ficar abaixo deste valor.
                    Zero não gera alerta.
                  </FieldHint>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-5">
            <div className="mb-3.5 text-[11.5px] font-semibold tracking-wide text-gray-400">
              DISPONIBILIDADE
            </div>
            <div className="flex items-center justify-between rounded-[10px] border border-gray-200 p-3.5">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Produto ativo
                </div>
                <div className="mt-0.5 text-[12.5px] text-gray-500">
                  Disponível para saídas e pedidos.
                </div>
              </div>
              <Switch
                aria-label="Produto ativo"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
              />
            </div>
            {!isEditing && branches.length > 0 ? (
              <div className="mt-3">
                <button
                  type="button"
                  aria-expanded={showInitialStock}
                  onClick={() => setShowInitialStock((value) => !value)}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-brand hover:text-brand-dark"
                >
                  {showInitialStock
                    ? "Ocultar estoque inicial"
                    : "Adicionar estoque inicial"}
                  {showInitialStock ? (
                    <ChevronUp size={15} aria-hidden="true" />
                  ) : (
                    <ChevronDown size={15} aria-hidden="true" />
                  )}
                </button>
                <p className="mt-1 text-xs text-gray-500">
                  Informe apenas as filiais que já receberão este produto.
                </p>
              </div>
            ) : null}
            {!isEditing && showInitialStock && branches.length > 0 ? (
              <div className="overflow-hidden rounded-[10px] border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-3.5 py-2.25 text-[12.5px] font-semibold text-gray-600">
                  Estoque inicial por filial
                </div>
                {branches.map((branch, index) => (
                  <div
                    key={branch.id}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-3",
                      index < branches.length - 1 && "border-b border-gray-100",
                    )}
                  >
                    <span className="text-[13.5px] text-gray-700">
                      {branch.name}
                    </span>
                    <Input
                      name={`stock-${branch.id}`}
                      aria-label={`Estoque inicial da filial ${branch.name}`}
                      defaultValue={0}
                      inputMode="numeric"
                      className="h-8.5 w-24 text-right"
                    />
                  </div>
                ))}
              </div>
            ) : null}
            {initialStockError ? (
              <FieldError>{initialStockError}</FieldError>
            ) : null}
            <div className="border-t border-gray-200 pt-5">
              <button
                type="button"
                aria-expanded={showDetails}
                onClick={() => setShowDetails((value) => !value)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-brand hover:text-brand-dark"
              >
                {showDetails ? "Ocultar detalhes" : "Adicionar mais detalhes"}
                {showDetails ? (
                  <ChevronUp size={15} aria-hidden="true" />
                ) : (
                  <ChevronDown size={15} aria-hidden="true" />
                )}
              </button>
              {showDetails ? (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="brand">Marca</Label>
                    <Input
                      id="brand"
                      name="brand"
                      defaultValue={product?.brand ?? undefined}
                      placeholder="Heineken"
                    />
                  </div>
                  <div>
                    <Label htmlFor="barcode">Código de barras</Label>
                    <Input
                      id="barcode"
                      name="barcode"
                      inputMode="numeric"
                      className="tabular-nums"
                      defaultValue={product?.barcode ?? undefined}
                      placeholder="7896045504054"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </form>
      )}
      <ConfirmDialog
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        onConfirm={onClose}
        icon={CheckCircle2}
        title="Descartar alterações?"
        description="As informações preenchidas neste cadastro serão perdidas."
        confirmLabel="Descartar"
        tone="destructive"
      />
    </Drawer>
  );
}
