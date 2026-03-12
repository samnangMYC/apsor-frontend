import { CheckCircle2, CircleAlert, X } from "lucide-react";

const TONE_STYLES = {
  success: {
    icon: CheckCircle2,
    shell: "border-success/20 bg-success/8 text-success",
  },
  error: {
    icon: CircleAlert,
    shell: "border-danger/20 bg-danger/8 text-danger",
  },
};

export default function AdminToast({
  toast,
  onClose,
}) {
  if (!toast?.message) {
    return null;
  }

  const tone = TONE_STYLES[toast.type] || TONE_STYLES.success;
  const Icon = tone.icon;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[80] w-full max-w-sm">
      <div className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-2 ${tone.shell}`}>
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{toast.title}</p>
            <p className="mt-1 text-sm opacity-90">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-current/15 bg-white/50 text-current transition hover:cursor-pointer hover:bg-white/70"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
