import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  Eye,
  FolderOpenDot,
  Images,
  MapPin,
  PencilLine,
  Plus,
  RefreshCw,
  Trash2,
  WalletCards,
} from "lucide-react";
import Breadcrumb from "../components/shared/Breadcrumb";
import { useLang } from "../i18n/useLang";
import { formatBillingUnitWithPer } from "../utils/pricing";

const UI_TEXT = {
  en: {
    title: "Manage Services",
    subtitle: "Manage your provider services from one place.",
    createService: "Create service",
    totalServices: "Total services",
    draftServices: "Draft services",
    publishedServices: "Published",
    draftSectionTitle: "Local Draft",
    draftSectionSubtitle: "This draft is saved in your browser storage.",
    refreshDraft: "Refresh draft",
    noDraftTitle: "No draft service yet",
    noDraftSubtitle: "Create a service to see and manage it here.",
    continueEditing: "Continue editing",
    preview: "Preview",
    removeDraft: "Remove draft",
    draft: "Draft",
    updatedAt: "Updated",
    locationMode: "Location mode",
    serviceLocation: "Service location",
    gallery: "Gallery",
    noGallery: "No gallery images",
    unknown: "N/A",
    draftRemoved: "Draft removed successfully.",
    draftRefreshed: "Draft refreshed.",
    priceOptions: "Price options",
    completion: "Completion",
    completionReady: "Draft is complete and ready.",
    completionInProgress: "Complete the missing sections before publish.",
    stepSummary: "Summary",
    stepAvailability: "Availability",
    stepLocation: "Location",
    stepPrice: "Price",
    stepGallery: "Gallery",
  },
  km: {
    title: "គ្រប់គ្រងសេវាកម្ម",
    subtitle: "គ្រប់គ្រងសេវាកម្មរបស់អ្នកនៅកន្លែងតែមួយ។",
    createService: "បង្កើតសេវាកម្ម",
    totalServices: "សេវាកម្មសរុប",
    draftServices: "សេវាកម្មព្រាង",
    publishedServices: "បានបោះពុម្ព",
    draftSectionTitle: "ព្រាងក្នុងឧបករណ៍",
    draftSectionSubtitle: "ព្រាងនេះត្រូវបានរក្សាទុកក្នុង browser របស់អ្នក។",
    refreshDraft: "ផ្ទុកព្រាងឡើងវិញ",
    noDraftTitle: "មិនទាន់មានសេវាកម្មព្រាងទេ",
    noDraftSubtitle: "សូមបង្កើតសេវាកម្មមួយជាមុន ដើម្បីគ្រប់គ្រងនៅទីនេះ។",
    continueEditing: "បន្តកែប្រែ",
    preview: "មើលជាមុន",
    removeDraft: "លុបព្រាង",
    draft: "ព្រាង",
    updatedAt: "កែប្រែចុងក្រោយ",
    locationMode: "របៀបទីតាំង",
    serviceLocation: "ទីតាំងសេវាកម្ម",
    gallery: "វិចិត្រសាល",
    noGallery: "មិនមានរូបភាពវិចិត្រសាល",
    unknown: "មិនមាន",
    draftRemoved: "បានលុបព្រាងដោយជោគជ័យ។",
    draftRefreshed: "បានផ្ទុកព្រាងឡើងវិញ។",
    priceOptions: "ជម្រើសតម្លៃ",
    completion: "ការបំពេញ",
    completionReady: "ព្រាងបានបំពេញពេញលេញ និងត្រៀមរួចរាល់។",
    completionInProgress: "សូមបំពេញផ្នែកដែលខ្វះ មុនពេលបោះពុម្ព។",
    stepSummary: "សង្ខេប",
    stepAvailability: "ពេលវេលា",
    stepLocation: "ទីតាំង",
    stepPrice: "តម្លៃ",
    stepGallery: "រូបភាព",
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

function getLocale(lang) {
  return lang === "km" ? "km-KH" : "en-US";
}

function formatDateTime(value, lang) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(getLocale(lang), {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function parseLocationModes(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim().toUpperCase())
      .filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
}

function getModeLabel(mode, t) {
  const normalized = String(mode || "").toUpperCase();
  if (normalized === "ONSITE") return t.onsite || "Onsite";
  if (normalized === "REMOTE") return t.remote || "Remote";
  if (normalized === "HYBRID") return t.hybrid || "Hybrid";
  return normalized || "-";
}

function formatPrice(option, t) {
  if (!option) return "--";
  const amount = Number(option.amount);
  const currency = String(option.currency || "USD").toUpperCase();
  if (!Number.isFinite(amount) || amount <= 0) return "--";

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} • ${formatBillingUnitWithPer(option.billingUnit, t)}`;
}

function getDefaultPrice(priceOptions) {
  if (!Array.isArray(priceOptions) || !priceOptions.length) return null;
  return priceOptions.find((item) => item?.isDefault) || priceOptions[0];
}

function isPositiveNumber(value) {
  return Number(value) > 0;
}

function isValidPriceOption(option) {
  const name = String(option?.name || "").trim();
  const amount = Number(option?.amount);
  const minUnits = Number(option?.minUnits);
  const maxUnits = Number(option?.maxUnits);

  return (
    Boolean(name) &&
    Number.isFinite(amount) &&
    amount > 0 &&
    Number.isInteger(minUnits) &&
    minUnits > 0 &&
    Number.isInteger(maxUnits) &&
    maxUnits >= minUnits
  );
}

function getDraftFromStorage() {
  const payload = readStoredJson("apsor:uploadServicePayload");
  const updatedAt = sessionStorage.getItem("apsor:uploadServiceUpdatedAt");

  if (!payload || typeof payload !== "object") return null;
  const gallery = (Array.isArray(payload.gallery) ? payload.gallery : [])
    .map((item, index) => ({
      id: String(item?.id || `gallery-${index + 1}`),
      name: String(item?.name || `image-${index + 1}`),
      dataUrl: String(item?.dataUrl || "").trim(),
    }))
    .filter((item) => item.dataUrl);

  return {
    category: payload.category || null,
    subcategory: payload.subcategory || null,
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
    locationMode: String(payload.locationMode || "").trim(),
    availability: payload.availability || null,
    location: payload.location || null,
    priceOptions: Array.isArray(payload.priceOptions) ? payload.priceOptions : [],
    gallery,
    updatedAt: updatedAt || null,
  };
}

export default function ProviderServiceManagePage() {
  const { lang, t } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const [draftService, setDraftService] = useState(() => getDraftFromStorage());
  const [message, setMessage] = useState("");

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  const serviceCount = draftService ? 1 : 0;
  const draftCount = draftService ? 1 : 0;
  const publishedCount = 0;

  const defaultPrice = useMemo(
    () => getDefaultPrice(draftService?.priceOptions || []),
    [draftService?.priceOptions],
  );
  const locationModes = useMemo(
    () => parseLocationModes(draftService?.locationMode),
    [draftService?.locationMode],
  );
  const locationText = useMemo(() => {
    const location = draftService?.location;
    if (!location || typeof location !== "object") return text.unknown;
    return [
      location.line1,
      location.line2,
      location.district,
      location.city,
      location.province,
      location.countryCode,
    ]
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .join(", ") || text.unknown;
  }, [draftService?.location, text.unknown]);
  const completionItems = useMemo(() => {
    if (!draftService) return [];

    const availability = draftService.availability || {};
    const location = draftService.location || {};
    const hasSummary = Boolean(
      draftService.category
      && draftService.subcategory
      && String(draftService.title || "").trim()
      && String(draftService.description || "").trim(),
    );
    const hasAvailability = Boolean(
      isPositiveNumber(availability.openDaysMask)
      && isPositiveNumber(availability.slotDurationMinutes)
      && isPositiveNumber(availability.capacityPerSlot)
      && (
        !String(availability.startTime || "").trim()
        || !String(availability.endTime || "").trim()
        || String(availability.startTime) < String(availability.endTime)
      ),
    );
    const latitude = Number(location?.latitude);
    const longitude = Number(location?.longitude);
    const hasLocation = Boolean(
      String(location?.line1 || "").trim()
      || (Number.isFinite(latitude) && Number.isFinite(longitude)),
    );
    const hasPrice = (draftService.priceOptions || []).some((item) => isValidPriceOption(item));
    const hasGallery = (draftService.gallery || []).length > 0;

    return [
      { key: "summary", label: text.stepSummary, done: hasSummary },
      { key: "availability", label: text.stepAvailability, done: hasAvailability },
      { key: "location", label: text.stepLocation, done: hasLocation },
      { key: "price", label: text.stepPrice, done: hasPrice },
      { key: "gallery", label: text.stepGallery, done: hasGallery },
    ];
  }, [draftService, text.stepAvailability, text.stepGallery, text.stepLocation, text.stepPrice, text.stepSummary]);
  const completedCount = completionItems.filter((item) => item.done).length;
  const completionRate = completionItems.length
    ? Math.round((completedCount / completionItems.length) * 100)
    : 0;
  const isDraftComplete = completionItems.length > 0 && completionItems.every((item) => item.done);

  const handleRemoveDraft = () => {
    sessionStorage.removeItem("apsor:uploadServicePayload");
    sessionStorage.removeItem("apsor:uploadServiceUpdatedAt");
    setDraftService(null);
    setMessage(text.draftRemoved);
  };

  const handleRefreshDraft = () => {
    const nextDraft = getDraftFromStorage();
    setDraftService(nextDraft);
    setMessage(nextDraft ? text.draftRefreshed : "");
  };

  return (
    <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
      <Breadcrumb className="mb-4" currentLabel={text.title} />

      <section className="rounded-2xl border border-border bg-linear-to-r from-bg-surface via-bg-surface to-brand-soft/20 p-4 shadow-1 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text-primary sm:text-2xl">{text.title}</h1>
            <p className="mt-1 text-sm text-text-secondary">{text.subtitle}</p>
          </div>

          <Link
            to="/provider/service/upload"
            className="inline-flex h-10 items-center gap-2 rounded-pill border border-brand/45 bg-linear-to-r from-brand-soft/65 to-bg-surface px-4 text-sm font-semibold text-brand transition hover:border-brand hover:bg-brand-soft/80"
          >
            <Plus className="h-4 w-4" />
            {text.createService}
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-bg-subtle px-3 py-2.5">
            <p className="text-[11px] text-text-muted">{text.totalServices}</p>
            <p className="mt-0.5 text-base font-bold text-text-primary">{serviceCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-bg-subtle px-3 py-2.5">
            <p className="text-[11px] text-text-muted">{text.draftServices}</p>
            <p className="mt-0.5 text-base font-bold text-text-primary">{draftCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-bg-subtle px-3 py-2.5">
            <p className="text-[11px] text-text-muted">{text.publishedServices}</p>
            <p className="mt-0.5 text-base font-bold text-text-primary">{publishedCount}</p>
          </div>
        </div>
      </section>

      {message ? (
        <section className="mt-4 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm font-medium text-success">
          {message}
        </section>
      ) : null}

      <section className="mt-4 rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">{text.draftSectionTitle}</h2>
            <p className="mt-1 text-xs text-text-muted">{text.draftSectionSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={handleRefreshDraft}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-bg-subtle px-2.5 text-xs font-semibold text-text-secondary transition hover:border-brand/45 hover:text-brand"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {text.refreshDraft}
          </button>
        </div>

        {!draftService ? (
          <div className="rounded-xl border border-dashed border-border bg-bg-subtle/70 px-4 py-8 text-center">
            <FolderOpenDot className="mx-auto h-9 w-9 text-brand" />
            <p className="mt-3 text-base font-semibold text-text-primary">{text.noDraftTitle}</p>
            <p className="mt-1 text-sm text-text-muted">{text.noDraftSubtitle}</p>
            <Link
              to="/provider/service/upload"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-pill bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              <Plus className="h-4 w-4" />
              {text.createService}
            </Link>
          </div>
        ) : (
          <article className="rounded-xl border border-border bg-bg-subtle/65 p-3 sm:p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-text-primary">
                  {draftService.title || text.unknown}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                  {draftService.description || text.unknown}
                </p>
              </div>
              <span className="inline-flex h-7 items-center rounded-pill border border-brand/45 bg-brand-soft/50 px-2.5 text-[11px] font-semibold text-brand">
                {text.draft}
              </span>
            </div>

            <div className="mt-3 rounded-lg border border-border bg-bg-surface px-3 py-2">
              <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-semibold text-text-muted">
                <span>{text.completion}</span>
                <span>{`${completionRate}%`}</span>
              </div>
              <div className="h-2 rounded-full bg-bg-subtle">
                <div
                  className="h-2 rounded-full bg-linear-to-r from-brand to-brand-hover transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className={`mt-1 text-[11px] font-medium ${isDraftComplete ? "text-success" : "text-text-muted"}`}>
                {isDraftComplete ? text.completionReady : text.completionInProgress}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {completionItems.map((item) => (
                  <span
                    key={item.key}
                    className={`inline-flex h-6 items-center gap-1 rounded-pill border px-2 text-[11px] font-semibold ${
                      item.done
                        ? "border-success/35 bg-success/10 text-success"
                        : "border-border bg-bg-subtle text-text-muted"
                    }`}
                  >
                    {item.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-text-secondary sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-border bg-bg-surface px-2.5 py-2">
                <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.updatedAt}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-text-primary">
                  <Clock3 className="h-3.5 w-3.5 text-brand" />
                  {formatDateTime(draftService.updatedAt, lang) || text.unknown}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-bg-surface px-2.5 py-2">
                <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.locationMode}</p>
                <p className="mt-1 text-text-primary">
                  {locationModes.length
                    ? locationModes.map((mode) => getModeLabel(mode, t)).join(", ")
                    : text.unknown}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-bg-surface px-2.5 py-2">
                <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.priceOptions}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-text-primary">
                  <WalletCards className="h-3.5 w-3.5 text-brand" />
                  {formatPrice(defaultPrice, t)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-bg-surface px-2.5 py-2 sm:col-span-2 lg:col-span-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.serviceLocation}</p>
                <p className="mt-1 inline-flex items-start gap-1 text-text-primary">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  <span className="break-words">{locationText}</span>
                </p>
              </div>
              <div className="rounded-lg border border-border bg-bg-surface px-2.5 py-2 sm:col-span-2 lg:col-span-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.gallery}</p>
                {draftService.gallery?.length ? (
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                    {draftService.gallery.slice(0, 6).map((item, index) => {
                      const hasMore = draftService.gallery.length > 6 && index === 5;
                      return (
                        <div key={item.id} className="relative overflow-hidden rounded-md border border-border">
                          <img src={item.dataUrl} alt={item.name} className="h-14 w-full object-cover sm:h-16" />
                          {hasMore ? (
                            <span className="absolute inset-0 inline-flex items-center justify-center bg-black/50 text-xs font-semibold text-white">
                              {`+${draftService.gallery.length - 6}`}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-1 inline-flex items-center gap-1 text-text-primary">
                    <Images className="h-3.5 w-3.5 text-brand" />
                    {text.noGallery}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                to="/provider/service/edit"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-bg-surface px-3 text-xs font-semibold text-text-secondary transition hover:border-brand/45 hover:text-brand"
              >
                <PencilLine className="h-3.5 w-3.5" />
                {text.continueEditing}
              </Link>
              <Link
                to="/services"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-bg-surface px-3 text-xs font-semibold text-text-secondary transition hover:border-brand/45 hover:text-brand"
              >
                <Eye className="h-3.5 w-3.5" />
                {text.preview}
              </Link>
              <button
                type="button"
                onClick={handleRemoveDraft}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-danger/35 bg-danger/10 px-3 text-xs font-semibold text-danger transition hover:bg-danger/15"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {text.removeDraft}
              </button>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
