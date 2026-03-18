import { useCallback, useEffect, useMemo, useState } from "react";
import TableLayout from "../components/TableLayout";
import { adminServiceColumns } from "../../helper/tableColumn";
import { useLang } from "../../i18n/useLang";
import { fetchAdminServices } from "../../api";
import {
  ADMIN_SERVICE_DEFAULT_SORTING,
  getAdminServiceText,
  mapAdminServiceSortingToApiQuery,
} from "../utils/adminServicePage";

export default function AdminServicesPage() {
  const { lang } = useLang("km");
  const text = useMemo(() => getAdminServiceText(lang), [lang]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [sorting, setSorting] = useState(ADMIN_SERVICE_DEFAULT_SORTING);
  const [totalRows, setTotalRows] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const sortQuery = useMemo(() => mapAdminServiceSortingToApiQuery(sorting), [sorting]);
  const serviceQuery = useMemo(() => ({
    keyword: debouncedSearchValue,
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
  ]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    }, 350);

    return () => window.clearTimeout(timerId);
  }, [searchValue]);

  const loadServices = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await fetchAdminServices(serviceQuery);
      setServices(result.items);
      setTotalRows(result.totalElements);
    } catch (error) {
      console.error("Failed to fetch admin services:", error);
      setServices([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  }, [serviceQuery]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleSortingChange = useCallback((updater) => {
    setSorting((current) => {
      const nextSorting = typeof updater === "function" ? updater(current) : updater;
      return nextSorting.length ? nextSorting : ADMIN_SERVICE_DEFAULT_SORTING;
    });

    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, []);

  const columns = useMemo(() => adminServiceColumns({ text }), [text]);

  return (
    <section className="min-w-0 space-y-4">
      <TableLayout
        columns={columns}
        data={services}
        isLoading={isLoading}
        title={text.services}
        searchPlaceholder={text.searchPlaceholder}
        emptyMessage={text.emptyMessage}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
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
