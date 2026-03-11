import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CreditCard, Landmark, ShieldCheck, Wallet } from "lucide-react";
import Breadcrumb from "../../components/shared/Breadcrumb";
import { DEFAULT_SERVICES } from "../../data/defaultServices";
import { DEFAULT_PROVIDERS } from "../../data/defaultProviders";
import { useLang } from "../../i18n/useLang";
import { createOrder } from "../../utils/orders";
import { matchesServiceKey } from "../../utils/service";

const UI_TEXT = {
  en: {
    title: "Payment",
    subtitle: "Review your service, choose a payment method, and confirm the booking.",
    invalidSelection: "Service selection not found.",
    invalidSelectionHint: "Open a service and start checkout from its pricing card.",
    backServices: "Back to services",
    paymentMethod: "Payment method",
    securePayment: "Protected checkout",
    securePaymentHint: "This demo stores created orders locally so they appear in My Orders immediately.",
    placeOrder: "Confirm payment",
    processing: "Processing...",
    card: "Card",
    khqr: "ABA KHQR",
    cash: "Cash on service",
    cardHint: "Instant confirmation with debit or credit card.",
    khqrHint: "Mark the booking as paid and confirm via wallet transfer.",
    cashHint: "Reserve now and pay the provider during service.",
    placeholderName: "Your full name",
    placeholderPhone: "012 345 678",
    placeholderEmail: "name@example.com",
    placeholderLocation: "Street address or service area",
    placeholderNotes: "Optional notes for the provider",
  },
  km: {
    title: "ការបង់ប្រាក់",
    subtitle: "ពិនិត្យសេវាកម្ម ជ្រើសរើសវិធីបង់ប្រាក់ ហើយបញ្ជាក់ការកក់។",
    invalidSelection: "រកមិនឃើញសេវាកម្មដែលបានជ្រើសរើស។",
    invalidSelectionHint: "សូមចូលទៅកាន់សេវាកម្ម ហើយចាប់ផ្តើមបង់ប្រាក់ពីកាតតម្លៃ។",
    backServices: "ត្រឡប់ទៅសេវាកម្ម",
    paymentMethod: "វិធីបង់ប្រាក់",
    securePayment: "ការបង់ប្រាក់មានសុវត្ថិភាព",
    securePaymentHint: "នេះជាគំរូ frontend ដែលរក្សាទុកការបញ្ជាទិញក្នុងម៉ាស៊ីនមូលដ្ឋាន ដើម្បីបង្ហាញភ្លាមៗក្នុង My Orders។",
    placeOrder: "បញ្ជាក់ការបង់ប្រាក់",
    processing: "កំពុងដំណើរការ...",
    card: "កាត",
    khqr: "ABA KHQR",
    cash: "បង់ពេលទទួលសេវា",
    cardHint: "បញ្ជាក់ភ្លាមៗជាមួយកាតឥណទាន ឬ ដេប៊ីត។",
    khqrHint: "កត់ថាការកក់បានបង់ប្រាក់រួច ហើយបញ្ជាក់តាមវ៉ាឡេត។",
    cashHint: "កក់ទុកមុន ហើយបង់ជូនអ្នកផ្តល់សេវាពេលបម្រើ។",
    placeholderName: "ឈ្មោះពេញរបស់អ្នក",
    placeholderPhone: "012 345 678",
    placeholderEmail: "name@example.com",
    placeholderLocation: "អាសយដ្ឋាន ឬ តំបន់សេវាកម្ម",
    placeholderNotes: "កំណត់ចំណាំបន្ថែមសម្រាប់អ្នកផ្តល់សេវា",
  },
};

const PAYMENT_METHODS = [
  { value: "CARD", icon: CreditCard },
  { value: "KHQR", icon: Landmark },
  { value: "CASH", icon: Wallet },
];

function getUnitRange(priceItem) {
  const min = Math.max(1, Number(priceItem?.minUnits || 1));
  const maxRaw = Number(priceItem?.maxUnits || min);
  const max = Number.isFinite(maxRaw) && maxRaw > 0 ? Math.max(min, maxRaw) : min;
  return { min, max };
}

export default function PaymentPage() {
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const serviceKey = searchParams.get("service") || "";
  const priceId = searchParams.get("price") || "";
  const unitsFromUrl = Number(searchParams.get("units") || 1);

  const service = useMemo(
    () => DEFAULT_SERVICES.find((item) => matchesServiceKey(item, serviceKey)) || null,
    [serviceKey],
  );

  const prices = Array.isArray(service?.price) ? service.price : [];
  const defaultPrice = prices.find((item) => String(item?.id) === String(priceId))
    || prices.find((item) => item?.isDefault)
    || prices[0]
    || null;
  const provider = DEFAULT_PROVIDERS.find((item) => Number(item?.id) === Number(service?.providerId)) || null;
  const providerName = provider?.displayName || provider?.businessName || "Apsor Provider";
  const selectedPrice = defaultPrice;
  const { min: minUnits, max: maxUnits } = getUnitRange(selectedPrice);
  const safeUnits = Math.min(maxUnits, Math.max(minUnits, unitsFromUrl || minUnits));
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!service || !selectedPrice || isSubmitting) return;

    setIsSubmitting(true);

    const nextOrder = createOrder({
      service,
      price: selectedPrice,
      units: safeUnits,
      providerName,
      paymentMethod,
    });

    navigate(`/orders/${encodeURIComponent(nextOrder.id)}`, {
      state: { fromPayment: true },
    });
  };

  if (!service || !selectedPrice) {
    return (
      <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
        <Breadcrumb className="mb-4" currentLabel={text.title} />
        <section className="rounded-2xl border border-border bg-bg-surface p-6 text-center shadow-1">
          <p className="text-lg font-semibold text-text-primary">{text.invalidSelection}</p>
          <p className="mt-1 text-sm text-text-muted">{text.invalidSelectionHint}</p>
          <Link
            to="/services"
            className="mt-4 inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover"
          >
            {text.backServices}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
      <Breadcrumb className="mb-4" currentLabel={text.title} />

      <section className="rounded-2xl border border-border bg-linear-to-r from-bg-surface via-bg-surface to-brand-soft/20 p-4 shadow-1 sm:p-5">
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">{text.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">{text.subtitle}</p>
      </section>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <section className="rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <div>
              <p className="text-sm font-semibold text-text-primary">{text.securePayment}</p>
              <p className="text-xs text-text-muted">{text.securePaymentHint}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
          <h2 className="text-sm font-semibold text-text-primary">{text.paymentMethod}</h2>
          <div className="mt-3 grid gap-2">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const active = paymentMethod === method.value;
              const labelKey = method.value === "CARD" ? "card" : method.value === "KHQR" ? "khqr" : "cash";
              const hintKey = method.value === "CARD" ? "cardHint" : method.value === "KHQR" ? "khqrHint" : "cashHint";

              return (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPaymentMethod(method.value)}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${active
                      ? "border-brand/60 bg-brand-soft/40"
                      : "border-border bg-bg-subtle hover:border-brand/35"
                    }`}
                >
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${active ? "bg-brand text-white" : "bg-bg-surface text-brand"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-text-primary">{text[labelKey]}</span>
                    <span className="mt-0.5 block text-xs text-text-muted">{text[hintKey]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? text.processing : text.placeOrder}
        </button>
      </form>
    </main>
  );
}
