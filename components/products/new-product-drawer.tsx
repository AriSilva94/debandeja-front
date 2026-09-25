"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormError } from "@/components/ui/form-error";
import { cn } from "@/lib/cn";
import { errorMessage } from "@/lib/api/client";
import { useSaveProduct } from "@/lib/api/hooks/use-products";
import type { Product, ProductInput, ProductUnit } from "@/lib/api/types";
import { useBranch } from "@/lib/branch-context";

const UNITS: ProductUnit[] = ["UN", "CX", "PCT", "FD"];

type NewProductDrawerProps = {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  categories: string[];
};

export function NewProductDrawer({ open, onClose, product, categories }: NewProductDrawerProps) {
  if (!open) return null;

  return (
    <NewProductDrawerContent
      key={product?.id ?? "new"}
      onClose={onClose}
      product={product}
      categories={categories}
    />
  );
}

function parsePrice(raw: string) {
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
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
}: Omit<NewProductDrawerProps, "open">) {
  const isEditing = Boolean(product);
  const branches = useBranch().branches.filter((branch) => branch.active);
  const [active, setActive] = useState(product?.active ?? true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const save = useSaveProduct();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) ?? "").trim();

    const price = parsePrice(field("price"));
    if (!Number.isFinite(price) || price <= 0) {
      setValidationError("Informe um preço de venda maior que zero.");
      return;
    }
    const minStock = parseNonNegativeInt(field("minStock"));
    if (minStock === null) {
      setValidationError("O estoque mínimo deve ser um número inteiro, zero ou maior.");
      return;
    }

    const input: ProductInput = {
      sku: field("sku"),
      name: field("productName"),
      brand: field("brand") || undefined,
      category: field("category"),
      barcode: field("barcode") || undefined,
      unit: UNITS.find((unit) => unit === field("unit")) ?? "UN",
      price,
      minStock,
      active,
    };

    if (!isEditing) {
      const initialStockByBranch: Record<string, number> = {};
      for (const branch of branches) {
        const quantity = parseNonNegativeInt(field(`stock-${branch.id}`));
        if (quantity === null) {
          setValidationError(`O estoque inicial da filial ${branch.name} deve ser um número inteiro, zero ou maior.`);
          return;
        }
        if (quantity > 0) initialStockByBranch[branch.id] = quantity;
      }
      input.initialStockByBranch = initialStockByBranch;
    }

    save.mutate({ id: product?.id, data: input }, { onSuccess: onClose });
  }

  const error = validationError ?? (save.error ? errorMessage(save.error, "Não foi possível salvar o produto. Tente novamente.") : null);

  return (
    <Drawer
      open
      onClose={onClose}
      title={isEditing ? "Editar produto" : "Novo produto"}
      description="Cadastre o item e defina o estoque mínimo por filial."
      widthClassName="w-140"
      footer={
        <>
          <span className="text-[12.5px] text-gray-400">Você poderá editar tudo depois.</span>
          <div className="flex gap-2.5">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button form="new-product-form" type="submit" loading={save.isPending}>
              {isEditing ? "Salvar alterações" : "Salvar produto"}
            </Button>
          </div>
        </>
      }
    >
      <form id="new-product-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error ? <FormError>{error}</FormError> : null}

        <div>
          <div className="mb-3.5 text-[11.5px] font-semibold tracking-wide text-gray-400">
            IDENTIFICAÇÃO
          </div>
          <div className="flex flex-col gap-3.5 sm:flex-row">
            <button
              type="button"
              className="flex h-21 w-21 shrink-0 flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed border-gray-300 bg-gray-50 hover:border-brand"
            >
              <ImagePlus size={18} className="text-gray-400" />
              <span className="font-mono text-[10.5px] text-gray-400">imagem</span>
            </button>
            <div className="flex-1">
              <Label htmlFor="productName">Nome do produto</Label>
              <Input
                id="productName"
                name="productName"
                required
                minLength={2}
                className="mb-3"
                defaultValue={product?.name}
                placeholder="Heineken Long Neck 330ml"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    name="sku"
                    required
                    className="tabular-nums"
                    defaultValue={product?.sku}
                    placeholder="BEER-001"
                  />
                </div>
                <div>
                  <Label htmlFor="barcode">Código de barras</Label>
                  <Input
                    id="barcode"
                    name="barcode"
                    className="tabular-nums"
                    defaultValue={product?.barcode ?? undefined}
                    placeholder="7896045504054"
                  />
                </div>
              </div>
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
              <Input
                id="category"
                name="category"
                required
                minLength={2}
                list="product-categories"
                defaultValue={product?.category}
                placeholder="Cervejas"
              />
              <datalist id="product-categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" name="brand" defaultValue={product?.brand ?? undefined} placeholder="Heineken" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="unit">Unidade</Label>
              <Select id="unit" name="unit" defaultValue={product?.unit ?? "UN"}>
                {UNITS.map((unit) => (
                  <option key={unit}>{unit}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Preço de venda</Label>
              <Input
                id="price"
                name="price"
                required
                inputMode="decimal"
                defaultValue={product ? formatPriceInput(product.price) : undefined}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="minStock">Estoque mínimo</Label>
              <Input
                id="minStock"
                name="minStock"
                inputMode="numeric"
                className="tabular-nums"
                defaultValue={product?.minStock}
                placeholder="50"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-5">
          <div className="mb-3.5 text-[11.5px] font-semibold tracking-wide text-gray-400">
            DISPONIBILIDADE
          </div>
          <div className="mb-3 flex items-center justify-between rounded-[10px] border border-gray-200 p-3.5">
            <div>
              <div className="text-sm font-medium text-gray-900">Produto ativo</div>
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
                  <span className="text-[13.5px] text-gray-700">{branch.name}</span>
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
        </div>
      </form>
    </Drawer>
  );
}
