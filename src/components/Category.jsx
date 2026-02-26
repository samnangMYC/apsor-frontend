import React from "react";
import { useLang } from "../i18n/useLang";
import { Link } from "react-router-dom";
import CategoryCard from "./categories/CategoryCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";

const CATEGORIES = [
  {
    id: "cleaning",
    slug: "cleaning",
    name: { km: "សម្អាត", en: "Cleaning" },
    icon: "Sparkles",
    image: "https://images.unsplash.com/photo-1527515545081-5db817172677?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "repair",
    slug: "home-repair",
    name: { km: "ជួសជុលផ្ទះ", en: "Home Repair" },
    icon: "Hammer",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "electric",
    slug: "electric",
    name: { km: "អគ្គិសនី", en: "Electrical" },
    icon: "Plug",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "plumbing",
    slug: "plumbing",
    name: { km: "ទឹក/បំពង់", en: "Plumbing" },
    icon: "Droplets",
    image: "https://images.unsplash.com/photo-1619203714326-0f436ce2c457?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "painting",
    slug: "painting",
    name: { km: "លាបពណ៌", en: "Painting" },
    icon: "Paintbrush",
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "it",
    slug: "it-support",
    name: { km: "IT/កុំព្យូទ័រ", en: "IT Support" },
    icon: "Laptop",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function Category() {
  const { t } = useLang("km");
  const uid = React.useId().replace(/:/g, "");
  const prevClass = `category-prev-${uid}`;
  const nextClass = `category-next-${uid}`;

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
          {CATEGORIES.map((c) => (
            <SwiperSlide key={c.id} className="w-42.5! pb-1 sm:w-46.25! lg:w-50!">
              <CategoryCard category={c} />
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
