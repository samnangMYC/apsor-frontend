import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Landmark, MapPin, ShieldCheck, UserRound, Wallet } from "lucide-react";
import Breadcrumb from "../../components/shared/Breadcrumb";
import {
  createCurrentCustomerProfile,
  createServiceOrder,
  fetchCurrentCustomerProfile,
  fetchPublicServices,
} from "../../api";
import { DEFAULT_PROVIDERS } from "../../data/defaultProviders";
import { DEFAULT_SERVICES } from "../../data/defaultServices";
import { useLang } from "../../i18n/useLang";
import { saveOrder } from "../../utils/orders";
import { formatBillingUnit, formatBillingUnitWithPer } from "../../utils/pricing";
import { getServicePath, matchesServiceKey } from "../../utils/service";

const UI_TEXT = {
  en: {
    title: "Payment",
    subtitle: "Review your booking, enter payment details, and create a mock order.",
    invalidSelection: "Service selection not found.",
    invalidSelectionHint: "Open a service and start checkout from its pricing card.",
    backServices: "Back to services",
    loading: "Loading checkout...",
    securePayment: "Protected checkout",
    securePaymentHint: "This checkout posts a mock order to your local backend and syncs the result into My Orders.",
    customerProfile: "Customer profile",
    completeProfileTitle: "Complete profile to continue",
    completeProfileHint: "Please complete your customer profile before placing this order.",
    paymentMethod: "Payment method",
    orderSummary: "Order summary",
    quantity: "Units",
    discount: "Discount",
    subtotal: "Subtotal",
    total: "Total",
    service: "Service",
    provider: "Provider",
    location: "Location",
    note: "Order note",
    gender: "Gender",
    preferredLanguage: "Preferred language",
    bio: "Bio",
    onboardingCompleted: "Onboarding completed",
    genderMale: "Male",
    genderFemale: "Female",
    yes: "Yes",
    no: "No",
    saveProfile: "Save profile",
    savingProfile: "Saving profile...",
    profileRequired: "Please complete gender, preferred language, and bio.",
    profileLoadFailed: "Unable to check your customer profile right now.",
    profileSaveFailed: "Unable to save your customer profile right now.",
    khqr: "ABA KHQR",
    cash: "Cash on service",
    khqrHint: "Use a mock wallet payment and mark the order as paid.",
    cashHint: "Reserve now and pay the provider when the service happens.",
    fieldRequired: "Please fill in the required fields.",
    paymentFailed: "Unable to create the order. Please check your local backend and try again.",
    placeOrder: "Confirm payment",
    processing: "Processing...",
  },
  km: {
    title: "ការបង់ប្រាក់",
    subtitle: "ពិនិត្យការកក់ បំពេញព័ត៌មានបង់ប្រាក់ ហើយបង្កើតការបញ្ជាទិញសាកល្បង។",
    invalidSelection: "រកមិនឃើញសេវាកម្មដែលបានជ្រើសរើស។",
    invalidSelectionHint: "សូមចូលទៅកាន់សេវាកម្ម ហើយចាប់ផ្តើមបង់ប្រាក់ពីកាតតម្លៃ។",
    backServices: "ត្រឡប់ទៅសេវាកម្ម",
    loading: "កំពុងផ្ទុកទំព័របង់ប្រាក់...",
    securePayment: "ការបង់ប្រាក់មានសុវត្ថិភាព",
    securePaymentHint: "ការបង់ប្រាក់នេះនឹង POST ទៅ backend ក្នុងម៉ាស៊ីនមូលដ្ឋាន ហើយ sync លទ្ធផលទៅ My Orders។",
    customerProfile: "ប្រវត្តិរូបអតិថិជន",
    completeProfileTitle: "សូមបំពេញប្រវត្តិរូបជាមុន",
    completeProfileHint: "សូមបំពេញប្រវត្តិរូបអតិថិជនរបស់អ្នក មុនពេលបញ្ជាទិញ។",
    paymentMethod: "វិធីបង់ប្រាក់",
    orderSummary: "សេចក្តីសង្ខេបការបញ្ជាទិញ",
    quantity: "ចំនួន",
    discount: "បញ្ចុះតម្លៃ",
    subtotal: "តម្លៃមុនបញ្ចុះ",
    total: "សរុប",
    service: "សេវាកម្ម",
    provider: "អ្នកផ្តល់សេវា",
    location: "ទីតាំង",
    note: "កំណត់ចំណាំការបញ្ជាទិញ",
    gender: "ភេទ",
    preferredLanguage: "ភាសាដែលចូលចិត្ត",
    bio: "ប្រវត្តិខ្លី",
    onboardingCompleted: "បញ្ចប់ការចាប់ផ្តើម",
    genderMale: "ប្រុស",
    genderFemale: "ស្រី",
    yes: "បាទ/ចាស",
    no: "ទេ",
    saveProfile: "រក្សាទុកប្រវត្តិរូប",
    savingProfile: "កំពុងរក្សាទុកប្រវត្តិរូប...",
    profileRequired: "សូមបំពេញភេទ ភាសាដែលចូលចិត្ត និងប្រវត្តិខ្លី។",
    profileLoadFailed: "មិនអាចពិនិត្យប្រវត្តិរូបអតិថិជនបានទេ។",
    profileSaveFailed: "មិនអាចរក្សាទុកប្រវត្តិរូបអតិថិជនបានទេ។",
    khqr: "ABA KHQR",
    cash: "បង់ពេលទទួលសេវា",
    khqrHint: "ប្រើការបង់តាម wallet សាកល្បង ហើយសម្គាល់ថាបានបង់រួច។",
    cashHint: "កក់ទុកជាមុន ហើយបង់ជូនអ្នកផ្តល់សេវាពេលបម្រើ។",
    fieldRequired: "សូមបំពេញព័ត៌មានចាំបាច់។",
    paymentFailed: "មិនអាចបង្កើតការបញ្ជាទិញបានទេ។ សូមពិនិត្យ backend ក្នុងម៉ាស៊ីនមូលដ្ឋាន រួចសាកល្បងម្តងទៀត។",
    placeOrder: "បញ្ជាក់ការបង់ប្រាក់",
    processing: "កំពុងដំណើរការ...",
  },
};

const PAYMENT_METHODS = [
  { value: "KHQR", icon: Landmark },
  { value: "CASH", icon: Wallet },
];

function getUnitRange(priceItem) {
  const min = Math.max(1, Number(priceItem?.minUnits || 1));
  const maxRaw = Number(priceItem?.maxUnits || min);
  const max = Number.isFinite(maxRaw) && maxRaw > 0 ? Math.max(min, maxRaw) : min;
  return { min, max };
}

function formatMoney(amount, currency = "USD") {
  const safeAmount = Number(amount || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: String(currency || "USD").toUpperCase(),
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

function getLocationLabel(service) {
  const location = Array.isArray(service?.location) ? service.location[0] : null;
  return [location?.line1, location?.district, location?.city, location?.province].filter(Boolean).join(", ");
}

function getProviderName(service) {
  const provider = DEFAULT_PROVIDERS.find((item) => Number(item?.id) === Number(service?.providerId));
  return (
    service?.provider?.displayName
    || service?.provider?.businessName
    || provider?.displayName
    || provider?.businessName
    || "Apsor Provider"
  );
}

function trim(value) {
  return String(value || "").trim();
}

function isCustomerProfileComplete(profile) {
  return Boolean(
    trim(profile?.gender)
    && trim(profile?.preferredLanguage)
    && trim(profile?.bio)
    && profile?.onboardingCompleted === true,
  );
}

function normalizeOrderResponse({
  response,
  service,
  price,
  units,
  subtotal,
  discount,
  note,
  paymentMethod,
  customer,
}) {
  const normalizedPaymentMethod = String(paymentMethod || "CARD").toUpperCase();
  const computedAmount = Math.max(0, Number(subtotal || 0) - Number(discount || 0));

  return {
    id: String(
      response?.orderNo
      || response?.id
      || response?.orderId
      || response?.publicId
      || `ORD-${Date.now()}`
    ),
    serviceName: response?.serviceName || service?.title || "Service",
    status: String(response?.status || "PENDING").toUpperCase(),
    date: response?.createdAt || response?.date || new Date().toISOString(),
    amount: Number(
      response?.total
      ?? response?.amount
      ?? response?.grandTotal
      ?? computedAmount
    ),
    currency: String(response?.currency || price?.currency || "USD").toUpperCase(),
    location: customer.location || getLocationLabel(service) || "Location pending",
    servicePath: getServicePath(service),
    providerName: response?.providerName || getProviderName(service),
    paymentMethod: normalizedPaymentMethod,
    paymentStatus:
      response?.paymentStatus
      || (normalizedPaymentMethod === "CASH" ? "PAY_LATER" : "PAID"),
    customerName: customer.customerName || "",
    phone: customer.phone || "",
    email: customer.email || "",
    notes: note || "",
    items: [
      {
        name: `${price?.name || service?.title || "Service"} (${units} ${String(price?.billingUnit || "UNIT").toLowerCase()})`,
        qty: units,
        unitPrice: Number(price?.amount || 0),
      },
    ],
  };
}

export default function PaymentPage() {
  const { lang, t } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const serviceKey = searchParams.get("service") || "";
  const priceId = searchParams.get("price") || "";
  const unitsFromUrl = Number(searchParams.get("units") || 1);

  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [isLoadingService, setIsLoadingService] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("KHQR");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [note] = useState("");
  const [discountInput, setDiscountInput] = useState("0");
  const [unitsInput, setUnitsInput] = useState(String(unitsFromUrl || 1));
  const [customerProfile, setCustomerProfile] = useState(null);
  const [customerProfileForm, setCustomerProfileForm] = useState({
    gender: "MALE",
    preferredLanguage: "km-KH",
    bio: "",
    onboardingCompleted: true,
  });

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      try {
        const [serviceResult, profileResult] = await Promise.all([
          fetchPublicServices({
            keyword: "",
            status: "ACTIVE",
            pageNumber: 0,
            pageSize: 100,
            sortBy: "id",
            sortOrder: "desc",
          }),
          fetchCurrentCustomerProfile(),
        ]);

        if (!isMounted) {
          return;
        }

        if (Array.isArray(serviceResult?.items) && serviceResult.items.length) {
          setServices(serviceResult.items);
        }
        setCustomerProfile(profileResult);
        setCustomerProfileForm({
          gender: String(profileResult?.gender || "MALE").trim() || "MALE",
          preferredLanguage: String(profileResult?.preferredLanguage || "km-KH").trim() || "km-KH",
          bio: String(profileResult?.bio || "").trim(),
          onboardingCompleted: Boolean(profileResult?.onboardingCompleted ?? true),
        });
      } catch (error) {
        console.error("Failed to load checkout services:", error);
        if (isMounted) {
          setProfileError(text.profileLoadFailed);
        }
      } finally {
        if (isMounted) {
          setIsLoadingService(false);
        }
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, [text.profileLoadFailed]);

  const service = useMemo(
    () => services.find((item) => matchesServiceKey(item, serviceKey)) || null,
    [serviceKey, services],
  );

  const prices = useMemo(
    () => (Array.isArray(service?.price) ? service.price : []),
    [service?.price],
  );
  const selectedPrice = useMemo(
    () =>
      prices.find((item) => String(item?.id) === String(priceId))
      || prices.find((item) => item?.isDefault)
      || prices[0]
      || null,
    [priceId, prices],
  );

  const providerName = useMemo(() => getProviderName(service), [service]);
  const { min: minUnits, max: maxUnits } = getUnitRange(selectedPrice);
  const safeUnits = Math.min(maxUnits, Math.max(minUnits, Number(unitsInput) || minUnits));
  const unitPrice = Number(selectedPrice?.amount || 0);
  const safeDiscount = Math.max(0, Number(discountInput) || 0);
  const subtotal = Number((unitPrice * safeUnits).toFixed(2));
  const total = Math.max(0, Number((subtotal - safeDiscount).toFixed(2)));
  const locationLabel = useMemo(() => getLocationLabel(service), [service]);
  const requiresCustomerProfile = !isCustomerProfileComplete(customerProfile);
  const requestPreview = useMemo(
    () => ({
      serviceId: Number(service?.id || 0),
      servicePriceId: Number(selectedPrice?.id || 0),
      subtotal,
      discount: safeDiscount,
      units: safeUnits,
      note: note || "",
    }),
    [note, safeDiscount, safeUnits, selectedPrice?.id, service?.id, subtotal],
  );

  useEffect(() => {
    if (!selectedPrice) {
      return;
    }

    setUnitsInput((current) => {
      const parsed = Number(current);
      const nextUnits = Number.isFinite(parsed) ? parsed : (unitsFromUrl || minUnits);
      return String(Math.min(maxUnits, Math.max(minUnits, nextUnits)));
    });
  }, [maxUnits, minUnits, selectedPrice, unitsFromUrl]);

  const updateCustomerProfileField = (key) => (event) => {
    const nextValue =
      key === "onboardingCompleted"
        ? event.target.value === "true"
        : key === "bio"
          ? event.target.value.slice(0, 320)
          : event.target.value;
    setCustomerProfileForm((current) => ({
      ...current,
      [key]: nextValue,
    }));
    setProfileError("");
  };

  const handleSaveCustomerProfile = async (event) => {
    event.preventDefault();

    const payload = {
      gender: trim(customerProfileForm.gender),
      preferredLanguage: trim(customerProfileForm.preferredLanguage),
      bio: trim(customerProfileForm.bio),
      onboardingCompleted: Boolean(customerProfileForm.onboardingCompleted),
    };

    if (!payload.gender || !payload.preferredLanguage || !payload.bio) {
      setProfileError(text.profileRequired);
      return;
    }

    setProfileError("");
    setIsSavingProfile(true);

    try {
      const savedProfile = await createCurrentCustomerProfile(payload);
      setCustomerProfile(savedProfile || payload);
      setCustomerProfileForm({
        gender: payload.gender,
        preferredLanguage: payload.preferredLanguage,
        bio: payload.bio,
        onboardingCompleted: payload.onboardingCompleted,
      });
    } catch (error) {
      console.error("Failed to save customer profile:", error);
      setProfileError(
        error?.response?.data?.message
        || error?.response?.data?.error
        || text.profileSaveFailed,
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!service || !selectedPrice || isSubmitting) return;

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await createServiceOrder(requestPreview);

      const nextOrder = saveOrder(
        normalizeOrderResponse({
          response,
          service,
          price: selectedPrice,
          units: safeUnits,
          subtotal,
          discount: safeDiscount,
          note,
          paymentMethod,
          customer: {
            location: locationLabel,
          },
        }),
      );

      navigate(`/orders/success/${encodeURIComponent(nextOrder.id)}`, {
        replace: true,
        state: {
          fromPayment: true,
          order: nextOrder,
        },
      });
    } catch (error) {
      console.error("Failed to create mock payment order:", error);
      setSubmitError(text.paymentFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingService) {
    return (
      <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-10 xl:px-22 2xl:px-64">
        <Breadcrumb className="mb-4" currentLabel={text.title} />
        <section className="rounded-2xl border border-border bg-bg-surface p-6 text-center shadow-1">
          <p className="text-lg font-semibold text-text-primary">{text.loading}</p>
        </section>
      </main>
    );
  }

  if (!service || !selectedPrice) {
    return (
      <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-10 xl:px-22 2xl:px-64">
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

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand" />
              <div>
                <p className="text-sm font-semibold text-text-primary">{text.securePayment}</p>
                <p className="text-xs text-text-muted">{text.securePaymentHint}</p>
              </div>
            </div>
          </section>

          {requiresCustomerProfile ? (
            <section className="rounded-2xl border border-warning/30 bg-warning/8 p-4 shadow-1 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-warning/15 text-warning">
                  <UserRound className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{text.completeProfileTitle}</p>
                  <p className="mt-1 text-xs text-text-muted">{text.completeProfileHint}</p>
                </div>
              </div>

              <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={handleSaveCustomerProfile}>
                {profileError ? (
                  <div className="rounded-xl border border-danger/30 bg-danger/8 px-3 py-2 text-sm text-danger sm:col-span-2">
                    {profileError}
                  </div>
                ) : null}

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">{text.gender}</span>
                  <select
                    value={customerProfileForm.gender}
                    onChange={updateCustomerProfileField("gender")}
                    className="h-11 w-full rounded-xl border border-border bg-bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="MALE">{text.genderMale}</option>
                    <option value="FEMALE">{text.genderFemale}</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">{text.preferredLanguage}</span>
                  <select
                    value={customerProfileForm.preferredLanguage}
                    onChange={updateCustomerProfileField("preferredLanguage")}
                    className="h-11 w-full rounded-xl border border-border bg-bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="km-KH">km-KH</option>
                    <option value="en-US">en-US</option>
                  </select>
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">{text.bio}</span>
                  <textarea
                    value={customerProfileForm.bio}
                    onChange={updateCustomerProfileField("bio")}
                    rows={4}
                    className="w-full rounded-xl border border-border bg-bg-surface px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">{text.onboardingCompleted}</span>
                  <select
                    value={String(customerProfileForm.onboardingCompleted)}
                    onChange={updateCustomerProfileField("onboardingCompleted")}
                    className="h-11 w-full rounded-xl border border-border bg-bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="true">{text.yes}</option>
                    <option value="false">{text.no}</option>
                  </select>
                </label>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingProfile ? text.savingProfile : text.saveProfile}
                </button>
              </form>
            </section>
          ) : null}

          <section className="rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
            <h2 className="text-sm font-semibold text-text-primary">{text.paymentMethod}</h2>
            <div className="mt-3 grid gap-2">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const active = paymentMethod === method.value;
                const labelKey = method.value === "KHQR" ? "khqr" : "cash";
                const hintKey = method.value === "KHQR" ? "khqrHint" : "cashHint";

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

          {submitError ? (
            <section className="rounded-2xl border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger shadow-1">
              {submitError}
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5 xl:sticky xl:top-24">
            <h2 className="text-sm font-semibold text-text-primary">{text.orderSummary}</h2>

            <div className="mt-3 rounded-xl border border-border bg-bg-subtle/45 p-3">
              <p className="text-base font-bold text-text-primary">{service.title}</p>
              <p className="mt-1 text-xs text-text-secondary">{providerName}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-text-muted">
                <MapPin className="h-3.5 w-3.5 text-brand" />
                <span>{locationLabel || "Location pending"}</span>
              </div>
            </div>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-text-secondary">{text.service}</span>
                <span className="text-right font-medium text-text-primary">{selectedPrice.name || service.title}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-text-secondary">{text.provider}</span>
                <span className="text-right font-medium text-text-primary">{providerName}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-text-secondary">{text.quantity}</span>
                <input
                  type="number"
                  min={minUnits}
                  max={maxUnits}
                  value={safeUnits}
                  onChange={(event) => setUnitsInput(event.target.value)}
                  className="h-10 w-24 rounded-lg border border-border bg-bg-surface px-3 text-right text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-text-secondary">{text.discount}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountInput}
                  onChange={(event) => setDiscountInput(event.target.value)}
                  className="h-10 w-28 rounded-lg border border-border bg-bg-surface px-3 text-right text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-border bg-bg-subtle/45 p-3 text-sm">
              <div className="flex items-center justify-between gap-2 text-text-secondary">
                <span>{formatBillingUnitWithPer(selectedPrice.billingUnit, t)}</span>
                <span className="font-medium text-text-primary">{formatMoney(unitPrice, selectedPrice.currency)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-text-secondary">
                <span>{text.subtotal}</span>
                <span className="font-medium text-text-primary">{formatMoney(subtotal, selectedPrice.currency)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-text-secondary">
                <span>{text.discount}</span>
                <span className="font-medium text-text-primary">-{formatMoney(safeDiscount, selectedPrice.currency)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
                <span className="font-semibold text-text-primary">{text.total}</span>
                <span className="text-lg font-bold text-brand">{formatMoney(total, selectedPrice.currency)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || requiresCustomerProfile}
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? text.processing : text.placeOrder}
            </button>

            <p className="mt-2 text-xs text-text-muted">
              {`${formatMoney(unitPrice, selectedPrice.currency)} ${formatBillingUnit(selectedPrice.billingUnit, t)} • min ${minUnits}, max ${maxUnits}`}
            </p>
          </section>
        </aside>
      </form>
    </main>
  );
}
