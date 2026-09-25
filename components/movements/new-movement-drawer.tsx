"use client";

import { useState } from "react";
import { Minus, Plus, ArrowRight, PackageMinus } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FormError } from "@/components/ui/form-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { errorMessage } from "@/lib/api/client";
import { useCreateMovement } from "@/lib/api/hooks/use-movements";
import { useStock } from "@/lib/api/hooks/use-stock";
import type { MovementType } from "@/lib/api/types";
import { useBranch } from "@/lib/branch-context";
import { MOVEMENT_TYPE_LABEL } from "@/lib/movements";
import { ProductPicker, type PickedProduct } from "./product-picker";
import { useMovementPermissions, useSessionContext } from "@/lib/api/hooks/use-session";
import { formatNumber } from "@/lib/format";

const ALL_TYPES: MovementType[] = ["ENTRADA", "SAIDA", "AJUSTE"];
const SALES_TYPES: MovementType[] = ["SAIDA"];

const REASONS: Record<MovementType, string[]> = {
  ENTRADA: ["Compra de fornecedor", "Devolução de cliente", "Transferência recebida"],
  SAIDA: ["Venda / pedido", "Transferência enviada", "Avaria ou perda"],
  AJUSTE: ["Contagem cíclica", "Correção de cadastro", "Quebra registrada"],
};

type NewMovementDrawerProps = {
  open: boolean;
  onClose: () => void;
  initialProductId?: string;
  initialBranchId?: string;
};

export function NewMovementDrawer({ open, onClose, initialProductId, initialBranchId }: NewMovementDrawerProps) {
  if (!open) return null;

  return (
    <NewMovementDrawerContent
      key={`${initialProductId ?? ""}-${initialBranchId ?? ""}`}
      onClose={onClose}
      initialProductId={initialProductId}
      initialBranchId={initialBranchId}
    />
  );
}

function NewMovementDrawerContent({
  onClose,
  initialProductId,
  initialBranchId,
}: Omit<NewMovementDrawerProps, "open">) {
  const branches = useBranch().branches.filter((branch) => branch.active);
  const allowedTypes = useMovementPermissions().onlyExits ? SALES_TYPES : ALL_TYPES;
  const typeLabels = allowedTypes.map((t) => MOVEMENT_TYPE_LABEL[t]);

  const [pickedType, setType] = useState<MovementType>("ENTRADA");
  const type = allowedTypes.includes(pickedType) ? pickedType : allowedTypes[0];
  const [pickedProduct, setPickedProduct] = useState<PickedProduct>();
  const [pickedBranchId, setPickedBranchId] = useState(initialBranchId);
  const [quantity, setQuantity] = useState(20);
  const [pickedReason, setReason] = useState<string>();
  const reason = pickedReason && REASONS[type].includes(pickedReason) ? pickedReason : REASONS[type][0];
  const [note, setNote] = useState("");
  const create = useCreateMovement();
  const confirmExits = useSessionContext().data?.preferences.confirmBeforeExit ?? false;
  const [confirmingExit, setConfirmingExit] = useState(false);

  const productId = pickedProduct?.id ?? initialProductId;
  const branchId = pickedBranchId ?? branches[0]?.id;
  const branch = branches.find((b) => b.id === branchId);

  const stock = useStock({ productId, branchId }, Boolean(productId && branchId));
  const stockRow = stock.data?.items[0];
  const product = pickedProduct ?? stockRow?.product;
  const currentStock = stockRow?.current ?? 0;

  const isAdjust = type === "AJUSTE";
  const minQuantity = isAdjust ? 0 : 1;
  const projected = isAdjust ? quantity : Math.max(0, currentStock + (type === "SAIDA" ? -quantity : quantity));

  function changeType(nextType: MovementType) {
    setType(nextType);
    setReason(REASONS[nextType][0]);
    if (nextType === "AJUSTE") setQuantity(currentStock);
    else setQuantity((q) => Math.max(1, q));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (type === "SAIDA" && confirmExits) {
      setConfirmingExit(true);
      return;
    }
    submit();
  }

  function submit() {
    setConfirmingExit(false);
    if (!productId || !branchId) return;
    const trimmedNote = note.trim();
    create.mutate(
      {
        productId,
        branchId,
        type,
        ...(isAdjust ? { newQuantity: quantity } : { qty: quantity }),
        note: trimmedNote ? `${reason} · ${trimmedNote}` : reason,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title="Nova movimentação"
      description="O saldo é atualizado imediatamente e registrado no histórico."
      widthClassName="w-130"
      footer={
        <>
          <span />
          <div className="flex gap-2.5">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              form="new-movement-form"
              type="submit"
              loading={create.isPending}
              disabled={!productId || !branchId}
            >
              Confirmar movimentação
            </Button>
          </div>
        </>
      }
    >
      <form id="new-movement-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {create.error ? (
          <FormError>{errorMessage(create.error, "Não foi possível registrar a movimentação. Tente novamente.")}</FormError>
        ) : null}

        <div>
          <Label>Tipo de movimentação</Label>
          <SegmentedControl
            options={typeLabels}
            value={MOVEMENT_TYPE_LABEL[type]}
            onChange={(label) => changeType(allowedTypes[typeLabels.indexOf(label)])}
          />
        </div>

        <div>
          <Label htmlFor="product">Produto</Label>
          <ProductPicker id="product" value={product} onChange={setPickedProduct} />
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <Label htmlFor="branch">Filial</Label>
            <Select id="branch" value={branchId ?? ""} onChange={(event) => setPickedBranchId(event.target.value)}>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="quantity">{isAdjust ? "Novo saldo" : "Quantidade"}</Label>
            <div className="flex">
              <button
                type="button"
                aria-label="Diminuir quantidade"
                onClick={() => setQuantity((q) => Math.max(minQuantity, q - 1))}
                className="flex h-10.5 w-9.5 items-center justify-center rounded-l-[10px] border border-r-0 border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
              >
                <Minus size={14} />
              </button>
              <input
                id="quantity"
                value={quantity}
                onChange={(event) => setQuantity(Math.max(minQuantity, Math.trunc(Number(event.target.value)) || 0))}
                inputMode="numeric"
                className="h-10.5 flex-1 border border-gray-200 text-center text-sm font-semibold tabular-nums outline-none"
              />
              <button
                type="button"
                aria-label="Aumentar quantidade"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-10.5 w-9.5 items-center justify-center rounded-r-[10px] border border-l-0 border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="reason">Motivo</Label>
          <Select id="reason" value={reason} onChange={(event) => setReason(event.target.value)}>
            {REASONS[type].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </Select>
        </div>

        <div>
          <div className="mb-1.5 flex justify-between text-[13px] font-medium text-gray-700">
            <label htmlFor="movementNote">Observação</label>
            <span className="font-normal text-gray-400">Opcional</span>
          </div>
          <textarea
            id="movementNote"
            name="movementNote"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ex: NF-e 118.402 · Fornecedor Heineken BR"
            className="w-full resize-none rounded-[10px] border border-gray-200 p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-brand focus:ring-[3px] focus:ring-brand/15"
          />
        </div>

        <div className="rounded-[10px] border border-brand-subtle-border bg-brand-subtle p-4">
          <div className="mb-2.5 text-[12.5px] font-semibold text-brand">
            RESUMO DO SALDO — {branch?.name.toUpperCase() ?? "—"}
          </div>
          <div className="flex items-center gap-3.5">
            <div>
              <div className="mb-0.5 text-[12.5px] text-brand/80">Estoque atual</div>
              <div className="text-[22px] font-semibold leading-none text-brand">
                {currentStock} <span className="text-[13px] font-normal">un.</span>
              </div>
            </div>
            <ArrowRight size={20} className="text-brand" />
            <div>
              <div className="mb-0.5 text-[12.5px] text-brand/80">Após alteração</div>
              <div className="text-[22px] font-semibold leading-none text-brand">
                {projected} <span className="text-[13px] font-normal">un.</span>
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="mb-0.5 text-[12.5px] text-brand/80">Mínimo</div>
              <div className="text-sm font-semibold text-brand">{stockRow?.minStock ?? 0} un.</div>
            </div>
          </div>
        </div>
      </form>
      <ConfirmDialog
        open={confirmingExit}
        onClose={() => setConfirmingExit(false)}
        onConfirm={submit}
        icon={PackageMinus}
        title="Confirmar saída?"
        confirmLabel="Registrar saída"
        description={
          <>
            Saída de <span className="font-medium text-gray-900">{formatNumber(quantity)} un.</span> de{" "}
            <span className="font-medium text-gray-900">{product?.name ?? "produto"}</span> em{" "}
            {branch?.name ?? "—"}. O saldo passa para {formatNumber(projected)} un.
          </>
        }
      />
    </Drawer>
  );
}
