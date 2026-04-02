import React from "react";
import ServiceListCard from "../services/ServiceListCard";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/useLang";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import { DEFAULT_SERVICES } from "../../data/defaultServices";
import ServiceSectionSkeleton from "../services/ServiceSectionSkeleton";
import { sortServicesByPopularity } from "../../utils/service";

export default function ServiceList({
  services = DEFAULT_SERVICES,
  title,
  subtitle,
  viewAllTo = "/services?view=popular",
  isLoading = false,
}) {
  const { t } = useLang("km");
  const uid = React.useId().replace(/:/g, "");
  const prevClass = `service-prev-${uid}`;
  const nextClass = `service-next-${uid}`;
  const favoriteServices = sortServicesByPopularity(services);

  if (isLoading) {
    return <ServiceSectionSkeleton />;
  }

  return (
    <section className="mt-6 rounded-xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            {t.popularServicesEyebrow || "Trending now"}
          </p>
          <h2 className="mt-1 text-lg font-bold text-text-primary sm:text-xl">
            {title || t.popularServicesTitle || "Popular Services"}
          </h2>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">
            {subtitle || t.popularServicesSubtitle || "Top-rated and most-booked services people love right now."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={viewAllTo}
            className="hidden rounded-pill border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:inline-flex"
          >
            {t.viewAll || "View all"}
          </Link>
        </div>
      </div>

      {favoriteServices.length ? (
        <div className="relative">
          <button
            type="button"
            className={`${prevClass} absolute left-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-surface text-text-secondary shadow-1 hover:bg-bg-subtle md:inline-flex`}
            aria-label="Previous services"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={`${nextClass} absolute right-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-surface text-text-secondary shadow-1 hover:bg-bg-subtle md:inline-flex`}
            aria-label="Next services"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          <Swiper
            modules={[Navigation]}
            grabCursor
            slidesPerView="auto"
            spaceBetween={12}
            navigation={{
              prevEl: `.${prevClass}`,
              nextEl: `.${nextClass}`,
            }}
          >
            {favoriteServices.map((service) => (
              <SwiperSlide key={service.id} className="w-64! sm:w-[280px]! lg:w-[300px]!">
                <ServiceListCard service={service} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border-strong bg-bg-subtle p-6 text-center text-sm text-text-muted">
          {t.noServicesFound || "No services found."}
        </div>
      )}

      <div className="relative mt-3 sm:hidden">
        <Link
          to={viewAllTo}
          className="inline-flex w-full items-center justify-center rounded-pill border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {t.viewAll || "View all"}
        </Link>
      </div>
    </section>
  );
}
