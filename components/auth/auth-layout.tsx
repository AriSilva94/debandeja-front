import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh min-w-0 grid-rows-[auto_minmax(0,1fr)] bg-background lg:grid-cols-[minmax(22rem,40%)_minmax(0,1fr)] lg:grid-rows-1">
      {children}
    </div>
  );
}

type AuthPanelProps = {
  heading: string;
  description: string;
  features?: string[];
};

export function AuthPanel({ heading, description, features }: AuthPanelProps) {
  return (
    <aside className="relative flex min-h-24 items-center overflow-hidden bg-brand px-5 py-4 lg:min-h-dvh lg:flex-col lg:items-stretch lg:justify-between lg:px-12 lg:py-10 xl:px-16 xl:py-12">
      <div className="pointer-events-none absolute -right-12 -top-18 hidden h-64 w-64 rounded-full border border-accent/25 lg:block" />
      <div className="pointer-events-none absolute -right-28 top-20 hidden h-80 w-80 rounded-full border border-white/10 lg:block" />
      <div className="pointer-events-none absolute bottom-0 left-0 hidden h-1 w-2/3 bg-accent lg:block" />

      <div className="relative w-fit overflow-hidden rounded-xl bg-white p-1 shadow-lg lg:rounded-2xl lg:p-2">
        <BrandLogo className="w-20 lg:w-36" priority />
      </div>

      <div className="relative hidden max-w-110 lg:block">
        <h1 className="mb-5 text-[38px] font-semibold leading-[1.12] tracking-[-0.03em] text-white xl:text-[42px]">
          {heading}
        </h1>
        <p className="max-w-100 text-[15px] leading-7 text-emerald-50/80">{description}</p>
        {features?.length ? (
          <div className="mt-9 flex flex-col gap-4">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent-dark">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-sm text-emerald-50/90">{feature}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative hidden text-[12.5px] text-emerald-50/55 lg:block">
        © 2026 Debandeja Sistemas · Suporte
      </div>
    </aside>
  );
}

export function AuthFormPane({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-0 min-w-0 items-start justify-center bg-background px-4 py-8 sm:px-8 sm:py-12 lg:items-center lg:px-12">
      <div className="w-full min-w-0 max-w-110 rounded-2xl bg-white p-6 shadow-lg sm:p-8">{children}</div>
    </main>
  );
}

export function AuthFormPaneWide({ children }: { children: ReactNode }) {
  return <AuthFormPane>{children}</AuthFormPane>;
}
