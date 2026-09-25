"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AuthLayout, AuthPanel, AuthFormPane } from "@/components/auth/auth-layout";
import { StepIndicator } from "@/components/auth/step-indicator";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/cn";
import { useRegister } from "@/lib/api/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { FormError } from "@/components/ui/form-error";

const STEPS = ["Conta", "Distribuidora", "Filial", "Finalizado"];

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

const STRENGTH_LABEL = ["Muito fraca", "Fraca", "Razoável", "Boa", "Senha forte"];

export default function CriarContaPage() {
  const register = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => passwordStrength(password), [password]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    try {
      await register.mutateAsync({ name, email, password });
    } catch (err) {
      setError(err instanceof ApiError && err.status === 409 ? "Este e-mail já está cadastrado." : "Não foi possível criar sua conta.");
    }
  }

  if (register.isSuccess) {
    return (
      <AuthLayout>
        <AuthPanel
          heading="14 dias para organizar sua distribuidora."
          description="Sem cartão de crédito. Cadastre produtos, filiais e sua equipe hoje mesmo."
        />
        <AuthFormPane>
          <div className="text-center">
              <div className="mx-auto mb-4.5 flex h-11.5 w-11.5 items-center justify-center rounded-full bg-success-bg">
                <CheckCircle2 size={22} className="text-success" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">Confirme seu e-mail</h2>
              <p className="text-sm leading-relaxed text-gray-500">
                Enviamos um link de confirmação para{" "}
                <span className="font-medium text-gray-900">{email}</span>. Clique nele para
                continuar seu cadastro.
              </p>
          </div>
        </AuthFormPane>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthPanel
        heading="14 dias para organizar sua distribuidora."
        description="Sem cartão de crédito. Cadastre produtos, filiais e sua equipe hoje mesmo."
      />
      <AuthFormPane>
        <div>
          <StepIndicator steps={STEPS} activeStep={1} className="mb-6.5" />

          <h2 className="mb-1.5 text-2xl font-semibold tracking-tight text-gray-900">
            Criar sua conta
          </h2>
          <p className="mb-6.5 text-sm text-gray-500">Comece pelo seu acesso de administrador.</p>

          <form onSubmit={handleSubmit} className="grid gap-4">
            {error ? (
              <FormError>{error}</FormError>
            ) : null}

            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                placeholder="Seu nome completo"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
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
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <div className="mt-1.5 flex gap-1">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-0.75 flex-1 rounded-sm",
                        index < strength ? "bg-success" : "bg-gray-200",
                      )}
                    />
                  ))}
                </div>
                {password ? (
                  <div className="mt-1.5 text-xs text-gray-500">
                    {STRENGTH_LABEL[strength]}
                  </div>
                ) : null}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            <Checkbox
              wrapperClassName="items-start"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              label={
                <>
                  Li e aceito os <span className="font-medium text-brand">Termos de uso</span> e a{" "}
                  <span className="font-medium text-brand">Política de privacidade</span>.
                </>
              }
            />

            <Button
              type="submit"
              size="lg"
              className="mt-1 w-full"
              disabled={!acceptedTerms || register.isPending}
            >
              {register.isPending ? "Criando conta…" : "Criar minha conta"}
            </Button>
          </form>

          <div className="mt-4.5 text-center text-sm text-gray-500">
            Já possui conta?{" "}
            <Link href="/login" className="font-semibold text-brand hover:text-brand-dark">
              Entrar
            </Link>
          </div>
        </div>
      </AuthFormPane>
    </AuthLayout>
  );
}
