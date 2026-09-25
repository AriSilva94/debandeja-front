"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { AuthLayout, AuthPanel, AuthFormPane } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useLogin, useResendVerification } from "@/lib/api/hooks/use-auth";
import { ApiError, TOO_MANY_REQUESTS_MESSAGE, errorMessage } from "@/lib/api/client";
import { FormError } from "@/components/ui/form-error";
import { destinationPath } from "@/lib/post-auth";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const resend = useResendVerification();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setUnverifiedEmail(null);
    resend.reset();
    try {
      const result = await login.mutateAsync({ email, password });
      router.push(destinationPath(result));
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setUnverifiedEmail(email);
      } else if (err instanceof ApiError && err.status === 429) {
        setError(TOO_MANY_REQUESTS_MESSAGE);
      } else {
        setError("E-mail ou senha inválidos.");
      }
    }
  }

  return (
    <AuthLayout>
      <AuthPanel
        heading="Controle sua operação em um só lugar."
        description="Estoque, produtos e filiais sempre organizados. Feito para a rotina de distribuidoras de bebidas."
        features={[
          "Estoque por filial em tempo real",
          "Entradas, saídas e ajustes auditáveis",
          "Equipe e permissões por função",
        ]}
      />
      <AuthFormPane>
        <div>
          <h2 className="mb-1.5 text-2xl font-semibold tracking-tight text-gray-900">
            Entrar na sua conta
          </h2>
          <p className="mb-7 text-sm text-gray-500">Acesse o painel da sua distribuidora.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
            {error ? (
              <FormError>{error}</FormError>
            ) : null}
            {unverifiedEmail ? (
              resend.isSuccess ? (
                <div role="status" className="rounded-[10px] border border-success-border bg-success-bg px-3 py-2.5 text-[13px] text-success-text">
                  Enviamos um novo link de confirmação para <strong>{unverifiedEmail}</strong>. Confira também a caixa de spam.
                </div>
              ) : (
                <FormError>
                  <span>Confirme seu e-mail antes de entrar. </span>
                  <button
                    type="button"
                    onClick={() => resend.mutate(unverifiedEmail)}
                    disabled={resend.isPending}
                    className="font-semibold underline underline-offset-2 disabled:opacity-60"
                  >
                    {resend.isPending ? "Enviando…" : "Reenviar link de confirmação"}
                  </button>
                  {resend.isError ? (
                    <span className="mt-1 block">{errorMessage(resend.error, "Não foi possível reenviar agora. Tente de novo em instantes.")}</span>
                  ) : null}
                </FormError>
              )
            ) : null}

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="voce@distribuidora.com.br"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label htmlFor="password" className="text-[13px] font-medium text-gray-700">
                  Senha
                </label>
                <Link
                  href="/recuperar-senha"
                  className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand hover:text-brand-dark"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Checkbox name="remember" label="Lembrar de mim" defaultChecked />

            <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-gray-400" aria-hidden>
            <span className="h-px flex-1 bg-gray-200" />
            <span>ou</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <a
            href="/api/auth/google"
            className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-brand-subtle-border bg-brand-subtle px-5 text-[14.5px] font-semibold text-brand-dark transition-colors hover:border-brand hover:bg-brand hover:text-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/20"
          >
            <FcGoogle size={20} aria-hidden />
            Continuar com Google
          </a>

          <div className="mt-6 border-t border-brand-subtle-border pt-5 text-center text-sm text-gray-500">
            Ainda não possui uma conta?{" "}
            <Link href="/criar-conta" className="font-semibold text-brand hover:text-brand-dark">
              Criar conta
            </Link>
          </div>
        </div>
      </AuthFormPane>
    </AuthLayout>
  );
}
