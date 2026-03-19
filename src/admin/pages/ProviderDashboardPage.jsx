import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, FolderOpenDot, RefreshCw, Upload, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/useLang";
import { fetchProviderServices } from "../../api";

const UI_TEXT = {
  en: {
    liveData: "Provider view",
    overviewTitle: "Provider dashboard",
    overviewDescription: "Track your published services, keep drafts moving, and jump back into service creation quickly.",
    refresh: "Refresh",
    requestFailed: "Failed to load provider dashboard data.",
    quickActions: "Quick actions",
    latestServices: "Latest services",
    emptyServices: "No provider services yet.",
    open: "Open",
    createService: "Create service",
    createServiceDescription: "Start a new service and publish it to your profile.",
    manageServices: "My services",
    manageServicesDescription: "Review your latest services from the provider endpoint.",
    totalServices: "Total services",
    publishedServices: "Published",
    draftServices: "Drafts",
    latestUpdate: "Latest update",
    never: "No updates yet",
  },
  km: {
    liveData: "ផ្នែកអ្នកផ្តល់សេវា",
    overviewTitle: "ផ្ទាំងគ្រប់គ្រងអ្នកផ្តល់សេវា",
    overviewDescription: "តាមដានសេវាកម្មដែលបានបោះពុម្ព រក្សាទុកព្រាង និងត្រឡប់ទៅបង្កើតសេវាកម្មបានលឿន។",
    refresh: "ផ្ទុកឡើងវិញ",
    requestFailed: "មិនអាចផ្ទុកទិន្នន័យផ្ទាំងគ្រប់គ្រងអ្នកផ្តល់សេវាបានទេ។",
    quickActions: "សកម្មភាពរហ័ស",
    latestServices: "សេវាកម្មចុងក្រោយ",
    emptyServices: "មិនទាន់មានសេវាកម្មរបស់អ្នកផ្តល់សេវាទេ។",
    open: "បើក",
    createService: "បង្កើតសេវាកម្ម",
    createServiceDescription: "ចាប់ផ្តើមសេវាកម្មថ្មី ហើយបោះពុម្ពលើប្រវត្តិរូបរបស់អ្នក។",
    manageServices: "សេវាកម្មរបស់ខ្ញុំ",
    manageServicesDescription: "ពិនិត្យសេវាកម្មចុងក្រោយរបស់អ្នកពី endpoint របស់ provider។",
    totalServices: "សេវាកម្មសរុប",
    publishedServices: "បានបោះពុម្ព",
    draftServices: "ព្រាង",
    latestUpdate: "កែប្រែចុងក្រោយ",
    never: "មិនទាន់មានការកែប្រែ",
  },
};

function readStoredJson(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getDraftCount() {
  const payload = readStoredJson("apsor:uploadServicePayload");
  return payload && typeof payload === "object" ? 1 : 0;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function StatCard({ label, value, icon: Icon, accent, iconWrap }) {
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

export default function ProviderDashboardPage() {
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({
    totalServices: 0,
    publishedServices: 0,
    draftServices: 0,
  });

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await fetchProviderServices({
        keyword: "",
        pageNumber: 0,
        pageSize: 5,
        sortBy: "id",
        sortOrder: "desc",
      });

      const draftServices = getDraftCount();

      setServices(result.items || []);
      setStats({
        totalServices: (result.totalElements ?? result.items.length) + draftServices,
        publishedServices: result.totalElements ?? result.items.length,
        draftServices,
      });
    } catch (error) {
      console.error("Failed to load provider dashboard:", error);
      setErrorMessage(text.requestFailed);
      setServices([]);
      setStats({
        totalServices: getDraftCount(),
        publishedServices: 0,
        draftServices: getDraftCount(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [text.requestFailed]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const quickLinks = useMemo(() => ([
    {
      title: text.createService,
      description: text.createServiceDescription,
      to: "/upload-service",
      icon: Upload,
    },
    {
      title: text.manageServices,
      description: text.manageServicesDescription,
      to: "/admin/service",
      icon: FolderOpenDot,
    },
  ]), [text.createService, text.createServiceDescription, text.manageServices, text.manageServicesDescription]);

  const statCards = useMemo(() => ([
    {
      key: "totalServices",
      label: text.totalServices,
      icon: FolderOpenDot,
      accent: "from-sky-500/20 via-bg-surface to-sky-500/5",
      iconWrap: "bg-sky-500 text-white",
    },
    {
      key: "publishedServices",
      label: text.publishedServices,
      icon: WalletCards,
      accent: "from-emerald-500/20 via-bg-surface to-emerald-500/5",
      iconWrap: "bg-emerald-500 text-white",
    },
    {
      key: "draftServices",
      label: text.draftServices,
      icon: Upload,
      accent: "from-amber-500/20 via-bg-surface to-amber-500/5",
      iconWrap: "bg-amber-500 text-white",
    },
  ]), [text.draftServices, text.publishedServices, text.totalServices]);

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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((item) => (
          <StatCard
            key={item.key}
            label={item.label}
            value={isLoading ? "..." : stats[item.key]}
            icon={item.icon}
            accent={item.accent}
            iconWrap={item.iconWrap}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-border bg-bg-surface p-5 shadow-1">
          <h2 className="text-lg font-bold tracking-tight text-text-primary">{text.quickActions}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
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
              <h2 className="text-lg font-bold tracking-tight text-text-primary">{text.latestServices}</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {lang === "km" ? "សេវាកម្មចុងក្រោយដែលអ្នកបានបោះពុម្ព។" : "Your latest published services."}
              </p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Clock3 className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {!isLoading && services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-bg-subtle/35 px-4 py-8 text-center text-sm text-text-muted">
                {text.emptyServices}
              </div>
            ) : null}

            {services.map((service) => (
              <article
                key={service.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-linear-to-r from-bg-surface to-brand-soft/15 px-3 py-3"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-sm font-bold text-brand">
                  {(service.title || "S").slice(0, 1).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">{service.title || "--"}</p>
                  <p className="truncate text-sm text-text-secondary">
                    {service.location?.[0]?.city || service.location?.[0]?.district || "--"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{text.latestUpdate}</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {formatDate(service.updatedAt || service.createdAt) || text.never}
                  </p>
                </div>
              </article>
            ))}

            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`provider-service-skeleton-${index + 1}`}
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
