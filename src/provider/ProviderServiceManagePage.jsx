import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
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
          <article className="rounded-2xl border border-border bg-bg-surface p-3 shadow-1 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              <aside className="relative overflow-hidden rounded-xl border border-border bg-bg-subtle/45 lg:h-[188px] lg:w-[250px] lg:shrink-0">
                <span className="absolute left-2 top-2 z-10 inline-flex h-7 items-center rounded-pill border border-brand/45 bg-brand-soft/75 px-2.5 text-[11px] font-semibold text-brand backdrop-blur">
                  {text.draft}
                </span>
                {draftService.gallery?.length ? (
                  <>
                    <img
                      src={draftService.gallery[0]?.dataUrl}
                      alt={draftService.gallery[0]?.name || draftService.title || text.unknown}
                      className="h-40 w-full object-cover lg:h-full"
                    />
                    {(draftService.gallery?.length || 0) > 1 ? (
                      <span className="absolute bottom-2 right-2 inline-flex h-7 items-center rounded-pill bg-black/60 px-2.5 text-[11px] font-semibold text-white">
                        {`+${(draftService.gallery?.length || 0) - 1}`}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <div className="flex h-40 flex-col items-center justify-center text-center lg:h-full">
                    <Images className="h-5 w-5 text-brand" />
                    <p className="mt-1 text-xs font-medium text-text-secondary">{text.noGallery}</p>
                  </div>
                )}
              </aside>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-text-primary">
                      {draftService.title || text.unknown}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                      {draftService.description || text.unknown}
                    </p>
                  </div>
                  <p className="inline-flex items-center gap-1 rounded-lg border border-border bg-bg-subtle/50 px-2 py-1 text-[11px] font-medium text-text-secondary">
                    <Clock3 className="h-3.5 w-3.5 text-brand" />
                    {formatDateTime(draftService.updatedAt, lang) || text.unknown}
                  </p>
                </div>

                <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-text-secondary sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-bg-subtle/45 px-2.5 py-2">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.locationMode}</p>
                    <p className="mt-1 text-text-primary">
                      {locationModes.length
                        ? locationModes.map((mode) => getModeLabel(mode, t)).join(", ")
                        : text.unknown}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-bg-subtle/45 px-2.5 py-2">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.priceOptions}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-text-primary">
                      <WalletCards className="h-3.5 w-3.5 text-brand" />
                      {formatPrice(defaultPrice, t)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-bg-subtle/45 px-2.5 py-2 sm:col-span-2">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{text.serviceLocation}</p>
                    <p className="mt-1 inline-flex items-start gap-1 text-text-primary">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                      <span className="break-words">{locationText}</span>
                    </p>
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
              </div>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
