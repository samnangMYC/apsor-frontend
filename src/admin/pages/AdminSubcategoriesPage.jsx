import { useCallback, useEffect, useMemo, useState } from "react";
import TableLayout from "../components/TableLayout";
import { useLang } from "../../i18n/useLang";
import { fetchAdminCategories, fetchAdminSubcategories } from "../../api";
import {
  ADMIN_SUBCATEGORY_ALL_STATUS,
  ADMIN_SUBCATEGORY_DEFAULT_SORTING,
  getAdminSubcategoryText,
  mapAdminSubcategorySortingToApiQuery,
} from "../utils/adminSubcategoryPage";
import { adminSubcategoryColumns } from "../../helper/tableColumn";

export default function AdminSubcategoriesPage() {
  const { lang, t } = useLang("km");
  const text = useMemo(() => getAdminSubcategoryText(lang, t), [lang, t]);
  const [isLoading, setIsLoading] = useState(true);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState(ADMIN_SUBCATEGORY_ALL_STATUS);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState(ADMIN_SUBCATEGORY_DEFAULT_SORTING);
  const [totalRows, setTotalRows] = useState(0);
  const sortQuery = useMemo(() => mapAdminSubcategorySortingToApiQuery(sorting), [sorting]);
  const subcategoryQuery = useMemo(() => ({
    keyword: debouncedSearchValue,
    status: statusFilter === ADMIN_SUBCATEGORY_ALL_STATUS ? undefined : statusFilter,
    pageNumber: pagination.pageIndex,
    pageSize: pagination.pageSize,
    sortBy: sortQuery.sortBy,
    sortOrder: sortQuery.sortOrder,
  }), [
    debouncedSearchValue,
    pagination.pageIndex,
    pagination.pageSize,
    sortQuery.sortBy,
    sortQuery.sortOrder,
    statusFilter,
  ]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    }, 350);

    return () => window.clearTimeout(timerId);
  }, [searchValue]);

  const loadSubcategories = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await fetchAdminSubcategories(subcategoryQuery);
      setSubcategories(result.items);
      setTotalRows(result.totalItems);
    } catch (error) {
      console.error("Failed to fetch admin subcategories:", error);
      setSubcategories([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  }, [subcategoryQuery]);

  useEffect(() => {
    loadSubcategories();
  }, [loadSubcategories]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const result = await fetchAdminCategories({
          pageNumber: 0,
          pageSize: 200,
          sortBy: "id",
          sortOrder: "desc",
        });

        if (!isMounted) {
          return;
        }

        const nextCategoryMap = result.items.reduce((accumulator, category) => {
          accumulator[category.id] = category.name?.[lang] || category.name?.en || String(category.id);
          return accumulator;
        }, {});

        setCategoryMap(nextCategoryMap);
      } catch (error) {
        console.error("Failed to fetch categories for subcategory labels:", error);

        if (isMounted) {
          setCategoryMap({});
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [lang]);

  const handleSortingChange = useCallback((updater) => {
    setSorting((current) => {
      const nextSorting = typeof updater === "function" ? updater(current) : updater;
      return nextSorting.length ? nextSorting : ADMIN_SUBCATEGORY_DEFAULT_SORTING;
    });
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, []);

  const columns = useMemo(
    () => adminSubcategoryColumns({
      lang,
      text,
      resolveCategoryName: (categoryId) => categoryMap[categoryId] || String(categoryId || "--"),
    }),
    [categoryMap, lang, text],
  );
  const statusFilterControl = (
    <select
      value={statusFilter}
      onChange={(event) => {
        setStatusFilter(event.target.value);
        setPagination((current) => ({ ...current, pageIndex: 0 }));
      }}
      className="h-10 w-full rounded-xl border border-border bg-bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 md:w-[180px]"
      aria-label={text.status}
    >
      <option value={ADMIN_SUBCATEGORY_ALL_STATUS}>{text.filterAllStatuses}</option>
      <option value="ACTIVE">{text.statusActive}</option>
      <option value="INACTIVE">{text.statusInactive}</option>
    </select>
  );

  return (
    <section className="min-w-0 space-y-4">
      <TableLayout
        columns={columns}
        data={subcategories}
        isLoading={isLoading}
        title={text.subcategories}
        searchPlaceholder={text.searchPlaceholder}
        emptyMessage={text.emptyMessage}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        toolbarContent={statusFilterControl}
        controlledPagination={pagination}
        onControlledPaginationChange={setPagination}
        controlledSorting={sorting}
        onControlledSortingChange={handleSortingChange}
        totalRows={totalRows}
        pageCount={Math.max(1, Math.ceil(totalRows / pagination.pageSize))}
        manualPagination
        manualSorting
        manualFiltering
      />
    </section>
  );
}
