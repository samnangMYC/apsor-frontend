import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, FolderKanban, FolderTree, Logs, RefreshCw, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchAdminCategories, fetchAdminSubcategories, fetchAdminUsers, fetchAuditLogs } from "../../api";
import { useLang } from "../../i18n/useLang";
import { formatAdminDate } from "../utils/categoryAdmin";
import { getAdminDashboardText, getUserTypeLabel } from "../utils/adminDashboardPage";

function StatCard({ label, value, accent, iconWrap, icon: Icon }) {
  return (
    <article className={`rounded-2xl border border-border bg-linear-to-br ${accent} p-4 shadow-1`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-text-primary">{value}</p>
        </div>
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-1 ${iconWrap}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}

function QuickLinkCard({ title, description, to, icon: Icon, actionLabel }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/25 p-4 shadow-1 transition duration-200 hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-2"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand shadow-1">
          <Icon className="h-5 w-5" />
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
          {actionLabel}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold tracking-tight text-text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { lang } = useLang("km");
  const text = useMemo(() => getAdminDashboardText(lang), [lang]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    categories: 0,
    subcategories: 0,
    auditLogs: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [
        allUsersResult,
        activeUsersResult,
        categoriesResult,
        subcategoriesResult,
        auditLogsResult,
      ] = await Promise.all([
        fetchAdminUsers({ pageNumber: 0, pageSize: 5, sortBy: "updatedAt", sortOrder: "desc" }),
        fetchAdminUsers({ pageNumber: 0, pageSize: 1, sortBy: "id", sortOrder: "desc", status: "ACTIVE" }),
        fetchAdminCategories({ pageNumber: 0, pageSize: 1, sortBy: "id", sortOrder: "desc" }),
        fetchAdminSubcategories({ pageNumber: 0, pageSize: 1, sortBy: "id", sortOrder: "desc" }),
        fetchAuditLogs({ pageNumber: 0, pageSize: 1 }),
      ]);

      setStats({
        totalUsers: allUsersResult.totalItems ?? 0,
        activeUsers: activeUsersResult.totalItems ?? 0,
        categories: categoriesResult.totalItems ?? 0,
        subcategories: subcategoriesResult.totalItems ?? 0,
        auditLogs: auditLogsResult.totalElements ?? 0,
      });
      setRecentUsers(allUsersResult.items || []);
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
      setErrorMessage(text.requestFailed);
    } finally {
      setIsLoading(false);
    }
  }, [text.requestFailed]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const quickLinks = useMemo(() => ([
    {
      title: text.viewAllUsers,
      description: lang === "km"
        ? "គ្រប់គ្រងអ្នកប្រើ ពិនិត្យស្ថានភាព និងធ្វើបច្ចុប្បន្នភាពសិទ្ធិប្រើប្រាស់។"
        : "Manage accounts, review statuses, and update user access.",
      to: "/admin/dashboard/users",
      icon: Users,
    },
    {
      title: text.viewCategories,
      description: lang === "km"
        ? "គ្រប់គ្រងប្រភេទសេវាកម្ម រូបភាព និងលំដាប់បង្ហាញ។"
        : "Manage service categories, images, and display order.",
      to: "/admin/dashboard/categories",
      icon: FolderKanban,
    },
    {
      title: text.viewSubcategories,
      description: lang === "km"
        ? "ពិនិត្យ និងកែប្រែប្រភេទរងសម្រាប់ការរៀបចំសេវាកម្មឱ្យច្បាស់លាស់។"
        : "Review and refine subcategories for clearer service organization.",
      to: "/admin/dashboard/subcategories",
      icon: FolderTree,
    },
    {
      title: text.viewAuditLogs,
      description: lang === "km"
        ? "ពិនិត្យកំណត់ហេតុសកម្មភាពរបស់អ្នកប្រើ និងតាមដានការផ្លាស់ប្តូរសំខាន់ៗក្នុងប្រព័ន្ធ។"
        : "Review user activity logs and track important system changes.",
      to: "/admin/dashboard/audit-logs",
      icon: Logs,
    },
  ]), [lang, text.viewAllUsers, text.viewAuditLogs, text.viewCategories, text.viewSubcategories]);

  return (
    <section className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/30 p-5 shadow-1 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-pill border border-brand/20 bg-brand-soft/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
              {text.liveData}
            </span>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-text-primary sm:text-3xl">
              {text.overviewTitle}
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary sm:text-base">
              {text.overviewDescription}
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-bg-surface px-4 text-sm font-semibold text-text-secondary transition hover:border-brand/35 hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {text.refresh}
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-danger/25 bg-danger/8 px-4 py-3 text-sm text-danger">
            {errorMessage}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {text.stats.map((item) => (
          <StatCard
            key={item.key}
            label={item.label}
            value={isLoading ? "..." : stats[item.key]}
            accent={item.accent}
            iconWrap={item.iconWrap}
            icon={item.icon}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-border bg-bg-surface p-5 shadow-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-text-primary">{text.quickActions}</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {lang === "km"
                  ? "ចូលទៅផ្នែកគ្រប់គ្រងសំខាន់ៗដោយផ្ទាល់។"
                  : "Jump straight into the main management areas."}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-3">
            {quickLinks.map((item) => (
              <QuickLinkCard
                key={item.to}
                title={item.title}
                description={item.description}
                to={item.to}
                icon={item.icon}
                actionLabel={text.open}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg-surface p-5 shadow-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-text-primary">{text.latestUsers}</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {lang === "km"
                  ? "តាមដានសកម្មភាពអ្នកប្រើចុងក្រោយនៅក្នុងប្រព័ន្ធ។"
                  : "Track the latest user activity in the system."}
              </p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Clock3 className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {!isLoading && recentUsers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-bg-subtle/35 px-4 py-8 text-center text-sm text-text-muted">
                {text.emptyUsers}
              </div>
            ) : null}

            {recentUsers.map((user) => {
              const displayName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || user.email;

              return (
                <article
                  key={user.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-linear-to-r from-bg-surface to-brand-soft/15 px-3 py-3"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-sm font-bold text-brand">
                    {(displayName || "U").slice(0, 1).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-text-primary">{displayName}</p>
                      <span className="inline-flex rounded-pill bg-bg-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                        {getUserTypeLabel(user.userType, text)}
                      </span>
                    </div>
                    <p className="truncate text-sm text-text-secondary">{user.email || "--"}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{text.lastLogin}</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {user.lastLoginAt ? formatAdminDate(user.lastLoginAt, lang) : text.never}
                    </p>
                  </div>
                </article>
              );
            })}

            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`user-skeleton-${index + 1}`}
                  className="h-[74px] animate-pulse rounded-2xl border border-border bg-linear-to-r from-bg-subtle via-brand-soft/45 to-bg-surface"
                />
              ))
            ) : null}
          </div>
        </div>
      </section>
    </section>
  );
}
