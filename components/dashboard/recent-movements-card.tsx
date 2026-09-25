import Link from "next/link";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { MovementTypeBadge } from "@/components/movements/movement-type-badge";
import { ResponsibleCell } from "@/components/movements/responsible-cell";
import { ProductCell } from "@/components/products/product-cell";
import type { RecentMovement } from "@/lib/api/types";
import { formatDateTime, formatNumber, formatSigned } from "@/lib/format";

function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

type RecentMovementsCardProps = {
  movements: RecentMovement[];
  totalCount: number;
  periodLabel: string;
  onNewMovement?: () => void;
};

export function RecentMovementsCard({
  movements,
  totalCount,
  periodLabel,
  onNewMovement,
}: RecentMovementsCardProps) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-gray-200 px-4.5 py-3.5">
        <div>
          <div className="text-[15.5px] font-semibold">Movimentações recentes</div>
          <div className="mt-0.5 text-[12.5px] text-gray-400">
            Últimas {movements.length} · {formatNumber(totalCount)} movimentações · {periodLabel.toLowerCase()}
          </div>
        </div>
        <div className="flex gap-2">
          {onNewMovement ? (
            <button
              type="button"
              onClick={onNewMovement}
              className="flex h-8.5 items-center gap-1.5 rounded-[10px] border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus size={14} className="text-gray-600" />
              Nova movimentação
            </button>
          ) : null}
          <Link
            href="/movimentacoes"
            className="flex h-8.5 items-center rounded-[10px] border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
          >
            Ver histórico
          </Link>
        </div>
      </div>
      <Table>
        <TableHead>
          <TableRow className="border-0 hover:bg-transparent">
            <TableHeaderCell>Tipo</TableHeaderCell>
            <TableHeaderCell>Produto</TableHeaderCell>
            <TableHeaderCell>Filial</TableHeaderCell>
            <TableHeaderCell align="right">Quantidade</TableHeaderCell>
            <TableHeaderCell>Responsável</TableHeaderCell>
            <TableHeaderCell align="right">Horário</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movements.map((movement, index) => {
            const { date, time } = formatDateTime(movement.createdAt);
            const responsible = movement.member.user.name;
            return (
              <TableRow key={movement.id}>
                <TableCell>
                  <MovementTypeBadge movement={movement} />
                </TableCell>
                <TableCell>
                  <ProductCell name={movement.product.name} sku={movement.product.sku} />
                </TableCell>
                <TableCell className="text-gray-600">{movement.branch.name}</TableCell>
                <TableCell align="right" className="font-semibold text-gray-900">
                  {formatSigned(movement.qty)}
                </TableCell>
                <TableCell>
                  <ResponsibleCell name={responsible} index={index} />
                </TableCell>
                <TableCell align="right" className="text-gray-500 tabular-nums">
                  {isToday(movement.createdAt) ? time : `${date.slice(0, 5)} ${time}`}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
