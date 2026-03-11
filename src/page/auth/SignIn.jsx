import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Lock, ChevronLeft, User } from "lucide-react";
import { useLang } from "../../i18n/useLang";
import AuthInput from "../../components/auth/AuthInput";
import { SIGN_IN_TEXT } from "./signInText";
import { fetchCurrentUser, signIn } from "../../api";
import {
  buildSignInPayload,
  extractAuthErrorMessage,
  getPostSignInPath,
  isEmail,
  isStrongPassword,
  validateIdentifier,
} from "./signInUtils";
import {
  clearRememberedIdentifier,
  getRememberedIdentifier,
  persistAuthSession,
  persistCurrentUser,
  persistRememberedIdentifier,
  readStoredAuthDebug,
} from "./authStorage";

export default function SignIn() {
  const navigate = useNavigate();
  const { lang, t } = useLang("km");
  const text = SIGN_IN_TEXT[lang] || SIGN_IN_TEXT.en;
  const initialIdentifier = useMemo(() => getRememberedIdentifier(), []);
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = buildSignInPayload(identifier, password);
    const safeIdentifier = payload.username;
    const safePassword = payload.password;

    if (!safeIdentifier || !safePassword) {
      setError(text.requiredFields);
      return;
    }

    if (!validateIdentifier(safeIdentifier)) {
      setError(text.invalidIdentifier);
      return;
    }

    if (!isStrongPassword(safePassword)) {
      setError(text.weakPassword);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const authSession = await signIn(payload);

      if (!authSession?.success) {
        throw new Error(authSession?.message || text.signInFailed);
      }

      console.log("Sign in response:", authSession);
      persistAuthSession(authSession, remember);
      const currentUser = await fetchCurrentUser();
      persistCurrentUser(currentUser, remember);
      console.log("Current user response:", currentUser);
      console.log("Stored auth debug:", readStoredAuthDebug());

      if (remember) {
        persistRememberedIdentifier(safeIdentifier, isEmail(safeIdentifier));
      } else {
        clearRememberedIdentifier();
      }

      navigate(getPostSignInPath(authSession), { replace: true });
    } catch (requestError) {
      setError(extractAuthErrorMessage(requestError, text.signInFailed));
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
            <AuthInput
              name="identifier"
              label={text.identifier}
              icon={User}
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder={text.identifierPlaceholder}
              autoComplete="username"
              required
              requiredMessage={text.requiredFields}
              validator={(value) => {
                if (!value.trim()) return "";
                return validateIdentifier(value) ? "" : text.invalidIdentifier;
              }}
            />

            <AuthInput
              name="password"
              label={text.password}
              icon={Lock}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={text.passwordPlaceholder}
              autoComplete="current-password"
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

            <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                disabled={isSubmitting}
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
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover active:bg-brand-pressed"
            >
              <LogIn className="h-4 w-4" />
              {isSubmitting ? text.signingIn : text.signInButton}
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
