import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  WalletCards,
  XCircle,
} from "lucide-react";
import Breadcrumb from "../../components/shared/Breadcrumb";
import { useOrders } from "../../hooks/useOrders";
import { useLang } from "../../i18n/useLang";

const UI_TEXT = {
  en: {
    title: "Order Detail",
    subtitle: "Review full order information.",
    orderNotFound: "Order not found.",
    orderNotFoundHint: "The order may have been removed or the link is invalid.",
    backOrders: "Back to orders",
    viewService: "View service",
    orderId: "Order ID",
    status: "Status",
    date: "Date",
    amount: "Amount",
    location: "Location",
    service: "Service",
    provider: "Provider",
    paymentMethod: "Payment method",
    paymentStatus: "Payment status",
    paid: "Paid",
    payLater: "Pay later",
    items: "Items",
    notes: "Notes",
    paymentSuccess: "Payment submitted successfully. The booking now appears in your orders.",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    pendingHint: "Waiting for provider confirmation.",
    completedHint: "Service has been completed.",
    cancelledHint: "This order was cancelled.",
  },
  km: {
    title: "ព័ត៌មានលម្អិតការបញ្ជាទិញ",
    subtitle: "ពិនិត្យព័ត៌មានពេញលេញរបស់ការបញ្ជាទិញ។",
    orderNotFound: "រកមិនឃើញការបញ្ជាទិញទេ។",
    orderNotFoundHint: "ការបញ្ជាទិញនេះអាចត្រូវបានលុប ឬ តំណភ្ជាប់មិនត្រឹមត្រូវ។",
    backOrders: "ត្រឡប់ទៅការបញ្ជាទិញ",
    viewService: "មើលសេវាកម្ម",
    orderId: "លេខបញ្ជាទិញ",
    status: "ស្ថានភាព",
    date: "កាលបរិច្ឆេទ",
    amount: "តម្លៃ",
    location: "ទីតាំង",
    service: "សេវាកម្ម",
    provider: "អ្នកផ្តល់សេវា",
    paymentMethod: "វិធីបង់ប្រាក់",
    paymentStatus: "ស្ថានភាពការបង់ប្រាក់",
    paid: "បានបង់",
    payLater: "បង់ពេលក្រោយ",
    items: "ធាតុ",
    notes: "កំណត់ចំណាំ",
    paymentSuccess: "ការបង់ប្រាក់ត្រូវបានបញ្ជូនដោយជោគជ័យ ហើយការកក់បានបង្ហាញក្នុងការបញ្ជាទិញរបស់អ្នក។",
    pending: "កំពុងរង់ចាំ",
    completed: "បានបញ្ចប់",
    cancelled: "បានបោះបង់",
    pendingHint: "កំពុងរង់ចាំការបញ្ជាក់ពីអ្នកផ្តល់សេវា។",
    completedHint: "សេវាកម្មនេះបានបញ្ចប់រួចរាល់។",
    cancelledHint: "ការបញ្ជាទិញនេះត្រូវបានបោះបង់។",
  },
};

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
      hint: text.completedHint,
      icon: CheckCircle2,
    };
  }
  if (safeStatus === "CANCELLED") {
    return {
      label: text.cancelled,
      className: "border-danger/35 bg-danger/10 text-danger",
      hint: text.cancelledHint,
      icon: XCircle,
    };
  }
  return {
    label: text.pending,
    className: "border-warning/35 bg-warning/10 text-warning",
    hint: text.pendingHint,
    icon: Clock3,
  };
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const orders = useOrders();
  const order = useMemo(
    () => orders.find((item) => item.id.toUpperCase() === String(orderId || "").trim().toUpperCase()) || null,
    [orderId, orders],
  );

  if (!order) {
    return (
      <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
        <Breadcrumb className="mb-4" currentLabel={text.title} />
        <section className="rounded-2xl border border-border bg-bg-surface p-5 text-center shadow-1">
          <p className="text-lg font-semibold text-text-primary">{text.orderNotFound}</p>
          <p className="mt-1 text-sm text-text-muted">{text.orderNotFoundHint}</p>
          <Link
            to="/orders"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-bg-subtle px-4 text-sm font-semibold text-text-secondary transition hover:border-brand/45 hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" />
            {text.backOrders}
          </Link>
        </section>
      </main>
    );
  }

  const statusMeta = getStatusMeta(order.status, text);
  const StatusIcon = statusMeta.icon;
  const orderItems = Array.isArray(order.items) ? order.items : [];
  const totalItemCount = orderItems.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  const paymentLabel = order.paymentStatus === "PAY_LATER" ? text.payLater : text.paid;

  return (
    <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
      <Breadcrumb className="mb-4" currentLabel={text.title} />

      {location.state?.fromPayment ? (
        <section className="mb-4 rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success shadow-1">
          {text.paymentSuccess}
        </section>
      ) : null}

      <section className="rounded-2xl border border-border bg-linear-to-r from-bg-surface via-bg-surface to-brand-soft/20 p-4 shadow-1 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">{text.orderId}</p>
            <h1 className="mt-0.5 text-xl font-bold text-text-primary sm:text-2xl">{order.id}</h1>
            <p className="mt-1 text-sm text-text-secondary">{text.subtitle}</p>
          </div>
          <span className={`inline-flex h-8 items-center gap-1.5 rounded-pill border px-3 text-xs font-semibold ${statusMeta.className}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {statusMeta.label}
          </span>
        </div>
        <p className="mt-2 text-xs text-text-muted">{statusMeta.hint}</p>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
        <div className="grid grid-cols-1 gap-2 text-xs text-text-secondary sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-bg-subtle/45 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.date}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-text-primary">
              <CalendarDays className="h-3.5 w-3.5 text-brand" />
              {formatDateTime(order.date, lang)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-bg-subtle/45 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.amount}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-text-primary">
              <WalletCards className="h-3.5 w-3.5 text-brand" />
              {formatMoney(order.amount, order.currency)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-bg-subtle/45 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.location}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-text-primary">
              <MapPin className="h-3.5 w-3.5 text-brand" />
              {order.location || "--"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-bg-subtle/45 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.paymentMethod}</p>
            <p className="mt-1 text-text-primary">{order.paymentMethod || "--"}</p>
          </div>
          <div className="rounded-lg border border-border bg-bg-subtle/45 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.paymentStatus}</p>
            <p className={`mt-1 font-semibold ${order.paymentStatus === "PAY_LATER" ? "text-warning" : "text-success"}`}>
              {paymentLabel}
            </p>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-text-secondary sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-bg-subtle/45 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.service}</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">{order.serviceName || "--"}</p>
          </div>
          <div className="rounded-lg border border-border bg-bg-subtle/45 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.provider}</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">{order.providerName || "--"}</p>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-border bg-bg-subtle/45 px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-text-primary">{text.items}</p>
            <span className="text-[11px] text-text-muted">{totalItemCount}</span>
          </div>
          {orderItems.length ? (
            <div className="space-y-2">
              {orderItems.map((item, index) => (
                <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-2 rounded-md border border-border bg-bg-surface px-2.5 py-2">
                  <p className="text-xs text-text-primary">{item.name}</p>
                  <p className="text-xs font-semibold text-text-secondary">
                    {`${item.qty} x ${formatMoney(item.unitPrice, order.currency)}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">--</p>
          )}
        </div>

        <div className="mt-2 rounded-lg border border-border bg-bg-subtle/45 px-2.5 py-2 text-xs text-text-secondary">
          <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.notes}</p>
          <p className="mt-1 text-text-primary">{order.notes || "--"}</p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link
            to="/orders"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-bg-surface px-3 text-xs font-semibold text-text-secondary transition hover:border-brand/45 hover:text-brand"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {text.backOrders}
          </Link>
          <Link
            to={order.servicePath || "/services"}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-bg-surface px-3 text-xs font-semibold text-text-secondary transition hover:border-brand/45 hover:text-brand"
          >
            {text.viewService}
          </Link>
        </div>
      </section>
    </main>
  );
}
