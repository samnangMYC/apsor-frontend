export const SERVICE_PRICE_BILLING_UNITS = Object.freeze([
  "SESSION",
  "HOUR",
  "DAY",
  "WEEK",
  "MONTH",
  "YEAR",
  "JOB",
  "ITEM",
  "PACKAGE",
]);

const BILLING_UNIT_TEXT_KEY = {
  SESSION: "session",
  HOUR: "hour",
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
  YEAR: "year",
  JOB: "job",
  ITEM: "item",
  PACKAGE: "package",
};

const BILLING_UNIT_FALLBACK = {
  session: "session",
  hour: "hour",
  day: "day",
  week: "week",
  month: "month",
  year: "year",
  job: "job",
  item: "item",
  package: "package",
};

export function getBillingUnitTextKey(unit) {
  const normalized = String(unit || "").toUpperCase();
  return BILLING_UNIT_TEXT_KEY[normalized] || "unit";
}

export function formatBillingUnit(unit, t = {}) {
  const textKey = getBillingUnitTextKey(unit);
  return t[textKey] || BILLING_UNIT_FALLBACK[textKey] || t.unit || "unit";
}

export function formatBillingUnitWithPer(unit, t = {}) {
  return `${t.per || "per"} ${formatBillingUnit(unit, t)}`;
}
