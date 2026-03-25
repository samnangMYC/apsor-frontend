import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RotateCcw, Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import Breadcrumb from "../../components/shared/Breadcrumb";
import ServiceListCard from "../../components/services/ServiceListCard";
import { useLang } from "../../i18n/useLang";
import { fetchPublicServices } from "../../api";

const UI_TEXT = {
  en: {
    title: "Search Services",
    subtitle: "Find services quickly.",
    searchResults: "Search results",
    noKeyword: "Type a keyword to find services.",
    noResultTitle: "No services found",
    noResultSubtitle: "Try another keyword.",
    showing: "Showing",
    of: "of",
    filterBy: "Filter",
    filterLocation: "Location mode",
    filterAll: "All",
    sortBy: "Sort",
    sortRelevance: "Relevance",
    sortRating: "Top rating",
    sortPriceLow: "Price low to high",
    sortPriceHigh: "Price high to low",
    resetFilter: "Reset",
    viewMore: "View more",
  },
  km: {
    title: "ស្វែងរកសេវាកម្ម",
    subtitle: "ស្វែងរកសេវាកម្មបានលឿន។",
    searchResults: "លទ្ធផលស្វែងរក",
    noKeyword: "សូមវាយពាក្យស្វែងរកសេវាកម្ម។",
    noResultTitle: "រកមិនឃើញសេវាកម្ម",
    noResultSubtitle: "សូមសាកល្បងពាក្យផ្សេង។",
    showing: "បង្ហាញ",
    of: "នៃ",
    filterBy: "តម្រង",
    filterLocation: "របៀបទីតាំង",
    filterAll: "ទាំងអស់",
    sortBy: "តម្រៀប",
    sortRelevance: "ពាក់ព័ន្ធ",
    sortRating: "វាយតម្លៃខ្ពស់",
    sortPriceLow: "តម្លៃទាបទៅខ្ពស់",
    sortPriceHigh: "តម្លៃខ្ពស់ទៅទាប",
    resetFilter: "កំណត់ឡើងវិញ",
    viewMore: "មើលបន្ថែម",
  },
};

const LOCATION_MODE_FILTERS = Object.freeze(["ALL", "ONSITE", "REMOTE", "HYBRID"]);
const SORT_OPTIONS = Object.freeze(["RELEVANCE", "RATING", "PRICE_LOW", "PRICE_HIGH"]);
const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_STEP = 8;

function rankService(service, keyword) {
  const safeKeyword = String(keyword || "").trim().toLowerCase();
  if (!safeKeyword) return 0;

  const title = String(service?.title || "").toLowerCase();
  const slug = String(service?.slug || "").toLowerCase();
  const description = String(service?.description || "").toLowerCase();
  const location = (Array.isArray(service?.location) ? service.location : [])
    .map((item) => [item?.city, item?.district, item?.province].filter(Boolean).join(" "))
    .join(" ")
    .toLowerCase();

  let score = 0;
  if (title.includes(safeKeyword)) score += 8;
  if (slug.includes(safeKeyword)) score += 5;
  if (description.includes(safeKeyword)) score += 3;
  if (location.includes(safeKeyword)) score += 2;
  if (String(service?.locationMode || "").toLowerCase().includes(safeKeyword)) score += 1;

  return score;
}

function sortByRating(a, b) {
  const ratingGap = Number(b?.ratingAvg || 0) - Number(a?.ratingAvg || 0);
  if (ratingGap !== 0) return ratingGap;
  return Number(b?.ratingCount || 0) - Number(a?.ratingCount || 0);
}

function getDefaultPriceAmount(service) {
  const list = Array.isArray(service?.price) ? service.price : [];
  const defaultPrice = list.find((item) => item?.isDefault) || list[0];
  const value = Number(defaultPrice?.amount);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function parseLocationModes(value) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item || "").split(","))
      .map((item) => item.trim().toUpperCase().replace("BOTH", "HYBRID"))
      .filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim().toUpperCase().replace("BOTH", "HYBRID"))
    .filter(Boolean);
}

function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-linear-to-r from-bg-subtle via-brand-soft/45 to-bg-surface ${className}`}
    />
  );
}

function SearchResultCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-bg-surface shadow-1">
      <SkeletonBar className="h-36 w-full" />
      <div className="p-4">
        <SkeletonBar className="h-4 w-4/5" />
        <SkeletonBar className="mt-2 h-3 w-2/3" />
        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="min-w-0 flex-1">
            <SkeletonBar className="h-3 w-20" />
            <SkeletonBar className="mt-1.5 h-5 w-24" />
          </div>
          <SkeletonBar className="h-6 w-20 rounded-pill" />
        </div>
        <SkeletonBar className="mt-3 h-7 w-40 rounded-md" />
      </div>
    </article>
  );
}

export default function SearchRelatedPage() {
  const { lang, t } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const [searchParams] = useSearchParams();
  const keyword = String(searchParams.get("search") || "").trim();
  const [services, setServices] = useState([]);
  const [modeFilter, setModeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("RELEVANCE");
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [keyword]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      setIsLoading(true);
      setVisibleCount(INITIAL_VISIBLE_COUNT);
      setLoadError(false);
    });

    let isMounted = true;

    const loadSearchResults = async () => {
      try {
        const result = await fetchPublicServices({
          keyword,
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
        console.error("Failed to load search results:", error);

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

    loadSearchResults();

    return () => {
      isMounted = false;
    };
  }, [keyword]);

  const searchResults = useMemo(() => {
    if (!keyword) {
      return [...services].sort(sortByRating);
    }

    return services
      .map((service) => ({ service, score: rankService(service, keyword) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return sortByRating(a.service, b.service);
      })
      .map((item) => item.service);
  }, [keyword, services]);

  const filteredResults = useMemo(() => {
    const byMode = searchResults.filter((service) => {
      if (modeFilter === "ALL") return true;
      const serviceModes = parseLocationModes(service?.locationMode);
      return serviceModes.includes(modeFilter);
    });

    if (sortBy === "RATING") {
      return [...byMode].sort(sortByRating);
    }

    if (sortBy === "PRICE_LOW") {
      return [...byMode].sort((a, b) => {
        const aPrice = getDefaultPriceAmount(a);
        const bPrice = getDefaultPriceAmount(b);
        if (aPrice === null && bPrice === null) return 0;
        if (aPrice === null) return 1;
        if (bPrice === null) return -1;
        return aPrice - bPrice;
      });
    }

    if (sortBy === "PRICE_HIGH") {
      return [...byMode].sort((a, b) => {
        const aPrice = getDefaultPriceAmount(a);
        const bPrice = getDefaultPriceAmount(b);
        if (aPrice === null && bPrice === null) return 0;
        if (aPrice === null) return 1;
        if (bPrice === null) return -1;
        return bPrice - aPrice;
      });
    }

    return byMode;
  }, [modeFilter, searchResults, sortBy]);
  const visibleResults = useMemo(
    () => filteredResults.slice(0, visibleCount),
    [filteredResults, visibleCount],
  );
  const hasMoreResults = visibleResults.length < filteredResults.length;

  const hasActiveFilters = modeFilter !== "ALL" || sortBy !== "RELEVANCE";

  const getSortLabel = (option) => {
    if (option === "RATING") return text.sortRating;
    if (option === "PRICE_LOW") return text.sortPriceLow;
    if (option === "PRICE_HIGH") return text.sortPriceHigh;
    return text.sortRelevance;
  };

  const getModeLabel = (mode) => {
    if (mode === "ONSITE") return t.onsite || "Onsite";
    if (mode === "REMOTE") return t.remote || "Remote";
    if (mode === "HYBRID") return t.hybrid || "Hybrid";
    return text.filterAll;
  };

  const handleResetFilters = () => {
    setModeFilter("ALL");
    setSortBy("RELEVANCE");
  };

  return (
    <main className="flex-1 bg-linear-to-b from-brand-soft/25 via-bg-subtle/60 to-bg-subtle px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
      <Breadcrumb className="mb-4" currentLabel={text.title} />

      <section className="rounded-2xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-text-primary">{text.searchResults}</h2>
          <p className="text-xs text-text-muted">
            {isLoading
              ? `${text.showing} --`
              : `${text.showing} ${filteredResults.length} ${text.of} ${searchResults.length}`}
          </p>
        </div>

        <div className="mb-3 rounded-xl border border-border bg-bg-subtle/45 p-2.5">
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end lg:gap-3">
            <p className="inline-flex h-10 items-center gap-1.5 text-xs font-semibold text-text-secondary lg:pb-0.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-brand" />
              {text.filterBy}
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-text-muted">{text.filterLocation}</span>
                <select
                  value={modeFilter}
                  onChange={(event) => setModeFilter(event.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  {LOCATION_MODE_FILTERS.map((mode) => (
                    <option key={mode} value={mode}>
                      {getModeLabel(mode)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-text-muted">{text.sortBy}</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {getSortLabel(option)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="block">
                <span aria-hidden="true" className="mb-1 block text-[11px] font-semibold text-transparent">
                  {text.sortBy}
                </span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  disabled={!hasActiveFilters}
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-bg-surface px-3 text-sm font-semibold text-text-secondary transition hover:border-brand/45 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {text.resetFilter}
                </button>
              </div>
            </div>
          </div>
        </div>

        {!keyword ? (
          <div className="mb-3 rounded-lg border border-brand/20 bg-brand-soft/20 px-3 py-2 text-xs text-text-secondary">
            <p>{text.noKeyword}</p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <SearchResultCardSkeleton key={`search-skeleton-${index}`} />
            ))}
          </div>
        ) : filteredResults.length ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleResults.map((service) => (
                <ServiceListCard key={service.id} service={service} showBadge={false} />
              ))}
            </div>

            {hasMoreResults ? (
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
              {loadError ? (lang === "km" ? "មិនអាចផ្ទុកលទ្ធផលស្វែងរកបាន" : "Unable to load search results") : text.noResultTitle}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              {loadError ? (lang === "km" ? "សូមពិនិត្យ backend search API រួចសាកល្បងម្តងទៀត។" : "Please verify the backend search API and try again.") : text.noResultSubtitle}
            </p>
          </div>
        )}
      </section>

    </main>
  );
}
