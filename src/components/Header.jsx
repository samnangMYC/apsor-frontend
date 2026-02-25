// src/components/Header.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Globe, ShoppingBag, User, ChevronDown,Briefcase } from "lucide-react";
import Search from "./Search";
import { useLang } from "../i18n/useLang";

function cx(...c) {
  return c.filter(Boolean).join(" ");
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
  const [langOpen, setLangOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const langRef = React.useRef(null);
  const profileRef = React.useRef(null);
  useClickOutside(langRef, () => setLangOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));

  return (
    <div className="border-b border-(--border-default) bg-(--bg-surface)">
      <div className="flex items-center justify-between gap-4 px-6 py-4 lg:px-22 xl:px-48">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-(--text-primary)">{t.brand}</h1>
        </Link>

        {/* Search */}
        <div className="hidden md:block flex-1 max-w-2xl">
          <Search placeholder={t.searchPlaceholder} buttonText={t.searchButton} />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="inline-flex h-10 items-center gap-2 rounded-(--radius-pill) border border-(--border-default) bg-(--bg-surface) px-3 text-sm font-medium text-(--text-secondary) hover:bg-(--bg-subtle)"
              aria-label="Change language"
              aria-expanded={langOpen}
            >
              <Globe className="h-5 w-5" />
              <span className="uppercase">{lang}</span>
              <ChevronDown className="h-4 w-4 text-(--text-muted)" />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-2)">
                <button
                  onClick={() => {
                    setLang("km");
                    setLangOpen(false);
                  }}
                  className={cx(
                    "w-full px-3 py-2 text-left text-sm hover:bg-(--bg-subtle)",
                    lang === "km" ? "text-(--brand-primary)" : "text-(--text-secondary)"
                  )}
                >
                  {t.km}
                </button>
                <button
                  onClick={() => {
                    setLang("en");
                    setLangOpen(false);
                  }}
                  className={cx(
                    "w-full px-3 py-2 text-left text-sm hover:bg-(--bg-subtle)",
                    lang === "en" ? "text-(--brand-primary)" : "text-(--text-secondary)"
                  )}
                >
                  {t.en}
                </button>
              </div>
            )}
          </div>

          <NavLink
            to="/become-provider"
            className="hidden lg:inline-flex h-10 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
          >
            <Briefcase className="h-5 w-5" />
            <span>{t.becomeProvider}</span>
          </NavLink>

          {/* Orders */}
          <NavLink
            to="/orders"
            className="relative inline-flex h-10 items-center gap-2 rounded-(--radius-pill) border border-(--border-default) bg-(--bg-surface) px-3 text-sm font-medium text-(--text-secondary) hover:bg-(--bg-subtle)"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="hidden sm:inline">{t.order}</span>
            {ordersCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-(--danger) px-1 text-[11px] font-semibold text-white">
                {ordersCount > 99 ? "99+" : ordersCount}
              </span>
            )}
          </NavLink>

          {/* Auth / Profile */}
          {!user ? (
            <>
              <NavLink
                to="/signin"
                className="inline-flex h-10 items-center rounded-(--radius-pill) border border-(--border-default) bg-(--bg-surface) px-4 text-sm font-semibold text-(--text-secondary) hover:bg-(--bg-subtle)"
              >
                {t.signin}
              </NavLink>
              <NavLink
                to="/signup"
                className="inline-flex h-10 items-center rounded-(--radius-pill) bg-(--brand-primary) px-4 text-sm font-semibold text-white hover:bg-(--brand-hover) active:bg-(--brand-pressed)"
              >
                {t.signup}
              </NavLink>
            </>
          ) : (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="inline-flex h-10 items-center gap-2 rounded-(--radius-pill) border border-(--border-default) bg-(--bg-surface) px-3 text-sm font-semibold text-(--text-secondary) hover:bg-(--bg-subtle)"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-(--brand-soft) text-(--brand-primary)">
                  <User className="h-5 w-5" />
                </span>
                <span className="hidden md:inline max-w-35 truncate text-(--text-primary)">
                  {user?.name || t.profile}
                </span>
                <ChevronDown className="h-4 w-4 text-(--text-muted)" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-var(--radius-xl) border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-2)">
                  <div className="px-4 py-3 border-b border-(--border-default)">
                    <div className="text-sm font-semibold text-(--text-primary)">
                      {user?.name || "User"}
                    </div>
                    <div className="text-xs text-(--text-muted)">{t.profile}</div>
                  </div>
                  <nav className="p-1">
                    <NavLink
                      to="/profile"
                      className="block rounded-var(--radius-lg) px-3 py-2 text-sm text-(--text-secondary) hover:bg-(--bg-subtle)"
                    >
                      {t.profile}
                    </NavLink>
                    <NavLink
                      to="/orders"
                      className="block rounded-var(--radius-lg) px-3 py-2 text-sm text-(--text-secondary) hover:bg-(--bg-subtle)"
                    >
                      {t.order}
                    </NavLink>
                    <button
                      onClick={() => alert("Logout here")}
                      className="w-full text-left rounded-var(--radius-lg) px-3 py-2 text-sm text-(--danger) hover:bg-(--bg-subtle)"
                    >
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
      <div className="px-6 pb-4 md:hidden lg:px-22 xl:px-48">
        <Search placeholder={t.searchPlaceholder} buttonText={t.searchButton} />
      </div>
    </div>
  );
}