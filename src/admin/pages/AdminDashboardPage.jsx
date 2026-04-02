import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, BarChart3, Clock3, FolderKanban, FolderTree, Logs, RefreshCw, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchAdminDashboard } from "../../api";
import { useLang } from "../../i18n/useLang";
import { formatAdminDate } from "../utils/categoryAdmin";
import { getAdminDashboardText } from "../utils/adminDashboardPage";

function getDayKey(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function formatChartDateLabel(value, lang) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(lang === "km" ? "km-KH" : "en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatCompactNumber(value, lang) {
  return new Intl.NumberFormat(lang === "km" ? "km-KH" : "en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

function StatCard({ label, value, accent, iconWrap, icon }) {
  const Icon = icon;

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

function QuickLinkCard({ title, description, to, icon, actionLabel }) {
  const Icon = icon;

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

function ChartPanel({ title, description, icon, children }) {
  const Icon = icon;

  return (
    <article className="rounded-2xl border border-border bg-bg-surface p-5 shadow-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-text-primary">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function EmptyChartState({ message }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-bg-subtle/35 px-4 py-8 text-center text-sm text-text-muted">
      {message}
    </div>
  );
}

function ComparisonBarChart({ data, lang }) {
  const maxValue = Math.max(...data.map((item) => item.value), 0);

  if (!maxValue) {
    return null;
  }

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.key} className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${item.dotClass}`} />
              <span className="truncate text-sm font-medium text-text-primary">{item.label}</span>
            </div>
            <span className="text-sm font-semibold text-text-secondary">
              {formatCompactNumber(item.value, lang)}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-bg-subtle">
            <div
              className={`h-full rounded-full bg-linear-to-r ${item.barClass}`}
              style={{ width: `${Math.max((item.value / maxValue) * 100, 8)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityChart({ data, text, lang }) {
  const maxValue = Math.max(...data.flatMap((item) => [item.users, item.logs]), 0);

  if (!maxValue) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
          {text.newUsers}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
          {text.auditEvents}
        </span>
      </div>

      <div className="grid grid-cols-7 items-end gap-3">
        {data.map((item) => (
          <div key={item.key} className="flex flex-col items-center gap-3">
            <div className="flex h-40 w-full items-end justify-center gap-1.5 rounded-2xl bg-linear-to-b from-bg-subtle/30 to-bg-subtle/65 px-2 py-3">
              <div
                className="w-3 rounded-full bg-sky-500/90"
                style={{ height: `${Math.max((item.users / maxValue) * 100, item.users ? 10 : 0)}%` }}
                title={`${text.newUsers}: ${item.users}`}
              />
              <div
                className="w-3 rounded-full bg-indigo-500/90"
                style={{ height: `${Math.max((item.logs / maxValue) * 100, item.logs ? 10 : 0)}%` }}
                title={`${text.auditEvents}: ${item.logs}`}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-text-primary">{formatChartDateLabel(item.key, lang)}</p>
              <p className="mt-1 text-[11px] text-text-muted">{item.users + item.logs}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditActionChart({ data, lang }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!total) {
    return null;
  }

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.key} className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">
              {item.label}
            </span>
            <span className="text-sm text-text-secondary">
              {item.value} • {Math.round((item.value / total) * 100)}%
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-bg-subtle">
            <div
              className={`h-full rounded-full bg-linear-to-r ${item.barClass}`}
              style={{ width: `${(item.value / total) * 100}%` }}
            />
          </div>
        </div>
      ))}

      <div className="rounded-2xl bg-bg-subtle/45 px-4 py-3 text-sm text-text-secondary">
        {formatCompactNumber(total, lang)} total
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { lang } = useLang("km");
  const text = useMemo(() => getAdminDashboardText(lang), [lang]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCategories: 0,
    totalSubcategories: 0,
    totalAuditLogs: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState([]);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await fetchAdminDashboard();

      setStats({
        totalUsers: Number(result?.totalUsers || 0),
        totalCategories: Number(result?.totalCategories || 0),
        totalSubcategories: Number(result?.totalSubcategories || 0),
        totalAuditLogs: Number(result?.totalAuditLogs || 0),
      });
      setRecentUsers(Array.isArray(result?.recentUsers) ? result.recentUsers : []);
      setRecentAuditLogs(Array.isArray(result?.recentAuditLogs) ? result.recentAuditLogs : []);
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

  const comparisonData = useMemo(() => ([
    {
      key: "totalUsers",
      label: text.totalUsers,
      value: stats.totalUsers,
      dotClass: "bg-sky-500",
      barClass: "from-sky-400 to-sky-600",
    },
    {
      key: "totalCategories",
      label: text.totalCategories,
      value: stats.totalCategories,
      dotClass: "bg-amber-500",
      barClass: "from-amber-400 to-amber-600",
    },
    {
      key: "totalSubcategories",
      label: text.totalSubcategories,
      value: stats.totalSubcategories,
      dotClass: "bg-fuchsia-500",
      barClass: "from-fuchsia-400 to-fuchsia-600",
    },
    {
      key: "totalAuditLogs",
      label: text.totalAuditLogs,
      value: stats.totalAuditLogs,
      dotClass: "bg-indigo-500",
      barClass: "from-indigo-400 to-indigo-600",
    },
  ]), [
    stats.totalAuditLogs,
    stats.totalCategories,
    stats.totalSubcategories,
    stats.totalUsers,
    text.totalAuditLogs,
    text.totalCategories,
    text.totalSubcategories,
    text.totalUsers,
  ]);

  const recentActivityData = useMemo(() => {
    const dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return date.toISOString().slice(0, 10);
    });

    const userCounts = recentUsers.reduce((accumulator, user) => {
      const key = getDayKey(user.createdAt);
      if (!key) return accumulator;
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    const logCounts = recentAuditLogs.reduce((accumulator, log) => {
      const key = getDayKey(log.occurredAt);
      if (!key) return accumulator;
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    return dates.map((key) => ({
      key,
      users: userCounts[key] || 0,
      logs: logCounts[key] || 0,
    }));
  }, [recentAuditLogs, recentUsers]);

  const auditActionData = useMemo(() => {
    const colorSets = [
      "from-emerald-400 to-emerald-600",
      "from-sky-400 to-sky-600",
      "from-amber-400 to-amber-600",
      "from-fuchsia-400 to-fuchsia-600",
      "from-rose-400 to-rose-600",
    ];

    return Object.entries(
      recentAuditLogs.reduce((accumulator, log) => {
        const key = String(log.action || "UNKNOWN").toUpperCase();
        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
      }, {}),
    )
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([label, value], index) => ({
        key: label,
        label,
        value,
        barClass: colorSets[index % colorSets.length],
      }));
  }, [recentAuditLogs]);

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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <section className="rounded-[28px] border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/20 p-5 shadow-1 sm:p-6">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-pill border border-brand/20 bg-brand-soft/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
            {text.analyticsTitle}
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-text-primary">
            {text.analyticsTitle}
          </h2>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {text.analyticsDescription}
          </p>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <ChartPanel
            title={text.entityComparison}
            description={text.entityComparisonDescription}
            icon={BarChart3}
          >
            {isLoading ? (
              <div className="h-56 animate-pulse rounded-2xl bg-linear-to-r from-bg-subtle via-brand-soft/35 to-bg-surface" />
            ) : comparisonData.some((item) => item.value > 0) ? (
              <ComparisonBarChart data={comparisonData} lang={lang} />
            ) : (
              <EmptyChartState message={text.noChartData} />
            )}
          </ChartPanel>

          <ChartPanel
            title={text.recentActivity}
            description={text.recentActivityDescription}
            icon={Activity}
          >
            {isLoading ? (
              <div className="h-56 animate-pulse rounded-2xl bg-linear-to-r from-bg-subtle via-brand-soft/35 to-bg-surface" />
            ) : recentActivityData.some((item) => item.users > 0 || item.logs > 0) ? (
              <ActivityChart data={recentActivityData} text={text} lang={lang} />
            ) : (
              <EmptyChartState message={text.noChartData} />
            )}
          </ChartPanel>

          <ChartPanel
            title={text.actionBreakdown}
            description={text.actionBreakdownDescription}
            icon={Logs}
          >
            {isLoading ? (
              <div className="h-56 animate-pulse rounded-2xl bg-linear-to-r from-bg-subtle via-brand-soft/35 to-bg-surface" />
            ) : auditActionData.length > 0 ? (
              <AuditActionChart data={auditActionData} lang={lang} />
            ) : (
              <EmptyChartState message={text.noChartData} />
            )}
          </ChartPanel>
        </div>
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
              const displayName = user.username || user.email || "--";

              return (
                <article
                  key={`${user.email || user.username}-${user.createdAt}`}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-linear-to-r from-bg-surface to-brand-soft/15 px-3 py-3"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-sm font-bold text-brand">
                    {(displayName || "U").slice(0, 1).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">{displayName}</p>
                    <p className="truncate text-sm text-text-secondary">{user.email || "--"}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{text.createdAt}</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {user.createdAt ? formatAdminDate(user.createdAt, lang) : "--"}
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

        <div className="rounded-2xl border border-border bg-bg-surface p-5 shadow-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-text-primary">{text.latestAuditLogs}</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {lang === "km"
                  ? "តាមដានសកម្មភាពចុងក្រោយពី backend dashboard។"
                  : "Track the latest activity returned by the backend dashboard."}
              </p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Logs className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {!isLoading && recentAuditLogs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-bg-subtle/35 px-4 py-8 text-center text-sm text-text-muted">
                {text.emptyAuditLogs}
              </div>
            ) : null}

            {recentAuditLogs.map((log, index) => (
              <article
                key={`${log.occurredAt || "log"}-${log.action || "action"}-${index}`}
                className="rounded-2xl border border-border bg-linear-to-r from-bg-surface to-brand-soft/15 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex rounded-pill bg-bg-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                        {log.action || "--"}
                      </span>
                      <p className="truncate text-sm font-semibold text-text-primary">{log.resourceType || "--"}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">{log.details || "--"}</p>
                    <p className="mt-2 text-xs text-text-muted">
                      {(log.username || "--")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{text.occurredAt}</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {log.occurredAt ? formatAdminDate(log.occurredAt, lang) : "--"}
                    </p>
                  </div>
                </div>
              </article>
            ))}

            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`audit-skeleton-${index + 1}`}
                  className="h-[92px] animate-pulse rounded-2xl border border-border bg-linear-to-r from-bg-subtle via-brand-soft/45 to-bg-surface"
                />
              ))
            ) : null}
          </div>
        </div>
      </section>
    </section>
  );
}
