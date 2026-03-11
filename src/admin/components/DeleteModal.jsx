import { AlertTriangle } from "lucide-react";
import Modal from "../../components/shared/Modal";

const TONE_CLASS_MAP = {
  danger: {
    icon: "bg-danger/10 text-danger",
    button: "bg-danger text-white hover:bg-danger/90",
  },
  success: {
    icon: "bg-success/10 text-success",
    button: "bg-success text-white hover:bg-success/90",
  },
  info: {
    icon: "bg-brand-soft text-brand",
    button: "bg-brand text-white hover:bg-brand-hover",
  },
};

export default function DeleteModal({
  open = false,
  title,
  message,
  tone = "info",
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose,
}) {
  const classes = TONE_CLASS_MAP[tone] || TONE_CLASS_MAP.info;

  return (
    <Modal
      open={open}
      title={title}
      closeLabel={cancelLabel}
      onClose={onClose}
      widthClassName="max-w-md"
      zIndexClassName="z-[60]"
      headerIcon={(
        <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${classes.icon}`}>
          <AlertTriangle className="h-5 w-5" />
        </span>
      )}
      bodyClassName="px-5 py-5"
      footer={(
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center rounded-xl border border-border bg-bg-surface px-4 text-sm font-medium text-text-secondary transition hover:border-brand/35 hover:text-brand"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold transition ${classes.button}`}
          >
            {confirmLabel}
          </button>
        </>
      )}
    >
      <p className="text-sm leading-6 text-text-secondary">{message}</p>
    </Modal>
  );
}
