"use client";

import { useState, type FormEvent } from "react";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FormError } from "@/components/ui/form-error";
import { ErrorState, LoadingState } from "@/components/ui/query-state";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { errorMessage } from "@/lib/api/client";
import { useChangePassword, useRevokeOtherSessions, useRevokeSession, useSessions } from "@/lib/api/hooks/use-account";
import { useLogout } from "@/lib/api/hooks/use-auth";
import type { UserSession } from "@/lib/api/types";
import { formatLastAccess } from "@/lib/format";
import { hardNavigate } from "@/lib/hard-navigate";
import { deviceLabel } from "@/lib/user-agent";

const MIN_PASSWORD_LENGTH = 8;

export function SecurityTab() {
  const sessions = useSessions();
  const currentSession = sessions.data?.find((s) => s.isCurrent);

  return (
    <div className="grid gap-4">
      <PasswordCard currentSession={currentSession} />
      <SessionsCard sessions={sessions.data} isError={sessions.isError} onRetry={() => sessions.refetch()} />
    </div>
  );
}

function PasswordCard({ currentSession }: { currentSession?: UserSession }) {
  const changePassword = useChangePassword();
  const logout = useLogout();
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("newPassword"));
    if (newPassword !== form.get("confirmPassword")) {
      setValidationError("As senhas não coincidem.");
      return;
    }
    changePassword.mutate({ currentPassword: String(form.get("currentPassword")), newPassword });
  }

  if (changePassword.isSuccess) {
    return (
      <Card>
        <CardBody className="grid max-w-155 gap-3">
          <div className="text-[15px] font-semibold text-gray-900">Senha alterada</div>
          <p className="text-sm text-gray-500">
            Por segurança, todas as sessões foram encerradas, inclusive esta. Entre novamente com a nova senha.
          </p>
          <div>
            <Button
              loading={logout.isPending}
              onClick={() => logout.mutate(undefined, { onSettled: () => hardNavigate("/login") })}
            >
              Entrar novamente
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  const error =
    validationError ??
    (changePassword.isError ? errorMessage(changePassword.error, "Não foi possível alterar a senha. Tente novamente.") : null);

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader className="flex flex-col items-start gap-0.5">
          <span className="text-[17px]">Segurança</span>
          <span className="text-[13px] font-normal text-gray-500">Senha e sessões ativas.</span>
        </CardHeader>
        <CardBody className="grid max-w-155 gap-4">
          <div className="text-[15px] font-semibold text-gray-900">Alterar senha</div>
          {error ? <FormError>{error}</FormError> : null}
          <div>
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
                placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
              />
            </div>
          </div>
          {currentSession ? (
            <div className="flex items-center justify-between rounded-[10px] border border-gray-200 p-3.5">
              <div>
                <div className="text-sm font-medium text-gray-900">Sessão atual</div>
                <div className="mt-0.5 text-[12.5px] text-gray-500">
                  {deviceLabel(currentSession.userAgent)}
                  {currentSession.ipAddress ? ` · ${currentSession.ipAddress}` : ""} · ativa agora
                </div>
              </div>
              <Badge tone="success" className="whitespace-nowrap">Este dispositivo</Badge>
            </div>
          ) : null}
        </CardBody>
        <CardFooter className="flex justify-end py-3.5">
          <Button type="submit" loading={changePassword.isPending}>
            Atualizar senha
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function SessionsCard({
  sessions,
  isError,
  onRetry,
}: {
  sessions?: UserSession[];
  isError: boolean;
  onRetry: () => void;
}) {
  const revoke = useRevokeSession();
  const revokeOthers = useRevokeOtherSessions();
  const hasOthers = Boolean(sessions?.some((s) => !s.isCurrent));
  const actionError = revoke.error ?? revokeOthers.error;

  return (
    <Card>
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4.5 py-4">
        <div>
          <div className="text-[15.5px] font-semibold">Sessões ativas</div>
          <div className="mt-0.5 text-[12.5px] text-gray-500">Dispositivos com acesso à sua conta.</div>
        </div>
        <Button
          variant="destructive-soft"
          size="sm"
          disabled={!hasOthers}
          loading={revokeOthers.isPending}
          onClick={() => revokeOthers.mutate()}
        >
          Encerrar outras sessões
        </Button>
      </div>
      {actionError ? (
        <FormError className="m-4.5 mb-0">
          {errorMessage(actionError, "Não foi possível encerrar a sessão. Tente novamente.")}
        </FormError>
      ) : null}
      {sessions ? (
        <Table>
          <TableHead>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHeaderCell>Dispositivo</TableHeaderCell>
              <TableHeaderCell>Endereço IP</TableHeaderCell>
              <TableHeaderCell>Último acesso</TableHeaderCell>
              <TableHeaderCell className="w-30" />
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="font-medium text-gray-900">{deviceLabel(session.userAgent)}</TableCell>
                <TableCell className="tabular-nums text-gray-600">{session.ipAddress ?? "—"}</TableCell>
                <TableCell className="text-gray-500">
                  {session.isCurrent ? "Agora" : formatLastAccess(session.lastAccessAt)}
                </TableCell>
                <TableCell align="right">
                  {session.isCurrent ? (
                    <Badge tone="success" className="whitespace-nowrap">Este dispositivo</Badge>
                  ) : (
                    <button
                      type="button"
                      onClick={() => revoke.mutate(session.id)}
                      disabled={revoke.isPending}
                      className="text-[13px] font-medium text-error-text hover:underline"
                    >
                      Encerrar
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : isError ? (
        <ErrorState title="Não foi possível carregar as sessões" onRetry={onRetry} />
      ) : (
        <LoadingState title="Carregando sessões" description="Buscando os dispositivos conectados." />
      )}
    </Card>
  );
}
