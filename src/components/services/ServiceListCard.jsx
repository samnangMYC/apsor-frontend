import { Link } from "react-router-dom";
import {
  Briefcase,
  CalendarDays,
  Clock3,
  Heart,
  MapPin,
  Star,
  Tag,
} from "lucide-react";
import { useLang } from "../../i18n/useLang";
import { getServiceImage, getServicePath } from "../../utils/service";
import { formatBillingUnitWithPer } from "../../utils/pricing";

function formatRating(avg, count, t) {
  if (!count) return t.newBadge || "New";
  return `${Number(avg || 0).toFixed(1)} (${count})`;
}

function formatModeTag(mode) {
  if (!mode) return "FLEXIBLE";
  return mode.toUpperCase().replaceAll(" ", "_");
}

function getDefaultPrice(priceList) {
  if (!Array.isArray(priceList) || !priceList.length) return null;
  return priceList.find((item) => item.isDefault) || priceList[0];
}

function formatPrice(priceItem) {
  if (!priceItem) return "--";
  const amount = Number(priceItem.amount || 0);
  const currency = priceItem.currency || "USD";
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
  return formatted;
}

function getBillingUnitIcon(unit) {
  switch (String(unit || "").toUpperCase()) {
    case "SESSION":
    case "HOUR":
      return Clock3;
    case "DAY":
    case "WEEK":
    case "MONTH":
    case "YEAR":
      return CalendarDays;
    case "JOB":
      return Briefcase;
    case "ITEM":
    case "PACKAGE":
    default:
      return Tag;
  }
}

function getBillingUnitMeta(priceItem, t) {
  const unit = priceItem?.billingUnit || "UNIT";
  return {
    icon: getBillingUnitIcon(unit),
    label: formatBillingUnitWithPer(unit, t),
  };
}

function formatSchedule(availability, t) {
  if (!availability) return t.schedulePending || "Schedule pending";
  if (!availability.startTime || !availability.endTime) {
    return t.schedulePending || "Schedule pending";
  }
  return `${availability.startTime} - ${availability.endTime}`;
}

export default function ServiceListCard({
  service,
  to = getServicePath(service),
  className = "",
  badgeText,
  distanceKm,
  showBadge = true,
}) {
  const { t } = useLang("km");
  const firstAvailability = service.availability?.[0];
  const firstLocation = service.location?.[0];
  const image = getServiceImage(service);
  const defaultPrice = getDefaultPrice(service.price);
  const { icon: BillingUnitIcon, label: billingUnitLabel } = getBillingUnitMeta(
    defaultPrice,
    t
  );

  return (
    <Link
      to={to}
      aria-label={service.title}
      className={[
        "group relative block overflow-hidden rounded-xl border border-border bg-bg-surface shadow-1 transition duration-200 hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface",
        className,
      ].join(" ")}
    >
      <div className="relative h-36 overflow-hidden bg-bg-subtle">
        {image ? (
          <img
            src={image}
            alt={service.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="relative h-full w-full bg-linear-to-br from-brand via-bg-subtle to-bg-surface" />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />

        {showBadge ? (
          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-pill bg-linear-to-r from-brand to-brand-hover px-2 py-1 text-[10px] font-semibold text-white shadow-1 ring-1 ring-white/25 sm:px-2.5 sm:text-[11px]">
            {Number.isFinite(distanceKm) ? (
              <MapPin className="h-3 w-3 text-white sm:h-3.5 sm:w-3.5" />

            ) : (
              <Heart className="h-3 w-3 fill-current sm:h-3.5 sm:w-3.5" />
            )}

            {badgeText || t.popularServiceBadge || "Popular Service"}
          </div>
        ) : null}

        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-pill bg-black/45 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-[1px] sm:text-xs">
          <Star className="h-3 w-3 fill-current sm:h-3.5 sm:w-3.5" />
          {formatRating(service.ratingAvg, service.ratingCount, t)}
        </div>

      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="line-clamp-1 text-sm font-bold text-text-primary sm:text-base lg:text-lg">
              {service.title}
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-text-muted sm:text-xs">

              <MapPin className="h-3 w-3 text-brand sm:h-3.5 sm:w-3.5" />
              {firstLocation?.city || t.locationPending || "Location pending"}
              {Number.isFinite(distanceKm) && (
                <span>{`• ${distanceKm.toFixed(1)} ${t.kmUnit || "km"} ${t.fromYou || "from you"}`}</span>
              )}
            </div>
          </div>
          <span className="shrink-0 rounded-pill border border-border bg-bg-subtle px-2 py-1 text-[9px] font-semibold tracking-wide text-brand sm:text-[10px]">
            {formatModeTag(service.locationMode)}
          </span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-text-muted sm:text-[10px]">
              {defaultPrice?.name || "Base Price"}
            </p>
            <p className="mt-1 text-base font-extrabold leading-none text-brand sm:text-lg">
              {formatPrice(defaultPrice)}
            </p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-pill border border-brand/20 bg-brand-soft/50 px-2.5 py-1 text-[9px] font-semibold text-brand sm:text-[10px]">
            <BillingUnitIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="capitalize">{billingUnitLabel}</span>
          </div>
        </div>

        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-bg-subtle px-2 py-1.5 text-[11px] text-text-secondary sm:text-xs">
            <Clock3 className="h-3 w-3 text-brand sm:h-3.5 sm:w-3.5" />
            <span className="font-medium text-text-primary">
              {formatSchedule(firstAvailability, t)}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
