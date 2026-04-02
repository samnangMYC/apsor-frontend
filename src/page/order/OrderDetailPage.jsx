import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  UserRound,
  Wallet,
  XCircle,
} from "lucide-react";
import Breadcrumb from "../../components/shared/Breadcrumb";
import { useOrdersData } from "../../hooks/useOrdersData";
import { useLang } from "../../i18n/useLang";
import { findOrderByKey } from "../../utils/orders";

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
    customer: "Customer",
    contact: "Contact",
    summary: "Summary",
    pricing: "Pricing",
    subtotal: "Subtotal",
    discount: "Discount",
    unitPrice: "Unit price",
    email: "Email",
    phone: "Phone",
    paymentSuccess: "Payment submitted successfully. The booking now appears in your orders.",
    loading: "Loading order details...",
    loadError: "We couldn't refresh all order data, so this page may be showing saved local data.",
    pending: "Pending",
    confirmed: "Confirmed",
    inProgress: "In progress",
    completed: "Completed",
    canceled: "Canceled",
    pendingHint: "Waiting for provider confirmation.",
    confirmedHint: "Provider has confirmed the booking.",
    inProgressHint: "Service is currently in progress.",
    completedHint: "Service has been completed.",
    canceledHint: "This order was canceled.",
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
    customer: "អតិថិជន",
    contact: "ទំនាក់ទំនង",
    summary: "សេចក្តីសង្ខេប",
    pricing: "តម្លៃ",
    subtotal: "តម្លៃមុនបញ្ចុះ",
    discount: "បញ្ចុះតម្លៃ",
    unitPrice: "តម្លៃក្នុងមួយឯកតា",
    email: "អ៊ីមែល",
    phone: "ទូរស័ព្ទ",
    paymentSuccess: "ការបង់ប្រាក់ត្រូវបានបញ្ជូនដោយជោគជ័យ ហើយការកក់បានបង្ហាញក្នុងការបញ្ជាទិញរបស់អ្នក។",
    loading: "កំពុងផ្ទុកព័ត៌មានការបញ្ជាទិញ...",
    loadError: "មិនអាចផ្ទុកទិន្នន័យការបញ្ជាទិញទាំងអស់ឡើងវិញបានទេ ដូច្នេះទំព័រនេះអាចកំពុងបង្ហាញ local data។",
    pending: "កំពុងរង់ចាំ",
    confirmed: "បានបញ្ជាក់",
    inProgress: "កំពុងដំណើរការ",
    completed: "បានបញ្ចប់",
    canceled: "បានបោះបង់",
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
    dateStyle: "full",
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

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-bg-subtle/35 px-4 py-3">
      {Icon ? (
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Icon className="h-4 w-4" />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-text-primary">{value || "--"}</p>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const { orders, isLoading, loadError } = useOrdersData();
  const normalizedOrderId = String(orderId || "").trim().toUpperCase();

  const order = useMemo(
    () => findOrderByKey(orders, normalizedOrderId),
    [normalizedOrderId, orders],
  );

  if (isLoading && !order) {
    return (
      <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
        <Breadcrumb className="mb-4" currentLabel={text.title} />
        <section className="rounded-2xl border border-border bg-bg-surface p-5 text-center shadow-1">
          <p className="text-lg font-semibold text-text-primary">{text.loading}</p>
        </section>
      </main>
    );
  }

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

  return (
    <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
      <Breadcrumb className="mb-4" currentLabel={text.title} />

      {location.state?.fromPayment ? (
        <section className="mb-4 rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success shadow-1">
          {text.paymentSuccess}
        </section>
      ) : null}

      {loadError ? (
        <section className="mb-4 rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm text-warning shadow-1">
          {text.loadError}
        </section>
      ) : null}

      <section className="rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">{text.orderId}</p>
            <h1 className="mt-0.5 text-xl font-bold text-text-primary sm:text-2xl">{order.id}</h1>
            <p className="mt-1 text-sm font-medium text-text-primary">{order.serviceName || "--"}</p>
          </div>
          <span className={`inline-flex h-8 items-center gap-1.5 rounded-pill border px-3 text-xs font-semibold ${statusMeta.className}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {statusMeta.label}
          </span>
        </div>
        <p className="mt-2 text-xs text-text-muted">{statusMeta.hint}</p>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_22rem]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-bold text-text-primary">{text.summary}</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label={text.orderId} value={order.id} icon={ReceiptText} />
              <DetailRow label={text.date} value={formatOrderDate(order.date, lang)} icon={Clock3} />
              <DetailRow label={text.amount} value={formatMoney(order.amount, order.currency)} icon={Wallet} />
              <DetailRow label={text.location} value={order.location} icon={MapPin} />
              <DetailRow label={text.provider} value={order.providerName} icon={UserRound} />
              <DetailRow label={text.paymentMethod} value={order.paymentMethod} icon={Wallet} />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-bold text-text-primary">{text.pricing}</h2>
            </div>

            <div className="space-y-3">
              {(Array.isArray(order.items) ? order.items : []).map((item, index) => (
                <div
                  key={item?.id || `${item?.name || "order-item"}-${index}`}
                  className="rounded-xl border border-border bg-bg-subtle/30 px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-text-primary">{item?.name || "--"}</p>
                      <p className="mt-1 text-xs text-text-muted">{`${text.unitPrice}: ${formatMoney(item?.unitPrice, order.currency)}`}</p>
                    </div>
                    <p className="text-sm font-semibold text-text-primary">{`x${Number(item?.qty || 1)}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {order.notes ? (
            <section className="rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
              <h2 className="text-lg font-bold text-text-primary">{text.notes}</h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">{order.notes}</p>
            </section>
          ) : null}
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
            <h2 className="text-lg font-bold text-text-primary">{text.contact}</h2>
            <div className="mt-4 space-y-3">
              <DetailRow label={text.customer} value={order.customerName || "--"} icon={UserRound} />
              <DetailRow label={text.email} value={order.email || "--"} icon={Mail} />
              <DetailRow label={text.phone} value={order.phone || "--"} icon={Phone} />
              <DetailRow label={text.paymentStatus} value={order.paymentStatus || "--"} icon={Wallet} />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-text-secondary">{text.subtotal}</span>
                <span className="font-semibold text-text-primary">{formatMoney(order.subtotal ?? order.amount, order.currency)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-text-secondary">{text.discount}</span>
                <span className="font-semibold text-text-primary">
                  {Number(order.discount || 0) > 0 ? `-${formatMoney(order.discount, order.currency)}` : formatMoney(0, order.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                <span className="font-semibold text-text-primary">{text.amount}</span>
                <span className="text-lg font-bold text-brand">{formatMoney(order.amount, order.currency)}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <Link
                to="/orders"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-bg-surface px-4 text-sm font-semibold text-text-secondary transition hover:border-brand/45 hover:text-brand"
              >
                <ArrowLeft className="h-4 w-4" />
                {text.backOrders}
              </Link>
              <Link
                to={order.servicePath || "/services"}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover"
              >
                {text.viewService}
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
