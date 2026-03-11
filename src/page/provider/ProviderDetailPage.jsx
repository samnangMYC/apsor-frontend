import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  Globe,
  Hash,
  ImageIcon,
  Phone,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import ProviderHeroStats from "../../components/provider/ProviderHeroStats";
import Breadcrumb from "../../components/shared/Breadcrumb";
import ServiceListCard from "../../components/services/ServiceListCard";
import { DEFAULT_PROVIDERS } from "../../data/defaultProviders";
import { DEFAULT_SERVICES } from "../../data/defaultServices";
import { useLang } from "../../i18n/useLang";
import { matchesProviderUsername } from "../../utils/provider";
import { getServiceImage } from "../../utils/service";

const COVER_FALLBACK =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80";

const UI_TEXT = {
  en: {
    providerProfile: "Provider Profile",
    providerNotFound: "Provider not found",
    providerNotFoundSubtitle: "This provider may be unavailable or no longer active.",
    backHome: "Back to home",
    aboutProvider: "About Provider",
    noProviderBio: "No provider description available.",
    profileInfo: "Profile Information",
    contactChannels: "Contact Channels",
    providerServices: "Provider Services",
    providerServicesSubtitle: "Services currently offered by this provider.",
    profileName: "Profile name",
    businessName: "Business name",
    businessType: "Business type",
    providerId: "Provider ID",
    status: "Status",
    memberSince: "Member since",
    since: "Since",
    updatedAt: "Updated at",
    city: "City",
    rating: "Rating",
    totalServices: "Total services",
    available: "Available",
    unavailable: "Unavailable",
    noData: "N/A",
    noContactChannels: "No contact channels yet",
    website: "Website",
    facebook: "Facebook",
    telegram: "Telegram",
    phone: "Phone",
    profileSnapshot: "Profile Snapshot",
    callProvider: "Call provider",
    viewCover: "View cover photo",
    viewProfile: "View profile photo",
    closePreview: "Close preview",
  },
  km: {
    providerProfile: "ប្រវត្តិរូបអ្នកផ្តល់សេវា",
    providerNotFound: "រកមិនឃើញអ្នកផ្តល់សេវា",
    providerNotFoundSubtitle: "អ្នកផ្តល់សេវានេះអាចមិនមាន ឬលែងសកម្ម។",
    backHome: "ត្រឡប់ទៅទំព័រដើម",
    aboutProvider: "អំពីអ្នកផ្តល់សេវា",
    noProviderBio: "មិនមានពណ៌នាអំពីអ្នកផ្តល់សេវាទេ។",
    profileInfo: "ព័ត៌មានប្រវត្តិរូប",
    contactChannels: "បណ្តាញទំនាក់ទំនង",
    providerServices: "សេវាកម្មរបស់អ្នកផ្តល់សេវា",
    providerServicesSubtitle: "សេវាកម្មដែលអ្នកផ្តល់សេវានេះកំពុងផ្តល់។",
    profileName: "ឈ្មោះប្រវត្តិរូប",
    businessName: "ឈ្មោះអាជីវកម្ម",
    businessType: "ប្រភេទអាជីវកម្ម",
    providerId: "លេខសម្គាល់អ្នកផ្តល់សេវា",
    status: "ស្ថានភាព",
    memberSince: "សមាជិកតាំងពី",
    since: "ចាប់ពី",
    updatedAt: "ធ្វើបច្ចុប្បន្នភាព",
    city: "ទីក្រុង",
    rating: "ការវាយតម្លៃ",
    totalServices: "ចំនួនសេវាកម្ម",
    available: "អាចផ្តល់សេវា",
    unavailable: "មិនអាចផ្តល់សេវា",
    noData: "មិនមានទិន្នន័យ",
    noContactChannels: "មិនទាន់មានបណ្តាញទំនាក់ទំនង",
    website: "វេបសាយ",
    facebook: "Facebook",
    telegram: "Telegram",
    phone: "លេខទូរស័ព្ទ",
    profileSnapshot: "សង្ខេបប្រវត្តិរូប",
    callProvider: "ហៅអ្នកផ្តល់សេវា",
    viewCover: "មើលរូបគម្រប",
    viewProfile: "មើលរូបប្រវត្តិរូប",
    closePreview: "បិទការមើលរូប",
  },
};

function getLocale(lang) {
  return lang === "km" ? "km-KH" : "en-US";
}

function formatBusinessType(value, fallback = "Service provider") {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  return raw
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

function getEstablishedYear(value) {
  if (!value) return "";
  const date = new Date(value);
  const year = date.getFullYear();
  return Number.isFinite(year) ? String(year) : "";
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

function getFacebookUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^www\./i.test(raw) || /facebook\.com\//i.test(raw)) {
    return `https://${raw.replace(/^https?:\/\//i, "")}`;
  }
  return `https://facebook.com/${raw.replace(/^@/, "")}`;
}

function getTelegramUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^t\.me\//i.test(raw)) return `https://${raw}`;
  return `https://t.me/${raw.replace(/^@/, "").replace(/\s+/g, "")}`;
}

function getRatingSummary(services = []) {
  const stats = services.reduce(
    (acc, service) => {
      const count = Number(service?.ratingCount || 0);
      const avg = Number(service?.ratingAvg || 0);
      return {
        totalCount: acc.totalCount + count,
        weightedSum: acc.weightedSum + avg * count,
      };
    },
    { totalCount: 0, weightedSum: 0 },
  );

  return {
    ratingCount: stats.totalCount,
    ratingAvg: stats.totalCount ? stats.weightedSum / stats.totalCount : 0,
  };
}

function formatRating(avg, count, t) {
  if (!count) return t.newBadge || "New";
  return `${Number(avg || 0).toFixed(1)} (${count})`;
}

export default function ProviderDetailPage() {
  const { username } = useParams();
  const { lang, t } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const [previewImage, setPreviewImage] = useState(null);

  const provider = useMemo(
    () => DEFAULT_PROVIDERS.find((item) => matchesProviderUsername(item, username)) || null,
    [username],
  );

  const providerServices = useMemo(
    () => DEFAULT_SERVICES.filter((item) => Number(item?.providerId) === Number(provider?.id)),
    [provider?.id],
  );

  const ratingSummary = useMemo(
    () => getRatingSummary(providerServices),
    [providerServices],
  );

  const providerImages = useMemo(
    () => providerServices.map((item) => getServiceImage(item)).filter(Boolean),
    [providerServices],
  );

  const firstServiceLocation = providerServices.find((item) => item?.location?.[0])?.location?.[0] || null;

  const coverImage = providerImages[0] || COVER_FALLBACK;
  const profileImage = providerImages[1] || providerImages[0] || COVER_FALLBACK;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [username]);

  useEffect(() => {
    if (!previewImage) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewImage]);

  if (!provider) {
    return (
      <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
        <Breadcrumb className="mb-4" />

        <section className="rounded-xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/30 p-6 text-center shadow-1">
          <h1 className="text-xl font-bold text-text-primary">
            {text.providerNotFound}
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            {text.providerNotFoundSubtitle}
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center justify-center rounded-pill bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover"
          >
            {text.backHome}
          </Link>
        </section>
      </main>
    );
  }

  const providerName = provider.displayName || provider.businessName || "Provider";
  const providerMeta = provider.businessName && provider.businessName !== providerName
    ? provider.businessName
    : formatBusinessType(provider.businessType, t.providerTypeFallback || "Service provider");
  const providerBio = provider.bio || text.noProviderBio;
  const providerPhone = getPhoneNumber(provider.phoneNumber || provider.phone);
  const providerPhoneUrl = getPhoneUrl(providerPhone);
  const providerWebsiteUrl = getWebsiteUrl(provider.websiteUrl || provider.website);
  const providerWebsiteLabel = getWebsiteLabel(providerWebsiteUrl);
  const providerFacebookUrl = getFacebookUrl(provider.facebookUrl);
  const providerTelegramUrl = getTelegramUrl(provider.telegram);
  const providerCity = firstServiceLocation?.city || t.locationPending || text.noData;
  const providerMemberSince = formatDate(provider.createdAt, lang);
  const providerSince = getEstablishedYear(provider.establishedAt);
  const providerUpdatedAt = formatDate(provider.updatedAt, lang);
  const providerStatus = provider?.isAvailable ? text.available : text.unavailable;

  return (
    <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
      <Breadcrumb className="mb-4" currentLabel={providerName} />

      <section className="overflow-hidden rounded-2xl border border-border bg-linear-to-b from-bg-surface via-bg-surface to-brand-soft/20 shadow-1">
        <div className="group relative h-56 sm:h-64 md:h-72">
          <button
            type="button"
            onClick={() => setPreviewImage({ src: coverImage, alt: providerName, label: text.viewCover })}
            className="absolute inset-0 z-20 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
            aria-label={text.viewCover}
          />
          <img
            src={coverImage}
            alt={providerName}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/20" />
          <span className="pointer-events-none absolute bottom-3 right-3 z-30 inline-flex items-center gap-1 rounded-pill bg-black/65 px-3 py-1 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
            <ImageIcon className="h-3.5 w-3.5" />
            {text.viewCover}
          </span>
        </div>

        <div className="relative px-4 pb-5 sm:px-5">
          <div className="-mt-10 flex items-end gap-3 sm:-mt-12 sm:gap-4">
            <button
              type="button"
              onClick={() => setPreviewImage({ src: profileImage, alt: providerName, label: text.viewProfile })}
              className="group relative inline-flex h-24 w-24 shrink-0 translate-y-2 cursor-zoom-in overflow-hidden rounded-full border-4 border-bg-surface bg-bg-subtle shadow-1 ring-2 ring-white/70 transition hover:scale-[1.01] sm:h-28 sm:w-28 sm:translate-y-3"
              aria-label={text.viewProfile}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={providerName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="inline-flex  h-full w-full items-center justify-center bg-linear-to-br from-brand-soft to-bg-surface text-2xl font-bold text-brand sm:text-3xl">
                  {getProviderInitials(providerName)}
                </span>
              )}
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/65 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                {text.viewProfile}
              </span>
            </button>
            <div className="min-w-0 pb-1">
              <p className="text-xl font-bold text-text-primary sm:text-2xl">{providerName}</p>
              <p className="text-xs text-text-muted sm:text-sm">{providerMeta}</p>
            </div>
            <span
              className={`ml-auto inline-flex items-center rounded-pill px-2.5 py-1 text-[11px] font-semibold ${
                provider?.isAvailable
                  ? "bg-success/15 text-success"
                  : "bg-danger/15 text-danger"
              }`}
            >
              {providerStatus}
            </span>
          </div>

          <ProviderHeroStats
            city={providerCity}
            ratingText={formatRating(ratingSummary.ratingAvg, ratingSummary.ratingCount, t)}
            totalServices={providerServices.length}
            totalServicesLabel={text.totalServices}
          />
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-4">
          <article className="rounded-xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/20 p-4 shadow-1 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              {text.aboutProvider}
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {providerBio}
            </p>
          </article>

          <article className="rounded-xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/20 p-4 shadow-1 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              {text.profileInfo}
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-border bg-linear-to-br from-bg-subtle to-brand-soft/20 px-3 py-2.5">
                <p className="text-[11px] text-text-muted">{text.profileName}</p>
                <p className="mt-0.5 text-sm font-semibold text-text-primary">{providerName}</p>
              </div>
              <div className="rounded-lg border border-border bg-linear-to-br from-bg-subtle to-brand-soft/20 px-3 py-2.5">
                <p className="text-[11px] text-text-muted">{text.businessName}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-text-primary">
                  <Building2 className="h-3.5 w-3.5 text-brand" />
                  {provider.businessName || text.noData}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-linear-to-br from-bg-subtle to-brand-soft/20 px-3 py-2.5">
                <p className="text-[11px] text-text-muted">{text.businessType}</p>
                <p className="mt-0.5 text-sm font-semibold text-text-primary">
                  {formatBusinessType(provider.businessType, text.noData)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-linear-to-br from-bg-subtle to-brand-soft/20 px-3 py-2.5">
                <p className="text-[11px] text-text-muted">{text.providerId}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-text-primary">
                  <Hash className="h-3.5 w-3.5 text-brand" />
                  {provider.id}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-linear-to-br from-bg-subtle to-brand-soft/20 px-3 py-2.5">
                <p className="text-[11px] text-text-muted">{text.memberSince}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-text-primary">
                  <CalendarDays className="h-3.5 w-3.5 text-brand" />
                  {providerMemberSince || text.noData}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-linear-to-br from-bg-subtle to-brand-soft/20 px-3 py-2.5">
                <p className="text-[11px] text-text-muted">{text.updatedAt}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-text-primary">
                  <Users className="h-3.5 w-3.5 text-brand" />
                  {providerUpdatedAt || text.noData}
                </p>
              </div>
            </div>
          </article>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <article className="rounded-xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/20 p-4 shadow-1 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              {text.contactChannels}
            </p>
            <div className="mt-3 space-y-2">
              {providerPhone && (
                <a
                  href={providerPhoneUrl}
                  className="inline-flex h-10 w-full items-center justify-between rounded-lg border border-brand/35 bg-linear-to-r from-brand-soft/70 to-brand-soft/30 px-3 text-xs font-semibold text-text-primary transition hover:border-brand"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-brand" />
                    {text.callProvider}
                  </span>
                  <span className="text-text-secondary">{providerPhone}</span>
                </a>
              )}
              {providerWebsiteUrl && (
                <a
                  href={providerWebsiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-linear-to-r from-bg-subtle to-brand-soft/20 px-3 text-xs font-semibold text-text-secondary transition hover:border-brand/40 hover:text-brand"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {providerWebsiteLabel || text.website}
                </a>
              )}
              {providerFacebookUrl && (
                <a
                  href={providerFacebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-[#1877F2] bg-[#1877F2] px-3 text-xs font-semibold text-white transition hover:bg-[#166FE5]"
                >
                  {text.facebook}
                </a>
              )}
              {providerTelegramUrl && (
                <a
                  href={providerTelegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-[#229ED9] bg-[#229ED9] px-3 text-xs font-semibold text-white transition hover:bg-[#1D8BBF]"
                >
                  {text.telegram}
                </a>
              )}
              {!providerPhone && !providerWebsiteUrl && !providerFacebookUrl && !providerTelegramUrl ? (
                <div className="rounded-lg border border-dashed border-border-strong bg-linear-to-br from-bg-subtle to-brand-soft/20 p-3 text-center text-xs text-text-muted">
                  {text.noContactChannels}
                </div>
              ) : null}
            </div>
          </article>

          <article className="rounded-xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/20 p-4 shadow-1 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              {text.profileSnapshot}
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-border bg-linear-to-r from-bg-subtle to-brand-soft/20 px-3 py-2">
                <span className="text-text-muted">{text.status}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-text-primary">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand" />
                  {providerStatus}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-linear-to-r from-bg-subtle to-brand-soft/20 px-3 py-2">
                <span className="text-text-muted">{text.since}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-text-primary">
                  <CalendarDays className="h-3.5 w-3.5 text-brand" />
                  {providerSince || text.noData}
                </span>
              </div>
            </div>
          </article>
        </aside>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-linear-to-br from-bg-surface via-bg-surface to-brand-soft/20 p-4 shadow-1 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
          {t.services || "Services"}
        </p>
        <h2 className="mt-1 text-lg font-bold text-text-primary sm:text-xl">
          {text.providerServices}
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          {text.providerServicesSubtitle}
        </p>

        {providerServices.length ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {providerServices.map((service) => (
              <ServiceListCard key={service.id || service.publicId} service={service} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-border-strong bg-linear-to-br from-bg-subtle to-brand-soft/20 p-6 text-center text-sm text-text-muted">
            {t.noServicesFound || "No services found."}
          </div>
        )}
      </section>

      {previewImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={previewImage.label}
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white transition hover:bg-black/70"
            onClick={() => setPreviewImage(null)}
            aria-label={text.closePreview}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="max-h-[92vh] max-w-[96vw]" onClick={(event) => event.stopPropagation()}>
            <img
              src={previewImage.src}
              alt={previewImage.alt}
              className="max-h-[86vh] w-auto max-w-[96vw] rounded-xl object-contain shadow-2xl"
            />
            <p className="mt-2 text-center text-xs font-semibold text-white/90">
              {previewImage.label}
            </p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
