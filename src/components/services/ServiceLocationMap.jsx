function getDefaultLocation(service) {
  const locations = Array.isArray(service?.location) ? service.location : [];
  return locations.find((item) => item?.isDefault) || locations[0] || null;
}

function getAddressText(location) {
  return [
    location?.line1,
    location?.district,
    location?.city,
    location?.province,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function ServiceLocationMap({ service, className = "" }) {
  const location = getDefaultLocation(service);
  const latitude = Number(location?.latitude);
  const longitude = Number(location?.longitude);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const addressText = getAddressText(location);
  const mapQuery = hasCoordinates
    ? `${latitude},${longitude}`
    : addressText || "Phnom Penh";
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`;

  return (
    <article className={`overflow-hidden rounded-xl border border-border bg-bg-surface p-3 shadow-1 sm:p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-text-primary sm:text-base">Location Map</h2>
        {location?.city && <span className="text-xs text-text-muted">{location.city}</span>}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-bg-subtle">
        <iframe
          title={`Google map for ${service?.title || "service location"}`}
          src={mapSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-56 w-full border-0 sm:h-64"
          allowFullScreen
        />
      </div>

      {addressText && <p className="mt-2 text-xs text-text-secondary">{addressText}</p>}
    </article>
  );
}
