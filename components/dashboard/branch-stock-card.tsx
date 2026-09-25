import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { BranchStock } from "@/lib/api/types";
import { branchLocation } from "@/lib/branch-context";
import { formatNumber } from "@/lib/format";

type BranchStockCardProps = {
  branches: BranchStock[];
  totalItems: number;
};

const PROGRESS_VALUE_CLASSES = [
  "[&::-webkit-progress-value]:bg-brand [&::-moz-progress-bar]:bg-brand",
  "[&::-webkit-progress-value]:bg-accent [&::-moz-progress-bar]:bg-accent",
  "[&::-webkit-progress-value]:bg-gray-400 [&::-moz-progress-bar]:bg-gray-400",
];

export function BranchStockCard({ branches, totalItems }: BranchStockCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <div className="text-[15.5px] font-semibold">Estoque por filial</div>
          <div className="mt-0.5 text-[12.5px] font-normal text-gray-400">
            {formatNumber(totalItems)} itens no total
          </div>
        </div>
        <Link href="/estoque" className="text-[13px] font-medium text-brand hover:text-brand-dark">
          Ver estoque
        </Link>
      </CardHeader>
      <CardBody className="flex flex-col gap-4.5">
        {branches.map((branch, index) => {
          const pct = totalItems === 0 ? 0 : Math.round((branch.items / totalItems) * 100);
          return (
            <div key={branch.id}>
              <div className="mb-1.75 flex items-baseline justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{branch.name}</span>
                  <span className="text-xs text-gray-400">{branchLocation(branch)}</span>
                  {branch.active ? null : <Badge tone="neutral">inativa</Badge>}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatNumber(branch.items)}
                  </span>
                  <span className="text-xs text-gray-400">{pct}%</span>
                </div>
              </div>
              <progress
                value={pct}
                max={100}
                aria-label={`${branch.name}: ${pct}% do estoque total`}
                className={cn(
                  "h-2 w-full overflow-hidden rounded-sm [&::-webkit-progress-bar]:bg-gray-100 [&::-webkit-progress-bar]:rounded-sm [&::-webkit-progress-value]:rounded-sm [&::-moz-progress-bar]:rounded-sm",
                  PROGRESS_VALUE_CLASSES[index % PROGRESS_VALUE_CLASSES.length],
                )}
              />
              <div className="mt-1.75 flex gap-3.5 text-xs text-gray-500">
                <span>
                  {formatNumber(branch.skus)} {branch.skus === 1 ? "SKU" : "SKUs"}
                </span>
                {branch.active ? (
                  <span className="text-warning-text">{branch.lowCount} em estoque baixo</span>
                ) : null}
                {branch.outCount > 0 ? (
                  <span className="text-error-text">{branch.outCount} sem estoque</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
