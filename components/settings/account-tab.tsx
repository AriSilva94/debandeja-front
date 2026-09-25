"use client";

import { useState, type FormEvent } from "react";
import { MailCheck } from "lucide-react";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldHint } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { FormError } from "@/components/ui/form-error";
import { ErrorState, LoadingState } from "@/components/ui/query-state";
import { ToggleRow } from "@/components/settings/toggle-row";
import { errorMessage } from "@/lib/api/client";
import {
  useCancelEmailChange,
  useRequestEmailChange,
  useUpdateNotificationSettings,
  useUpdateProfile,
} from "@/lib/api/hooks/use-account";
import { useMe } from "@/lib/api/hooks/use-me";
import { useSessionContext } from "@/lib/api/hooks/use-session";
import type { Me, NotificationSettings } from "@/lib/api/types";
import { initials } from "@/lib/avatar";
import { ROLE_LABEL } from "@/lib/roles";

const NOTIFICATIONS: { key: keyof NotificationSettings; title: string; description: string }[] = [
  { key: "dailySummary", title: "Resumo diário da operação", description: "Entradas, saídas e alertas do dia anterior, às 08:00." },
  { key: "inviteAlerts", title: "Convites e mudanças de permissão", description: "Quando alguém entra na equipe ou troca de função." },
  { key: "productNews", title: "Novidades do produto", description: "No máximo um e-mail por mês." },
];

export function AccountTab() {
  const me = useMe();

  if (me.isPending) {
    return (
      <Card>
        <LoadingState title="Carregando conta" description="Buscando seus dados de acesso." />
      </Card>
    );
  }
  if (me.isError) {
    return (
      <Card>
        <ErrorState title="Não foi possível carregar sua conta" onRetry={() => me.refetch()} />
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <ProfileCard me={me.data} />
      <NotificationsCard settings={me.data.notificationSettings} />
    </div>
  );
}

function ProfileCard({ me }: { me: Me }) {
  const context = useSessionContext().data;
  const update = useUpdateProfile();
  const cancelEmailChange = useCancelEmailChange();
  const [name, setName] = useState(me.name);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update.mutate({ name: name.trim() });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader className="flex flex-col items-start gap-0.5">
          <span className="text-[17px]">Conta</span>
          <span className="text-[13px] font-normal text-gray-500">Seus dados pessoais de acesso.</span>
        </CardHeader>
        <CardBody className="grid max-w-155 gap-4">
          <div className="flex items-center gap-3.5 border-b border-gray-100 pb-4">
            <Avatar initials={initials(me.name)} size="lg" />
            <div className="flex-1">
              <div className="text-[14.5px] font-semibold text-gray-900">{me.name}</div>
              {context ? (
                <div className="text-[13px] text-gray-500">
                  {ROLE_LABEL[context.role]} · {context.tenant.name}
                </div>
              ) : null}
            </div>
          </div>
          {update.isError ? (
            <FormError>{errorMessage(update.error, "Não foi possível salvar. Tente novamente.")}</FormError>
          ) : null}
          <div>
            <Label htmlFor="accountName">Nome</Label>
            <Input id="accountName" required minLength={2} value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="accountEmail">E-mail</Label>
            <div className="flex gap-2.5">
              <Input id="accountEmail" type="email" value={me.email} readOnly className="bg-gray-50" />
              <Button type="button" variant="secondary" onClick={() => setEmailModalOpen(true)} className="shrink-0">
                Alterar
              </Button>
            </div>
            {me.pendingEmail ? (
              <div role="status" className="mt-2 flex flex-wrap items-center gap-x-2 text-[12.5px] text-warning-text">
                <span>
                  Aguardando confirmação de <strong>{me.pendingEmail}</strong>. Abra o link enviado para esse endereço.
                </span>
                <button
                  type="button"
                  onClick={() => cancelEmailChange.mutate()}
                  disabled={cancelEmailChange.isPending}
                  className="font-medium underline-offset-2 hover:underline"
                >
                  Cancelar troca
                </button>
              </div>
            ) : (
              <FieldHint>Usado para login e notificações do sistema.</FieldHint>
            )}
          </div>
        </CardBody>
        <CardFooter className="flex items-center justify-end gap-2.5 py-3.5">
          {update.isSuccess ? (
            <span role="status" className="mr-auto text-[13px] text-success-text">
              Alterações salvas.
            </span>
          ) : null}
          <Button type="submit" loading={update.isPending} disabled={name.trim() === me.name}>
            Salvar alterações
          </Button>
        </CardFooter>
      </form>
      <EmailChangeModal open={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
    </Card>
  );
}

function EmailChangeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const request = useRequestEmailChange();

  function close() {
    request.reset();
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    request.mutate(
      { newEmail: String(form.get("newEmail")).trim(), currentPassword: String(form.get("currentPassword")) },
      { onSuccess: close },
    );
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Alterar e-mail"
      description="Enviaremos um link para o novo endereço. O login só muda depois da confirmação."
      icon={MailCheck}
      widthClassName="w-110"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button form="email-change-form" type="submit" loading={request.isPending}>
            Enviar confirmação
          </Button>
        </>
      }
    >
      <form id="email-change-form" onSubmit={handleSubmit} className="grid gap-4">
        {request.isError ? (
          <FormError>{errorMessage(request.error, "Não foi possível enviar. Tente novamente.")}</FormError>
        ) : null}
        <div>
          <Label htmlFor="newEmail">Novo e-mail</Label>
          <Input id="newEmail" name="newEmail" type="email" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="emailChangePassword">Senha atual</Label>
          <Input id="emailChangePassword" name="currentPassword" type="password" required autoComplete="current-password" />
          <FieldHint>Confirma que é você pedindo a troca.</FieldHint>
        </div>
      </form>
    </Modal>
  );
}

function NotificationsCard({ settings }: { settings: NotificationSettings }) {
  const update = useUpdateNotificationSettings();

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-0.5">
        <span>Notificações</span>
        <span className="text-[12.5px] font-normal text-gray-500">O que você recebe por e-mail nesta conta.</span>
      </CardHeader>
      <CardBody>
        {update.isError ? (
          <FormError className="mb-3">{errorMessage(update.error, "Não foi possível salvar. Tente novamente.")}</FormError>
        ) : null}
        {NOTIFICATIONS.map(({ key, title, description }) => (
          <ToggleRow
            key={key}
            title={title}
            description={description}
            checked={settings[key]}
            disabled={update.isPending}
            onChange={(checked) => update.mutate({ [key]: checked })}
          />
        ))}
      </CardBody>
    </Card>
  );
}
