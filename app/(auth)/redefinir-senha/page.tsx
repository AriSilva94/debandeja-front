"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { AuthLayout, AuthPanel, AuthFormPane } from "@/components/auth/auth-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useResetPassword } from "@/lib/api/hooks/use-auth";
import { FormError } from "@/components/ui/form-error";

function RedefinirSenhaContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const resetPassword = useResetPassword();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!token) return;
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    try {
      await resetPassword.mutateAsync({ token, newPassword });
    } catch {
      setError("Link inválido ou expirado. Peça uma nova redefinição.");
    }
  }

  if (!token) {
    return (
      <div className="text-center">
          <div className="mx-auto mb-4.5 flex h-11.5 w-11.5 items-center justify-center rounded-full bg-error-bg">
            <AlertCircle size={22} className="text-error" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Link inválido</h2>
          <p className="text-sm leading-relaxed text-gray-500">
            Esse link de redefinição está incompleto. Peça um novo para criar sua senha.
          </p>
          <Link href="/recuperar-senha" className={cn(buttonVariants("primary", "lg"), "mt-5.5 w-full")}>
            Pedir novo link
          </Link>
          <Link href="/login" className="mt-4 inline-block text-[13px] font-semibold text-brand hover:text-brand-dark">
            Voltar para o login
          </Link>
      </div>
    );
  }

  if (resetPassword.isSuccess) {
    return (
      <div className="text-center">
          <div className="mx-auto mb-4.5 flex h-11.5 w-11.5 items-center justify-center rounded-full bg-success-bg">
            <CheckCircle2 size={22} className="text-success" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Senha redefinida</h2>
          <p className="mb-5.5 text-sm leading-relaxed text-gray-500">
            Faça login com sua nova senha.
          </p>
          <Link href="/login" className={cn(buttonVariants("primary", "lg"), "w-full")}>
            Ir para login
          </Link>
      </div>
    );
  }

  return (
    <div>
        <h2 className="mb-1.5 text-xl font-semibold tracking-tight text-gray-900">
          Redefinir senha
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-gray-500">Escolha uma nova senha.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error ? (
            <FormError>{error}</FormError>
          ) : null}
          <div>
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={resetPassword.isPending}>
            {resetPassword.isPending ? "Redefinindo…" : "Redefinir senha"}
          </Button>
        </form>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <AuthLayout>
      <AuthPanel
        heading="Sua operação continua rodando."
        description="Defina uma nova senha para voltar ao painel."
      />
      <AuthFormPane>
        <Suspense
          fallback={
            <div className="py-10 text-center" role="status" aria-label="Carregando redefinição de senha">
              <Loader2 size={22} className="mx-auto animate-spin text-brand" />
            </div>
          }
        >
          <RedefinirSenhaContent />
        </Suspense>
      </AuthFormPane>
    </AuthLayout>
  );
}
