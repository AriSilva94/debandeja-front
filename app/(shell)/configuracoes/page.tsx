"use client";

import { use, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { SettingsNav, SETTINGS_TABS, type SettingsTab } from "@/components/settings/settings-nav";
import { CompanyTab } from "@/components/settings/company-tab";
import { AccountTab } from "@/components/settings/account-tab";
import { SecurityTab } from "@/components/settings/security-tab";
import { PreferencesTab } from "@/components/settings/preferences-tab";

const TAB_CONTENT: Record<SettingsTab, ComponentType> = {
  Empresa: CompanyTab,
  Conta: AccountTab,
  Segurança: SecurityTab,
  Preferências: PreferencesTab,
};

const TAB_PARAM: Record<SettingsTab, string> = {
  Empresa: "empresa",
  Conta: "conta",
  Segurança: "seguranca",
  Preferências: "preferencias",
};

type PageProps = { searchParams: Promise<{ aba?: string | string[] }> };

export default function ConfiguracoesPage({ searchParams }: PageProps) {
  const router = useRouter();
  const { aba } = use(searchParams);
  const tab = SETTINGS_TABS.find((t) => TAB_PARAM[t] === aba) ?? SETTINGS_TABS[0];
  const ActiveTab = TAB_CONTENT[tab];

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-gray-900">Configurações</h1>
      <p className="mb-4.5 text-sm text-gray-500">
        Dados da empresa, sua conta e preferências de operação.
      </p>

      <div className="grid grid-cols-[232px_minmax(0,1fr)] items-start gap-4 max-[820px]:grid-cols-1">
        <SettingsNav value={tab} onChange={(next) => router.replace(`/configuracoes?aba=${TAB_PARAM[next]}`)} />
        <ActiveTab />
      </div>
    </div>
  );
}
