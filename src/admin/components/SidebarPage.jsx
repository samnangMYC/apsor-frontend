import React, { useEffect, useState } from "react";
import {
  Blocks,
  BriefcaseBusiness,
  FolderKanban,
  FolderTree,
  LayoutDashboard,
  Logs,
  LogOut,
  ShoppingBag,
  Settings,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useLang } from "../../i18n/useLang";
import { fetchCurrentUser, signOut } from "../../api";
import {
  AUTH_STORAGE_EVENT,
  clearStoredAuth,
  getStoredAccessToken,
  getStoredCurrentUser,
  persistCurrentUser,
} from "../../page/auth/authStorage";
import { canAccessAdminDashboard, isAdminUser } from "../utils/adminAccess";

const UI_TEXT = {
  en: {
    console: "Apsor Console",
    overview: "Overview",
    management: "Management",
    support: "Support",
    dashboard: "Dashboard",
    services: "Services",
    categories: "Categories",
    subcategories: "Subcategories",
    users: "User Management",
    customers: "Customers",
    providers: "Providers",
    orders: "Orders",
    auditLogs: "Audit Logs",
    settings: "Settings",
    live: "Live",
    adminName: "Samnang Admin",
    adminRole: "Operations Manager",
    closeSidebar: "Close sidebar",
    signOut: "Sign out",
  },
  km: {
    console: "Apsor Console",
    overview: "ទិដ្ឋភាពទូទៅ",
    management: "ការគ្រប់គ្រង",
    support: "ជំនួយ",
    dashboard: "ផ្ទាំងគ្រប់គ្រង",
    services: "សេវាកម្ម",
    categories: "ប្រភេទ",
    subcategories: "ប្រភេទរង",
    users: "ការគ្រប់គ្រងអ្នកប្រើ",
    customers: "អតិថិជន",
    providers: "អ្នកផ្គត់ផ្គង់",
    orders: "ការបញ្ជាទិញ",
    auditLogs: "កំណត់ហេតុសកម្មភាព",
    settings: "ការកំណត់",
    live: "កំពុងដំណើរការ",
    adminName: "Samnang Admin",
    adminRole: "អ្នកគ្រប់គ្រងប្រតិបត្តិការ",
    closeSidebar: "បិទរបារចំហៀង",
    signOut: "ចាកចេញ",
  },
};

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
}

export default function SidebarPage({ isOpen = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const [storedUser, setStoredUser] = useState(() => getStoredCurrentUser());
  const displayName = `${storedUser?.firstName || ""} ${storedUser?.lastName || ""}`.trim()
    || storedUser?.username
    || text.adminName;
  const roleLabel = storedUser?.userType || storedUser?.role || text.adminRole;
  const initials = getInitials(displayName);
  const canManageAll = isAdminUser(storedUser);
  const canViewDashboard = canAccessAdminDashboard(storedUser);
  const isProvider = !canManageAll && canViewDashboard;

  const navSections = [
    {
      title: text.overview,
      items: [
        ...(
          canViewDashboard
            ? [{ key: "dashboard", label: isProvider ? (lang === "km" ? "ផ្ទាំងគ្រប់គ្រងរបស់ខ្ញុំ" : "My Dashboard") : text.dashboard, icon: LayoutDashboard, badge: text.live, to: "/admin/dashboard" }]
            : []
        ),
      ],
    },
    {
      title: text.management,
      items: [
        { key: "services", label: isProvider ? (lang === "km" ? "សេវាកម្មរបស់ខ្ញុំ" : "My Services") : text.services, icon: Blocks, to: "/admin/service" },
        ...(
          isProvider
            ? [{ key: "orders", label: lang === "km" ? "ការបញ្ជាទិញរបស់ខ្ញុំ" : "My Orders", icon: ShoppingBag, to: "/admin/orders" }]
            : []
        ),
        ...(
          canManageAll
            ? [
              { key: "categories", label: text.categories, icon: FolderKanban, to: "/admin/dashboard/categories" },
              { key: "subcategories", label: text.subcategories, icon: FolderTree, to: "/admin/dashboard/subcategories" },
              { key: "users", label: text.users, icon: Users, to: "/admin/dashboard/users" },
              { key: "customers", label: text.customers, icon: UserRound, to: "/admin/dashboard/customers" },
              { key: "providers", label: text.providers, icon: BriefcaseBusiness, to: "/admin/dashboard/providers" },
              { key: "orders", label: text.orders, icon: ShoppingBag, to: "/admin/dashboard/orders" },
              { key: "audit-logs", label: text.auditLogs, icon: Logs, to: "/admin/dashboard/audit-logs" },
            ]
            : []
        ),
      ],
    },
    {
      title: text.support,
      items: canManageAll
        ? [{ key: "settings", label: text.settings, icon: Settings }]
        : [],
    },
  ];

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = isOpen ? "hidden" : previousOverflow;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

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

          onClose();
          navigate("/signin", { replace: true });
          return;
        }

        console.error("Failed to fetch sidebar user:", error);
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [navigate, onClose]);

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
      console.error("Failed to sign out from sidebar:", error);
    } finally {
      clearStoredAuth();
      setStoredUser(null);
      onClose();
      navigate("/signin", { replace: true });
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-scrim/70 transition duration-300 md:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[96px] max-w-[96px] flex-col border-r border-border bg-linear-to-b from-bg-surface via-bg-surface to-brand-soft/30 px-3 py-4 text-text-primary shadow-2 transition-transform duration-300 ease-out md:static md:h-screen md:translate-x-0 lg:w-full lg:max-w-[272px] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-center gap-2.5 border-b border-border pb-3 lg:justify-between">
          <Link to={"/admin/dashboard"} className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow-1 ring-1 ring-brand/10 lg:h-10 lg:w-16">
              <img
                src="/logo-preview.png"
                alt="Apsor logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-base font-bold tracking-tight text-text-primary">Apsor Console</h1>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg-surface text-text-secondary transition hover:border-brand/35 hover:text-brand md:hidden"
            aria-label={text.closeSidebar}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
          {navSections
            .filter((section) => section.items.length > 0)
            .map((section) => (
            <section key={section.title}>
              <p className="hidden px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted lg:block">
                {section.title}
              </p>
              <div className="mt-1.5 space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  if (!item.to) {
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={onClose}
                        className="group flex w-full items-center justify-center gap-2.5 rounded-2xl px-2 py-2.5 text-left text-text-secondary transition hover:bg-white/80 hover:shadow-[0_12px_24px_rgba(15,23,42,0.06)] hover:text-text-primary lg:justify-start lg:px-3"
                        title={item.label}
                        aria-label={item.label}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-linear-to-br from-white to-brand-soft/25 text-brand shadow-[0_10px_22px_rgba(15,23,42,0.06)] transition group-hover:border-brand/25 group-hover:text-brand">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="hidden min-w-0 flex-1 lg:block">
                          <span className="block truncate text-[13px] font-semibold">{item.label}</span>
                        </span>
                      </button>
                    );
                  }

                  return (
                    <NavLink
                      key={item.key}
                      to={item.to}
                      end={item.to === "/admin/dashboard"}
                      onClick={onClose}
                      title={item.label}
                      aria-label={item.label}
                      className={({ isActive }) => `group flex w-full items-center justify-center gap-2.5 rounded-2xl px-2 py-2.5 text-left transition lg:justify-start lg:px-3 ${
                        isActive
                          ? "bg-linear-to-r from-brand via-brand to-sky-500 text-white shadow-[0_18px_36px_rgba(59,130,246,0.28)]"
                          : "bg-transparent text-text-secondary hover:bg-white/80 hover:text-text-primary hover:shadow-[0_12px_24px_rgba(15,23,42,0.06)]"
                      }`}
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-[0_10px_22px_rgba(15,23,42,0.06)] ${
                              isActive
                                ? "border-white/15 bg-white/14 text-white"
                                : "border-border/70 bg-linear-to-br from-white to-brand-soft/25 text-brand group-hover:border-brand/25"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="hidden min-w-0 flex-1 lg:block">
                            <span className="block truncate text-[13px] font-semibold">{item.label}</span>
                          </span>
                          {item.badge ? (
                            <span
                              className={`hidden rounded-pill px-2 py-0.5 text-[10px] font-bold lg:inline-flex ${
                                isActive ? "bg-white text-brand" : "border border-border/70 bg-white/80 text-text-secondary"
                              }`}
                            >
                              {item.badge}
                            </span>
                          ) : null}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>
        <div className="mt-3 rounded-xl border border-border bg-bg-surface p-2 shadow-1 lg:p-2.5">
          <div className="flex items-center justify-between gap-2 lg:justify-start lg:gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
              {initials}
            </div>
            <div className="hidden min-w-0 flex-1 lg:block">
              <p className="truncate text-[13px] font-semibold text-text-primary">{displayName}</p>
              <p className="truncate text-xs uppercase text-text-muted">{roleLabel}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-subtle text-text-secondary transition hover:border-brand/35 hover:text-brand"
              aria-label={text.signOut}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
