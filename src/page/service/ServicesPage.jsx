import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import Breadcrumb from "../../components/shared/Breadcrumb";
import ServiceListCard from "../../components/services/ServiceListCard";
import { useLang } from "../../i18n/useLang";
import { fetchPublicServices } from "../../api";
import {
  sortServicesByDistance,
  sortServicesByPopularity,
} from "../../utils/service";

const INITIAL_VISIBLE_COUNT = 12;
const LOAD_MORE_STEP = 12;
const VALID_VIEWS = new Set(["all", "popular", "nearest"]);

const UI_TEXT = {
  en: {
    allServicesEyebrow: "Browse all",
    allServicesTitle: "All Services",
    allServicesSubtitle: "Browse every available service in one place.",
    availableNow: "Available now",
    servicesCount: "services",
    viewMore: "View more",
    unableToLoadTitle: "Unable to load services",
    unableToLoadSubtitle: "Please verify the public services API and try again.",
    nearestTab: "Nearest",
  },
  km: {
    allServicesEyebrow: "មើលទាំងអស់",
    allServicesTitle: "សេវាកម្មទាំងអស់",
    allServicesSubtitle: "ស្វែងរកសេវាកម្មទាំងអស់ដែលមាននៅកន្លែងតែមួយ។",
    availableNow: "សេវាកម្មដែលមានឥឡូវនេះ",
    servicesCount: "សេវាកម្ម",
    viewMore: "មើលបន្ថែម",
    unableToLoadTitle: "មិនអាចផ្ទុកសេវាកម្មបាន",
    unableToLoadSubtitle: "សូមពិនិត្យ public services API ហើយសាកល្បងម្តងទៀត។",
    nearestTab: "នៅជិត",
  },
};

function SkeletonCard() {
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-bg-surface shadow-1">
      <div className="h-36 animate-pulse bg-linear-to-r from-bg-subtle via-brand-soft/45 to-bg-surface" />
      <div className="p-4">
        <div className="h-5 w-4/5 animate-pulse rounded-md bg-bg-subtle" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded-md bg-bg-subtle" />
        <div className="mt-4 h-6 w-24 animate-pulse rounded-pill bg-brand-soft/50" />
        <div className="mt-4 h-8 w-36 animate-pulse rounded-md bg-bg-subtle" />
      </div>
    </article>
  );
}

function getView(searchParams) {
  const requestedView = String(searchParams.get("view") || "all")
    .trim()
    .toLowerCase();

  return VALID_VIEWS.has(requestedView) ? requestedView : "all";
}

function getPageMeta(view, text, t) {
  if (view === "popular") {
    return {
      eyebrow: t.popularServicesEyebrow || "Trending now",
      title: t.popularServicesTitle || "Popular Services",
      subtitle:
        t.popularServicesSubtitle ||
        "Top-rated and most-booked services people love right now.",
      sectionLabel: t.popularServicesTitle || "Popular Services",
    };
  }

  if (view === "nearest") {
    return {
      eyebrow: t.nearestServicesEyebrow || "Near you",
      title: t.nearestServicesTitle || "Nearest Services",
      subtitle:
        t.nearestServicesSubtitle ||
        "Services closest to your location for faster support.",
      sectionLabel: t.nearestServicesTitle || "Nearest Services",
    };
  }

  return {
    eyebrow: text.allServicesEyebrow,
    title: text.allServicesTitle,
    subtitle: text.allServicesSubtitle,
    sectionLabel: text.availableNow,
  };
}

export default function ServicesPage() {
  const { lang, t } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const [searchParams] = useSearchParams();
  const view = getView(searchParams);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const pageMeta = getPageMeta(view, text, t);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [view]);

  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);

    let isMounted = true;

    const loadServices = async () => {
      try {
        const result = await fetchPublicServices({
          keyword: "",
          status: "ACTIVE",
          pageNumber: 0,
          pageSize: 100,
          sortBy: "id",
          sortOrder: "desc",
        });

        if (!isMounted) {
          return;
        }

        setServices(Array.isArray(result?.items) ? result.items : []);
      } catch (error) {
        console.error("Failed to load services page:", error);

        if (!isMounted) {
          return;
        }

        setServices([]);
        setLoadError(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  const preparedServices = useMemo(() => {
    if (view === "popular") {
      return sortServicesByPopularity(services).map((service) => ({
        service,
        distanceKm: null,
      }));
    }

    if (view === "nearest") {
      return sortServicesByDistance(services);
    }

    return services.map((service) => ({
      service,
      distanceKm: null,
    }));
  }, [services, view]);

  const visibleServices = useMemo(
    () => preparedServices.slice(0, visibleCount),
    [preparedServices, visibleCount],
  );
  const hasMoreServices = visibleServices.length < preparedServices.length;

  const serviceBadgeText =
    view === "nearest"
      ? t.nearestServiceBadge || "Nearest Service"
      : t.popularServiceBadge || "Popular Service";

  const viewTabs = [
    { key: "all", to: "/services", label: text.allServicesTitle },
    { key: "popular", to: "/services?view=popular", label: t.popularServices || "Popular" },
    { key: "nearest", to: "/services?view=nearest", label: text.nearestTab },
  ];

  return (
    <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
      <Breadcrumb className="mb-4" currentLabel={pageMeta.title} />

      <section className="rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
          {pageMeta.eyebrow}
        </p>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              {pageMeta.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-text-muted">
              {pageMeta.subtitle}
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex rounded-pill border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle"
          >
            {t.backHome || "Back to home"}
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {viewTabs.map((tab) => {
            const isActive = tab.key === view;

            return (
              <Link
                key={tab.key}
                to={tab.to}
                className={[
                  "inline-flex rounded-pill border px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "border-brand bg-brand text-white"
                    : "border-border text-text-secondary hover:bg-bg-subtle",
                ].join(" ")}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-text-primary">
            {pageMeta.sectionLabel}
          </h2>
          <p className="text-xs text-text-muted">
            {isLoading ? "--" : `${preparedServices.length} ${text.servicesCount}`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCard key={`services-skeleton-${index}`} />
            ))}
          </div>
        ) : preparedServices.length ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleServices.map(({ service, distanceKm }) => (
                <ServiceListCard
                  key={service.id}
                  service={service}
                  showBadge={view !== "all"}
                  badgeText={serviceBadgeText}
                  distanceKm={view === "nearest" ? distanceKm : undefined}
                />
              ))}
            </div>

            {hasMoreServices ? (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_STEP)}
                  className="inline-flex h-10 items-center rounded-pill border border-brand/45 bg-brand-soft/35 px-5 text-sm font-semibold text-brand transition hover:border-brand hover:bg-brand-soft/55"
                >
                  {text.viewMore}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-bg-subtle/60 px-4 py-8 text-center">
            <SearchIcon className="mx-auto h-7 w-7 text-brand" />
            <p className="mt-2 text-base font-semibold text-text-primary">
              {loadError ? text.unableToLoadTitle : t.noServicesFound || "No services found."}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              {loadError ? text.unableToLoadSubtitle : t.noServicesFound || "No services found."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
