export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function isUsername(value) {
  return /^[a-zA-Z0-9._-]{3,}$/.test(String(value || "").trim());
}

export function normalizeIdentifier(value) {
  return String(value || "").trim();
}

export function validateIdentifier(value) {
  const safeValue = normalizeIdentifier(value);

  if (!safeValue) {
    return false;
  }

  if (safeValue.includes("@")) {
    return isEmail(safeValue);
  }

  return isUsername(safeValue);
}

export function buildSignInPayload(identifier, password) {
  return {
    username: normalizeIdentifier(identifier),
    password: String(password || "").trim(),
  };
}

export function isStrongPassword(value) {
  const safeValue = String(value || "");

  return (
    safeValue.length >= 8
    && /[a-z]/.test(safeValue)
    && /[A-Z]/.test(safeValue)
    && /\d/.test(safeValue)
    && /[^A-Za-z0-9]/.test(safeValue)
  );
}

export function getPostSignInPath() {
  return "/";
}

export function extractAuthErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message
    || error?.response?.data?.error
    || error?.message
    || fallbackMessage
  );
}
