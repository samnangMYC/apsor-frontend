import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Search,
  SlidersHorizontal,
  MapPin,
  ShoppingBag,
  WalletCards,
  XCircle,
} from "lucide-react";
import Breadcrumb from "../components/shared/Breadcrumb";
import { DEFAULT_ORDERS } from "../data/defaultOrders";
import { useLang } from "../i18n/useLang";

const UI_TEXT = {
  en: {
    title: "My Orders",
    subtitle: "Track current and past bookings.",
    totalOrders: "Total orders",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    all: "All",
    noOrders: "No orders found for this status.",
    searchPlaceholder: "Search by order ID, service, or location",
    sortLabel: "Sort",
    sortNewest: "Newest first",
    sortOldest: "Oldest first",
    sortAmountHigh: "Amount high to low",
    sortAmountLow: "Amount low to high",
    showingResults: "Showing",
    of: "of",
    resetFilters: "Reset filters",
    visibleTotal: "Visible order value",
    service: "Service",
    status: "Status",
    orderId: "Order ID",
    date: "Date",
    amount: "Amount",
    location: "Location",
    viewDetails: "View details",
    viewService: "View service",
    pendingHint: "Waiting for provider confirmation.",
    completedHint: "Service has been completed.",
    cancelledHint: "This order was cancelled.",
  },
  km: {
    title: "ការបញ្ជាទិញរបស់ខ្ញុំ",
    subtitle: "តាមដានការកក់បច្ចុប្បន្ន និងកន្លងមក។",
    totalOrders: "ការបញ្ជាទិញសរុប",
    pending: "កំពុងរង់ចាំ",
    completed: "បានបញ្ចប់",
    cancelled: "បានបោះបង់",
    all: "ទាំងអស់",
    noOrders: "មិនមានការបញ្ជាទិញសម្រាប់ស្ថានភាពនេះទេ។",
    searchPlaceholder: "ស្វែងរកតាមលេខបញ្ជាទិញ សេវាកម្ម ឬ ទីតាំង",
    sortLabel: "តម្រៀប",
    sortNewest: "ថ្មីទៅចាស់",
    sortOldest: "ចាស់ទៅថ្មី",
    sortAmountHigh: "តម្លៃខ្ពស់ទៅទាប",
    sortAmountLow: "តម្លៃទាបទៅខ្ពស់",
    showingResults: "បង្ហាញ",
    of: "នៃ",
    resetFilters: "កំណត់តម្រងឡើងវិញ",
    visibleTotal: "តម្លៃបញ្ជាទិញដែលកំពុងបង្ហាញ",
    service: "សេវាកម្ម",
    status: "ស្ថានភាព",
    orderId: "លេខបញ្ជាទិញ",
    date: "កាលបរិច្ឆេទ",
    amount: "តម្លៃ",
    location: "ទីតាំង",
    viewDetails: "មើលព័ត៌មានលម្អិត",
    viewService: "មើលសេវាកម្ម",
    pendingHint: "កំពុងរង់ចាំការបញ្ជាក់ពីអ្នកផ្តល់សេវា។",
    completedHint: "សេវាកម្មនេះបានបញ្ចប់រួចរាល់។",
    cancelledHint: "ការបញ្ជាទិញនេះត្រូវបានបោះបង់។",
  },
};

const STATUS_LIST = Object.freeze(["ALL", "PENDING", "COMPLETED", "CANCELLED"]);
const SORT_OPTIONS = Object.freeze(["NEWEST", "OLDEST", "AMOUNT_DESC", "AMOUNT_ASC"]);

function formatDateTime(value, lang) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat(lang === "km" ? "km-KH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatMoney(amount, currency) {
  const safeAmount = Number(amount);
  if (!Number.isFinite(safeAmount)) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: String(currency || "USD").toUpperCase(),
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

function getStatusMeta(status, text) {
  const safeStatus = String(status || "").toUpperCase();
  if (safeStatus === "COMPLETED") {
    return {
      label: text.completed,
      className: "border-success/35 bg-success/10 text-success",
      cardClassName: "border-success/30",
      hint: text.completedHint,
      icon: CheckCircle2,
    };
  }
  if (safeStatus === "CANCELLED") {
    return {
      label: text.cancelled,
      className: "border-danger/35 bg-danger/10 text-danger",
      cardClassName: "border-danger/30",
      hint: text.cancelledHint,
      icon: XCircle,
    };
  }
  return {
    label: text.pending,
    className: "border-warning/35 bg-warning/10 text-warning",
    cardClassName: "border-warning/30",
    hint: text.pendingHint,
    icon: Clock3,
  };
}

export default function OrdersPage() {
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState("NEWEST");

  const filteredOrders = useMemo(() => {
    const keyword = String(searchValue || "").trim().toLowerCase();
    const baseOrders = DEFAULT_ORDERS.filter((item) => (statusFilter === "ALL" ? true : item.status === statusFilter))
      .filter((item) => {
        if (!keyword) return true;
        return (
          String(item.id || "").toLowerCase().includes(keyword)
          || String(item.serviceName || "").toLowerCase().includes(keyword)
          || String(item.location || "").toLowerCase().includes(keyword)
        );
      });

    const sorted = [...baseOrders];
    if (sortBy === "OLDEST") {
      sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === "AMOUNT_DESC") {
      sorted.sort((a, b) => Number(b.amount) - Number(a.amount));
    } else if (sortBy === "AMOUNT_ASC") {
      sorted.sort((a, b) => Number(a.amount) - Number(b.amount));
    } else {
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return sorted;
  }, [searchValue, sortBy, statusFilter]);

  const counts = useMemo(() => {
    const pending = DEFAULT_ORDERS.filter((item) => item.status === "PENDING").length;
    const completed = DEFAULT_ORDERS.filter((item) => item.status === "COMPLETED").length;
    const cancelled = DEFAULT_ORDERS.filter((item) => item.status === "CANCELLED").length;
    return { pending, completed, cancelled, total: DEFAULT_ORDERS.length };
  }, []);
  const visibleTotalAmount = useMemo(
    () => filteredOrders.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [filteredOrders],
  );
  const hasActiveFilters = statusFilter !== "ALL" || Boolean(String(searchValue || "").trim()) || sortBy !== "NEWEST";

  const getSortLabel = (option) => {
    if (option === "OLDEST") return text.sortOldest;
    if (option === "AMOUNT_DESC") return text.sortAmountHigh;
    if (option === "AMOUNT_ASC") return text.sortAmountLow;
    return text.sortNewest;
  };
  const getStatusCount = (status) => {
    if (status === "PENDING") return counts.pending;
    if (status === "COMPLETED") return counts.completed;
    if (status === "CANCELLED") return counts.cancelled;
    return counts.total;
  };

  const handleResetFilters = () => {
    setStatusFilter("ALL");
    setSearchValue("");
    setSortBy("NEWEST");
  };

  return (
    <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
      <Breadcrumb className="mb-4" currentLabel={text.title} />

      <section className="rounded-2xl border border-border bg-linear-to-r from-bg-surface via-bg-surface to-brand-soft/20 p-4 shadow-1 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text-primary sm:text-2xl">{text.title}</h1>
            <p className="mt-1 text-sm text-text-secondary">{text.subtitle}</p>
          </div>
          <span className="inline-flex h-10 items-center gap-2 rounded-pill border border-border bg-bg-surface px-3 text-sm font-semibold text-text-secondary">
            <ShoppingBag className="h-4 w-4 text-brand" />
            {counts.total}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-bg-subtle px-3 py-2.5">
            <p className="text-[11px] text-text-muted">{text.totalOrders}</p>
            <p className="mt-0.5 text-base font-bold text-text-primary">{counts.total}</p>
          </div>
          <div className="rounded-lg border border-border bg-bg-subtle px-3 py-2.5">
            <p className="text-[11px] text-text-muted">{text.pending}</p>
            <p className="mt-0.5 text-base font-bold text-warning">{counts.pending}</p>
          </div>
          <div className="rounded-lg border border-border bg-bg-subtle px-3 py-2.5">
            <p className="text-[11px] text-text-muted">{text.completed}</p>
            <p className="mt-0.5 text-base font-bold text-success">{counts.completed}</p>
          </div>
          <div className="rounded-lg border border-border bg-bg-subtle px-3 py-2.5">
            <p className="text-[11px] text-text-muted">{text.cancelled}</p>
            <p className="mt-0.5 text-base font-bold text-danger">{counts.cancelled}</p>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
        <div className="mb-3 rounded-xl border border-border bg-bg-subtle/45 p-2.5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <label className="relative block flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={text.searchPlaceholder}
                className="h-10 w-full rounded-lg border border-border bg-bg-surface px-9 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:w-[420px]">
              <label className="relative block">
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  aria-label={text.sortLabel}
                  className="h-10 w-full rounded-lg border border-border bg-bg-surface pl-9 pr-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {getSortLabel(option)}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={handleResetFilters}
                disabled={!hasActiveFilters}
                className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-bg-surface px-3 text-sm font-semibold text-text-secondary transition hover:border-brand/45 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="whitespace-nowrap">{text.resetFilters}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-3 -mx-1 overflow-x-auto px-1 pb-1">
          <div className="inline-flex min-w-full gap-2 sm:min-w-0">
            {STATUS_LIST.map((status) => {
              const active = statusFilter === status;
              const label = status === "ALL"
                ? text.all
                : status === "PENDING"
                  ? text.pending
                  : status === "COMPLETED"
                    ? text.completed
                    : text.cancelled;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill border px-3 text-xs font-semibold transition ${
                    active
                      ? "border-brand/60 bg-brand-soft/55 text-brand"
                      : "border-border bg-bg-subtle text-text-secondary hover:border-brand/35"
                  }`}
                >
                  {label}
                  <span
                    className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                      active ? "bg-brand text-white" : "bg-bg-surface text-text-muted"
                    }`}
                  >
                    {getStatusCount(status)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {!filteredOrders.length ? (
          <div className="rounded-xl border border-dashed border-border bg-bg-subtle px-3 py-10 text-center text-sm text-text-muted">
            {text.noOrders}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-bg-subtle px-3 py-2">
              <p className="text-xs text-text-secondary">
                {`${text.showingResults} ${filteredOrders.length} ${text.of} ${DEFAULT_ORDERS.length}`}
              </p>
              <p className="text-xs font-semibold text-text-primary">
                {`${text.visibleTotal}: ${formatMoney(visibleTotalAmount, "USD")}`}
              </p>
            </div>

            {filteredOrders.map((order) => {
              const statusMeta = getStatusMeta(order.status, text);
              const StatusIcon = statusMeta.icon;

              return (
                <article key={order.id} className={`rounded-2xl border bg-bg-surface p-3 shadow-1 sm:p-4 ${statusMeta.cardClassName}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="inline-flex h-6 items-center gap-1 rounded-pill border border-border bg-bg-subtle px-2 text-[11px] font-semibold text-text-muted">
                        <ShoppingBag className="h-3.5 w-3.5 text-brand" />
                        {`${text.orderId}: ${order.id}`}
                      </p>
                      <p className="mt-2 truncate text-base font-semibold text-text-primary">{order.serviceName}</p>
                      <p className="mt-1 text-xs text-text-secondary">{statusMeta.hint}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.amount}</p>
                      <p className="mt-0.5 inline-flex items-center justify-end gap-1 text-lg font-bold text-text-primary">
                        <WalletCards className="h-4 w-4 text-brand" />
                        {formatMoney(order.amount, order.currency)}
                      </p>
                      <span className={`mt-1 inline-flex h-7 items-center gap-1 rounded-pill border px-2.5 text-[11px] font-semibold ${statusMeta.className}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-text-secondary sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-bg-surface px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.date}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-text-primary">
                        <CalendarDays className="h-3.5 w-3.5 text-brand" />
                        {formatDateTime(order.date, lang)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-bg-surface px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.location}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-text-primary">
                        <MapPin className="h-3.5 w-3.5 text-brand" />
                        {order.location}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <Link
                      to={`/orders/${encodeURIComponent(order.id)}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand px-3 text-xs font-semibold text-white transition hover:bg-brand-hover"
                    >
                      {text.viewDetails}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      to={order.servicePath || "/services"}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-bg-subtle px-3 text-xs font-semibold text-text-secondary transition hover:border-brand/45 hover:text-brand"
                    >
                      {text.viewService}
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
