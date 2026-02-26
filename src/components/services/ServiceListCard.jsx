import { Link } from "react-router-dom";
import {
  Clock3,
  MapPin,
  Star,
} from "lucide-react";
import { useLang } from "../../i18n/useLang";

function formatRating(avg, count, t) {
  if (!count) return t.newBadge || "New";
  return `${Number(avg || 0).toFixed(1)} (${count})`;
}

function formatModeTag(mode) {
  if (!mode) return "FLEXIBLE";
  return mode.toUpperCase().replaceAll(" ", "_");
}

function getServiceImage(media) {
  const first = media?.[0];
  if (!first) return "";
  return (
    first.url ||
    first.secureUrl ||
    first.thumbnailUrl ||
    first.fileUrl ||
    first.path ||
    ""
  );
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

function formatBillingUnit(priceItem) {
  if (!priceItem) return "unit";
  return (priceItem.billingUnit || "UNIT").toLowerCase();
}

export default function ServiceListCard({
  service,
  to = `/services/${service.slug}`,
  className = "",
}) {
  const { t } = useLang("km");
  const firstAvailability = service.availability?.[0];
  const firstLocation = service.location?.[0];
  const image = getServiceImage(service.media);
  const defaultPrice = getDefaultPrice(service.price);

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

        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-pill bg-black/45 px-2 py-1 text-xs font-semibold text-white backdrop-blur-[1px]">
          <Star className="h-3.5 w-3.5 fill-current" />
          {formatRating(service.ratingAvg, service.ratingCount, t)}
        </div>

        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-pill bg-black/45 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-[1px]">
          <MapPin className="h-3.5 w-3.5" />
          {firstLocation?.city || t.locationPending || "Location pending"}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="line-clamp-1 text-base font-bold text-text-primary">
            {service.title}
          </div>
          <span className="shrink-0 rounded-pill border border-border bg-bg-subtle px-2 py-1 text-[10px] font-semibold tracking-wide text-brand">
            {formatModeTag(service.locationMode)}
          </span>
        </div>

        <p className="mt-1 line-clamp-2 text-sm leading-5 text-text-muted">
          {service.description}
        </p>

        <div className="mt-3 rounded-lg border border-brand/20 bg-linear-to-r from-brand-soft to-transparent p-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                {defaultPrice?.name || "Base Price"}
              </p>
              <p className="mt-1 text-lg font-extrabold leading-none text-brand">
                {formatPrice(defaultPrice)}
              </p>
            </div>
            <div className="rounded-pill bg-bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
              / {formatBillingUnit(defaultPrice)}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-bg-subtle px-2 py-1.5">
            <Clock3 className="h-3.5 w-3.5 text-brand" />
            {firstAvailability
              ? `${firstAvailability.startTime} - ${firstAvailability.endTime}`
              : t.schedulePending || "Schedule pending"}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-md bg-bg-subtle px-2 py-1.5">
            <MapPin className="h-3.5 w-3.5 text-brand" />
            {firstLocation?.city || t.locationPending || "Location pending"}
          </span>
        </div>
      </div>
    </Link>
  );
}
