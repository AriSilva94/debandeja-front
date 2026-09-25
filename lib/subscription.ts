import type { BadgeTone } from "@/components/ui/badge";
import type { Invoice, SubscriptionStatus } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";

export const SUBSCRIPTION_STATUS: Record<SubscriptionStatus, { label: string; tone: BadgeTone; description: string }> = {
  TRIAL: {
    label: "Trial ativo",
    tone: "brand",
    description: "Uso gratuito com os limites do Essencial. Ao terminar sem contratação, a conta fica somente leitura.",
  },
  ACTIVE: { label: "Assinatura ativa", tone: "success", description: "Pagamento em dia até o fim do período contratado." },
  PAST_DUE: {
    label: "Pagamento pendente",
    tone: "warning",
    description: "Período vencido sem pagamento. O acesso continua por até 5 dias.",
  },
  SUSPENDED: { label: "Conta suspensa", tone: "error", description: "Acesso somente leitura até a regularização." },
  CANCELED: {
    label: "Cancelada",
    tone: "neutral",
    description: "Acesso somente leitura. Os dados são excluídos 90 dias após o cancelamento.",
  },
};

export const SUBSCRIPTION_STATUS_ORDER: SubscriptionStatus[] = ["TRIAL", "ACTIVE", "PAST_DUE", "SUSPENDED", "CANCELED"];

export const INVOICE_STATUS: Record<Invoice["status"], { label: string; tone: BadgeTone }> = {
  ISENTO: { label: "Isento", tone: "neutral" },
  PAGO: { label: "Pago", tone: "success" },
};

export function subscriptionNotice({
  status,
  onTrial,
  dataPurgeAt,
}: {
  status: SubscriptionStatus;
  onTrial: boolean;
  dataPurgeAt: string | null;
}) {
  if (status === "PAST_DUE") {
    return "Pagamento pendente. Regularize em até 5 dias após o vencimento para evitar a suspensão da conta.";
  }
  if (status === "SUSPENDED") {
    return onTrial
      ? "Seu período de teste terminou. A conta está em modo somente leitura até a contratação de um plano."
      : "Assinatura suspensa por falta de pagamento. A conta está em modo somente leitura até a regularização.";
  }
  if (status === "CANCELED") {
    const purge = dataPurgeAt ? `em ${formatDateTime(dataPurgeAt).date}` : "90 dias após o cancelamento";
    return `Assinatura cancelada. A conta está em modo somente leitura e os dados serão excluídos ${purge}.`;
  }
  return null;
}
