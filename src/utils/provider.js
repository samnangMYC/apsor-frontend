import { appendAssetVersion, resolveAssetUrl } from "./assets";

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

function resolveProviderImageUrl(url, version = "") {
  const raw = String(url || "").trim();
  if (!raw) return "";

  return appendAssetVersion(resolveAssetUrl(raw), version);
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
  const version = provider?.updatedAt
    || provider?.createdAt
    || provider?.user?.updatedAt
    || provider?.user?.createdAt
    || "";
  const imageUrl = provider?.imageUrl || provider?.user?.imageUrl || "";

  return resolveProviderImageUrl(imageUrl, version);
}

export function hasProviderAvatar(provider) {
  return Boolean(provider?.imageUrl || provider?.user?.imageUrl);
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
