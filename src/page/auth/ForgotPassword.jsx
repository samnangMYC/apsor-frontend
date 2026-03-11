import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { useLang } from "../../i18n/useLang";
import AuthStepProgress from "../../components/auth/AuthStepProgress";

const UI_TEXT = {
  en: {
    title: "Forgot Password",
    subtitle: "Reset your account password in 3 quick steps.",
    step1: "1. Enter phone number",
    step2: "2. Verify OTP",
    step3: "3. Reset password",
    phoneNumber: "Phone number",
    phonePlaceholder: "093528356",
    sendOtp: "Send OTP",
    backToSignIn: "Back to Sign in",
    requiredPhone: "Phone number is required.",
    invalidPhone: "Please enter a valid phone number.",
  },
  km: {
    title: "ភ្លេចពាក្យសម្ងាត់",
    subtitle: "កំណត់ពាក្យសម្ងាត់ឡើងវិញជា ៣ ជំហានយ៉ាងឆាប់រហ័ស។",
    step1: "១. បញ្ចូលលេខទូរស័ព្ទ",
    step2: "២. ផ្ទៀងផ្ទាត់ OTP",
    step3: "៣. កំណត់ពាក្យសម្ងាត់ថ្មី",
    phoneNumber: "លេខទូរស័ព្ទ",
    phonePlaceholder: "093528356",
    sendOtp: "ផ្ញើ OTP",
    backToSignIn: "ត្រឡប់ទៅចូលគណនី",
    requiredPhone: "សូមបញ្ចូលលេខទូរស័ព្ទ។",
    invalidPhone: "សូមបញ្ចូលលេខទូរស័ព្ទឱ្យត្រឹមត្រូវ។",
  },
};

function isPhone(value) {
  return /^0\d{7,9}$/.test(String(value || "").trim().replace(/\s+/g, ""));
}

function normalizePhone(value) {
  const normalized = String(value || "").trim().replace(/\s+/g, "");
  if (normalized.startsWith("+855")) return `0${normalized.slice(4)}`;
  if (normalized.startsWith("855")) return `0${normalized.slice(3)}`;
  return normalized;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const stepItems = [
    { label: text.step1, icon: Smartphone },
    { label: text.step2, icon: ShieldCheck },
    { label: text.step3, icon: Lock },
  ];
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const safePhone = normalizePhone(phoneNumber);
    if (!safePhone) {
      setError(text.requiredPhone);
      return;
    }
    if (!isPhone(safePhone)) {
      setError(text.invalidPhone);
      return;
    }

    const payload = { phoneNumber: safePhone };
    sessionStorage.setItem("apsor:forgotPasswordPayload", JSON.stringify(payload));
    sessionStorage.setItem("apsor:forgotPasswordPhone", safePhone);
    setError("");
    navigate("/forgot-password/otp", { state: { phoneNumber: safePhone } });
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

          <AuthStepProgress steps={stepItems} currentStep={1} />

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                {text.phoneNumber}
              </span>
              <div className="relative">
                <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder={text.phonePlaceholder}
                  autoComplete="tel"
                  className="h-11 w-full rounded-lg border border-border bg-bg-app pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </label>

            {error ? (
              <div className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover active:bg-brand-pressed"
            >
              <Smartphone className="h-4 w-4" />
              {text.sendOtp}
            </button>
          </form>

          <div className="mt-5 text-sm text-text-secondary">
            <Link
              to="/signin"
              className="inline-flex items-center gap-1 font-semibold text-text-secondary transition hover:text-brand"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {text.backToSignIn}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
