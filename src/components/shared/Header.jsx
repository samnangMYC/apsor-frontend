import React from "react";
import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, User, ChevronDown, Briefcase, LogOut, Moon, Sun } from "lucide-react";
import Search from "./Search";
import { useLang } from "../../i18n/useLang";
import { useTheme } from "../../hooks/useTheme";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

function useClickOutside(ref, onOutside) {
  React.useEffect(() => {
    const handler = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onOutside?.();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, onOutside]);
}

export default function Header({ user = null, ordersCount = 0 }) {
  const { lang, setLang, t } = useLang("km");
  const { isDark, toggleTheme } = useTheme("system");
  const [langOpen, setLangOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const langFlag = lang === "km" ? "🇰🇭" : "🇺🇸";

  const langRef = React.useRef(null);
  const profileRef = React.useRef(null);
  useClickOutside(langRef, () => setLangOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));

  return (
    <div className="sticky top-0 z-50 border-b border-border bg-bg-surface">
      <div className="flex items-center justify-between gap-2 py-3 px-6 sm:gap-3 sm:py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo-preview.png" alt="Apsor Logo" className="h-10 w-22  shrink-0 object-contain" />
        </Link>

        {/* Search */}
        <div className="hidden md:block flex-1 max-w-2xl">
          <Search placeholder={t.searchPlaceholder} buttonText={t.searchButton} />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="inline-flex shrink-0 h-10 items-center gap-2 rounded-pill border border-border bg-bg-surface px-2.5 text-sm font-medium text-text-secondary hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:px-3"
            aria-label={isDark ? (t.switchToLight || "Switch to light mode") : (t.switchToDark || "Switch to dark mode")}
            title={isDark ? (t.switchToLight || "Switch to light mode") : (t.switchToDark || "Switch to dark mode")}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden xl:inline ">
              {isDark ? (t.lightMode || "Light mode") : (t.darkMode || "Dark mode")}
            </span>
          </button>

          {/* Language switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="inline-flex h-10 items-center gap-2 rounded-pill border border-border bg-bg-surface px-2.5 text-sm font-medium text-text-secondary hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:px-3"
              aria-label="Change language"
              aria-expanded={langOpen}
            >
              <span className="text-base leading-none" aria-hidden="true">{langFlag}</span>
              <span className="hidden uppercase xl:inline">{lang}</span>
              <ChevronDown className="hidden h-4 w-4 text-text-muted xl:inline" />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-bg-surface shadow-2">
                <button
                  onClick={() => {
                    setLang("km");
                    setLangOpen(false);
                  }}
                  className={cx(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus",
                    lang === "km" ? "text-brand" : "text-text-secondary"
                  )}
                >
                  <span className="text-base leading-none" aria-hidden="true">🇰🇭</span>
                  <span>{t.km}</span>
                </button>
                <button
                  onClick={() => {
                    setLang("en");
                    setLangOpen(false);
                  }}
                  className={cx(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus",
                    lang === "en" ? "text-brand" : "text-text-secondary"
                  )}
                >
                  <span className="text-base leading-none" aria-hidden="true">🇺🇸</span>
                  <span>{t.en}</span>
                </button>
              </div>
            )}
          </div>

          <NavLink
            to="/become-provider"
            className=" hidden xl:inline-flex shrink-0 h-10 items-center gap-2 rounded-pill border border-border bg-bg-surface px-4 text-sm font-semibold text-text-secondary hover:bg-bg-subtle"
          >
            <Briefcase className="h-5 w-5" />
            <span className="hidden 2xl:inline">{t.becomeProvider}</span>
          </NavLink>

          {/* Orders */}
          <NavLink
            to="/orders"
            className="relative shrink-0 inline-flex h-10 items-center gap-2 rounded-pill border border-border bg-bg-surface px-2.5 text-sm font-medium text-text-secondary hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:px-3"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden xl:inline">{t.order}</span>
            {ordersCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-semibold text-white">
                {ordersCount > 99 ? "99+" : ordersCount}
              </span>
            )}
          </NavLink>

          {/* Auth / Profile */}
          {!user ? (
            <>
              <NavLink
                to="/signin"
                className="hidden shrink-0 h-10 items-center rounded-pill border border-border bg-bg-surface px-4 text-sm font-semibold text-text-secondary hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:inline-flex"
              >
                {t.signin}
              </NavLink>
              <NavLink
                to="/signup"
                className="inline-flex shrink-0 h-10 items-center rounded-pill bg-brand px-3 text-sm font-semibold text-white hover:bg-brand-hover active:bg-brand-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:px-4"
              >
                {t.signup}
              </NavLink>
            </>
          ) : (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="inline-flex h-10 items-center gap-2 rounded-pill border border-border bg-bg-surface px-2.5 text-sm font-semibold text-text-secondary hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:h-11 sm:px-3"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
              >
                <span className="relative grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                  {getInitials(user?.name)}
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-bg-surface bg-success" />
                </span>
                <span className="hidden lg:block text-left">
                  <span className="block max-w-35 truncate text-sm text-text-primary">
                    {user?.name || t.profile}
                  </span>
                  <span className="block text-[11px] font-medium leading-tight text-text-muted">
                    {t.profile}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 text-text-muted" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-bg-surface shadow-2">
                  <div className="flex items-center gap-3 border-b border-border px-4 py-4">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                      {getInitials(user?.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-text-primary">
                        {user?.name || "User"}
                      </div>
                      <div className="truncate text-xs text-text-muted">
                        {user?.email || "user@example.com"}
                      </div>
                    </div>
                  </div>
                  <nav className="space-y-1 p-2">
                    <NavLink
                      to="/profile"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                    >
                      <User className="h-4 w-4" />
                      {t.profile}
                    </NavLink>
                    <NavLink
                      to="/orders"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {t.order}
                    </NavLink>
                    <NavLink
                      to="/become-provider"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                    >
                      <Briefcase className="h-4 w-4" />
                      {t.becomeProvider}
                    </NavLink>
                    <div className="my-1 border-t border-border" />
                    <button
                      onClick={() => alert("Logout here")}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-danger hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                    >
                      <LogOut className="h-4 w-4" />
                      {t.logout}
                    </button>
                  </nav>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <div className="px-6 pb-3 md:hidden sm:px-10">
        <Search placeholder={t.searchPlaceholder} buttonText={t.searchButton} />
        <NavLink
          to="/become-provider"
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-pill border border-border bg-bg-surface px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Briefcase className="h-4 w-4" />
          <span>{t.becomeProvider}</span>
        </NavLink>
      </div>
    </div>
  );
}
