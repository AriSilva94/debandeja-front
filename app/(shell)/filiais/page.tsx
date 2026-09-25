"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Building2, Pencil, Ban, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { FormError } from "@/components/ui/form-error";
import { RowActionsMenu, type RowAction } from "@/components/ui/row-actions-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { BranchStockCard } from "@/components/dashboard/branch-stock-card";
import { BranchDrawer } from "@/components/branches/branch-drawer";
import { errorMessage } from "@/lib/api/client";
import { useBranches, useSetBranchActive } from "@/lib/api/hooks/use-branches";
import { useDashboardSummary } from "@/lib/api/hooks/use-dashboard";
import type { Branch, BranchStock } from "@/lib/api/types";
import { initials } from "@/lib/avatar";
import { formatDateTime, formatNumber, formatCount } from "@/lib/format";
import { startOfDaysAgo } from "@/lib/period";
import { usePermission, useSessionContext } from "@/lib/api/hooks/use-session";
import { ErrorState, LoadingState } from "@/components/ui/query-state";

function alertBadge(branch: Branch, stats: BranchStock | undefined) {
  if (!branch.active) return { tone: "neutral" as const, label: "Não operante" };
  if (stats && stats.outCount > 0) return { tone: "error" as const, label: `${stats.outCount} sem estoque` };
  if (stats && stats.lowCount > 0) {
    return { tone: "warning" as const, label: formatCount(stats.lowCount, "baixo", "baixos") };
  }
  return { tone: "success" as const, label: "Sem alertas" };
}

export default function FiliaisPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Branch | null>(null);
  const [todayStart] = useState(() => startOfDaysAgo(0));

  const branches = useBranches();
  const canManage = usePermission()("branches");
  const summary = useDashboardSummary({ dateFrom: todayStart });
  const setActive = useSetBranchActive();

  const list = branches.data ?? [];
  const statsById = new Map((summary.data?.byBranch ?? []).map((b) => [b.id, b]));
  const activeCount = list.filter((b) => b.active).length;
  const subscription = useSessionContext().data?.subscription;
  const limit = subscription?.limits.branches;

  function openCreate() {
    setEditingBranch(null);
    setDrawerOpen(true);
  }

  function openEdit(branch: Branch) {
    setEditingBranch(branch);
    setDrawerOpen(true);
  }

  function confirmDeactivate() {
    if (!deactivateTarget) return;
    setActive.mutate({ id: deactivateTarget.id, active: false });
    setDeactivateTarget(null);
  }

  function actionsFor(branch: Branch): RowAction[] {
    const actions: RowAction[] = [{ label: "Editar filial", icon: Pencil, onClick: () => openEdit(branch) }];
    if (!branch.active) {
      actions.push({
        label: "Reativar",
        icon: RotateCcw,
        onClick: () => setActive.mutate({ id: branch.id, active: true }),
      });
    } else if (!branch.isMain) {
      actions.push({ label: "Desativar", icon: Ban, tone: "destructive", onClick: () => setDeactivateTarget(branch) });
    }
    return actions;
  }

  return (
    <div className="flex flex-col gap-4.5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-semibold tracking-tight text-gray-900">Filiais</h1>
          <p className="text-sm text-gray-500">
            Cada filial mantém seu próprio estoque e responsável.
          </p>
        </div>
        {canManage ? (
          <Button onClick={openCreate}>
            <Plus size={15} />
            Nova filial
          </Button>
        ) : null}
      </div>

      <BranchDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} branch={editingBranch} />
      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={confirmDeactivate}
        icon={Ban}
        tone="destructive"
        title="Desativar filial?"
        confirmLabel="Desativar filial"
        description={
          <>
            <span className="font-medium text-gray-900">{deactivateTarget?.name}</span> deixará de
            receber movimentações e de gerar alertas. O saldo e o histórico são mantidos, e você pode
            reativá-la quando quiser.
          </>
        }
      />

      {setActive.error ? (
        <FormError>{errorMessage(setActive.error, "Não foi possível alterar a filial. Tente novamente.")}</FormError>
      ) : null}

      <Card>
        {branches.isPending ? (
          <LoadingState title="Carregando filiais" description="Buscando as filiais da sua distribuidora." />
        ) : branches.isError ? (
          <ErrorState title="Não foi possível carregar as filiais" onRetry={() => branches.refetch()} />
        ) : (
          <Table>
            <TableHead>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHeaderCell>Filial</TableHeaderCell>
                <TableHeaderCell>Cidade / Estado</TableHeaderCell>
                <TableHeaderCell>Responsável</TableHeaderCell>
                <TableHeaderCell align="right">Produtos</TableHeaderCell>
                <TableHeaderCell align="right">Itens em estoque</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="w-14" />
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((branch) => {
                const stats = statsById.get(branch.id);
                const responsible = branch.responsibleName;
                return (
                  <TableRow key={branch.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-subtle">
                          <Building2 size={16} strokeWidth={1.8} className="text-brand" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{branch.name}</span>
                          {branch.isMain ? <Badge tone="brand">Principal</Badge> : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {[branch.city, branch.uf].filter(Boolean).join(" – ") || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar
                          initials={responsible ? initials(responsible) : "–"}
                          tone={branch.active ? "brand" : "gray"}
                          size="sm"
                        />
                        <span className="text-gray-700">{responsible ?? "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell align="right">{formatCount(stats?.skus ?? 0, "produto", "produtos")}</TableCell>
                    <TableCell align="right" className="font-medium text-gray-900">
                      {formatCount(stats?.items ?? 0, "item", "itens")}
                    </TableCell>
                    <TableCell>
                      <Badge tone={branch.active ? "success" : "neutral"}>{branch.active ? "Ativa" : "Inativa"}</Badge>
                    </TableCell>
                    <TableCell align="right">
                      {canManage ? (
                        <RowActionsMenu label={`Ações de ${branch.name}`} actions={actionsFor(branch)} />
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {branches.data ? (
          <div className="border-t border-gray-200 px-4.5 py-3.25 text-[13px] text-gray-500">
            {formatCount(list.length, "filial", "filiais")} · {formatCount(activeCount, "ativa", "ativas")}
            {subscription && typeof limit === "number"
              ? ` · plano ${subscription.planName} permite até ${formatCount(limit, "filial ativa", "filiais ativas")}`
              : null}
          </div>
        ) : null}
      </Card>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-4">
        <BranchStockCard branches={summary.data?.byBranch ?? []} totalItems={summary.data?.totalStockItems ?? 0} />

        <Card className="flex flex-col">
          <div className="border-b border-gray-200 px-4.5 py-3.5">
            <div className="text-[15.5px] font-semibold">Operação de hoje por filial</div>
            <div className="mt-0.5 text-[12.5px] text-gray-400">
              {summary.data
                ? `${formatCount(summary.data.movementsInPeriod, "movimentação registrada", "movimentações registradas")} até ${formatDateTime(new Date().toISOString()).time}`
                : "Carregando…"}
            </div>
          </div>
          <Table>
            <TableHead>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHeaderCell>Filial</TableHeaderCell>
                <TableHeaderCell align="right">Entradas</TableHeaderCell>
                <TableHeaderCell align="right">Saídas</TableHeaderCell>
                <TableHeaderCell align="right">Ajustes</TableHeaderCell>
                <TableHeaderCell>Alertas</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((branch) => {
                const stats = statsById.get(branch.id);
                const badge = alertBadge(branch, stats);
                const operating = branch.active && stats;
                return (
                  <TableRow key={branch.id}>
                    <TableCell className={operating ? "font-medium text-gray-900" : "text-gray-400"}>
                      {branch.name}
                    </TableCell>
                    <TableCell align="right" className={operating ? "font-semibold text-success-text" : "text-gray-400"}>
                      {operating ? `+${formatNumber(stats.entries)}` : "—"}
                    </TableCell>
                    <TableCell align="right" className={operating ? "font-semibold text-error-text" : "text-gray-400"}>
                      {operating ? (stats.exits < 0 ? `−${formatNumber(-stats.exits)}` : "0") : "—"}
                    </TableCell>
                    <TableCell align="right" className="text-gray-600">
                      {operating ? formatNumber(stats.adjustments) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge tone={badge.tone}>{badge.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="mt-auto flex items-center justify-between gap-3 rounded-b-xl border-t border-gray-200 bg-gray-50 px-4.5 py-3">
            <span className="text-[12.5px] text-gray-500">
              Transferências entre filiais são registradas como saída e entrada.
            </span>
            <Link href="/movimentacoes" className="text-[13px] font-medium text-brand hover:text-brand-dark">
              Ver histórico
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
