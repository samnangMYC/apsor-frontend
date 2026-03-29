import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Lock, Mail, ShieldCheck } from "lucide-react";
import { useLang } from "../../i18n/useLang";
import AuthStepProgress from "../../components/auth/AuthStepProgress";

const UI_TEXT = {
  en: {
    title: "Reset Password",
    subtitle: "Set your new password to finish recovery.",
    step1: "1. Enter email",
    step2: "2. Verify OTP",
    step3: "3. Reset password",
    newPassword: "New password",
    newPasswordPlaceholder: "NewStrongPass123!",
    rePassword: "Re-enter password",
    rePasswordPlaceholder: "Re-enter new password",
    resetPassword: "Reset password",
    back: "Back",
    missingToken: "Reset session expired. Please verify OTP again.",
    requiredPassword: "New password and re-enter password are required.",
    weakPassword: "New password must be at least 8 characters.",
    passwordMismatch: "New password and re-enter password do not match.",
    successMessage: "Password reset successful. You can sign in now.",
    signInNow: "Sign in now",
  },
  km: {
    title: "កំណត់ពាក្យសម្ងាត់ថ្មី",
    subtitle: "កំណត់ពាក្យសម្ងាត់ថ្មីដើម្បីបញ្ចប់ការស្តារគណនី។",
    step1: "១. បញ្ចូលអ៊ីមែល",
    step2: "២. ផ្ទៀងផ្ទាត់ OTP",
    step3: "៣. កំណត់ពាក្យសម្ងាត់ថ្មី",
    newPassword: "ពាក្យសម្ងាត់ថ្មី",
    newPasswordPlaceholder: "NewStrongPass123!",
    rePassword: "បញ្ចូលពាក្យសម្ងាត់ម្តងទៀត",
    rePasswordPlaceholder: "បញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត",
    resetPassword: "កំណត់ពាក្យសម្ងាត់ថ្មី",
    back: "ត្រឡប់ក្រោយ",
    missingToken: "សម័យកំណត់ពាក្យសម្ងាត់អស់សុពលភាព។ សូមផ្ទៀងផ្ទាត់ OTP ម្តងទៀត។",
    requiredPassword: "ពាក្យសម្ងាត់ថ្មី និងការបញ្ចូលម្តងទៀត ត្រូវបានទាមទារ។",
    weakPassword: "ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ តួអក្សរ។",
    passwordMismatch: "ពាក្យសម្ងាត់ថ្មី និងការបញ្ចូលម្តងទៀត មិនដូចគ្នា។",
    successMessage: "កំណត់ពាក្យសម្ងាត់បានជោគជ័យ។ អ្នកអាចចូលគណនីបានហើយ។",
    signInNow: "ចូលគណនីឥឡូវ",
  },
};

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const stepItems = [
    { label: text.step1, icon: Mail },
    { label: text.step2, icon: ShieldCheck },
    { label: text.step3, icon: Lock },
  ];

  const tokenFromState = location.state?.resetToken || sessionStorage.getItem("apsor:mockResetToken") || "";
  const [resetToken] = useState(tokenFromState);
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const safeToken = String(resetToken || "").trim();
    const safePassword = String(newPassword || "");
    const safeRePassword = String(rePassword || "");

    if (!safeToken) {
      setError(text.missingToken);
      return;
    }
    if (!safePassword || !safeRePassword) {
      setError(text.requiredPassword);
      return;
    }
    if (safePassword.length < 8) {
      setError(text.weakPassword);
      return;
    }
    if (safePassword !== safeRePassword) {
      setError(text.passwordMismatch);
      return;
    }

    const payload = {
      resetToken: safeToken,
      newPassword: safePassword,
    };
    sessionStorage.setItem("apsor:resetPasswordPayload", JSON.stringify(payload));
    setError("");
    setSuccess(true);
  };

  return (
    <main className="flex items-center justify-center bg-bg-app px-6 py-8 sm:px-10 md:px-20 lg:px-28 xl:px-36">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-2">
        <section className="p-5 sm:p-7 md:p-8">
          <div className="flex flex-col items-center text-center">
            <img
              src="/logo-preview.png"
              alt="Apsor Logo"
              className="h-12 w-auto object-contain sm:h-14"
            />
            <h2 className="mt-3 text-2xl font-bold text-text-primary">{text.title}</h2>
            <p className="mt-1 text-sm text-text-secondary">{text.subtitle}</p>
          </div>

          <AuthStepProgress steps={stepItems} currentStep={3} />

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                {text.newPassword}
              </span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder={text.newPasswordPlaceholder}
                  autoComplete="new-password"
                  className="h-11 w-full rounded-lg border border-border bg-bg-app pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                {text.rePassword}
              </span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  value={rePassword}
                  onChange={(event) => setRePassword(event.target.value)}
                  placeholder={text.rePasswordPlaceholder}
                  autoComplete="new-password"
                  className="h-11 w-full rounded-lg border border-border bg-bg-app pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </label>

            {error ? (
              <div className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                {text.successMessage}
              </div>
            ) : null}

            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover active:bg-brand-pressed"
            >
              <Lock className="h-4 w-4" />
              {text.resetPassword}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between gap-3 text-sm text-text-secondary">
            <Link
              to="/forgot-password/otp"
              className="inline-flex items-center gap-1 font-semibold text-text-secondary transition hover:text-brand"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {text.back}
            </Link>

            {success ? (
              <button
                type="button"
                onClick={() => navigate("/signin")}
                className="font-semibold text-brand hover:text-brand-hover"
              >
                {text.signInNow}
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
