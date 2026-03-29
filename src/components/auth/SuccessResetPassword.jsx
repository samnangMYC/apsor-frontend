import { ArrowRight, CheckCircle2, ChevronLeft, Mail } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useLang } from "../../i18n/useLang";

const UI_TEXT = {
  en: {
    badge: "Email sent",
    title: "Check your inbox",
    subtitle: "We sent a password reset link to your email address.",
    emailLabel: "Sent to",
    note: "If you do not see the email, check your spam folder or try again.",
    primaryAction: "Back to sign in",
    secondaryAction: "Send again",
  },
  km: {
    badge: "បានផ្ញើអ៊ីមែល",
    title: "សូមពិនិត្យប្រអប់សំបុត្រ",
    subtitle: "យើងបានផ្ញើតំណកំណត់ពាក្យសម្ងាត់ទៅអ៊ីមែលរបស់អ្នក។",
    emailLabel: "បានផ្ញើទៅ",
    note: "បើអ្នកមិនឃើញអ៊ីមែល សូមពិនិត្យ spam ឬសាកល្បងម្តងទៀត។",
    primaryAction: "ត្រឡប់ទៅចូលគណនី",
    secondaryAction: "ផ្ញើម្តងទៀត",
  },
};

export default function SuccessResetPassword() {
  const location = useLocation();
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const email = location.state?.email || sessionStorage.getItem("apsor:forgotPasswordEmail") || "";

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-app px-6 py-8 sm:px-10 md:px-20 lg:px-28 xl:px-36">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-bg-surface shadow-3">
        <section className="relative p-6 sm:p-8 md:p-10">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-info to-success"
            aria-hidden="true"
          />

          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {text.badge}
            </span>

            <div className="mt-5 flex h-18 w-18 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Mail className="h-8 w-8" />
            </div>

            <img
              src="/logo-preview.png"
              alt="Apsor Logo"
              className="mt-5 h-12 w-auto object-contain sm:h-14"
            />

            <h1 className="mt-5 text-3xl font-bold text-text-primary">{text.title}</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-text-secondary sm:text-base">
              {text.subtitle}
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-bg-app px-4 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">{text.emailLabel}</p>
            <p className="mt-2 break-all text-base font-semibold text-text-primary">{email}</p>
          </div>

          <p className="mt-5 text-center text-sm text-text-secondary">{text.note}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/signin"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover active:bg-brand-pressed"
            >
              {text.primaryAction}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/forgot-password"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-bg-surface px-5 text-sm font-semibold text-text-secondary transition hover:border-brand/35 hover:text-brand"
            >
              <ChevronLeft className="h-4 w-4" />
              {text.secondaryAction}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
