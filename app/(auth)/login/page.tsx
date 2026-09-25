"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout, AuthPanel, AuthFormPane } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useLogin } from "@/lib/api/hooks/use-auth";
import { ApiError, TOO_MANY_REQUESTS_MESSAGE } from "@/lib/api/client";
import { FormError } from "@/components/ui/form-error";
import { destinationPath } from "@/lib/post-auth";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const result = await login.mutateAsync({ email, password });
      router.push(destinationPath(result));
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Confirme seu e-mail antes de entrar.");
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
