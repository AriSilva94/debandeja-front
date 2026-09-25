"use client";

import type { FormEvent } from "react";
import { Info } from "lucide-react";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormError } from "@/components/ui/form-error";
import { ErrorState, LoadingState } from "@/components/ui/query-state";
import { errorMessage } from "@/lib/api/client";
import { useCompany, useUpdateCompany } from "@/lib/api/hooks/use-company";
import { usePermission } from "@/lib/api/hooks/use-session";
import type { Company } from "@/lib/api/types";
import { UFS } from "@/lib/br-states";
import { formatCep, formatCnpj } from "@/lib/masks";

const TAX_REGIMES = ["Simples Nacional", "Lucro Presumido", "Lucro Real"];
const FIELDS: (keyof Company)[] = [
  "legalName",
  "tradeName",
  "cnpj",
  "phone",
  "contactEmail",
  "address",
  "city",
  "uf",
  "zip",
  "stateRegistration",
  "taxRegime",
];

export function CompanyTab() {
  const company = useCompany();
  const update = useUpdateCompany();

  if (company.isPending) {
    return (
      <Card>
        <LoadingState title="Carregando empresa" description="Buscando os dados da distribuidora." />
      </Card>
    );
  }
  if (company.isError) {
    return (
      <Card>
        <ErrorState title="Não foi possível carregar a empresa" onRetry={() => company.refetch()} />
      </Card>
    );
  }
  return <CompanyForm key={company.dataUpdatedAt} company={company.data} update={update} />;
}

function CompanyForm({ company, update }: { company: Company; update: ReturnType<typeof useUpdateCompany> }) {
  const canEdit = usePermission()("company");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(
      FIELDS.map((field) => {
        const value = String(form.get(field) ?? "").trim();
        return [field, value === "" ? null : value];
      }),
    );
    update.mutate(data);
  }

  return (
    <form
      onSubmit={handleSubmit}
      onReset={() => update.reset()}
      className="grid gap-4"
    >
      <fieldset disabled={!canEdit} className="contents">
        <Card>
          <CardHeader className="flex flex-col items-start gap-0.5">
            <span className="text-[17px]">Empresa</span>
            <span className="text-[13px] font-normal text-gray-500">
              Dados da distribuidora usados em relatórios e documentos.
            </span>
          </CardHeader>
          <CardBody className="grid max-w-155 gap-4">
            {update.isError ? (
              <FormError>{errorMessage(update.error, "Não foi possível salvar. Tente novamente.")}</FormError>
            ) : null}
            <div>
              <Label htmlFor="legalName">Nome da empresa</Label>
              <Input id="legalName" name="legalName" required minLength={2} defaultValue={company.legalName} />
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <Label htmlFor="tradeName">Nome fantasia</Label>
                <Input id="tradeName" name="tradeName" defaultValue={company.tradeName ?? ""} />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  inputMode="numeric"
                  placeholder="00.000.000/0000-00"
                  defaultValue={formatCnpj(company.cnpj)}
                  className="tabular-nums"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" type="tel" defaultValue={company.phone ?? ""} />
              </div>
              <div>
                <Label htmlFor="contactEmail">E-mail de contato</Label>
                <Input id="contactEmail" name="contactEmail" type="email" defaultValue={company.contactEmail ?? ""} />
              </div>
            </div>
          </CardBody>
          {canEdit ? (
            <CardFooter className="flex items-center justify-end gap-2.5 py-3.5">
              {update.isSuccess ? (
                <span role="status" className="mr-auto text-[13px] text-success-text">
                  Alterações salvas.
                </span>
              ) : null}
              <Button type="reset" variant="secondary">
                Cancelar
              </Button>
              <Button type="submit" loading={update.isPending}>
                Salvar alterações
              </Button>
            </CardFooter>
          ) : null}
        </Card>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-4">
          <Card>
            <CardHeader>Endereço da matriz</CardHeader>
            <CardBody className="grid gap-3.5">
              <div>
                <Label htmlFor="address">Logradouro</Label>
                <Input id="address" name="address" defaultValue={company.address ?? ""} />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr]">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" name="city" defaultValue={company.city ?? ""} />
                </div>
                <div>
                  <Label htmlFor="uf">UF</Label>
                  <Select id="uf" name="uf" defaultValue={company.uf ?? ""}>
                    <option value="">—</option>
                    {UFS.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="zip">CEP</Label>
                  <Input
                    id="zip"
                    name="zip"
                    inputMode="numeric"
                    placeholder="00000-000"
                    defaultValue={formatCep(company.zip)}
                    className="tabular-nums"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex flex-col items-start gap-0.5">
              <span>Dados fiscais</span>
              <span className="text-[12.5px] font-normal text-gray-500">
                Usados em documentos e relatórios de saída.
              </span>
            </CardHeader>
            <CardBody className="grid gap-3.5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="stateRegistration">Inscrição estadual</Label>
                  <Input
                    id="stateRegistration"
                    name="stateRegistration"
                    defaultValue={company.stateRegistration ?? ""}
                    className="tabular-nums"
                  />
                </div>
                <div>
                  <Label htmlFor="taxRegime">Regime tributário</Label>
                  <Select id="taxRegime" name="taxRegime" defaultValue={company.taxRegime ?? ""}>
                    <option value="">—</option>
                    {TAX_REGIMES.map((regime) => (
                      <option key={regime}>{regime}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-[10px] border border-brand-subtle-border bg-brand-subtle p-3">
                <Info size={17} className="mt-px shrink-0 text-brand" />
                <span className="text-[13px] leading-relaxed text-brand">
                  A emissão de notas fiscais não faz parte desta versão. Os dados ficam salvos para
                  uso futuro.
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </fieldset>
    </form>
  );
}
