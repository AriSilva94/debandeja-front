"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AuthLayout, AuthPanel, AuthFormPaneWide } from "@/components/auth/auth-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useForgotPassword } from "@/lib/api/hooks/use-auth";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const forgotPassword = useForgotPassword();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await forgotPassword.mutateAsync(email);
  }

  return (
    <AuthLayout>
      <AuthPanel
        heading="Sua operação continua rodando."
        description="Enviamos um link seguro para você voltar ao painel em poucos minutos."
      />
      <AuthFormPaneWide>
        <div>
          {forgotPassword.isSuccess ? (
            <div className="text-center">
                <div className="mx-auto mb-4.5 flex h-11.5 w-11.5 items-center justify-center rounded-full bg-success-bg">
                  <CheckCircle2 size={22} className="text-success" />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-gray-900">Link enviado</h2>
                <p className="mb-5.5 text-sm leading-relaxed text-gray-500">
                  Se <span className="font-medium text-gray-900">{email}</span> estiver
                  cadastrado, você vai receber as instruções em instantes.
                </p>
                <Link href="/login" className={cn(buttonVariants("secondary", "lg"), "w-full")}>
                  Voltar para login
                </Link>
            </div>
          ) : (
            <div>
                <h2 className="mb-1.5 text-xl font-semibold tracking-tight text-gray-900">
                  Recuperar acesso
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-gray-500">
                  Informe o e-mail cadastrado e enviaremos um link para você redefinir sua senha.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="voce@distribuidora.com.br"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={forgotPassword.isPending}>
                    {forgotPassword.isPending ? "Enviando…" : "Enviar link de recuperação"}
                  </Button>
                </form>
                <div className="mt-4.5 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand hover:text-brand-dark"
                  >
                    <ArrowLeft size={15} />
                    Voltar para login
                  </Link>
                </div>
            </div>
          )}
        </div>
      </AuthFormPaneWide>
    </AuthLayout>
  );
}
