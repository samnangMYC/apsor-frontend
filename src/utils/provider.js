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
    provider?.imageUrl,
  ];

  const resolvedMediaUrl = mediaCandidates
    .map((item) => getMediaUrl(item))
    .find(Boolean);

  if (resolvedMediaUrl) {
    return resolvedMediaUrl;
  }

  const objectKey = provider?.avatarObjectKey
    || provider?.profileImageObjectKey
    || provider?.user?.avatarObjectKey
    || "";
  const version = provider?.updatedAt
    || provider?.createdAt
    || provider?.user?.updatedAt
    || provider?.user?.createdAt
    || "";

  const directUrl = provider?.avatarUrl
    || provider?.profileImageUrl
    || provider?.imageUrl
    || provider?.user?.avatarUrl
    || provider?.user?.imageUrl
    || "";

  return appendAssetVersion(resolveAssetUrl(directUrl || objectKey), version);
}

export function hasProviderAvatar(provider) {
  return Boolean(
    provider?.avatarUrl
    || provider?.profileImageUrl
    || provider?.imageUrl
    || provider?.avatarObjectKey
    || provider?.profileImageObjectKey
    || provider?.user?.avatarUrl
    || provider?.user?.imageUrl
    || provider?.user?.avatarObjectKey,
  );
}

export function getProviderAvatarUploadId(provider) {
  return (
    provider?.avatarId
    || provider?.profileImageId
    || provider?.imageId
    || provider?.mediaId
    || provider?.providerMediaId
    || provider?.avatarMediaId
    || provider?.id
    || null
  );
}
