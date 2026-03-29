import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Lock, Mail, ShieldCheck } from "lucide-react";
import { useLang } from "../../i18n/useLang";
import AuthStepProgress from "../../components/auth/AuthStepProgress";

const UI_TEXT = {
  en: {
    title: "Verify OTP",
    subtitle: "Enter the OTP sent to your email address.",
    step1: "1. Enter email",
    step2: "2. Verify OTP",
    step3: "3. Reset password",
    email: "Email address",
    otp: "OTP code",
    otpPlaceholder: "123456",
    otpExpiresIn: "OTP expires in",
    otpExpired: "OTP expired. Please request a new OTP.",
    resendOtp: "Resend OTP",
    verifyOtp: "Verify OTP",
    back: "Back",
    requiredEmail: "Email is required. Please start again.",
    requiredOtp: "OTP is required.",
    invalidOtp: "OTP must be 6 digits.",
  },
  km: {
    title: "ផ្ទៀងផ្ទាត់ OTP",
    subtitle: "សូមបញ្ចូល OTP ដែលបានផ្ញើទៅអ៊ីមែលរបស់អ្នក។",
    step1: "១. បញ្ចូលអ៊ីមែល",
    step2: "២. ផ្ទៀងផ្ទាត់ OTP",
    step3: "៣. កំណត់ពាក្យសម្ងាត់ថ្មី",
    email: "អាសយដ្ឋានអ៊ីមែល",
    otp: "កូដ OTP",
    otpPlaceholder: "123456",
    otpExpiresIn: "OTP ផុតកំណត់ក្នុង",
    otpExpired: "OTP បានផុតកំណត់។ សូមស្នើ OTP ថ្មី។",
    resendOtp: "ស្នើ OTP ម្តងទៀត",
    verifyOtp: "ផ្ទៀងផ្ទាត់ OTP",
    back: "ត្រឡប់ក្រោយ",
    requiredEmail: "សូមបញ្ចូលអ៊ីមែលសិន។",
    requiredOtp: "សូមបញ្ចូល OTP។",
    invalidOtp: "OTP ត្រូវមាន ៦ ខ្ទង់។",
  },
};

function getMockResetToken(email, otp) {
  const base = `${email}:${otp}:${Date.now()}`;
  return `rt_${window.btoa(base).replace(/=+$/g, "")}`;
}

export default function ForgotPasswordOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const stepItems = [
    { label: text.step1, icon: Mail },
    { label: text.step2, icon: ShieldCheck },
    { label: text.step3, icon: Lock },
  ];
  const emailFromState = location.state?.email || sessionStorage.getItem("apsor:forgotPasswordEmail") || "";
  const [email] = useState(emailFromState);
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [error, setError] = useState("");

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;

    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [secondsLeft]);

  const countdownText = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;

  const handleResendOtp = () => {
    setOtp("");
    setError("");
    setSecondsLeft(60);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const safeEmail = String(email || "").trim();
    const safeOtp = String(otp || "").trim();

    if (!safeEmail) {
      setError(text.requiredEmail);
      return;
    }
    if (!safeOtp) {
      setError(text.requiredOtp);
      return;
    }
    if (!/^\d{6}$/.test(safeOtp)) {
      setError(text.invalidOtp);
      return;
    }
    if (secondsLeft <= 0) {
      setError(text.otpExpired);
      return;
    }

    const payload = {
      email: safeEmail,
      otp: safeOtp,
    };
    sessionStorage.setItem("apsor:verifyOtpPayload", JSON.stringify(payload));
    const token = getMockResetToken(safeEmail, safeOtp);
    sessionStorage.setItem("apsor:mockResetToken", token);
    setError("");
    navigate("/forgot-password/reset", { state: { resetToken: token } });
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

          <AuthStepProgress steps={stepItems} currentStep={2} />

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                {text.email}
              </span>
              <input
                type="text"
                value={email}
                readOnly
                className="h-11 w-full rounded-lg border border-border bg-bg-subtle px-3 text-sm text-text-secondary"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                {text.otp}
              </span>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder={text.otpPlaceholder}
                  inputMode="numeric"
                  maxLength={6}
                  className="h-11 w-full rounded-lg border border-border bg-bg-app pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </label>

            <div className="flex items-center justify-between rounded-lg border border-border bg-bg-subtle px-3 py-2 text-xs">
              <span className="font-semibold text-text-secondary">{text.otpExpiresIn}</span>
              <span className={`font-bold ${secondsLeft > 0 ? "text-brand" : "text-danger"}`}>
                {countdownText}
              </span>
            </div>

            {secondsLeft === 0 ? (
              <button
                type="button"
                onClick={handleResendOtp}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-brand/40 bg-brand-soft/40 px-4 text-sm font-semibold text-brand transition hover:bg-brand-soft/60"
              >
                {text.resendOtp}
              </button>
            ) : null}

            {error ? (
              <div className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover active:bg-brand-pressed"
            >
              <ShieldCheck className="h-4 w-4" />
              {text.verifyOtp}
            </button>
          </form>

          <div className="mt-5 text-sm text-text-secondary">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1 font-semibold text-text-secondary transition hover:text-brand"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {text.back}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
