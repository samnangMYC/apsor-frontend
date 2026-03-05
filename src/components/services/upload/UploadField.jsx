const DEFAULT_LABEL_CLASS_NAME =
  "mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary";

export default function UploadField({
  label = "",
  children,
  className = "block",
  labelClassName = DEFAULT_LABEL_CLASS_NAME,
}) {
  return (
    <label className={className}>
      {label ? <span className={labelClassName}>{label}</span> : null}
      {children}
    </label>
  );
}
