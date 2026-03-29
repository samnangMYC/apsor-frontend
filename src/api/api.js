import Axios from "axios";
import {
  clearStoredAuth,
  getStoredAccessToken,
  getStoredRefreshToken,
  persistRefreshedAuthSession,
} from "../page/auth/authStorage";

function getApiBaseUrl() {
  const configuredBaseUrl = String(import.meta.env.VITE_BACKEND_URL || "").trim();
  if (!configuredBaseUrl) {
    return configuredBaseUrl;
  }

  try {
    const parsedUrl = new URL(configuredBaseUrl);
    const currentHost = typeof window !== "undefined" ? window.location.hostname : "";
    const isLocalhost =
      parsedUrl.hostname === "localhost"
      || parsedUrl.hostname === "127.0.0.1"
      || parsedUrl.hostname === "::1";

    if (currentHost && isLocalhost && currentHost !== "localhost" && currentHost !== "127.0.0.1") {
      parsedUrl.hostname = currentHost;
    }

    return parsedUrl.toString().replace(/\/$/, "");
  } catch {
    return configuredBaseUrl;
  }
}

const REFRESH_ENDPOINT = "/api/v1/auth/refresh";
const AUTH_ENDPOINTS_TO_SKIP = new Set([
  "/api/v1/auth/signin",
  "/api/v1/auth/signup",
  "/api/v1/auth/signout",
  REFRESH_ENDPOINT,
]);

const axios = Axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const refreshClient = Axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axios.interceptors.request.use((config) => {
  const accessToken = getStoredAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let refreshPromise = null;

function getRequestUrl(config) {
  return typeof config?.url === "string" ? config.url : "";
}

function shouldSkipRefresh(url) {
  return AUTH_ENDPOINTS_TO_SKIP.has(url);
}

async function refreshAccessToken() {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }

  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post(REFRESH_ENDPOINT, { refreshToken })
      .then(({ data }) => {
        persistRefreshedAuthSession(data);
        return data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function refreshAuthSession() {
  return refreshAccessToken();
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    const requestUrl = getRequestUrl(originalRequest);

    if (
      status !== 401
      || !originalRequest
      || originalRequest._retry
      || shouldSkipRefresh(requestUrl)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshedSession = await refreshAccessToken();
      const nextAccessToken =
        refreshedSession?.accessToken
        || refreshedSession?.token
        || refreshedSession?.access_token
        || getStoredAccessToken();

      if (nextAccessToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      }

      return axios(originalRequest);
    } catch (refreshError) {
      clearStoredAuth();
      return Promise.reject(refreshError);
    }
  },
);

export default axios;
