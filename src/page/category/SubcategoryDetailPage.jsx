import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumb from "../../components/shared/Breadcrumb";
import CategoryDetailSkeleton from "../../components/categories/CategoryDetailSkeleton";
import ServiceListCard from "../../components/services/ServiceListCard";
import { fetchPublicServices } from "../../api";
import { useLang } from "../../i18n/useLang";
import { useCategoryStore } from "../../store/useCategoryStore";

function pickLang(val, lang) {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val?.[lang] ?? val?.km ?? val?.en ?? "";
}

function matchesSubcategory(service, subcategory) {
  if (!service || !subcategory) return false;

  const targetId = String(subcategory.id || "").trim();
  const targetSlug = String(subcategory.slug || "").trim();

  const serviceIds = [
    service?.subCategoryId,
    service?.subcategoryId,
    service?.subCategory?.id,
    service?.subcategory?.id,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  const serviceSlugs = [
    service?.subCategory?.slug,
    service?.subcategory?.slug,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return (
    (targetId && serviceIds.includes(targetId))
    || (targetSlug && serviceSlugs.includes(targetSlug))
  );
}

const UI_TEXT = {
  en: {
    subcategoryNotFound: "Subcategory not found",
    subcategoryNotFoundSubtitle: "This subcategory may be unavailable or no longer active.",
    relatedServices: "Related Services",
    relatedServicesSubtitle: "Services available in this subcategory.",
    aboutSubcategory: "About this subcategory",
    backHome: "Back to home",
    backCategory: "Back to category",
    noServices: "No services found in this subcategory yet.",
    noServicesHint: "Please check back later or browse other subcategories.",
    browseCategory: "Browse sibling subcategories",
    otherSubcategories: "Other subcategories",
    noOtherSubcategories: "No other subcategories found.",
  },
  km: {
    subcategoryNotFound: "រកមិនឃើញប្រភេទរង",
    subcategoryNotFoundSubtitle: "ប្រភេទរងនេះអាចមិនមាន ឬលែងសកម្ម។",
    relatedServices: "សេវាកម្មពាក់ព័ន្ធ",
    relatedServicesSubtitle: "សេវាកម្មដែលមានក្នុងប្រភេទរងនេះ។",
    aboutSubcategory: "អំពីប្រភេទរងនេះ",
    backHome: "ត្រឡប់ទៅទំព័រដើម",
    backCategory: "ត្រឡប់ទៅប្រភេទមេ",
    noServices: "មិនទាន់មានសេវាកម្មក្នុងប្រភេទរងនេះទេ។",
    noServicesHint: "សូមពិនិត្យម្តងទៀតពេលក្រោយ ឬមើលប្រភេទរងផ្សេងទៀត។",
    browseCategory: "មើលប្រភេទរងផ្សេងទៀត",
    otherSubcategories: "ប្រភេទរងផ្សេងទៀត",
    noOtherSubcategories: "មិនមានប្រភេទរងផ្សេងទៀតទេ។",
  },
};

export default function SubcategoryDetailPage() {
  const { slug } = useParams();
  const { lang } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const categoriesState = useCategoryStore((state) => state.categories);
  const subcategoriesState = useCategoryStore((state) => state.subcategories);
  const categoryStatus = useCategoryStore((state) => state.categoryStatus);
  const subcategoryStatus = useCategoryStore((state) => state.subcategoryStatus);
  const fetchCategoryList = useCategoryStore((state) => state.fetchCategories);
  const fetchSubcategoryList = useCategoryStore((state) => state.fetchSubcategories);
  const [services, setServices] = useState([]);
  const [isServiceLoading, setIsServiceLoading] = useState(true);
  const categories = useMemo(() => categoriesState ?? [], [categoriesState]);
  const subcategories = useMemo(() => subcategoriesState ?? [], [subcategoriesState]);

  const subcategory = useMemo(
    () => subcategories.find((item) => item.slug === slug),
    [slug, subcategories],
  );
  const category = useMemo(
    () => categories.find((item) => String(item?.id) === String(subcategory?.categoryId)),
    [categories, subcategory?.categoryId],
  );
  const siblingSubcategories = useMemo(
    () =>
      subcategory
        ? subcategories.filter(
            (item) =>
              String(item?.categoryId) === String(subcategory.categoryId)
              && String(item?.id) !== String(subcategory.id),
          )
        : [],
    [subcategories, subcategory],
  );

  const relatedServices = useMemo(
    () => services.filter((service) => matchesSubcategory(service, subcategory)),
    [services, subcategory],
  );

  const isCatalogLoading =
    categoryStatus === "idle"
    || categoryStatus === "loading"
    || subcategoryStatus === "idle"
    || subcategoryStatus === "loading";
  const isLoading = isCatalogLoading || isServiceLoading;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [slug]);

  useEffect(() => {
    fetchCategoryList();
    fetchSubcategoryList();
  }, [fetchCategoryList, fetchSubcategoryList]);

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      setIsServiceLoading(true);

      try {
        const result = await fetchPublicServices({
          keyword: "",
          pageNumber: 0,
          pageSize: 100,
          sortBy: "id",
          sortOrder: "desc",
        });

        if (!isMounted) return;
        setServices(Array.isArray(result?.items) ? result.items : []);
      } catch (error) {
        console.error("Failed to load subcategory services:", error);
        if (isMounted) {
          setServices([]);
        }
      } finally {
        if (isMounted) {
          setIsServiceLoading(false);
        }
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return <CategoryDetailSkeleton />;
  }

  return (
    <main className="flex-1 px-6 py-4 sm:px-10 md:px-10 xl:px-22 2xl:px-64">
      <Breadcrumb
        className="service-detail-enter mb-4"
        currentLabel={subcategory ? pickLang(subcategory.name, lang) : undefined}
      />

      {!subcategory ? (
        <section className="service-detail-enter rounded-xl border border-border bg-bg-surface p-6 text-center shadow-1">
          <h1 className="text-xl font-bold text-text-primary">{text.subcategoryNotFound}</h1>
          <p className="mt-2 text-sm text-text-muted">{text.subcategoryNotFoundSubtitle}</p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center justify-center rounded-pill bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover"
          >
            {text.backHome}
          </Link>
        </section>
      ) : (
        <>
          <section className="service-detail-enter relative overflow-hidden rounded-xl border border-border bg-bg-surface shadow-1">
            <div className="relative h-48 sm:h-56 md:h-64">
              {category?.image ? (
                <img
                  src={category.image}
                  alt={pickLang(subcategory.name, lang)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-brand-soft via-bg-subtle to-bg-surface" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-soft">
                  {category ? pickLang(category.name, lang) : text.relatedServices}
                </p>
                <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
                  {pickLang(subcategory.name, lang)}
                </h1>
                <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-white/90 sm:line-clamp-3">
                  {pickLang(subcategory.description, lang) || text.relatedServicesSubtitle}
                </p>
              </div>
            </div>
          </section>

          <section className="service-detail-enter mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                    {text.relatedServices}
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-text-primary sm:text-xl">
                    {pickLang(subcategory.name, lang)}
                  </h2>
                  <p className="mt-1 text-sm text-text-muted">
                    {text.relatedServicesSubtitle}
                  </p>
                </div>
                {category ? (
                  <Link
                    to={`/categories/${category.slug}`}
                    className="hidden rounded-pill border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle sm:inline-flex"
                  >
                    {text.backCategory}
                  </Link>
                ) : null}
              </div>

              {relatedServices.length ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {relatedServices.map((service) => (
                    <ServiceListCard key={service.id || service.slug} service={service} showBadge={false} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border-strong bg-bg-subtle p-6 text-center">
                  <p className="text-sm font-semibold text-text-primary">{text.noServices}</p>
                  <p className="mt-2 text-sm text-text-muted">{text.noServicesHint}</p>
                </div>
              )}

              {category ? (
                <div className="mt-4 sm:hidden">
                  <Link
                    to={`/categories/${category.slug}`}
                    className="inline-flex w-full items-center justify-center rounded-pill border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle"
                  >
                    {text.backCategory}
                  </Link>
                </div>
              ) : null}
            </div>

            <aside className="rounded-xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                {text.aboutSubcategory}
              </p>
              <h2 className="mt-1 text-lg font-bold text-text-primary">
                {pickLang(subcategory.name, lang)}
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {pickLang(subcategory.description, lang) || text.relatedServicesSubtitle}
              </p>

              <div className="mt-5 border-t border-border pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                  {text.otherSubcategories}
                </p>
                {siblingSubcategories.length ? (
                  <div className="mt-3 space-y-2">
                    {siblingSubcategories.map((item) => (
                      <Link
                        key={item.id}
                        to={`/subcategories/${item.slug}`}
                        className="block rounded-lg border border-border px-3 py-3 text-sm font-medium text-text-secondary transition hover:border-brand/35 hover:bg-bg-subtle hover:text-text-primary"
                      >
                        {pickLang(item.name, lang)}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-text-muted">{text.noOtherSubcategories}</p>
                )}
              </div>

              <div className="mt-5">
                <Link
                  to={category ? `/categories/${category.slug}` : "/"}
                  className="inline-flex w-full items-center justify-center rounded-pill bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
                >
                  {category ? text.browseCategory : text.backHome}
                </Link>
              </div>
            </aside>
          </section>
        </>
      )}
    </main>
  );
}
