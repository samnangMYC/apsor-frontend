export function resolveAssetUrl(path) {
  const safePath = String(path || "").trim();

  if (!safePath) {
    return "";
  }

  if (/^(https?:\/\/|data:|blob:)/i.test(safePath)) {
    return safePath;
  }

  const minioEndpoint = String(import.meta.env.VITE_MINIO_ENDPOINT || "").trim().replace(/\/+$/, "");
  const minioBucket = String(import.meta.env.VITE_MINIO_BUCKET || "").trim().replace(/^\/+|\/+$/g, "");
  const normalizedPath = safePath.replace(/^\/+/, "");
  const pathWithBucket =
    minioBucket && !normalizedPath.startsWith(`${minioBucket}/`)
      ? `${minioBucket}/${normalizedPath}`
      : normalizedPath;

  return minioEndpoint ? `${minioEndpoint}/${pathWithBucket}` : `/${pathWithBucket}`;
}

export function appendAssetVersion(url, version) {
  const safeUrl = String(url || "").trim();
  const safeVersion = String(version || "").trim();

  if (!safeUrl || !safeVersion) {
    return safeUrl;
  }

  const separator = safeUrl.includes("?") ? "&" : "?";
  return `${safeUrl}${separator}v=${encodeURIComponent(safeVersion)}`;
}
