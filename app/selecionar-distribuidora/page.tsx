"use client";

import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";
import { useMyTenants, useSelectTenant } from "@/lib/api/hooks/use-me";
import { SCREEN_PATH } from "@/lib/post-auth";

export default function SelecionarDistribuidoraPage() {
  const router = useRouter();
  const { data: tenants, isLoading } = useMyTenants();
  const selectTenant = useSelectTenant();

  async function handleSelect(tenantId: string) {
    const { screen } = await selectTenant.mutateAsync(tenantId);
    router.push(SCREEN_PATH[screen]);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-105">
        <div className="mb-6.5 flex items-center justify-center">
          <BrandLogo className="w-28" priority />
        </div>
        <h1 className="mb-1.5 text-center text-xl font-semibold tracking-tight text-gray-900">
          Escolha a distribuidora
        </h1>
        <p className="mb-6.5 text-center text-sm text-gray-500">
          Você faz parte de mais de uma distribuidora.
        </p>

        {isLoading ? (
          <div className="text-center text-sm text-gray-500">Carregando…</div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {tenants?.map((tenant) => (
              <button
                key={tenant.tenantId}
                type="button"
                disabled={selectTenant.isPending}
                onClick={() => handleSelect(tenant.tenantId)}
                className="w-full disabled:opacity-60"
              >
                <Card className="transition-colors hover:border-brand">
                  <CardBody className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand">
                      <Building2 size={17} />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block truncate text-[13.5px] font-semibold text-gray-900">
                        {tenant.name}
                      </span>
                      <span className="block text-[12px] text-gray-500">{tenant.role}</span>
                    </span>
                  </CardBody>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
