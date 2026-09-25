"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { AuthLayout, AuthPanel, AuthFormPane } from "@/components/auth/auth-layout";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { errorMessage } from "@/lib/api/client";
import { useConfirmEmailChange } from "@/lib/api/hooks/use-account";

function StatusIcon({ ok }: { ok: boolean }) {
  return (
    <div
      className={cn(
        "mx-auto mb-4.5 flex h-11.5 w-11.5 items-center justify-center rounded-full",
        ok ? "bg-success-bg" : "bg-error-bg",
      )}
    >
      {ok ? <CheckCircle2 size={22} className="text-success" /> : <AlertCircle size={22} className="text-error" />}
    </div>
  );
}

function ConfirmarEmailContent() {
  const token = useSearchParams().get("token");
  const confirm = useConfirmEmailChange();
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;
    confirm.mutate(token);
  }, [token, confirm]);

  if (!token || confirm.isError) {
    return (
      <div className="text-center">
        <StatusIcon ok={false} />
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Não foi possível confirmar</h2>
        <p className="mb-5.5 text-sm leading-relaxed text-gray-500">
          {token
            ? errorMessage(confirm.error, "Tente novamente em instantes.")
            : "Esse link de confirmação está incompleto. Confira o e-mail que você recebeu."}
        </p>
        <Link href="/configuracoes?aba=conta" className={buttonVariants("secondary", "lg")}>
          Voltar para a conta
        </Link>
      </div>
    );
  }

  if (confirm.isSuccess) {
    return (
      <div className="text-center">
        <StatusIcon ok />
        <h2 className="mb-2 text-xl font-semibold text-gray-900">E-mail alterado</h2>
        <p className="mb-5.5 text-sm leading-relaxed text-gray-500">
          A partir de agora, entre com <strong className="text-gray-900">{confirm.data.email}</strong>.
        </p>
        <Link href="/configuracoes?aba=conta" className={buttonVariants("primary", "lg")}>
          Continuar
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Loader2 size={22} className="mx-auto mb-4.5 animate-spin text-brand" />
      <h2 className="mb-2 text-xl font-semibold text-gray-900">Confirmando seu novo e-mail…</h2>
    </div>
  );
}

export default function ConfirmarEmailPage() {
  return (
    <AuthLayout>
      <AuthPanel heading="Novo e-mail de acesso." description="Confirmando o endereço que você cadastrou." />
      <AuthFormPane>
        <Suspense
          fallback={
            <div className="py-10 text-center" role="status" aria-label="Confirmando e-mail">
              <Loader2 size={22} className="mx-auto animate-spin text-brand" />
            </div>
          }
        >
          <ConfirmarEmailContent />
        </Suspense>
      </AuthFormPane>
    </AuthLayout>
  );
}
