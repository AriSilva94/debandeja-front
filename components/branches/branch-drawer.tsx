"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormError } from "@/components/ui/form-error";
import { errorMessage } from "@/lib/api/client";
import { useSaveBranch } from "@/lib/api/hooks/use-branches";
import type { Branch, BranchInput } from "@/lib/api/types";
import { UFS } from "@/lib/br-states";


type BranchDrawerProps = {
  open: boolean;
  onClose: () => void;
  branch?: Branch | null;
};

export function BranchDrawer({ open, onClose, branch }: BranchDrawerProps) {
  if (!open) return null;

  return <BranchDrawerContent key={branch?.id ?? "new"} onClose={onClose} branch={branch} />;
}

function BranchDrawerContent({ onClose, branch }: Omit<BranchDrawerProps, "open">) {
  const isEditing = Boolean(branch);
  const [active, setActive] = useState(branch?.active ?? true);
  const save = useSaveBranch();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) ?? "").trim();
    const input: BranchInput = {
      name: field("name"),
      city: field("city"),
      uf: field("uf"),
      responsibleName: field("responsible") || undefined,
      ...(isEditing && active !== branch?.active ? { active } : {}),
    };
    save.mutate({ id: branch?.id, data: input }, { onSuccess: onClose });
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={isEditing ? "Editar filial" : "Nova filial"}
      description="Cada filial mantém seu próprio estoque e responsável."
      widthClassName="w-110"
      footer={
        <>
          <span />
          <div className="flex gap-2.5">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button form="branch-form" type="submit" loading={save.isPending}>
              {isEditing ? "Salvar alterações" : "Criar filial"}
            </Button>
          </div>
        </>
      }
    >
      <form id="branch-form" onSubmit={handleSubmit} className="grid gap-4">
        {save.error ? (
          <FormError>{errorMessage(save.error, "Não foi possível salvar a filial. Tente novamente.")}</FormError>
        ) : null}
        <div>
          <Label htmlFor="name">Nome da filial</Label>
          <Input id="name" name="name" required minLength={2} defaultValue={branch?.name} placeholder="Filial Leste" />
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-[2fr_1fr]">
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" name="city" required defaultValue={branch?.city ?? undefined} />
          </div>
          <div>
            <Label htmlFor="uf">Estado</Label>
            <Select id="uf" name="uf" defaultValue={branch?.uf ?? "SP"}>
              {UFS.map((uf) => (
                <option key={uf}>{uf}</option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="responsible">Responsável</Label>
          <Input
            id="responsible"
            name="responsible"
            defaultValue={branch?.responsibleName ?? undefined}
            placeholder="Nome do responsável"
          />
        </div>
        {isEditing ? (
          <div className="flex items-center justify-between rounded-[10px] border border-gray-200 p-3.5">
            <div>
              <div className="text-sm font-medium text-gray-900">Filial ativa</div>
              <div className="mt-0.5 text-[12.5px] text-gray-500">
                {branch?.isMain
                  ? "A filial principal não pode ser desativada."
                  : "Filiais inativas não recebem movimentações nem geram alertas."}
              </div>
            </div>
            <Switch
              aria-label="Filial ativa"
              checked={active}
              disabled={branch?.isMain}
              onChange={(event) => setActive(event.target.checked)}
            />
          </div>
        ) : null}
      </form>
    </Drawer>
  );
}
