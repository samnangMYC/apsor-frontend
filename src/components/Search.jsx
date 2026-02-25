// src/components/Search.jsx
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { useLang } from "../i18n/useLang";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

export default function Search({
  placeholder,
  action = "/services",
  param = "search",
  initialValue,
  className = "",
  size = "md",
  variant = "pill",
  showButton = true,
  buttonText,
  autoFocus = false,
}) {
  const { t } = useLang("km");

  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const fromUrl = sp.get(param) ?? "";
  const [q, setQ] = React.useState(initialValue ?? fromUrl);

  React.useEffect(() => {
    if (initialValue !== undefined) return;
    setQ(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromUrl]);

  const h = size === "sm" ? "h-10" : size === "lg" ? "h-12" : "h-11";
  const radius =
    variant === "rounded" ? "rounded-[var(--radius-xl)]" : "rounded-[var(--radius-pill)]";

  function onSubmit(e) {
    e.preventDefault();
    const value = q.trim();
    if (!value) return;

    const url = new URL(action, window.location.origin);
    url.searchParams.set(param, value);
    navigate(url.pathname + url.search);
  }

  function clear() {
    setQ("");
    const url = new URL(action, window.location.origin);
    navigate(url.pathname + url.search);
  }

  const ph = placeholder ?? t.searchPlaceholder;
  const btn = buttonText ?? t.searchButton;

  return (
    <form onSubmit={onSubmit} className={cx("w-full", className)}>
      <div
        className={cx(
          "flex w-full overflow-hidden border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-1) focus-within:ring-2 focus-within:ring-(--focus-ring)",
          radius
        )}
      >
        <div className={cx("grid w-11 place-items-center text-(--text-muted)", h)}>
          <SearchIcon className="h-5 w-5" />
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={ph}
          autoFocus={autoFocus}
          className={cx(
            h,
            "flex-1 bg-transparent px-1 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none"
          )}
        />

        {q?.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className={cx(
              h,
              "px-3 text-sm font-medium text-(--text-muted) hover:text-(--text-secondary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)"
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
              "px-4 text-sm font-semibold text-white bg-(--brand-primary) hover:bg-(--brand-hover) active:bg-(--brand-pressed) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) sm:px-5"
            )}
          >
            {btn}
          </button>
        )}
      </div>
    </form>
  );
}
