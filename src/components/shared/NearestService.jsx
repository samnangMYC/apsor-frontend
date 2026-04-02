import React from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/useLang";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ServiceListCard from "../services/ServiceListCard";
import ServiceSectionSkeleton from "../services/ServiceSectionSkeleton";
import { DEFAULT_SERVICES } from "../../data/defaultServices";
import { sortServicesByDistance } from "../../utils/service";
import "swiper/css";
import "swiper/css/navigation";

export default function NearestService({
  services = DEFAULT_SERVICES,
  viewAllTo = "/services?view=nearest",
  isLoading = false,
}) {
  const { t } = useLang("km");
  const uid = React.useId().replace(/:/g, "");
  const prevClass = `nearest-prev-${uid}`;
  const nextClass = `nearest-next-${uid}`;
  const nearestServices = sortServicesByDistance(services);

  if (isLoading) {
    return <ServiceSectionSkeleton />;
  }

  return (
    <section className="mt-6 rounded-xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            {t.nearestServicesEyebrow || "Near you"}
          </p>
          <h2 className="mt-1 text-lg font-bold text-text-primary sm:text-xl">
            {t.nearestServicesTitle || "Nearest Services"}
          </h2>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">
            {t.nearestServicesSubtitle ||
              "Services closest to your location for faster support."}
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

      {nearestServices.length ? (
        <div className="relative">
          <button
            type="button"
            className={`${prevClass} absolute left-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-surface text-text-secondary shadow-1 hover:bg-bg-subtle md:inline-flex`}
            aria-label="Previous nearest services"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={`${nextClass} absolute right-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-surface text-text-secondary shadow-1 hover:bg-bg-subtle md:inline-flex`}
            aria-label="Next nearest services"
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
            {nearestServices.map(({ service, distanceKm }) => (
              <SwiperSlide key={service.id} className="w-64! sm:w-[280px]! lg:w-[300px]!">
                <ServiceListCard
                  service={service}
                  badgeText={t.nearestServiceBadge || "Nearest Service"}
                  distanceKm={distanceKm}
                />
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
