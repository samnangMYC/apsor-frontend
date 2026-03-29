import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Mail } from "lucide-react";
import { useLang } from "../../i18n/useLang";
import AuthStepProgress from "../../components/auth/AuthStepProgress";
import { forgotPassword } from "../../api";
import { extractAuthErrorMessage, isEmail } from "./signInUtils";

const UI_TEXT = {
  en: {
    title: "Forgot Password",
    subtitle: "Enter your email and we will send you a password reset link.",
    email: "Email address",
    emailPlaceholder: "khon.samnang@diu.edu.kh",
    sendOtp: "Send reset link",
    backToSignIn: "Back to Sign in",
    requiredEmail: "Email is required.",
    invalidEmail: "Please enter a valid email address.",
    sendFailed: "Unable to send reset email. Please try again.",
    sending: "Sending reset link...",
  },
  km: {
    title: "ភ្លេចពាក្យសម្ងាត់",
    subtitle: "បញ្ចូលអ៊ីមែលរបស់អ្នក ហើយយើងនឹងផ្ញើតំណកំណត់ពាក្យសម្ងាត់ឡើងវិញ។",
    email: "អាសយដ្ឋានអ៊ីមែល",
    emailPlaceholder: "khon.samnang@diu.edu.kh",
    sendOtp: "ផ្ញើតំណកំណត់ពាក្យសម្ងាត់",
    backToSignIn: "ត្រឡប់ទៅចូលគណនី",
    requiredEmail: "សូមបញ្ចូលអ៊ីមែល។",
    invalidEmail: "សូមបញ្ចូលអ៊ីមែលឱ្យត្រឹមត្រូវ។",
    sendFailed: "មិនអាចផ្ញើអ៊ីមែលកំណត់ពាក្យសម្ងាត់បានទេ។ សូមព្យាយាមម្តងទៀត។",
    sending: "កំពុងផ្ញើតំណកំណត់ពាក្យសម្ងាត់...",
  },
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const safeEmail = String(email || "").trim();

    if (!safeEmail) {
      setError(text.requiredEmail);
      return;
    }
    if (!isEmail(safeEmail)) {
      setError(text.invalidEmail);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = { email: safeEmail };
      const response = await forgotPassword(payload);

      if (response?.success === false) {
        throw new Error(response?.message || text.sendFailed);
      }

      sessionStorage.setItem("apsor:forgotPasswordPayload", JSON.stringify(payload));
      sessionStorage.setItem("apsor:forgotPasswordEmail", safeEmail);
      navigate("/forgot-password/success", { replace: true, state: { email: safeEmail } });
    } catch (requestError) {
      setError(extractAuthErrorMessage(requestError, text.sendFailed));
    } finally {
      setIsSubmitting(false);
    }
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
          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                {text.email}
              </span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={text.emailPlaceholder}
                  autoComplete="email"
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
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover active:bg-brand-pressed"
            >
              <Mail className="h-4 w-4" />
              {isSubmitting ? text.sending : text.sendOtp}
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
