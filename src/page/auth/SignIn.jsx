import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, Lock, ChevronLeft, User } from "lucide-react";
import { useLang } from "../../i18n/useLang";

const UI_TEXT = {
  en: {
    title: "Welcome Back",
    subtitle: "Sign in to continue your orders and bookings.",
    identifier: "Username or email",
    identifierPlaceholder: "provider.chantha or you@example.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    rememberMe: "Remember me",
    invalidIdentifier: "Enter a valid username or email address.",
    requiredFields: "Username/email and password are required.",
    signInButton: "Sign in",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account?",
    backHome: "Back to Home",
    highlightsTitle: "Why sign in?",
    highlightsOne: "Track your current and past orders",
    highlightsTwo: "Save your preferred providers",
    highlightsThree: "Get updates on booking status",
  },
  km: {
    title: "ស្វាគមន៍ការត្រឡប់មកវិញ",
    subtitle: "ចូលគណនីដើម្បីបន្តការកក់ និងការបញ្ជាទិញរបស់អ្នក។",
    identifier: "ឈ្មោះអ្នកប្រើប្រាស់ ឬ អ៊ីមែល",
    identifierPlaceholder: "provider.chantha ឬ you@example.com",
    password: "ពាក្យសម្ងាត់",
    passwordPlaceholder: "បញ្ចូលពាក្យសម្ងាត់",
    rememberMe: "ចងចាំខ្ញុំ",
    invalidIdentifier: "សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់ ឬ អ៊ីមែល ឱ្យត្រឹមត្រូវ។",
    requiredFields: "ឈ្មោះអ្នកប្រើប្រាស់/អ៊ីមែល និងពាក្យសម្ងាត់ ត្រូវបានទាមទារ។",
    signInButton: "ចូលគណនី",
    forgotPassword: "ភ្លេចពាក្យសម្ងាត់?",
    noAccount: "មិនទាន់មានគណនីទេ?",
    backHome: "ត្រឡប់ទៅទំព័រដើម",
    highlightsTitle: "អត្ថប្រយោជន៍ពេលចូលគណនី",
    highlightsOne: "តាមដានការបញ្ជាទិញ និងប្រវត្តិការកក់",
    highlightsTwo: "រក្សាទុកអ្នកផ្តល់សេវាដែលអ្នកពេញចិត្ត",
    highlightsThree: "ទទួលបានការជូនដំណឹងអំពីស្ថានភាពការកក់",
  },
};

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isUsername(value) {
  return /^[a-zA-Z0-9._-]{3,}$/.test(String(value || "").trim());
}

export default function SignIn() {
  const navigate = useNavigate();
  const { lang, t } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const initialIdentifier = useMemo(
    () => sessionStorage.getItem("apsor:lastSigninIdentifier")
      || sessionStorage.getItem("apsor:lastSigninEmail")
      || "",
    [],
  );
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const safeIdentifier = String(identifier || "").trim();
    const safePassword = String(password || "").trim();

    if (!safeIdentifier || !safePassword) {
      setError(text.requiredFields);
      return;
    }

    const isIdentifierEmail = safeIdentifier.includes("@");
    if ((isIdentifierEmail && !isEmail(safeIdentifier)) || (!isIdentifierEmail && !isUsername(safeIdentifier))) {
      setError(text.invalidIdentifier);
      return;
    }

    const payload = isIdentifierEmail
      ? { email: safeIdentifier, password: safePassword }
      : { username: safeIdentifier, password: safePassword };

    setError("");
    if (remember) {
      sessionStorage.setItem("apsor:lastSigninIdentifier", safeIdentifier);
      if (isIdentifierEmail) sessionStorage.setItem("apsor:lastSigninEmail", safeIdentifier);
    }
    sessionStorage.setItem("apsor:signinPayload", JSON.stringify(payload));
    sessionStorage.setItem("apsor:lastSigninAt", new Date().toISOString());
    navigate("/", { replace: true });
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
              <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-text-secondary">
                {text.identifier}
              </span>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder={text.identifierPlaceholder}
                  autoComplete="username"
                  className="h-11 w-full rounded-lg border border-border bg-bg-app pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-text-secondary">
                {text.password}
              </span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={text.passwordPlaceholder}
                  autoComplete="current-password"
                  className="h-11 w-full rounded-lg border border-border bg-bg-app pl-9 pr-11 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary transition hover:bg-bg-subtle hover:text-text-primary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-border text-brand focus:ring-brand/30"
              />
              {text.rememberMe}
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
              <LogIn className="h-4 w-4" />
              {text.signInButton}
            </button>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-brand transition hover:text-brand-hover"
              >
                {text.forgotPassword}
              </Link>
            </div>
          </form>

          <div className="mt-5 flex items-center justify-between gap-3 text-sm text-text-secondary">
            <Link
              to="/"
              className="inline-flex items-center gap-1 font-semibold text-text-secondary transition hover:text-brand"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {text.backHome}
            </Link>
            <p>
              {text.noAccount}{" "}
              <Link to="/signup" className="font-semibold text-brand hover:text-brand-hover">
                {t.signup || "Sign up"}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
