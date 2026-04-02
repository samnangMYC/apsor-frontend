import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, BarChart3, Clock3, FolderOpenDot, RefreshCw, ShoppingBag, Upload, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/useLang";
import { fetchProviderOrders, fetchProviderServices } from "../../api";

const UI_TEXT = {
  en: {
    liveData: "Provider view",
    overviewTitle: "Provider dashboard",
    overviewDescription: "Track your published services, keep drafts moving, and jump back into service creation quickly.",
    refresh: "Refresh",
    requestFailed: "Failed to load provider dashboard data.",
    quickActions: "Quick actions",
    analyticsTitle: "Performance snapshot",
    analyticsDescription: "See service momentum and order load with compact visuals built from your latest provider data.",
    serviceMix: "Service mix",
    serviceMixDescription: "Compare published services against local drafts waiting to be completed.",
    serviceUpdates: "Recent service updates",
    serviceUpdatesDescription: "Track when your latest services were created or updated over the last 7 days.",
    orderBreakdown: "Order status breakdown",
    orderBreakdownDescription: "See how your current order pipeline is distributed by status.",
    published: "Published",
    drafts: "Drafts",
    serviceUpdatesCount: "Service updates",
    noChartData: "Not enough data to display this chart yet.",
    totalOrders: "Total orders",
    totalRevenue: "Revenue",
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
    analyticsTitle: "ទិដ្ឋភាពប្រតិបត្តិការ",
    analyticsDescription: "មើលល្បឿនសេវាកម្ម និងបន្ទុកការបញ្ជាទិញតាមរយៈគំនូសតាងសង្ខេបពីទិន្នន័យ provider របស់អ្នក។",
    serviceMix: "សមាសភាពសេវាកម្ម",
    serviceMixDescription: "ប្រៀបធៀបសេវាកម្មដែលបានបោះពុម្ពជាមួយព្រាងដែលកំពុងរង់ចាំបញ្ចប់។",
    serviceUpdates: "ការកែប្រែសេវាកម្មថ្មីៗ",
    serviceUpdatesDescription: "តាមដានពេលវេលាបង្កើត ឬកែប្រែសេវាកម្មរបស់អ្នកក្នុងរយៈពេល 7 ថ្ងៃចុងក្រោយ។",
    orderBreakdown: "ការបែងចែកស្ថានភាពបញ្ជាទិញ",
    orderBreakdownDescription: "មើលថាការបញ្ជាទិញបច្ចុប្បន្នរបស់អ្នកត្រូវបានចែកចាយតាមស្ថានភាពយ៉ាងដូចម្តេច។",
    published: "បានបោះពុម្ព",
    drafts: "ព្រាង",
    serviceUpdatesCount: "ការកែប្រែសេវាកម្ម",
    noChartData: "មិនទាន់មានទិន្នន័យគ្រប់គ្រាន់សម្រាប់បង្ហាញគំនូសតាង។",
    totalOrders: "ការបញ្ជាទិញសរុប",
    totalRevenue: "ចំណូលសរុប",
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

function formatCurrency(value, currency = "USD", lang = "en") {
  return new Intl.NumberFormat(lang === "km" ? "km-KH" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

async function fetchAllProviderOrdersForDashboard() {
  const pageSize = 100;
  let pageNumber = 0;
  let items = [];
  let lastPage = false;
  let totalElements = 0;

  while (!lastPage && pageNumber < 20) {
    const result = await fetchProviderOrders({
      keyword: "",
      pageNumber,
      pageSize,
      sortBy: "id",
      sortOrder: "desc",
    });

    items = items.concat(result.items || []);
    totalElements = result.totalElements ?? items.length;
    lastPage = Boolean(result.lastPage) || pageNumber + 1 >= (result.totalPages || 1);
    pageNumber += 1;
  }

  return {
    items,
    totalElements,
  };
}

function StatCard({ label, value, icon, accent, iconWrap }) {
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

function ServiceMixChart({ publishedServices, draftServices, text }) {
  const total = publishedServices + draftServices;

  if (!total) {
    return null;
  }

  const publishedPercent = (publishedServices / total) * 100;
  const draftPercent = (draftServices / total) * 100;

  return (
    <div className="space-y-4">
      <div className="flex h-4 overflow-hidden rounded-full bg-bg-subtle">
        <div className="bg-linear-to-r from-emerald-400 to-emerald-600" style={{ width: `${publishedPercent}%` }} />
        <div className="bg-linear-to-r from-amber-400 to-amber-600" style={{ width: `${draftPercent}%` }} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-bg-subtle/35 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">{text.published}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-text-primary">{publishedServices}</p>
        </div>
        <div className="rounded-2xl border border-border bg-bg-subtle/35 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">{text.drafts}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-text-primary">{draftServices}</p>
        </div>
      </div>
    </div>
  );
}

function ServiceUpdatesChart({ data, text, lang }) {
  const maxValue = Math.max(...data.map((item) => item.count), 0);

  if (!maxValue) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
        {text.serviceUpdatesCount}
      </div>
      <div className="grid grid-cols-7 items-end gap-3">
        {data.map((item) => (
          <div key={item.key} className="flex flex-col items-center gap-3">
            <div className="flex h-40 w-full items-end justify-center rounded-2xl bg-linear-to-b from-bg-subtle/30 to-bg-subtle/65 px-2 py-3">
              <div
                className="w-5 rounded-full bg-linear-to-t from-sky-500 to-brand"
                style={{ height: `${Math.max((item.count / maxValue) * 100, item.count ? 10 : 0)}%` }}
                title={`${text.serviceUpdatesCount}: ${item.count}`}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-text-primary">{formatChartDateLabel(item.key, lang)}</p>
              <p className="mt-1 text-[11px] text-text-muted">{item.count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderStatusChart({ data, totalOrders }) {
  if (!totalOrders) {
    return null;
  }

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.key} className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">{item.label}</span>
            <span className="text-sm text-text-secondary">{item.value} • {Math.round((item.value / totalOrders) * 100)}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-bg-subtle">
            <div
              className={`h-full rounded-full bg-linear-to-r ${item.barClass}`}
              style={{ width: `${(item.value / totalOrders) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProviderDashboardPage() {
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalServices: 0,
    publishedServices: 0,
    draftServices: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [currency, setCurrency] = useState("USD");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [serviceResult, orderResult] = await Promise.all([
        fetchProviderServices({
          keyword: "",
          pageNumber: 0,
          pageSize: 5,
          sortBy: "id",
          sortOrder: "desc",
        }),
        fetchAllProviderOrdersForDashboard(),
      ]);

      const draftServices = getDraftCount();
      const orderItems = orderResult.items || [];
      const completedRevenue = orderItems.reduce((sum, order) => {
        const status = String(order?.status || "").toUpperCase();
        if (status !== "COMPLETED") {
          return sum;
        }

        return sum + Number(order?.total || 0);
      }, 0);

      setServices(serviceResult.items || []);
      setOrders(orderItems);
      setCurrency(orderItems[0]?.currency || "USD");
      setStats({
        totalServices: (serviceResult.totalElements ?? serviceResult.items.length) + draftServices,
        publishedServices: serviceResult.totalElements ?? serviceResult.items.length,
        draftServices,
        totalOrders: orderResult.totalElements ?? orderItems.length ?? 0,
        totalRevenue: completedRevenue,
      });
    } catch (error) {
      console.error("Failed to load provider dashboard:", error);
      setErrorMessage(text.requestFailed);
      setServices([]);
      setOrders([]);
      setStats({
        totalServices: getDraftCount(),
        publishedServices: 0,
        draftServices: getDraftCount(),
        totalOrders: 0,
        totalRevenue: 0,
      });
      setCurrency("USD");
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
    {
      key: "totalOrders",
      label: text.totalOrders,
      icon: ShoppingBag,
      accent: "from-indigo-500/20 via-bg-surface to-indigo-500/5",
      iconWrap: "bg-indigo-500 text-white",
    },
    {
      key: "totalRevenue",
      label: text.totalRevenue,
      icon: WalletCards,
      accent: "from-rose-500/20 via-bg-surface to-rose-500/5",
      iconWrap: "bg-rose-500 text-white",
      isCurrency: true,
    },
  ]), [text.draftServices, text.publishedServices, text.totalOrders, text.totalRevenue, text.totalServices]);

  const serviceUpdateData = useMemo(() => {
    const dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return date.toISOString().slice(0, 10);
    });

    const counts = services.reduce((accumulator, service) => {
      const key = getDayKey(service.updatedAt || service.createdAt);
      if (!key) return accumulator;
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    return dates.map((key) => ({
      key,
      count: counts[key] || 0,
    }));
  }, [services]);

  const orderStatusData = useMemo(() => {
    const labels = {
      PENDING: lang === "km" ? "កំពុងរង់ចាំ" : "Pending",
      CONFIRMED: lang === "km" ? "បានបញ្ជាក់" : "Confirmed",
      IN_PROGRESS: lang === "km" ? "កំពុងដំណើរការ" : "In Progress",
      COMPLETED: lang === "km" ? "បានបញ្ចប់" : "Completed",
      CANCELED: lang === "km" ? "បានបោះបង់" : "Canceled",
    };

    const colorMap = {
      PENDING: "from-amber-400 to-amber-600",
      CONFIRMED: "from-sky-400 to-sky-600",
      IN_PROGRESS: "from-indigo-400 to-indigo-600",
      COMPLETED: "from-emerald-400 to-emerald-600",
      CANCELED: "from-rose-400 to-rose-600",
    };

    return Object.entries(
      orders.reduce((accumulator, order) => {
        const key = String(order?.status || "PENDING").toUpperCase();
        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
      }, {}),
    )
      .sort((left, right) => right[1] - left[1])
      .map(([key, value]) => ({
        key,
        label: labels[key] || key,
        value,
        barClass: colorMap[key] || "from-slate-400 to-slate-600",
      }));
  }, [lang, orders]);

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
        {statCards.map((item) => (
          <StatCard
            key={item.key}
            label={item.label}
            value={isLoading
              ? "..."
              : item.isCurrency
                ? formatCurrency(stats[item.key], currency, lang)
                : stats[item.key]}
            icon={item.icon}
            accent={item.accent}
            iconWrap={item.iconWrap}
          />
        ))}
      </section>

      <section className="rounded-[28px] border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/20 p-5 shadow-1 sm:p-6">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-pill border border-brand/20 bg-brand-soft/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
            {text.analyticsTitle}
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-text-primary">{text.analyticsTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-text-secondary">{text.analyticsDescription}</p>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <ChartPanel title={text.serviceMix} description={text.serviceMixDescription} icon={BarChart3}>
            {isLoading ? (
              <div className="h-56 animate-pulse rounded-2xl bg-linear-to-r from-bg-subtle via-brand-soft/35 to-bg-surface" />
            ) : stats.publishedServices > 0 || stats.draftServices > 0 ? (
              <ServiceMixChart
                publishedServices={stats.publishedServices}
                draftServices={stats.draftServices}
                text={text}
              />
            ) : (
              <EmptyChartState message={text.noChartData} />
            )}
          </ChartPanel>

          <ChartPanel title={text.serviceUpdates} description={text.serviceUpdatesDescription} icon={Activity}>
            {isLoading ? (
              <div className="h-56 animate-pulse rounded-2xl bg-linear-to-r from-bg-subtle via-brand-soft/35 to-bg-surface" />
            ) : serviceUpdateData.some((item) => item.count > 0) ? (
              <ServiceUpdatesChart data={serviceUpdateData} text={text} lang={lang} />
            ) : (
              <EmptyChartState message={text.noChartData} />
            )}
          </ChartPanel>

          <ChartPanel title={text.orderBreakdown} description={text.orderBreakdownDescription} icon={ShoppingBag}>
            {isLoading ? (
              <div className="h-56 animate-pulse rounded-2xl bg-linear-to-r from-bg-subtle via-brand-soft/35 to-bg-surface" />
            ) : orderStatusData.length > 0 && stats.totalOrders > 0 ? (
              <OrderStatusChart data={orderStatusData} totalOrders={stats.totalOrders} />
            ) : (
              <EmptyChartState message={text.noChartData} />
            )}
          </ChartPanel>
        </div>
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
