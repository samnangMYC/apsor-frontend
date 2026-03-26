import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, XCircle } from "lucide-react";
import Breadcrumb from "../../components/shared/Breadcrumb";
import { fetchMyOrders } from "../../api";
import { useOrders } from "../../hooks/useOrders";
import { useLang } from "../../i18n/useLang";
import { mapApiOrder } from "../../utils/orders";

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
    loading: "Loading order details...",
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
    paymentSuccess: "ការបង់ប្រាក់ត្រូវបានបញ្ជូនដោយជោគជ័យ ហើយការកក់បានបង្ហាញក្នុងការបញ្ជាទិញរបស់អ្នក។",
    loading: "កំពុងផ្ទុកព័ត៌មានការបញ្ជាទិញ...",
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

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const orders = useOrders();
  const normalizedOrderId = String(orderId || "").trim().toUpperCase();
  const [remoteOrder, setRemoteOrder] = useState(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadOrder = async () => {
      setIsLoadingOrder(true);

      try {
        const remoteOrders = await fetchMyOrders();
        if (!isMounted) {
          return;
        }

        const matchedOrder = (Array.isArray(remoteOrders) ? remoteOrders : [])
          .map(mapApiOrder)
          .find((item) => {
            const uiId = String(item?.id || "").trim().toUpperCase();
            const backendId = String(item?.backendId || "").trim().toUpperCase();
            return uiId === normalizedOrderId || backendId === normalizedOrderId;
          }) || null;

        setRemoteOrder(matchedOrder);
      } catch (error) {
        console.error("Failed to load order detail:", error);
        if (isMounted) {
          setRemoteOrder(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingOrder(false);
        }
      }
    };

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [normalizedOrderId]);

  const order = useMemo(
    () =>
      remoteOrder
      || orders.find((item) => {
        const uiId = String(item?.id || "").trim().toUpperCase();
        const backendId = String(item?.backendId || "").trim().toUpperCase();
        return uiId === normalizedOrderId || backendId === normalizedOrderId;
      })
      || null,
    [normalizedOrderId, orders, remoteOrder],
  );

  if (isLoadingOrder && !order) {
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

      <section className="mt-4 rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-text-secondary">{text.amount}</p>
          <p className="text-xl font-semibold text-text-primary">
            {formatMoney(order.amount, order.currency)}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
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
