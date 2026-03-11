import { useEffect, useId } from "react";
import { X } from "lucide-react";

export default function Modal({
  open = false,
  title,
  description,
  closeLabel = "Close",
  onClose,
  children,
  footer,
  headerIcon = null,
  widthClassName = "max-w-lg",
  zIndexClassName = "z-50",
  overlayClassName = "",
  panelClassName = "",
  bodyClassName = "",
  headerClassName = "",
  footerClassName = "",
  closeOnOverlayClick = true,
  showCloseButton = true,
}) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayMouseDown = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className={`modal-overlay-enter fixed inset-0 ${zIndexClassName} flex items-center justify-center bg-scrim/70 px-4 py-6 ${overlayClassName}`}
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={`modal-panel-enter w-full ${widthClassName} rounded-2xl border border-border bg-bg-surface shadow-3 ${panelClassName}`}
      >
        {(title || description || showCloseButton) ? (
          <div className={`flex items-start justify-between gap-3 border-b border-border px-5 py-4 ${headerClassName}`}>
            <div className="flex min-w-0 items-start gap-3">
              {headerIcon}
              <div className="min-w-0">
                {title ? (
                  <h3 id={titleId} className="text-lg font-bold text-text-primary">
                    {title}
                  </h3>
                ) : null}
                {description ? (
                  <p id={descriptionId} className="mt-1 text-sm text-text-secondary">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>

            {showCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex hover:cursor-pointer h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-surface text-text-secondary transition hover:border-brand/35 hover:text-brand"
                aria-label={closeLabel}
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ) : null}

        <div className={bodyClassName}>{children}</div>

        {footer ? (
          <div className={`flex items-center justify-end gap-2 border-t border-border px-5 py-4 ${footerClassName}`}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
