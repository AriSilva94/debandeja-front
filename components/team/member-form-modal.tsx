"use client";

import { useState } from "react";
import { UserPlus, UserCog, Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldHint } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { FormError } from "@/components/ui/form-error";
import { cn } from "@/lib/cn";
import { errorMessage } from "@/lib/api/client";
import { useInviteMember, useUpdateMember } from "@/lib/api/hooks/use-team";
import type { TeamMember } from "@/lib/api/types";
import { initials } from "@/lib/avatar";
import { branchLocation, useBranch } from "@/lib/branch-context";
import { INVITABLE_ROLES, ROLE_DESCRIPTION, ROLE_LABEL, type InvitableRole } from "@/lib/roles";

type MemberFormModalProps = {
  open: boolean;
  onClose: () => void;
  member?: TeamMember | null;
};

export function MemberFormModal({ open, onClose, member }: MemberFormModalProps) {
  if (!open) return null;

  return <MemberFormModalContent key={member?.id ?? "invite"} onClose={onClose} member={member} />;
}

function MemberFormModalContent({ onClose, member }: Omit<MemberFormModalProps, "open">) {
  const isEditing = Boolean(member);
  const branches = useBranch().branches.filter((branch) => branch.active);
  const [role, setRole] = useState<InvitableRole>(INVITABLE_ROLES.find((value) => value === member?.role) ?? "STOCKIST");
  const [pickedBranchIds, setPickedBranchIds] = useState<string[]>();
  const [validationError, setValidationError] = useState<string | null>(null);
  const invite = useInviteMember();
  const update = useUpdateMember();
  const mutation = isEditing ? update : invite;

  const selectedBranchIds = pickedBranchIds ?? (member ? member.branches.map((b) => b.id) : branches.slice(0, 1).map((b) => b.id));
  const needsBranches = role !== "ADMIN";

  function toggleBranch(branchId: string) {
    setPickedBranchIds(
      selectedBranchIds.includes(branchId)
        ? selectedBranchIds.filter((id) => id !== branchId)
        : [...selectedBranchIds, branchId],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    if (needsBranches && selectedBranchIds.length === 0) {
      setValidationError("Selecione ao menos uma filial.");
      return;
    }
    const data = { role, ...(needsBranches ? { branchIds: selectedBranchIds } : {}) };
    if (member) {
      update.mutate({ id: member.id, data }, { onSuccess: onClose });
    } else {
      const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
      invite.mutate({ email, ...data }, { onSuccess: onClose });
    }
  }

  const error =
    validationError ??
    (mutation.error ? errorMessage(mutation.error, "Não foi possível salvar. Tente novamente.") : null);

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? "Editar membro" : "Convidar membro"}
      description={
        isEditing
          ? "Ajuste a função e as filiais permitidas."
          : "Enviaremos por e-mail um link de acesso. Quem já tem conta entra direto na equipe."
      }
      icon={isEditing ? UserCog : UserPlus}
      widthClassName="w-120"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="member-form" type="submit" loading={mutation.isPending}>
            {isEditing ? "Salvar alterações" : "Enviar convite"}
          </Button>
        </>
      }
    >
      <form id="member-form" onSubmit={handleSubmit} className="grid gap-4">
        {error ? <FormError>{error}</FormError> : null}

        {member ? (
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <Avatar initials={initials(member.name ?? member.email)} />
            <div>
              <div className="text-sm font-semibold text-gray-900">{member.name ?? "Convite pendente"}</div>
              <div className="text-[12.5px] text-gray-500">{member.email}</div>
            </div>
          </div>
        ) : (
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required placeholder="nome@distribuidora.com.br" />
          </div>
        )}

        <div>
          <Label htmlFor="role">Função</Label>
          <Select id="role" value={role} onChange={(event) => setRole(INVITABLE_ROLES.find((value) => value === event.target.value) ?? role)}>
            {INVITABLE_ROLES.map((value) => (
              <option key={value} value={value}>
                {ROLE_LABEL[value]}
              </option>
            ))}
          </Select>
          <FieldHint>{ROLE_DESCRIPTION[role]}</FieldHint>
        </div>

        <div>
          <Label>Filiais permitidas</Label>
          {needsBranches ? (
            <div className="flex flex-col gap-2">
              {branches.map((branch) => {
                const selected = selectedBranchIds.includes(branch.id);
                const location = branchLocation(branch);
                return (
                  <button
                    key={branch.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleBranch(branch.id)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[10px] border p-2.75 text-left",
                      selected ? "border-brand bg-brand-subtle" : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4.25 w-4.25 shrink-0 items-center justify-center rounded-[5px]",
                        selected ? "bg-brand" : "border border-gray-300 bg-white",
                      )}
                    >
                      {selected ? <Check size={11} strokeWidth={3.2} className="text-white" /> : null}
                    </span>
                    <span className={cn("text-[13.5px]", selected ? "font-medium text-brand" : "text-gray-700")}>
                      {location ? `${branch.name} — ${location}` : branch.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <FieldHint>Administradores acessam todas as filiais.</FieldHint>
          )}
        </div>
      </form>
    </Modal>
  );
}
