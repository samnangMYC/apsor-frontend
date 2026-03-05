const BASE_CLASS_NAME =
  "rounded-2xl border border-border bg-linear-to-br from-bg-app/95 to-brand-soft/30 p-4 shadow-1 sm:p-5";

export default function UploadStepCard({
  title = "",
  action = null,
  children,
  className = "",
  contentClassName = "mt-3 space-y-3",
}) {
  return (
    <div className={`${BASE_CLASS_NAME} ${className}`.trim()}>
      {title || action ? (
        <div className="flex items-center justify-between gap-2">
          {title ? <h2 className="text-sm font-semibold text-text-primary">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
