"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { AuthLayout, AuthPanel, AuthFormPane } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useAcceptInvite } from "@/lib/api/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import type { AcceptInviteResult } from "@/lib/api/types";
import { destinationPath } from "@/lib/post-auth";

type Stage = "checking" | "needs-account" | "verification-required" | "invalid" | "redirecting";

function AceitarConviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const acceptInvite = useAcceptInvite();
  const [stage, setStage] = useState<Stage>("checking");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const attempted = useRef(false);

  const handleResult = useCallback(
    (result: AcceptInviteResult) => {
      if ("status" in result) {
        setStage("verification-required");
        return;
      }
      setStage("redirecting");
      router.push(destinationPath(result));
    },
    [router],
  );

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;

    acceptInvite.mutate(
      { token },
      {
        onSuccess: handleResult,
        onError: (err) => {
          if (err instanceof ApiError && err.status === 400) {
            setStage("needs-account");
          } else {
            setStage("invalid");
          }
        },
      },
    );
  }, [token, acceptInvite, handleResult]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    try {
      const result = await acceptInvite.mutateAsync({ token, name, password });
      handleResult(result);
    } catch {
      setStage("invalid");
    }
  }

  if (!token || stage === "invalid") {
    return (
      <div className="text-center">
          <div className="mx-auto mb-4.5 flex h-11.5 w-11.5 items-center justify-center rounded-full bg-error-bg">
            <AlertCircle size={22} className="text-error" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Convite inválido ou expirado</h2>
          <p className="mb-5.5 text-sm leading-relaxed text-gray-500">
            Peça a quem te convidou para enviar um novo convite.
          </p>
          <Button onClick={() => router.push("/login")}>Voltar para login</Button>
      </div>
    );
  }

  if (stage === "verification-required") {
    return (
      <div className="text-center">
          <div className="mx-auto mb-4.5 flex h-11.5 w-11.5 items-center justify-center rounded-full bg-brand-subtle">
            <MailCheck size={22} className="text-brand" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Confirme seu e-mail</h2>
          <p className="text-sm leading-relaxed text-gray-500">
            Sua conta já existia e o convite foi vinculado a ela. Confirme seu e-mail para entrar.
          </p>
      </div>
    );
  }

  if (stage === "redirecting") {
    return (
      <div className="text-center">
          <div className="mx-auto mb-4.5 flex h-11.5 w-11.5 items-center justify-center rounded-full bg-success-bg">
            <CheckCircle2 size={22} className="text-success" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Convite aceito</h2>
          <p className="text-sm leading-relaxed text-gray-500">Redirecionando…</p>
      </div>
    );
  }

  if (stage === "needs-account") {
    return (
      <div>
          <h2 className="mb-1.5 text-xl font-semibold tracking-tight text-gray-900">
            Complete seu cadastro
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-500">
            Crie seu acesso para entrar na distribuidora que te convidou.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={acceptInvite.isPending}>
              {acceptInvite.isPending ? "Criando acesso…" : "Aceitar convite"}
            </Button>
          </form>
      </div>
    );
  }

  return (
    <div className="py-10 text-center" role="status" aria-label="Verificando convite">
      <Loader2 size={22} className="mx-auto animate-spin text-brand" />
    </div>
  );
}

export default function AceitarConvitePage() {
  return (
    <AuthLayout>
      <AuthPanel
        heading="Você foi convidado."
        description="Aceite o convite para entrar na equipe da distribuidora."
      />
      <AuthFormPane>
        <Suspense fallback={<Loader2 size={22} className="animate-spin text-brand" />}>
          <AceitarConviteContent />
        </Suspense>
      </AuthFormPane>
    </AuthLayout>
  );
}
