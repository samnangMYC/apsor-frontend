import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Briefcase, FolderOpenDot, LogOut, Moon, Sun, Upload, LayoutDashboard, ChevronDown } from "lucide-react";
import Search from "./Search";
import { useLang } from "../../i18n/useLang";
import { useTheme } from "../../hooks/useTheme";
import { fetchCurrentUser, signOut } from "../../api";
import {
  AUTH_STORAGE_EVENT,
  clearStoredAuth,
  getStoredAccessToken,
  getStoredCurrentUser,
  persistCurrentUser,
} from "../../page/auth/authStorage";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

function getUserRole(user) {
  return String(user?.userType || user?.userTypes || "").trim().toUpperCase();
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
export default function Header({ ordersCount = 0 }) {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang("km");
  const { isDark, toggleTheme } = useTheme("system");
  const [langOpen, setLangOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [storedUser, setStoredUser] = React.useState(() => getStoredCurrentUser());
  const langFlag = lang === "km" ? "🇰🇭" : "🇺🇸";
  const resolvedUser = storedUser;
  const userRole = getUserRole(resolvedUser);
  const canBecomeProvider = !resolvedUser || (userRole !== "ADMIN" && userRole !== "PROVIDER");
  const canAccessOrders = !resolvedUser || (userRole !== "ADMIN" && userRole !== "PROVIDER");
  const canManageProviderServices = userRole === "PROVIDER";
  const canAccessAdminDashboard = userRole === "ADMIN" || userRole === "PROVIDER";

  const langRef = React.useRef(null);
  const profileRef = React.useRef(null);
  useClickOutside(langRef, () => setLangOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));

  React.useEffect(() => {
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
        console.error("Failed to fetch header user:", error);
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
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
      console.error("Failed to sign out from server:", error);
    } finally {
      clearStoredAuth();
      setStoredUser(null);
      setProfileOpen(false);
      navigate("/signin", { replace: true });
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-border bg-bg-surface/95 backdrop-blur-sm">
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

          {canBecomeProvider ? (
            <NavLink
              to="/become-provider"
              className=" hidden xl:inline-flex shrink-0 h-10 items-center gap-2 rounded-pill border border-border bg-bg-surface px-4 text-sm font-semibold text-text-secondary hover:bg-bg-subtle"
            >
              <Briefcase className="h-5 w-5" />
              <span className="hidden 2xl:inline">{t.becomeProvider}</span>
            </NavLink>
          ) : null}

          {canManageProviderServices ? (
            <>
              <NavLink
                to="/upload-service"
                className={({ isActive }) =>
                  cx(
                    "hidden xl:inline-flex shrink-0 h-10 items-center gap-2 rounded-pill border px-4 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                    isActive
                      ? "border-brand bg-linear-to-r from-brand to-brand-hover text-white shadow-1"
                      : "border-brand/45 bg-linear-to-r from-brand-soft/65 to-bg-surface text-brand hover:-translate-y-px hover:border-brand hover:shadow-1",
                  )
                }
                title={t.uploadService || "Upload Service"}
              >
                <Upload className="h-5 w-5" />
                <span className="hidden 2xl:inline">{t.uploadService || "Upload Service"}</span>
              </NavLink>

              <NavLink
                to="/provider/service"
                className={({ isActive }) =>
                  cx(
                    "hidden xl:inline-flex shrink-0 h-10 items-center gap-2 rounded-pill border px-4 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                    isActive
                      ? "border-brand bg-linear-to-r from-brand to-brand-hover text-white shadow-1"
                      : "border-border bg-bg-surface text-text-secondary hover:bg-bg-subtle",
                  )
                }
                title={t.manageService || "Manage Service"}
              >
                <FolderOpenDot className="h-5 w-5" />
                <span className="hidden 2xl:inline">{t.manageService || "Manage Service"}</span>
              </NavLink>
            </>
          ) : null}

          {canAccessAdminDashboard ? (
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                cx(
                  "hidden xl:inline-flex shrink-0 h-10 items-center gap-2 rounded-pill border px-4 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                  isActive
                    ? "border-info/35 bg-linear-to-r from-info to-sky-500 text-white shadow-1"
                    : "border-info/20 bg-linear-to-r from-sky-50 to-bg-surface text-info hover:-translate-y-px hover:border-info/40 hover:shadow-1 dark:from-info/15 dark:to-bg-surface",
                )
              }
              title={t.adminDashboard || "Admin Dashboard"}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="hidden 2xl:inline">{t.adminDashboard || "Admin Dashboard"}</span>
            </NavLink>
          ) : null}

          {/* Orders */}
          {canAccessOrders ? (
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
          ) : null}

          {/* Auth / Profile */}
          {!resolvedUser ? (
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
            <div className="relative z-50" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-surface text-sm font-semibold text-text-secondary hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:h-11 sm:w-11"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
              >
                <span className="relative grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                  {getInitials(`${resolvedUser?.firstName || ""} ${resolvedUser?.lastName || ""}`.trim() || resolvedUser?.username)}
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-bg-surface bg-success" />
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-bg-surface shadow-2">
                  <div className="flex items-center gap-3 border-b border-border px-4 py-4">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                      {getInitials(`${resolvedUser?.firstName || ""} ${resolvedUser?.lastName || ""}`.trim() || resolvedUser?.username)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-text-primary">
                        {`${resolvedUser?.firstName || ""} ${resolvedUser?.lastName || ""}`.trim() || resolvedUser?.username || "User"}
                      </div>
                      <div className="truncate text-xs text-text-muted">
                        {resolvedUser?.email || "user@example.com"}
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
                    {canAccessOrders ? (
                      <NavLink
                        to="/orders"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        {t.order}
                      </NavLink>
                    ) : null}
                    {canBecomeProvider ? (
                      <NavLink
                        to="/become-provider"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                      >
                        <Briefcase className="h-4 w-4" />
                        {t.becomeProvider}
                      </NavLink>
                    ) : null}
                    {canManageProviderServices ? (
                      <>
                        <NavLink
                          to="/upload-service"
                          className="flex items-center gap-3 rounded-lg border border-brand/25 bg-linear-to-r from-brand-soft/35 to-bg-surface px-3 py-2.5 text-sm font-semibold text-brand transition hover:border-brand/45 hover:bg-brand-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                        >
                          <Upload className="h-4 w-4" />
                          {t.uploadService || "Upload Service"}
                        </NavLink>
                        <NavLink
                          to="/provider/service"
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                        >
                          <FolderOpenDot className="h-4 w-4" />
                          {t.manageService || "Manage Service"}
                        </NavLink>
                      </>
                    ) : null}
                    {canAccessAdminDashboard ? (
                      <NavLink
                        to="/admin/dashboard"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {t.adminDashboard || "Admin Dashboard"}
                      </NavLink>
                    ) : null}
                    <div className="my-1 border-t border-border" />
                    <button
                      onClick={handleSignOut}
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
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {canBecomeProvider ? (
            <NavLink
              to="/become-provider"
              className="inline-flex items-center justify-center gap-2 rounded-pill border border-border bg-bg-surface px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <Briefcase className="h-4 w-4" />
              <span>{t.becomeProvider}</span>
            </NavLink>
          ) : null}
          {canManageProviderServices ? (
            <>
              <NavLink
                to="/upload-service"
                className="inline-flex items-center justify-center gap-2 rounded-pill border border-brand/45 bg-linear-to-r from-brand-soft/65 to-bg-surface px-4 py-2.5 text-sm font-semibold text-brand transition hover:border-brand hover:bg-brand-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <Upload className="h-4 w-4" />
                <span>{t.uploadService || "Upload Service"}</span>
              </NavLink>
              <NavLink
                to="/provider/service"
                className="inline-flex items-center justify-center gap-2 rounded-pill border border-border bg-bg-surface px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <FolderOpenDot className="h-4 w-4" />
                <span>{t.manageService || "Manage Service"}</span>
              </NavLink>
            </>
          ) : null}
          {canAccessAdminDashboard ? (
            <NavLink
              to="/admin/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-pill border border-info/20 bg-linear-to-r from-sky-50 to-bg-surface px-4 py-2.5 text-sm font-semibold text-info transition hover:border-info/35 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus dark:from-info/15 dark:to-bg-surface"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>{t.adminDashboard || "Admin Dashboard"}</span>
            </NavLink>
          ) : null}
        </div>
      </div>
    </div>
  );
}
