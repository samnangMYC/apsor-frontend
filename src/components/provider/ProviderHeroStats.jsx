import { ClipboardList, MapPin, Star } from "lucide-react";

export default function ProviderHeroStats({
  city,
  ratingText,
  totalServices = 0,
  totalServicesLabel = "Total services",
  className = "",
}) {
  return (
    <div className={`mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3 ${className}`.trim()}>
      <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-linear-to-br from-brand-soft/60 to-bg-surface px-2.5 py-2 text-xs font-semibold text-text-secondary">
        <MapPin className="h-3.5 w-3.5 text-brand" />
        {city}
      </span>
      <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-linear-to-br from-brand-soft/60 to-bg-surface px-2.5 py-2 text-xs font-semibold text-text-secondary">
        <Star className="h-3.5 w-3.5 text-brand" />
        {ratingText}
      </span>
      <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-linear-to-br from-brand-soft/60 to-bg-surface px-2.5 py-2 text-xs font-semibold text-text-secondary">
        <ClipboardList className="h-3.5 w-3.5 text-brand" />
        {`${totalServicesLabel}: ${totalServices}`}
      </span>
    </div>
  );
}
