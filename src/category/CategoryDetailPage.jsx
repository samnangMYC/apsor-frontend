import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import Breadcrumb from "../components/shared/Breadcrumb";
import CategoryDetailSkeleton from "../components/categories/CategoryDetailSkeleton";
import { useLang } from "../i18n/useLang";
import { DEFAULT_CATEGORIES } from "../data/defaultCategories";
import { DEFAULT_SUBCATEGORIES } from "../data/defaultSubcategories";

function pickLang(val, lang) {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val?.[lang] ?? val?.km ?? val?.en ?? "";
}

export default function CategoryDetailPage() {
  const { slug } = useParams();
  const routeSlug = slug || "";
  const [loadedSlug, setLoadedSlug] = useState("");
  const isLoading = loadedSlug !== routeSlug;
  const { lang, t } = useLang("km");
  const category = DEFAULT_CATEGORIES.find((item) => item.slug === slug);
  const subcategories = category
    ? DEFAULT_SUBCATEGORIES.filter((item) => item.categoryId === category.id)
    : [];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoadedSlug(routeSlug);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [routeSlug]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [slug]);

  return (
    <div className="min-h-screen bg-bg-app">
      <Header user={true} />
      
      {isLoading ? (
        <CategoryDetailSkeleton />
      ) : (
        <main className="px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
          <Breadcrumb
            className="service-detail-enter mb-4"
            currentLabel={category ? pickLang(category.name, lang) : undefined}
          />

          {!category ? (
            <section className="service-detail-enter rounded-xl border border-border bg-bg-surface p-6 text-center shadow-1">
              <h1 className="text-xl font-bold text-text-primary">
                {t.categoryNotFound || "Category not found"}
              </h1>
              <p className="mt-2 text-sm text-text-muted">
                {t.categoryNotFoundSubtitle || "The category you are looking for does not exist."}
              </p>
              <Link
                to="/"
                className="mt-4 inline-flex items-center justify-center rounded-pill bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover"
              >
                {t.backHome || "Back to home"}
              </Link>
            </section>
          ) : (
            <>
              <section className="service-detail-enter relative overflow-hidden rounded-xl border border-border bg-bg-surface shadow-1">
                <div className="relative h-48 sm:h-56 md:h-64">
                  <img
                    src={category.image}
                    alt={pickLang(category.name, lang)}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-soft">
                      {t.categories || "Categories"}
                    </p>
                    <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
                      {pickLang(category.name, lang)}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-white/90">
                      {t.categoryDetailSubtitle || "Explore available subcategories and find the exact service you need."}
                    </p>
                  </div>
                </div>
              </section>

              <section className="service-detail-enter mt-6 rounded-xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                      {t.subcategories || "Subcategories"}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-text-primary sm:text-xl">
                      {pickLang(category.name, lang)}
                    </h2>
                  </div>
                  <Link
                    to="/"
                    className="hidden rounded-pill border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle sm:inline-flex"
                  >
                    {t.backHome || "Back to home"}
                  </Link>
                </div>

                {subcategories.length ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/services?category=${category.slug}&subcategory=${sub.slug}`}
                        className="group rounded-lg border border-border bg-bg-surface p-4 shadow-1 transition hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-2"
                      >
                        <h3 className="text-base font-semibold text-text-primary">
                          {pickLang(sub.name, lang)}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                          {pickLang(sub.description, lang)}
                        </p>
                        <div className="mt-3 inline-flex items-center rounded-pill bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand transition group-hover:bg-brand group-hover:text-white">
                          {t.viewServices || "View services"}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border-strong bg-bg-subtle p-6 text-center text-sm text-text-muted">
                    {t.noSubcategories || "No subcategories found."}
                  </div>
                )}

                <div className="mt-4 sm:hidden">
                  <Link
                    to="/"
                    className="inline-flex w-full items-center justify-center rounded-pill border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle"
                  >
                    {t.backHome || "Back to home"}
                  </Link>
                </div>
              </section>
            </>
          )}
        </main>
      )}

      <Footer />
    </div>
  );
}
