import { DEFAULT_ORDERS } from "../data/defaultOrders";
import { DEFAULT_SERVICES } from "../data/defaultServices";
import { getServicePath } from "./service";

export const ORDERS_STORAGE_KEY = "apsor:orders";
export const ORDERS_EVENT = "apsor:orders";

function isBrowser() {
  return typeof window !== "undefined";
}

function derivePaymentStatus(order) {
  const normalized = String(order?.paymentStatus || "").toUpperCase();
  if (normalized) return normalized;

  const paymentMethod = String(order?.paymentMethod || "").toUpperCase();
  if (paymentMethod === "CASH") return "PAY_LATER";
  return "PAID";
}

function normalizeOrderStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  if (normalized === "DONE") return "COMPLETED";
  if (normalized === "CANCELLED") return "CANCELED";
  return normalized || "PENDING";
}

function normalizeOrder(order) {
  return {
    ...order,
    id: String(order?.id || ""),
    amount: Number(order?.amount || 0),
    currency: String(order?.currency || "USD").toUpperCase(),
    status: normalizeOrderStatus(order?.status),
    paymentStatus: derivePaymentStatus(order),
    items: Array.isArray(order?.items) ? order.items : [],
  };
}

const DEFAULT_NORMALIZED_ORDERS = DEFAULT_ORDERS.map(normalizeOrder).sort(sortOrdersDesc);
let cachedStoredRaw = null;
let cachedStoredOrders = [];
let cachedAllOrdersSource = null;
let cachedAllOrders = DEFAULT_NORMALIZED_ORDERS;

function sortOrdersDesc(a, b) {
  return new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime();
}

export function getStoredOrders() {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw === cachedStoredRaw) return cachedStoredOrders;
    if (!raw) {
      cachedStoredRaw = raw;
      cachedStoredOrders = [];
      return cachedStoredOrders;
    }

    const parsed = JSON.parse(raw);
    cachedStoredRaw = raw;
    cachedStoredOrders = Array.isArray(parsed) ? parsed.map(normalizeOrder).sort(sortOrdersDesc) : [];
    return cachedStoredOrders;
  } catch {
    cachedStoredRaw = null;
    cachedStoredOrders = [];
    return cachedStoredOrders;
  }
}

export function getAllOrders() {
  const storedOrders = getStoredOrders();
  if (storedOrders === cachedAllOrdersSource) return cachedAllOrders;

  cachedAllOrdersSource = storedOrders;
  cachedAllOrders = [...storedOrders, ...DEFAULT_NORMALIZED_ORDERS].sort(sortOrdersDesc);
  return cachedAllOrders;
}

export function getOrderById(orderId) {
  const normalizedId = String(orderId || "").trim().toUpperCase();
  return getAllOrders().find((order) => order.id.toUpperCase() === normalizedId) || null;
}

export function subscribeToOrders(listener) {
  if (!isBrowser()) return () => {};

  const handleOrdersChange = () => listener();
  const handleStorage = (event) => {
    if (event.key === ORDERS_STORAGE_KEY) listener();
  };

  window.addEventListener(ORDERS_EVENT, handleOrdersChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(ORDERS_EVENT, handleOrdersChange);
    window.removeEventListener("storage", handleStorage);
  };
}

function persistOrders(nextOrders) {
  if (!isBrowser()) return;
  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(nextOrders));
  window.dispatchEvent(new CustomEvent(ORDERS_EVENT));
}

export function saveOrder(order) {
  const normalizedOrder = normalizeOrder(order);
  const existingOrders = getStoredOrders();
  const nextOrders = [
    normalizedOrder,
    ...existingOrders.filter((item) => item.id.toUpperCase() !== normalizedOrder.id.toUpperCase()),
  ];
  persistOrders(nextOrders);
  return normalizedOrder;
}

export function mapApiOrder(order) {
  const embeddedService = order?.service && typeof order.service === "object" ? order.service : null;
  const service = embeddedService
    || DEFAULT_SERVICES.find((item) => Number(item?.id) === Number(order?.serviceId))
    || null;
  const servicePrices = Array.isArray(embeddedService?.price)
    ? embeddedService.price
    : Array.isArray(service?.price)
      ? service.price
      : [];
  const selectedPrice = servicePrices.find(
    (item) =>
      Number(item?.id) === Number(order?.servicePriceId)
      || Boolean(item?.isDefault),
  ) || servicePrices[0] || null;
  const units = Math.max(1, Number(order?.units) || 1);
  const paymentMethod = Number(order?.discount || 0) > 0 ? "CARD" : "CASH";
  const customer = order?.customer && typeof order.customer === "object"
    ? order.customer
    : order?.user && typeof order.user === "object"
      ? order.user
      : null;
  const serviceName = service?.title || order?.serviceName || `Service #${order?.serviceId ?? order?.service?.id ?? "--"}`;
  const billingUnit = String(selectedPrice?.billingUnit || "UNIT").toLowerCase();
  const fallbackUnitPrice = units > 0
    ? Number(order?.subtotal ?? order?.total ?? 0) / units
    : Number(order?.subtotal ?? order?.total ?? 0);

  return normalizeOrder({
    id: String(order?.orderNo || order?.id || ""),
    backendId: order?.id ?? null,
    serviceId: order?.serviceId ?? service?.id ?? embeddedService?.id ?? null,
    servicePriceId: order?.servicePriceId ?? selectedPrice?.id ?? null,
    serviceName,
    status: order?.status || "PENDING",
    date: order?.createdAt || order?.updatedAt || new Date().toISOString(),
    amount: Number(order?.total ?? order?.subtotal ?? 0),
    subtotal: Number(order?.subtotal ?? 0),
    discount: Number(order?.discount ?? 0),
    currency: String(order?.currency || selectedPrice?.currency || "USD").toUpperCase(),
    location: [
      service?.location?.[0]?.district,
      service?.location?.[0]?.city,
      service?.location?.[0]?.province,
    ].filter(Boolean).join(", ") || customer?.location || "Location pending",
    servicePath: service ? getServicePath(service) : "/services",
    providerName: service?.providerName || "Apsor Provider",
    paymentMethod,
    paymentStatus: paymentMethod === "CASH" ? "PAY_LATER" : "PAID",
    customerName: `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim(),
    phone: customer?.phoneNumber || "",
    email: customer?.email || "",
    notes: order?.note || "",
    items: [
      {
        name: `${selectedPrice?.name || serviceName} (${units} ${billingUnit})`,
        qty: units,
        unitPrice: Number(selectedPrice?.amount ?? fallbackUnitPrice),
      },
    ],
  });
}

export function mergeOrders(primaryOrders = [], secondaryOrders = []) {
  const map = new Map();

  [...primaryOrders, ...secondaryOrders].forEach((order) => {
    const normalizedOrder = normalizeOrder(order);
    if (!normalizedOrder.id) {
      return;
    }

    if (!map.has(normalizedOrder.id)) {
      map.set(normalizedOrder.id, normalizedOrder);
    }
  });

  return [...map.values()].sort(sortOrdersDesc);
}

function createOrderId() {
  const randomSuffix = Math.floor(Math.random() * 900 + 100);
  return `ORD-${Date.now().toString().slice(-6)}${randomSuffix}`;
}

export function createOrder({
  service,
  price,
  units,
  providerName,
  customerName,
  phone,
  email,
  location,
  notes,
  paymentMethod,
}) {
  const safeUnits = Math.max(1, Number(units) || 1);
  const unitPrice = Number(price?.amount || 0);
  const normalizedPaymentMethod = String(paymentMethod || "CARD").toUpperCase();
  const paymentStatus = normalizedPaymentMethod === "CASH" ? "PAY_LATER" : "PAID";
  const newOrder = normalizeOrder({
    id: createOrderId(),
    serviceName: service?.title || "Service",
    status: "PENDING",
    date: new Date().toISOString(),
    amount: unitPrice * safeUnits,
    currency: String(price?.currency || "USD").toUpperCase(),
    location: location || "Location pending",
    servicePath: service?.slug ? `/services/${encodeURIComponent(service.slug)}` : "/services",
    providerName: providerName || service?.providerName || "Apsor Provider",
    paymentMethod: normalizedPaymentMethod,
    paymentStatus,
    customerName: customerName || "",
    phone: phone || "",
    email: email || "",
    notes: notes || "",
    items: [
      {
        name: `${price?.name || service?.title || "Service"} (${safeUnits} ${String(price?.billingUnit || "UNIT").toLowerCase()})`,
        qty: safeUnits,
        unitPrice,
      },
    ],
  });

  return saveOrder(newOrder);
}
