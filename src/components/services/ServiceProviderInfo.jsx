import { CalendarDays, Globe, MapPin, Phone, Star, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/useLang";
import { DEFAULT_PROVIDERS } from "../../data/defaultProviders";
import { getProviderUsername } from "../../utils/provider";

const UI_TEXT = {
  en: {
    providerInfo: "Provider Info",
    providerNameFallback: "Apsor Provider",
    providerTypeFallback: "Service provider",
    sinceAt: "Since",
    memberSince: "Member since",
    phone: "Phone",
    website: "Website",
    facebook: "Facebook",
    telegram: "Telegram",
    noContactChannels: "No contact channels yet",
    noData: "N/A",
    callProvider: "Call provider",
    viewProfile: "View profile",
  },
  km: {
    providerInfo: "ព័ត៌មានអ្នកផ្តល់សេវា",
    providerNameFallback: "អ្នកផ្តល់សេវា Apsor",
    providerTypeFallback: "អ្នកផ្តល់សេវា",
    sinceAt: "ចាប់ពី",
    memberSince: "សមាជិកតាំងពី",
    phone: "លេខទូរស័ព្ទ",
    website: "វេបសាយ",
    facebook: "Facebook",
    telegram: "Telegram",
    noContactChannels: "មិនទាន់មានបណ្តាញទំនាក់ទំនង",
    noData: "មិនមានទិន្នន័យ",
    callProvider: "ហៅអ្នកផ្តល់សេវា",
    viewProfile: "មើលប្រវត្តិរូប",
  },
};



function FacebookBrandIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M22.675 0h-21.35C.595 0 0 .595 0 1.326v21.348C0 23.405.595 24 1.326 24H12.82v-9.294H9.692V11.08h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.625h-3.12V24h6.116C23.405 24 24 23.405 24 22.674V1.326C24 .595 23.405 0 22.675 0z" />
    </svg>
  );
}

function TelegramBrandIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.56 8.21-1.97 9.28c-.15.66-.54.82-1.09.51l-3.02-2.23-1.46 1.41c-.16.16-.3.3-.61.3l.22-3.11 5.66-5.12c.25-.22-.05-.34-.38-.12l-7 4.41-3.02-.94c-.66-.2-.67-.66.14-.97l11.8-4.55c.55-.2 1.02.13.83 1.13z" />
    </svg>
  );
}

function getLocale(lang) {
  return lang === "km" ? "km-KH" : "en-US";
}

function formatBusinessType(businessType, fallback) {
  const value = String(businessType || "").trim();
  if (!value) return fallback;
  return value
    .toLowerCase()
    .split("_")
    .map((part) => `${part[0]?.toUpperCase() || ""}${part.slice(1)}`)
    .join(" ");
}

function getProviderInitials(name, fallback = "SP") {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return fallback;
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] || ""}${words[1][0] || ""}`.toUpperCase();
}

function formatProviderRating(avg, count, t) {
  if (!count) return t.newBadge || "New";
  return `${Number(avg || 0).toFixed(1)} (${count})`;
}

function getEstablishedYear(value) {
  if (!value) return "";
  const date = new Date(value);
  const year = date.getFullYear();
  return Number.isFinite(year) ? String(year) : "";
}

function formatDate(value, lang) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(getLocale(lang), {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function getFacebookUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^www\./i.test(raw) || /facebook\.com\//i.test(raw)) return `https://${raw.replace(/^https?:\/\//i, "")}`;
  return `https://facebook.com/${raw.replace(/^@/, "")}`;
}

function getTelegramUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^t\.me\//i.test(raw)) return `https://${raw}`;
  return `https://t.me/${raw.replace(/^@/, "").replace(/\s+/g, "")}`;
}

function getPhoneNumber(value) {
  return String(value || "").trim();
}

function getPhoneUrl(value) {
  const phone = getPhoneNumber(value);
  if (!phone) return "";
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function getWebsiteUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function getWebsiteLabel(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    return parsed.hostname.replace(/^www\./i, "");
  } catch {
    return raw.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0];
  }
}

export default function ServiceProviderInfo({ service, className = "" }) {
  const { lang, t } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const provider = DEFAULT_PROVIDERS.find((item) => Number(item?.id) === Number(service?.providerId)) || null;
  const providerName = provider?.displayName || provider?.businessName || text.providerNameFallback;
  const providerMeta = provider?.businessName && provider?.businessName !== providerName
    ? provider.businessName
    : formatBusinessType(provider?.businessType, text.providerTypeFallback);
  const providerCity = service?.location?.[0]?.city || t.locationPending || "Location pending";
  const providerRating = formatProviderRating(service?.ratingAvg, service?.ratingCount, t);
  const providerSince = getEstablishedYear(provider?.establishedAt);
  const providerCreatedAt = formatDate(provider?.createdAt, lang);
  const providerPhone = getPhoneNumber(provider?.phoneNumber || provider?.phone);
  const providerPhoneUrl = getPhoneUrl(providerPhone);
  const providerWebsiteUrl = getWebsiteUrl(provider?.websiteUrl || provider?.website);
  const providerWebsiteLabel = getWebsiteLabel(providerWebsiteUrl);
  const providerFacebookUrl = getFacebookUrl(provider?.facebookUrl);
  const providerTelegramUrl = getTelegramUrl(provider?.telegram);
  const providerUsername = getProviderUsername(provider);
  const hasContacts = providerPhone || providerWebsiteUrl || providerFacebookUrl || providerTelegramUrl;

  return (
    <div className={className}>

      <div className="mt-2 rounded-xl border border-border bg-linear-to-br from-bg-surface via-bg-subtle to-brand-soft/20 p-3.5 shadow-1">
        <div className="flex items-start gap-3.5">
          <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-soft/80 to-bg-surface text-sm font-bold text-brand ring-2 ring-white/70">
            {getProviderInitials(providerName)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-text-primary">{providerName}</p>
            <p className="truncate text-xs text-text-muted">{providerMeta}</p>
            {provider?.id ? (
              <Link
                to={`/providers/${providerUsername}`}
                className="mt-1 inline-flex rounded-pill border border-border px-2 py-0.5 text-[11px] font-semibold text-brand transition hover:border-brand/40 hover:bg-brand-soft/35"
              >
                {text.viewProfile}
              </Link>
            ) : null}
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
              <span className="inline-flex items-center gap-1 rounded-pill bg-bg-surface px-2 py-0.5">
                <Star className="h-3.5 w-3.5 text-brand" />
                {providerRating}
              </span>
              <span className="inline-flex items-center gap-1 rounded-pill bg-bg-surface px-2 py-0.5">
                <MapPin className="h-3.5 w-3.5 text-brand" />
                {providerCity}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-bg-surface px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
              {text.memberSince}
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-text-primary">
              <UserRound className="h-3.5 w-3.5 text-brand" />
              {providerCreatedAt || text.noData}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-bg-surface px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
              {text.sinceAt}
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-text-primary">
              <CalendarDays className="h-3.5 w-3.5 text-brand" />
              {providerSince || text.noData}
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-2.5">
          {providerPhone && (
            <a
              href={providerPhoneUrl}
              className="inline-flex h-10 w-full items-center justify-between rounded-lg border border-brand/35 bg-linear-to-r from-brand-soft/45 to-bg-surface px-3 text-xs font-semibold text-text-primary transition hover:border-brand hover:from-brand-soft/60"
            >
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-brand" />
                {text.callProvider}
              </span>
              <span className="text-text-secondary">{providerPhone}</span>
            </a>
          )}

          <div className="flex flex-wrap gap-2">
            {providerWebsiteUrl && (
              <a
                href={providerWebsiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 min-w-[8.25rem] flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-bg-surface px-2.5 text-xs font-semibold text-text-secondary transition hover:-translate-y-px hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35"
                title={providerWebsiteUrl}
              >
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 truncate">{providerWebsiteLabel || text.website}</span>
              </a>
            )}

            {providerFacebookUrl && (
              <a
                href={providerFacebookUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 min-w-[8.25rem] flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#1877F2] bg-[#1877F2] px-2.5 text-xs font-semibold text-white transition hover:-translate-y-px hover:bg-[#166FE5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2]/40"
                aria-label={text.facebook}
              >
                <FacebookBrandIcon className="h-3.5 w-3.5 shrink-0" />
                {text.facebook}
              </a>
            )}

            {providerTelegramUrl && (
              <a
                href={providerTelegramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 min-w-[8.25rem] flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#229ED9] bg-[#229ED9] px-2.5 text-xs font-semibold text-white transition hover:-translate-y-px hover:bg-[#1D8BBF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9]/40"
                aria-label={text.telegram}
              >
                <TelegramBrandIcon className="h-3.5 w-3.5 shrink-0" />
                {text.telegram}
              </a>
            )}
          </div>

          {!hasContacts && <span className="text-xs text-text-muted">{text.noContactChannels}</span>}
        </div>
      </div>
    </div>
  );
}
