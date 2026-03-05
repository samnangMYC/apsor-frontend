import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { useLang } from "../../i18n/useLang";
import { DEFAULT_SERVICES } from "../../data/defaultServices";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

const DEFAULT_SEARCH_SUGGESTIONS = Object.freeze(
  Array.from(
    new Set(
      DEFAULT_SERVICES.flatMap((service) => [
        String(service?.title || "").trim(),
        String(service?.slug || "")
          .replace(/[-_]+/g, " ")
          .trim(),
        String(service?.location?.[0]?.city || "").trim(),
        String(service?.location?.[0]?.district || "").trim(),
      ]).filter(Boolean),
    ),
  ).slice(0, 24),
);

export default function Search({
  placeholder,
  action = "/search",
  param = "search",
  initialValue,
  className = "",
  size = "md",
  variant = "pill",
  showButton = true,
  buttonText,
  autoFocus = false,
  suggestions = DEFAULT_SEARCH_SUGGESTIONS,
  maxSuggestions = 6,
}) {
  const { t } = useLang("km");

  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const rootRef = React.useRef(null);

  const fromUrl = sp.get(param) ?? "";
  const [q, setQ] = React.useState(initialValue ?? fromUrl);
  const [isSuggestionOpen, setIsSuggestionOpen] = React.useState(false);

  React.useEffect(() => {
    if (initialValue !== undefined) return;
    setQ(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromUrl]);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target)) {
        setIsSuggestionOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const normalizedSuggestions = React.useMemo(
    () =>
      Array.from(
        new Set(
          (Array.isArray(suggestions) ? suggestions : [])
            .map((item) => String(item || "").trim())
            .filter(Boolean),
        ),
      ),
    [suggestions],
  );

  const visibleSuggestions = React.useMemo(() => {
    const keyword = String(q || "").trim().toLowerCase();
    if (!keyword) return normalizedSuggestions.slice(0, maxSuggestions);

    return normalizedSuggestions
      .filter((item) => item.toLowerCase().includes(keyword))
      .slice(0, maxSuggestions);
  }, [maxSuggestions, normalizedSuggestions, q]);

  const h = size === "sm" ? "h-10" : size === "lg" ? "h-12" : "h-11";
  const radius =
    variant === "rounded" ? "rounded-xl" : "rounded-pill";

  function navigateToSearch(nextValue) {
    const value = String(nextValue || "").trim();
    if (!value) return;

    const url = new URL(action, window.location.origin);
    url.searchParams.set(param, value);
    setIsSuggestionOpen(false);
    navigate(url.pathname + url.search);
  }

  function onSubmit(e) {
    e.preventDefault();
    navigateToSearch(q);
  }

  function clear() {
    setQ("");
    setIsSuggestionOpen(false);
    const url = new URL(action, window.location.origin);
    navigate(url.pathname + url.search);
  }

  const ph = placeholder ?? t.searchPlaceholder;
  const btn = buttonText ?? t.searchButton;

  return (
    <form ref={rootRef} onSubmit={onSubmit} className={cx("relative w-full", className)}>
      <div
        className={cx(
          "flex w-full overflow-hidden border border-border bg-bg-surface shadow-1 focus-within:ring-2 focus-within:ring-focus",
          radius
        )}
      >
        <div className={cx("grid w-11 place-items-center text-text-muted", h)}>
          <SearchIcon className="h-5 w-5" />
        </div>

        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setIsSuggestionOpen(true);
          }}
          onFocus={() => setIsSuggestionOpen(true)}
          placeholder={ph}
          autoFocus={autoFocus}
          className={cx(
            h,
            "flex-1 bg-transparent px-1 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          )}
        />

        {q?.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className={cx(
              h,
              "px-3 text-sm font-medium text-text-muted hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            )}
            aria-label={t.clear}
            title={t.clear}
          >
            ✕
          </button>
        )}

        {showButton && (
          <button
            type="submit"
            className={cx(
              h,
              "px-4 text-sm font-semibold text-white bg-brand hover:bg-brand-hover active:bg-brand-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:px-5"
            )}
          >
            {btn}
          </button>
        )}
      </div>

      {isSuggestionOpen && visibleSuggestions.length ? (
        <div className="absolute left-0 right-0 z-30 mt-1 rounded-xl border border-border bg-bg-surface p-1 shadow-2">
          {visibleSuggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setQ(item);
                navigateToSearch(item);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-text-secondary transition hover:bg-bg-subtle hover:text-text-primary"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </form>
  );
}
