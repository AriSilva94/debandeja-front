"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useBranches } from "@/lib/api/hooks/use-branches";
import { useSessionContext } from "@/lib/api/hooks/use-session";
import type { Branch } from "@/lib/api/types";

export const ALL_BRANCHES_LABEL = "Todas as filiais";
export const ALL_BRANCHES_VALUE = "";

export type BranchOption = { value: string; label: string; sub: string };

type BranchContextValue = {
  branchId: string | undefined;
  branchLabel: string;
  setBranchId: (value: string) => void;
  isAllBranches: boolean;
  branches: Branch[];
  options: BranchOption[];
};

const BranchContext = createContext<BranchContextValue | null>(null);

export function branchLocation(branch: Pick<Branch, "city" | "uf">) {
  return [branch.city, branch.uf].filter(Boolean).join("/");
}

export function branchFilterOptions(branches: Branch[]) {
  return [
    { value: ALL_BRANCHES_VALUE, label: ALL_BRANCHES_LABEL },
    ...branches.map((b) => ({ value: b.id, label: b.name })),
  ];
}

export function BranchProvider({ children }: { children: ReactNode }) {
  const [pickedId, setPickedId] = useState<string>();
  const defaultBranchId = useSessionContext().data?.preferences.defaultBranchId;
  const selectedId = pickedId ?? defaultBranchId ?? ALL_BRANCHES_VALUE;
  const { data: branches = [] } = useBranches();

  const value = useMemo<BranchContextValue>(() => {
    const selected = branches.find((b) => b.id === selectedId);
    return {
      branchId: selected?.id,
      branchLabel: selected?.name ?? ALL_BRANCHES_LABEL,
      setBranchId: setPickedId,
      isAllBranches: !selected,
      branches,
      options: [
        { value: ALL_BRANCHES_VALUE, label: ALL_BRANCHES_LABEL, sub: `${branches.length} filiais` },
        ...branches.map((b) => ({ value: b.id, label: b.name, sub: branchLocation(b) })),
      ],
    };
  }, [selectedId, branches]);

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (!context) throw new Error("useBranch must be used within a BranchProvider");
  return context;
}
