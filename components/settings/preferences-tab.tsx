"use client";

import { useState, type FormEvent } from "react";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label, FieldHint } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FormError } from "@/components/ui/form-error";
import { ErrorState, LoadingState } from "@/components/ui/query-state";
import { ToggleRow } from "@/components/settings/toggle-row";
import { errorMessage } from "@/lib/api/client";
import { useUpdatePreferences } from "@/lib/api/hooks/use-account";
import { useSessionContext } from "@/lib/api/hooks/use-session";
import type { DefaultScreen, Preferences } from "@/lib/api/types";
import { ALL_BRANCHES_LABEL, ALL_BRANCHES_VALUE, branchLocation, useBranch } from "@/lib/branch-context";

const DENSITY_LABEL: Record<Preferences["density"], string> = { comfortable: "Confortável", compact: "Compacta" };
const DENSITY_OPTIONS = Object.values(DENSITY_LABEL);
const PAGE_SIZES: Preferences["pageSize"][] = [10, 20, 50];
const SCREENS: DefaultScreen[] = ["dashboard", "products", "stock"];
const SCREEN_LABEL: Record<DefaultScreen, string> = { dashboard: "Dashboard", products: "Produtos", stock: "Estoque" };

export function PreferencesTab() {
  const context = useSessionContext();

  if (context.isPending) {
    return (
      <Card>
        <LoadingState title="Carregando preferências" description="Buscando seus ajustes." />
      </Card>
    );
  }
  if (context.isError) {
    return (
      <Card>
        <ErrorState title="Não foi possível carregar as preferências" onRetry={() => context.refetch()} />
      </Card>
    );
  }
  return <PreferencesForm initial={context.data.preferences} />;
}

function PreferencesForm({ initial }: { initial: Preferences }) {
  const branches = useBranch().branches.filter((branch) => branch.active);
  const update = useUpdatePreferences();
  const [preferences, setPreferences] = useState(initial);

  function set<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    update.reset();
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update.mutate(preferences);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-col items-start gap-0.5">
          <span className="text-[17px]">Preferências</span>
          <span className="text-[13px] font-normal text-gray-500">Comportamento padrão do sistema para você.</span>
        </CardHeader>
        <CardBody className="grid max-w-155 gap-4.5">
          {update.isError ? (
            <FormError>{errorMessage(update.error, "Não foi possível salvar. Tente novamente.")}</FormError>
          ) : null}
          <div>
            <Label htmlFor="defaultBranch">Filial padrão</Label>
            <Select
              id="defaultBranch"
              value={preferences.defaultBranchId ?? ALL_BRANCHES_VALUE}
              onChange={(event) => set("defaultBranchId", event.target.value || null)}
            >
              <option value={ALL_BRANCHES_VALUE}>{ALL_BRANCHES_LABEL}</option>
              {branches.map((branch) => {
                const location = branchLocation(branch);
                return (
                  <option key={branch.id} value={branch.id}>
                    {location ? `${branch.name} — ${location}` : branch.name}
                  </option>
                );
              })}
            </Select>
            <FieldHint>Filial selecionada automaticamente ao entrar no sistema.</FieldHint>
          </div>
          <div>
            <ToggleRow
              title="Alertas de estoque baixo por e-mail"
              description="Resumo diário às 08:00 das filiais que você acessa."
              checked={preferences.lowStockEmailAlert}
              onChange={(checked) => set("lowStockEmailAlert", checked)}
            />
            <ToggleRow
              title="Confirmar antes de registrar saída"
              description="Exibe modal de confirmação em cada saída de estoque."
              checked={preferences.confirmBeforeExit}
              onChange={(checked) => set("confirmBeforeExit", checked)}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex flex-col items-start gap-0.5">
          <span>Exibição e operação</span>
          <span className="text-[12.5px] font-normal text-gray-500">Ajustes que valem apenas para o seu usuário.</span>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Densidade da tabela</Label>
            <SegmentedControl
              options={DENSITY_OPTIONS}
              value={DENSITY_LABEL[preferences.density]}
              onChange={(label) =>
                set("density", label === DENSITY_LABEL.compact ? "compact" : "comfortable")
              }
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label htmlFor="pageSize">Itens por página</Label>
            <Select
              id="pageSize"
              value={preferences.pageSize}
              onChange={(event) =>
                set("pageSize", PAGE_SIZES.find((size) => size === Number(event.target.value)) ?? preferences.pageSize)
              }
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} registros
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="homeScreen">Tela inicial</Label>
            <Select
              id="homeScreen"
              value={preferences.defaultScreen}
              onChange={(event) => {
                const screen = SCREENS.find((s) => s === event.target.value);
                if (screen) set("defaultScreen", screen);
              }}
            >
              {SCREENS.map((screen) => (
                <option key={screen} value={screen}>
                  {SCREEN_LABEL[screen]}
                </option>
              ))}
            </Select>
            <FieldHint>Tela aberta ao entrar no sistema.</FieldHint>
          </div>
        </CardBody>
        <CardFooter className="flex items-center justify-end gap-2.5 py-3.5">
          {update.isSuccess ? (
            <span role="status" className="mr-auto text-[13px] text-success-text">
              Preferências salvas.
            </span>
          ) : null}
          <Button type="submit" loading={update.isPending}>
            Salvar preferências
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
