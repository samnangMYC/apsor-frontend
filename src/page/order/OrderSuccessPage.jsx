import { useEffect, useMemo } from "react";
import { ArrowRight, CheckCircle2, ReceiptText, ShoppingBag } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import Breadcrumb from "../../components/shared/Breadcrumb";
import { useOrders } from "../../hooks/useOrders";
import { useLang } from "../../i18n/useLang";
import { getOrderById } from "../../utils/orders";

const UI_TEXT = {
  en: {
    title: "Order Success",
    badge: "Order created",
    heading: "Your order was created successfully",
    subtitle: "We saved your booking and added it to My Orders.",
    orderId: "Order ID",
    amount: "Amount",
    paymentMethod: "Payment method",
    paymentStatus: "Payment status",
    service: "Service",
    provider: "Provider",
    location: "Location",
    viewOrder: "View order details",
    viewOrders: "Go to my orders",
    continueBrowsing: "Continue browsing",
    orderNotFound: "Order information not found.",
    orderNotFoundHint: "The success page needs a valid order to display.",
    paid: "Paid",
    payLater: "Pay later",
    card: "Card",
    khqr: "ABA KHQR",
    cash: "Cash on service",
  },
  km: {
    title: "ការបញ្ជាទិញជោគជ័យ",
    badge: "បានបង្កើតការបញ្ជាទិញ",
    heading: "ការបញ្ជាទិញរបស់អ្នកត្រូវបានបង្កើតដោយជោគជ័យ",
    subtitle: "យើងបានរក្សាទុកការកក់នេះ ហើយបន្ថែមវាទៅក្នុងការបញ្ជាទិញរបស់អ្នក។",
    orderId: "លេខបញ្ជាទិញ",
    amount: "តម្លៃ",
    paymentMethod: "វិធីបង់ប្រាក់",
    paymentStatus: "ស្ថានភាពការបង់ប្រាក់",
    service: "សេវាកម្ម",
    provider: "អ្នកផ្តល់សេវា",
    location: "ទីតាំង",
    viewOrder: "មើលព័ត៌មានលម្អិតការបញ្ជាទិញ",
    viewOrders: "ទៅកាន់ការបញ្ជាទិញរបស់ខ្ញុំ",
    continueBrowsing: "បន្តស្វែងរកសេវា",
    orderNotFound: "រកមិនឃើញព័ត៌មានការបញ្ជាទិញទេ។",
    orderNotFoundHint: "ទំព័រជោគជ័យនេះត្រូវការការបញ្ជាទិញត្រឹមត្រូវសម្រាប់បង្ហាញ។",
    paid: "បានបង់",
    payLater: "បង់ពេលក្រោយ",
    card: "កាត",
    khqr: "ABA KHQR",
    cash: "បង់ពេលទទួលសេវា",
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

function getPaymentMethodLabel(method, text) {
  const normalizedMethod = String(method || "").trim().toUpperCase();
  if (normalizedMethod === "KHQR") return text.khqr;
  if (normalizedMethod === "CASH") return text.cash;
  return text.card;
}

function getPaymentStatusLabel(status, text) {
  return String(status || "").trim().toUpperCase() === "PAY_LATER"
    ? text.payLater
    : text.paid;
}

function OrderInfoRow({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-bg-subtle/40 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-text-primary">
        {value || "--"}
      </p>
    </div>
  );
}

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const orders = useOrders();
  const normalizedOrderId = String(orderId || "").trim().toUpperCase();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [normalizedOrderId]);

  const order = useMemo(() => {
    const stateOrder = location.state?.order;
    const matchedHookOrder = orders.find((item) => {
      const uiId = String(item?.id || "").trim().toUpperCase();
      const backendId = String(item?.backendId || "").trim().toUpperCase();
      return uiId === normalizedOrderId || backendId === normalizedOrderId;
    });

    return stateOrder || matchedHookOrder || getOrderById(normalizedOrderId) || null;
  }, [location.state?.order, normalizedOrderId, orders]);

  if (!order) {
    return (
      <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
        <Breadcrumb className="mb-4" currentLabel={text.title} />

        <section className="rounded-2xl border border-border bg-bg-surface p-6 text-center shadow-1">
          <p className="text-lg font-semibold text-text-primary">{text.orderNotFound}</p>
          <p className="mt-2 text-sm text-text-muted">{text.orderNotFoundHint}</p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/orders"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              {text.viewOrders}
            </Link>
            <Link
              to="/services"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-bg-surface px-5 text-sm font-semibold text-text-secondary transition hover:border-brand/35 hover:text-brand"
            >
              {text.continueBrowsing}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
      <Breadcrumb className="mb-4" currentLabel={text.title} />

      <section className="overflow-hidden rounded-[28px] border border-border bg-bg-surface shadow-1">
        <div className="bg-linear-to-r from-success/15 via-brand-soft/35 to-info/10 px-5 py-6 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-pill border border-success/25 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {text.badge}
          </span>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-black tracking-tight text-text-primary sm:text-3xl">
                {text.heading}
              </h1>
              <p className="mt-2 text-sm leading-6 text-text-secondary sm:text-base">
                {text.subtitle}
              </p>
            </div>

            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/12 text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <section className="rounded-2xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/18 p-4 shadow-1 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                  {text.service}
                </p>
                <h2 className="mt-1 text-xl font-bold text-text-primary sm:text-2xl">
                  {order.serviceName || "--"}
                </h2>
                <p className="mt-2 text-sm text-text-secondary">{order.providerName || "--"}</p>
              </div>

              <span className="inline-flex items-center gap-2 rounded-pill bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
                <ReceiptText className="h-3.5 w-3.5" />
                {order.id}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <OrderInfoRow label={text.orderId} value={order.id} />
              <OrderInfoRow
                label={text.amount}
                value={formatMoney(order.amount, order.currency)}
              />
              <OrderInfoRow
                label={text.paymentMethod}
                value={getPaymentMethodLabel(order.paymentMethod, text)}
              />
              <OrderInfoRow
                label={text.paymentStatus}
                value={getPaymentStatusLabel(order.paymentStatus, text)}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-brand" />
              <p className="text-sm font-semibold text-text-primary">{text.title}</p>
            </div>

            <div className="mt-4 space-y-3">
              <OrderInfoRow label={text.provider} value={order.providerName} />
              <OrderInfoRow label={text.location} value={order.location} />
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <Link
                to={`/orders/${encodeURIComponent(order.id)}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover"
              >
                {text.viewOrder}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/orders"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-bg-surface px-5 text-sm font-semibold text-text-secondary transition hover:border-brand/35 hover:text-brand"
              >
                {text.viewOrders}
              </Link>

              <Link
                to="/services"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-bg-surface px-5 text-sm font-semibold text-text-secondary transition hover:border-brand/35 hover:text-brand"
              >
                {text.continueBrowsing}
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
