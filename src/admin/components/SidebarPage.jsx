import React, { useEffect, useState } from "react";
import {
  Blocks,
  BriefcaseBusiness,
  FolderKanban,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLang } from "../../i18n/useLang";
import { fetchCurrentUser, signOut } from "../../api";
import {
  AUTH_STORAGE_EVENT,
  clearStoredAuth,
  getStoredAccessToken,
  getStoredCurrentUser,
  persistCurrentUser,
} from "../../page/auth/authStorage";

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

  const navSections = [
    {
      title: text.overview,
      items: [
        { key: "dashboard", label: text.dashboard, icon: LayoutDashboard, badge: text.live, to: "/admin/dashboard" },
      ],
    },
    {
      title: text.management,
      items: [
        { key: "categories", label: text.categories, icon: FolderKanban, to: "/admin/dashboard/categories" },
        { key: "subcategories", label: text.subcategories, icon: FolderTree, to: "/admin/dashboard/subcategories" },
        { key: "services", label: text.services, icon: Blocks, to: "/admin/dashboard/services" },
        { key: "users", label: text.users, icon: Users, to: "/admin/dashboard/users" },
        { key: "customers", label: text.customers, icon: UserRound, to: "/admin/dashboard/customers" },
        { key: "providers", label: text.providers, icon: BriefcaseBusiness, to: "/admin/dashboard/providers" },
      ],
    },
    {
      title: text.support,
      items: [
        { key: "settings", label: text.settings, icon: Settings },
      ],
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
  }, []);

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
        className={`fixed inset-y-0 left-0 z-50 flex w-[272px] max-w-[82vw] flex-col border-r border-border bg-linear-to-b from-bg-surface via-bg-surface to-brand-soft/30 px-3 py-4 text-text-primary shadow-2 transition-transform duration-300 ease-out md:static md:h-screen md:w-full md:max-w-[272px] md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2.5 border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-16 items-center justify-center overflow-hidden rounded-xl shadow-1 ring-1 ring-brand/10">
              <img
                src="/logo-preview.png"
                alt="Apsor logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-text-primary">Apsor Console</h1>
            </div>
          </div>

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
          {navSections.map((section) => (
            <section key={section.title}>
              <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
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
                        className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-text-secondary transition hover:bg-brand-soft/60 hover:text-text-primary"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-subtle text-brand">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
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
                      className={({ isActive }) => `flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition ${
                        isActive
                          ? "bg-brand text-white shadow-2"
                          : "bg-transparent text-text-secondary hover:bg-brand-soft/60 hover:text-text-primary"
                      }`}
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              isActive ? "bg-white/15 text-white" : "bg-bg-subtle text-brand"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-semibold">{item.label}</span>
                          </span>
                          {item.badge ? (
                            <span
                              className={`rounded-pill px-2 py-0.5 text-[10px] font-bold ${
                                isActive ? "bg-white text-brand" : "bg-bg-subtle text-text-secondary"
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
        <div className="mt-3 rounded-xl border border-border bg-bg-surface p-2.5 shadow-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-text-primary">{displayName}</p>
              <p className="truncate text-xs uppercase text-text-muted">{roleLabel}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg-subtle text-text-secondary transition hover:border-brand/35 hover:text-brand"
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
