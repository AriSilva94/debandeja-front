import { cn } from "@/lib/cn";

type StepIndicatorProps = {
  steps: string[];
  activeStep: number;
  className?: string;
};

export function StepIndicator({ steps, activeStep, className }: StepIndicatorProps) {
  return (
    <div className={className}>
      <div className="mb-2.5 flex items-center justify-between gap-4 text-xs">
        <span className="font-semibold text-brand">Etapa {activeStep} de {steps.length}</span>
        <span className="truncate font-medium text-gray-600">{steps[activeStep - 1]}</span>
      </div>
      <ol aria-label="Progresso do cadastro" className="flex gap-1.5">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const done = stepNumber < activeStep;
          const active = stepNumber === activeStep;
          return (
            <li
              key={label}
              aria-current={active ? "step" : undefined}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                done ? "bg-accent" : active ? "bg-brand" : "bg-gray-200",
              )}
            >
              <span className="sr-only">{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
