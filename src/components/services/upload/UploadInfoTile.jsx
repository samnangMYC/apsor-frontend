export default function UploadInfoTile({
  title,
  value,
  hint = "",
  className = "",
  valueClassName = "break-words",
}) {
  return (
    <div className={`rounded-md border border-border bg-bg-subtle px-2.5 py-2 ${className}`.trim()}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">{title}</p>
      <p className={`mt-1 text-text-primary ${valueClassName}`.trim()}>{value || "-"}</p>
      {hint ? <p className="mt-1 text-[11px] text-text-muted">{hint}</p> : null}
    </div>
  );
}
