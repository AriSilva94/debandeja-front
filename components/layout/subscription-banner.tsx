"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePermission, useSessionContext } from "@/lib/api/hooks/use-session";
import { subscriptionNotice } from "@/lib/subscription";

export function SubscriptionBanner() {
  const subscription = useSessionContext().data?.subscription;
  const canSeeBilling = usePermission()("billing", "READ");
  const notice = subscription ? subscriptionNotice(subscription) : null;
  if (!subscription || !notice) return null;

  return (
    <div
      role="status"
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-4 py-2.5 text-[13px] sm:px-6",
        subscription.readOnly
          ? "border-error-border bg-error-bg text-error-text"
          : "border-warning-border bg-warning-bg text-warning-text",
      )}
    >
      <TriangleAlert size={15} className="shrink-0" />
      <span className="min-w-0 flex-1">{notice}</span>
      {canSeeBilling ? (
        <Link href="/assinatura" className="font-semibold underline-offset-2 hover:underline">
          Ver assinatura
        </Link>
      ) : null}
    </div>
  );
}
