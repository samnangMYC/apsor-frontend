import { appendAssetVersion, resolveAssetUrl } from "./assets";

function normalizeKey(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function trimSlashes(value) {
  return String(value || "").replace(/^\/+|\/+$/g, "");
}

function toMediaRecord(value) {
  if (!value || typeof value !== "object") return null;
  return value.media && typeof value.media === "object" ? value.media : value;
}

function resolveObjectKeyUrl(media) {
  const objectKey = trimSlashes(media?.objectKey);
  if (!objectKey) return "";
  const version = media?.updatedAt || media?.createdAt;
  return appendAssetVersion(resolveAssetUrl(objectKey), version);
}

export function getServiceMediaItems(service) {
  const assets = Array.isArray(service?.assets)
    ? [...service.assets]
        .filter((item) => item?.media)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map((item) => item.media)
    : [];
  const serviceMedia = Array.isArray(service?.serviceMedia)
    ? [...service.serviceMedia]
        .filter((item) => item?.media)
        .sort((a, b) => (a?.sortOrder || 0) - (b?.sortOrder || 0))
        .map((item) => item.media)
    : [];
  const media = Array.isArray(service?.media)
    ? service.media.map(toMediaRecord).filter(Boolean)
    : [];
  const topLevelMedia = [
    service?.thumbnail,
    service?.image,
    service?.imageUrl,
    service?.thumbnailUrl,
    service?.coverImage,
    service?.coverImageUrl,
  ]
    .map((item) => (typeof item === "string" ? { url: item } : toMediaRecord(item)))
    .filter(Boolean);

  return [...assets, ...serviceMedia, ...media, ...topLevelMedia];
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
  const firstResolvedMedia = getServiceMediaItems(service)
    .map(getMediaUrl)
    .find(Boolean);

  if (firstResolvedMedia) {
    return firstResolvedMedia;
  }

  return (
    getMediaUrl(toMediaRecord(service?.media)) ||
    getMediaUrl(toMediaRecord(service?.image)) ||
    getMediaUrl(toMediaRecord(service?.thumbnail)) ||
    ""
  );
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
