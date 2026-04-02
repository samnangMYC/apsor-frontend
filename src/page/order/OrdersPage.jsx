import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  ReceiptText,
  Search,
  XCircle,
} from "lucide-react";
import Breadcrumb from "../../components/shared/Breadcrumb";
import { useOrdersData } from "../../hooks/useOrdersData";
import { useLang } from "../../i18n/useLang";

const UI_TEXT = {
  en: {
    title: "My Orders",
    subtitle: "Track current and past bookings.",
    totalOrders: "Total orders",
    totalSpent: "Total spent",
    latestOrder: "Latest order",
    pending: "Pending",
    confirmed: "Confirmed",
    inProgress: "In progress",
    completed: "Completed",
    canceled: "Canceled",
    noOrders: "No orders found for this status.",
    loading: "Loading your orders...",
    loadError: "We couldn't refresh all order data, so some items may be showing from saved local data.",
    searchPlaceholder: "Search by order ID or service",
    orderId: "Order ID",
    amount: "Amount",
    viewDetails: "View details",
    pendingHint: "Waiting for provider confirmation.",
    confirmedHint: "Provider has confirmed the booking.",
    inProgressHint: "Service is currently in progress.",
    completedHint: "Service has been completed.",
    canceledHint: "This order was canceled.",
  },
  km: {
    title: "ការបញ្ជាទិញរបស់ខ្ញុំ",
    subtitle: "តាមដានការកក់បច្ចុប្បន្ន និងកន្លងមក។",
    totalOrders: "ការបញ្ជាទិញសរុប",
    totalSpent: "ចំណាយសរុប",
    latestOrder: "ការបញ្ជាទិញចុងក្រោយ",
    pending: "កំពុងរង់ចាំ",
    confirmed: "បានបញ្ជាក់",
    inProgress: "កំពុងដំណើរការ",
    completed: "បានបញ្ចប់",
    canceled: "បានបោះបង់",
    noOrders: "មិនមានការបញ្ជាទិញសម្រាប់ស្ថានភាពនេះទេ។",
    loading: "កំពុងផ្ទុកការបញ្ជាទិញរបស់អ្នក...",
    loadError: "មិនអាចផ្ទុកទិន្នន័យការបញ្ជាទិញទាំងអស់ឡើងវិញបានទេ ដូច្នេះអាចមានទិន្នន័យខ្លះបង្ហាញពី local data។",
    searchPlaceholder: "ស្វែងរកតាមលេខបញ្ជាទិញ ឬ សេវាកម្ម",
    orderId: "លេខបញ្ជាទិញ",
    amount: "តម្លៃ",
    viewDetails: "មើលព័ត៌មានលម្អិត",
    pendingHint: "កំពុងរង់ចាំការបញ្ជាក់ពីអ្នកផ្តល់សេវា។",
    confirmedHint: "អ្នកផ្តល់សេវាបានបញ្ជាក់ការកក់នេះ។",
    inProgressHint: "សេវាកម្មនេះកំពុងដំណើរការ។",
    completedHint: "សេវាកម្មនេះបានបញ្ចប់រួចរាល់។",
    canceledHint: "ការបញ្ជាទិញនេះត្រូវបានបោះបង់។",
  },
};

function formatMoney(amount, currency) {
  const safeAmount = Number(amount);
  if (!Number.isFinite(safeAmount)) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: String(currency || "USD").toUpperCase(),
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

function formatOrderDate(value, lang) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat(lang === "km" ? "km-KH" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusMeta(status, text) {
  const safeStatus = String(status || "").toUpperCase();
  if (safeStatus === "COMPLETED") {
    return {
      label: text.completed,
      className: "border-success/35 bg-success/10 text-success",
      hint: text.completedHint,
      icon: CheckCircle2,
    };
  }
  if (safeStatus === "CANCELED") {
    return {
      label: text.canceled,
      className: "border-danger/35 bg-danger/10 text-danger",
      hint: text.canceledHint,
      icon: XCircle,
    };
  }
  if (safeStatus === "IN_PROGRESS") {
    return {
      label: text.inProgress,
      className: "border-info/35 bg-info/10 text-info",
      hint: text.inProgressHint,
      icon: Clock3,
    };
  }
  if (safeStatus === "CONFIRMED") {
    return {
      label: text.confirmed,
      className: "border-brand/35 bg-brand-soft/40 text-brand",
      hint: text.confirmedHint,
      icon: CheckCircle2,
    };
  }
  return {
    label: text.pending,
    className: "border-warning/35 bg-warning/10 text-warning",
    hint: text.pendingHint,
    icon: Clock3,
  };
}

function StatTile({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/20 p-4 shadow-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            {label}
          </p>
          <p className="mt-2 text-xl font-bold text-text-primary sm:text-2xl">
            {value}
          </p>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function OrderCardSkeleton() {
  return (
    <article className="rounded-2xl border border-border bg-bg-surface p-4 shadow-1">
      <div className="animate-pulse">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="h-6 w-24 rounded-pill bg-bg-subtle" />
            <div className="mt-3 h-5 w-2/3 rounded-md bg-bg-subtle" />
            <div className="mt-2 h-4 w-1/2 rounded-md bg-bg-subtle" />
          </div>
          <div className="h-5 w-24 rounded-md bg-bg-subtle" />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="h-4 w-full rounded-md bg-bg-subtle" />
          <div className="h-4 w-full rounded-md bg-bg-subtle" />
        </div>
        <div className="mt-4 h-9 w-28 rounded-lg bg-brand-soft/45" />
      </div>
    </article>
  );
}

export default function OrdersPage() {
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const { orders, isLoading, loadError } = useOrdersData();
  const [searchValue, setSearchValue] = useState("");

  const filteredOrders = useMemo(() => {
    const keyword = String(searchValue || "").trim().toLowerCase();
    return [...orders]
      .filter((item) => {
        if (!keyword) return true;
        return (
          String(item.id || "").toLowerCase().includes(keyword)
          || String(item.serviceName || "").toLowerCase().includes(keyword)
          || String(item.providerName || "").toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, searchValue]);

  const totalSpent = useMemo(
    () => filteredOrders.reduce((sum, item) => sum + Number(item?.amount || 0), 0),
    [filteredOrders],
  );
  const latestOrder = filteredOrders[0] || null;

  return (
    <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-10 xl:px-22 2xl:px-64">
      <Breadcrumb className="mb-4" currentLabel={text.title} />

      <section className="rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">{text.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">{text.subtitle}</p>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-3">
        <StatTile label={text.totalOrders} value={isLoading ? "..." : String(filteredOrders.length)} icon={ReceiptText} />
        <StatTile label={text.totalSpent} value={isLoading ? "..." : formatMoney(totalSpent, latestOrder?.currency || "USD")} icon={CheckCircle2} />
        <StatTile label={text.latestOrder} value={isLoading ? "..." : latestOrder?.id || "--"} icon={Clock3} />
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
        <label className="relative mb-4 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={text.searchPlaceholder}
            className="h-10 w-full rounded-lg border border-border bg-bg-surface px-9 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </label>

        {loadError ? (
          <div className="mb-4 rounded-xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm text-warning">
            {text.loadError}
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <OrderCardSkeleton key={`order-card-skeleton-${index}`} />
            ))}
          </div>
        ) : !filteredOrders.length ? (
          <div className="rounded-xl border border-dashed border-border bg-bg-subtle px-3 py-10 text-center text-sm text-text-muted">
            {text.noOrders}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const statusMeta = getStatusMeta(order.status, text);
              const StatusIcon = statusMeta.icon;

              return (
                <article key={order.id} className="rounded-2xl border border-border bg-bg-surface p-4 shadow-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex h-7 items-center gap-1.5 rounded-pill border px-2.5 text-[11px] font-semibold ${statusMeta.className}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusMeta.label}
                        </span>
                      </div>
                      <p className="mt-3 text-base font-semibold text-text-primary">{order.serviceName || "--"}</p>
                      <p className="mt-1 text-sm text-text-muted">{`${text.orderId}: ${order.id}`}</p>

                      <div className="mt-3 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
                        <div className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-brand" />
                          <span className="truncate">{order.location || "--"}</span>
                        </div>
                        <p className="truncate">{formatOrderDate(order.date, lang)}</p>
                        <p className="truncate">{order.providerName || "--"}</p>
                        <p className="truncate">{statusMeta.hint}</p>
                      </div>
                    </div>

                    <p className="text-base font-semibold text-text-primary">
                      {formatMoney(order.amount, order.currency)}
                    </p>
                  </div>

                  <div className="mt-3">
                    <Link
                      to={`/orders/${encodeURIComponent(order.id)}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3 text-sm font-semibold text-white transition hover:bg-brand-hover"
                    >
                      {text.viewDetails}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
