// src/components/categories/CategoryCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Droplets,
  Grid3X3,
  Hammer,
  Laptop,
  Paintbrush,
  Plug,
  Sparkles,
} from "lucide-react";
import { useLang } from "../../i18n/useLang";

function pickLang(val, lang) {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val?.[lang] ?? val?.km ?? val?.en ?? "";
}

export default function CategoryCard({
  category,
  to = `/services?category=${category.slug}`,
  className = "",
}) {
  const { lang, t } = useLang("km");
  const categoryName = pickLang(category.name, lang);
  const iconMap = {
    Sparkles,
    Hammer,
    Plug,
    Droplets,
    Paintbrush,
    Laptop,
  };
  const Icon = iconMap[category.icon] || Grid3X3;

  return (
    <Link
      to={to}
      aria-label={`${categoryName} ${t.services || "Services"}`}
      className={[
        "group relative block overflow-hidden rounded-xl border border-border bg-bg-surface shadow-1 transition duration-200 hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface",
        className,
      ].join(" ")}
    >
      <div className="relative h-24 w-full overflow-hidden sm:h-26">
        <img
          src={category.image}
          alt={categoryName}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
        <span className="absolute left-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-md bg-white/90 text-brand shadow-1">
          <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
      </div>

      <div className="relative p-3">
        <div className="truncate text-[13px] font-semibold text-text-primary sm:text-sm">
          {categoryName}
        </div>
        <div className="mt-0.5 text-[11px] text-text-muted">
          {t.services || "Services"}
        </div>
        <div className="mt-2 inline-flex rounded-pill bg-bg-subtle px-2 py-0.5 text-[10px] font-medium text-text-muted">
          {category.slug}
        </div>
      </div>

      <span className="absolute bottom-2.5 right-2.5 grid h-5 w-5 place-items-center rounded-full bg-bg-subtle text-text-muted transition group-hover:bg-brand-soft group-hover:text-brand">
        <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
