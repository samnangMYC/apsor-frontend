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

function resolveDirectMediaUrl(value, version) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  return appendAssetVersion(resolveAssetUrl(raw), version);
}

function toCoordinateNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

export const DEFAULT_SERVICE_CENTER_POINT = Object.freeze({
  lat: 11.5564,
  lng: 104.9282,
});

export function getDistanceKm(a, b) {
  const aLat = toCoordinateNumber(a?.lat);
  const aLng = toCoordinateNumber(a?.lng);
  const bLat = toCoordinateNumber(b?.lat);
  const bLng = toCoordinateNumber(b?.lng);

  if (aLat === null || aLng === null || bLat === null || bLng === null) {
    return Number.POSITIVE_INFINITY;
  }

  const earthRadiusKm = 6371;
  const latDiff = toRadians(bLat - aLat);
  const lngDiff = toRadians(bLng - aLng);
  const lat1 = toRadians(aLat);
  const lat2 = toRadians(bLat);

  const value =
    Math.sin(latDiff / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lngDiff / 2) ** 2;
  const angle = 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));

  return earthRadiusKm * angle;
}

export function getServiceDistanceKm(
  service,
  centerPoint = DEFAULT_SERVICE_CENTER_POINT,
) {
  const locations = Array.isArray(service?.location) ? service.location : [];
  const firstValidLocation = locations.find(
    (item) =>
      toCoordinateNumber(item?.latitude) !== null &&
      toCoordinateNumber(item?.longitude) !== null,
  );

  if (!firstValidLocation) {
    return Number.POSITIVE_INFINITY;
  }

  return getDistanceKm(centerPoint, {
    lat: firstValidLocation.latitude,
    lng: firstValidLocation.longitude,
  });
}

export function sortServicesByPopularity(services = []) {
  return [...services].sort((a, b) => {
    const countGap = Number(b?.ratingCount || 0) - Number(a?.ratingCount || 0);
    if (countGap !== 0) return countGap;
    return Number(b?.ratingAvg || 0) - Number(a?.ratingAvg || 0);
  });
}

export function sortServicesByDistance(
  services = [],
  centerPoint = DEFAULT_SERVICE_CENTER_POINT,
) {
  return [...services]
    .map((service) => ({
      service,
      distanceKm: getServiceDistanceKm(service, centerPoint),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
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

  const version = media?.updatedAt || media?.createdAt;

  return (
    resolveDirectMediaUrl(media.url, version) ||
    resolveDirectMediaUrl(media.secureUrl, version) ||
    resolveDirectMediaUrl(media.thumbnailUrl, version) ||
    resolveDirectMediaUrl(media.fileUrl, version) ||
    resolveDirectMediaUrl(media.path, version) ||
    resolveDirectMediaUrl(media.publicUrl, version) ||
    resolveDirectMediaUrl(media.cdnUrl, version) ||
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
