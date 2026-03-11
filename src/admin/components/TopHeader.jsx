import { useMemo, useState } from "react";
import { ChevronDown, Globe, Menu, MoonStar, SunMedium } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { useLang } from "../../i18n/useLang";

export default function TopHeader({ onOpenSidebar = () => {} }) {
  const { isDark, toggleTheme } = useTheme("system");
  const { lang, setLang, t } = useLang("km");
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const title = useMemo(() => {
    if (location.pathname.startsWith("/admin/dashboard/categories")) return t.categories || "Categories";
    return lang === "km" ? "ផ្ទាំងគ្រប់គ្រង" : "Dashboard";
  }, [lang, location.pathname, t.categories]);

  const text = useMemo(() => ({
    adminPanel: lang === "km" ? "ផ្ទាំងគ្រប់គ្រងអ្នកគ្រប់គ្រង" : "Admin Panel",
    openSidebar: lang === "km" ? "បើករបារចំហៀង" : "Open sidebar",
    light: t.lightMode || "Light mode",
    dark: t.darkMode || "Dark mode",
    profile: t.profile || "Profile",
    logout: t.logout || "Logout",
  }), [lang, t.darkMode, t.lightMode, t.logout, t.profile]);

  return (
    <header className="border-b border-border bg-linear-to-r from-bg-surface via-bg-surface to-brand-soft/20 px-4 py-3 shadow-1 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-surface text-text-secondary transition hover:border-brand/35 hover:text-brand md:hidden"
              aria-label={text.openSidebar}
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                {text.adminPanel}
              </p>
              <h2 className="mt-1 truncate text-base font-bold tracking-tight text-text-primary sm:text-xl">
                {title}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-surface text-text-secondary transition hover:border-brand/35 hover:text-brand sm:h-10 sm:w-auto sm:gap-2 sm:px-3"
            aria-label={isDark ? text.light : text.dark}
          >
            {isDark ? <SunMedium className="h-4 w-4 text-brand" /> : <MoonStar className="h-4 w-4 text-brand" />}
            <span className="hidden sm:inline">{isDark ? text.light : text.dark}</span>
          </button>

          <div className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-bg-surface p-1">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
                lang === "en" ? "bg-brand text-white" : "text-text-secondary hover:text-brand"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("km")}
              className={`inline-flex items-center rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
                lang === "km" ? "bg-brand text-white" : "text-text-secondary hover:text-brand"
              }`}
            >
              KM
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((current) => !current)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-bg-surface px-2.5 transition hover:border-brand/35"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                SA
              </span>
              <ChevronDown className={`h-4 w-4 text-text-muted transition ${isProfileOpen ? "rotate-180" : ""}`} />
            </button>

            {isProfileOpen ? (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 min-w-[180px] rounded-xl border border-border bg-bg-surface p-2 shadow-2">
                <button
                  type="button"
                  className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-text-secondary transition hover:bg-bg-subtle hover:text-brand"
                >
                  {text.profile}
                </button>
                <button
                  type="button"
                  className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-text-secondary transition hover:bg-bg-subtle hover:text-brand"
                >
                  {text.logout}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
