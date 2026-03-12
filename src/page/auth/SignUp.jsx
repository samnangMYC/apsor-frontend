import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  Lock,
  Mail,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import { useLang } from "../../i18n/useLang";
import AuthInput from "../../components/auth/AuthInput";
import { signUp } from "../../api";

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
    confirmPassword: "Confirm password",
    confirmPasswordPlaceholder: "Re-enter your password",
    phoneNumber: "Phone number",
    phoneNumberPlaceholder: "0153455543",
    requiredFields: "All account fields are required.",
    invalidUsername: "Username must be at least 3 characters and only use letters, numbers, dot, underscore, or hyphen.",
    invalidEmail: "Please enter a valid email address.",
    weakPassword: "Password must be at least 8 characters and include upper, lower, number, and symbol.",
    suggestedPassword: "Suggested password",
    useSuggestedPassword: "Use suggested",
    mismatchPassword: "Password and confirm password do not match.",
    invalidPhone: "Please enter a valid phone number.",
    signUpFailed: "Unable to create your account right now.",
    signUpSuccess: "Account created successfully.",
    creatingAccount: "Creating account...",
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
    confirmPassword: "បញ្ជាក់ពាក្យសម្ងាត់",
    confirmPasswordPlaceholder: "បញ្ចូលពាក្យសម្ងាត់ម្តងទៀត",
    phoneNumber: "លេខទូរស័ព្ទ",
    phoneNumberPlaceholder: "015407184",
    requiredFields: "សូមបំពេញព័ត៌មានគណនីទាំងអស់។",
    invalidUsername: "ឈ្មោះអ្នកប្រើត្រូវមានយ៉ាងតិច 3 តួអក្សរ ហើយប្រើបានតែអក្សរ លេខ . _ - ប៉ុណ្ណោះ។",
    invalidEmail: "សូមបញ្ចូលអ៊ីមែលឱ្យត្រឹមត្រូវ។",
    weakPassword: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច 8 តួអក្សរ និងមានអក្សរធំ អក្សរតូច លេខ និងនិមិត្តសញ្ញា។",
    suggestedPassword: "ពាក្យសម្ងាត់ណែនាំ",
    useSuggestedPassword: "ប្រើពាក្យសម្ងាត់នេះ",
    mismatchPassword: "ពាក្យសម្ងាត់ និងការបញ្ជាក់ពាក្យសម្ងាត់ មិនត្រូវគ្នា។",
    invalidPhone: "សូមបញ្ចូលលេខទូរស័ព្ទឱ្យត្រឹមត្រូវ។",
    signUpFailed: "មិនអាចបង្កើតគណនីបានទេ នៅពេលនេះ។",
    signUpSuccess: "បង្កើតគណនីបានជោគជ័យ។",
    creatingAccount: "កំពុងបង្កើតគណនី...",
    signUpButton: "ចុះឈ្មោះ",
    haveAccount: "មានគណនីរួចហើយ?",
    backHome: "ត្រឡប់ទៅទំព័រដើម",
  },
};

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isUsername(value) {
  return /^[a-zA-Z0-9._-]{3,}$/.test(String(value || "").trim());
}

function isStrongPassword(value) {
  const safeValue = String(value || "");
  return (
    safeValue.length >= 8
    && /[a-z]/.test(safeValue)
    && /[A-Z]/.test(safeValue)
    && /\d/.test(safeValue)
    && /[^A-Za-z0-9]/.test(safeValue)
  );
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

function generateSuggestedPassword() {
  const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowers = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%&*";
  const all = `${uppers}${lowers}${numbers}${symbols}`;
  const requiredChars = [
    uppers[Math.floor(Math.random() * uppers.length)],
    lowers[Math.floor(Math.random() * lowers.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  while (requiredChars.length < 12) {
    requiredChars.push(all[Math.floor(Math.random() * all.length)]);
  }

  return requiredChars
    .sort(() => Math.random() - 0.5)
    .join("");
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedPassword, setSuggestedPassword] = useState(() => generateSuggestedPassword());
  const validateForm = () => {
    const safeUsername = String(username || "").trim();
    const safeEmail = String(email || "").trim();
    const safeFirstName = String(firstName || "").trim();
    const safeLastName = String(lastName || "").trim();
    const safePassword = String(password || "");
    const safeConfirmPassword = String(confirmPassword || "");
    const safePhoneNumber = normalizePhone(phoneNumber);

    if (
      !safeUsername
      || !safeEmail
      || !safeFirstName
      || !safeLastName
      || !safePassword
      || !safeConfirmPassword
      || !safePhoneNumber
    ) {
      setError(text.requiredFields);
      return null;
    }

    if (!isUsername(safeUsername)) {
      setError(text.invalidUsername);
      return null;
    }

    if (!isEmail(safeEmail)) {
      setError(text.invalidEmail);
      return null;
    }

    if (!isStrongPassword(safePassword)) {
      setError(text.weakPassword);
      return null;
    }

    if (safePassword !== safeConfirmPassword) {
      setError(text.mismatchPassword);
      return null;
    }

    if (!isPhone(safePhoneNumber)) {
      setError(text.invalidPhone);
      return null;
    }

    return {
      username: safeUsername,
      email: safeEmail,
      firstName: safeFirstName,
      lastName: safeLastName,
      password: safePassword,
      phoneNumber: safePhoneNumber,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const stepOneValues = validateForm();
    if (!stepOneValues) return;

    const signUpPayload = {
      username: stepOneValues.username,
      email: stepOneValues.email,
      firstName: stepOneValues.firstName,
      lastName: stepOneValues.lastName,
      password: stepOneValues.password,
      phoneNumber: stepOneValues.phoneNumber.startsWith("0")
        ? `+855${stepOneValues.phoneNumber.slice(1)}`
        : stepOneValues.phoneNumber,
    };

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await signUp(signUpPayload);
      setSuccessMessage(text.signUpSuccess);
      sessionStorage.setItem("apsor:signupAt", new Date().toISOString());
      sessionStorage.setItem("apsor:lastSigninEmail", stepOneValues.email);
      window.setTimeout(() => {
        navigate("/signin", { replace: true });
      }, 1200);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message
          || requestError?.response?.data?.error
          || text.signUpFailed,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseSuggestedPassword = () => {
    const nextSuggestedPassword = generateSuggestedPassword();
    setSuggestedPassword(nextSuggestedPassword);
    setPassword(nextSuggestedPassword);
    setConfirmPassword(nextSuggestedPassword);
    setError("");
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

          {successMessage ? (
            <div className="mt-4 rounded-lg border border-success/35 bg-success/10 px-3 py-2 text-sm text-success">
              {successMessage}
            </div>
          ) : null}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
            <AuthInput
              name="username"
              label={text.username}
              icon={User}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={text.usernamePlaceholder}
              autoComplete="username"
              required
              requiredMessage={text.requiredFields}
              validator={(value) => (!value.trim() || isUsername(value) ? "" : text.invalidUsername)}
            />

            <AuthInput
              name="email"
              label={text.email}
              icon={Mail}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={text.emailPlaceholder}
              autoComplete="email"
              required
              requiredMessage={text.requiredFields}
              validator={(value) => (!value.trim() || isEmail(value) ? "" : text.invalidEmail)}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AuthInput
                name="firstName"
                label={text.firstName}
                icon={User}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder={text.firstNamePlaceholder}
                autoComplete="given-name"
                required
                requiredMessage={text.requiredFields}
              />

              <AuthInput
                name="lastName"
                label={text.lastName}
                icon={User}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder={text.lastNamePlaceholder}
                autoComplete="family-name"
                required
                requiredMessage={text.requiredFields}
              />
            </div>

            <AuthInput
              name="password"
              label={text.password}
              icon={Lock}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={text.passwordPlaceholder}
              autoComplete="new-password"
              required
              requiredMessage={text.requiredFields}
              validator={(value) => (!value || isStrongPassword(value) ? "" : text.weakPassword)}
              showToggle
              isVisible={showPassword}
              onToggleVisibility={() => setShowPassword((prev) => !prev)}
              toggleLabels={{
                show: "Show password",
                hide: "Hide password",
              }}
            />

            <div className="rounded-lg border border-border bg-bg-app px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary">
                {text.suggestedPassword}
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <code className="min-w-0 break-all text-sm font-semibold text-text-primary">
                  {suggestedPassword}
                </code>
                <button
                  type="button"
                  onClick={handleUseSuggestedPassword}
                  className="shrink-0 rounded-pill border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary transition hover:bg-bg-subtle"
                >
                  {text.useSuggestedPassword}
                </button>
              </div>
            </div>

            <AuthInput
              name="confirmPassword"
              label={text.confirmPassword}
              icon={Lock}
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder={text.confirmPasswordPlaceholder}
              autoComplete="new-password"
              required
              requiredMessage={text.requiredFields}
              validator={(value) => (!value || value === password ? "" : text.mismatchPassword)}
              showToggle
              isVisible={showConfirmPassword}
              onToggleVisibility={() => setShowConfirmPassword((prev) => !prev)}
              toggleLabels={{
                show: "Show confirm password",
                hide: "Hide confirm password",
              }}
            />

            <AuthInput
              name="phoneNumber"
              label={text.phoneNumber}
              icon={Phone}
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder={text.phoneNumberPlaceholder}
              autoComplete="tel"
              required
              requiredMessage={text.requiredFields}
              validator={(value) => {
                if (!value.trim()) return "";
                return isPhone(normalizePhone(value)) ? "" : text.invalidPhone;
              }}
            />

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
              <UserPlus className="h-4 w-4" />
              {isSubmitting ? text.creatingAccount : text.signUpButton}
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
