import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useLang } from "../../i18n/useLang";

function pickLang(val, lang) {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val?.[lang] ?? val?.km ?? val?.en ?? "";
}

export default function CategoryCard({
  category,
  to = `/categories/${category.slug}`,
  className = "",
}) {
  const { lang, t } = useLang("km");
  const categoryName = pickLang(category.name, lang);

  return (
    <Link
      to={to}
      aria-label={`${categoryName} ${t.services || "Services"}`}
      className={[
        "group relative block overflow-hidden rounded-xl border border-border bg-bg-surface shadow-1 transition duration-200 hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface",
        className,
      ].join(" ")}
    >
      <div className="relative h-28 w-full overflow-hidden">
        <img
          src={category.image}
          alt={categoryName}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/35 to-black/5" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="truncate text-sm font-semibold text-white">
            {categoryName}
          </div>
          <div className="mt-1 inline-flex rounded-pill bg-black/35 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-[1px]">
            {t.services || "Services"}
          </div>
        </div>
      </div>

      <span className="absolute bottom-2.5 right-2.5 grid h-5 w-5 place-items-center rounded-full bg-black/35 text-white transition group-hover:bg-brand group-hover:text-white">
        <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
