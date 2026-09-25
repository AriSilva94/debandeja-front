"use client";

import { useMemo, useState } from "react";
import { UserPlus, UserCog, UserMinus, MailPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterMenu } from "@/components/ui/filter-menu";
import { FormError } from "@/components/ui/form-error";
import { ErrorState, LoadingState } from "@/components/ui/query-state";
import { RowActionsMenu, type RowAction } from "@/components/ui/row-actions-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SearchField } from "@/components/ui/search-field";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { MemberFormModal } from "@/components/team/member-form-modal";
import { errorMessage } from "@/lib/api/client";
import { useMe } from "@/lib/api/hooks/use-me";
import { usePermission, useSessionContext } from "@/lib/api/hooks/use-session";
import { useRemoveMember, useResendInvite, useRolesMatrix, useTeam } from "@/lib/api/hooks/use-team";
import type { PermissionModule, Role, TeamMember } from "@/lib/api/types";
import { avatarToneForIndex, initials } from "@/lib/avatar";
import { formatLastAccess } from "@/lib/format";
import { FULL_ACCESS_ROLES, ROLE_LABEL, ROLE_TONE, permissionLabel } from "@/lib/roles";

const ALL_ROLES = "";
const ROLES: Role[] = ["OWNER", "ADMIN", "MANAGER", "STOCKIST", "SALES"];

const MATRIX_COLUMNS: { module: PermissionModule; label: string }[] = [
  { module: "products", label: "Produtos" },
  { module: "stock", label: "Estoque" },
  { module: "movements", label: "Movimentações" },
  { module: "branches", label: "Filiais" },
  { module: "team", label: "Equipe" },
  { module: "billing", label: "Assinatura" },
];

function memberStatus(member: TeamMember) {
  if (member.status === "ACTIVE") return { tone: "success" as const, label: "Ativo" };
  if (member.inviteExpired) return { tone: "error" as const, label: "Convite expirado" };
  return { tone: "warning" as const, label: "Convite pendente" };
}

function memberBranches(member: TeamMember) {
  if (FULL_ACCESS_ROLES.includes(member.role)) return "Todas as filiais";
  return member.branches.map((b) => b.name).join(", ") || "—";
}

export default function EquipePage() {
  const team = useTeam();
  const matrix = useRolesMatrix();
  const myEmail = useMe().data?.email;
  const seatLimit = useSessionContext().data?.subscription?.limits.users;
  const canManage = usePermission()("team");
  const remove = useRemoveMember();
  const resend = useResendInvite();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(ALL_ROLES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);

  const members = useMemo(() => team.data ?? [], [team.data]);
  const query = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      members.filter(
        (member) =>
          (roleFilter === ALL_ROLES || member.role === roleFilter) &&
          (!query || member.email.toLowerCase().includes(query) || member.name?.toLowerCase().includes(query)),
      ),
    [members, query, roleFilter],
  );

  const selectedRole = ROLES.find((role) => role === roleFilter);
  const actionError = remove.error ?? resend.error;
  const seatsLabel =
    typeof seatLimit === "number"
      ? `${members.length} de ${seatLimit} assentos usados`
      : `${members.length} ${members.length === 1 ? "assento usado" : "assentos usados"}`;

  function openInvite() {
    setEditingMember(null);
    setModalOpen(true);
  }

  function openEdit(member: TeamMember) {
    setEditingMember(member);
    setModalOpen(true);
  }

  function confirmRemove() {
    if (!removeTarget) return;
    remove.mutate(removeTarget.id);
    setRemoveTarget(null);
  }

  function actionsFor(member: TeamMember): RowAction[] {
    const invited = member.status === "INVITED";
    return [
      { label: "Editar membro", icon: UserCog, onClick: () => openEdit(member) },
      ...(invited ? [{ label: "Reenviar convite", icon: MailPlus, onClick: () => resend.mutate(member.id) }] : []),
      {
        label: invited ? "Cancelar convite" : "Remover da equipe",
        icon: UserMinus,
        tone: "destructive" as const,
        onClick: () => setRemoveTarget(member),
      },
    ];
  }

  const removingInvite = removeTarget?.status === "INVITED";

  return (
    <div className="flex flex-col gap-4.5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-semibold tracking-tight text-gray-900">Equipe</h1>
          <p className="text-sm text-gray-500">
            Controle quem acessa cada filial e o que pode fazer.
          </p>
        </div>
        {canManage ? (
          <Button onClick={openInvite}>
            <UserPlus size={15} />
            Convidar membro
          </Button>
        ) : null}
      </div>

      <MemberFormModal open={modalOpen} onClose={() => setModalOpen(false)} member={editingMember} />
      <ConfirmDialog
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        onConfirm={confirmRemove}
        icon={UserMinus}
        tone="destructive"
        title={removingInvite ? "Cancelar convite?" : "Remover membro?"}
        confirmLabel={removingInvite ? "Cancelar convite" : "Remover"}
        description={
          removingInvite ? (
            <>
              O link enviado para <span className="font-medium text-gray-900">{removeTarget?.email}</span>{" "}
              deixa de funcionar e a vaga é liberada.
            </>
          ) : (
            <>
              <span className="font-medium text-gray-900">{removeTarget?.name}</span> perde o acesso
              imediatamente. O histórico de ações realizadas por este usuário é mantido para
              auditoria.
            </>
          )
        }
      />

      {actionError ? (
        <FormError>{errorMessage(actionError, "Não foi possível concluir a ação. Tente novamente.")}</FormError>
      ) : null}
      {resend.isSuccess ? (
        <div role="status" className="rounded-[10px] border border-success-border bg-success-bg px-3 py-2.5 text-[13px] text-success-text">
          Convite reenviado para {resend.data.email}. O link anterior deixou de funcionar.
        </div>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-center gap-2.5 border-b border-gray-200 p-3.5">
          <SearchField label="Buscar membros" value={search} onChange={setSearch} placeholder="Buscar por nome ou e-mail" className="sm:w-70" />
          <FilterMenu
            label={selectedRole ? ROLE_LABEL[selectedRole] : "Função"}
            active={roleFilter !== ALL_ROLES}
            selected={roleFilter}
            onSelect={setRoleFilter}
            options={[
              { value: ALL_ROLES, label: "Todos", sub: String(members.length) },
              ...ROLES.map((role) => ({
                value: role,
                label: ROLE_LABEL[role],
                sub: String(members.filter((m) => m.role === role).length),
              })),
            ]}
          />
          <div className="flex-1" />
          <span className="text-[13px] text-gray-500">{team.data ? seatsLabel : null}</span>
        </div>

        {team.isPending ? (
          <LoadingState title="Carregando equipe" description="Buscando os membros da sua distribuidora." />
        ) : team.isError ? (
          <ErrorState title="Não foi possível carregar a equipe" onRetry={() => team.refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Nenhum membro encontrado"
            description="Ajuste a busca ou o filtro de função."
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHeaderCell>Usuário</TableHeaderCell>
                <TableHeaderCell>Função</TableHeaderCell>
                <TableHeaderCell>Filiais</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Último acesso</TableHeaderCell>
                <TableHeaderCell className="w-14" />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((member, index) => {
                const status = memberStatus(member);
                const manageable = canManage && member.role !== "OWNER" && member.email !== myEmail;
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={initials(member.name ?? member.email)} tone={avatarToneForIndex(index)} />
                        <div>
                          <div className="font-medium text-gray-900">{member.name ?? "Convite pendente"}</div>
                          <div className="mt-0.25 text-xs text-gray-400">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge tone={ROLE_TONE[member.role]}>{ROLE_LABEL[member.role]}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{memberBranches(member)}</TableCell>
                    <TableCell>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {member.status === "ACTIVE" ? formatLastAccess(member.lastAccessAt) : "—"}
                    </TableCell>
                    <TableCell align="right">
                      {manageable ? (
                        <RowActionsMenu label={`Ações de ${member.name ?? member.email}`} actions={actionsFor(member)} />
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card>
        <div className="border-b border-gray-200 px-4.5 py-4">
          <div className="text-[15.5px] font-semibold">Funções e permissões</div>
          <div className="mt-0.5 text-[12.5px] text-gray-400">
            Resumo do que cada função pode fazer nas filiais permitidas.
          </div>
        </div>
        {matrix.data ? (
          <Table>
            <TableHead>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHeaderCell>Função</TableHeaderCell>
                {MATRIX_COLUMNS.map((column) => (
                  <TableHeaderCell key={column.module} align="center">
                    {column.label}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {ROLES.map((role) => (
                <TableRow key={role}>
                  <TableCell>
                    <Badge tone={ROLE_TONE[role]}>{ROLE_LABEL[role]}</Badge>
                  </TableCell>
                  {MATRIX_COLUMNS.map((column) => (
                    <TableCell key={column.module} align="center" className="text-gray-600">
                      {permissionLabel(role, column.module, matrix.data[role][column.module])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : matrix.isError ? (
          <ErrorState title="Não foi possível carregar as permissões" onRetry={() => matrix.refetch()} />
        ) : (
          <LoadingState title="Carregando permissões" description="Buscando o que cada função pode fazer." />
        )}
      </Card>
    </div>
  );
}
