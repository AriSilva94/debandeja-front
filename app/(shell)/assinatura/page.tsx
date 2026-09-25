"use client";

import { Check, MessageCircle, Receipt } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState, LoadingState } from "@/components/ui/query-state";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/cn";
import { useBillingPlans, useBillingSubscription, useInvoices } from "@/lib/api/hooks/use-billing";
import { useSessionContext } from "@/lib/api/hooks/use-session";
import { salesWhatsappUrl } from "@/lib/contact";
import type { BillingPlan, BillingSubscription } from "@/lib/api/types";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { INVOICE_STATUS, SUBSCRIPTION_STATUS, SUBSCRIPTION_STATUS_ORDER, subscriptionNotice } from "@/lib/subscription";

function limitText(limit: number | null, singular: string, plural: string, unlimited: string) {
  if (limit === null) return unlimited;
  return limit === 1 ? `1 ${singular}` : `até ${limit} ${plural}`;
}

function planSummary(plan: BillingPlan) {
  const branches = limitText(plan.maxBranches, "filial", "filiais", "filiais ilimitadas");
  const users = limitText(plan.maxUsers, "usuário", "usuários", "usuários ilimitados");
  return `${branches.charAt(0).toUpperCase()}${branches.slice(1)} e ${users}`;
}

function statusSummary(subscription: BillingSubscription) {
  if (subscription.status === "TRIAL") {
    return `Você está no período de teste gratuito, com os limites do plano ${subscription.plan.name}. Contrate um plano antes do fim do trial para não interromper a operação.`;
  }
  if (subscription.status === "ACTIVE" && subscription.currentPeriodEnd) {
    return `Cobrança em dia. Próxima fatura em ${formatDateTime(subscription.currentPeriodEnd).date}.`;
  }
  return subscriptionNotice(subscription) ?? SUBSCRIPTION_STATUS[subscription.status].description;
}

function UsageItem({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  return (
    <div>
      <div className="mb-0.75 text-[12.5px] text-gray-500">{label}</div>
      <div className="text-[15px] font-semibold text-gray-900">
        {formatNumber(used)}{" "}
        <span className="text-[13px] font-normal text-gray-400">{limit === null ? "ilimitado" : `/ ${formatNumber(limit)}`}</span>
      </div>
    </div>
  );
}

function CurrentPlanCard({ subscription }: { subscription: BillingSubscription }) {
  const status = SUBSCRIPTION_STATUS[subscription.status];
  const trialEndsAt = subscription.status === "TRIAL" ? subscription.trialEndsAt : null;
  const trialRemaining = subscription.trialDaysRemaining ?? 0;
  const trialUsed = subscription.trialDays - trialRemaining;

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1.5 flex items-center gap-2.5">
            <span className="text-lg font-semibold text-gray-900">Plano atual: {subscription.onTrial ? "Trial" : subscription.plan.name}</span>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          <p className="max-w-130 text-sm leading-relaxed text-gray-500">{statusSummary(subscription)}</p>
        </div>
        <a href="#planos" className={cn(buttonVariants("primary", "lg"), "shrink-0")}>
          Escolher plano
        </a>
      </div>
      {trialEndsAt ? (
        <>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-medium text-gray-700">
              Restam {trialRemaining} de {subscription.trialDays} dias
            </span>
            <span className="text-[13px] text-gray-500">
              Termina em {formatDateTime(trialEndsAt).date}
            </span>
          </div>
          <progress
            value={trialUsed}
            max={subscription.trialDays}
            aria-label={`${trialUsed} de ${subscription.trialDays} dias de trial usados`}
            className="h-2 w-full overflow-hidden rounded-sm [&::-webkit-progress-bar]:rounded-sm [&::-webkit-progress-bar]:bg-gray-100 [&::-webkit-progress-value]:rounded-sm [&::-webkit-progress-value]:bg-brand [&::-moz-progress-bar]:rounded-sm [&::-moz-progress-bar]:bg-brand"
          />
        </>
      ) : null}
      <div className="mt-5 grid grid-cols-3 gap-3.5 border-t border-gray-200 pt-4.5">
        <UsageItem label="Usuários" {...subscription.usage.users} />
        <UsageItem label="Filiais" {...subscription.usage.branches} />
        <UsageItem label="Produtos" {...subscription.usage.products} />
      </div>
    </Card>
  );
}

export default function AssinaturaPage() {
  const subscription = useBillingSubscription();
  const plans = useBillingPlans();
  const invoices = useInvoices();
  const tenantName = useSessionContext().data?.tenant.name ?? "";

  return (
    <div className="flex flex-col gap-4.5 p-4 sm:p-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-gray-900">Assinatura</h1>
        <p className="text-sm text-gray-500">Plano, período de teste e histórico de cobranças.</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-4">
        {subscription.data ? (
          <CurrentPlanCard subscription={subscription.data} />
        ) : (
          <Card>
            {subscription.isError ? (
              <ErrorState title="Não foi possível carregar a assinatura" onRetry={() => subscription.refetch()} />
            ) : (
              <LoadingState title="Carregando assinatura" description="Buscando plano e uso atual." />
            )}
          </Card>
        )}

        <Card className="p-5">
          <div className="mb-0.5 text-[15.5px] font-semibold">Estados da assinatura</div>
          <div className="mb-3.5 text-[12.5px] text-gray-400">
            Como o sistema se comporta em cada estado.
          </div>
          <div className="flex flex-col gap-2.5">
            {SUBSCRIPTION_STATUS_ORDER.map((code) => {
              const state = SUBSCRIPTION_STATUS[code];
              const current = code === subscription.data?.status;
              return (
                <div
                  key={code}
                  aria-current={current || undefined}
                  className="flex items-start gap-2.5 border-b border-gray-100 pb-2.5 last:border-0 last:pb-0"
                >
                  <Badge tone={state.tone} className="shrink-0">
                    {state.label}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-[11.5px] font-semibold tracking-wide", current ? "text-brand" : "text-gray-400")}>
                      {code}
                      {current ? " · estado atual" : ""}
                    </div>
                    <div className="mt-0.5 text-[12.5px] leading-relaxed text-gray-600">{state.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div id="planos" className="flex scroll-mt-4 flex-col gap-2.5">
        <p className="text-[13px] text-gray-500">
          A contratação é feita com o nosso time pelo{" "}
          <a
            href={salesWhatsappUrl(`Olá! Quero falar sobre a assinatura da distribuidora ${tenantName}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand hover:text-brand-dark"
          >
            WhatsApp (16) 99735-1101
          </a>
          : assim que o pagamento é confirmado, o plano é ativado na sua conta.
        </p>
        {plans.data ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
            {plans.data.map((plan) => {
              const action = plan.current ? "renovar" : "contratar";
              return (
                <Card
                  key={plan.code}
                  className={cn("flex flex-col p-5", plan.current && "border-brand ring-3 ring-brand/10")}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[15.5px] font-semibold">{plan.name}</span>
                    {plan.current ? <Badge tone="brand">Plano atual</Badge> : null}
                  </div>
                  <div className="mb-1 flex items-baseline gap-1">
                    <span className="text-[26px] font-semibold tracking-tight text-gray-900">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-[13px] text-gray-500">/mês</span>
                  </div>
                  <div className="mb-3.5 text-[13px] text-gray-500">{planSummary(plan)}</div>
                  <div className="flex flex-col gap-2.25">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-[13px] text-gray-700">
                        <Check size={14} strokeWidth={2.6} className="shrink-0 text-accent" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <a
                    href={salesWhatsappUrl(`Olá! Quero ${action} o plano ${plan.name} para a distribuidora ${tenantName}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants(plan.current ? "secondary" : "primary"), "mt-4.5")}
                  >
                    <MessageCircle size={15} />
                    {plan.current ? "Renovar pelo WhatsApp" : "Contratar pelo WhatsApp"}
                  </a>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            {plans.isError ? (
              <ErrorState title="Não foi possível carregar os planos" onRetry={() => plans.refetch()} />
            ) : (
              <LoadingState title="Carregando planos" description="Buscando os planos disponíveis." />
            )}
          </Card>
        )}
      </div>

      <Card>
        <div className="border-b border-gray-200 px-4.5 py-4 text-[15.5px] font-semibold">
          Histórico de cobranças
        </div>
        {invoices.isPending ? (
          <LoadingState title="Carregando cobranças" description="Buscando o histórico de faturas." />
        ) : invoices.isError ? (
          <ErrorState title="Não foi possível carregar as cobranças" onRetry={() => invoices.refetch()} />
        ) : invoices.data.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Nenhuma cobrança ainda"
            description="As faturas aparecem aqui depois da primeira cobrança do plano."
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHeaderCell>Fatura</TableHeaderCell>
                <TableHeaderCell>Data</TableHeaderCell>
                <TableHeaderCell>Descrição</TableHeaderCell>
                <TableHeaderCell align="right">Valor</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="w-23" />
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.data.map((invoice) => {
                const status = INVOICE_STATUS[invoice.status];
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium tabular-nums">#{invoice.id.slice(0, 8).toUpperCase()}</TableCell>
                    <TableCell className="text-gray-600">{formatDateTime(invoice.issuedAt).date}</TableCell>
                    <TableCell className="text-gray-600">{invoice.description}</TableCell>
                    <TableCell align="right" className="font-medium text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </TableCell>
                    <TableCell align="right">
                      {invoice.pdfUrl ? (
                        <a
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] font-medium text-brand hover:text-brand-dark"
                        >
                          Baixar
                        </a>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
