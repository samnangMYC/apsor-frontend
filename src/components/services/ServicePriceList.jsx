import { useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/useLang";
import { formatBillingUnit, formatBillingUnitWithPer } from "../../utils/pricing";

const UI_TEXT = {
  en: {
    servicePrice: "Service Price",
    priceItem: "Price item",
    min: "min",
    max: "max",
    defaultTag: "Default",
    noPrices: "No prices available.",
  },
  km: {
    servicePrice: "តម្លៃសេវាកម្ម",
    priceItem: "ជម្រើសតម្លៃ",
    min: "អប្បបរមា",
    max: "អតិបរមា",
    defaultTag: "លំនាំដើម",
    noPrices: "មិនមានតម្លៃសេវាកម្មទេ។",
  },
};

function getLocale(lang) {
  return lang === "km" ? "km-KH" : "en-US";
}

function formatMoney(amount, currency = "USD", lang = "en") {
  return new Intl.NumberFormat(getLocale(lang), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function formatNumber(value, lang = "en") {
  return new Intl.NumberFormat(getLocale(lang)).format(Number(value || 0));
}

function getUnitRange(priceItem) {
  const min = Math.max(1, Number(priceItem?.minUnits || 1));
  const maxRaw = Number(priceItem?.maxUnits || min);
  const max = Number.isFinite(maxRaw) && maxRaw > 0 ? Math.max(min, maxRaw) : min;
  return { min, max };
}

export default function ServicePriceList({ service }) {
  const { lang, t } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const prices = Array.isArray(service?.price) ? service.price : [];
  const defaultIndex = Math.max(prices.findIndex((item) => item?.isDefault), 0);
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const selectedPrice = prices[selectedIndex] || prices[0] || null;
  const [selectedUnits, setSelectedUnits] = useState(selectedPrice?.minUnits || 1);

  const { min: minUnits, max: maxUnits } = getUnitRange(selectedPrice);
  const safeUnits = Math.min(maxUnits, Math.max(minUnits, Number(selectedUnits) || minUnits));
  const totalPrice = selectedPrice ? Number(selectedPrice.amount || 0) * safeUnits : 0;

  return (
    <aside className="overflow-x-hidden rounded-xl border border-border bg-linear-to-b from-bg-surface via-bg-surface to-brand-soft/25 p-4 shadow-1 sm:p-5 lg:flex lg:max-h-[calc(100vh-9rem)] lg:flex-col lg:overflow-hidden">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
        {text.servicePrice}
      </p>
      <h2 className="mt-1 break-words text-lg font-bold text-text-primary">{service?.title || "Service"}</h2>

      {prices.length ? (
        <div className="mt-4 space-y-3 lg:flex lg:min-h-[400px] lg:flex-1 lg:flex-col lg:space-y-0">
          <div className="space-y-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
            {prices.map((item, index) => {
              const { min, max } = getUnitRange(item);

              return (
                <button
                  key={item.id || `${item.name || "price"}-${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedIndex(index);
                    setSelectedUnits(min);
                  }}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    index === selectedIndex
                      ? "border-brand/60 bg-linear-to-r from-brand-soft/70 via-brand-soft/35 to-bg-surface shadow-1"
                      : "border-border bg-linear-to-r from-bg-subtle via-bg-surface to-bg-subtle hover:border-brand/40 hover:from-brand-soft/35 hover:to-bg-surface"
                  }`}
                  aria-pressed={index === selectedIndex}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-text-primary">{item.name || text.priceItem}</p>
                    <p className="text-base font-extrabold text-brand">
                      {formatMoney(item.amount, item.currency, lang)}
                    </p>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 break-words text-xs text-text-muted">
                    <span>{formatBillingUnitWithPer(item.billingUnit, t)}</span>
                    <span>{`• ${text.min} ${formatNumber(min, lang)}`}</span>
                    <span>{`${text.max} ${formatNumber(max, lang)}`}</span>
                    {item.isDefault && (
                      <span className="rounded-pill bg-brand px-2 py-0.5 font-semibold text-white">
                        {text.defaultTag}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          

          {selectedPrice && (
            <div className="mt-2 border-t border-border pt-2 lg:shrink-0">
              <div className="flex flex-col gap-1 text-[11px] text-text-muted sm:flex-row sm:items-center sm:justify-between">
                <span className="break-words">{`${formatMoney(selectedPrice.amount, selectedPrice.currency, lang)} / ${formatBillingUnit(selectedPrice.billingUnit, t)}`}</span>
                <span className="break-words">{`${text.min} ${formatNumber(minUnits, lang)} • ${text.max} ${formatNumber(maxUnits, lang)}`}</span>
              </div>

              <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <input
                  type="number"
                  min={minUnits}
                  max={maxUnits}
                  value={safeUnits}
                  onChange={(event) => setSelectedUnits(event.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-linear-to-r from-bg-surface to-bg-subtle px-2.5 text-xs text-text-primary outline-none focus:border-brand"
                />

                <div className="text-right">
                  <p className="text-[10px] text-text-secondary">{t.total || "Total"}</p>
                  <p className="text-sm font-bold text-brand">
                    {formatMoney(totalPrice, selectedPrice.currency || "USD", lang)}
                  </p>
                </div>
              </div>

              <Link
                to="/signin"
                className="mt-2 inline-flex h-9 w-full items-center justify-center rounded-md bg-brand px-3 text-xs font-semibold text-white transition hover:bg-brand-hover"
              >
                {t.startOrder || "Start Order"}
              </Link>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-text-muted">{text.noPrices}</p>
      )}

    </aside>
  );
}
