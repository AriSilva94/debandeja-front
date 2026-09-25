"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { AuthLayout, AuthPanel, AuthFormPane } from "@/components/auth/auth-layout";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useVerifyEmail } from "@/lib/api/hooks/use-auth";
import { destinationPath } from "@/lib/post-auth";

function VerificarEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const verifyEmail = useVerifyEmail();
  const [redirecting, setRedirecting] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;

    verifyEmail.mutate(token, {
      onSuccess: (result) => {
        setRedirecting(true);
        router.push(destinationPath(result));
      },
    });
  }, [token, verifyEmail, router]);

  return (
    <div className="text-center">
        {!token ? (
          <>
            <div className="mx-auto mb-4.5 flex h-11.5 w-11.5 items-center justify-center rounded-full bg-error-bg">
              <AlertCircle size={22} className="text-error" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">Link inválido</h2>
            <p className="text-sm leading-relaxed text-gray-500">
              Esse link de verificação está incompleto. Confira o e-mail que você recebeu, ou
              entre com seu e-mail e senha para receber um novo link.
            </p>
            <Link href="/login" className={cn(buttonVariants("secondary", "lg"), "mt-5.5 w-full")}>
            Ir para o login
          </Link>
          </>
        ) : verifyEmail.isError ? (
          <>
            <div className="mx-auto mb-4.5 flex h-11.5 w-11.5 items-center justify-center rounded-full bg-error-bg">
              <AlertCircle size={22} className="text-error" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">Link inválido ou expirado</h2>
            <p className="mb-5.5 text-sm leading-relaxed text-gray-500">
              Peça um novo link de verificação e tente novamente.
            </p>
            <Button onClick={() => router.push("/login")}>Voltar para login</Button>
          </>
        ) : redirecting || verifyEmail.isSuccess ? (
          <>
            <div className="mx-auto mb-4.5 flex h-11.5 w-11.5 items-center justify-center rounded-full bg-success-bg">
              <CheckCircle2 size={22} className="text-success" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">E-mail confirmado</h2>
            <p className="text-sm leading-relaxed text-gray-500">Redirecionando…</p>
          </>
        ) : (
          <>
            <Loader2 size={22} className="mx-auto mb-4.5 animate-spin text-brand" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900">Confirmando seu e-mail…</h2>
          </>
        )}
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <AuthLayout>
      <AuthPanel
        heading="Quase lá."
        description="Confirmando seu e-mail para liberar o acesso ao painel."
      />
      <AuthFormPane>
        <Suspense
          fallback={
            <div className="py-10 text-center" role="status" aria-label="Confirmando e-mail">
              <Loader2 size={22} className="mx-auto animate-spin text-brand" />
            </div>
          }
        >
          <VerificarEmailContent />
        </Suspense>
      </AuthFormPane>
    </AuthLayout>
  );
}
