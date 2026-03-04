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
  const explicit = normalizeProviderKey(provider?.username || provider?.userName);
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
