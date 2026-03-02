function normalizeKey(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function trimSlashes(value) {
  return String(value || "").replace(/^\/+|\/+$/g, "");
}

function resolveObjectKeyUrl(media) {
  const objectKey = trimSlashes(media?.objectKey);
  if (!objectKey) return "";

  const rawBase = (import.meta.env.VITE_MEDIA_BASE_URL || "").trim();
  if (rawBase) {
    if (rawBase.startsWith("http://") || rawBase.startsWith("https://")) {
      return `${rawBase.replace(/\/+$/g, "")}/${objectKey}`;
    }
    return `/${trimSlashes(rawBase)}/${objectKey}`;
  }

  const bucket = trimSlashes(media?.bucket);
  if (bucket) return `/${bucket}/${objectKey}`;

  return `/${objectKey}`;
}

export function getServiceMediaItems(service) {
  const assets = Array.isArray(service?.assets)
    ? [...service.assets]
        .filter((item) => item?.media)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map((item) => item.media)
    : [];
  const media = Array.isArray(service?.media) ? service.media : [];
  return [...assets, ...media];
}

export function getMediaUrl(media) {
  if (!media) return "";
  return (
    media.url ||
    media.secureUrl ||
    media.thumbnailUrl ||
    media.fileUrl ||
    media.path ||
    media.publicUrl ||
    media.cdnUrl ||
    resolveObjectKeyUrl(media) ||
    ""
  );
}

export function getServiceImage(service) {
  const first = getServiceMediaItems(service)[0];
  return getMediaUrl(first);
}

export function getServiceRouteKey(service) {
  return (
    normalizeKey(service?.slug) ||
    normalizeKey(service?.publicId) ||
    normalizeKey(service?.id)
  );
}

export function getServicePath(service) {
  const key = getServiceRouteKey(service);
  return key ? `/services/${encodeURIComponent(key)}` : "/services";
}

export function matchesServiceKey(service, key) {
  const target = normalizeKey(key);
  if (!target) return false;
  return (
    normalizeKey(service?.slug) === target ||
    normalizeKey(service?.publicId) === target ||
    normalizeKey(service?.id) === target
  );
}
