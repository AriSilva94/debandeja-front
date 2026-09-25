"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { useLogout } from "@/lib/api/hooks/use-auth";
import { useMe } from "@/lib/api/hooks/use-me";
import { useSessionContext } from "@/lib/api/hooks/use-session";
import { initials } from "@/lib/avatar";
import { cn } from "@/lib/cn";
import { hardNavigate } from "@/lib/hard-navigate";
import { ROLE_LABEL } from "@/lib/roles";
import { useClickOutside } from "@/lib/use-click-outside";

const ITEM_CLASSES = "flex h-8.5 w-full items-center gap-2.25 rounded-lg px-2.5 text-[13.5px]";

type UserMenuProps =
  | { variant: "header" }
  | { variant: "sidebar"; collapsed: boolean };

export function UserMenu(props: UserMenuProps) {
  const me = useMe().data;
  const role = useSessionContext().data?.role;
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  function signOut() {
    logout.mutate(undefined, { onSettled: () => hardNavigate("/login") });
  }

  const isSidebar = props.variant === "sidebar";
  const collapsed = isSidebar && props.collapsed;
  const avatar = me ? initials(me.name) : null;

  return (
    <div
      ref={ref}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-label={me ? `Menu do usuário ${me.name}` : "Menu do usuário"}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/30",
          isSidebar
            ? "flex w-full items-center gap-2.5 rounded-lg p-1.5 hover:bg-gray-100"
            : "flex h-8.5 w-8.5 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white hover:bg-brand-dark",
        )}
      >
        {isSidebar ? (
          <>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
              {avatar}
            </span>
            {collapsed ? null : (
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-[13px] font-semibold text-gray-900">{me?.name}</span>
                <span className="block text-[11.5px] text-gray-500">{role ? ROLE_LABEL[role] : null}</span>
              </span>
            )}
          </>
        ) : (
          avatar
        )}
      </button>
      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute z-40 min-w-56 rounded-[10px] border border-gray-200 bg-white p-1.5 shadow-md",
            !isSidebar && "right-0 top-10.5",
            isSidebar && !collapsed && "bottom-full left-0 right-0 mb-2",
            collapsed && "bottom-0 left-full ml-2",
          )}
        >
          {me ? (
            <div className="border-b border-gray-100 px-2.5 pb-2 pt-1.5">
              <div className="truncate text-[13.5px] font-semibold text-gray-900">{me.name}</div>
              <div className="truncate text-xs text-gray-500" title={me.email}>{me.email}</div>
            </div>
          ) : null}
          <div className="pt-1.5">
            <Link
              href="/configuracoes?aba=conta"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(ITEM_CLASSES, "text-gray-700 hover:bg-gray-100")}
            >
              <UserRound size={15} strokeWidth={1.9} />
              Meu perfil
            </Link>
            <button
              type="button"
              role="menuitem"
              disabled={logout.isPending}
              onClick={signOut}
              className={cn(ITEM_CLASSES, "text-error-text hover:bg-error-bg disabled:opacity-60")}
            >
              <LogOut size={15} strokeWidth={1.9} />
              {logout.isPending ? "Saindo…" : "Sair"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
