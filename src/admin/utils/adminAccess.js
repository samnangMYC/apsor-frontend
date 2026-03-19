function normalizeUserType(user) {
  return String(user?.userType || user?.role || "")
    .trim()
    .toUpperCase();
}

export function isAdminUser(user) {
  return normalizeUserType(user) === "ADMIN";
}

export function isProviderUser(user) {
  return normalizeUserType(user) === "PROVIDER";
}

export function canAccessAdminDashboard(user) {
  return isAdminUser(user) || isProviderUser(user);
}

export function getDefaultAdminRoute(user) {
  if (isAdminUser(user) || isProviderUser(user)) {
    return "/admin/dashboard";
  }

  return "/";
}

export function canAccessAdminPath(user, pathname = "") {
  if (isAdminUser(user)) {
    return true;
  }

  if (isProviderUser(user)) {
    return pathname === "/admin/dashboard"
      || pathname.startsWith("/admin/service");
  }

  return false;
}
