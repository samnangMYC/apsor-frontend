import { Check } from "lucide-react";

export default function AuthStepProgress({ steps = [], currentStep = 1, className = "" }) {
  return (
    <ol
      className={`mt-5 grid gap-2 ${className}`}
      style={{ gridTemplateColumns: `repeat(${Math.max(steps.length, 1)}, minmax(0, 1fr))` }}
      aria-label="Recovery progress"
    >
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const Icon = step?.icon;

        return (
          <li
            key={`${step?.label || "step"}-${stepNumber}`}
            className={`rounded-lg border px-2 py-2.5 text-center transition ${
              isActive
                ? "border-brand/45 bg-brand-soft/55 shadow-1"
                : isCompleted
                  ? "border-brand/35 bg-brand-soft/25"
                  : "border-border bg-bg-subtle"
            }`}
            aria-current={isActive ? "step" : undefined}
          >
            <span
              className={`mx-auto mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                isActive
                  ? "border-brand bg-brand text-white"
                  : isCompleted
                    ? "border-brand/45 bg-brand-soft text-brand"
                    : "border-border bg-bg-surface text-text-muted"
              }`}
            >
              {isCompleted ? (
                <Check className="h-3.5 w-3.5" />
              ) : Icon ? (
                <Icon className="h-3.5 w-3.5" />
              ) : (
                <span className="text-[10px] font-bold">{stepNumber}</span>
              )}
            </span>
            <p
              className={`text-[11px] font-semibold leading-snug ${
                isActive ? "text-brand" : isCompleted ? "text-text-primary" : "text-text-muted"
              }`}
            >
              {step?.label || `Step ${stepNumber}`}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
