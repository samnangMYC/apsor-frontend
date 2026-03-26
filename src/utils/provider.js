import { appendAssetVersion, resolveAssetUrl } from "./assets";
import { getMediaUrl } from "./service";

function normalizeProviderKey(value) {
  return String(value || "").trim().toLowerCase();
}

function slugifyProviderName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toMediaRecord(value) {
  if (!value) return null;

  if (typeof value === "string") {
    return { url: value };
  }

  if (typeof value !== "object") {
    return null;
  }

  return value.media && typeof value.media === "object" ? value.media : value;
}

function isAvatarWrapper(value) {
  return String(value?.purpose || "").trim().toUpperCase() === "AVATAR";
}

function getAvatarWrappers(provider) {
  return [
    provider?.media,
    provider?.providerMedia,
    provider?.avatarMedia,
    provider?.profileMedia,
    provider?.user?.media,
    provider?.user?.providerMedia,
    provider?.user?.avatarMedia,
    provider?.user?.profileMedia,
  ]
    .flatMap((item) => (Array.isArray(item) ? item : [item]))
    .filter((item) => item && typeof item === "object");
}

function getAvatarMediaRecords(provider) {
  const wrappers = getAvatarWrappers(provider);
  const preferredWrappers = wrappers.filter(isAvatarWrapper);
  const candidates = preferredWrappers.length ? preferredWrappers : wrappers;

  return candidates
    .map(toMediaRecord)
    .filter(Boolean);
}

function collectProviderMedia(provider) {
  return [
    ...getAvatarMediaRecords(provider),
    provider?.avatar,
    provider?.profileImage,
    provider?.image,
    provider?.media,
    provider?.providerMedia,
    provider?.avatarMedia,
    provider?.profileMedia,
    provider?.user?.avatar,
    provider?.user?.profileImage,
    provider?.user?.image,
    provider?.user?.media,
    provider?.user?.providerMedia,
    provider?.user?.avatarMedia,
    provider?.user?.profileMedia,
  ]
    .flatMap((item) => (Array.isArray(item) ? item : [item]))
    .map(toMediaRecord)
    .filter(Boolean);
}

export function getProviderUsername(provider) {
  const explicit = normalizeProviderKey(
    provider?.username
    || provider?.userName
    || provider?.user?.username,
  );
  if (explicit) return explicit;

  const slug = slugifyProviderName(provider?.displayName || provider?.businessName);
  if (slug) return slug;

  const fallbackId = normalizeProviderKey(provider?.id);
  return fallbackId ? `provider-${fallbackId}` : "provider";
}

export function matchesProviderUsername(provider, username) {
  const target = normalizeProviderKey(username);
  if (!target) return false;

  if (getProviderUsername(provider) === target) return true;

  // Backward compatibility for old numeric provider URLs.
  return normalizeProviderKey(provider?.id) === target;
}

export function getProviderProfileImage(provider) {
  const mediaCandidates = [
    ...collectProviderMedia(provider),
    provider?.avatarUrl,
    provider?.profileImageUrl,
    provider?.imageUrl,
    provider?.user?.avatarUrl,
    provider?.user?.profileImageUrl,
    provider?.user?.imageUrl,
  ]
    .map(toMediaRecord)
    .filter(Boolean);

  const resolvedMediaUrl = mediaCandidates
    .map((item) => getMediaUrl(item))
    .find(Boolean);

  if (resolvedMediaUrl) {
    return resolvedMediaUrl;
  }

  const avatarWrapper = getAvatarWrappers(provider).find(isAvatarWrapper) || getAvatarWrappers(provider)[0];
  const objectKey = provider?.avatarObjectKey
    || provider?.profileImageObjectKey
    || avatarWrapper?.objectKey
    || avatarWrapper?.media?.objectKey
    || provider?.user?.avatarObjectKey
    || provider?.user?.profileImageObjectKey
    || "";
  const version = provider?.updatedAt
    || provider?.createdAt
    || avatarWrapper?.updatedAt
    || avatarWrapper?.createdAt
    || avatarWrapper?.media?.updatedAt
    || avatarWrapper?.media?.createdAt
    || provider?.user?.updatedAt
    || provider?.user?.createdAt
    || "";

  const directUrl = provider?.avatarUrl
    || provider?.profileImageUrl
    || provider?.imageUrl
    || avatarWrapper?.url
    || avatarWrapper?.media?.url
    || provider?.user?.avatarUrl
    || provider?.user?.profileImageUrl
    || provider?.user?.imageUrl
    || "";

  return appendAssetVersion(resolveAssetUrl(directUrl || objectKey), version);
}

export function hasProviderAvatar(provider) {
  return Boolean(
    collectProviderMedia(provider).length
    || provider?.avatar
    || provider?.profileImage
    || provider?.image
    || provider?.media
    || provider?.providerMedia
    || provider?.avatarMedia
    || provider?.profileMedia
    || provider?.avatarUrl
    || provider?.profileImageUrl
    || provider?.imageUrl
    || provider?.avatarObjectKey
    || provider?.profileImageObjectKey
    || provider?.user?.avatar
    || provider?.user?.profileImage
    || provider?.user?.image
    || provider?.user?.media
    || provider?.user?.providerMedia
    || provider?.user?.avatarMedia
    || provider?.user?.profileMedia
    || provider?.user?.avatarUrl
    || provider?.user?.profileImageUrl
    || provider?.user?.imageUrl
    || provider?.user?.avatarObjectKey
    || provider?.user?.profileImageObjectKey,
  );
}

export function getProviderAvatarUploadId(provider) {
  const avatarWrapper = getAvatarWrappers(provider).find(isAvatarWrapper) || getAvatarWrappers(provider)[0];

  return (
    provider?.avatarId
    || provider?.profileImageId
    || provider?.imageId
    || provider?.mediaId
    || provider?.providerMediaId
    || provider?.avatarMediaId
    || avatarWrapper?.providerMediaId
    || avatarWrapper?.avatarMediaId
    || avatarWrapper?.profileMediaId
    || avatarWrapper?.id
    || avatarWrapper?.media?.id
    || provider?.id
    || null
  );
}
