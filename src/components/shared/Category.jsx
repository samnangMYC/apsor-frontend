import React from "react";
import { useLang } from "../../i18n/useLang";
import { Link } from "react-router-dom";
import CategoryCard from "../categories/CategoryCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCategoryStore } from "../../store/useCategoryStore";
import "swiper/css";
import "swiper/css/navigation";

export default function Category() {
  const { t } = useLang("km");
  const categories = useCategoryStore((state) => state.categories);
  const fetchCategoryList = useCategoryStore((state) => state.fetchCategories);
  const uid = React.useId().replace(/:/g, "");
  const prevClass = `category-prev-${uid}`;
  const nextClass = `category-next-${uid}`;

  React.useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);

  return (
    <section className="relative mt-6 overflow-hidden rounded-xl border border-border bg-bg-surface p-3 shadow-1 sm:p-4">
      <span className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-brand-soft opacity-60" />

      <div className="relative flex items-end justify-between gap-3">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            {t.popularServices || "Popular Services"}
          </p>
          <h2 className="mt-1 text-lg font-bold text-text-primary sm:text-xl">
            {t.categories || "Categories"}
          </h2>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">
            {t.categoriesSubtitle || "Find trusted professionals by service type."}
          </p>
        </div>
        <Link
          to="/services"
          className="hidden rounded-pill border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:inline-flex"
        >
          {t.viewAll || "View all"}
        </Link>
      </div>

      <div className="relative mt-4">
        <button
          type="button"
          className={`${prevClass} absolute left-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-surface text-text-secondary shadow-1 hover:bg-bg-subtle md:inline-flex`}
          aria-label="Previous categories"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={`${nextClass} absolute right-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-surface text-text-secondary shadow-1 hover:bg-bg-subtle md:inline-flex`}
          aria-label="Next categories"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        <Swiper
          modules={[Navigation]}
          grabCursor
          slidesPerView="auto"
          spaceBetween={10}
          navigation={{
            prevEl: `.${prevClass}`,
            nextEl: `.${nextClass}`,
          }}
        >
          {categories.map((category) => (
            <SwiperSlide key={category.id} className="w-42.5! pb-1 sm:w-46.25! lg:w-50!">
              <CategoryCard category={category} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="relative mt-3 sm:hidden">
        <Link
          to="/services"
          className="inline-flex w-full items-center justify-center rounded-pill border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {t.viewAll || "View all"}
        </Link>
      </div>
    </section>
  );
}
