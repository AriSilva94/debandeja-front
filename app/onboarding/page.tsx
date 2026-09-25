"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { StepIndicator } from "@/components/auth/step-indicator";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardBody } from "@/components/ui/card";
import { useCreateCompany, useCreateFirstBranch } from "@/lib/api/hooks/use-onboarding";
import { FormError } from "@/components/ui/form-error";
import { CityCombobox } from "@/components/location/city-combobox";
import { useBrazilStates } from "@/lib/api/hooks/use-locations";
import { UFS } from "@/lib/br-states";

const STEPS = ["Conta", "Distribuidora", "Filial", "Finalizado"];

function formatTrialDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default function OnboardingPage() {
  const router = useRouter();
  const createCompany = useCreateCompany();
  const createBranch = useCreateFirstBranch();
  const states = useBrazilStates();
  const stateOptions = states.isError
    ? UFS.map((sigla) => ({ uf: sigla, name: sigla }))
    : (states.data ?? []);

  const [step, setStep] = useState<2 | 3 | 4>(2);
  const [companyName, setCompanyName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [branchName, setBranchName] = useState("Matriz");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCompanySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const result = await createCompany.mutateAsync({
        legalName: companyName,
        tradeName: tradeName || undefined,
        cnpj: cnpj || undefined,
      });
      setTrialEndsAt(result.trialEndsAt);
      setStep(3);
    } catch {
      setError("Não foi possível criar a distribuidora. Tente novamente.");
    }
  }

  async function handleBranchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await createBranch.mutateAsync({ name: branchName, city, uf });
      setStep(4);
    } catch {
      setError("Não foi possível criar a filial. Tente novamente.");
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-16 pt-10">
      <div className="mx-auto max-w-180">
        <div className="mb-8 flex items-center justify-center">
          <BrandLogo className="w-28" priority />
        </div>
        <StepIndicator steps={STEPS} activeStep={step} className="mb-6.5 justify-center" />

        {error ? (
          <FormError className="mx-auto mb-4 max-w-120 text-center">{error}</FormError>
        ) : null}

        {step === 2 ? (
          <Card>
            <CardBody className="p-8">
              <h2 className="mb-1.5 text-xl font-semibold tracking-tight text-gray-900">
                Dados da distribuidora
              </h2>
              <p className="mb-6.5 text-sm text-gray-500">
                Essas informações aparecem em relatórios e documentos.
              </p>
              <form onSubmit={handleCompanySubmit} className="grid gap-4">
                <div>
                  <Label htmlFor="companyName">Nome da empresa</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="tradeName">Nome fantasia</Label>
                    <Input
                      id="tradeName"
                      value={tradeName}
                      onChange={(event) => setTradeName(event.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cnpj" className="flex justify-between">
                      <span>CNPJ</span>
                      <span className="font-normal text-gray-400">Opcional</span>
                    </Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      value={cnpj}
                      onChange={(event) => setCnpj(event.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-start gap-2.5 rounded-[10px] border border-brand-subtle-border bg-brand-subtle p-3">
                  <span className="text-[13px] leading-relaxed text-brand">
                    Você pode completar o CNPJ e os dados fiscais depois, em Configurações →
                    Empresa.
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-5.5">
                  <Button type="button" variant="secondary" onClick={() => router.push("/criar-conta")}>
                    Voltar
                  </Button>
                  <Button type="submit" disabled={createCompany.isPending}>
                    {createCompany.isPending ? "Criando…" : "Continuar"}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        ) : null}

        {step === 3 ? (
          <Card>
            <CardBody className="p-8">
              <h2 className="mb-1.5 text-xl font-semibold tracking-tight text-gray-900">
                Primeira filial
              </h2>
              <p className="mb-6.5 text-sm text-gray-500">
                Todo estoque é controlado por filial. Comece pela matriz.
              </p>
              <form onSubmit={handleBranchSubmit} className="grid gap-4">
                <div>
                  <Label htmlFor="branchName">Nome da filial</Label>
                  <Input
                    id="branchName"
                    value={branchName}
                    onChange={(event) => setBranchName(event.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-[1fr_2fr]">
                  <div>
                    <Label htmlFor="uf">Estado</Label>
                    <Select
                      id="uf"
                      value={uf}
                      required
                      onChange={(event) => {
                        setUf(event.target.value);
                        setCity("");
                      }}
                    >
                      <option value="" disabled>
                        {states.isPending ? "Carregando…" : "Selecione"}
                      </option>
                      {stateOptions.map((state) => (
                        <option key={state.uf} value={state.uf}>
                          {state.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <CityCombobox id="city" uf={uf} value={city} onChange={setCity} />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-5.5">
                  <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                    Voltar
                  </Button>
                  <Button type="submit" disabled={createBranch.isPending}>
                    {createBranch.isPending ? "Concluindo…" : "Concluir cadastro"}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        ) : null}

        {step === 4 ? (
          <Card>
            <CardBody className="px-8 py-11 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-subtle">
                <CheckCircle2 size={26} className="text-brand" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
                Conta criada com sucesso
              </h2>
              <p className="mb-6 text-[14.5px] leading-relaxed text-gray-500">
                Seu período de teste começou. Você tem{" "}
                <span className="font-semibold text-gray-900">7 dias de trial</span> com todos os
                recursos liberados.
              </p>
              <div className="mb-7 flex flex-wrap justify-center gap-3">
                <div className="rounded-[10px] border border-gray-200 bg-gray-50 px-4.5 py-3 text-left">
                  <div className="mb-0.5 text-[12.5px] text-gray-500">Tenant</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {tradeName || companyName || "Sua distribuidora"}
                  </div>
                </div>
                <div className="rounded-[10px] border border-gray-200 bg-gray-50 px-4.5 py-3 text-left">
                  <div className="mb-0.5 text-[12.5px] text-gray-500">Filial</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {branchName} · {city ? `${city}/${uf}` : uf}
                  </div>
                </div>
                <div className="rounded-[10px] border border-gray-200 bg-gray-50 px-4.5 py-3 text-left">
                  <div className="mb-0.5 text-[12.5px] text-gray-500">Trial até</div>
                  <div className="text-sm font-semibold text-gray-900">{formatTrialDate(trialEndsAt)}</div>
                </div>
              </div>
              <Button size="lg" onClick={() => router.push("/")}>
                Acessar meu painel
              </Button>
            </CardBody>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
