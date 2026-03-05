const ACTIVE_CLASS_NAME = "border-brand/60 bg-brand-soft/60 text-brand shadow-1";
const INACTIVE_CLASS_NAME = "border-border bg-bg-surface text-text-secondary hover:border-brand/35";

const SIZE_CLASS_MAP = {
  md: "h-10 px-3 text-sm",
  sm: "h-9 text-xs",
  pill: "h-7 px-2.5 text-[11px]",
};

export default function UploadToggleButton({
  active = false,
  disabled = false,
  onClick,
  children,
  size = "md",
  className = "",
  type = "button",
}) {
  const safeSizeClassName = SIZE_CLASS_MAP[size] || SIZE_CLASS_MAP.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg border font-semibold transition ${safeSizeClassName} ${
        active ? ACTIVE_CLASS_NAME : INACTIVE_CLASS_NAME
      } ${className} disabled:cursor-not-allowed disabled:opacity-60`.trim()}
    >
      {children}
    </button>
  );
}
