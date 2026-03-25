import { useEffect, useMemo, useRef, useState } from "react";
import { Globe, Menu, MoonStar, SunMedium } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { useLang } from "../../i18n/useLang";
import { fetchCurrentUser, signOut } from "../../api";
import {
  AUTH_STORAGE_EVENT,
  clearStoredAuth,
  getStoredAccessToken,
  getStoredCurrentUser,
  persistCurrentUser,
} from "../../page/auth/authStorage";
import { isProviderUser } from "../utils/adminAccess";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
}

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    const handler = (event) => {
      if (!ref.current) return;
      if (!ref.current.contains(event.target)) onOutside?.();
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, onOutside]);
}

export default function TopHeader({ onOpenSidebar = () => {} }) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme("system");
  const { lang, setLang, t } = useLang("km");
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [storedUser, setStoredUser] = useState(() => getStoredCurrentUser());
  const profileRef = useRef(null);
  const resolvedUser = storedUser;
  const isProvider = isProviderUser(resolvedUser);
  const displayName = `${resolvedUser?.firstName || ""} ${resolvedUser?.lastName || ""}`.trim()
    || resolvedUser?.username
    || "User";
  const email = resolvedUser?.email || "user@example.com";
  const initials = getInitials(displayName);

  useClickOutside(profileRef, () => setIsProfileOpen(false));

  const title = useMemo(() => {
    if (location.pathname.startsWith("/admin/service")) {
      return isProvider
        ? (lang === "km" ? "សេវាកម្មរបស់ខ្ញុំ" : "My Services")
        : (t.services || "Services");
    }
    if (location.pathname.startsWith("/admin/orders")) {
      return isProvider
        ? (lang === "km" ? "ការបញ្ជាទិញរបស់ខ្ញុំ" : "My Orders")
        : (lang === "km" ? "ការបញ្ជាទិញ" : "Orders");
    }
    if (location.pathname.startsWith("/admin/dashboard/users")) return lang === "km" ? "ការគ្រប់គ្រងអ្នកប្រើ" : "User Management";
    if (location.pathname.startsWith("/admin/dashboard/categories")) return t.categories || "Categories";
    if (location.pathname.startsWith("/admin/dashboard/subcategories")) return t.subcategories || "Subcategories";
    if (location.pathname.startsWith("/admin/dashboard/services")) return t.services || "Services";
    if (location.pathname.startsWith("/admin/dashboard/customers")) return lang === "km" ? "អតិថិជន" : "Customers";
    if (location.pathname.startsWith("/admin/dashboard/providers")) return lang === "km" ? "អ្នកផ្គត់ផ្គង់" : "Providers";
    if (location.pathname.startsWith("/admin/dashboard/orders")) return lang === "km" ? "ការបញ្ជាទិញ" : "Orders";
    return isProvider
      ? (lang === "km" ? "ផ្ទាំងគ្រប់គ្រងរបស់ខ្ញុំ" : "My Dashboard")
      : (lang === "km" ? "ផ្ទាំងគ្រប់គ្រង" : "Dashboard");
  }, [isProvider, lang, location.pathname, t.categories, t.subcategories, t.services]);

  const text = useMemo(() => ({
    adminPanel: isProvider
      ? (lang === "km" ? "ផ្ទាំងគ្រប់គ្រងអ្នកផ្តល់សេវា" : "Provider Panel")
      : (lang === "km" ? "ផ្ទាំងគ្រប់គ្រងអ្នកគ្រប់គ្រង" : "Admin Panel"),
    openSidebar: lang === "km" ? "បើករបារចំហៀង" : "Open sidebar",
    light: t.lightMode || "Light mode",
    dark: t.darkMode || "Dark mode",
    profile: t.profile || "Profile",
    logout: t.logout || "Logout",
  }), [isProvider, lang, t.darkMode, t.lightMode, t.logout, t.profile]);

  useEffect(() => {
    let isMounted = true;
    const accessToken = getStoredAccessToken();

    if (!accessToken) {
      return undefined;
    }

    const loadCurrentUser = async () => {
      try {
        const currentUser = await fetchCurrentUser();

        if (!isMounted) {
          return;
        }

        setStoredUser(currentUser);
        persistCurrentUser(currentUser, Boolean(localStorage.getItem("apsor:authSession")));
      } catch (error) {
        if (error?.response?.status === 401) {
          clearStoredAuth();

          if (isMounted) {
            setStoredUser(null);
          }

          setIsProfileOpen(false);
          navigate("/signin", { replace: true });
          return;
        }

        console.error("Failed to fetch dashboard user:", error);
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    const syncStoredUser = () => {
      setStoredUser(getStoredCurrentUser());
    };

    window.addEventListener(AUTH_STORAGE_EVENT, syncStoredUser);
    window.addEventListener("storage", syncStoredUser);

    return () => {
      window.removeEventListener(AUTH_STORAGE_EVENT, syncStoredUser);
      window.removeEventListener("storage", syncStoredUser);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out from dashboard:", error);
    } finally {
      clearStoredAuth();
      setStoredUser(null);
      setIsProfileOpen(false);
      navigate("/signin", { replace: true });
    }
  };

  return (
    <header className="relative z-40 border-b border-border bg-linear-to-r from-bg-surface via-bg-surface to-brand-soft/20 px-4 py-3 shadow-1 sm:px-6">
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

          <div className="relative z-50" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((current) => !current)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-surface text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:h-11 sm:w-11"
              aria-label={text.profile}
              aria-expanded={isProfileOpen}
            >
              <span className="relative grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                {initials}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-bg-surface bg-success" />
              </span>
            </button>

            {isProfileOpen ? (
              <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-bg-surface shadow-2">
                <div className="flex items-center gap-3 border-b border-border px-4 py-4">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-text-primary">
                      {displayName}
                    </div>
                    <div className="truncate text-xs text-text-muted">
                      {email}
                    </div>
                  </div>
                </div>
                <nav className="space-y-1 p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-text-secondary transition hover:bg-bg-subtle hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                  >
                    {text.profile}
                  </button>
                  <div className="my-1 border-t border-border" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-danger transition hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                  >
                    {text.logout}
                  </button>
                </nav>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
