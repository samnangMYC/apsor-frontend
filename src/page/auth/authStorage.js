const STORAGE_KEYS = {
  authSession: "apsor:authSession",
  currentUser: "apsor:currentUser",
  accessToken: "apsor:accessToken",
  refreshToken: "apsor:refreshToken",
  lastSigninAt: "apsor:lastSigninAt",
  lastSigninIdentifier: "apsor:lastSigninIdentifier",
  lastSigninEmail: "apsor:lastSigninEmail",
};

export const AUTH_STORAGE_EVENT = "apsor:auth-storage-change";

function getStorage(remember) {
  return remember ? localStorage : sessionStorage;
}

function emitAuthStorageChange() {
  window.dispatchEvent(new CustomEvent(AUTH_STORAGE_EVENT));
}

function clearAuthStorage() {
  sessionStorage.removeItem(STORAGE_KEYS.authSession);
  sessionStorage.removeItem(STORAGE_KEYS.currentUser);
  sessionStorage.removeItem(STORAGE_KEYS.accessToken);
  sessionStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.authSession);
  localStorage.removeItem(STORAGE_KEYS.currentUser);
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
}

export function clearStoredAuth() {
  clearAuthStorage();
  sessionStorage.removeItem(STORAGE_KEYS.lastSigninAt);
  emitAuthStorageChange();
}

function clearStoredSessionTokens() {
  sessionStorage.removeItem(STORAGE_KEYS.authSession);
  sessionStorage.removeItem(STORAGE_KEYS.accessToken);
  sessionStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.authSession);
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
}

function extractToken(session, keys) {
  for (const key of keys) {
    const value = session?.[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

export function persistAuthSession(session, remember = false) {
  const storage = getStorage(remember);
  const accessToken = extractToken(session, ["accessToken", "token", "access_token"]);
  const refreshToken = extractToken(session, ["refreshToken", "refresh_token"]);

  clearAuthStorage();
  storage.setItem(STORAGE_KEYS.authSession, JSON.stringify(session));

  if (accessToken) {
    storage.setItem(STORAGE_KEYS.accessToken, accessToken);
  }

  if (refreshToken) {
    storage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  }

  sessionStorage.setItem(STORAGE_KEYS.lastSigninAt, new Date().toISOString());
  emitAuthStorageChange();
}

export function persistCurrentUser(user, remember = false) {
  const storage = getStorage(remember);
  storage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  emitAuthStorageChange();
}

export function getStoredCurrentUser() {
  const localValue = localStorage.getItem(STORAGE_KEYS.currentUser);
  const sessionValue = sessionStorage.getItem(STORAGE_KEYS.currentUser);
  const raw = localValue || sessionValue;

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getStoredAccessToken() {
  return (
    localStorage.getItem(STORAGE_KEYS.accessToken)
    || sessionStorage.getItem(STORAGE_KEYS.accessToken)
    || ""
  );
}

export function getStoredRefreshToken() {
  return (
    localStorage.getItem(STORAGE_KEYS.refreshToken)
    || sessionStorage.getItem(STORAGE_KEYS.refreshToken)
    || ""
  );
}

export function getStoredAuthSession() {
  const raw =
    localStorage.getItem(STORAGE_KEYS.authSession)
    || sessionStorage.getItem(STORAGE_KEYS.authSession);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function hasRememberedAuthSession() {
  return Boolean(localStorage.getItem(STORAGE_KEYS.authSession));
}

export function persistRefreshedAuthSession(sessionPatch, remember = hasRememberedAuthSession()) {
  const currentSession = getStoredAuthSession();
  const nextSession = {
    ...(currentSession && typeof currentSession === "object" ? currentSession : {}),
    ...(sessionPatch && typeof sessionPatch === "object" ? sessionPatch : {}),
  };
  const storage = getStorage(remember);
  const accessToken = extractToken(nextSession, ["accessToken", "token", "access_token"]);
  const refreshToken = extractToken(nextSession, ["refreshToken", "refresh_token"]);

  clearStoredSessionTokens();
  storage.setItem(STORAGE_KEYS.authSession, JSON.stringify(nextSession));

  if (accessToken) {
    storage.setItem(STORAGE_KEYS.accessToken, accessToken);
  }

  if (refreshToken) {
    storage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  }

  emitAuthStorageChange();
}

export function persistRememberedIdentifier(identifier, isEmailIdentifier) {
  sessionStorage.setItem(STORAGE_KEYS.lastSigninIdentifier, identifier);

  if (isEmailIdentifier) {
    sessionStorage.setItem(STORAGE_KEYS.lastSigninEmail, identifier);
  }

  emitAuthStorageChange();
}

export function clearRememberedIdentifier() {
  sessionStorage.removeItem(STORAGE_KEYS.lastSigninIdentifier);
  sessionStorage.removeItem(STORAGE_KEYS.lastSigninEmail);
  emitAuthStorageChange();
}

export function getRememberedIdentifier() {
  return (
    sessionStorage.getItem(STORAGE_KEYS.lastSigninIdentifier)
    || sessionStorage.getItem(STORAGE_KEYS.lastSigninEmail)
    || ""
  );
}

export function readStoredAuthDebug() {
  return {
    sessionStorage: {
      authSession: sessionStorage.getItem(STORAGE_KEYS.authSession),
      currentUser: sessionStorage.getItem(STORAGE_KEYS.currentUser),
      accessToken: sessionStorage.getItem(STORAGE_KEYS.accessToken),
      refreshToken: sessionStorage.getItem(STORAGE_KEYS.refreshToken),
    },
    localStorage: {
      authSession: localStorage.getItem(STORAGE_KEYS.authSession),
      currentUser: localStorage.getItem(STORAGE_KEYS.currentUser),
      accessToken: localStorage.getItem(STORAGE_KEYS.accessToken),
      refreshToken: localStorage.getItem(STORAGE_KEYS.refreshToken),
    },
  };
}
