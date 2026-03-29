import { useEffect } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../components/shared/Breadcrumb";
import CategoryCard from "../../components/categories/CategoryCard";
import CategorySectionSkeleton from "../../components/categories/CategorySectionSkeleton";
import { useLang } from "../../i18n/useLang";
import { useCategoryStore } from "../../store/useCategoryStore";

const UI_TEXT = {
  en: {
    title: "All Categories",
    subtitle: "Browse every service category and jump into the area you need.",
    backHome: "Back to home",
    empty: "No categories found.",
  },
  km: {
    title: "ប្រភេទសេវាកម្មទាំងអស់",
    subtitle: "ស្វែងរកគ្រប់ប្រភេទសេវាកម្ម ហើយជ្រើសផ្នែកដែលអ្នកត្រូវការ។",
    backHome: "ត្រឡប់ទៅទំព័រដើម",
    empty: "មិនមានប្រភេទសេវាកម្មទេ។",
  },
};

export default function CategoriesPage() {
  const { lang, t } = useLang("km");
  const text = UI_TEXT[lang] || UI_TEXT.en;
  const categories = useCategoryStore((state) => state.categories) ?? [];
  const categoryStatus = useCategoryStore((state) => state.categoryStatus);
  const fetchCategoryList = useCategoryStore((state) => state.fetchCategories);
  const isLoading = categoryStatus === "idle" || categoryStatus === "loading";

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);

  return (
    <main className="flex-1 px-6 py-4 sm:px-10 md:px-10 xl:px-22 2xl:px-64">
      <Breadcrumb className="mb-4" currentLabel={text.title} />

      <section className="rounded-xl border border-border bg-bg-surface p-5 shadow-1 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
          {t.categories || "Categories"}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-text-primary sm:text-3xl">
          {text.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-muted">
          {text.subtitle}
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              {t.viewAll || "View all"}
            </p>
            <h2 className="mt-1 text-lg font-bold text-text-primary sm:text-xl">
              {text.title}
            </h2>
          </div>
          <Link
            to="/"
            className="hidden rounded-pill border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle sm:inline-flex"
          >
            {text.backHome}
          </Link>
        </div>

        {isLoading ? (
          <CategorySectionSkeleton />
        ) : categories.length ? (
          <div className="flex flex-wrap gap-4">
            {categories.map((category) => (
              <div key={category.id} className="w-42.5 max-w-full sm:w-46.25 lg:w-50">
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border-strong bg-bg-subtle p-6 text-center text-sm text-text-muted">
            {text.empty}
          </div>
        )}

        <div className="mt-4 sm:hidden">
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center rounded-pill border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-bg-subtle"
          >
            {text.backHome}
          </Link>
        </div>
      </section>
    </main>
  );
}
