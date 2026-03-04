import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Eye, EyeOff, Lock, Mail, Phone, User, UserPlus } from "lucide-react";
import { useLang } from "../i18n/useLang";

const UI_TEXT = {
  en: {
    title: "Create Account",
    subtitle: "Sign up to start booking trusted local services.",
    username: "Username",
    usernamePlaceholder: "sok.sitha2",
    email: "Email",
    emailPlaceholder: "sok.sitha@example.com",
    firstName: "First name",
    firstNamePlaceholder: "Sok",
    lastName: "Last name",
    lastNamePlaceholder: "Sitha",
    password: "Password",
    passwordPlaceholder: "P@ssw0rd123!",
    phoneNumber: "Phone number",
    phoneNumberPlaceholder: "015407184",
    requiredFields: "All fields are required.",
    invalidEmail: "Please enter a valid email address.",
    weakPassword: "Password must be at least 6 characters.",
    invalidPhone: "Please enter a valid phone number.",
    signUpButton: "Sign up",
    haveAccount: "Already have an account?",
    backHome: "Back to Home",
  },
  km: {
    title: "បង្កើតគណនី",
    subtitle: "ចុះឈ្មោះដើម្បីចាប់ផ្តើមកក់សេវាកម្មដែលអាចទុកចិត្តបាន។",
    username: "ឈ្មោះអ្នកប្រើប្រាស់",
    usernamePlaceholder: "sok.sitha2",
    email: "អ៊ីមែល",
    emailPlaceholder: "sok.sitha@example.com",
    firstName: "នាមខ្លួន",
    firstNamePlaceholder: "Sok",
    lastName: "នាមត្រកូល",
    lastNamePlaceholder: "Sitha",
    password: "ពាក្យសម្ងាត់",
    passwordPlaceholder: "P@ssw0rd123!",
    phoneNumber: "លេខទូរស័ព្ទ",
    phoneNumberPlaceholder: "015407184",
    requiredFields: "សូមបំពេញគ្រប់ព័ត៌មានទាំងអស់។",
    invalidEmail: "សូមបញ្ចូលអ៊ីមែលឱ្យត្រឹមត្រូវ។",
    weakPassword: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ។",
    invalidPhone: "សូមបញ្ចូលលេខទូរស័ព្ទឱ្យត្រឹមត្រូវ។",
    signUpButton: "ចុះឈ្មោះ",
    haveAccount: "មានគណនីរួចហើយ?",
    backHome: "ត្រឡប់ទៅទំព័រដើម",
  },
};

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isPhone(value) {
  const normalized = String(value || "").trim().replace(/\s+/g, "");
  return /^0\d{7,9}$/.test(normalized);
}

function normalizePhone(value) {
  const normalized = String(value || "").trim().replace(/\s+/g, "");
  if (normalized.startsWith("+855")) return `0${normalized.slice(4)}`;
  if (normalized.startsWith("855")) return `0${normalized.slice(3)}`;
  return normalized;
}

export default function SignUp() {
  const navigate = useNavigate();
  const { lang, t } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const safeUsername = String(username || "").trim();
    const safeEmail = String(email || "").trim();
    const safeFirstName = String(firstName || "").trim();
    const safeLastName = String(lastName || "").trim();
    const safePassword = String(password || "");
    const safePhoneNumber = normalizePhone(phoneNumber);

    if (
      !safeUsername
      || !safeEmail
      || !safeFirstName
      || !safeLastName
      || !safePassword
      || !safePhoneNumber
    ) {
      setError(text.requiredFields);
      return;
    }

    if (!isEmail(safeEmail)) {
      setError(text.invalidEmail);
      return;
    }

    if (safePassword.length < 6) {
      setError(text.weakPassword);
      return;
    }

    if (!isPhone(safePhoneNumber)) {
      setError(text.invalidPhone);
      return;
    }

    const payload = {
      username: safeUsername,
      email: safeEmail,
      firstName: safeFirstName,
      lastName: safeLastName,
      password: safePassword,
      phoneNumber: safePhoneNumber,
    };

    setError("");
    sessionStorage.setItem("apsor:signupPayload", JSON.stringify(payload));
    sessionStorage.setItem("apsor:lastSigninEmail", safeEmail);
    navigate("/signin", { replace: true });
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
                {text.username}
              </span>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder={text.usernamePlaceholder}
                  autoComplete="username"
                  className="h-11 w-full rounded-lg border border-border bg-bg-app pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </label>

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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                  {text.firstName}
                </span>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder={text.firstNamePlaceholder}
                    autoComplete="given-name"
                    className="h-11 w-full rounded-lg border border-border bg-bg-app pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                  {text.lastName}
                </span>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder={text.lastNamePlaceholder}
                    autoComplete="family-name"
                    className="h-11 w-full rounded-lg border border-border bg-bg-app pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                {text.password}
              </span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={text.passwordPlaceholder}
                  autoComplete="new-password"
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

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                {text.phoneNumber}
              </span>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder={text.phoneNumberPlaceholder}
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
              <UserPlus className="h-4 w-4" />
              {text.signUpButton}
            </button>
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
              {text.haveAccount}{" "}
              <Link to="/signin" className="font-semibold text-brand hover:text-brand-hover">
                {t.signin || "Sign in"}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
